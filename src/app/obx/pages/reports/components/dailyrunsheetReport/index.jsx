import {
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
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import ReportAIModifiedBadge from 'commonComponents/reportAIModifiedBadge';
import SideDrawer from 'commonComponents/sideDrawer';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchComponent from 'src/app/components/common/search';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import { ReactComponent as HyperlinkIcon } from 'src/assets/svg/HyperlinkIcon.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { useDeepEffect } from 'src/helper/utilityHooks';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import {
  downloadPdfFromUrl,
  getAllRunsheets,
  getPDFViewOfShiftReport,
  getRunsheetReports,
} from 'src/services/reports.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, rolesEnumWithName, toastSettings } from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { getReportAiBadgeVariant } from '../../helpers/reportAiBadgeVisibility';
import { useStyles } from '../../listing/reportsListing.styles';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const useRunsheetNameStyles = makeStyles((theme) => ({
  drawerFooterBar: {
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
  drawerActionsButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },
  runsheetNameWithBadge: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    minWidth: 0,
  },
  runsheetNameClickRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: '1 1 0%',
    minWidth: 0,
    overflow: 'hidden',
  },
  runsheetNameText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  runsheetNameChevron: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },
  runsheetNameTableCell: {
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
    },
    '&:hover $runsheetNameWithBadge $runsheetNameClickRow $runsheetNameChevron svg': {
      visibility: 'visible !important',
    },
  },
}));

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'name',
      label: `${t('obx.incidentReports.table.listing.columns.runsheetName', { runsheet: getLabel('terms', 'runsheet', t) })}`,
      sortable: true,
      className: hoverIconClass,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'timeRange',
      label: `${t('obx.incidentReports.table.listing.columns.timeRange')}`,
      sortable: false,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'punchInAndOut',
      label: `${t('obx.incidentReports.table.listing.columns.punchIn')}`,
      sortable: false,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'timeSpent',
      label: `${t('obx.incidentReports.table.listing.columns.timeSpent')}`,
      sortable: false,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'submittedAt',
      label: `${t('obx.incidentReports.table.listing.columns.submittedAt')}`,
      sortable: false,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'submittedBy',
      label: `${t('obx.incidentReports.table.listing.columns.submittedBy')}`,
      sortable: false,
      hasImage: true,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
    {
      id: 'print',
      label: ``,
      sortable: false,
      hasPermission: [rolesEnumWithName.franchise_owner.slug, rolesEnumWithName.supervisor.slug],
    },
  ];
};

const columnIdsEnum = {
  name: 'name',
  site: 'site',
  timeRange: 'timeRange',
  punchIn: 'punchIn',
  timeSpent: 'timeSpent',
  submittedAt: 'submittedAt',
  submittedBy: 'submittedBy',
  print: 'print',
  punchInAndOut: 'punchInAndOut',
};

const order = {};

