import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
// import { ReactComponent as ExportUploadIcon } from 'assets/images/downloadcloud.svg';
// import { DownloadCloud } from 'assets/svg';
import { MoreVert } from 'assets/svg';
import { ReactComponent as AssignDispatchicon } from 'assets/svg/AssignDispatchicon.svg?react';
import { ReactComponent as CloseDispatchIcon } from 'assets/svg/CloseDispatchIcon.svg?react';
import { ReactComponent as SitePlaceHolderImage } from 'assets/svg/Site-Placeholder.svg?react';
import classNames from 'classnames';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import PopoverButton from 'src/app/components/common/popoverButton/index.jsx';
import SearchComponentWithQuery from 'src/app/components/common/searchWithQuery/index.jsx';
import DispatchHeaderSkeletonThreeColumn from 'src/app/components/common/skeletonLoader/dispatchThreeColumn.jsx';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table/index.jsx';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  ACL_OBX_DISPATCH_CREATE,
  ACL_OBX_DISPATCH_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { OBX_CREATE_DISPATCH, OBX_DISPATCH_DETAILS } from 'src/app/router/constant/ROUTE.jsx';
import history from 'src/app/router/utils/history.jsx';
import { DownloadCloud } from 'src/assets/svg';
import { ReactComponent as ActiveDispatchIcon } from 'src/assets/svg/activedispatch.svg?react';
import { ReactComponent as AlertsIcon } from 'src/assets/svg/Alerts.svg?react';
import { ReactComponent as DispatchInfoIcon } from 'src/assets/svg/DispatchInfoIcon.svg?react';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/unassigned.svg?react';
import { ReactComponent as UnassignedOfficer } from 'src/assets/svg/UnassignedOfficer.svg?react';
import { ReactComponent as PlusIcon } from 'src/assets/svg/WhitePlusIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime.jsx';
import usePersistentApiData from 'src/hooks/usePresistantApiData.jsx';
import { getDispatches, getDispatchStats, getDispatchTypes } from 'src/services/dispatch.services';
import { exportDispatchReports } from 'src/services/reports.services.js';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  dayjsFormatsEnum,
  fileExtensions,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common.jsx';
import { toaster } from 'src/utils/toast/index.jsx';

import ExportReportModel from '../../reports/components/exportReportModel/index.jsx';
import {
  dayjsWithStandardOffset,
  getDateRangeWrtFranchiseTimezone,
  getTimeDiff,
  getTimeDiffWithFormat,
} from '../../schedules/helper.js';
import CloseDispatchModal from '../components/closeDispatchModal/index.jsx';
import Filter from '../components/filter/index.jsx';
import { DISPATCH_STATUS_ENUM, DISPATCH_STATUS_OPTIONS } from '../dispatch.constant.js';
import {
  // getTimeElapsed,
  monitoringServiceTypeEnum,
  stateToQueryParams,
} from '../helper.js';
import { useStyles } from './dispatchStyles.js';

const i18ColumnName = (t, hoverIconClass, getLabel) => {
  return [
    {
      id: 'uuid',
      label: `${t('obx.dispatch.id', { dispatch: getLabel('terms', 'dispatch', t) })}`,
      sortable: false,
      className: hoverIconClass,
    },
    {
      id: 'siteName',
      label: `${t('obx.dispatch.site')}`,
      sortable: false,
    },
    {
      id: 'franchiseName',
      label: `${t('obx.dispatch.franchise')}`,
      sortable: false,
    },
    {
      id: 'dispatchType',
      label: `${t('obx.dispatch.dispatchType', { dispatch: getLabel('terms', 'dispatch', t) })}`,
      sortable: false,
    },
    {
      id: 'callDetail',
      label: `${t('obx.dispatch.monitoringServiceType')}`,
      sortable: false,
    },
    // {
    //   id: 'type',
    //   label: `${t('obx.dispatch.action')}`,
    //   sortable: false,
    // },
    {
      id: 'status',
      label: `${t('obx.dispatch.status')}`,
      sortable: false,
    },
    {
      id: 'jobId',
      label: `${t('obx.dispatch.jobId')}`,
      sortable: false,
    },
    {
      id: 'timeElapsed',
      label: `${t('obx.dispatch.timeElapsed')}`,
      sortable: false,
    },
    {
      id: 'createdDate',
      label: `${t('obx.dispatch.createdDate')}`,
      sortable: false,
    },
    {
      id: 'createdTime',
      label: `${t('obx.dispatch.createdTime')}`,
      sortable: false,
      className: hoverIconClass,
    },
    {
      id: 'assignee',
      label: `${t('obx.dispatch.assignedTo')}`,
      sortable: false,
    },
    {
      id: 'runsheet',
      label: `${t('obx.dispatch.runsheetName', { runsheet: getLabel('terms', 'runsheet', t) })}`,
      sortable: false,
    },
    {
      id: 'action',
      label: ``,
      sortable: false,
      notShow: !userHasPermission(ACL_OBX_DISPATCH_UPDATE),
    },
  ];
};

