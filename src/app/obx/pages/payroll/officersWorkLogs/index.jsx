import { Avatar, Box, TableCell, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { OBX_USER_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getWorkLogs } from 'src/services/payroll.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { paginationOptions, toastSettings } from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
  minutesToHoursFormat,
} from '../../schedules/helper';
import ExportWorkLogModal from '../components/exportWorklogModal';
import { useStyles } from './OfficersWorkLogs.style';

const i18ColumnName = (t, columnClass, selectedDates) => {
  const [startDate1, endDate1] = selectedDates.length
    ? appendDefaultStartAndEndTimeWithDates(selectedDates)
    : [];

  const formatDate = (date) => {
    return {
      day: date.format('DD/MM/YYYY'),
      dayName: date.format('ddd'),
    };
  };

  const columns = [
    {
      id: 'name',
      label: `${t('obx.payroll.users')}`,
      hasImage: true,
    },
  ];

  if (!startDate1 && !endDate1) {
    return columns;
  }
  const startDate = dayjsWithStandardOffset(startDate1).startOf('day');
  const endDate = dayjsWithStandardOffset(endDate1).startOf('day');

  let currentDate = startDate?.clone();

  while (currentDate?.isSameOrBefore(endDate, 'day')) {
    const { day, dayName } = formatDate(currentDate);

    columns.push({
      id: `${day}`,
      label: `${day?.split('/')?.[0]}\n${dayName}`, // Day number and day name
      className: columnClass,
    });

    // Increment the date by 1 day
    currentDate = currentDate?.add(1, 'day');
  }

  // Add the "total" column at the end
  columns.push(
    ...[
      {
        id: 'allocatedHours',
        label: `${t('obx.payroll.allocatedHours')}`,
      },
      {
        id: 'overtimeHours',
        label: `${t('obx.payroll.overtimeHours')}`,
      },
      {
        id: 'totalHours',
        label: `${t('obx.payroll.totalHoursWorked')}`,
      },
    ],
  );

  return columns;
};

const sortTypeFilters = (t) => [
  { value: 'totalHoursDesc', label: t('obx.payroll.sortOrder.highToLow') },
  { value: 'totalHoursAsc', label: t('obx.payroll.sortOrder.lowToHigh') },
  { value: 'nameAsc', label: t('obx.payroll.sortOrder.aToZ') },
  { value: 'nameDesc', label: t('obx.payroll.sortOrder.zToA') },
];

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: {},
  orderBy: '',
  officerId: [],
};
const order = {
  orderBy: 'id',
  orderType: 'asc',
};
const columnIdsEnum = {
  name: 'name',
  total: 'totalHours',
  summary: 'summary',
  allocatedHours: 'allocatedHours',
  overtimeHours: 'overtimeHours',
};

