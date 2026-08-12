import { ArrowDropDown } from '@mui/icons-material';
import { Box, Button, Skeleton, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import {
  allDutyData,
  allMonthDutyData,
  getDutySummaryStats,
  getMissedHitsCount,
} from 'services/duty.services';
import StyledMenuButton from 'src/app/components/common/styledMenuButton';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import HarmonizeDrawer from 'src/app/obx/pages/schedules/components/harmonizeDrawer';
import { ACL_OBX_SITE_EXTRA_JOB_CREATE } from 'src/app/router/constant/OBXMODULE';
import {
  HO_SITES_DETAIL,
  OBX_SCHEDULES_CREATE_EXTRA_DUTY,
  OBX_SITES,
  OBX_SITES_CREATE_EXTRA_DUTY,
  OBX_USER,
  OBX_USERS_CREATE_EXTRA_DUTY,
} from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { AddBlueIcon, AlertIcon, ForecastTrendIcon } from 'src/assets/svg';
import { ReactComponent as FilterFunnelIcon } from 'src/assets/svg/morefilter.svg';
import { useApiControllers } from 'src/helper/axios';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { getAllSites } from 'src/services/sites.services';
import { getVisitorsLoadsOfficersOptions } from 'src/services/visitorsLoads.service';
import sortByLabelAsc from 'src/utils/array/sortByLabelAsc';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import {
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
  DRAWER_TYPE,
  SCHEDULE_DUTIES,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { throwAPIError } from 'src/utils/throwAPIError';
import { toaster } from 'src/utils/toast';

import SuppliesForecastingDrawer from '../../../../components/obxComponents/suppliesForecasting';
import AssignmentSideDrawer from '../../sites/detail/components/jobs/assignmentSideDrawer';
import ScheduleCalendarFilters from '../components/scheduleCalendarFilters';
import ScheduleErrorBoundary from '../components/scheduleErrorBoundary';
import {
  EMBEDDED_SCHEDULE_TAB_ID,
  getOverviewSections,
  getScheduleHeaderTabs,
  getScheduleTabConfig,
  VISITS_SCHEDULE_TAB_ID,
} from '../config/scheduleTabConfigs';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
  getFranchiseIdWithRoleAndSource,
  getOffsetWithStandardTime,
  getTimezone,
  isShiftScheduleFullyCancelled,
} from '../helper';
import {
  buildOfficerFromAssignResult,
  updateCalendarShiftOfficerById,
} from '../helper/patchShiftOfficerAssignment';
import {
  buildOverviewFooterStats,
  mapGridV2OverviewSections,
  mapGridV2WeekData,
  mapWeekRowsToCalendarResources,
} from '../helper/scheduleResponseAdapter';
import { useCanViewSummaryStats } from '../hooks/useCanViewSummaryStats';
import { useSiteLocations } from '../hooks/useSiteLocations';
import ShiftDetail from '../shiftDetail';
import DedicatedSplitShift from '../shiftDetail/components/dedicatedSplitShift/index';
import { useStyles } from './scheduleCalendar.styles';
import ScheduleCalendarGrid from './ScheduleCalendarGrid';

export { DUTY_COLORS } from '../helper/scheduleColors';

const params = {
  search: '',
  allSites: [],
  siteLocations: [],
  filter: {
    selectedSites: [],
    selectedDutyType: {},
    selectedStatus: {},
    selectedOfficers: [],
    selectedLocations: [],
  },
  selectedView: {
    type: DEFAULT_CALENDER_VIEW,
    windowStart: '',
    windowEnd: '',
  },
};

/** API value behind the "Unassigned" status option. */
const REQUIRES_ATTENTION_STATUS = 'requiresAttention';

const getSelectedFilterValues = (selectedValues) => {
  if (Array.isArray(selectedValues)) {
    return selectedValues
      .map((selected) => selected?.value ?? selected?.id)
      .filter((value) => value !== undefined && value !== null && value !== '' && value !== 'all');
  }

  const value = selectedValues?.value ?? selectedValues?.id;
  return value !== undefined && value !== null && value !== '' && value !== 'all'
    ? value
    : undefined;
};

const toSelectedIds = (selectedValues = []) => {
  const values = getSelectedFilterValues(selectedValues);
  if (Array.isArray(values)) return values;
  return values === undefined ? [] : [values];
};

const toLocationFilterOptions = (locations = []) => {
  const uniqueLocations = new Map();

  locations.forEach((location) => {
    const id = location?.id ?? location?.value;
    if (id === undefined || id === null || id === '') return;

    const key = String(id);
    if (uniqueLocations.has(key)) return;

    uniqueLocations.set(key, {
      ...location,
      id,
      name: location.name || location.locationName || location.title || location.label || '',
    });
  });

  return sortByLabelAsc(
    transformArrayForOptions([...uniqueLocations.values()], 'name', 'id') || [],
  );
};

const ScheduleCalendar = (props) => {
  const [allDuties, setAllDuties] = useState();
  const [listDuties, setListDuties] = useState();
  const [dayViewDuties, setDayViewDuties] = useState();
  const [dayViewLocations, setDayViewLocations] = useState([]);
  const [weekViewLocations, setWeekViewLocations] = useState([]);
  const [overviewSections, setOverviewSections] = useState([]);
  const [showDrawer, setShowDrawer] = useState({
    open: '',
    data: {},
    activeIndex: 0,
  });
  const [queryParams, setQueryParams] = useState(params);
  const [loading, setLoading] = useState(true);
  const setScheduleLoading = (isLoading) => {
    setLoading(isLoading);
    props.onLoadingChange?.(isLoading);
  };
  const [showForecastDrawer, setShowForecastDrawer] = useState(false);
  const [dedicatedSplitShiftData, setDedicatedSplitShiftData] = useState(null);
  const classes = useStyles();
  const location = useLocation();
  const { id: paramId = '' } = useParams();

  const isSitesModule =
    location.pathname?.includes(OBX_SITES) || location.pathname?.includes(HO_SITES_DETAIL);
  const isUsersModule = location.pathname?.includes(OBX_USER);
  const isEmbeddedScheduleView = isSitesModule || isUsersModule;
  const [requireAttentionJobs, setRequireAttentionJobs] = useState(null);
  const [missedHitsCount, setMissedHitsCount] = useState(null);

  /* Quick filter: collapse the site book down to the sites actually being
     serviced in the visible range. Off by default — a visibly quiet site tells a
     planner more than an absent one — but with a monthly or quarterly cadence most
     of the list is quiet, so wanting it out of the way is a reasonable thing to
     want, and it is one click either way. */
  const [showOnlyScheduledSites, setShowOnlyScheduledSites] = useState(false);

  /* Selection lives with the visits, not on a separate screen. */
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [harmonizeOpen, setHarmonizeOpen] = useState(false);
  /* What the drawer is currently proposing, so the calendar behind can ghost
     the move while it is still reversible. */
  const [harmonizePreview, setHarmonizePreview] = useState(null);

  const selectedShiftIds = useMemo(
    () => new Set(selectedShifts.map((shift) => shift.id)),
    [selectedShifts],
  );

  const toggleShiftSelect = useCallback((shift) => {
    setSelectedShifts((previous) => {
      if (previous.some((item) => item.id === shift.id)) {
        return previous.filter((item) => item.id !== shift.id);
      }
      return [
        ...previous,
        {
          id: shift.id,
          site: shift?.site?.name || shift?.siteName || shift?.name,
          siteId: shift?.site?.id || shift?.siteId || null,
          detail: shift?.runsheetName || shift?.name,
          day: dayjs(shift?.startsAt).format('ddd'),
          /* A route needs a date and a place, not just a label. Anything the
             shift does not carry is filled deterministically downstream. */
          startsAt: shift?.startsAt || null,
          lat: shift?.site?.lat ?? shift?.lat ?? null,
          lng: shift?.site?.lng ?? shift?.lng ?? null,
          address: shift?.site?.address || shift?.address || null,
          serviceMinutes: shift?.serviceMinutes ?? shift?.estimatedMinutes ?? null,
        },
      ];
    });
  }, []);

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedShifts([]);
    setHarmonizeOpen(false);
    setHarmonizePreview(null);
  }, []);
  const [filterLocationOptions, setFilterLocationOptions] = useState([]);
  const [filterOfficerOptions, setFilterOfficerOptions] = useState([]);
  const { fetchSiteLocationsByIds } = useSiteLocations();
  const fetchGenerationRef = useRef(0);
  const siteLocationsFetchGenerationRef = useRef(0);
  const filterLocationsFetchGenerationRef = useRef(0);
  const overviewKpiStatsRef = useRef({ windowStart: null, windowEnd: null, data: null });

  const _franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const _franchiseTimeZoneFromUrl = getTimezone();

  const { getNewApiController } = useApiControllers();

  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});
  const canFetchSummaryStats = useCanViewSummaryStats();
  const isSupplierForecasting = useSelector(
    (state) => state?.auth?.tenantPermissions?.runsheets?.suppliesForecasting,
  );
  const shiftTypes = useSelector((state) => state.tenantConfigs?.labels?.shift_types || {});
  const overviewSectionTemplates = useMemo(
    () => getOverviewSections({ services, getLabel, t, shiftTypes }),
    [services, getLabel, t, shiftTypes],
  );
  const scheduleHeaderTabs = useMemo(
    () =>
      getScheduleHeaderTabs({
        services,
        getLabel,
        t,
        shiftTypes,
        includeOfficerTab: false,
      }).filter((tab) => !(isUsersModule && tab.id === 'officer')),
    [services, getLabel, t, shiftTypes, isUsersModule],
  );
  const defaultTabId = scheduleHeaderTabs[0]?.id || 'overview';
  const resolveTabId = useCallback(
    (tabId) => (scheduleHeaderTabs.some((tab) => tab.id === tabId) ? tabId : defaultTabId),
    [scheduleHeaderTabs, defaultTabId],
  );

  const [activeTab, setActiveTab] = useState(() =>
    isEmbeddedScheduleView ? EMBEDDED_SCHEDULE_TAB_ID : resolveTabId(props.activeTab),
  );
  const tabConfig = getScheduleTabConfig(
    isEmbeddedScheduleView ? EMBEDDED_SCHEDULE_TAB_ID : activeTab,
  );

  /* Harmonize belongs to the visits tab. Leaving it must not strand a selection
     the planner can no longer see, nor ghosts on a calendar with no drawer. */
  useEffect(() => {
    if (activeTab !== VISITS_SCHEDULE_TAB_ID) {
      setSelectionMode(false);
      setSelectedShifts([]);
      setHarmonizeOpen(false);
      setHarmonizePreview(null);
    }
  }, [activeTab]);

  // Keep active tab valid when tenant services hide Dedicated / Patrol.
  useEffect(() => {
    if (isEmbeddedScheduleView) return;
    const nextTabId = resolveTabId(activeTab);
    if (nextTabId !== activeTab) {
      setActiveTab(nextTabId);
      props.onTabChange?.(nextTabId);
    }
  }, [activeTab, isEmbeddedScheduleView, props.onTabChange, resolveTabId]);

  const scheduleFilterKey = useMemo(
    () =>
      JSON.stringify({
        selectedSites: toSelectedIds(queryParams.filter.selectedSites),
        selectedDutyType: queryParams.filter.selectedDutyType?.value,
        selectedStatus: queryParams.filter.selectedStatus?.value,
        selectedLocations: getSelectedFilterValues(queryParams.filter.selectedLocations),
        selectedOfficers: getSelectedFilterValues(queryParams.filter.selectedOfficers),
      }),
    [queryParams.filter],
  );

  const showSideDrawer = (value) => (data) => {
    setShowDrawer({ open: value, data: value ? data : null });
  };
  const changeOnlyDrawerType = (value) => () => {
    setShowDrawer((prev) => ({ open: value, data: value ? prev?.data : null }));
  };

  const clearCalendarData = useCallback(() => {
    setListDuties([]);
    setAllDuties([]);
    setDayViewDuties({});
    setWeekViewLocations([]);
    setOverviewSections(overviewSectionTemplates);
    setRequireAttentionJobs(null);
  }, [overviewSectionTemplates]);

  const handleOpenDedicatedSplitShift = (shiftDetail) => {
    if (!shiftDetail) return;
    if (isShiftScheduleFullyCancelled(shiftDetail)) {
      toaster.info({
        text: t('obx.schedules.assignDedicatedDuty.assignShift.shiftScheduleCancelled'),
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      return;
    }
    setDedicatedSplitShiftData(shiftDetail);
    showSideDrawer('')();
  };

  const loadLocationOptionsForSites = (selectedSites) => {
    const siteIds = toSelectedIds(selectedSites);
    const fetchGeneration = ++filterLocationsFetchGenerationRef.current;

    if (!siteIds.length) {
      setFilterLocationOptions([]);
      return;
    }

    fetchSiteLocationsByIds(siteIds)
      .then((locationsBySite) => {
        if (fetchGeneration !== filterLocationsFetchGenerationRef.current) return;
        setFilterLocationOptions(
          toLocationFilterOptions(Object.values(locationsBySite || {}).flat()),
        );
      })
      .catch(() => {
        if (fetchGeneration !== filterLocationsFetchGenerationRef.current) return;
        setFilterLocationOptions([]);
      });
  };

  const handleSelectFilter = (event, key) => {
    const nextValue = event.target.value;

    if (key === 'selectedSites') {
      // Location options only exist for selected site(s); none when sites are cleared.
      loadLocationOptionsForSites(Array.isArray(nextValue) ? nextValue : []);
    }

    if (key === 'selectedLocations') {
      const locationIds = toSelectedIds(Array.isArray(nextValue) ? nextValue : []);
      if (!locationIds.length) {
        // Location filter cleared — reload options for currently selected sites (if any).
        loadLocationOptionsForSites(queryParams.filter.selectedSites);
      }
    }

    setQueryParams((prev) => ({
      ...prev,
      filter: {
        ...prev.filter,
        [key]: nextValue,
        ...(key === 'selectedSites' && {
          selectedLocations: tabConfig.filters.showLocation
            ? []
            : { label: t('obx.schedules.filters.locations.all'), value: '' },
        }),
      },
    }));
  };

  /**
   * Single entry point for setting the status filter from outside the filter
   * bar — the "N require assignment" pill and the footer status counts both use
   * it, so those numbers behave as the drill-down they look like. Passing null
   * clears the filter.
   */
  const statusFilterLabels = useMemo(
    () => ({
      completed: t('obx.schedules.filters.status.completed'),
      inProgress: t('obx.schedules.filters.status.inProgress'),
      notStarted: t('obx.schedules.filters.status.notStarted'),
      [REQUIRES_ATTENTION_STATUS]: t('obx.schedules.filters.status.unassigned'),
      cancelled: t('obx.schedules.filters.status.cancelled'),
    }),
    [t],
  );

  const applyStatusFilter = useCallback(
    (statusValue) => {
      setQueryParams((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          selectedStatus: statusValue
            ? { value: statusValue, label: statusFilterLabels[statusValue] || statusValue }
            : {},
        },
      }));
    },
    [statusFilterLabels],
  );

  const activeStatusFilter = queryParams.filter.selectedStatus?.value ?? null;
  const isRequiresAttentionFilterActive = activeStatusFilter === REQUIRES_ATTENTION_STATUS;

  const toggleRequiresAttentionFilter = () =>
    applyStatusFilter(isRequiresAttentionFilterActive ? null : REQUIRES_ATTENTION_STATUS);

  // Hand the status control up so the stats footer — rendered as a sibling of
  // this calendar — can drive the same filter.
  const onStatusControlChange = props.onStatusControlChange;
  useEffect(() => {
    onStatusControlChange?.({ activeStatus: activeStatusFilter, setStatus: applyStatusFilter });
  }, [onStatusControlChange, activeStatusFilter, applyStatusFilter]);

  const dutyNameMonth = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.schedules.legends.dedicated', {
      dedicated: getLabel('terms', 'dedicated', t),
    }),
    [SCHEDULE_DUTIES.PATROL]: t('obx.schedules.legends.patrol', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.schedules.legends.extra', {
      extra: getLabel('terms', 'extra', t),
    }),
    [SCHEDULE_DUTIES.DISPATCH]: t('obx.schedules.legends.dispatch', {
      dispatch: getLabel('terms', 'dispatch', t),
    }),
    [SCHEDULE_DUTIES.HIT]: t('obx.schedules.legends.patrol', {
      patrol: getLabel('terms', 'patrol', t),
    }),
  };

  const getDutiesByMonth = async (query, config) => {
    const response = await allMonthDutyData(query, config);
    const monthPayload = response?.data || {};
    const shiftsRes = monthPayload.shifts || [];

    const shifts = shiftsRes?.flatMap((shiftRes) => {
      const shift = Object.values(shiftRes).reduce((acc, current) => {
        const count = (current?.assignedCount || 0) + (current?.unassignedCount || 0);
        if (!current?.type || !count) return acc;

        acc = [
          ...acc,
          {
            date: shiftRes?.date,
            name: `${count}x ${dutyNameMonth[current?.type]}`,
            requiresAttention: current?.requiresAttention,
            shiftType: current?.type,
            unassignedCount: current?.unassignedCount,
            assignedCount: current?.assignedCount,
          },
        ];

        return acc;
      }, []);

      return shift;
    }, []);

    setRequireAttentionJobs(monthPayload.unassignedCount || 0);
    return shifts;
  };

  const getUnassignedCount = (data = {}) =>
    data.unassignedCount ?? data.footerStats?.statuses?.unassigned ?? 0;

  const getAllDuties = async (query, config, { applyFooterStats = true } = {}) => {
    try {
      query.windowStart = getCurrentTimeWithDisabledDlsInIso(query?.windowStart);
      query.windowEnd = getCurrentTimeWithDisabledDlsInIso(query?.windowEnd);

      const response = await allDutyData(query, config);
      const data = response?.data || {};

      if (applyFooterStats) {
        setRequireAttentionJobs(getUnassignedCount(data));
        props.onFooterStatsChange?.(data.footerStats || null);
      }

      return data || {};
    } catch (error) {
      throwAPIError(error);
    }
  };

  const getAllListDuties = async (query, config) => {
    query.list = true;

    let shifts = [];
    let listShifts = {};

    const summary = await getAllDuties(query, config);
    const shiftsRes = Array.isArray(summary?.shifts)
      ? summary.shifts
      : Object.values(summary?.shifts || {});

    shiftsRes.forEach((shift) => {
      shifts.push({
        ...shift,
        start: dayjsWithStandardOffset(shift?.startsAt).format('YYYY-MM-DD'),
        end: shift?.endsAt,
      });

      const date = dayjsWithStandardOffset(shift?.startsAt).date();
      listShifts[date] = [
        ...(listShifts[date] || []),
        {
          ...shift,
          start: shift?.startsAt,
          end: shift?.endsAt,
          name: shift?.name,
        },
      ];
    });

    return { shifts, listShifts };
  };

  const getAllDutiesData = async (filter, selectedView, search, scheduleTab = activeTab) => {
    const fetchTabConfig = getScheduleTabConfig(scheduleTab);
    const apiController = getNewApiController();
    const fetchGeneration = ++fetchGenerationRef.current;
    const isStaleFetch = () =>
      fetchGeneration !== fetchGenerationRef.current || apiController.signal.aborted;

    try {
      setScheduleLoading(true);

      const { type, windowStart, windowEnd } = selectedView;
      const statsWindowStart = windowStart ? getCurrentTimeWithDisabledDlsInIso(windowStart) : null;
      const statsWindowEnd = windowEnd ? getCurrentTimeWithDisabledDlsInIso(windowEnd) : null;
      const statsCache = overviewKpiStatsRef.current;
      const shouldFetchOverviewStats =
        canFetchSummaryStats &&
        fetchTabConfig.isOverviewTab &&
        type === DAY_GRID.WEEK &&
        !isEmbeddedScheduleView &&
        (statsCache.windowStart !== statsWindowStart || statsCache.windowEnd !== statsWindowEnd);

      // Keep overview footer visible while grids refetch; only clear when stats will refetch.
      if (shouldFetchOverviewStats || !fetchTabConfig.isOverviewTab || type !== DAY_GRID.WEEK) {
        props.onFooterStatsChange?.(null);
      }

      if ((isSitesModule && !props.selectedSite?.id) || (isUsersModule && !props.officerId)) {
        if (isStaleFetch()) return;
        clearCalendarData();
        setRequireAttentionJobs(0);
        setScheduleLoading(false);

        return;
      }

      const siteIds = isSitesModule
        ? [props.selectedSite?.id]
        : getSelectedFilterValues(filter.selectedSites);
      const shiftType = isEmbeddedScheduleView
        ? filter?.selectedDutyType?.value
        : fetchTabConfig.filters.showShiftType
          ? filter?.selectedDutyType?.value
          : undefined;
      const shiftStatus = filter?.selectedStatus?.value;
      const isDayOrMonthView = type === DAY_GRID.DAY || type === DAY_GRID.MONTH;
      const locationId = isEmbeddedScheduleView
        ? filter?.selectedLocations?.value
        : isDayOrMonthView
          ? undefined
          : getSelectedFilterValues(filter?.selectedLocations);
      const officerId = isUsersModule
        ? props.officerId
        : isEmbeddedScheduleView || isDayOrMonthView
          ? undefined
          : getSelectedFilterValues(filter?.selectedOfficers);
      const query = {
        windowStart: windowStart,
        windowEnd: windowEnd,
        shiftType,
        shiftStatus,
        search,
        siteId: siteIds,
        officerId,
        isSite: isSitesModule,
        locationId,
      };

      if (!isDayOrMonthView && !isEmbeddedScheduleView) {
        query.schedule = true;
      }

      if (type === DAY_GRID.WEEK && !isEmbeddedScheduleView) {
        query.responseVersion = 'grid-v2';
        query.calendarView = 'week';
        query.view = fetchTabConfig.apiView;
      }

      let shifts = [];
      let listShifts = undefined;
      let dayViewShifts = {};
      let weekViewLocations = [];

      const config = { signal: apiController.signal };
      if (type == DAY_GRID.MONTH) {
        query.offset = getOffsetWithStandardTime();
        shifts = await getDutiesByMonth(query, config);
        if (isStaleFetch()) return;
        props.onFooterStatsChange?.(null);
      } else if (type == TIME_GRID.LIST) {
        const res = await getAllListDuties(query, config);
        if (isStaleFetch()) return;
        shifts = res.shifts;
        listShifts = res.listShifts || {};
      } else if (type == DAY_GRID.DAY) {
        shifts = [];
        query.isDayView = true;
        // Day view now keeps the tab bar, so it has to honour which tab is
        // active — otherwise Visits silently fell back to the runsheet grid.
        if (!isEmbeddedScheduleView && fetchTabConfig.apiView) {
          query.view = fetchTabConfig.apiView;
        }
        const dayViewData = await getAllDuties(query, config);
        if (isStaleFetch()) return;
        props.onFooterStatsChange?.(null);
        dayViewShifts = dayViewData?.shifts || {};
        setDayViewLocations(dayViewData?.locations || []);
      } else if (type == DAY_GRID.WEEK) {
        if (isEmbeddedScheduleView) {
          const res = await getAllDuties(query, config);
          if (isStaleFetch()) return;
          props.onFooterStatsChange?.(null);

          shifts = (res.shifts || []).map((shift) => ({
            ...shift,
            start: dayjsWithStandardOffset(shift.start || shift.startsAt).format('YYYY-MM-DD'),
          }));
          weekViewLocations = res.locations || [];
          setRequireAttentionJobs(getUnassignedCount(res));
        } else if (fetchTabConfig.isOverviewTab) {
          const toastOverviewFailure = (error) => {
            if (config.signal?.aborted) return;
            toaster.error({
              text: error?.message || 'Something went wrong',
              position: 'top-right',
              autoClose: toastSettings.AUTO_CLOSE,
            });
          };

          const windowStartIso = getCurrentTimeWithDisabledDlsInIso(query.windowStart);
          const windowEndIso = getCurrentTimeWithDisabledDlsInIso(query.windowEnd);
          const cache = overviewKpiStatsRef.current;
          const shouldFetchStats =
            canFetchSummaryStats &&
            (cache.windowStart !== windowStartIso || cache.windowEnd !== windowEndIso);

          // Stats is independent — only when windowStart/windowEnd change.
          const statsPromise = shouldFetchStats
            ? getDutySummaryStats(
                { windowStart: windowStartIso, windowEnd: windowEndIso, isSite: query.isSite },
                config,
              )
                .then((res) => {
                  const data = res?.data || null;
                  overviewKpiStatsRef.current = {
                    windowStart: windowStartIso,
                    windowEnd: windowEndIso,
                    data,
                  };
                  return data;
                })
                .catch((error) => {
                  overviewKpiStatsRef.current = { windowStart: null, windowEnd: null, data: null };
                  toastOverviewFailure(error);
                  return null;
                })
            : Promise.resolve(cache.data);

          const overviewViews = [];
          if (services?.patrol === true) overviewViews.push('patrol');
          if (services?.dedicated === true) overviewViews.push('dedicated');

          // Grid calls are independent of stats.
          const gridsPromise = Promise.allSettled(
            overviewViews.map((view) =>
              getAllDuties({ ...query, view }, config, { applyFooterStats: false }),
            ),
          );

          const [kpiData, gridSettled] = await Promise.all([statsPromise, gridsPromise]);
          if (isStaleFetch()) return;

          const emptyGrid = { sections: [], footerStats: null };
          const resolveGridResult = (view) => {
            if (!overviewViews.includes(view)) return emptyGrid;
            const result = gridSettled[overviewViews.indexOf(view)];
            if (!result || result.status === 'rejected') {
              if (result?.status === 'rejected') toastOverviewFailure(result.reason);
              return emptyGrid;
            }
            return result.value || emptyGrid;
          };

          const patrolRes = resolveGridResult('patrol');
          const dedicatedRes = resolveGridResult('dedicated');

          if (kpiData || patrolRes.footerStats || dedicatedRes.footerStats) {
            const footerStats = buildOverviewFooterStats(
              kpiData || {},
              patrolRes.footerStats,
              dedicatedRes.footerStats,
            );
            setRequireAttentionJobs(getUnassignedCount({ footerStats }));
            props.onFooterStatsChange?.(footerStats);
          } else {
            setRequireAttentionJobs(0);
            props.onFooterStatsChange?.(null);
          }

          const overviewSectionsData = mapGridV2OverviewSections(
            { patrol: patrolRes, dedicated: dedicatedRes },
            overviewSectionTemplates,
          );

          setOverviewSections(overviewSectionsData);
          shifts = overviewSectionsData.flatMap((section) =>
            (section.rows || []).flatMap((row) => row.shifts || []),
          );
          weekViewLocations = [];
        } else {
          const res = await getAllDuties(query, config);
          if (isStaleFetch()) return;

          const normalizedWeek = mapGridV2WeekData(res);
          shifts = normalizedWeek.shifts;
          weekViewLocations = mapWeekRowsToCalendarResources(normalizedWeek.rows);
          setRequireAttentionJobs(getUnassignedCount(res));
        }
      }

      if (isStaleFetch()) return;

      setListDuties(listShifts);
      setDayViewDuties(dayViewShifts);
      setWeekViewLocations(weekViewLocations);
      setAllDuties(shifts);
      setScheduleLoading(false);
    } catch (error) {
      if (!isStaleFetch()) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        clearCalendarData();
        setDayViewLocations([]);
        setRequireAttentionJobs(0);
        props.onFooterStatsChange?.(null);
        setScheduleLoading(false);
      }
    }
  };

  const handleTabClick = useCallback(
    (tabId) => {
      if (isEmbeddedScheduleView || tabId === activeTab) return;

      const nextTabConfig = getScheduleTabConfig(tabId);
      const resetShiftType =
        tabConfig.filters.shiftTypeOptionsKey !== nextTabConfig.filters.shiftTypeOptionsKey;
      const resetStatus =
        tabConfig.filters.patrolStatusOptions !== nextTabConfig.filters.patrolStatusOptions;

      setActiveTab(tabId);
      setScheduleLoading(true);
      clearCalendarData();
      // Carry a filter across a tab change whenever the destination tab offers
      // the same control — losing a site or officer selection just for changing
      // tab made comparing the same slice across tabs impossible.
      setQueryParams((prev) => ({
        ...prev,
        filter: {
          ...prev.filter,
          selectedLocations:
            nextTabConfig.filters.showLocation && tabConfig.filters.showLocation
              ? prev.filter.selectedLocations
              : nextTabConfig.filters.showLocation
                ? []
                : { label: t('obx.schedules.filters.locations.all'), value: '' },
          selectedOfficers:
            nextTabConfig.filters.showOfficer && tabConfig.filters.showOfficer
              ? prev.filter.selectedOfficers
              : nextTabConfig.filters.showOfficer
                ? []
                : {},
          selectedDutyType: resetShiftType ? {} : prev.filter.selectedDutyType,
          selectedStatus: resetStatus ? {} : prev.filter.selectedStatus,
        },
      }));
      props.onFooterStatsChange?.(null);
      props.onTabChange?.(tabId);
    },
    [
      activeTab,
      clearCalendarData,
      isEmbeddedScheduleView,
      props.onFooterStatsChange,
      props.onTabChange,
      t,
      tabConfig.filters.shiftTypeOptionsKey,
      tabConfig.filters.patrolStatusOptions,
      tabConfig.filters.showLocation,
      tabConfig.filters.showOfficer,
    ],
  );

  const refetchScheduleData = () =>
    getAllDutiesData(queryParams.filter, queryParams.selectedView, queryParams.search, activeTab);

  const calendarDataRef = useRef({
    allDuties,
    overviewSections,
    dayViewDuties,
    listDuties,
  });
  calendarDataRef.current = { allDuties, overviewSections, dayViewDuties, listDuties };

  const refetchScheduleDataRef = useRef(refetchScheduleData);
  refetchScheduleDataRef.current = refetchScheduleData;

  const handleCalendarOfficerAssignSuccess = useCallback(
    ({ previousShift, assignment, selectedOfficer } = {}) => {
      const shiftId = previousShift?.id;
      if (!shiftId) {
        refetchScheduleDataRef.current();
        return;
      }

      const officer = buildOfficerFromAssignResult(assignment, selectedOfficer);
      const next = updateCalendarShiftOfficerById(calendarDataRef.current, shiftId, officer);

      if (!next) {
        refetchScheduleDataRef.current();
        return;
      }

      calendarDataRef.current = next;
      setAllDuties(next.allDuties);
      setOverviewSections(next.overviewSections);
      setDayViewDuties(next.dayViewDuties);
      setListDuties(next.listDuties);
    },
    [],
  );

  const getMissedHitsCountFunc = async ({ start, end }) => {
    try {
      setMissedHitsCount(undefined);

      const startsAt = getCurrentTimeWithDisabledDlsInIso(start);
      const endsAt = getCurrentTimeWithDisabledDlsInIso(end);
      const response = await getMissedHitsCount({
        startsAt: startsAt,
        endsAt: endsAt,
      });

      setMissedHitsCount(response?.data?.missedHitsCount || 0);
    } catch (error) {
      setMissedHitsCount(null);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  // fetch missed hits count
  useEffect(() => {
    if (isSitesModule || isUsersModule) return;
    if (queryParams.selectedView.windowStart && queryParams.selectedView.windowEnd) {
      getMissedHitsCountFunc({
        start: queryParams.selectedView?.windowStart,
        end: queryParams.selectedView?.windowEnd,
      });
    }
  }, [queryParams.selectedView?.windowStart, queryParams.selectedView?.windowEnd]);

  useEffect(() => {
    props.onViewTypeChange?.(queryParams.selectedView?.type);
  }, [queryParams.selectedView?.type, props.onViewTypeChange]);

  const onSearch = useCallback((event) => {
    setQueryParams((prev) => ({
      ...prev,
      search: event.target.value,
    }));
  }, []);

  useEffect(() => {
    if (!queryParams.selectedView.windowStart || !queryParams.selectedView.windowEnd) {
      clearCalendarData();
      return;
    }

    getAllDutiesData(queryParams.filter, queryParams.selectedView, queryParams.search, activeTab);
  }, [
    scheduleFilterKey,
    queryParams.selectedView,
    queryParams.search,
    activeTab,
    props.selectedSite?.id,
    props.officerId,
  ]);

  const getSitesList = async () => {
    try {
      let response;
      // if (officerId) {
      //   response = await getAllSitesByOfficerId(officerId);
      // } else {
      response = await getAllSites({});
      // }

      const sitesList = response?.data?.sites || [];
      setQueryParams((prev) => ({
        ...prev,
        allSites: sortByLabelAsc([...sitesList], ['name', 'siteName', 'title', 'label']),
      }));
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      setQueryParams((prev) => ({
        ...prev,
        allSites: [],
        filter: {
          ...prev.filter,
          selectedSites: [],
        },
      }));
    }
  };

  const getLocationsOfSite = async (siteId) => {
    const fetchGeneration = ++siteLocationsFetchGenerationRef.current;

    if (!siteId) {
      setQueryParams((prev) => ({
        ...prev,
        siteLocations: [],
      }));
      return;
    }

    try {
      const locationsBySite = await fetchSiteLocationsByIds([siteId]);
      if (fetchGeneration !== siteLocationsFetchGenerationRef.current) return;

      const locationsRes = locationsBySite[String(siteId)] || locationsBySite[siteId] || [];

      setQueryParams((prev) => ({
        ...prev,
        siteLocations: [
          { label: t('obx.schedules.filters.locations.all'), value: '' },
          ...sortByLabelAsc(transformArrayForOptions(locationsRes, 'name', 'id') || []),
        ],
      }));
    } catch (error) {
      if (fetchGeneration !== siteLocationsFetchGenerationRef.current) return;
      setQueryParams((prev) => ({
        ...prev,
        siteLocations: [],
      }));
    }
  };

  const loadFilterOfficerOptions = async () => {
    try {
      const response = await getVisitorsLoadsOfficersOptions();
      // Axios interceptor already returns response.data (API body).
      // Expected shape: { statusCode: 200, data: { officers: [...] } }
      const statusCode = response?.statusCode ?? response?.data?.statusCode;
      const officers = response?.data?.officers ?? response?.officers;

      if (statusCode === 200 || Array.isArray(officers)) {
        setFilterOfficerOptions(
          sortByLabelAsc(
            (transformArrayForOptions(officers || [], 'name', 'id', null, 'imageUrl') || []).map(
              (officer) => ({
                ...officer,
                image: officer.image || officer.imageUrl || officer.avatar || '',
              }),
            ),
          ),
        );
        return;
      }

      setFilterOfficerOptions([]);
    } catch {
      setFilterOfficerOptions([]);
    }
  };

  /**
   * if site is nonFunctional disable the create extra job button
   * */
  const disableIfSiteNonFunctional = () => {
    if (Object.keys(props?.selectedSite).length === 1) return true;

    if (Object.keys(props?.selectedSite).length > 1) {
      if (
        props?.selectedSite?.status === siteStatusEnum.requiresAttention ||
        props?.selectedSite?.status === siteStatusEnum.nonFunctional
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isSitesModule) return;

    getSitesList(props.officerId);

    if (!isUsersModule) {
      loadFilterOfficerOptions();
    }
  }, [props.officerId, isSitesModule, isUsersModule]);

  useEffect(() => {
    if (isSitesModule) {
      getLocationsOfSite(props.selectedSite?.id);
    }
  }, [isSitesModule, props.selectedSite?.id]);

  const onClickCreateExtraDuty = (type) => {
    // if (
    //   franchiseIdWithRoleAndSource?.role === rolesEnum.homeOfficer &&
    //   franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
    // ) {
    //   const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
    //   const queryParams = new URLSearchParams({
    //     siteId: `${paramId}`,
    //     [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
    //     [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
    //   }).toString();
    //   return history.push(`${createExtraJob}?${queryParams}`);
    // }

    if (isSitesModule) {
      return history.push(OBX_SITES_CREATE_EXTRA_DUTY + `?siteId=${paramId}&type=${type}`);
    }
    if (isUsersModule) {
      return history.push(OBX_USERS_CREATE_EXTRA_DUTY + `?userId=${paramId}&type=${type}`);
    }

    return history.push(OBX_SCHEDULES_CREATE_EXTRA_DUTY + `?type=${type}`);
  };

  const refreshMissedHitsCount = useCallback(() => {
    getMissedHitsCountFunc({
      start: queryParams.selectedView?.windowStart,
      end: queryParams.selectedView?.windowEnd,
    });
  }, [queryParams.selectedView?.windowStart, queryParams.selectedView?.windowEnd]);

  const isDayOrMonthView =
    queryParams.selectedView?.type === DAY_GRID.DAY ||
    queryParams.selectedView?.type === DAY_GRID.MONTH;

  /* Only in the visits week view: it filters site rows, and day and month have
     none — day already lists just the sites being worked. */
  const quickFilter =
    !isEmbeddedScheduleView && !isDayOrMonthView && activeTab === VISITS_SCHEDULE_TAB_ID ? (
      <Button
        /* The variant is the pressed state, and it finally shows: this button used
           to wear the unrouted-demand pill's class, which painted it in the alert
           palette — a neutral "show me fewer rows" control dressed as a warning,
           next to a real one and indistinguishable from it — and pinned background
           and colour, so this swap was invisible. Its own geometry-only class now. */
        variant={showOnlyScheduledSites ? 'primary' : 'secondaryGrey'}
        className={classes.scheduleQuickFilterButton}
        startIcon={<FilterFunnelIcon />}
        aria-pressed={showOnlyScheduledSites}
        title={t(
          showOnlyScheduledSites
            ? 'obx.schedules.calendar.visits.showAllSites'
            : 'obx.schedules.calendar.visits.showOnlyScheduledSites',
          { hits: getLabel('terms', 'hits', t) },
        )}
        onClick={() => setShowOnlyScheduledSites((previous) => !previous)}
      >
        {t('obx.schedules.calendar.visits.onlyScheduledSites', {
          hits: getLabel('terms', 'hits', t),
        })}
      </Button>
    ) : null;

  const scheduleFilters = (
    <ScheduleCalendarFilters
      trailingFilter={quickFilter}
      classes={classes}
      tabConfig={tabConfig}
      selectedViewType={queryParams.selectedView.type}
      queryParams={queryParams}
      onSearch={onSearch}
      onSelectFilter={handleSelectFilter}
      isSitesModule={isSitesModule}
      isUsersModule={isUsersModule}
      filterLocationOptions={filterLocationOptions}
      filterOfficerOptions={filterOfficerOptions}
      services={services}
      getLabel={getLabel}
    />
  );

  const isDayOrMonthCalendarView =
    queryParams.selectedView?.type === DAY_GRID.DAY ||
    queryParams.selectedView?.type === DAY_GRID.MONTH;

  const createMenu = (
    <RenderIfHasPermission name={ACL_OBX_SITE_EXTRA_JOB_CREATE}>
      <Tooltip
        placement="top"
        arrow
        title={
          isSitesModule &&
          disableIfSiteNonFunctional() &&
          t('obx.sites.cannotCreateExtraJobForNonFunctionalSite', {
            extra: getLabel('terms', 'extra', t),
          })
        }
      >
        <StyledMenuButton
          buttonId="schedule-create-menu-button"
          menuId="schedule-create-menu"
          buttonLabel={t('obx.obxExtraDuty.labels.create')}
          startIcon={<AddBlueIcon />}
          endIcon={<ArrowDropDown />}
          buttonVariant="text"
          disabled={isSitesModule && disableIfSiteNonFunctional()}
          buttonProps={{ className: classes.scheduleCreateButton }}
          menuItems={[
            {
              id: 'extraJobDedicated',
              label: t('obx.obxExtraDuty.labels.extraJob'),
              disableRipple: true,
              onClick: onClickCreateExtraDuty,
            },
            {
              id: 'extraHitPatrol',
              label: t('obx.obxExtraDuty.labels.extraHit'),
              disableRipple: true,
              onClick: onClickCreateExtraDuty,
            },
          ]}
        />
      </Tooltip>
    </RenderIfHasPermission>
  );

  return (
    <Box className={`${classes.scheduleCalendar} ${props.className}`}>
      <Box className={classes.scheduleCalendarTabsRow}>
        {/* Tabs stay put in day and month. Hiding them there dropped the only
            route into the visits view and left the user unable to tell which
            service the grid was even showing. */}
        {!isEmbeddedScheduleView ? (
          <Box className={classes.scheduleCalendarTabs}>
            {scheduleHeaderTabs.map((tab) => (
              <Button
                key={tab.id}
                className={`${classes.scheduleCalendarTab} ${
                  activeTab === tab.id ? classes.scheduleCalendarTabActive : ''
                }`}
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        ) : (
          <Box />
        )}

        <Box className={classes.scheduleCalendarHeaderRight}>
          {!isUsersModule && requireAttentionJobs !== 0 && (
            <>
              {typeof requireAttentionJobs === 'number' ? (
                <Button
                  variant="destructiveSecondary"
                  className={classes.scheduleAssignmentActionButton}
                  startIcon={<AlertIcon />}
                  aria-pressed={isRequiresAttentionFilterActive}
                  title={
                    isRequiresAttentionFilterActive
                      ? t('obx.schedules.calendar.showAllShifts')
                      : t('obx.schedules.calendar.showOnlyRequiresAttention')
                  }
                  onClick={toggleRequiresAttentionFilter}
                >
                  {tabConfig.isVisitsTab
                    ? t('obx.schedules.calendar.visits.awaitingRoute', {
                        count: requireAttentionJobs,
                        hits: getLabel('terms', 'hits', t),
                      })
                    : t('obx.schedules.calendar.jobsRequireAttention', {
                        count: requireAttentionJobs,
                      })}
                </Button>
              ) : (
                <Skeleton className={classes.scheduleAssignmentActionSkeleton} />
              )}
            </>
          )}
          {isSupplierForecasting && !isSitesModule && (
            <Button
              variant="outlined"
              className={classes.forecastingButton}
              startIcon={<ForecastTrendIcon />}
              onClick={() => setShowForecastDrawer(true)}
            >
              {t('obx.schedules.forecasting.button')}
            </Button>
          )}
          {/*
            Selection happens here, on the visits themselves — the optimizer
            opens over the calendar rather than replacing it.
          */}
          {/* Harmonize rearranges visits, so it is offered only where visits
              are the subject — not on the runsheet or overview tabs. */}
          {!isSitesModule &&
            !isUsersModule &&
            !isDayOrMonthCalendarView &&
            activeTab === VISITS_SCHEDULE_TAB_ID && (
              <>
                {/* Plain design-system buttons, no local geometry. These are page
                    CTAs and should look like the ones in the sites module — the
                    28px pill treatment belongs to the filter chips, not to actions,
                    and applying it here made them read as chips too. */}
                {selectionMode ? (
                  <>
                    {/* Cancel first, primary last: the escape hatch is the one a
                        planner reaches for while nothing is selected yet, and a
                        disabled CTA should not be the rightmost thing in the row. */}
                    <Button variant="secondaryGrey" onClick={exitSelection}>
                      {t('buttons.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      disabled={selectedShifts.length === 0}
                      onClick={() => setHarmonizeOpen(true)}
                    >
                      {t('obx.runsheet.optimize.harmonizeSelected', {
                        count: selectedShifts.length,
                      })}
                    </Button>
                  </>
                ) : (
                  <Button variant="secondaryGrey" onClick={() => setSelectionMode(true)}>
                    {t('obx.runsheet.optimize.selectVisits')}
                  </Button>
                )}
              </>
            )}
          {createMenu}
        </Box>
      </Box>
      <Box className={classes.scheduleCalendarFull}>
        <ScheduleErrorBoundary
          resetKey={`${activeTab}|${queryParams.selectedView?.type}|${queryParams.selectedView?.windowStart}`}
          onRetry={refetchScheduleData}
        >
          <ScheduleCalendarGrid
            onAssignmentSuccess={handleCalendarOfficerAssignSuccess}
            events={allDuties}
            listEvents={listDuties}
            dayViewDuties={dayViewDuties}
            dayViewLocations={dayViewLocations}
            weekViewLocations={weekViewLocations}
            setShowDrawer={setShowDrawer}
            queryParams={queryParams}
            setQueryParams={setQueryParams}
            loading={loading}
            missedHitsCount={missedHitsCount}
            refreshMissedHitsCount={refreshMissedHitsCount}
            toolbarLeftContent={scheduleFilters}
            showListSwitch={false}
            activeScheduleTab={isEmbeddedScheduleView ? EMBEDDED_SCHEDULE_TAB_ID : activeTab}
            overviewSections={overviewSections}
            selectionMode={selectionMode}
            showOnlyScheduledSites={showOnlyScheduledSites}
            selectedShiftIds={selectedShiftIds}
            onToggleShiftSelect={toggleShiftSelect}
            harmonizePreview={harmonizePreview}
          />
        </ScheduleErrorBoundary>

        <HarmonizeDrawer
          open={harmonizeOpen}
          onClose={() => setHarmonizeOpen(false)}
          selectedShifts={selectedShifts}
          onPreviewChange={setHarmonizePreview}
          onApplied={(result) => {
            exitSelection();
            toaster.success({
              text: [
                t('obx.runsheet.harmonize.appliedToast', {
                  count: result.fittedVisitCount,
                  day: result.targetDay,
                  runsheet: result.worker
                    ? `${result.worker} · ${result.runsheetName}`
                    : result.runsheetName,
                }),
                result.overflowVisitCount
                  ? t('obx.runsheet.harmonize.appliedOverflow', {
                      count: result.overflowVisitCount,
                      day: result.overflowDay,
                    })
                  : null,
              ]
                .filter(Boolean)
                .join(' · '),
              position: 'top-right',
              autoClose: toastSettings.AUTO_CLOSE,
            });
          }}
        />
      </Box>

      {[
        DRAWER_TYPE.ASSIGN,
        DRAWER_TYPE.TOUR_TEMPLATE,
        DRAWER_TYPE.REASSIGNMENT,
        DRAWER_TYPE.EDIT_REASSIGNMENT,
      ].includes(showDrawer?.open) && (
        <AssignmentSideDrawer
          isOpen={true}
          drawerData={{
            type: showDrawer?.open,
            shiftId: showDrawer?.data?.shiftId,
            siteId: showDrawer?.data?.site?.id,
            shiftDate: showDrawer?.data?.startsAt,
          }}
          closeSideDrawer={showSideDrawer('')}
          changeOnlyDrawerType={changeOnlyDrawerType}
          callbackUponAssignment={refetchScheduleData}
          onOpenDedicatedSplitShift={handleOpenDedicatedSplitShift}
        />
      )}
      {showDrawer?.open === DRAWER_TYPE.DETAIL && (
        <ShiftDetail
          {...{
            isOpen: showDrawer?.open === DRAWER_TYPE.DETAIL,
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
            setAllDuties,
            getAllDuties: () =>
              getAllDutiesData(
                queryParams.filter,
                queryParams.selectedView,
                queryParams.search,
                activeTab,
              ),
          }}
        />
      )}
      {isSupplierForecasting && (
        <SuppliesForecastingDrawer
          open={showForecastDrawer}
          onClose={() => setShowForecastDrawer(false)}
        />
      )}
      {dedicatedSplitShiftData && (
        <DedicatedSplitShift
          isOpen={!!dedicatedSplitShiftData}
          closeDrawer={() => setDedicatedSplitShiftData(null)}
          onSuccesCloseModal={() => {
            setDedicatedSplitShiftData(null);
            refetchScheduleData();
          }}
          shiftData={dedicatedSplitShiftData}
          setShiftData={setDedicatedSplitShiftData}
        />
      )}
    </Box>
  );
};

ScheduleCalendar.propTypes = {
  props: PropTypes.any,
  selectedSite: PropTypes.number,
  officerId: PropTypes.number,
  className: PropTypes.string,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  onViewTypeChange: PropTypes.func,
  onFooterStatsChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  /** Receives `{ activeStatus, setStatus }` so siblings can drive the status filter. */
  onStatusControlChange: PropTypes.func,
};

export default ScheduleCalendar;
