// import {
//   appendDefaultStartAndEndTimeWithDates,
//   dayjsWithStandardOffset,
// } from '../../schedules/helper';

import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  TableCell,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import ExportPayrollModel from 'src/app/obx/pages/payroll/components/exportPayrollModel';
import {
  appendDefaultStartAndEndTimeWithDates,
  dayjsWithStandardOffset,
} from 'src/app/obx/pages/schedules/helper';
import ShiftDetail from 'src/app/obx/pages/schedules/shiftDetail';
import { ReactComponent as BlueArrowIcon } from 'src/assets/svg/BlueArrowIcon.svg?react';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as CheckBoxCheckedDisabledIcon } from 'src/assets/svg/checkbox-checked-disabled.svg?react';
import { ReactComponent as CheckboxDisabledIcon } from 'src/assets/svg/checkbox-disabled.svg?react';
import { ReactComponent as EmployIcon } from 'src/assets/svg/EmployIcon.svg?react';
import { useTenantLabel } from 'src/helper/utilityHooks';
// import { DownloadCloud } from 'src/assets/svg';
import useDateTime from 'src/hooks/useDateTime';
import { getPayrolls, updatePayrolls } from 'src/services/payroll.services';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dayjsFormatsEnum, toastSettings } from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { truncateString } from 'src/utils/string/truncate';
import { toaster } from 'src/utils/toast';

import TextFieldPopover from '../../../invoiceAbleHoursPopover';
import SelectedShiftHours from '../../../selectedShiftHoursModal';
import ShiftHours from '../../../shiftHoursModal';
import TimeOffModal from '../../../timeOffModal';
import StartTimePopover from '../../../timePopover';
import InnerTablePayroll from '../innerTablePayroll';
import { useStyles } from './PayrollDetailsListing';

const i18ColumnName = (t, getLabel) => {
  return [
    {
      id: 'hit',
      label: `${t('obx.payroll.hit', { hit: getLabel('terms', 'hit', t) })}`,
      sortable: false,
    },

    {
      id: 'site',
      label: `${t('obx.payroll.sites')}`,
      sortable: false,
    },
    {
      id: 'hitPunchInOut',
      label: `${t('obx.payroll.hitPunchInOut', { hit: getLabel('terms', 'hit', t) })}`,
      sortable: false,
    },
    {
      id: 'commuteToNextSite',
      label: `${t('obx.payroll.commuteToNextSite')}`,
      sortable: false,
    },
    {
      id: 'approvedHours',
      label: `${t('obx.payroll.approvedHitTime', { hit: getLabel('terms', 'hit', t) })}`,
      sortable: false,
    },
    {
      id: 'approvedHours',
      label: `${t('obx.payroll.approvedCommuteTime')}`,
      sortable: false,
    },
    {
      id: 'isBreakPayable',
      label: `${t('obx.payroll.breakRule')}`,
      sortable: false,
    },
    {
      id: 'action',
      label: ``,
      sortable: false,
    },
  ];
};
const stubbedData = [
  {
    hit: 'Hit 001',
    site: 'Site A',
    hitPunchInOut: '08:00 AM - 12:00 PM',
    commuteToNextSite: '30 minutes',
    approvedHours: '3.5 hours',
    approvedCommuteTime: '0.5 hours',
    isBreakPayable: true,
    action: 'View Details',
  },
  {
    hit: 'Hit 002',
    site: 'Site B',
    hitPunchInOut: '01:00 PM - 05:00 PM',
    commuteToNextSite: '45 minutes',
    approvedHours: '3.5 hours',
    approvedCommuteTime: '0.75 hours',
    isBreakPayable: false,
    action: 'View Details',
  },
];

const today = dayjsWithStandardOffset().startOf('day');

const lastMonth = dayjsWithStandardOffset().subtract(1, 'month').endOf('day');

const params = {
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [lastMonth, today],
  officerId: [],
  siteId: {},
  locationId: {},
  isApproved: { value: undefined, label: 'All Statuses' },
  // more filters
};

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