const DailyRunsheetReport = ({ params = {}, officers }) => {
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();

  const classes = useStyles();
  const nameLayoutClasses = useRunsheetNameStyles();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [allRunsheets, setAllRunsheets] = useState([]);

  const [orderState, setOrderState] = useState(order);
  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState(false);
  const columns = i18ColumnName(t, classes.reportsTableTitle, getLabel);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDownloading, setDownloading] = useState(false);
  const NA = t('commonText.nA');
  const [selectedLoadingReport, setSelectedLoadingReport] = useState(null);

  const [queryParams, setQueryParams] = useState(params);

  const fetchAllRunsheets = async () => {
    try {
      const response = await getAllRunsheets();

      if (response?.statusCode === 200) {
        let transformedRunsheets =
          transformArrayForOptions(response?.data?.runsheets, 'name', 'id') || [];
        setAllRunsheets([{ value: 'all', label: 'All Runsheets' }, ...transformedRunsheets]);
      }
    } catch (error) {
      //error handling
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchRunsheetReports = async () => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const updatedParams = {
        sortBy: queryParams?.sortBy,
        sortOrder: queryParams?.orderBy,
        page: queryParams?.page,
        perPage: queryParams?.perPage,
        runsheetId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.runsheets, 'value'),
          'all',
        ),
        officerIds: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.officer, 'value'),
          'all',
        ),
        windowStart: queryParams?.selectedDates?.[0]
          ? dayjs(queryParams.selectedDates[0]).format('YYYY-MM-DD')
          : '',
        windowEnd: queryParams?.selectedDates?.[1]
          ? dayjs(queryParams.selectedDates[1]).format('YYYY-MM-DD')
          : '',
        search: queryParams?.search,
      };

      const response = await getRunsheetReports(updatedParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.runsheets);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
  };

  const sortDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : false;
  };

  const orderDirection = (column) => {
    return orderState.orderBy === column.id ? orderState.orderType : 'asc';
  };

  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState?.orderType);
  };

  const gotoDetailPage = (column, row) => {
    if (column.id === columnIdsEnum.name) {
      if (!row?.runsheetSummaryReportUrl) generateReportAndUpdateRow(row, true);
      else setPdfUrl(row?.runsheetSummaryReportUrl);
      setSelectedReport(row);
      setPdfViewDrawer(true);
    }
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns?.map((column) => (
            <TableCell key={column?.id} sortDirection={sortDirection(column)}>
              {column?.sortable ? (
                <TableSortLabel
                  active={orderState.orderBy === column?.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column?.id)}
                >
                  {column?.label}
                </TableSortLabel>
              ) : (
                `${column?.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              const cellClassName =
                column.id === columnIdsEnum.name
                  ? `${column.className || ''} ${nameLayoutClasses.runsheetNameTableCell}`.trim()
                  : column.className;
              return (
                <TableCell
                  key={column?.id}
                  style={{ cursor: showHandCursor }}
                  className={cellClassName}
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

  const renderTableCell = (row, column) => {
    if (column?.id === columnIdsEnum?.name) {
      const text = row[column.id];
      const data = {
        text,
        display: capitalizeFirstLetter(text?.slice(0, 32)),
        showTooltip: text?.length > 32,
      };

      const nameRow = (
        <Box
          className={nameLayoutClasses.runsheetNameClickRow}
          onClick={() => gotoDetailPage(column, row)}
        >
          <Box className={nameLayoutClasses.runsheetNameText}>
            {(data.display || '') + (data.showTooltip ? '...' : '') || NA}
          </Box>
          <Box className={nameLayoutClasses.runsheetNameChevron}>
            <ChevronRight />
          </Box>
        </Box>
      );

      const aiBadgeVariant = getReportAiBadgeVariant(row);
      const content = (
        <Box className={nameLayoutClasses.runsheetNameWithBadge}>
          {nameRow}
          {aiBadgeVariant != null && (
            <ReportAIModifiedBadge isAIModified={aiBadgeVariant === 'refined'} />
          )}
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

    if (column?.id === columnIdsEnum?.site) {
      return <>{row?.site?.name}</>;
    }
    if (column.id === columnIdsEnum.submittedAt) {
      if (!row[column.id]) return <>{NA}</>;
      return (
        <>{formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.dateTime })}</>
      );
      // return (
      //   <>{formatDate(dayjsWithStandardOffset(row[column.id]), `${currentDateFormat}, hh:mm A`)}</>
      // );
    }
    if (column?.id === columnIdsEnum?.submittedBy) {
      return (
        <>
          {row?.officer?.name ? (
            <div className="tableavatar">
              <TableImage
                imageUrl={row?.officer?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.officer?.name}`,
                })}`}
              />
              {capitalize(row?.officer?.name)}
            </div>
          ) : (
            NA
          )}
        </>
      );
    }

    if (column?.id === columnIdsEnum?.print) {
      return (
        <Box
          onClick={async () => {
            if (row?.runsheetSummaryReportUrl) {
              // Open the URL in a new tab immediately
              window.open(row.runsheetSummaryReportUrl, '_blank', 'noopener,noreferrer');
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

  useDeepEffect(() => {
    fetchRunsheetReports();
  }, [queryParams, queryParams.selectedDates, queryParams.runsheets, queryParams.officerIds]);

  useEffect(() => {
    fetchAllRunsheets();
  }, []);

  const getShiftReportPDF = async (payload) => {
    try {
      // setLoading(true);
      const response = await getPDFViewOfShiftReport(
        payload?.reportId,
        payload?.templateableType,
        payload?.shiftId || null,
        payload?.siteId || null,
        true,
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

  const generateReportAndUpdateRow = async (row, autoLoadPdf = false, openOnNewTab = false) => {
    const pdfUrl = await getShiftReportPDF({
      reportId: row?._id,
      templateableType: row?.templateableType,
      shiftId: row?.shiftId,
      siteId: row?.siteId,
      submittedAt: row?.submittedAt,
    });
    if (autoLoadPdf) setPdfUrl(pdfUrl);
    setData((prev) =>
      prev.map((item) =>
        item._id === row._id ? { ...item, runsheetSummaryReportUrl: pdfUrl } : item,
      ),
    );
    if (openOnNewTab) return pdfUrl;
  };

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });

      const url = URL.createObjectURL(response);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IncidentReport_${selectedReport?.submittedAt}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      [name]: value,
    }));
  };

  const drawerAiBadgeVariant = getReportAiBadgeVariant(selectedReport);

  return (
    <Box className={classes.reportsListings}>
      <Box className={classes.reportsListingsHeader}>
        <Box className={classes.reportsListingsHeaderLeft}>
          <Box className={classes.reportsListingsFilters}>
            <SearchComponent
              name="search"
              value={queryParams?.name || ''}
              placeholder={t('obx.settings.preferences.breakRules.searchbyName')}
              onSearch={handleSearch}
            />
            <CustomDropDown
              label={t('obx.shiftReports.filters.runsheetName.label', {
                runsheet: getLabel('terms', 'runsheet', t),
              })}
              name="runsheets"
              searchable
              options={allRunsheets}
              selectedValues={queryParams?.runsheets || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.shiftReports.filters.runsheetName.searchPlaceholder')}
              checkmark
              multiSelect={true}
              clearAll
            />

            <CustomDropDown
              label={t('obx.shiftReports.filters.users.label')}
              name="officer"
              searchable
              options={officers}
              selectedValues={queryParams?.officer || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.shiftReports.filters.users.searchPlaceholder')}
              checkmark={true}
              multiSelect={true}
              clearAll={true}
            />
          </Box>
        </Box>
        <Box className={classes.reportsListingsHeaderRight}>
          <Box className={classes.reportsListingsHeaderRightDate}>
            <DateRangePicker
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                updateFormHandler('selectedDates', dates);
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.reportsListingsContent}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
          rowsPerPage={queryParams.perPage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>

      {pdfViewDrawer && (
        <SideDrawer
          isOpen={pdfViewDrawer}
          key={`${loading}-${pdfUrl}-${error}`}
          totalWidth="1024px"
        >
          <Suspense fallback={null}>
            <PDFViewDrawer
              url={pdfUrl}
              setError={setError}
              setUrl={setPdfUrl}
              closeDrawer={setPdfViewDrawer}
            />
          </Suspense>
          <Box>
            <Box className={nameLayoutClasses.drawerFooterBar}>
              {drawerAiBadgeVariant != null && (
                <ReportAIModifiedBadge isAIModified={drawerAiBadgeVariant === 'refined'} />
              )}
              <Box className={nameLayoutClasses.drawerActionsButtons}>
                <Button
                  onClick={() => {
                    downloadPdf();
                  }}
                  variant="secondaryBlue"
                  disableRipple
                  disabled={!pdfUrl || isDownloading}
                >
                  {t('buttons.downloadPDF')}
                </Button>
              </Box>
            </Box>
          </Box>
        </SideDrawer>
      )}
    </Box>
  );
};

DailyRunsheetReport.propTypes = {
  params: PropTypes.object,
  value: PropTypes.number,
  sites: PropTypes.array,
  officers: PropTypes.array,
};

export default DailyRunsheetReport;