const OfficerWorkLogs = ({
  selectedDates,
  exportWorkLogsModal,
  setExportWorkLogsModal,
  exportWorkLogsHoModal,
  setExportWorkLogsHoModal,
}) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const [allOfficers, setAllOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [worklogs, setWorklogs] = useState([]);
  // const [totalRows, _setTotalRows] = useState(0);
  const { getNewApiController } = useApiControllers();
  const [queryParams, setQueryParams] = useState(params);
  const [totalGrands, setTotalGrands] = useState(0);
  const { getLabel } = useTenantLabel();

  const columnClass = classes.daysColumn;
  const columns = i18ColumnName(t, columnClass, selectedDates);

  useEffect(() => {
    if (!allOfficers.length) fetchAllOfficers();
    fetchAllWorklogs();
  }, [queryParams, selectedDates]);

  const fetchAllWorklogs = async () => {
    setLoading(true);
    const apiController = getNewApiController();
    try {
      const convertedDates = selectedDates.length
        ? appendDefaultStartAndEndTimeWithDates(selectedDates)
        : [];

      const officerId = removeAllFromSelected(
        extractValuesByKeyFromInput(queryParams?.officerId, 'value'),
        'all',
      );

      const params = {
        windowStart: selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: selectedDates?.[1] ? convertedDates?.[1] : '',
        workLogSortBy: queryParams?.sortBy?.value,
        officerId,
      };

      const response = await getWorkLogs(params, {
        signal: apiController.signal,
      });
      if (response && response.statusCode === 200) {
        setWorklogs([...(response.data.workLog || []), response?.data?.daysAccumulatedSum]);
        setTotalGrands(response?.data?.totalWorkingHours);
        setLoading(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    }
  };

  const isAllocatedOvertimeOrTotalHoursCell = (column) => {
    return (
      column.id === columnIdsEnum.total ||
      column.id === columnIdsEnum.allocatedHours ||
      column.id === columnIdsEnum.overtimeHours
    );
  };

  const isAllocatedOrOvertimeHoursCell = (column) => {
    return column.id === columnIdsEnum.allocatedHours || column.id === columnIdsEnum.overtimeHours;
  };

  const fetchAllOfficers = async () => {
    try {
      const response = await getUsersWithDesiredType();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: t('obx.schedules.filters.officers.label', {
              officers: getLabel('terms', 'officers', t),
            }),
            image: 'someDefaultImageString',
          },
          ...transformedUsers,
        ]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const _handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const _handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
    }));
  };

  const renderTableCell = (row, column) => {
    if (!row?.id) {
      if (column.id === columnIdsEnum.name)
        return <Box className={classes.userName}>{t('obx.payroll.total')}</Box>;

      if (isAllocatedOrOvertimeHoursCell(column)) return;

      const totalHours = column.id === columnIdsEnum.total ? totalGrands : row?.[column.id];

      const formattedHoursDecimalToHoursMinutes = minutesToHoursFormat(totalHours * 60, true);
      return <Box>{formattedHoursDecimalToHoursMinutes || ''}</Box>;
    }

    const worklogSummary = row?.summary;
    if (column.id === columnIdsEnum.name) {
      return (
        <Box className={classes.userName}>
          <Avatar alt={row[column.id]} src={row?.image || '/static/images/avatar/1.jpg'} />
          {row?.[column.id]?.length > 25 ? (
            <>
              <Tooltip title={row?.[column.id]} arrow>
                {truncateString(capitalizeFirstLetter(row?.[column.id]), 25) || NA}
              </Tooltip>
            </>
          ) : (
            <>{capitalizeFirstLetter(row?.[column.id]) || NA}</>
          )}
        </Box>
      );
    }

    if (Object.keys(worklogSummary)?.includes(column.id)) {
      const formattedHoursDecimalToHoursMinutes = minutesToHoursFormat(
        Math.round(worklogSummary[column.id] * 60),
        true,
      );
      return <>{formattedHoursDecimalToHoursMinutes || ''}</>;
    }

    if (isAllocatedOvertimeOrTotalHoursCell(column)) {
      const formattedTotalHoursToMinutesHours = minutesToHoursFormat(
        Math.round((row[column.id] || 0) * 60),
        true,
      );
      return <>{formattedTotalHoursToMinutesHours}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  const [orderState, setOrderState] = useState(order);

  /**
   * Handle column sorting.
   *
   * @param {String} columnId - The ID of the column being sorted.
   */
  const handleSort = (columnId) => {
    const isAsc = orderState.orderType === 'asc';
    setOrderState({
      orderBy: columnId,
      orderType: isAsc ? 'desc' : 'asc',
    });
    applySorting(columnId, orderState.orderType);
  };

  const applySorting = (sortBy, orderBy) => {
    setQueryParams((prev) => ({
      ...prev,
      sortBy: sortBy,
      orderBy: orderBy,
    }));
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
            <TableCell
              className={column.className}
              key={column.id}
              sortDirection={sortDirection(column)}
            >
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
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return (
                <TableCell
                  key={column.id}
                  onClick={() => gotoDetailPage(column, row.id)}
                  sx={{ cursor: showHandCursor }}
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
    const { name, value } = event.target;
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, rowId) => {
    if (column.id === columnIdsEnum.name) {
      history.push(`${OBX_USER_DETAIL}/${rowId}`);
    }
  };

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.vehicleListingContainer}>
        <Box className={classes.searchSectionDashboard}>
          <Box className={classes.searchSection}>
            <Box className="dropdowncommonsction">
              <CustomDropDown
                label={t('obx.settings.userGroups.users')}
                name="officerId"
                options={allOfficers}
                selectedValues={queryParams.officerId || []}
                handleChange={inputChangedHandler}
                multiSelect
                checkmark
                searchable
                withTiles
                clearAll
              />
            </Box>
          </Box>
          <Box className={classes.userSection}>
            <Box className="dropdowncommonsction">
              <CustomDropDown
                label={t('obx.payroll.sort')}
                name="sortBy"
                options={sortTypeFilters(t)}
                selectedValues={queryParams.sortBy}
                handleChange={inputChangedHandler}
              />
            </Box>
          </Box>
        </Box>
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={worklogs || []}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
            // page={queryParams.page - 1}
            // rowsPerPage={queryParams.perPage}
            // totalRecords={totalRows}
            // handleChangePage={handleChangePage}
            // applySorting={applySorting}
            // rowsPerPageOptions={paginationOptions.perPageOptions}
            // onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>

        {exportWorkLogsModal && (
          <ExportWorkLogModal
            open={exportWorkLogsModal}
            onClose={() => setExportWorkLogsModal(false)}
            refetchPayroll={() => {}}
            isPatrol={false}
            isHoExport={false}
          />
        )}

        {exportWorkLogsHoModal && (
          <ExportWorkLogModal
            open={exportWorkLogsHoModal}
            onClose={() => setExportWorkLogsHoModal(false)}
            refetchPayroll={() => {}}
            isPatrol={false}
            isHoExport={true}
          />
        )}
      </Box>
    </>
  );
};

export default OfficerWorkLogs;

OfficerWorkLogs.propTypes = {
  selectedDates: PropTypes.array,
  exportWorkLogsModal: PropTypes.bool,
  setExportWorkLogsModal: PropTypes.func,
  exportWorkLogsHoModal: PropTypes.bool,
  setExportWorkLogsHoModal: PropTypes.func,
};

OfficerWorkLogs.defaultProps = {
  selectedDates: [],
  exportWorkLogsModal: false,
  setExportWorkLogsModal: () => {},
  exportWorkLogsHoModal: false,
  setExportWorkLogsHoModal: () => {},
};
