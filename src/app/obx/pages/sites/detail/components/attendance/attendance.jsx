import { Box, Chip, TableCell, TableRow, TableSortLabel } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import TableImage from 'commonComponents/tableImage';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getSiteAttendance } from 'services/sites.services';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
} from 'src/app/obx/pages/schedules/helper';
import { ACL_OBX_SITE_EXTRA_JOB_CREATE } from 'src/app/router/constant/OBXMODULE';
import { useApiControllers } from 'src/helper/axios';
import { listStatusHandler } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { dayjsFormatsEnum, paginationOptions, toastSettings } from 'src/utils/constants';
import { extractValuesByKeyFromInput } from 'src/utils/dropdownValueExtractor';
import capitalize from 'src/utils/string/capitalize';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './styles';

const today = dayjsWithStandardOffset();
const startOfMonth = dayjsWithStandardOffset().startOf('month');

const i18ColumnName = (t) => {
  return [
    {
      id: 'officer',
      label: `${t('obx.sitesAttendance.table.listing.columns.user')}`,
      sortable: false,
    },
    {
      id: 'shiftDate',
      label: `${t('obx.sitesAttendance.table.listing.columns.date')}`,
      sortable: true,
    },
    {
      id: 'shiftType',
      label: `${t('obx.sitesAttendance.table.listing.columns.jobType')}`,
    },
    {
      id: 'startsAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.shiftStart')}`,
      sortable: true,
    },
    {
      id: 'endsAt',
      label: `${t('obx.users.usersAttendance.table.listing.columns.shiftEnd')}`,
      sortable: true,
    },
    {
      id: 'checkinAt',
      label: `${t('obx.sitesAttendance.table.listing.columns.checkInTime')}`,
    },
    {
      id: 'checkoutAt',
      label: `${t('obx.sitesAttendance.table.listing.columns.checkOutTime')}`,
      sortable: true,
    },
    {
      id: 'slaStatus',
      label: `${t('obx.sitesAttendance.table.listing.columns.status')}`,
      sortable: true,
    },
  ];
};

/**
 * ? sla status filter Enums from backend
 * notStarted
 * shiftStarted
 * shiftEnded
 * onTime
 * lateShiftStarted
 * earlyShiftStart
 * earlyLeft
 * overTime
 * competed
 */

const i8StatusDropDownOptions = (t) => {
  return [
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.allStatuses')}`,
      value: 'all',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.present')}`,
      value: 'present',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.absent')}`,
      value: 'absent',
    },
    {
      label: `${t('obx.users.usersAttendance.dropDownOptionsLabels.onLeave')}`,
      value: 'leave',
    },
  ];
};

/**
 * ? shift Type Enums from backend
 * dedicated
 * patrol
 * extra
 * dispatch
 */

const shiftTypeFilter = (t, getLabel, services) => {
  const patrolLabel = (getLabel && getLabel('terms', 'patrol', t)) || 'Patrol';
  const dedicatedLabel = (getLabel && getLabel('terms', 'dedicated', t)) || 'Dedicated';
  const extraLabel = (getLabel && getLabel('terms', 'extra', t)) || 'Extra';

  const filterOptions = [{ value: 'all', label: 'All Shifts' }];
  // PATROL
  if (services?.patrol === true) {
    filterOptions.push({
      value: 'patrol',
      label: patrolLabel,
    });
  }

  // DEDICATED
  if (services?.dedicated === true) {
    filterOptions.push({
      value: 'dedicated',
      label: dedicatedLabel,
    });
  }

  // EXTRA (permission-based)
  if (userHasPermission(ACL_OBX_SITE_EXTRA_JOB_CREATE)) {
    filterOptions.push({
      value: 'extra',
      label: extraLabel,
    });
  }
  return filterOptions;
};

const checkKeyNames = {
  all: 'all',
};

const columnIdsEnum = {
  officer: 'officer',
  startsAt: 'startsAt',
  status: 'slaStatus',
  dutyType: 'shiftType',
  startTime: 'startsAt',
  endTime: 'endsAt',
  checkinAt: 'checkinAt',
  checkoutAt: 'checkoutAt',
  lateStarted: 'lateStarted',
  shiftDate: 'shiftDate',
};

const timeKeys = ['checkinAt', 'checkoutAt', 'endsAt', 'startsAt'];

