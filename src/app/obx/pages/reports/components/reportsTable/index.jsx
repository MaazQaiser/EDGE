import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import ReportAIModifiedBadge from 'commonComponents/reportAIModifiedBadge';
// import { ReactComponent as EditBtnIcon } from 'assets/svg/EditBtnIcon.svg';
import SideDrawer from 'commonComponents/sideDrawer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoaderComponent from 'src/app/components/common/loader';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { ACL_OBX_SHIFT_REPORTS_VIEW } from 'src/app/router/constant/OBXMODULE';
import { OBX_EDIT_REPORT } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as HyperlinkIcon } from 'src/assets/svg/HyperlinkIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import {
  downloadPdfFromUrl,
  getPDFViewOfShiftReport,
  updateReportStatus,
} from 'src/services/reports.services';
import { dayjsFormatsEnum, enumTemplateTypes, toastSettings } from 'src/utils/constants';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { getReportAiBadgeVariant } from '../../helpers/reportAiBadgeVisibility';
import ApproveModal from '../approveModal';
import RejectModal from '../rejectModal';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const useStyles = makeStyles((theme) => ({
  titleCellWithBadge: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minWidth: 0,
  },
  titleCellTitleRow: {
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden',
  },
  reportsTableStickyColumn: {
    position: 'sticky',
    left: 0,
    zIndex: 99,
  },

  reportsTableActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },

  reportsTableActionApprove: {
    '&.MuiButton-onlyText': {
      minHeight: '0',
      padding: '0',
    },
  },

  reportsTableSites: {
    minWidth: '380px',
    maxWidth: '380px',
  },

  reportsTableOfficer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  reportsTableOfficerAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },
  franchiseName: {
    display: 'flex ',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  franchiseNameText: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  reportsTableActionReject: {
    '&.MuiButton-onlyText': {
      minHeight: '0',
      padding: '0',
      color: theme.palette.surfaceAlertStrong,

      '&:hover': {
        color: theme.palette.surfaceAlertHover,
      },

      '&:active': {
        color: theme.palette.surfaceAlertStrong,
      },

      '&:disabled': {
        color: theme.palette.surfaceAlertDisabled,
      },
    },
  },

  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    flexWrap: 'wrap',
    gap: '12px',
  },
  reportsDrawerActionsButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },

  reportsTableTitle: {
    paddingRight: '10px !important',
    // minWidth: '380px',
    maxWidth: '380px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& $titleCellWithBadge $franchiseName $franchiseNameIcon svg': {
        visibility: 'visible !important',
      },
    },
  },
}));