const columnIdsEnum = {
  runsheet: 'runsheet',
  siteName: 'siteName',
  franchiseName: 'franchiseName',
  dispatchType: 'dispatchType',
  status: 'status',
  jobId: 'jobId',
  createdTime: 'createdTime',
  createdDate: 'createdDate',
  assignee: 'assignee',
  action: 'action',
  id: 'id',
  timeElapsed: 'timeElapsed',
  uuid: 'uuid',
  monitoringServiceType: 'callDetail',
};

export const sitesPaginationEmptyState = {
  currentPage: 0,
  nextPage: 0,
  prevPage: 0,
  totalPages: 0,
  totalCount: 0,
};

const anchor = 'right';

const filterQueryParams = (obj) => {
  const transformed = {};
  for (const key in obj) {
    if (key === 'selectedDates' && !obj?.timeElapsed?.value) {
      const { startDate, endDate } = getDateRangeWrtFranchiseTimezone(obj[key]);
      transformed.windowStart = startDate;
      transformed.windowEnd = endDate;
    }
    // else if (key === 'timeElapsed') {
    //   const convertedTimes = getTimeElapsed(obj[key].value);
    //   transformed.windowStart = convertedTimes?.[0];
    //   transformed.windowEnd = convertedTimes?.[1];
    // }
    else if (key === 'franchise') {
      transformed.franchises = [obj[key]?.value];
    } else {
      transformed[key] = stateToQueryParams(obj, key);
    }
  }
  return transformed;
};

