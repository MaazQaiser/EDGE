import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Box,
  Button,
  Checkbox,
  TableCell,
  TableRow,
  TableSortLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import { ReactComponent as LockPayrunIcon } from 'assets/svg/LockPayrunIcon.svg?react';
import { ReactComponent as TickWhiteIcon } from 'assets/svg/TickWhiteIcon.svg?react';
import { ReactComponent as WhitePlusIcon } from 'assets/svg/WhitePlusIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import InfiniteScrollCustom from 'src/app/components/common/infiniteScrollCustom';
// import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import SideDrawer from 'src/app/components/common/sideDrawer';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import TableComponent from 'src/app/components/common/table';
import NoRecordFound from 'src/app/components/common/table/noRecordFound';
import AdHocApproveTimeDrawer from 'src/app/obx/pages/payroll/components/adHocApproveTimeDrawer';
import ExportPayrollModel from 'src/app/obx/pages/payroll/components/exportPayrollModel';
import {
  default as DutyDetail,
  default as ShiftDetail,
} from 'src/app/obx/pages/schedules/shiftDetail';
import { ACL_OBX_PAYROLL_CREATE, ACL_OBX_PAYROLL_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
// import { ReactComponent as EyeViewIcon } from 'src/assets/svg/EyeViewIcon.svg';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import {
  getPatrolPayroll,
  getPatrolPayrollFilters,
  getPayrolls,
  getSupervisorPayrolls,
  updatePayrollBreakStatus,
  updatePayrolls,
  updateSupervisorJobIntervals,
} from 'src/services/payroll.services';
import { getAllSites, getSitesAllLocations } from 'src/services/sites.services';
import { getUsersWithDesiredType } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { DRAWER_TYPE, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { toaster } from 'src/utils/toast';

import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
  getDateRangeWrtFranchiseTimezone,
} from '../../schedules/helper';
import AlignShiftHoursModal from '../components/alignShiftHoursModal';
import ApproveTimeDrawer from '../components/approveTimeDrawer';
import CreatePayrollDrawer from '../components/createPayrollDrawer';
import NotesModal from '../components/notesModal';
import RenderTableCell from '../components/renderTableCell';
import RunSheetPayrollDetailsDrawer from '../components/runSheetPayrollDetailsDrawer';
import SelectedShiftHours from '../components/selectedShiftHoursModal';
import ShiftHours from '../components/shiftHoursModal';
import TimeOffModal from '../components/timeOffModal';
// import TimePopover from '../components/timePopover';
import { useStyles } from './payrollListing';

export const PAYROLL_TYPES = {
  PATROL: 'patrol',
  DEDICATED: 'dedicated',
  SUPERVISOR: 'supervisor',
};

const SHIFT_DRAWER_INDICES = {
  DETAILS: 0,
  REPORTS: 1,
  NOTES: 2,
  LOGS: 3,
};