export const i18ColumnName = (t, _classSticky, _classSites, classTitle) => {
  return [
    {
      id: 'title',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.name',
      )}`,
      className: classTitle,
      sortable: true,
    },
    {
      id: 'siteName',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.site',
      )}`,
      className: classTitle,
      sortable: true,
    },
    {
      id: 'templateableType',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.templateableType',
      )}`,
      className: classTitle,
    },
    {
      id: 'shiftName',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.shiftName',
      )}`,
      className: classTitle,
    },
    {
      id: 'shiftTiming',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.shiftTiming',
      )}`,
      className: classTitle,
    },
    {
      id: 'officer',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.submittedBy',
      )}`,
      hasImage: true,
    },
    {
      id: 'submittedDate',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.submittedDate',
      )}`,
    },
    {
      id: 'reason',
      label: `${t(
        'obx.schedules.assignDedicatedDuty.toursAndReports.reports.listing.columns.reason',
      )}`,
      hasImage: true,
    },
    {
      id: 'print',
      label: ``,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  name: 'title',
  actions: 'actions',
  officer: 'officer',
  site: 'site',
  dueTime: 'dueTime',
  submittedDate: 'submittedDate',
  submittedTime: 'submittedTime',
  reason: 'reason',
  siteName: 'siteName',
  shiftName: 'shiftName',
  shiftTiming: 'shiftTiming',
  print: 'print',
  templateableType: 'templateableType',
};

export const statusValidationEnum = {
  submitted: 'submitted',
  approves: 'approved',
  rejected: 'rejected',
};

const ReportTable = ({
  selectedStatus = '',
  data = [],
  fetchReport,
  setData = () => {},
  setQueryParams,
  orderState,
  setOrderState,
  showAIBadges = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

  const NA = t('commonText.nA');
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  // const [selectedId, setSelectedId] = useState();
  const [currentSelected, setCurrentSelected] = useState();
  const [disabled, setDisabled] = useState(false);
  const [downloading, setDownloading] = useState(true);
  const classSticky = classes.reportsTableStickyColumn;
  const classSites = classes.reportsTableSites;
  const classTitle = classes.reportsTableTitle;
  const columnsWithOutFilter = i18ColumnName(t, classSticky, classSites, classTitle);
  const [selectedLoadingReport, setSelectedLoadingReport] = useState(null);
  const { formatDayjsDateTime } = useDateTime();

  let columns = useMemo(() => {
    return selectedStatus !== statusValidationEnum.rejected
      ? columnsWithOutFilter.filter((col) => col.id !== 'reason')
      : columnsWithOutFilter;
  }, [selectedStatus]);

  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [error, setError] = useState(false);
  const closeRejectModal = () => {
    setRejectModal(false);
    // setSelectedId('');
    // setCurrentSelected({});
  };
  const _openRejectModal = (data) => {
    setRejectModal(true);
    // setSelectedId(data.id);
    setCurrentSelected(data);
  };

  const confirmButton = async (comments = '', isRejected = false) => {
    try {
      setDisabled(true);
      setLoading(true);
      const body = isRejected
        ? {
            status: 'rejected',
            supervisorComments: comments,
          }
        : {
            status: 'accepted',
            supervisorComments: '',
          };
      const response = await updateReportStatus({
        reportId: currentSelected?._id,
        report: body,
      });
      if (response?.statusCode == 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        fetchReport();
      }
      setDisabled(false);
      setLoading(false);
      closeApproveModal();
      closeRejectModal();
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabled(false);
      setLoading(false);
    }
  };

  const getShiftReportPDF = async (payload) => {
    try {
      // setLoading(true);
      const response = await getPDFViewOfShiftReport(
        payload?.reportId,
        payload?.templateableType,
        payload?.shiftId || null,
        payload?.siteId || null,
        null,
        payload?.submittedAt || null,
      );

      if (response?.statusCode === 200) {
        return response?.data?.url;
      }
      // setLoading(false);
    } catch (error) {
      // setLoading(false);

      setPdfViewDrawer(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const closeApproveModal = () => {
    setApproveModal(false);
  };
  const _openApproveModal = (data) => {
    setApproveModal(true);
    setCurrentSelected(data);
  };

  const getDisplayData = (column, row) => {
    if (column.id === columnIdsEnum.siteName || column.id === columnIdsEnum.name) {
      const text = row[column.id];
      return {
        text,
        display: capitalizeFirstLetter(text?.slice(0, 32)),
        showTooltip: text?.length > 32,
      };
    }

    if (column.id === columnIdsEnum.shiftName) {
      const text = row?.shiftDetails?.name;
      return {
        text,
        display: capitalizeFirstLetter(text?.slice(0, 32)),
        showTooltip: text?.length > 32,
      };
    }

    if (column.id === columnIdsEnum.shiftTiming) {
      const { startsAt, endsAt } = row?.shiftDetails || {};
      const text =
        startsAt && endsAt
          ? `${formatDayjsDateTime({ value: startsAt, formatType: dayjsFormatsEnum.time })} 
          - ${formatDayjsDateTime({ value: endsAt, formatType: dayjsFormatsEnum.time })}`
          : NA;
      return {
        text,
        display: capitalizeFirstLetter(text?.slice(0, 32)),
        showTooltip: text?.length > 32,
      };
    }

    return null;
  };

  const renderTableCell = (row, column) => {
    // if (column.id === columnIdsEnum.actions) {
    //   if (row?.templateableType == 'siteHitReport') {
    //     return (
    //       <>
    //         <Box
    //           onClick={() => {
    //             if (row?.tourId && row?.reportId) {
    //               const url = OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(
    //                 ':tourReportId',
    //                 row?.reportId,
    //               );
    //               window.open(url, '_blank').focus();
    //             } else {
    //               const url = OBX_TOURE_REPORT.replace(':reportId', row?.reportId).replace(
    //                 '/:tourReportId',
    //                 '',
    //               );
    //               window.open(url, '_blank').focus();
    //             }
    //           }}
    //           className={classes.reportsTableActions}
    //         >
    //           <EditBtnIcon className={classes.addIcon} />
    //         </Box>
    //       </>
    //     );
    //   } else {
    //     return '';
    //   }
    // }
    if (column.id === columnIdsEnum.officer)
      return (
        <Box className={classes.reportsTableOfficer}>
          <Avatar className={classes.reportsTableOfficerAvatar} src={row[column.id]?.imageUrl} />
          {capitalize(row[column.id]?.name) || NA}
        </Box>
      );

    if (column.id === columnIdsEnum.templateableType) {
      return (
        <>
          {`${t(`obx.templatableTypes.${row[column.id]}`, {
            tour: getLabel('terms', 'tour', t),
            dispatch: getLabel('terms', 'dispatch', t),
            hit: getLabel('terms', 'hit', t),
          })}` || NA}
        </>
      );
    }

    if (column.id === columnIdsEnum.name && showAIBadges) {
      const data = getDisplayData(column, row);
      if (data) {
        const titleRow = (
          <Box
            className={`${classes.franchiseName} ${classes.titleCellTitleRow}`}
            onClick={() => gotoDetailPage(column, row)}
          >
            <Box className={classes.franchiseNameText}>
              {(data.display || '') + (data.showTooltip ? '...' : '') || NA}
            </Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        );
        const aiBadgeVariant = getReportAiBadgeVariant(row);
        const inner = (
          <Box className={classes.titleCellWithBadge}>
            {titleRow}
            {aiBadgeVariant != null && (
              <ReportAIModifiedBadge isAIModified={aiBadgeVariant === 'refined'} />
            )}
          </Box>
        );
        return data.showTooltip ? (
          <Tooltip title={data.text} arrow>
            {inner}
          </Tooltip>
        ) : (
          inner
        );
      }
    }

    if (
      column.id === columnIdsEnum.siteName ||
      (column.id === columnIdsEnum.name && !showAIBadges) ||
      column.id === columnIdsEnum.shiftName ||
      column.id === columnIdsEnum.shiftTiming
    ) {
      const data = getDisplayData(column, row);

      if (data) {
        const content = (
          <Box className={classes.franchiseName} onClick={() => gotoDetailPage(column, row)}>
            <Box className={classes.franchiseNameText}>
              {(data.display || '') + (data.showTooltip ? '...' : '') || NA}
            </Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        );

        return data.showTooltip ? (
          <Tooltip title={data.text} arrow>
            {content}
          </Tooltip>
        ) : (
          content
        );
      }
    }

    if (column.id === columnIdsEnum.site) {
      if (row[column.id]?.name?.length > 32) {
        return (
          <Tooltip title={row[column.id]} arrow>
            {capitalizeFirstLetter(row[column.id]?.name.substring(0, 32)) + '...' || NA}
          </Tooltip>
        );
      }
      return <>{capitalizeFirstLetter(row[column.id]?.name) || NA}</>;
    }

    if (column.id === columnIdsEnum.dueTime) {
      if (!row[column.id]) return <>{NA}</>;
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })}</>
      );
    }
    if (column.id === columnIdsEnum.submittedDate && row?.submittedAt) {
      return (
        <>{`${formatDayjsDateTime({
          value: row?.submittedAt,
          formatType: dayjsFormatsEnum.dateTime,
        })}`}</>
      );
    }

    if (column.id === columnIdsEnum.reason && row.status === statusValidationEnum.rejected) {
      const content = row[column.id] || NA;
      const displayContent = content.length > 25 ? `${content.substring(0, 25)}...` : content;

      return (
        <>
          <Tooltip title={content} arrow>
            {displayContent}
          </Tooltip>
        </>
      );
    }

    if (column?.id === columnIdsEnum?.print) {
      return (
        <Box
          onClick={async () => {
            if (row?.pdfUrl) {
              // Open the URL in a new tab immediately
              window.open(row?.pdfUrl, '_blank', 'noopener,noreferrer');
            } else {
              setSelectedLoadingReport(row?._id);
              // Optionally show some loading state here
              const url = await generateReportAndUpdateRow(row, false, true);

              if (url) {
                // Open the generated URL in a new tab
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }
            setSelectedLoadingReport(null);
          }}
        >
          {selectedLoadingReport === row?._id ? <CircularProgress size={14} /> : <HyperlinkIcon />}
        </Box>
      );
    }

    return <>{row[column.id] || NA}</>;
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderBy === columnId && orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, isAsc ? 'desc' : 'asc');
  };

  /**
   * Determine the sort direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {Boolean|String} - The sort direction or false if not sorted.
   */
  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  /**
   * Determine the order direction for a column.
   *
   * @param {Object} column - The column configuration object.
   * @return {String} - The order direction ('asc' or 'desc').
   */
  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton numberOfRows={10} columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.siteName ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
                  style={{ cursor: showHandCursor }}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </>
    );
  };

  const generateReportAndUpdateRow = async (row, autoLoadPdf = false, openOnNewTab = false) => {
    const pdfUrl = await getShiftReportPDF({
      reportId: row?._id,
      templateableType: row?.templateableType,
      shiftId: row?.shiftId,
      siteId: row?.siteId,
      submittedAt: row?.submittedAt,
    });
    if (autoLoadPdf) setPdfUrl(pdfUrl);
    setData((prev) => prev?.map((item) => (item?._id === row?._id ? { ...item, pdfUrl } : item)));
    if (openOnNewTab) return pdfUrl;
  };

  const gotoDetailPage = (column, row) => {
    if (column.id !== columnIdsEnum.submittedTime || column.id !== columnIdsEnum.officer) {
      // Generate Report PDF and update row
      if (!row?.pdfUrl) generateReportAndUpdateRow(row, true);
      else setPdfUrl(row?.pdfUrl);
      setCurrentSelected(row);
      setPdfViewDrawer(true);
      setError(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(false);
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });
      const url = URL.createObjectURL(response);

      downloadLocalPDf(url);
      setDownloading(true);
    } catch (error) {
      setDownloading(true);
      console.error('Error downloading PDF:', error);
    }
  };
  const downloadLocalPDf = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentSelected?.templateableType}_${dayjs().unix()}.pdf`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditReport = () => {
    history.push(OBX_EDIT_REPORT.replace(':reportId', currentSelected?._id));
  };

  const drawerAiBadgeVariant = getReportAiBadgeVariant(currentSelected);

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <TableComponent
        data={data}
        columns={columns}
        tableHead={tableHead}
        tableBody={tableBody}
        pagination={false}
      />

      <RejectModal
        open={rejectModal}
        handleClose={closeRejectModal}
        handleReject={confirmButton}
        disabled={disabled}
      />
      <ApproveModal
        open={approveModal}
        handleClose={closeApproveModal}
        handleApprove={confirmButton}
        disabled={disabled}
      />

      {pdfViewDrawer && (
        <SideDrawer
          isOpen={pdfViewDrawer}
          key={`${loading}-${pdfUrl}-${error}`}
          totalWidth={'992px'}
        >
          <Suspense fallback={null}>
            <PDFViewDrawer
              url={pdfUrl}
              setError={setError}
              setUrl={setPdfUrl}
              closeDrawer={setPdfViewDrawer}
            />
          </Suspense>

          <>
            <Box className={classes.reportsDrawerActions}>
              {drawerAiBadgeVariant != null && (
                <ReportAIModifiedBadge isAIModified={drawerAiBadgeVariant === 'refined'} />
              )}
              <Box className={classes.reportsDrawerActionsButtons}>
                <RenderIfHasPermission name={ACL_OBX_SHIFT_REPORTS_VIEW}>
                  <Button
                    onClick={() => {
                      downloadPdf();
                    }}
                    variant="secondaryBlue"
                    disableRipple
                    disabled={!(!loading && !error && pdfUrl?.length && downloading)}
                  >
                    {t('buttons.downloadReport')}
                  </Button>
                </RenderIfHasPermission>

                {![
                  enumTemplateTypes.shiftDayEndReport,
                  enumTemplateTypes.vehicleInspection,
                  enumTemplateTypes.shiftSummaryReport,
                  enumTemplateTypes.equipmentInspection,
                ]?.includes(currentSelected?.templateableType) ? (
                  <Button
                    onClick={() => {
                      handleEditReport();
                    }}
                    variant="secondaryBlue"
                    disableRipple
                    disabled={!(!loading && !error && pdfUrl?.length && downloading)}
                  >
                    {t('buttons.editReport')}
                  </Button>
                ) : null}
              </Box>

              {/*{currentSelected?.templateableType !== 'checkpointSummaryReport' &&*/}
              {/*  currentSelected?.templateableType !== 'shiftSummaryReport' &&*/}
              {/*  currentSelected?.templateableType !== 'tourReports' &&*/}
              {/*  !loading &&*/}
              {/*  !error &&*/}
              {/*  pdfUrl?.length > 0 && (*/}
              {/*    <Button*/}
              {/*      onClick={() => {*/}
              {/*        if (currentSelected?.tourId && currentSelected?.reportId) {*/}
              {/*          history.push(*/}
              {/*            OBX_TOURE_REPORT.replace(':reportId', 'tour-report').replace(*/}
              {/*              ':tourReportId',*/}
              {/*              currentSelected?.reportId,*/}
              {/*            ),*/}
              {/*          );*/}
              {/*        } else {*/}
              {/*          history.push(*/}
              {/*            OBX_TOURE_REPORT.replace(':reportId', currentSelected?.reportId).replace(*/}
              {/*              '/:tourReportId',*/}
              {/*              '',*/}
              {/*            ),*/}
              {/*          );*/}
              {/*        }*/}
              {/*      }}*/}
              {/*      variant="secondaryBlue"*/}
              {/*      disableRipple*/}
              {/*    >*/}
              {/*      {t('buttons.editReport')}*/}
              {/*    </Button>*/}
              {/*  )}*/}
            </Box>
          </>
        </SideDrawer>
      )}
    </>
  );
};

ReportTable.propTypes = {
  selectedStatus: PropTypes.string,
  data: PropTypes.array,
  fetchReport: PropTypes.any,
  setData: PropTypes.func,
  setQueryParams: PropTypes.func,
  orderState: PropTypes.object,
  setOrderState: PropTypes.func,
  showAIBadges: PropTypes.bool,
};

export default ReportTable;