export default function index() {
  const today = dayjsWithStandardOffset();
  const yesterday = today.subtract(30, 'day');

  const params = {
    page: paginationOptions.defaultPerPage,
    perPage: 20,
    statuses: [],
    selectedDates: [yesterday, today],
  };

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [queryParams, setQueryParams] = useState(params);
  const hoverIconClass = classes.ZonesTD;
  const columns = i18ColumnName(t, hoverIconClass, getLabel).filter((a) => !a.notShow);
  const [openModal, setOpenModal] = useState(null);

  const { formatDayjsDateTime } = useDateTime();

  const [stats, setStats] = useState({
    active: 0,
    alerts: 0,
    newAlarms: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [filterToggle, setFilterToggle] = useState(false);
  const dispatchStatusEnums = DISPATCH_STATUS_ENUM(t);

  const { data: DISPATCH_TYPE_ENUM } = usePersistentApiData('dispatch-types', getDispatchTypes);
  const [exportModal, setExportModal] = useState(false);

  const handleCloseModal = () => setOpenModal(null);

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value),
    }));
  };

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
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

  const handleDispatchClose = (dispatch) => {
    setData((dispatches) =>
      dispatches.map((d) => ({ ...d, status: dispatch.id === d.id ? 'close' : d.status })),
    );
  };

  const toggleDrawer = (status) => {
    setFilterToggle(status);
  };

  const hanldeAction = (row, type) => {
    if (type === 'assign') {
      gotoAssignPage(row);
    } else if (type === 'closeDispatch') {
      setOpenModal(row);
    }
  };

  const handleFilters = (selectedFilters) => {
    setQueryParams((prevState) => {
      return selectedFilters
        ? {
            ...prevState,
            page: paginationOptions.defaultPerPage,
            ...selectedFilters,
          }
        : {
            ...params,
          };
    });
    toggleDrawer(false);
  };

  const gotoDetailPage = (row) => {
    history.push(
      `${OBX_DISPATCH_DETAILS}/${row?.id}${row.franchiseId ? `?franchiseId=${row?.franchiseId}` : ''}`,
    );
  };

  const gotoCreatePage = () => {
    history.push(`${OBX_CREATE_DISPATCH}`);
  };

  const gotoAssignPage = (row) => {
    history.push(
      `${OBX_DISPATCH_DETAILS}/${row.id}/assign-officer?siteId=${row?.siteId}&sameAsSiteAddress=${row?.sameAddressAsSite}${row.franchiseId ? `&franchiseId=${row?.franchiseId}` : ''}`,
    );
  };

  const isClickable = (columnId) => {
    return [columnIdsEnum.id, columnIdsEnum.siteName, columnIdsEnum.uuid].includes(columnId);
  };

  const showTimeElapsedWarning = (row) => {
    return (
      getTimeDiff(row.createdAt, new Date(), 'minute') > row.threshold &&
      row.status === dispatchStatusEnums.assigned.value
    );
  };

  const handleDateRange = (name, dates) => {
    const [startDate, endDate] = dates;
    if (
      startDate.isSame(queryParams.selectedDates[0]) &&
      endDate.isSame(queryParams.selectedDates[1])
    )
      return;
    updateFormHandler(name, dates);
  };

  const fetchDispatches = async () => {
    setLoading(true);
    try {
      const payload = filterQueryParams(queryParams);
      const response = await getDispatches(payload);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.dispatches || []);
        const total = response?.data?.pagination?.totalCount || 0;
        setTotalRows(total);
      }
      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  const fetchDispatchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await getDispatchStats();
      if (response && response?.statusCode === 200) {
        setStats(response?.data?.stats);
      }
      setLoadingStats(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, [queryParams]);

  useEffect(() => {
    fetchDispatchStats();
  }, []);

  const tableHead = () => {
    return (
      <>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id}>{column.label}</TableCell>
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
        <NoRecordFound
          data={data}
          noOfColumns={columns.length}
          t={t}
          description={t('obx.dispatch.notFoundDescription', {
            dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
          })}
        />
        {data.length > 0 &&
          data.map((row, index) => (
            <TableRow key={row.id}>
              {columns.map((column) => {
                return (
                  <TableCell
                    key={column.id}
                    onClick={() => isClickable(column.id) && gotoDetailPage(row)}
                    sx={{ cursor: isClickable(column.id) ? 'pointer' : '' }}
                    className={column.className}
                  >
                    {renderTableCell(row, column, index)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
      </>
    );
  };

  const getDispatchKey = (dispatchType) => dispatchType.split(' ').join('_').toLowerCase();

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.siteName) {
      if (row[column.id]?.length > 21)
        return (
          <Tooltip title={capitalizeFirstLetter(row[column.id])} arrow>
            {capitalizeFirstLetter(row[column.id]).substring(0, 21) + '...'}
          </Tooltip>
        );
      return capitalizeFirstLetter(row[column.id]) || NA;
    }
    if (column.id === columnIdsEnum.monitoringServiceType) {
      const serviceType = row?.callDetail?.monitoringServiceType || NA;
      // if (row[column.id]?.length > 21)
      //   return (
      //     <Tooltip title={capitalizeFirstLetter(row[column.id])} arrow>
      //       {capitalizeFirstLetter(row[column.id]).substring(0, 21) + '...'}
      //     </Tooltip>
      //   );
      return monitoringServiceTypeEnum(t)?.[serviceType];
    }
    if (column.id === columnIdsEnum.action) {
      if (
        row.status === dispatchStatusEnums.close.value ||
        row.status === dispatchStatusEnums.completed.value
      )
        return null;
      return (
        <PopoverButton className={classes.questionBankActions} variant="icon" Icon={MoreVert}>
          {!row.assignee?.id && (
            <Box className={classes.questionBankActionsMenu}>
              <Box
                className={classes.questionBankActionsRegular}
                onClick={() => hanldeAction(row, 'assign')}
              >
                <AssignDispatchicon className={classes.questionBankActionsIconRegular} />
                <Typography className={classes.questionBankActionsTextRegular} variant="subtitle2">
                  {t('obx.dispatch.assignDispatch', { dispatch: getLabel('terms', 'dispatch', t) })}
                </Typography>
              </Box>
            </Box>
          )}
          <Box
            className={classes.questionBankActionsMenu}
            onClick={() => hanldeAction(row, 'closeDispatch')}
          >
            <Box className={classes.questionBankActionsDelete}>
              <CloseDispatchIcon className={classes.questionBankActionsIconDelete} />
              <Typography className={classes.questionBankActionsTextDelete} variant="subtitle2">
                {t('obx.dispatch.closeDispatch', { dispatch: getLabel('terms', 'dispatch', t) })}
              </Typography>
            </Box>
          </Box>
        </PopoverButton>
      );
    }

    if (column.id === columnIdsEnum.assignee) {
      const disabled = userHasPermission(ACL_OBX_DISPATCH_UPDATE)
        ? row.status === dispatchStatusEnums.close.value ||
          row.status === dispatchStatusEnums.completed.value
        : true;
      return (
        <>
          <Box className={classes.avatarColName}>
            {row?.[column?.id]?.id ? (
              <Box className={classes.inlineBox}>
                <Avatar className={classes.avatarCol} alt={row?.[column?.id]?.name}>
                  {row[column?.id].imageUrl ? (
                    <img src={row[column?.id].imageUrl} alt={row?.[column?.id]?.name} />
                  ) : (
                    <SitePlaceHolderImage />
                  )}
                </Avatar>
                {capitalizeFirstLetter(row?.[column?.id]?.name) || NA}
              </Box>
            ) : (
              <Button
                onClick={() => gotoAssignPage(row)}
                startIcon={<UnassignedOfficer />}
                variant="onlyText"
                className={[classes.buttonOffice, disabled ? classes.buttonOfficeDisabled : '']}
                disableRipple
                disabled={disabled}
              >
                {t('obx.dispatch.assign')}
              </Button>
            )}
          </Box>
        </>
      );
    }

    if (column.id === columnIdsEnum.timeElapsed) {
      const findCloseCompletedDispatch = row?.logs?.find(
        (log) =>
          log?.status === DISPATCH_STATUS_ENUM(t)?.completed.value ||
          log?.status === DISPATCH_STATUS_ENUM(t)?.close.value ||
          log.status === 'closed',
      );
      const warning = showTimeElapsedWarning(row);
      return warning ? (
        <Tooltip
          title={`${t('obx.dispatch.alertsMRTsTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t).toLowerCase() })}`}
          arrow
        >
          <Chip
            label={getTimeDiffWithFormat(row.createdAt, new Date())}
            className={classes.pulseAnimation}
          />
        </Tooltip>
      ) : (
        <Chip
          label={
            findCloseCompletedDispatch
              ? getTimeDiffWithFormat(row.createdAt, findCloseCompletedDispatch.datetime)
              : getTimeDiffWithFormat(row.createdAt, new Date())
          }
          className={classes.timeElapsedStyle}
        />
      );
    }
    if (columnIdsEnum.createdDate === column.id) {
      return row.createdAt
        ? formatDayjsDateTime({ value: row?.createdAt, formatType: dayjsFormatsEnum.date })
        : NA;
    }

    if (columnIdsEnum.createdTime === column.id) {
      return row.createdAt
        ? formatDayjsDateTime({
            value: row?.createdAt,
            formatType: dayjsFormatsEnum.time,
          })
        : NA;
    }
    if (column.id === columnIdsEnum.status) {
      let statusClass =
        classes[dispatchStatusEnums?.[row?.status]?.statusClass || 'commonStageColor'];
      return (
        <Box component="span" className={classNames(classes.commonStageColor, statusClass)}>
          {dispatchStatusEnums?.[row?.status]?.label ||
            row?.status
              ?.toLowerCase()
              ?.split('_')
              ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              ?.join(' ') ||
            NA}
        </Box>
      );
    }

    if (column.id === columnIdsEnum.dispatchType) {
      return DISPATCH_TYPE_ENUM?.[getDispatchKey(row[column.id])] || row[column.id] || NA;
    }

    if (column.id === columnIdsEnum.runsheet) {
      return row?.assignee?.shiftName || NA;
    }

    return <>{row[column.id] || NA}</>;
  };
  const filters = DISPATCH_STATUS_OPTIONS(t).slice(1, DISPATCH_STATUS_OPTIONS(t).length);
  return (
    <Box className={classes.sitesListingContainer}>
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.leftSide}>
          <Typography variant="h3">{getLabel('terms', 'dispatches', t)}</Typography>
        </Box>
        <Box className={classes.rightBar}>
          <Box className={classes.rightBar}>
            <Box className={classes.invoicesDateRange}>
              <DateRangePicker
                selectedDates={queryParams?.selectedDates}
                setDates={(dates) => {
                  handleDateRange('selectedDates', dates);
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {loadingStats ? (
        <DispatchHeaderSkeletonThreeColumn />
      ) : (
        <Box className={classes.countBoxMain}>
          <Box className={classes.countBox}>
            <AlertsIcon />
            <Box className={classes.countBoxText}>
              <Box className={classes.infoBox}>
                <Typography variant="subtitle3" className={classes.countlabel}>
                  {`${t('obx.dispatch.alertsMRTs')}`}
                </Typography>
                <Tooltip
                  title={`${t('obx.dispatch.alertsMRTsTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t) })}`}
                  arrow
                >
                  <IconButton>
                    <DispatchInfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="subtitle2" className={classes.countText}>
                {stats.alerts}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.countBox}>
            <UnassignedIcon />
            <Box className={classes.countBoxText}>
              <Box className={classes.infoBox}>
                <Typography variant="subtitle3" className={classes.countlabel}>
                  {`${t('obx.dispatch.newAlarms')}`}
                </Typography>
                <Tooltip
                  title={`${t('obx.dispatch.newAlarmsTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t).toLowerCase() })}`}
                  arrow
                >
                  <IconButton>
                    <DispatchInfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="subtitle2" className={classes.countText}>
                {stats.newAlarms}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.countBox}>
            <ActiveDispatchIcon />
            <Box className={classes.countBoxText}>
              <Box className={classes.infoBox}>
                <Typography variant="subtitle3" className={classes.countlabel}>
                  {`${t('obx.dispatch.activeDispatches', { dispatches: getLabel('terms', 'dispatches', t) })}`}
                </Typography>
                <Tooltip
                  title={`${t('obx.dispatch.activeDispatchesTooltip', { dispatch: getLabel('terms', 'dispatch', t).toLowerCase(), officer: getLabel('roles', 'officer', t).toLowerCase() })}`}
                  arrow
                >
                  <IconButton>
                    <DispatchInfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="subtitle2" className={classes.countText}>
                {stats.active}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.leftSide}>
          <SearchComponentWithQuery
            name="search"
            onSearch={inputChangedHandler}
            placeHolder={`${t('obx.dispatch.search')}`}
          />
          <CustomDropDown
            label={`${t('obx.invoice.statusesDropdownLabel')}`}
            name="statuses"
            options={filters}
            selectedValues={queryParams?.statuses}
            multiSelect={true}
            checkmark={true}
            handleChange={inputChangedHandler}
          />
          <Filter
            anchor={anchor}
            open={filterToggle}
            toggleDrawer={toggleDrawer}
            onChange={handleFilters}
          />
        </Box>

        <Box className={classes.rightBar}>
          <Box className={classes.rightBar}>
            <Box className={classes.userSection}>
              <Button
                variant="secondaryGrey"
                startIcon={<DownloadCloud />}
                onClick={() => setExportModal(true)}
              >
                {`${t('links.export')}`}
              </Button>
            </Box>
            <RenderIfHasPermission name={ACL_OBX_DISPATCH_CREATE}>
              <Button
                startIcon={<PlusIcon />}
                variant="primary"
                className={classes.exportBtn}
                onClick={gotoCreatePage}
              >
                {t('obx.dispatch.createDispatch', { dispatch: getLabel('terms', 'dispatch', t) })}
              </Button>
            </RenderIfHasPermission>
          </Box>
        </Box>
      </Box>
      <Box className={classes.tableWrapper}>
        <TableComponent
          data={data}
          columns={columns}
          tableHead={tableHead}
          tableBody={tableBody}
          pagination={true}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
      <CloseDispatchModal
        openModal={!!openModal}
        dispatch={openModal}
        handleCloseModal={handleCloseModal}
        onDispatchClose={handleDispatchClose}
      />
      <ExportReportModel
        open={exportModal}
        onClose={() => setExportModal(false)}
        fileNamePrefix={'dispatchReports'}
        exportReportsService={exportDispatchReports}
        fileExtension={fileExtensions.XLSX}
      />
    </Box>
  );
}