const initialStateParams = {
  page: paginationOptions.defaultPerPage,
  perPage: paginationOptions.perPageRows,
  search: '',
  slaStatus: {},
  shiftType: {},
  sortBy: '',
  orderBy: '',
  windowStart: startOfMonth,
  windowEnd: today,
  selectedDates: [startOfMonth, today],
  officers: [],
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const Attendance = ({ id }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);

  const [queryParams, setQueryParams] = useState(initialStateParams);

  const [orderState, setOrderState] = useState(order);

  const { getNewApiController } = useApiControllers();

  const columns = i18ColumnName(t);

  const statusDropDownOptions = i8StatusDropDownOptions(t);

  const [dropDownOptions, setDropDownOptions] = useState({
    users: [],
  });

  const NA = t('commonText.nA');
  const { formatDayjsDateTime } = useDateTime();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});

  const fetchAttendance = async (params) => {
    const apiController = getNewApiController();
    try {
      setLoading(true);

      let officerId = [];

      let selectedOfficers = params.officers?.map((a) => a?.value);

      if (selectedOfficers.length) {
        officerId = [...officerId, ...selectedOfficers];
      }

      const convertedDates = params.selectedDates.length
        ? appendDefaultStartAndEndTimeWithDates(params?.selectedDates)
        : [];

      let queryParams = {
        ...params,
        siteId: id,
        slaStatus:
          extractValuesByKeyFromInput(params?.slaStatus, 'value') !== checkKeyNames.all
            ? extractValuesByKeyFromInput(params?.slaStatus, 'value')
            : '',
        shiftType:
          extractValuesByKeyFromInput(params?.shiftType, 'value') !== checkKeyNames.all
            ? extractValuesByKeyFromInput(params?.shiftType, 'value')
            : '',
        officerId: officerId.length > 0 ? officerId : 'all',
        windowStart: convertedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: convertedDates?.[1] ? convertedDates?.[1] : '',
      };

      delete queryParams.selectedDates;
      delete queryParams.officers;
      const response = await getSiteAttendance(id, queryParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.logs || []);
        setTotalRows(response?.data?.pagination?.totalCount);
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
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

  const getUsers = async () => {
    try {
      const query = {
        userType: '',
      };
      const response = await getUsersWithDesiredType(query);
      if (response?.data?.statusCode === 200) {
        setDropDownOptions(() => {
          return {
            users: transformArrayForOptions(response?.data?.users, 'name', 'id').map((a) => {
              return {
                ...a,
                label: capitalizeFirstLetter(a?.label),
              };
            }),
          };
        });
      }
    } catch (e) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChangePage = async (_, newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      perPage: parseInt(event.target.value, 10),
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
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
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
      <TableSkeleton columns={columns} />
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
    if (column?.id === columnIdsEnum?.officer) {
      return (
        <>
          <div className="tableavatar">
            {row?.officer?.imageUrl && (
              <TableImage
                imageUrl={row?.officer?.imageUrl}
                alt={`${t('commonText.image.alt', {
                  name: `${row?.officer?.name}`,
                })}`}
              />
            )}

            {capitalize(row?.officer?.name) || NA}
          </div>
        </>
      );
    }
    if (column?.id === columnIdsEnum?.shiftDate) {
      return (
        <>
          {row?.shiftDate
            ? formatDayjsDateTime({ value: row?.shiftDate, formatType: dayjsFormatsEnum.date })
            : NA}
        </>
      );
    }

    if (column?.id === columnIdsEnum?.dutyType) {
      const chipData = listStatusHandler(row[column.id], t, getLabel);
      return <>{chipData?.title || NA}</>;
    }

    if (column?.id === columnIdsEnum?.status) {
      const chipData = listStatusHandler(row[column.id], t, getLabel);
      return <>{<Chip color={chipData?.color} size="small" label={chipData?.title} />}</>;
    }

    if (timeKeys.includes(column?.id)) {
      return (
        <>
          {row[column.id]
            ? formatDayjsDateTime({
                value: row[column.id],
                formatType: dayjsFormatsEnum.time,
              })
            : 'N/A'}
        </>
      );
    }

    if (row[column.id] === 0) {
      return <>{row[column.id]}</>;
    }

    return <>{row[column.id] || NA}</>;
  };

  useEffect(() => {
    if (id) {
      fetchAttendance(queryParams);
    }
    if (!dropDownOptions.users.length) {
      getUsers();
    }
  }, [JSON.stringify(queryParams)]);

  return (
    <Box className={classes.attendanceWrapper}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <Box className={classes.searchSectionDashboard}>
        <Box className={classes.searchSection}>
          <CustomDropDown
            label={t('obx.attendance.dropDownOptionsLabels.allUsers')}
            name="officers"
            selectedValues={queryParams?.officers}
            options={dropDownOptions?.users}
            handleChange={inputChangedHandler}
            multiSelect
            checkmark
            clearAll
          />
          <Box className="dropdowncommonsction">
            <CustomDropDown
              label={t('obx.users.usersAttendance.dropDownOptionsLabels.allStatuses')}
              name="slaStatus"
              options={statusDropDownOptions}
              selectedValues={queryParams?.slaStatus}
              handleChange={inputChangedHandler}
            />
          </Box>
          <Box className="dropdowncommonsction">
            <CustomDropDown
              label={t('obx.sites.filters.duties.all')}
              name="shiftType"
              options={shiftTypeFilter(t, getLabel, services)}
              selectedValues={queryParams?.shiftType}
              handleChange={inputChangedHandler}
            />
          </Box>
        </Box>
        <Box className={classes.reportsListingsHeaderRightDate}>
          <DateRangePicker
            selectedDates={queryParams?.selectedDates}
            setDates={(dates) => {
              updateFormHandler('selectedDates', dates);
            }}
          />
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
          applySorting={applySorting}
          rowsPerPageOptions={paginationOptions.perPageOptions}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Box>
    </Box>
  );
};

Attendance.propTypes = {
  id: PropTypes.number,
};

export default Attendance;
