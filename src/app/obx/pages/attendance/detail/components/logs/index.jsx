import { Box, Chip, TableCell, TableRow, TableSortLabel } from '@mui/material';
import SearchComponent from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import {
  getStartAndEndOfMonth,
  isObjectEmpty,
  listStatusHandler,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { getAttendanceLogs } from 'src/services/attendance.services';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { monthAbbr } from 'src/utils/date';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import { useStyles } from './logoStyles';
const today = dayjs();

const i18ColumnName = (t) => {
  return [
    {
      id: 'date',
      label: `${t('obx.attendance.table.attendanceLogs.columns.date')}`,
      sortable: false,
    },
    {
      id: 'shiftType',
      label: `${t('obx.attendance.table.attendanceLogs.columns.shiftType')}`,
    },
    {
      id: 'site',
      label: `${t('obx.attendance.table.attendanceLogs.columns.site')}`,
      sortable: false,
    },
    {
      id: 'status',
      label: `${t('obx.attendance.table.attendanceLogs.columns.status')}`,
      sortable: false,
    },
    {
      id: 'startsAt',
      label: `${t('obx.attendance.table.attendanceLogs.columns.startTime')}`,
      sortable: false,
    },
    {
      id: 'endsAt',
      label: `${t('obx.attendance.table.attendanceLogs.columns.endTime')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  shiftType: 'shiftType',
  status: 'status',
  site: 'site',
  date: 'date',
  startsAt: 'startsAt',
  endsAt: 'endsAt',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  officerId: null,
  windowStart: null,
  windowEnd: null,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const AttendanceLogs = ({ id }) => {
  const { t } = useTranslation();
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(params);
  const classes = useStyles();
  const [orderState, setOrderState] = useState(order);

  const columns = i18ColumnName(t);
  const NA = t('commonText.nA');

  const fetchAttendanceLogs = async (params) => {
    try {
      setLoading(true);

      let dateObj = {};
      if (params.windowStart) {
        dateObj = getStartAndEndOfMonth(params.windowStart.toISOString().split('T')[0]);
      }

      let queryParams = {
        ...params,
        officerId: id,
        windowStart: isObjectEmpty(dateObj) ? '' : dateObj.start,
        windowEnd: isObjectEmpty(dateObj) ? '' : dateObj.end,
      };

      const response = await getAttendanceLogs(queryParams);

      if (response?.statusCode === 200) {
        setData(response?.data?.logs);
        setTotalRows(response?.data?.pagination?.totalCount);
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

  const handleDateChange = (value) => {
    inputChangedHandler({ target: { name: 'windowStart', value: dayjs(value) } });
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
      <TableSkeleton columns={columns} numberOfRows={10} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.site) {
      return <>{row?.site?.name || NA}</>;
    }

    if (column.id === columnIdsEnum.shiftType) {
      return <>{capitalize(row?.shiftType) || NA}</>;
    }

    if (column?.id === columnIdsEnum?.date) {
      return (
        <>{formatDayjsDateTime({ value: row?.date, formatType: dayjsFormatsEnum.date }) || NA}</>
      );
    }

    if (column?.id === columnIdsEnum?.startsAt || column?.id === columnIdsEnum?.startsAt) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.time })
            : 'N/A'}
        </>
      );
    }

    if (column?.id === columnIdsEnum?.status) {
      const chipData = listStatusHandler(row[column.id], t, getLabel);
      return <>{<Chip color={chipData?.color} size="small" label={chipData?.title} />}</>;
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    fetchAttendanceLogs(queryParams);
  }, [queryParams, id]);

  return (
    <Box className={classes.sitesListingCommonContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <SearchComponent
            name="search"
            value={queryParams?.search}
            onSearch={inputChangedHandler}
          />
          <Box className="dropdowncommonsction"></Box>
        </Box>
        <Box className={classes.reportsListingsHeaderRight}>
          <Box className={classes.reportsListingsHeaderRightDate}>
            <ResponsiveDatePickers
              value={queryParams.windowStart}
              views={['month', 'year']}
              onChange={handleDateChange}
              format={null}
              placeholder={`${monthAbbr[today.month()]} ${today.year()}`}
            />
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
          perPage={queryParams.perPage}
          totalRecords={totalRows}
          handleChangePage={handleChangePage}
          applySorting={applySorting}
        />
      </Box>
    </Box>
  );
};

AttendanceLogs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AttendanceLogs;