const checkBadgeCondition = (data) => {
  return data?.officer?.type === 'W2' || data?.officer?.type === 'W2Salary'
    ? data?.adpBadgeNumber.length > 5
    : data?.adpBadgeNumber.length > 7;
};
const i18ColumnName = (t, selectedTab, _classDealName, franchiseCurrency, getLabel) => {
  return [
    {
      id: 'checkbox',
      label: ``,
      notShow: !userHasPermission(ACL_OBX_PAYROLL_UPDATE),
    },
    {
      id: 'adpBadgeNumber',
      label: `${t('obx.payroll.badgeNo')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.PATROL
      ? [
          {
            id: 'name',
            label: `${t('obx.payroll.runSheetName', { runsheet: getLabel('terms', 'runsheet', t) })}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'employeeName',
      label: `${t('obx.payroll.employeeName')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'site',
            label: `${t('obx.payroll.sites')}`,
            sortable: false,
          },
          {
            id: 'location',
            label: `${t('obx.payroll.location')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'shiftDate',
      label: `${t('obx.payroll.shiftDate')}`,
      sortable: false,
    },
    ...(selectedTab !== PAYROLL_TYPES.SUPERVISOR
      ? [
          {
            id: 'shiftTime',
            label: `${t('obx.payroll.shiftTime')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'punchinOut',
      label: `${t('obx.payroll.punchinOut')}`,
      sortable: false,
    },
    ...(selectedTab !== PAYROLL_TYPES.SUPERVISOR
      ? [
          {
            id: 'totalHours',
            label: `${t('obx.payroll.timeSpentOnJob')}`,
            sortable: false,
          },
          {
            id: 'breakTime',
            label: `${t('obx.payroll.timeSpentOnBreak')}`,
            sortable: false,
          },
          {
            id: 'breakTimeNonPayable',

            label: `${t('obx.payroll.timeSpentOnBreakNotPayable')}`,
            sortable: false,
          },
        ]
      : []),
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'jobWage',
            label: `${t('obx.payroll.wageOverride')} (${franchiseCurrency})`,
          },
        ]
      : []),
    ...(selectedTab === PAYROLL_TYPES.PATROL
      ? [
          {
            id: 'hitsDone',
            label: `${t('obx.payroll.hitsDone', { hits: getLabel('terms', 'hits', t) })}`,
            sortable: false,
          },
          {
            id: 'jobWage',
            label: `${t('obx.payroll.wageOverride')} (${franchiseCurrency})`,
          },
        ]
      : []),
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'isAdhocPayroll',
            label: `${t('obx.payroll.type')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'approvedHours',
      label: `${t('obx.payroll.approvedHours')}`,
      sortable: false,
    },
    ...(selectedTab === PAYROLL_TYPES.DEDICATED
      ? [
          {
            id: 'invoiceableHours',
            label: `${t('obx.payroll.invoiceAbleHours')}`,
            sortable: false,
          },
        ]
      : []),
    {
      id: 'action',
      label: ``,
      sortable: false,
    },
  ];
};

const statusFilterOptions = (t) => [
  { value: undefined, label: t('obx.payroll.statusFilter.payrollStatuses') },
  { value: true, label: t('obx.payroll.statusFilter.approved') },
  { value: false, label: t('obx.payroll.statusFilter.unapproved') },
];

const shiftStatusFilterOptions = (t) => [
  { value: undefined, label: t('obx.payroll.statusFilter.allShiftStatuses') },
  { value: 'completed', label: t('obx.payroll.statusFilter.completed') },
  { value: 'unassigned', label: t('obx.payroll.statusFilter.unassigned') },
  { value: 'notStarted', label: t('obx.payroll.statusFilter.notStarted') },
];

const shiftStatusesEnum = {
  COMPLETED: 'completed',
  UNASSIGNED: 'unassigned',
  NOT_STARTED: 'notStarted',
};

const today = dayjsWithStandardOffset().startOf('day');

// const lastMonth = dayjsWithStandardOffset().subtract(1, 'month').endOf('day');

const threeDaysBefore = dayjsWithStandardOffset().subtract(3, 'day');

// Value for pagination (infinite scroll) on payroll listing
const INFINITE_SCROLL_VALUES = {
  INITIAL_RENDER: 15,
};

const params = (t) => ({
  search: '',
  sortBy: '',
  orderBy: '',
  selectedDates: [threeDaysBefore, today],
  officerId: [],
  siteIds: {},
  locationId: {},
  runsheetIds: [],
  isApproved: { value: undefined, label: t('obx.payroll.statusFilter.payrollStatuses') },
  shiftStatus: { value: 'completed', label: t('obx.payroll.statusFilter.completed') },
  page: 1,
  perPage: INFINITE_SCROLL_VALUES.INITIAL_RENDER,
  // more filters
});

const order = {
  orderBy: 'id',
  orderType: 'asc',
};

export const columnIdsEnum = {
  checkbox: 'checkbox',
  action: 'action',
  invoiceableHours: 'invoiceableHours',
  jobWage: 'jobWage',
  approvedHours: 'approvedHours',
  employeeName: 'employeeName',
  isAdhocPayroll: 'isAdhocPayroll',
  employeeType: 'employeeType',
  site: 'site',
  punchinOut: 'punchinOut',
  shiftDate: 'shiftDate',
  shiftTime: 'shiftTime',
  hourlyRate: 'hourlyRate',
  adpBadgeNumber: 'adpBadgeNumber',
  location: 'location',

  breakTime: 'breakTime',
  breakTimeNonPayable: 'breakTimeNonPayable',
  totalHours: 'totalHours',
  hitsDone: 'hitsDone',
  name: 'name',
};

const Payroll = ({ selectedDates, exportModal, setExportModal }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const { getNewApiController } = useApiControllers();
  const classDealName = classes.locationTD;
  const [selectedTab, setSelectedTab] = useState(PAYROLL_TYPES.DEDICATED);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  const { currency: franchiseCurrency } = useCurrency();
  const columns = i18ColumnName(t, selectedTab, classDealName, franchiseCurrency, getLabel).filter(
    (a) => !a.notShow,
  );
  // const userRole = useSelector((state) => state.auth.userRole);
  const [showSelectedHoursModal, setShowSelectedHoursModal] = useState(false);
  const [shiftHoursModal, setShiftHoursModal] = useState(-1);
  const [notes, setNotes] = useState(null);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showDrawerHours, setShowDrawerHours] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [queryParams, setQueryParams] = useState(params(t));
  const [selectAll, setSelectAll] = useState(false);
  const [runsheetOptions, setRunsheetOptions] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [siteLocations, setSiteLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [showPayrollDrawer, setShowPayrollDrawer] = useState(false);
  const [lastElement, setLastElement] = useState(null);

  const [shiftData, setShiftData] = useState(null);
  const [showDedicatedDetailsDrawer, setShowDedicatedDetailsDrawer] = useState(false);
  const [openShiftSideDrawer, setOpenShiftSideDrawer] = useState(false);
  const [paginationStats, setPaginationStats] = useState(null);
  const [addingMoreData, setAddingMoreData] = useState(false);
  const [showAlignModal, setShowAlignModal] = useState(false);

  const handleOpenPayrollDrawer = () => {
    setShowPayrollDrawer(true);
  };
  const handleSelection = (event, newSelection) => {
    if (newSelection !== null) {
      setLoading(true);
      setData([]);
      setSelectAll(false);
      setSelectedItems([]);
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
      }));
      setSelectedTab(newSelection);
    }
  };

  const _handleShiftHourModal = (row) => {
    setShowSelectedHoursModal(true);
    setSelectedRow(row);
  };

  const handleOpenTimeModal = () => {
    setShowTimeOffModal(true);
  };

  useEffect(() => {
    if (queryParams?.siteIds?.value != 'all') {
      getLocationsOfSite(queryParams?.siteIds?.value);
    }
  }, [queryParams?.siteIds?.value]);

  useEffect(() => {
    if (!allOfficers.length) fetchAllOfficers();
    if (selectedTab === PAYROLL_TYPES.DEDICATED && !allSites.length) fetchAllSites();
    if (selectedTab === PAYROLL_TYPES.PATROL && !runsheetOptions.length) fetchAllRunsheets();
  }, [selectedTab]);

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedItems(
        data
          .filter((row) => !row?.isApproved && row?.officer?.id && checkBadgeCondition(row))
          .map((row) => row?.id),
      );
      return;
    }
    setSelectedItems([]);
  };

  const handleCheckboxChange = (event, row) => {
    if (!row?.adpBadgeNumber) return;
    if (event.target.checked) {
      setSelectedItems([...selectedItems, row?.id]);
      return; // Return early
    }
    setSelectedItems(selectedItems.filter((item) => item !== row?.id));
  };

  const handleRowUpdate = async (index, key, value) => {
    const payload = {
      id: data[index].id,
      dataType: data[index].dataType,
      payableHours: data[index].payableHours,
      [key]: value,
      isApproved: false,
      // approvedStartsAt: data?.[index]?.approvedStartsAt,
      // approvedEndsAt: data?.[index]?.approvedEndsAt,
    };
    if (selectedTab === PAYROLL_TYPES.PATROL) payload.isPatrol = true;
    await update([payload]);
  };

  const _handleApprovedHoursUpdate = async (index, startTime, endTime, noApprovedHours) => {
    if (isObjectEmpty(startTime) && isObjectEmpty(endTime)) return;

    const payload = {
      id: data[index].id,
      dataType: data[index].dataType,
      payableHours: data[index].payableHours,
      isApproved: false,
      noApprovedHours,
    };

    if (!isObjectEmpty(startTime) && !noApprovedHours)
      payload.approvedStartsAt = dayjsWithStandardOffset(startTime).second(0);
    if (!isObjectEmpty(endTime) && !noApprovedHours)
      payload.approvedEndsAt = dayjsWithStandardOffset(endTime).second(0);
    if (noApprovedHours) {
      payload.payableHours = 0;
    }

    if (selectedTab === PAYROLL_TYPES.PATROL) payload.isPatrol = true;

    await update([payload]);
  };

  const getLocationsOfSite = async (siteIds) => {
    try {
      const response = await getSitesAllLocations(siteIds);

      if (response?.statusCode === 200) {
        const locationsRes = response?.data?.locations || [];

        if (locationsRes?.length) {
          setSiteLocations([
            { label: 'All Locations', value: '' },
            ...transformArrayForOptions(locationsRes, 'name', 'id'),
          ]);
        } else {
          setSiteLocations([]);
        }
      }
    } catch (error) {
      setSiteLocations([]);
    }
  };

  const handleShiftApprove = async () => {
    await handleRowUpdate(shiftHoursModal, 'isApproved', true);
    setShiftHoursModal(-1);
  };

  const handleMultipleShiftApprove = async () => {
    if (!selectedRow) {
      const payload = data.filter(
        (payroll) =>
          selectedItems.includes(payroll.id) &&
          !payroll.isApproved &&
          payroll?.adpBadgeNumber &&
          checkBadgeCondition(payroll),
      );
      await update(
        payload.map((payroll) => ({
          id: payroll.id,
          dataType: payroll.dataType,
          isApproved: true,
          invoiceableHours: payroll?.invoiceableHours,
          payableHours: payroll?.payableHours,
          jobWage: payroll?.jobWage?.toString(),
          jobIntervals: payroll?.jobIntervals,
          approvedDutyIntervals: payroll?.jobIntervals,

          // approvedStartsAt: payroll?.approvedStartsAt,
          // approvedEndsAt: payroll?.approvedEndsAt,
        })),
      );
      setShowSelectedHoursModal(false);
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const fetchPayrolls = async () => {
    const apiFunction =
      selectedTab === PAYROLL_TYPES.PATROL
        ? getPatrolPayroll
        : selectedTab === PAYROLL_TYPES.DEDICATED
          ? getPayrolls
          : selectedTab === PAYROLL_TYPES.SUPERVISOR
            ? getSupervisorPayrolls
            : () => {};
    if (!data?.length) setLoading(true);
    const apiController = getNewApiController();
    try {
      const { startDate: windowStartDateWrtFranchise, endDate: windowEndDateWrtFranchise } =
        getDateRangeWrtFranchiseTimezone(selectedDates);

      const commonParams = {
        isApproved: queryParams?.isApproved?.value ?? '',
        windowStart: windowStartDateWrtFranchise,
        windowEnd: windowEndDateWrtFranchise,
        shiftStatus: queryParams?.shiftStatus?.value || '',
        page: queryParams?.page || 1,
        perPage: queryParams?.perPage,
        officerId:
          queryParams?.shiftStatus?.value !== shiftStatusesEnum.UNASSIGNED
            ? removeAllFromSelected(
                extractValuesByKeyFromInput(queryParams?.officerId, 'value'),
                'all',
              )
            : [],
      };

      const params = {
        ...commonParams,
        ...(selectedTab === PAYROLL_TYPES.DEDICATED
          ? {
              siteId: queryParams?.siteIds?.value != 'all' ? [queryParams?.siteIds?.value] : [],
              locationId: queryParams?.locationId?.value || '',
            }
          : {}),
        ...(selectedTab === PAYROLL_TYPES.PATROL || selectedTab === PAYROLL_TYPES.SUPERVISOR
          ? {
              runsheetIds: queryParams?.runsheetIds.map((runsheetOption) => runsheetOption?.id),
            }
          : {}),
      };

      const response = await apiFunction(params, {
        signal: apiController.signal,
      });
      if (response && response?.statusCode === 200) {
        setData([...data, ...response.data.payroll]);
        setPaginationStats(response?.data?.pagination);
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } finally {
      setAddingMoreData(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [selectedTab, queryParams]);

  useEffect(() => {
    setData([]);
    setQueryParams((prev) => ({ ...prev, page: 1 }));
  }, [selectedDates]);

  const fetchAllSites = async () => {
    try {
      const response = await getAllSites();

      if (response?.statusCode === 200) {
        let transformedSites = transformArrayForOptions(response?.data?.sites, 'name', 'id') || [];
        setAllSites([
          { value: t('obx.payroll.all'), label: t('obx.payroll.allSites') },
          ...transformedSites,
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

  const fetchAllRunsheets = async () => {
    try {
      const response = await getPatrolPayrollFilters();
      if (response && response?.statusCode === 200) {
        let transformedRunsheets =
          transformArrayForOptions(response?.data?.runsheets, 'name', 'id') || [];
        setRunsheetOptions([
          {
            label: t('obx.payroll.allRunsheets', {
              runsheets: getLabel('terms', 'runsheets', t),
            }),
            value: t('obx.payroll.all'),
          },
          ...transformedRunsheets,
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

  const handleBulkAlignToShiftHours = async () => {
    if (!selectedItems.length) return;

    try {
      setIsUpdating(true);
      const alignedPayrolls = [];

      for (const id of selectedItems) {
        const row = data.find((item) => item.id === id);
        if (!row) continue;
        if (!row?.startsAt || !row?.endsAt) continue;
        if (row?.isApproved) continue;

        const payload = {
          aprrovedDutyIntervals: [
            {
              action: 'jobExecuted',
              start: dayjsWithStandardOffset(row?.startsAt)
                ?.set('second', 0)
                ?.set('millisecond', 0),
              end: dayjsWithStandardOffset(row?.endsAt)?.set('second', 0)?.set('millisecond', 0),
            },
          ],
          noApprovedHours: false,
        };

        const isSupervisorTab = selectedTab === PAYROLL_TYPES.SUPERVISOR;
        const apiCall = isSupervisorTab ? updateSupervisorJobIntervals : updatePayrollBreakStatus;

        const response = await apiCall(row?.id, payload);

        if (response && response?.statusCode === 200) {
          alignedPayrolls.push(response.data);
        }
      }

      if (alignedPayrolls.length) {
        setData((previousData) =>
          previousData.map((payroll) => {
            const updatedPayroll = alignedPayrolls.find((updated) => updated.id === payroll.id);
            return updatedPayroll
              ? {
                  ...payroll,
                  ...updatedPayroll,
                  payableHours: updatedPayroll.totalHours ?? updatedPayroll.payableHours,
                }
              : payroll;
          }),
        );

        toaster.success({
          text: t('obx.payroll.alignApprovedHoursSuccess'),
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
    } finally {
      setIsUpdating(false);
      setShowAlignModal(false);
      setSelectedItems([]);
      setSelectAll(false);
    }
  };

  const refreshTableData = () => {
    setShowDrawerHours(false);
    setLoading(true);
    setData([]);
    setSelectAll(false);
    setSelectedItems([]);
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
    }));
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
      page: 1,
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
              key={column.id}
              sortDirection={sortDirection(column)}
              data-column-id={column.id}
            >
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

  const scrollBody = (i18ColumnName) => {
    return (
      <>
        {data?.length > 0 &&
          !loading &&
          data.map((row, index) => {
            const isLastElement = index === data?.length - 1 && !loading;
            return (
              <Tooltip
                title={
                  !row?.officer?.id &&
                  t('obx.payroll.noOfficerTooltip', {
                    officer: getLabel('terms', 'officer', t)?.toLowerCase(),
                  })
                }
                followCursor
                key={row?.id}
              >
                <TableRow
                  key={row?.id}
                  ref={isLastElement ? setLastElement : null}
                  className={`${!row?.officer?.id ? classes.disabledRecord : ''}`}
                >
                  {i18ColumnName.map((column) => {
                    const isAdpBadgeColumn = column.id === columnIdsEnum.adpBadgeNumber;
                    const isEmployeeColumn = column.id === columnIdsEnum.employeeName;
                    const isRunsheetNameColumn = column.id === columnIdsEnum.name;
                    const dedicatedPayrollColumn =
                      selectedTab === PAYROLL_TYPES.DEDICATED &&
                      row?.site?.id &&
                      (isAdpBadgeColumn || isEmployeeColumn);
                    const patrolPayrollColumn =
                      selectedTab === PAYROLL_TYPES.PATROL &&
                      (isAdpBadgeColumn || isRunsheetNameColumn);
                    const showHandCursor =
                      dedicatedPayrollColumn || patrolPayrollColumn ? 'pointer' : '';
                    return (
                      <TableCell
                        key={column.id}
                        onClick={() => row?.officer?.id && gotoDetailPage(column, row)}
                        sx={{ cursor: showHandCursor }}
                        className={column.className}
                        data-column-id={column.id}
                      >
                        <RenderTableCell
                          row={row}
                          column={column}
                          index={index}
                          handleCheckboxChange={handleCheckboxChange}
                          selectedItems={selectedItems}
                          handleRowUpdate={handleRowUpdate}
                          checkBadgeCondition={checkBadgeCondition}
                          isUpdating={isUpdating}
                          handleViewSchedule={handleViewSchedule}
                          setShowDrawerHours={setShowDrawerHours}
                          setSelectedRow={setSelectedRow}
                          selectedTab={selectedTab}
                          setShowSelectedHoursModal={setShowSelectedHoursModal}
                          update={update}
                        />

                        {/* {renderTableCell(row, column, index)} */}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </Tooltip>
            );
          })}
      </>
    );
  };

  const getMoreData = () => {
    if (paginationStats?.nextPage) {
      setAddingMoreData(true);
      setQueryParams((prev) => ({
        ...prev,
        page: paginationStats?.nextPage,
      }));
    }
  };

  const tableBody = (data, i18ColumnName) => {
    return loading ? (
      <TableSkeleton columns={i18ColumnName} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={i18ColumnName?.length} t={t} />
        <InfiniteScrollCustom
          totalNoOfRecords={data?.length}
          noOfRecordsBeingDisplayed={data?.length}
          lastElement={lastElement}
          body={() => scrollBody(i18ColumnName)}
          getMoreData={getMoreData}
        />
        {addingMoreData && <TableSkeleton columns={i18ColumnName} />}

        {/* {data.length > 0 &&
          data.map((row, index) => (
            <Tooltip
              title={!row?.officer?.id && t('obx.payroll.noOfficerTooltip')}
              arrow
              key={row?.id}
            >
              <TableRow
                key={row?.id}
                className={`${!row?.officer?.id ? classes.disabledRecord : ''}`}
              >
                {i18ColumnName.map((column) => {
                  const showHandCursor =
                    (column.id === columnIdsEnum.adpBadgeNumber ||
                      column.id === columnIdsEnum.employeeName) &&
                    row?.site?.id
                      ? 'pointer'
                      : '';
                  return (
                    <TableCell
                      key={column.id}
                      onClick={() => row?.officer?.id && gotoDetailPage(column, row)}
                      sx={{ cursor: showHandCursor }}
                      className={column.className}
                    >
                      {renderTableCell(row, column, index)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </Tooltip>
          ))} */}
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
    // const differenceInDays = Math.abs(startDate?.diff(endDate, 'day')) || null;
    // if (differenceInDays > 30) {
    //   setErrors({ ...errors, selectedDates: 'You can select maximum 30 days data' });
    //   console.log(queryParams?.selectedDates);
    //   updateFormHandler(name, queryParams?.selectedDates);
    //   return;
    // }

    if (startDate) {
      setMinMaxDates({
        min: dayjsWithStandardOffset(startDate).subtract(1, 'month').startOf('day'),
        max: dayjsWithStandardOffset(startDate).add(1, 'month').endOf('day'),
      });
    }
    delete errors.selectedDates;
    setErrors({ ...errors });
    updateFormHandler(name, dates);
  };

  const updateFormHandler = (name, value) => {
    setData([]);
    setQueryParams((prevState) => {
      return {
        ...prevState,
        [name]: value,
        page: 1,
      };
    });
  };

  const resetPage = () => {
    setData([]);
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: 1,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value

    const { name, value } = event.target;

    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, row) => {
    const isAdpBadgeColumn = column.id === columnIdsEnum.adpBadgeNumber;
    const isEmployeeColumn = column.id === columnIdsEnum.employeeName;
    const isRunsheetNameColumn = column.id === columnIdsEnum.name;
    const dedicatedPayrollColumn =
      selectedTab === PAYROLL_TYPES.DEDICATED &&
      row?.site?.id &&
      (isAdpBadgeColumn || isEmployeeColumn);
    const patrolPayrollColumn =
      selectedTab === PAYROLL_TYPES.PATROL && (isAdpBadgeColumn || isRunsheetNameColumn);

    if (dedicatedPayrollColumn) {
      setSelectedRow({
        ...row,
        shiftActivityLogId: row?.id,
        activeIndex: SHIFT_DRAWER_INDICES.DETAILS,
      });
      setOpenShiftSideDrawer(true);
    }

    if (patrolPayrollColumn) {
      handleViewSchedule(row);
    }
  };

  const showSideDrawerHandler = ({ requiresAttention, id, shiftId, ...rest }) => {
    // open assign duty side drawer
    let open = undefined;
    let activeIndex = rest?.activeIndex || 0;

    if (
      requiresAttention &&
      [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(rest?.shiftType)
    ) {
      if (getCurrentStandardTimeInIsoWrtTimezone() >= rest?.endsAt) {
        open = DRAWER_TYPE.DETAIL;
        activeIndex = 2;
      } else {
        open = DRAWER_TYPE.ASSIGN;
      }
    } else {
      open = DRAWER_TYPE.DETAIL;
    }

    setShowDrawer({
      open: open,
      data: { id, shiftId, ...rest },
      activeIndex: activeIndex,
    });
  };

  const handleViewSchedule = (row, isNotes = false) => {
    if (selectedTab === PAYROLL_TYPES.DEDICATED) {
      if (!row?.shiftId) return;
      setShiftData((prev) => ({
        ...prev,
        shiftId: row?.id,
        shiftDate: row?.startsAt,
        activeIndex: isNotes ? SHIFT_DRAWER_INDICES.NOTES : SHIFT_DRAWER_INDICES.DETAILS,
        shiftActivityLogId: row?.shiftActivityLogId,
      }));
      setShowDedicatedDetailsDrawer(true);
      return;
    }
    showSideDrawerHandler({
      id: row?.shiftId,
      shiftId: row?.shiftId,
      shiftType: row?.shiftType,
      startsAt: row?.startsAt,
      // runsheetId: row?.id,
      endsAt: row?.endsAt,
      shiftDate: row?.startsAt,
      shiftActivityLogId: row?.shiftActivityLogId,
      rest: row,
      activeIndex: isNotes ? SHIFT_DRAWER_INDICES.NOTES : SHIFT_DRAWER_INDICES.DETAILS,
    });
  };

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };

  // const handleDelete = () => {};
  return (
    <>
      <Box className={classes.salesUserListingContainer}>
        <Box className={classes.searchSectionDashboard}>
          <Box className={classes.searchSection}>
            <ToggleButtonGroup
              value={selectedTab}
              className={classes.statesButtons}
              exclusive
              onChange={handleSelection}
              aria-label="toggle button tabs"
            >
              <ToggleButton
                value={PAYROLL_TYPES.DEDICATED}
                aria-label="tab 1"
                className={classes.firstButton}
              >
                {getLabel('terms', 'dedicated', t)}
              </ToggleButton>
              <ToggleButton
                value={PAYROLL_TYPES.PATROL}
                aria-label="tab 2"
                className={classes.centerButton}
              >
                {getLabel('terms', 'patrol', t)}
              </ToggleButton>
              <ToggleButton
                value={PAYROLL_TYPES.SUPERVISOR}
                aria-label="tab 3"
                className={classes.lastButton}
              >
                {getLabel('roles', 'supervisor', t)}
              </ToggleButton>
            </ToggleButtonGroup>
            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('obx.payroll.users')}
                name="officerId"
                searchable
                checkmark={true}
                options={allOfficers}
                selectedValues={queryParams.officerId}
                handleChange={inputChangedHandler}
                clearAll
                disabled={queryParams.shiftStatus.value === shiftStatusesEnum.UNASSIGNED}
                multiSelect={true}
                withTiles={true}
              />
            </Box>
            {selectedTab === PAYROLL_TYPES.DEDICATED && (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.allSites')}
                  name="siteIds"
                  searchable
                  options={allSites}
                  selectedValues={queryParams.siteIds || {}}
                  handleChange={inputChangedHandler}
                  clearAll
                />
              </Box>
            )}
            {selectedTab === PAYROLL_TYPES.PATROL && (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.allRunsheets', {
                    runsheets: getLabel('terms', 'runsheets', t),
                  })}
                  name="runsheetIds"
                  searchable
                  options={runsheetOptions}
                  selectedValues={queryParams.runsheetIds}
                  handleChange={inputChangedHandler}
                  clearAll
                  disabled={false}
                  multiSelect={true}
                  withTiles={true}
                  checkmark={true}
                />
              </Box>
            )}

            {selectedTab === PAYROLL_TYPES.DEDICATED && (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.schedules.filters.locations.all')}
                  name="locationId"
                  options={siteLocations}
                  selectedValues={queryParams.locationId}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('obx.schedules.filters.locations.searchPlaceholder')}
                  searchable
                />
              </Box>
            )}

            <Box className={classes.dropdownCommonSection}>
              <CustomDropDown
                label={t('obx.payroll.statusFilter.payrollStatuses')}
                name="isApproved"
                options={statusFilterOptions(t)}
                selectedValues={queryParams.isApproved}
                handleChange={inputChangedHandler}
                multiSelect={false}
                checkmark={false}
                searchable={false}
                withTiles={true}
              />
            </Box>
            {selectedTab !== PAYROLL_TYPES.SUPERVISOR && (
              <Box className={classes.dropdownCommonSection}>
                <CustomDropDown
                  label={t('obx.payroll.statusFilter.allShiftStatuses')}
                  name={'shiftStatus'}
                  options={shiftStatusFilterOptions(t)}
                  selectedValues={queryParams.shiftStatus || {}}
                  handleChange={inputChangedHandler}
                  multiSelect={false}
                  checkmark={false}
                  searchable={false}
                  withTiles={true}
                />
              </Box>
            )}
          </Box>
          <Box className={classes.userSection}>
            <RenderIfHasPermission name={ACL_OBX_PAYROLL_UPDATE}>
              <Button
                variant="secondaryGrey"
                startIcon={<LockPayrunIcon />}
                onClick={handleOpenTimeModal}
              >
                {`${t('obx.payroll.lockPayrun')}`}
              </Button>
            </RenderIfHasPermission>
            {selectedItems?.length ? (
              <RenderIfHasPermission name={ACL_OBX_PAYROLL_UPDATE}>
                <>
                  <Button
                    variant="textOnly"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => setShowAlignModal(true)}
                    disabled={isUpdating}
                    className={classes.alignToShiftHoursButton}
                  >
                    {t('obx.payroll.alignToShiftHours')}
                  </Button>
                  <Button
                    variant="primary"
                    startIcon={<TickWhiteIcon />}
                    onClick={() => setShowSelectedHoursModal(true)}
                  >
                    {`${t('obx.payroll.approvedLockPayroll')}`}
                  </Button>
                </>
              </RenderIfHasPermission>
            ) : (
              ''
            )}
            {(selectedTab === PAYROLL_TYPES.DEDICATED || selectedTab === PAYROLL_TYPES.PATROL) && (
              <RenderIfHasPermission name={ACL_OBX_PAYROLL_CREATE}>
                <Button
                  variant="primary"
                  startIcon={<WhitePlusIcon />}
                  onClick={handleOpenPayrollDrawer}
                >
                  {`${t('obx.payroll.createPayroll')}`}
                </Button>
              </RenderIfHasPermission>
            )}
          </Box>
        </Box>

        <>
          <Box
            className={`${
              selectedTab === PAYROLL_TYPES.SUPERVISOR
                ? classes.tableWrapperSupervisor
                : selectedTab === PAYROLL_TYPES.PATROL
                  ? classes.tableWrapperPatrol
                  : classes.tableWrapper
            } ${!userHasPermission(ACL_OBX_PAYROLL_UPDATE) ? classes.tableWrapperNoCheckbox : ''}`}
          >
            <TableComponent
              data={data}
              columns={columns}
              tableHead={tableHead}
              tableBody={tableBody}
              pagination={false}
              applySorting={applySorting}
            />
          </Box>
        </>

        <SelectedShiftHours
          open={showSelectedHoursModal}
          loading={isUpdating}
          onClose={() => setShowSelectedHoursModal(false)}
          onSave={handleMultipleShiftApprove}
        />
        <AlignShiftHoursModal
          open={!!showAlignModal}
          loading={isUpdating}
          onClose={() => setShowAlignModal(false)}
          onSave={handleBulkAlignToShiftHours}
          count={selectedItems.length}
        />
        <ShiftHours
          open={shiftHoursModal > -1}
          onClose={() => setShiftHoursModal(-1)}
          onSave={handleShiftApprove}
          loading={isUpdating}
        />
        <NotesModal open={!!notes} notes={notes} onClose={() => setNotes(null)} />

        {exportModal && (
          <ExportPayrollModel
            open={exportModal}
            onClose={() => setExportModal(false)}
            refetchPayroll={() => resetPage()}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        )}

        <TimeOffModal
          open={showTimeOffModal}
          onClose={() => setShowTimeOffModal(false)}
          refetchPayroll={() => resetPage()}
          isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
        />

        {showDrawer?.open === DRAWER_TYPE.DETAIL && (
          <ShiftDetail
            {...{
              isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
              hideButtons: true,
              drawerData: {
                shiftId: showDrawer?.data?.id,
                shiftType: showDrawer?.data?.shiftType,
                shiftDate: showDrawer?.data?.startsAt,
                startsAt: showDrawer?.data?.startsAt,
                endsAt: showDrawer?.data?.endsAt,
                runsheetId: showDrawer?.data?.runsheetId,
                shiftActivityLogId: showDrawer?.data?.shiftActivityLogId,
                rest: showDrawer.data,
              },
              activeIndex: showDrawer?.activeIndex,
              closeDrawer: showSideDrawer(''),
              setShowDrawer,
              // setAllDuties,
              // getAllDuties: () => getAllDutiesData(queryParams.filter, queryParams.selectedView),
            }}
          />
        )}

        <SideDrawer isOpen={showPayrollDrawer} totalWidth="1000px">
          <CreatePayrollDrawer
            setShowDrawer={setShowPayrollDrawer}
            refreshData={() => {
              resetPage();
            }}
            isPatrol={selectedTab === PAYROLL_TYPES.PATROL}
          />
        </SideDrawer>
        <SideDrawer
          isOpen={showDetailsDrawer}
          totalWidth={'1261px'}
          className={classes.sideDrawerHeight}
        >
          <RunSheetPayrollDetailsDrawer
            showDrawer={showDetailsDrawer}
            setShowDrawer={setShowDetailsDrawer}
          />
        </SideDrawer>
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
            activeIndex={selectedRow?.activeIndex || SHIFT_DRAWER_INDICES.DETAIL}
          />
        )}
        {showDedicatedDetailsDrawer && (
          <DutyDetail
            isOpen={showDedicatedDetailsDrawer}
            drawerData={shiftData}
            closeDrawer={() => setShowDedicatedDetailsDrawer(false)}
            setShowDrawer={() => setShowDedicatedDetailsDrawer(true)}
            getAllDuties={() => {}}
            activeIndex={shiftData?.activeIndex}
          />
        )}
      </Box>
      {showDrawerHours && !isObjectEmpty(selectedRow) ? (
        <SideDrawer isOpen={showDrawerHours} totalWidth={'900px'}>
          {selectedRow?.jobIntervals?.length > 0 ? (
            <ApproveTimeDrawer
              showDrawer={showDrawerHours}
              setShowDrawer={setShowDrawerHours}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              refreshTableData={refreshTableData}
              isSupervisorTab={selectedTab === PAYROLL_TYPES.SUPERVISOR}
              data={data}
              setData={setData}
            />
          ) : (
            <AdHocApproveTimeDrawer
              showDrawer={showDrawerHours}
              setShowDrawer={setShowDrawerHours}
              setSelectedRow={setSelectedRow}
              selectedRow={selectedRow}
              refreshTableData={refreshTableData}
            />
          )}
        </SideDrawer>
      ) : null}
    </>
  );
};
export default Payroll;

Payroll.propTypes = {
  selectedDates: PropTypes.array,
  exportModal: PropTypes.bool,
  setExportModal: PropTypes.func,
};

Payroll.defaultProps = {
  selectedDates: [],
  exportModal: false,
  setExportModal: () => {},
};