const columnIdsEnum = {
  action: 'action',
  invoiceableHours: 'invoiceableHours',
  approvedHours: 'approvedHours',
  employeeName: 'employeeName',
  isAdhocPayroll: 'isAdhocPayroll',
  employeeType: 'employeeType',
  site: 'site',
  hitPunchInOut: 'hitPunchInOut',
  shiftDate: 'shiftDate',
  shiftTime: 'shiftTime',
  hourlyRate: 'hourlyRate',
  adpBadgeNumber: 'adpBadgeNumber',
  location: 'location',
  isBreakPayable: 'isBreakPayable',
  breakTime: 'breakTime',
  totalHours: 'totalHours',
};

const PayrollDetailsListing = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [openColaps, setOpenColaps] = useState(false);
  const classDealName = classes.locationTD;
  const { getLabel } = useTenantLabel();

  const columns = i18ColumnName(t, getLabel, classDealName);

  const [showSelectedHoursModal, setShowSelectedHoursModal] = useState(false);
  const [shiftHoursModal, setShiftHoursModal] = useState(-1);

  const [showTimeOffModal, setShowTimeOffModal] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryParams, setQueryParams] = useState(params);
  const [selectAll, setSelectAll] = useState(false);

  // const [siteLocations, setSiteLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);

  const [openShiftSideDrawer, setOpenShiftSideDrawer] = useState(false);

  const [modelState, setModelState] = useState({
    exportModel: false,
  });
  const NA = t('commonText.nA');
  const { formatDayjsDateTime } = useDateTime();

  const handleModelChange = (name, state) => {
    setModelState((prevState) => {
      return {
        ...prevState,
        [name]: state,
      };
    });
  };

  const _handleOpenTimeModal = () => {
    setShowTimeOffModal(true);
  };
  useEffect(() => {
    fetchPayrolls(queryParams);
  }, [queryParams]);

  useEffect(() => {
    if (queryParams?.siteId?.value) {
      getLocationsOfSite(queryParams?.siteId?.value);
    }
  }, [queryParams?.siteId?.value]);

  // useEffect(() => {
  //   fetchAllSites();
  //   fetchAllOfficers();
  // }, []);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(data.filter((row) => !row.isApproved).map((row) => row.id));
      return;
    }
    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, id) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, id]);
      return; // Return early
    }
    setSelectedItems(selectedItems.filter((item) => item !== id));
  };

  const handleRowUpdate = async (index, key, value) => {
    const payload = {
      id: data[index].id,
      dataType: data[index].dataType,
      payableHours: data[index].payableHours,
      [key]: value,
    };
    await update([payload]);
  };

  const handleApprovePayroll = async () => {
    try {
      const payload = {
        id: selectedRow?.id,
        dataType: selectedRow?.dataType,
        isApproved: true,
        invoiceableHours: selectedRow?.invoiceableHours,
        payableHours: selectedRow?.payableHours,
        isBreakPayable: selectedRow?.isBreakPayable,
      };
      await update([payload]);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setSelectedRow(null);
      setShowSelectedHoursModal(false);
    }
  };

  const handleShiftApprove = async () => {
    await handleRowUpdate(shiftHoursModal, 'isApproved', true);
    setShiftHoursModal(-1);
  };

  const handleMultipleShiftApprove = async () => {
    if (selectedRow) {
      handleApprovePayroll();
    } else {
      const payload = data.filter(
        (payroll) => selectedItems.includes(payroll.id) && !payroll.isApproved,
      );
      await update(
        payload.map((payroll) => ({
          id: payroll.id,
          dataType: payroll.dataType,
          isApproved: true,
          invoiceableHours: payroll?.invoiceableHours,
          payableHours: payroll?.payableHours,
        })),
      );
      setShowSelectedHoursModal(false);
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const fetchPayrolls = async (queryParams) => {
    setLoading(true);
    try {
      const convertedDates = queryParams.selectedDates.length
        ? appendDefaultStartAndEndTimeWithDates(queryParams?.selectedDates)
        : [];

      const params = {
        officerId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams?.officerId, 'value'),
          'all',
        ),
        siteId: queryParams?.siteId?.value || '',
        locationId: queryParams?.locationId?.value || '',
        isApproved: queryParams?.isApproved?.value ?? '',
        windowStart: queryParams.selectedDates?.[0] ? convertedDates?.[0] : '',
        windowEnd: queryParams.selectedDates?.[1] ? convertedDates?.[1] : '',
      };
      const response = await getPayrolls(params);
      if (response && response?.statusCode === 200) {
        setData(response?.data?.payroll || []);
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

  const _fetchAllSites = async () => {
    try {
      const response = await getAllSites();

      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];
        setAllSites([{ value: '', label: 'All Sites' }, ...transformedSites]);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getLocationsOfSite = async (siteId) => {
    try {
      const response = await getSitesAllLocations(siteId);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        setSiteLocations([
          { label: 'All Locations', value: '' },
          ...transformArrayForOptions(locationsRes, 'name', 'id'),
        ]);
      }
    } catch (error) {
      setSiteLocations([]);
    }
  };

  const _fetchAllOfficers = async () => {
    try {
      const response = await getUsersWithDesiredType();
      if (response?.data?.statusCode === 200) {
        const transformedUsers = transformArrayForOptions(response?.data?.users, 'name', 'id');
        setAllOfficers([
          {
            value: 'all',
            label: 'All Officers',
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

  const update = async (payload) => {
    setIsUpdating(true);
    try {
      const response = await updatePayrolls(payload);
      if (response?.statusCode === 200) {
        const updatedPayrolls = response.data || [];
        setData((previousData) => {
          return previousData.map((payroll) => {
            const updatedPayroll = updatedPayrolls?.find((updated) => updated.id === payroll.id);
            return updatedPayroll || payroll;
          });
        });
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
    setIsUpdating(false);
  };

  const renderTableCell = (row, column, index) => {
    if (column.id === columnIdsEnum.action) {
      return (
        <>
          {
            <Box className={classes.actionButtons}>
              <Button
                disableRipple
                onClick={() => setOpenColaps(!openColaps)}
                className={classes.notesCloseBtn}
                variant="onlyText"
                startIcon={<BlueArrowIcon />}
              ></Button>
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.employeeName) {
      return (
        <>
          {
            <Box className={classes.employeeNameClass}>
              {row.officer.name.length > 20 ? (
                <Tooltip
                  title={<Box sx={{ textTransform: 'capitalize' }}>{row.officer.name}</Box>}
                  placement="right"
                  arrow
                >
                  {truncateString(row.officer.name, 20) || NA}
                </Tooltip>
              ) : (
                row.officer.name
              )}
              {row?.site?.id && row?.notes?.length ? <EmployIcon /> : ''}
              {/* {row?.notes?.length ? (
                <Button
                  onClick={() => setNotes(row.notes)}
                  variant="onlyText"
                  disableRipple
                  startIcon={<EmployIcon />}
                ></Button>
              ) : (
                ''
              )} */}
            </Box>
          }
        </>
      );
    }

    if (column.id === columnIdsEnum.invoiceableHours) {
      return (
        <>
          <TextFieldPopover
            disabled={row.isApproved || row?.dataType === 'attendance'}
            value={row.invoiceableHours}
            onSave={(time) => handleRowUpdate(index, 'invoiceableHours', time)}
            isLoading={isUpdating}
          />
        </>
      );
    }
    if (column.id === columnIdsEnum.approvedHours) {
      return (
        <>
          {
            <Box className={classes.inlineField}>
              <StartTimePopover
                disabled={row.isApproved}
                value={dayjsWithStandardOffset(row.approvedStartsAt)}
                onSave={(time) =>
                  handleRowUpdate(
                    index,
                    'approvedStartsAt',
                    dayjsWithStandardOffset(time).second(0),
                  )
                }
                isLoading={isUpdating}
              />
              <Typography className={classes.spaceer}>-</Typography>
              <StartTimePopover
                disabled={row.isApproved}
                value={dayjsWithStandardOffset(row.approvedEndsAt)}
                onSave={(time) =>
                  handleRowUpdate(index, 'approvedEndsAt', dayjsWithStandardOffset(time).second(0))
                }
                isLoading={isUpdating}
              />
              <Typography className={classes.hourValue}>({row.payableHours || 0}h)</Typography>
            </Box>
          }
        </>
      );
    }
    if (column.id === columnIdsEnum.site) {
      return <>{row?.[column.id]?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.location) {
      return <>{row?.[column.id]?.name || NA}</>;
    }
    if (column.id === columnIdsEnum.employeeType) {
      return <>{row?.officer.type || NA}</>;
    }
    if (column.id === columnIdsEnum.shiftDate) {
      return (
        <>{formatDayjsDateTime({ value: row?.startsAt, formatType: dayjsFormatsEnum.date })}</>
      );
    }
    if (column.id === columnIdsEnum.shiftTime) {
      return (
        <>{`${formatDayjsDateTime({ value: row?.startsAt, formatType: dayjsFormatsEnum.time })} 
        - ${formatDayjsDateTime({ value: row?.endsAt, formatType: dayjsFormatsEnum.time })}`}</>
      );
    }
    if (column.id === columnIdsEnum.hitPunchInOut) {
      return (
        <>{`${formatDayjsDateTime({ value: row?.checkin, formatType: dayjsFormatsEnum.time })} 
        - ${formatDayjsDateTime({ value: row?.checkout, formatType: dayjsFormatsEnum.time })} 
        (${row?.punchedHours || 0}h)`}</>
      );
    }
    if (column.id === columnIdsEnum.checkbox) {
      return (
        <>
          <Checkbox
            checked={selectedItems.includes(row.id)}
            onChange={(event) => handleCheckboxChange(event, row.id)}
            icon={row.isApproved ? <CheckboxDisabledIcon /> : <CheckBoxRegularIcon />}
            checkedIcon={row.isApproved ? <CheckBoxCheckedDisabledIcon /> : <CheckBoxCheckedIcon />}
            disableRipple
            className={classes.checkBoxCustom}
            disabled={row.isApproved}
          />
        </>
      );
    }
    if (column.id === columnIdsEnum.hourlyRate) {
      return <>{`$${row.hourlyRate}`}</>;
    }
    if (column.id === columnIdsEnum.adpBadgeNumber) {
      return (
        <>
          {row.adpBadgeNumber.length > 20 ? (
            <>
              <Tooltip title={row.adpBadgeNumber} placement="right" arrow>
                {truncateString(row.adpBadgeNumber, 20) || NA}
              </Tooltip>
            </>
          ) : (
            <>{truncateString(row.adpBadgeNumber, 20) || NA}</>
          )}
        </>
        // <Tooltip title={row.adpBadgeNumber} placement="right" arrow>
        //   {truncateString(row.adpBadgeNumber, 20) || NA}
        // </Tooltip>
      );
    }
    if (column.id === columnIdsEnum.isAdhocPayroll) {
      return (
        <>
          {row?.isAdhocPayroll ? (
            <Chip className={classes.adhocPayrollChip} label={t('obx.payroll.adhoc')} />
          ) : (
            <Chip color="primary" label={t('obx.payroll.logged')} />
          )}
        </>
      );
    }

    if (column.id === columnIdsEnum.isBreakPayable) {
      return <>{row?.[column.id] ? t('obx.payroll.payable') : t('obx.payroll.notPayable')}</>;
    }

    if (column.id === columnIdsEnum.breakTime || column.id === columnIdsEnum.totalHours) {
      return <>{row?.[column.id] ? row?.[column.id] : 0}</>;
    }

    if (row?.[column.id] === 0) {
      return <>{row?.[column.id]}</>;
    }

    return <>{row?.[column.id] || NA}</>;
  };

  const [orderState, setOrderState] = useState(order);
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
            <TableCell key={column.id} sortDirection={sortDirection(column)}>
              {column.sortable && (
                <TableSortLabel
                  active={orderState.orderBy === column.id}
                  direction={orderDirection(column)}
                  onClick={() => handleSort(column.id)}
                >
                  {column.label}
                </TableSortLabel>
              )}
              {column.id === 'checkbox' ? (
                <Checkbox
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
              ) : (
                `${column.label}`
              )}
            </TableCell>
          ))}
        </TableRow>
      </>
    );
  };

  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName.length} t={t} />
        {data.length > 0 &&
          data.map((row, index) => (
            <>
              <TableRow key={row.id}>
                {i18ColumnName.map((column) => {
                  const showHandCursor =
                    (column.id === columnIdsEnum.adpBadgeNumber ||
                      column.id === columnIdsEnum.employeeName) &&
                    row?.site?.id
                      ? 'pointer'
                      : '';
                  return (
                    <>
                      <TableCell
                        key={column.id}
                        onClick={() => gotoDetailPage(column, row)}
                        sx={{ cursor: showHandCursor }}
                        className={column.className}
                      >
                        {renderTableCell(row, column, index)}
                      </TableCell>
                    </>
                  );
                })}
              </TableRow>

              <TableRow>
                <Collapse in={openColaps} timeout="auto" unmountOnExit>
                  <InnerTablePayroll />
                </Collapse>
              </TableRow>
            </>
          ))}
      </>
    );
  };

  const _handleDateRange = (name, dates) => {
    const [startDate, endDate] = dates;
    if (
      startDate.isSame(queryParams.selectedDates[0]) &&
      endDate.isSame(queryParams.selectedDates[1])
    )
      return;
    const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    if (differenceInDays > 30) {
      setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
      return;
    }
    delete errors.selectedDates;
    setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const gotoDetailPage = (column, row) => {
    if (
      (column.id === columnIdsEnum.adpBadgeNumber || column.id === columnIdsEnum.employeeName) &&
      row?.site?.id
    ) {
      setSelectedRow({
        ...row,
        shiftActivityLogId: row?.id,
      });
      setOpenShiftSideDrawer(true);
    }
  };

  // const handleDelete = () => {};
  return (
    <>
      <Box className={classes.salesUserListingContainer}>
        <Box className={classes.tableWrapper}>
          <TableComponent
            data={stubbedData}
            columns={columns}
            tableHead={tableHead}
            tableBody={tableBody}
            pagination={false}
            applySorting={applySorting}
          />
        </Box>

        <SelectedShiftHours
          open={showSelectedHoursModal}
          loading={isUpdating}
          onClose={() => setShowSelectedHoursModal(false)}
          onSave={handleMultipleShiftApprove}
        />
        <ShiftHours
          open={shiftHoursModal > -1}
          onClose={() => setShiftHoursModal(-1)}
          onSave={handleShiftApprove}
          loading={isUpdating}
        />

        {modelState?.exportModel && (
          <ExportPayrollModel
            open={modelState?.exportModel}
            onClose={() => handleModelChange('exportModel', false)}
            refetchPayroll={() => fetchPayrolls(queryParams)}
          />
        )}

        <TimeOffModal
          open={showTimeOffModal}
          onClose={() => setShowTimeOffModal(false)}
          refetchPayroll={() => fetchPayrolls(queryParams)}
        />

        {openShiftSideDrawer && (
          <ShiftDetail
            isOpen={openShiftSideDrawer}
            drawerData={{
              shiftId: selectedRow?.id,
              shiftDate: selectedRow?.startsAt,
              shiftType: selectedRow?.shiftType,
              rest: selectedRow,
            }}
            closeDrawer={() => setOpenShiftSideDrawer(false)}
            setShowDrawer={setOpenShiftSideDrawer}
            readonly={true}
          />
        )}
      </Box>
    </>
  );
};
export default PayrollDetailsListing;
