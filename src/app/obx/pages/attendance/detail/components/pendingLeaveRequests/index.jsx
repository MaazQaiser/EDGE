import { Box, Button, Checkbox, TableCell, TableRow, TableSortLabel } from '@mui/material';
import { ReactComponent as CheckIcon } from 'assets/svg/checkBtn.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/closeBtn.svg?react';
import SearchComponent from 'commonComponents/searchWithQuery';
import TableComponent from 'commonComponents/table';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import ModalComponent from 'src/app/components/common/modal';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import { getStartAndEndOfMonth, isObjectEmpty } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';
import {
  changeAttendanceRequest,
  getPendingAttendanceRequests,
} from 'src/services/attendance.services';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { monthAbbr } from 'src/utils/date';
import capitalize from 'src/utils/string/capitalize';
import { toaster } from 'src/utils/toast';

import ChangeRequestStatusModal from './components/changeRequestStatusModal';
import { useStyles } from './LeaveStyles';

const today = dayjs();

const i18ColumnName = (t) => {
  return [
    // { id: 'id', label: 'ID', sortable: true },
    {
      id: 'date', //user name
      label: `${t('obx.attendance.table.pendingRequestLog.columns.date')}`,
      sortable: false,
    },
    {
      id: 'jobType', // role or permission assigned to the user
      label: `${t('obx.attendance.table.pendingRequestLog.columns.jobType')}`,
      sortable: false,
    },
    {
      id: 'reason', // role or permission assigned to the user
      label: `${t('obx.attendance.table.pendingRequestLog.columns.reason')}`,
      sortable: false,
    },
  ];
};

const columnIdsEnum = {
  id: 'id',
  jobType: 'jobType',
  date: 'date',
};

const requestStatuses = {
  approve: 'approved',
  reject: 'rejected',
};

const changeRequestStatusFormData = {
  attendanceIds: [],
  status: '',
  supervisorComments: '',
};

const params = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  sortBy: '',
  orderBy: '',
  windowStart: null,
  windowEnd: null,
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const PendingLeaveRequests = ({ id }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const { formatDayjsDateTime } = useDateTime();
  const [queryParams, setQueryParams] = useState(params);

  const [orderState, setOrderState] = useState(order);

  const [selectAll, setSelectAll] = useState(false);

  const [reloadComponent, setReloadComponent] = useState(false);

  const [open, setOpen] = useState(false);

  const [requestStatusFormData, setRequestStatusFormData] = useState(changeRequestStatusFormData);

  const columns = i18ColumnName(t);
  const NA = t('commonText.nA');

  const handleOpenClose = (openModal) => {
    setOpen(openModal);
  };

  const fetchAttendanceRequests = async (params) => {
    try {
      setLoading(true);

      let dateObj = {};
      if (params.windowStart) {
        dateObj = getStartAndEndOfMonth(params.windowStart.toISOString().split('T')[0]);
      }

      let queryParams = {
        ...params,
        windowStart: isObjectEmpty(dateObj) ? '' : dateObj.start,
        windowEnd: isObjectEmpty(dateObj) ? '' : dateObj.end,
      };

      const response = await getPendingAttendanceRequests(id, queryParams);

      if (response?.statusCode === 200) {
        setData(response?.data?.data);
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

  const changeSelectedRequestStatus = async (e) => {
    try {
      e.preventDefault();
      handleOpenClose(false);
      setLoading(true);
      const response = await changeAttendanceRequest(requestStatusFormData);
      if (response?.statusCode === 200) {
        // setData((prev) => {
        //   return prev.filter((o) => o?.id !== requestStatusFormData);
        // });
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setReloadComponent(true);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
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

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      setRequestStatusFormData((prev) => ({
        ...prev,
        attendanceIds: data.map((row) => row.id),
      }));
      return;
    }

    setRequestStatusFormData((prev) => ({
      ...prev,
      attendanceIds: [],
    }));
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      /**
       * If the checkbox is checked
       * add the item to the selectedItems array
       */
      setRequestStatusFormData((prev) => ({
        ...prev,
        attendanceIds: [...prev.attendanceIds, id],
      }));
      return; // Return early
    }
    /**
     * If the checkbox is unchecked
     * remove the item from the selectedItems array
     */
    setRequestStatusFormData((prev) => ({
      ...prev,
      attendanceIds: prev.attendanceIds.filter((item) => item !== id),
    }));
  };

  const tableHead = () => {
    return (
      <>
        <TableRow>
          <TableCell>
            <Checkbox
              className={classes.tableCheck}
              checked={selectAll}
              onChange={handleSelectAllChange}
            />
          </TableCell>
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
        <NoRecordFound data={data} noOfColumns={4} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            <TableCell>
              <Checkbox
                className={classes.tableCheck}
                checked={requestStatusFormData.attendanceIds.includes(row.id)}
                onChange={(event) => handleCheckboxChange(event, row.id)}
              />
            </TableCell>
            {columns?.map((column) => (
              <TableCell key={column?.id}>{renderTableCell(row, column)}</TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };

  const actionButtons = () => {
    return (
      <>
        {requestStatusFormData.attendanceIds.length > 0 && (
          <>
            <Box>
              <Button
                variant="destructiveSecondary"
                startIcon={<CloseIcon />}
                type="button"
                onClick={() => {
                  handleOpenClose(true);
                  setRequestStatusFormData((prev) => ({ ...prev, status: requestStatuses.reject }));
                }}
              >
                {t('obx.attendance.pendingAttendanceRequestModal.rejectRequest')}
              </Button>
            </Box>
            <Box>
              <Button
                variant="primary"
                startIcon={<CheckIcon />}
                type="button"
                onClick={() => {
                  handleOpenClose(true);
                  setRequestStatusFormData((prev) => ({
                    ...prev,
                    status: requestStatuses.approve,
                  }));
                }}
              >
                {t('obx.attendance.pendingAttendanceRequestModal.approveRequest')}
              </Button>
            </Box>
          </>
        )}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    if (column.id === columnIdsEnum.jobType) {
      const jobTypes = row?.overlappingShifts.map((o) => capitalize(o.type));
      return <>{jobTypes.join(', ') || NA}</>;
    }
    if (column.id === columnIdsEnum.date) {
      return (
        <>
          {formatDayjsDateTime({ value: row[column.id], formatType: dayjsFormatsEnum.date }) || NA}
        </>
      );
    }
    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (reloadComponent) {
      setReloadComponent(false);
      setRequestStatusFormData(changeRequestStatusFormData);
      if (JSON.stringify(queryParams) === JSON.stringify(params)) {
        fetchAttendanceRequests(queryParams);
      } else {
        setQueryParams(params);
      }
    }
    if (id) fetchAttendanceRequests(queryParams);
  }, [queryParams, id, reloadComponent]);

  return (
    <>
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
            {actionButtons()}
          </Box>
          <Box className={classes.reportsListingsHeaderRight}>
            <Box className={classes.reportsListingsHeaderRightDate}>
              <ResponsiveDatePickers
                value={queryParams?.windowStart}
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
      <ModalComponent
        open={open}
        handleClose={() => {
          handleOpenClose(false);
        }}
        body={
          <ChangeRequestStatusModal
            key={requestStatusFormData.attendanceIds.length}
            formData={requestStatusFormData}
            setFormData={setRequestStatusFormData}
            handleSubmit={changeSelectedRequestStatus}
            handleClose={() => {
              handleOpenClose(false);
            }}
          />
        }
      />
    </>
  );
};

PendingLeaveRequests.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PendingLeaveRequests;
