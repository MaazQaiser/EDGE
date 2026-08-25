import { ArrowDropDown, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { Box, Button, Skeleton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
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
import {
  CALENDAR_TOOLBAR_ARRANGEMENT,
  CalendarToolbarArrangementContext,
} from 'src/app/components/common/calendar';
import SideDrawer from 'src/app/components/common/sideDrawer';
import StyledMenuButton from 'src/app/components/common/styledMenuButton';
import { siteStatusEnum } from 'src/app/homeOffice/pages/franchise/utils/enums';
import HarmonizeWorkspace from 'src/app/obx/pages/schedules/components/harmonize';
import HarmonizeAuto from 'src/app/obx/pages/schedules/components/harmonizeAuto';
import HarmonizeDrawer from 'src/app/obx/pages/schedules/components/harmonizeFlow';
import { zoneName } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';
import HarmonizeSplit from 'src/app/obx/pages/schedules/components/harmonizeSplit';
import MissedHitsDrawer from 'src/app/obx/pages/schedules/components/missedHitsDrawer';
/* `ACL_OBX_SCHEDULES_UPDATE` was **used and never imported**. It only appeared inside the
   missed-visits pill, which was gated to one tab, so the identifier was never evaluated on any
   other — a latent `ReferenceError` that eslint does not catch here (`no-undef` is not enforced
   in this tree) and that `vite build` compiles cleanly. Un-gating the pill fired it and blanked
   the page. */
import {
  ACL_OBX_SCHEDULES_UPDATE,
  ACL_OBX_SITE_EXTRA_JOB_CREATE,
} from 'src/app/router/constant/OBXMODULE';
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
import { ReactComponent as RouteGroupingIcon } from 'src/assets/svg/ACLRunsheet.svg?react';
import { ReactComponent as MHitsIcon } from 'src/assets/svg/MHitsIcon.svg?react';
/* Staggered bars, not the building this segment used to carry — the segment names
   the horizon (a rolling year), not a row, so a building glyph named the wrong half
   of it. Drawn in the same 20×20 / 1.2 stroke / round-cap style as its two
   neighbours, and it is the lightest of the three at the 16px they render at.
   Renamed from `PlanGroupingIcon.svg` to track the segment's own second rename
   (Companies → Plan → Overview) — same glyph, new identifier, so a reader does not
   find a component called "Plan" behind a segment that no longer says it.
   `CompanyGroupingIcon.svg` and `PlanGroupingIcon.svg` are both left in `assets/`
   with no importer. */
import { ReactComponent as OverviewGroupingIcon } from 'src/assets/svg/OverviewGroupingIcon.svg?react';
import { ReactComponent as VisitGroupingIcon } from 'src/assets/svg/VisitGroupingIcon.svg?react';
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
import SchedulesCompanies from '../companies/CompaniesPane';
import { siteTerms } from '../companies/siteTerm';
import CompanySiteSearch from '../components/companySiteSearch';
import ScheduleCalendarFilters from '../components/scheduleCalendarFilters';
import ScheduleErrorBoundary from '../components/scheduleErrorBoundary';
import { SCHEDULE_STATS_FOOTER_VARIANTS } from '../components/scheduleStatsFooter';
import { HARMONIZE_SHELL } from '../config/harmonizeShell';
import { SCHEDULER_LAYOUT } from '../config/schedulerLayout';
import {
  canGroupMainViewByCompany,
  COMPANIES_SCHEDULE_TAB_ID,
  EMBEDDED_SCHEDULE_TAB_ID,
  getOverviewSections,
  getScheduleHeaderTabs,
  getScheduleTabConfig,
  isSingleServiceTenant,
  isVisitsSubject,
  MAIN_VIEW_GROUPING,
  resolveScheduleFooterVariant,
  VISITS_BY_COMPANY_TAB_ID,
  VISITS_SCHEDULE_TAB_ID,
  withCompanyGroupingFilters,
  withRouteGroupingFilters,
} from '../config/scheduleTabConfigs';
import { DEFAULT_VISIT_VIEW_VARIANT, VISIT_VIEW_VARIANT } from '../config/visitViewVariant';
import {
  dayjsWithStandardOffset,
  getCurrentTimeWithDisabledDlsInIso,
  getFranchiseIdWithRoleAndSource,
  getOffsetWithStandardTime,
  getTimezone,
  isShiftScheduleFullyCancelled,
} from '../helper';
import { relocateVisitsForRoutes } from '../helper/applyHarmonizedRoutes';
import { collapseRoutesToStackDays } from '../helper/harmonizedDayStack';
import {
  buildOfficerFromAssignResult,
  updateCalendarShiftOfficerById,
} from '../helper/patchShiftOfficerAssignment';
import { scatterVisitsForDemo } from '../helper/scatterVisitsForDemo';
import {
  buildOverviewFooterStats,
  dropCancelledEvents,
  dropCancelledGroups,
  isCancelledStatusFilter,
  mapGridV2OverviewSections,
  mapGridV2WeekData,
  mapWeekRowsToCalendarResources,
} from '../helper/scheduleResponseAdapter';
import { getVisitActionRules, resolveVisitState } from '../helper/visitState';
import { useCanViewSummaryStats } from '../hooks/useCanViewSummaryStats';
import { useSiteLocations } from '../hooks/useSiteLocations';
import ShiftDetail from '../shiftDetail';
import DedicatedSplitShift from '../shiftDetail/components/dedicatedSplitShift/index';
import ApplySkeleton from './ApplySkeleton';
import { buildRouteVisitCounts } from './routeVisitCount';
import { useStyles } from './scheduleCalendar.styles';
import ScheduleCalendarGrid from './ScheduleCalendarGrid';
import { useApplyMotion } from './useApplyMotion';

export { DUTY_COLORS } from '../helper/scheduleColors';

const params = {
  search: '',
  allSites: [],
  siteLocations: [],
  filter: {
    selectedSites: [],
    selectedCompanies: [],
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

/** A window bound the month grid states as a bare calendar date, with no time. */
const DATE_ONLY_WINDOW = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The end of the visible window, as the instant the API filters on.
 *
 * Week, day and list hand over a full ISO end and are passed through untouched —
 * shifting those would hand each of them an extra day. The month grid hands over
 * a bare **inclusive** date, and a bare date read as an instant is that day's
 * midnight, which is precisely where every visit on the last visible day was
 * being dropped: on the August grid the aggregate counted a visit on Sep 4 while
 * the per-visit month drew none, and the September grid's last cell came back
 * empty. So a date-only end means the end of that day, and the form is detected
 * rather than assumed from the view.
 */
const toWindowEndIso = (windowEnd) =>
  getCurrentTimeWithDisabledDlsInIso(
    DATE_ONLY_WINDOW.test(String(windowEnd ?? '')) ? `${windowEnd}T23:59:59.999` : windowEnd,
  );

/**
 * Sort key for a visit, in the **franchise's** clock — the same projection that
 * places the chip in its cell and prints the time on it.
 *
 * It used to be the absolute instant, on the reasoning that ordering does not need
 * an offset. It does, and the two disagreed on real data: a cell showing `2p` above
 * `8a` was sorted correctly by instant and wrongly by the only clock the reader can
 * see. Whenever a visit's UTC day and its franchise day differ, the instant order
 * and the on-screen order are simply different questions — and the one that matters
 * is the one the chip is labelled with. Sorting on the same projection used to
 * derive `start` and the printed window makes the three agree by construction.
 */
const visitStartValue = (visit) => {
  const raw = visit?.startsAt || visit?.start;
  if (!raw) return '￿';
  const stamp = dayjsWithStandardOffset(raw);
  return stamp.isValid() ? stamp.format('YYYY-MM-DDTHH:mm') : '￿';
};

/**
 * Time order within a month cell, with a stable tie-break.
 *
 * Two visits at the same minute are ordinary here — a site with several filters
 * is one window — and leaving those to payload order let the same month reshuffle
 * between two fetches. Site name, then id, keeps a cell identical each time.
 */
const compareVisitsByStart = (left, right) => {
  const delta = visitStartValue(left).localeCompare(visitStartValue(right));
  if (delta) return delta;

  const leftSite = `${left?.site?.name || left?.siteName || ''}`;
  const rightSite = `${right?.site?.name || right?.siteName || ''}`;
  return (
    leftSite.localeCompare(rightSite, undefined, { sensitivity: 'base' }) ||
    `${left?.id ?? ''}`.localeCompare(`${right?.id ?? ''}`)
  );
};

/** Alphabetical, accent- and case-insensitive, for anything the search offers. */
const compareByName = (left, right) =>
  `${left?.name || ''}`.localeCompare(`${right?.name || ''}`, undefined, { sensitivity: 'base' });

/**
 * The two names a visit can be found by: its customer, then its building.
 *
 * Both live on the event — the month payload carries `companyName` precisely so
 * this needs no join — and both are searched, because naming a building is a way
 * of naming the customer who holds it. Matching only one of them is the bug this
 * pair exists to prevent: on the week grid, matching the row label alone meant
 * typing a store name emptied the grid.
 */
const visitSearchNames = (visit) => [
  `${visit?.companyName || ''}`.trim().toLowerCase(),
  `${visit?.site?.name || visit?.siteName || ''}`.trim().toLowerCase(),
];

/** Where the main view's grouping choice is remembered between sessions. */
const GROUPING_STORAGE_KEY = 'schedules.mainView.grouping';

/**
 * The **third** grouping tab, `Companies`.
 *
 * Not a grouping of the visible window at all, which is why the name says nothing
 * about companies: it swaps the whole grid out for `CompaniesPane`, a rolling
 * twelve-month cadence surface with its own scope control and its own endpoint.
 *
 * `MAIN_VIEW_GROUPING.COMPANIES` is a genuinely different thing: the same week,
 * same fetch shape, rows re-grouped from routes to customers. Both readings are
 * "about companies", so naming this one `COMPANIES_TIMELINE` — or letting it share
 * the string `companies` — would put two values one adjective apart on an axis
 * where every layer downstream (`isCompanyGrouping`, the footer variant, the
 * filter row, the fetch) branches on exactly that distinction. That is the failure
 * this feature already shipped once: the Companies tab's Timeline and Compact
 * labels sat on each other's views because every layer agreed with every other and
 * all were wrong together. So the identifier and the stored string both name the
 * **pane** and contain no `compan*` at all: `isCompanyGrouping` and
 * `showsCompanyTimeline` cannot be misread for one another, and a stored
 * `'companies'` cannot be mistaken for a stored `'timelinePane'`.
 *
 * Module-local rather than a third key on `MAIN_VIEW_GROUPING`, because that enum
 * lives in `config/scheduleTabConfigs`, which the tab row does not own.
 */
const TIMELINE_PANE_GROUPING = 'timelinePane';

/** Everything the grouping tabs can set. */
const GROUPING_VALUES = [...Object.values(MAIN_VIEW_GROUPING), TIMELINE_PANE_GROUPING];

/**
 * **Visits by company is the default reading.** Asked for directly.
 *
 * The tab used to open on routes — rows are runsheets — which answers "what is each
 * round doing this week". The visits reading answers "what does each customer have
 * booked", and on Filter Go that is the question the screen exists for: the work is
 * sold per site on a service cadence, and the planner's morning starts from demand
 * rather than from the vehicles. Routes is one click away for the execution reading.
 *
 * All three readings are accepted here, the timeline pane included, so the choice
 * survives a reload whichever tab the planner left on.
 */
const readStoredGrouping = () => {
  try {
    const stored = window.localStorage.getItem(GROUPING_STORAGE_KEY);
    return GROUPING_VALUES.includes(stored) ? stored : MAIN_VIEW_GROUPING.COMPANIES;
  } catch {
    // Private mode, or storage disabled by policy. Not worth failing a render over.
    return MAIN_VIEW_GROUPING.COMPANIES;
  }
};

/**
 * Which weekday the grid starts its weeks on — FullCalendar's `firstDay`, restated.
 *
 * Saturday. Set on the shared calendar (`components/common/calendar`), so anything
 * that has to name the same week without a calendar mounted has to agree with it or
 * it would be talking about a window straddling two of the grid's weeks.
 */
const GRID_FIRST_DAY = 6;

/**
 * The week the grid would be showing, computed rather than read off the toolbar.
 *
 * The company surfaces have no date navigator and no Day/Week/Month switcher — a
 * rolling twelve months is not a FullCalendar view type — so `selectedView`'s window
 * is either left over from whatever the planner last had on the grid or empty
 * outright, on a load that lands on one of them directly. Harmonize still needs a
 * week, and the only week a planner can predict from a control that says *Harmonize
 * this week*, with no dates anywhere on screen to contradict it, is the one
 * containing today. Reusing the stale grid window instead would make the same button
 * mean a different week depending on where the planner had paged before switching,
 * with nothing on screen to say which.
 *
 * Arithmetic rather than `startOf('week')`, because that reads dayjs's **global**
 * locale — which another module mutates to Saturday as an import side effect. That
 * happens to agree with the grid today and would go silently wrong the day the
 * import moves; the offset below cannot.
 *
 * End is exclusive, matching FullCalendar's own `activeEnd` and therefore what the
 * fetch's window converters already expect.
 */
const currentGridWeekWindow = () => {
  const today = dayjs().startOf('day');
  const start = today.subtract((today.day() - GRID_FIRST_DAY + 7) % 7, 'day');
  return { windowStart: start.toISOString(), windowEnd: start.add(7, 'day').toISOString() };
};

/**
 * A calendar shift, reduced to what a route needs from it.
 *
 * The optimizer receives this projection and nothing else, so anything it cannot
 * derive has to be resolved here, where the whole event payload still exists:
 * the visit's **state** (otherwise the drawer cannot tell a missed visit from an
 * upcoming one) and its **filter count**, which is the only input to how long the
 * stop takes. Geometry the demo data lacks is filled deterministically downstream.
 */
const projectVisitForRoute = (shift) => ({
  id: shift?.id,
  site: shift?.site?.name || shift?.siteName || shift?.name,
  siteId: shift?.site?.id || shift?.siteId || null,
  detail: shift?.runsheetName || shift?.name,
  day: dayjs(shift?.startsAt).format('ddd'),
  startsAt: shift?.startsAt || null,
  lat: shift?.site?.lat ?? shift?.lat ?? null,
  lng: shift?.site?.lng ?? shift?.lng ?? null,
  address: shift?.site?.address || shift?.address || null,
  filterCount: shift?.filterCount ?? shift?.site?.filterCount ?? null,
  serviceMinutes: shift?.serviceMinutes ?? shift?.estimatedMinutes ?? null,
  visitState: resolveVisitState(shift),
  runsheetName: shift?.runsheetName || null,
});

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
  /**
   * The week's real visits, kept apart from `allDuties`.
   *
   * On the routes reading, `allDuties` is whatever the on-screen grid draws —
   * for the tab that can switch grouping, that is the overview accordion's
   * patrol-shift cards, one per route per day, which never carry a HIT-typed
   * shift at all (a route is a runsheet, not a visit, on that fetch). Harmonize
   * needs the individual visits underneath regardless of which reading is on
   * screen, so this is fetched alongside the grid rather than derived from it —
   * see the `harmonizeVisits` local in `getAllDutiesData`, assigned once per
   * branch and written here in one place at the end of that function.
   */
  const [visitsForHarmonize, setVisitsForHarmonize] = useState([]);
  /**
   * The same list for the two company surfaces, which have no grid fetch to ride on.
   *
   * Held apart from `visitsForHarmonize` rather than merged into it because the two
   * have different owners and different lifetimes: that one is written once per grid
   * fetch and wiped by `clearCalendarData`, and both of those run on surfaces this
   * one does not exist on. One state with two writers, one of which clears it on the
   * very tab change that reveals the button, is how a working control turns into a
   * disabled one for reasons nothing on screen explains.
   */
  const [companyWeekVisits, setCompanyWeekVisits] = useState([]);
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
  /**
   * The missed-visits count. **Read again, on every tab.**
   *
   * History, because this state has been orphaned and un-orphaned once and the next reader
   * should not have to reconstruct it: the pill that displayed it was removed on instruction,
   * which left the whole path below — this count, its fetch, `MissedHitsDrawer`'s mount — as
   * live code with no entry point. It came back on the person tab only, and that gate is now
   * dropped so every tab's toolbar carries it (`missedVisitsAction`), on instruction.
   *
   * The reason it is a toolbar pill and not a header one is recorded at the render site, where
   * it is a statement about that row rather than about this variable.
   */
  const [missedHitsCount, setMissedHitsCount] = useState(null);
  const [missedHitDrawerData, setMissedHitDrawerData] = useState(null);

  /**
   * Rows are the companies **with work in the visible range**, always.
   *
   * This was a toggle, off by default, on the argument that a visibly quiet company
   * tells a planner more than an absent one. On a monthly-to-quarterly cadence that
   * argument loses: most of the book is quiet in any given week, so the default view
   * was forty-odd empty rows with the half-dozen that matter scattered through them,
   * and the first thing anyone did on arriving was turn the filter on. A default
   * nobody keeps is not a default.
   *
   * So it is the reading, not an option — which is why there is no control for it
   * any more. Kept as a named constant rather than inlined at both call sites so the
   * grid and the view model cannot drift apart on it, and so the one place to look
   * when this becomes a choice again is here.
   */
  const showOnlyScheduledSites = true;

  /* Selection is still supported by the grid — bulk add (`06` D2) is the flow that
     will use it — but harmonize no longer needs it: the optimizer takes the whole
     week. Nothing currently turns this on. */
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
      return [...previous, projectVisitForRoute(shift)];
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

  /**
   * One scatter per visit to this screen — see `scatterVisitsForDemo`.
   *
   * A ref, not state: nothing renders from it, and it must survive every refetch this
   * component makes so the grid does not reshuffle under a planner who moved the status
   * filter mid-demo. It is re-rolled by the only thing that re-runs this line, which is a
   * fresh mount — arriving at the scheduler, which is exactly the moment the walkthrough
   * starts over.
   */
  const demoScatterSeedRef = useRef(`${Date.now()}-${Math.random()}`);

  /** Set the first time a plan is applied — see `relocateHarmonized`. */
  const demoScatterSuspendedRef = useRef(false);

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
  /**
   * Which of the two candidate layouts this page is drawing — see
   * `config/schedulerLayout`. Every branch below that differs between them reads
   * this one flag, so the two variations are one boolean apart and not a scatter of
   * independent conditions that could drift into a third, unintended layout.
   *
   * Defaulted rather than required, because every other mount of this calendar (the
   * site and user embeds) passes nothing — and both of those are `isEmbeddedSchedule`
   * anyway, where neither the Companies tab nor the grouping toggle exists.
   */
  const isUnifiedToggleLayout = props.schedulerLayout === SCHEDULER_LAYOUT.UNIFIED_TOGGLE;
  const scheduleHeaderTabs = useMemo(
    () =>
      getScheduleHeaderTabs({
        services,
        getLabel,
        t,
        shiftTypes,
        /**
         * **On.** Asked for directly — "add a new tab at top, Installers".
         *
         * Nothing here is new but the flag. `SCHEDULE_TAB_CONFIGS.officer` has always
         * been live (`apiView: 'officer'`, a resource column headed with the tenant's
         * plural term), the view model has an `isOfficerWeekView` branch, and the grid
         * draws that branch as an avatar, a name and the hours booked on the row —
         * which is the design this was asked to match. It was gated "until the view is
         * ready for all tenants", and it has been ready.
         *
         * Still a flag rather than an unconditional push, because that caveat is the
         * honest one: the rows and their hours come from `view=officer` on the grid
         * endpoint, so a tenant whose backend does not answer that call gets an empty
         * tab, and turning it off is the one-line way back.
         */
        includeOfficerTab: true,
        /* The one structural difference between the two layouts. Var 2 retires the
           Companies **tab** — `SCHEDULE_TAB_CONFIGS.companies` stays live either way
           and is still what mounts the pane, reached there from the grouping toggle's
           third segment instead. Var 1 keeps the tab and the toggle stays two-way. */
        includeCompaniesTab: !isUnifiedToggleLayout,
        /* The other half of the same structural difference. Var 1 has no grouping
           toggle, so the visits reading needs a tab to be reachable at all; Var 2
           reaches it from the toggle's second segment and must not also have a tab,
           or the same view would sit in two places one click apart. */
        includeVisitsTab: !isUnifiedToggleLayout,
      }).filter((tab) => !(isUsersModule && tab.id === 'officer')),
    [services, getLabel, t, shiftTypes, isUsersModule, isUnifiedToggleLayout],
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

  /**
   * What the main service tab's left column is, and therefore what its cards are.
   *
   * `ROUTES` is the view this tab has always been: a row per route, cards are the
   * routes. `COMPANIES` re-groups the same week by customer and drops a level — the
   * cards become the individual visits the routes are made of. One dataset, two
   * readings, so it is a switch on this tab rather than a tab of its own.
   *
   * Held here rather than in the grid because the *fetch* changes with it: the two
   * groupings are two different endpoint shapes, not two ways of drawing one
   * response. Declared above every effect that reads it (§7.16) — and now above
   * `rendersOwnPane` too, which the third option feeds.
   */
  const canSwitchGrouping =
    canGroupMainViewByCompany({ services, tabConfig }) && !isEmbeddedScheduleView;
  /* Remembered, like the Companies tab's own view choice: a planner who works by
     customer works that way every morning, and making them re-pick it after every
     reload is asking them to restate a preference the app already heard. */
  const [visitGroupingChoice, setVisitGroupingChoice] = useState(readStoredGrouping);
  /**
   * The stored choice, narrowed to what *this* surface can actually draw.
   *
   * Derived rather than written back, so it suspends the preference without
   * destroying it: a tab that cannot group by company must never be *left* grouped
   * by it — the choice survives a tab change, and reading it through this guard is
   * what keeps it from following the planner onto a tab where it means nothing.
   *
   * The layout variation narrows it a second time. `TIMELINE_PANE_GROUPING` only
   * exists as a segment under Var 2; a planner who selected it there and switched to
   * Var 1 would otherwise land on a stored grouping with no control on screen to
   * leave it by — the pane in the grid's place and the way out of it retired
   * together. It degrades to the visits reading, which is the closest thing Var 1
   * has, and is *not* written back, so switching to Var 2 restores the pane.
   */
  const visitGrouping = !canSwitchGrouping
    ? MAIN_VIEW_GROUPING.ROUTES
    : /* **Var 1 reads the grouping off the tab, not off the stored choice.** The two
         readings are tabs there, so the tab row *is* the control — deriving it from
         `visitGroupingChoice` as well would let a remembered choice contradict the
         tab the planner is standing on (land on Visits, get routes). Var 2 keeps the
         stored choice, which is what its toggle writes. */
      !isUnifiedToggleLayout
      ? activeTab === VISITS_BY_COMPANY_TAB_ID
        ? MAIN_VIEW_GROUPING.COMPANIES
        : MAIN_VIEW_GROUPING.ROUTES
      : visitGroupingChoice;
  const isCompanyGrouping = visitGrouping === MAIN_VIEW_GROUPING.COMPANIES;
  /**
   * The routes reading **of the tab that has the switch** — not "routes anywhere".
   *
   * `visitGrouping` falls back to `ROUTES` for every surface that cannot group by
   * company at all, so the enum on its own is true on the dedicated tab, the patrol
   * tab, the multi-service overview and both embeds. `canSwitchGrouping` is what
   * narrows it to the one tab this is a statement about: a single-service patrol
   * tenant's main tab, which is where `withRouteGroupingFilters` applies and the only
   * place the `Locations`/`All Jobs` argument holds. Gate on this, never on
   * `!isCompanyGrouping`, which would also catch the timeline pane.
   */
  const isRouteGrouping = canSwitchGrouping && visitGrouping === MAIN_VIEW_GROUPING.ROUTES;
  /** The third reading: the company timeline pane, in the grid's place. */
  const showsCompanyTimeline = visitGrouping === TIMELINE_PANE_GROUPING;

  /* One writer for the choice, because two things set it now — the tab row and the
     company drill-through — and remembering it was already a pair of statements. */
  const setGrouping = useCallback((next) => {
    if (!next) return;
    setVisitGroupingChoice(next);
    try {
      window.localStorage.setItem(GROUPING_STORAGE_KEY, next);
    } catch {
      // Remembering the choice is a convenience; losing it must not break the switch.
    }
  }, []);

  /**
   * True whenever this component draws its own pane instead of the shared calendar.
   *
   * Every other reading here is a variant of one FullCalendar resource timeline, so
   * this flag is the seam: it skips the grid fetch (a different endpoint and a
   * different scope), and swaps the grid out at the bottom of this component.
   *
   * **Two ways in, one seam.** A tab whose config says `rendersOwnPane`, or the
   * Companies grouping tab — the same pane either way, so both have to reach the
   * same branch or the grouping would swap the grid for nothing and leave a week
   * fetch running behind an unmounted grid.
   *
   * Declared above every effect that reads it — a `const` used by a hook declared
   * further up is a temporal dead zone that builds and lints clean, then blanks this
   * page at runtime (§7.16).
   */
  const rendersOwnPane =
    (Boolean(tabConfig?.rendersOwnPane) || showsCompanyTimeline) && !isEmbeddedScheduleView;

  /* Whether the cards on screen are visits decides the words used about them, and
     that is not the same question as which tab is active: the copy used to key off
     `isVisitsTab`, which is false for the company grouping on the main tab, so a
     grid full of visits was announcing "8 shifts require assignment". */
  const showsVisits = isVisitsSubject({ tabConfig, isCompanyGrouping });
  /* Which visit card design to draw. Owned by the parent — which also renders the
     switch that sets it, as a floating control over the grid rather than a toolbar
     pill — so this only reads it, and defaults, because every other mount of this
     calendar (the site and user embeds) passes nothing. */
  const visitCardVariant = props.visitCardVariant ?? DEFAULT_VISIT_VIEW_VARIANT;
  /** Narrows the company rows by name. Local to this grouping; cleared with it. */
  const [companyQuery, setCompanyQuery] = useState('');
  /**
   * The one company — or the one building — the planner picked from the search.
   *
   * Kept apart from `companyQuery` because it is a different act: free text is a
   * guess that narrows rows while you refine it, a pick is a commitment to a
   * destination. Holding both in the query string would have made the commitment
   * disappear the moment the text was edited, and made "Walmart" the company
   * indistinguishable from "walmart" the four letters someone was still typing.
   *
   * `{ kind, customerId, companyName, siteId, label }`, exactly as the search hands
   * it over. Null means nothing is committed.
   */
  const [companySelection, setCompanySelection] = useState(null);
  /**
   * The company a planner clicked through with, handed to the Companies tab.
   *
   * Clicking a company on the week grid is a question about that customer's year,
   * which is the other tab's whole subject — so the click changes tab *and* carries
   * the company with it. Landing there unfiltered would make the planner find the
   * row they just clicked, which is the drill-through failing at its last step.
   */
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  /**
   * Whether this surface offers Harmonize at all — one answer, three readers.
   *
   * The button's own gate, the list it acts on and the guard that tears the drawer
   * down all used to spell this out separately, and the three had already drifted:
   * the trailing clause on the button admitted the Companies **tab** nowhere while
   * the guard only knew about the timeline pane. Derived once here, above every
   * reader, so a surface cannot be added to one and forgotten in another.
   *
   * `rendersOwnPane` is exactly the pair of company surfaces — the Companies tab
   * under Var 1, the timeline segment under Var 2 — and it already excludes the
   * embeds, but the other two arms do not, so the embed exclusion stays out front.
   *
   * Day view is *not* part of this: it is a fact about the grid's window and the
   * company surfaces have no window control at all, so it belongs with the button
   * (which is also the only reader declared after `isDayView` exists).
   */
  const offersHarmonize =
    !isEmbeddedScheduleView &&
    (activeTab === VISITS_SCHEDULE_TAB_ID || canSwitchGrouping || rendersOwnPane);

  /**
   * Every visit in the week the optimizer is allowed to plan.
   *
   * "Still actionable" is exactly what `getVisitActionRules` already decides, so
   * this asks it rather than keeping a second list of states that could disagree:
   * completed and cancelled visits are history (D4), a past date is read-only
   * (D5) — and **missed is the exception that survives its own date**, which is
   * why a past week still has something to optimize.
   *
   * Declared **after** `activeTab`, not with the other harmonize state above:
   * a `useMemo` that reads a `const` declared further down the component is a
   * temporal dead zone, and it blanks the page at runtime while building and
   * linting clean (§7.16).
   */
  const harmonizableVisits = useMemo(() => {
    /* Harmonize follows the visits, not the tab. Retiring the Visits tab would
       otherwise have retired the optimizer with it — the CTA was gated on that tab
       id — so the gate is "are the things on screen visits at all", which is a
       fact about the *tab*, not about which of the toggle's two groupings happens
       to be selected — toggling between them is not a reason to hide the button.
       That fact is about the tab, not about `allDuties`: the routes reading's own
       grid never draws a HIT-typed shift, so neither source below is `allDuties`. */
    if (!offersHarmonize) return [];
    /* Two sources, because the company surfaces skip the grid fetch entirely —
       `visitsForHarmonize` is empty there by construction, not by accident, so
       reading it would light the button and hand the optimizer nothing. Which
       week each one holds differs too: the grid's is the window on screen, the
       pane's is `currentGridWeekWindow` — see the fetch that fills it. */
    const source = rendersOwnPane ? companyWeekVisits : visitsForHarmonize;
    return (source || [])
      .filter((shift) => shift?.shiftType === SCHEDULE_DUTIES.HIT)
      .filter((shift) => !getVisitActionRules(shift).isReadOnly)
      .map(projectVisitForRoute);
  }, [visitsForHarmonize, companyWeekVisits, offersHarmonize, rendersOwnPane]);

  /**
   * How many visits each route card on the grid is carrying.
   *
   * The routes reading's own grid has no such number in it — its cards are
   * runsheets, and a runsheet is not a visit on that fetch — so the count comes off
   * the visit list this page already holds for the same window. **`visitsForHarmonize`
   * and not a rawer list**, for the reason the header total reads the footer rather
   * than counting `allDuties`: cancelled visits are already out of it, and a
   * cancelled visit is not drawn on this grid unless the status filter asks for it,
   * so counting one would put a number on a card for work the card does not show.
   *
   * Not `harmonizableVisits`, which is the same list narrowed to what the optimizer
   * may *move* — completed, cancelled and past-dated visits are dropped there (D4,
   * D5). Those are still visits on the run, and a Tuesday whose stops are all done
   * must not read `0`.
   *
   * Gated on the routes reading because it is the only one whose cards are routes;
   * every other surface hands the grid `null` and draws no count at all.
   */
  const routeVisitCounts = useMemo(
    () => (isRouteGrouping ? buildRouteVisitCounts(visitsForHarmonize) : null),
    [isRouteGrouping, visitsForHarmonize],
  );

  /* Harmonize belongs wherever visits are. Leaving that surface must not strand a
     selection the planner can no longer see, nor ghosts on a calendar with no
     drawer — leaving the tab that offers visits at all is leaving it; toggling
     between that tab's two groupings is not, so the grouping itself no longer
     appears in this guard.

     The timeline pane used to be treated as leaving it too, and is not any more:
     Harmonize is offered there now, so tearing the drawer down on arrival would
     close the very thing the button had just opened. The *selection* still goes,
     and the preview with it — both are marks on a grid that this surface replaces,
     and the workspace no longer needs a selection to have something to solve. */
  useEffect(() => {
    if (!offersHarmonize) {
      setSelectionMode(false);
      setSelectedShifts([]);
      setHarmonizeOpen(false);
      setHarmonizePreview(null);
      return;
    }

    if (rendersOwnPane) {
      setSelectionMode(false);
      setSelectedShifts([]);
      setHarmonizePreview(null);
    }
  }, [offersHarmonize, rendersOwnPane]);

  /* A search that outlives the rows it filtered is a hidden filter: switch back to
     routes and the box is gone, so the query it held has to go with it — and the
     company it had committed to, which narrows the grid to a single row and would
     be even harder to notice with nothing on screen holding it. Tab changes come
     through here too: leaving the main tab drops the grouping, which drops both. */
  useEffect(() => {
    if (!isCompanyGrouping) {
      setCompanyQuery('');
      setCompanySelection(null);
    }
  }, [isCompanyGrouping]);

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
    setVisitsForHarmonize([]);
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

    // Company narrows the Sites dropdown's own option list (see `siteOptions` in
    // `ScheduleCalendarFilters`); a site left selected from before the narrowing
    // would show a chip for an option no longer offered, so drop it here too.
    let nextSelectedSites;
    if (key === 'selectedCompanies') {
      const nextCompanyIds = new Set(
        toSelectedIds(Array.isArray(nextValue) ? nextValue : []).map(String),
      );
      if (nextCompanyIds.size) {
        const validSiteIds = new Set(
          (queryParams.allSites || [])
            .filter((site) => nextCompanyIds.has(String(site?.customerId)))
            .map((site) => String(site?.id ?? site?.value ?? '')),
        );
        const currentSites = Array.isArray(queryParams.filter.selectedSites)
          ? queryParams.filter.selectedSites
          : [];
        const stillValidSites = currentSites.filter((selected) =>
          validSiteIds.has(String(selected?.value ?? selected?.id ?? '')),
        );
        if (stillValidSites.length !== currentSites.length) {
          nextSelectedSites = stillValidSites;
          loadLocationOptionsForSites(stillValidSites);
        }
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
        ...(nextSelectedSites !== undefined && { selectedSites: nextSelectedSites }),
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

  /* Which footer describes this grid is a question about the *grouping*, and the
     grouping lives here — the page above only knows the tab, and both readings of
     the main tab share one config. So the resolved variant is handed up the same
     way the status control is. */
  const onFooterVariantChange = props.onFooterVariantChange;
  /**
   * Which footer describes this grid, resolved once.
   *
   * The timeline pane brings its own summary and wants no page footer, which is
   * what the Companies **tab** gets for free: its config's `footerVariant` is
   * `null`, and the page also sees `rendersOwnPane` on that tab and suppresses
   * the legend. Neither is true of Variation 2 — the tab is still `overview`, so
   * the page would draw the overview stats bar, empty, under a pane that has no
   * shifts to count.
   *
   * `NONE` rather than `null` because the page resolves this with `??`: null means
   * "nothing reported yet, fall back to the tab's own variant", and the tab's own
   * variant is exactly the wrong answer here. `NONE` is an answer — *no footer* —
   * and the page matches it explicitly rather than by falsiness.
   *
   * Held as a value rather than computed inside the effect below because the header
   * total now reads it too: the total is the footer's own numbers added up, so it
   * has to be counted the way the footer on screen counts (see
   * `sumScheduleWindowTotal`). One resolution, two readers.
   */
  const footerVariant = showsCompanyTimeline
    ? SCHEDULE_STATS_FOOTER_VARIANTS.NONE
    : resolveScheduleFooterVariant(isEmbeddedScheduleView ? EMBEDDED_SCHEDULE_TAB_ID : activeTab, {
        isCompanyGrouping,
      });
  useEffect(() => {
    onFooterVariantChange?.(footerVariant);
  }, [onFooterVariantChange, footerVariant]);

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

  /**
   * What an aggregate month cell says it is holding.
   *
   * A tenant that sells one service is already told which one by the tab it is
   * standing on, so naming it again in all thirty-one cells stated the constant
   * and hid the variable: `2x Filter Replacement Service` truncated to
   * `2x Filter Replacement Servi…` in a 148px cell, and the count — the only
   * thing that differs from day to day — was the part squeezed out. The count
   * leads, followed by the tenant's own noun for the unit.
   *
   * Multi-service tenants keep the full service name, because there one cell can
   * hold an entry per service and the name is the only thing telling them apart.
   */
  const namesOneServicePerMonthCell = isSingleServiceTenant(services) && services?.patrol === true;
  const getMonthDutyName = (dutyType, count) =>
    namesOneServicePerMonthCell
      ? t('obx.schedules.calendar.visits.monthTotal', {
          total: count,
          hits: getLabel('terms', count === 1 ? 'hit' : 'hits', t),
        })
      : `${count}x ${dutyNameMonth[dutyType]}`;

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
            name: getMonthDutyName(current?.type, count),
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

  /**
   * The window's counts, handed **up** to the page that draws the legend.
   *
   * They were also held here, for a `9 Visits` total in the header cluster. That total
   * has been removed, and the local copy went with it: the page above is the only
   * reader now, so keeping a second copy in this component would be state nothing
   * renders — and the next person to find it would have to work out which of the two
   * was authoritative.
   *
   * Every branch still reports through `reportFooterStats` rather than calling the prop
   * directly, which is what keeps the legend from going stale on any one path.
   *
   * `null` where a payload genuinely has no counts to give — the day view, the embedded
   * grids, and every month still answered by `/aggregate`.
   */
  const onFooterStatsChange = props.onFooterStatsChange;
  const reportFooterStats = useCallback(
    (footerStats) => {
      onFooterStatsChange?.(footerStats || null);
    },
    [onFooterStatsChange],
  );

  /**
   * A month of individual visits, for the company grouping's month view.
   *
   * The default month path calls `/aggregate`, which returns one count per day per
   * service — the right payload for a cell that says `12 Visits` and the wrong one
   * for a cell that names them. So this asks the visits grid for the whole month
   * window instead and hands back one event per visit; FullCalendar drops each into
   * its day cell and caps the stack with its own "+N more".
   *
   * `start` is narrowed to a date, and `end` dropped, on purpose: it makes each
   * visit an all-day event, which is what puts the chip in the cell's flow rather
   * than on a time axis the month grid does not have. The date is resolved through
   * the franchise offset, the same helper the week grid places cards with, or a
   * late-evening visit would land a day out for anyone outside that timezone.
   *
   * That trick costs the cell its ordering, so the events are sorted here: with
   * `end` gone and `start` flattened to a date, every chip in a day carries an
   * identical sort key, FullCalendar has nothing left to order on and falls back
   * to payload order — which drew `2p-4p` above `11a-1p` on eight of the month's
   * twenty-eight populated days. Sorting on the real `startsAt` before handing the
   * events over keeps the all-day placement and gets the sequence back.
   */
  const getVisitsByMonth = async (query, config) => {
    const data = await getAllDuties(
      { ...query, view: 'visits', groupBy: 'company', schedule: true },
      config,
      { applyFooterStats: false },
    );

    setRequireAttentionJobs(getUnassignedCount(data));

    const shifts = (data?.shifts || [])
      .map((visit) => {
        const event = { ...visit };
        delete event.end;
        return {
          ...event,
          start: dayjsWithStandardOffset(visit.startsAt || visit.start).format('YYYY-MM-DD'),
          /* The key FullCalendar actually orders a day's chips by — see the
             `eventOrder` note on the `dayGridMonth` config. Sorting the array was
             not enough on its own: FC re-sorts, and with every chip sharing a
             date-only all-day start its default comparator fell through to `title`,
             which here is the window's *name* and put `Afternoon` above `Morning`. */
          sortKey: visitStartValue(visit),
        };
      })
      .sort(compareVisitsByStart);

    /* This is the week grid's endpoint asked for a month, so it returns the week
       grid's `footerStats` — they were simply being dropped on the floor while the
       footer below rendered a row of labels with nothing in them. */
    return { shifts, footerStats: data?.footerStats || null };
  };

  /**
   * A month of **route cards**, for the routes reading of the main tab.
   *
   * ── Why this exists rather than an extended `/aggregate` ──
   *
   * `/aggregate` answers one tally per day per service — no per-route records at all,
   * not even an id — so it can say `12 Visits` on a Tuesday and nothing about which
   * routes were out. Naming them needs records, and there were two ways to get them:
   * teach the aggregate a per-route breakdown, or ask for the grid the week already
   * draws from. This is the second.
   *
   * The aggregate was the cheaper fetch and the worse answer. A per-route breakdown
   * would be a **second shape for the same fact** — the week's route cards and the
   * month's route entries built by different code from different payloads — and the
   * two would then have to be kept saying the same thing by hand. This feature has
   * already shipped one instance of exactly that failure (a missed-visits pill reading
   * 3 over a grid drawing 2), which is why the count on these cards is a lookup into
   * the week's own visit list rather than a field. Asking for the *same two payloads
   * the routes week asks for* makes the month and the week agree by construction: same
   * endpoint, same `mapGridV2WeekData`, same `buildRouteVisitCounts`. A route reads
   * the same in both views because it is the same object drawn twice.
   *
   * It is also not expensive. Two calls, where the routes week already makes three
   * (KPI stats, the patrol grid, the visits list — see the overview branch below);
   * `/aggregate` keeps every other month it serves — the patrol and dedicated tabs,
   * the multi-service overview, the site and user embeds, the visits tab — because
   * none of those has a route to name and a tally is the right answer there. This is
   * the one reading whose cards are routes.
   *
   * ── The two calls ──
   *
   * The grid is `view: 'patrol'`, which is the only service this reading can be on
   * (`canGroupMainViewByCompany` gates it to a single-service patrol tenant), so
   * unlike the week's accordion there is no second service to fetch and merge.
   * `responseVersion: 'grid-v2'` because `mapGridV2WeekData` reads `sections[]` — the
   * rows are thrown away (a month grid has no resource column) and only the mapped
   * shifts are kept, which is precisely what makes these the week's own cards: the
   * same mapper normalises `start` to a bare `YYYY-MM-DD` and falls a card's route
   * back to its row title. `schedule: true` for the same reason the week and the
   * visits month both send it — this is a grid fetch, not a list one.
   *
   * **No second reading of the response**, deliberately. A payload with no `sections`
   * maps to nothing and the month draws empty, which is a loud failure; the
   * alternative — a fallback that normalises the flat pre-revamp `shifts` by hand —
   * would be a second way of turning this payload into cards, and one shape per fact
   * is the whole argument above. The sections shape is the contract.
   *
   * The visits list is the week's `harmonizeVisitsPromise`, verbatim — same query,
   * and the same swallowed failure, so a grid that loaded is not blanked by a list
   * that did not. It is what `routeVisitCounts` counts, and lighting up Harmonize on
   * this combination is a deliberate consequence rather than a side effect: it was
   * only ever disabled here because the aggregate had no visits to give it, and the
   * *visits* month next door has offered it since the day it was built.
   *
   * `sortKey` for the same reason `getVisitsByMonth` stamps one: the month view's
   * `eventOrder` is `sortKey`, and with `end` dropped and `start` flattened to a date
   * every chip in a cell ties on FullCalendar's default keys.
   */
  const getRoutesByMonth = async (query, config) => {
    const [gridRes, monthVisits] = await Promise.all([
      getAllDuties(
        { ...query, view: 'patrol', responseVersion: 'grid-v2', schedule: true },
        config,
        { applyFooterStats: false },
      ),
      getAllDuties({ ...query, view: 'visits', groupBy: 'company', schedule: true }, config, {
        applyFooterStats: false,
      })
        .then((visitsRes) => visitsRes?.shifts || [])
        .catch(() => []),
    ]);

    const shifts = mapGridV2WeekData(gridRes)
      .shifts.map((shift) => ({ ...shift, sortKey: visitStartValue(shift) }))
      .sort(compareVisitsByStart);

    return { shifts, visits: monthVisits, footerStats: gridRes?.footerStats || null };
  };

  const getAllDuties = async (query, config, { applyFooterStats = true } = {}) => {
    try {
      query.windowStart = getCurrentTimeWithDisabledDlsInIso(query?.windowStart);
      /* A date-only end is the month grid's, and it is inclusive — see
         `toWindowEndIso`. Converting it the same way as the start gave midnight
         and silently cut the last visible day out of every month fetch. */
      query.windowEnd = toWindowEndIso(query?.windowEnd);

      const response = await allDutyData(query, config);
      const data = response?.data || {};

      if (applyFooterStats) {
        setRequireAttentionJobs(getUnassignedCount(data));
        reportFooterStats(data.footerStats || null);
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
      const statsWindowEnd = windowEnd ? toWindowEndIso(windowEnd) : null;
      const statsCache = overviewKpiStatsRef.current;
      const shouldFetchOverviewStats =
        canFetchSummaryStats &&
        fetchTabConfig.isOverviewTab &&
        type === DAY_GRID.WEEK &&
        !isEmbeddedScheduleView &&
        (statsCache.windowStart !== statsWindowStart || statsCache.windowEnd !== statsWindowEnd);

      // Keep overview footer visible while grids refetch; only clear when stats will refetch.
      if (shouldFetchOverviewStats || !fetchTabConfig.isOverviewTab || type !== DAY_GRID.WEEK) {
        reportFooterStats(null);
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
      /* The company grouping's filter row drops `All Jobs`, `Locations` and the
         technician dropdown — see `withCompanyGroupingFilters` for why each one goes
         — so the fetch has to drop them with it: a filter still narrowing the
         payload with no control left to turn it off is the worst kind. The planner's
         own selections stay in `queryParams`, so switching back to the routes
         reading brings each one back with its dropdown rather than silently
         discarding it. */
      const ignoresCompanyGroupingFilters = isCompanyGrouping && !isEmbeddedScheduleView;
      /* The routes grouping's row drops `All Jobs` and `Locations` too — see
         `withRouteGroupingFilters`. Same rule, one dimension shorter: the officer
         dropdown is still on screen here, so `officerId` is still sent. */
      const ignoresRouteGroupingFilters = isRouteGrouping && !isEmbeddedScheduleView;
      const ignoresGroupingShiftType = ignoresCompanyGroupingFilters || ignoresRouteGroupingFilters;
      const shiftType =
        isEmbeddedScheduleView ||
        (fetchTabConfig.filters.showShiftType && !ignoresGroupingShiftType)
          ? filter?.selectedDutyType?.value
          : undefined;
      const shiftStatus = filter?.selectedStatus?.value;
      /* Day and month drop `locationId` and `officerId` while keeping `siteId` and
         `shiftStatus`, which is the whole reason the filter row is two controls
         shorter in those views — the filter component states the other half of
         this rule beside the flag that hides them. Keep the two in step: a
         dimension sent here with no dropdown left to clear it is a hidden filter,
         and a dropdown left on screen that this drops is a dead control. */
      const isDayOrMonthView = type === DAY_GRID.DAY || type === DAY_GRID.MONTH;
      const locationId = isEmbeddedScheduleView
        ? filter?.selectedLocations?.value
        : isDayOrMonthView || ignoresCompanyGroupingFilters || ignoresRouteGroupingFilters
          ? undefined
          : getSelectedFilterValues(filter?.selectedLocations);
      const officerId = isUsersModule
        ? props.officerId
        : isEmbeddedScheduleView || isDayOrMonthView || ignoresCompanyGroupingFilters
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
      /* Stays `[]` for any branch that does not explicitly set it — day view, the
         embedded grid, and the months still answered by `/aggregate`, none of which
         hand back a real visit list. See `visitsForHarmonize`. */
      let harmonizeVisits = [];

      const config = { signal: apiController.signal };
      if (type == DAY_GRID.MONTH) {
        /* The month used to clear the footer unconditionally, which is why it drew
           a stats bar with no stats. Both months that call a grid endpoint — the
           company grouping's visits, and the routes reading's runs — carry the same
           counts the week does; the aggregate month genuinely has none to give (its
           payload is one tally per day per service), so that path still clears and
           the footer falls back to the legend. */
        let monthFooterStats = null;

        if (isCompanyGrouping) {
          const visitsMonth = await getVisitsByMonth(query, config);
          shifts = visitsMonth.shifts;
          monthFooterStats = visitsMonth.footerStats;
          // Already the real per-visit list — see `visitsForHarmonize`.
          harmonizeVisits = shifts;
        } else if (isRouteGrouping) {
          /* The routes reading's month used to be `/aggregate` too — a count per
             day per service, no per-route records at all — which is why its cells
             could only say how much work a day held and never which routes were
             out, and why Harmonize was dark here. It now asks for the same grid
             and the same visit list the routes *week* asks for, so both readings
             draw the same cards from the same payload; see `getRoutesByMonth` for
             why that beats teaching the aggregate a per-route breakdown. */
          const routesMonth = await getRoutesByMonth(query, config);
          shifts = routesMonth.shifts;
          monthFooterStats = routesMonth.footerStats;
          /* The real per-visit list, which is what `routeVisitCounts` counts — so a
             month card's count is the week's own number, not a month derivation of
             it. Cancelled visits are cut from it below, the same as everywhere. */
          harmonizeVisits = routesMonth.visits;
          /* Read off the footer, like the week's own routes reading does, rather
             than from a second field — the pill and the stats bar under the grid
             cannot then disagree. */
          setRequireAttentionJobs(getUnassignedCount({ footerStats: routesMonth.footerStats }));
        } else {
          query.offset = getOffsetWithStandardTime();
          shifts = await getDutiesByMonth(query, config);
          /* Still the aggregate, and rightly: the patrol and dedicated tabs, the
             multi-service overview and both embeds have no route to name in a
             cell, so a tally per day per service is the answer there — and it
             carries no per-visit records, so Harmonize stays disabled on those. */
        }
        if (isStaleFetch()) return;
        reportFooterStats(monthFooterStats);
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
        /* The grouping outranks the tab's own view: a day asked for by customer
           has to come back grouped by customer, or switching to Day would quietly
           drop the planner back into the route reading. */
        if (isCompanyGrouping) {
          query.view = 'visits';
          query.groupBy = 'company';
        }
        const dayViewData = await getAllDuties(query, config);
        if (isStaleFetch()) return;
        reportFooterStats(null);
        dayViewShifts = dayViewData?.shifts || {};
        setDayViewLocations(dayViewData?.locations || []);
      } else if (type == DAY_GRID.WEEK) {
        if (isEmbeddedScheduleView) {
          const res = await getAllDuties(query, config);
          if (isStaleFetch()) return;
          reportFooterStats(null);

          shifts = (res.shifts || []).map((shift) => ({
            ...shift,
            start: dayjsWithStandardOffset(shift.start || shift.startsAt).format('YYYY-MM-DD'),
          }));
          weekViewLocations = res.locations || [];
          setRequireAttentionJobs(getUnassignedCount(res));
        } else if (isCompanyGrouping) {
          /**
           * The company grouping is a visits grid on the main tab, so it takes the
           * per-service tabs' fetch — one grid-v2 call, rows straight to resources —
           * and not the overview tab's accordion path.
           *
           * The KPI stats call stays, because the *tab* has not changed: coverage,
           * hours and runsheets completed are facts about the week, not about how
           * its rows are grouped, and dropping them would empty the footer as a
           * side effect of a view switch. Only the bottom legend row comes from the
           * visits grid, which is the half that does change.
           */
          const windowStartIso = getCurrentTimeWithDisabledDlsInIso(query.windowStart);
          const windowEndIso = toWindowEndIso(query.windowEnd);
          const cache = overviewKpiStatsRef.current;
          const shouldFetchStats =
            canFetchSummaryStats &&
            (cache.windowStart !== windowStartIso || cache.windowEnd !== windowEndIso);

          const statsPromise = shouldFetchStats
            ? getDutySummaryStats(
                { windowStart: windowStartIso, windowEnd: windowEndIso, isSite: query.isSite },
                config,
              )
                .then((statsRes) => {
                  const data = statsRes?.data || null;
                  overviewKpiStatsRef.current = {
                    windowStart: windowStartIso,
                    windowEnd: windowEndIso,
                    data,
                  };
                  return data;
                })
                .catch(() => {
                  overviewKpiStatsRef.current = { windowStart: null, windowEnd: null, data: null };
                  return null;
                })
            : Promise.resolve(cache.data);

          const [kpiData, res] = await Promise.all([
            statsPromise,
            getAllDuties({ ...query, view: 'visits', groupBy: 'company' }, config, {
              applyFooterStats: false,
            }),
          ]);
          if (isStaleFetch()) return;

          const normalizedWeek = mapGridV2WeekData(res);
          shifts = normalizedWeek.shifts;
          weekViewLocations = mapWeekRowsToCalendarResources(normalizedWeek.rows);
          // Already the real per-visit list — see `visitsForHarmonize`.
          harmonizeVisits = shifts;
          // Nothing to expand: the accordion sections belong to the routes reading.
          setOverviewSections([]);
          setRequireAttentionJobs(getUnassignedCount(res));
          reportFooterStats(buildOverviewFooterStats(kpiData || {}, res.footerStats));
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
          const windowEndIso = toWindowEndIso(query.windowEnd);
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

          /* This branch is what the routes reading actually fetches on the tab
             that can switch grouping (that tab's config *is* the overview config
             — see `canGroupMainViewByCompany`) — and its own grids above are
             patrol/dedicated shift cards, one per route per day, none of which
             is ever HIT-typed. Harmonize needs the real visits underneath
             regardless of which reading is on screen, so ask for them the same
             way the companies reading already does (`view: 'visits'`), run
             alongside the accordion's own calls rather than after them so the
             grid is not held up waiting on a fetch it never draws from itself,
             and swallow a failure here rather than let it blank a grid that
             loaded fine — see `visitsForHarmonize`. Skipped entirely on a tab
             that cannot switch grouping: nothing there can ever show the button. */
          const harmonizeVisitsPromise = canSwitchGrouping
            ? getAllDuties({ ...query, view: 'visits', groupBy: 'company' }, config, {
                applyFooterStats: false,
              })
                .then((visitsRes) => visitsRes?.shifts || [])
                .catch(() => [])
            : Promise.resolve([]);

          const [kpiData, gridSettled, harmonizeVisitsResult] = await Promise.all([
            statsPromise,
            gridsPromise,
            harmonizeVisitsPromise,
          ]);
          if (isStaleFetch()) return;

          harmonizeVisits = harmonizeVisitsResult;

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
            reportFooterStats(footerStats);
          } else {
            setRequireAttentionJobs(0);
            reportFooterStats(null);
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
          /* Only ever HIT-typed on the (currently unreachable from the tab bar)
             visits tab, whose own `apiView` is `visits` — see
             `SCHEDULE_TAB_CONFIGS.visits`. Harmless to assign unconditionally on
             the dedicated/patrol tabs too: `harmonizableVisits`'s own gate above
             already returns `[]` for them before this list is ever read. */
          harmonizeVisits = shifts;
        }
      }

      if (isStaleFetch()) return;

      /**
       * **Cancelled is hidden unless it is what was asked for**, on every view this
       * function feeds — week, day, month-as-cards, the list, the overview tabs and
       * the company grouping. Applied here because this is the one point every
       * branch above converges on, whatever shape it fetched.
       *
       * `shiftStatus` is the value that went out with the request, so "did the
       * planner ask for cancelled" is read from the same fact the payload was
       * narrowed by. See `dropCancelledEvents` for why this is a cut on arrival
       * rather than part of the query.
       *
       * `weekViewLocations` is deliberately not cut: those are the grid's *rows*,
       * not its cards. A location whose only visit this week was cancelled keeps its
       * lane and reads as empty, which is the same call the Companies planning grains
       * make for a quiet row — and the alternative is rows appearing and vanishing as
       * the status filter moves.
       */
      const keepCancelled = isCancelledStatusFilter(shiftStatus);

      /**
       * **The walkthrough's mess, put back.**
       *
       * Applied here, at the one point every branch converges on, and to *both* collections
       * rather than to the grid's alone: on the routes reading these are two different
       * fetches, and a visit the grid drew on Thursday while the optimizer planned it on
       * Monday would make the plan and the cards it moves disagree. They cannot drift —
       * `scatterVisitsForDemo` keys the day off the visit's own id, so the same visit lands
       * on the same day in whichever list it turns up in. See that module for the scope of
       * this, which is narrow: nothing is written and nothing is invented.
       */
      const scatter = (list) =>
        demoScatterSuspendedRef.current
          ? list
          : scatterVisitsForDemo(list, {
              seed: demoScatterSeedRef.current,
              from: query.windowStart,
              to: query.windowEnd,
            });

      setListDuties(dropCancelledGroups(listShifts, keepCancelled));
      setDayViewDuties(dropCancelledGroups(dayViewShifts, keepCancelled));
      setWeekViewLocations(weekViewLocations);
      setAllDuties(scatter(dropCancelledEvents(shifts, keepCancelled)));
      /* Harmonize plans real work. A called-off visit is not work, and it has no
         business consuming a man-day in a proposed route. */
      setVisitsForHarmonize(scatter(dropCancelledEvents(harmonizeVisits, keepCancelled)));
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
        reportFooterStats(null);
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
      reportFooterStats(null);
      props.onTabChange?.(tabId);
    },
    [
      activeTab,
      clearCalendarData,
      isEmbeddedScheduleView,
      reportFooterStats,
      props.onTabChange,
      t,
      tabConfig.filters.shiftTypeOptionsKey,
      tabConfig.filters.patrolStatusOptions,
      tabConfig.filters.showLocation,
      tabConfig.filters.showOfficer,
    ],
  );

  /**
   * Clicking a company row asks for that customer's year, which is the pane's
   * subject — so the click carries the company to where the pane lives.
   *
   * *Where* that is depends on the layout, and the drill-through has to follow it or
   * it lands nowhere. Under Var 2 the pane is a grouping: sending the planner to the
   * Companies **tab** would set a tab that is not in the row, and the "keep the
   * active tab valid" effect would bounce them straight back to the main tab — a
   * drill-through that visibly flickers and ends where it started. Under Var 1 the
   * tab is exactly where it lives. Both mount the same pane with the same
   * `initialCustomerId`.
   */
  const handleSelectCompany = useCallback(
    (customerId) => {
      if (!customerId) return;
      setSelectedCompanyId(String(customerId));
      if (isUnifiedToggleLayout) {
        setGrouping(TIMELINE_PANE_GROUPING);
        return;
      }
      handleTabClick(COMPANIES_SCHEDULE_TAB_ID);
    },
    [handleTabClick, isUnifiedToggleLayout, setGrouping],
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

  /**
   * The grid takes the harmonized plan on.
   *
   * Reads the duties through `calendarDataRef` rather than closing over
   * `allDuties`, so the callback is stable and the motion hook is not re-created on
   * every fetch — the same reason the officer-assign handler above does it.
   */
  /**
   * The plan, re-dealt onto three days — see `harmonizedDayStack`.
   *
   * Both paths below run the routes through this. It used to be asked twice per Apply —
   * once to learn which cards were leaving, once to move them — and the two answers had to
   * agree or the sequence would lift one set of cards and land another. With the flights
   * gone it is asked once, at the relocation, so that hazard is gone with them.
   */
  const stackRoutesForDemo = useCallback(
    (routes = []) => {
      /* The window on screen, with the pane's own week behind it — the company surfaces skip
         the grid fetch, so `selectedView` is empty there and `currentGridWeekWindow` is the
         week their visits came from. Same pair of sources `harmonizableVisits` reads. */
      const view = queryParams.selectedView || {};
      const fallback = currentGridWeekWindow();

      return collapseRoutesToStackDays(routes, {
        from: view.windowStart || fallback.windowStart,
        to: view.windowEnd || fallback.windowEnd,
        visits: calendarDataRef.current.allDuties,
        routeTerm: getLabel('terms', 'runsheet', t),
      });
    },
    [queryParams.selectedView, getLabel, t],
  );

  const relocateHarmonized = useCallback((routes = []) => {
    const { duties, moves } = relocateVisitsForRoutes(calendarDataRef.current.allDuties, routes);
    if (!moves.size) return moves;

    /* **The walkthrough's scatter stops here.** It exists to give Harmonize a mess to fix,
       and the moment the plan lands the mess is the thing that was fixed — a refetch that
       re-scattered the same visits would undo the payoff on screen, in front of whoever was
       being shown it. Suspended for the rest of this visit to the screen; arriving again
       re-rolls the seed and the walkthrough starts over. */
    demoScatterSuspendedRef.current = true;

    calendarDataRef.current = { ...calendarDataRef.current, allDuties: duties };
    setAllDuties(duties);
    return moves;
  }, []);

  /* `onPlan` is gone with the flights — it existed so the departing beat could know which
     cards were about to leave one beat before they left. Nothing measures cards any more. */
  const applyMotion = useApplyMotion({
    onRelocate: (routes) => relocateHarmonized(stackRoutesForDemo(routes)),
  });

  const getMissedHitsCountFunc = async ({ start, end }) => {
    try {
      setMissedHitsCount(undefined);

      const startsAt = getCurrentTimeWithDisabledDlsInIso(start);
      /* Same window rule as the grid fetch: this effect runs in month too, where
         the end is a bare inclusive date, and midnight made the pill miss every
         missed visit on the last visible day. */
      const endsAt = toWindowEndIso(end);
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
    /* The Companies tab owns its own pane and its own endpoint. Its scope is a
       rolling twelve months, which is not a FullCalendar view type, so running
       the grid fetch here would ask for a week nobody is going to draw. */
    if (rendersOwnPane) {
      // Nothing here is loading, and there is no unrouted-demand count on a read
      // surface — leaving both unset kept a skeleton pill spinning forever.
      setScheduleLoading(false);
      setRequireAttentionJobs(0);
      /* And the week's counts belong to the grid that is no longer mounted. The
         Companies tab never needed this — the page hides its footer on any tab
         that renders its own pane — but Variation 2 reaches this pane from the
         main tab, where the page has no such rule and would keep the last week's
         numbers on screen under a twelve-month surface. */
      reportFooterStats(null);
      return;
    }

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
    rendersOwnPane,
    // Two groupings, two payload shapes — switching has to refetch, not re-draw.
    visitGrouping,
  ]);

  /**
   * The one fetch the company surfaces make that they do not draw: Harmonize's week.
   *
   * Harmonize is offered on both of them now, and the pane's own payload cannot feed
   * it — `/companies/schedule` answers in **month buckets per site over a rolling
   * year**, which has no visit ids, no `startsAt` and no shift type, so there is no
   * projection from it to what `projectVisitForRoute` and the optimizer need. What
   * they need is a week of individual visits, and the scheduler already has an
   * endpoint that returns exactly that; the company surfaces simply skip it, because
   * the grid it feeds is not mounted. So it is asked for here instead, on its own,
   * with the same query the company **grouping**'s week branch sends — same view,
   * same grouping, same grid-v2 shape through the same adapter — so the two surfaces
   * hand the optimizer identical input and cannot diverge in what it can solve.
   *
   * **Its own AbortController, deliberately.** `getNewApiController` aborts whatever
   * it handed out last, and that is the grid's fetch; borrowing it here would make
   * two independent requests cancel each other by turn.
   *
   * Unfiltered beyond the week. The narrowing on these surfaces lives inside the
   * pane — its own company/site/status controls, which this component cannot see —
   * and the grid's filter row is not on screen, so there is no selection here that a
   * planner could believe they were harmonizing "within". Applying the stale grid
   * filters silently would be the hidden-filter failure this file warns about
   * everywhere else.
   *
   * A failure leaves the list empty, which disables the button rather than blanking
   * a pane that loaded fine — the same trade the overview branch makes for the same
   * fetch.
   */
  useEffect(() => {
    if (!rendersOwnPane) {
      setCompanyWeekVisits([]);
      return undefined;
    }

    const controller = new AbortController();
    const { windowStart, windowEnd } = currentGridWeekWindow();

    getAllDuties(
      {
        windowStart,
        windowEnd,
        schedule: true,
        responseVersion: 'grid-v2',
        calendarView: 'week',
        view: 'visits',
        groupBy: 'company',
        isSite: false,
      },
      { signal: controller.signal },
      // Not the footer's numbers: the effect above has just cleared them on purpose.
      { applyFooterStats: false },
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        setCompanyWeekVisits(mapGridV2WeekData(res).shifts);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCompanyWeekVisits([]);
      });

    return () => controller.abort();
  }, [rendersOwnPane]);

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

  /* Held apart rather than as one `isDayOrMonthView`. The two used to be
     interchangeable here because the company search was hidden in both; month now
     shows it and narrows on a different axis from week, while day still shows
     nothing — so every rule below has to name which of the two it means. */
  const isDayView = queryParams.selectedView?.type === DAY_GRID.DAY;
  const isMonthView = queryParams.selectedView?.type === DAY_GRID.MONTH;

  /* No quick filter here any more. It toggled `showOnlyScheduledSites`, which is now
     always on — see the note on that constant — so the button could only ever have
     been pressed. A control with one reachable state is a label pretending to be a
     control, and this row is short of width as it is. */

  /**
   * The left column's subject, as a segmented control.
   *
   * It sits at the head of the filters row, on the left, because that is the thing
   * it changes — the column directly beneath it. It is a *view* control, not a
   * filter: it narrows nothing, it re-groups everything, so it takes the same
   * segmented-toggle shape as Day / Week / Month rather than a filter chip's.
   *
   * Two words, both nouns, both naming a row: `Routes` and `Companies`. Naming it
   * after the *cards* instead ("Routes / Visits") would have described the payload
   * and left the planner to infer what happens to the column they are pointing at.
   */
  /* Named for what the cards become, not for what the rows become: the planner is
     choosing between reading the week as routes or as the visits inside them, and
     "Visits" is the noun the rest of this tenant's UI uses for that unit. */
  const routesGroupingLabel = t('obx.schedules.calendar.grouping.routes', {
    runsheets: getLabel('terms', 'runsheets', t),
  });
  const visitsGroupingLabel = t('obx.schedules.calendar.grouping.visits', {
    hits: getLabel('terms', 'hits', t),
  });
  /* Names the *range*, not the noun the segment beside it already uses: `Companies`
     alone would be one word away from `{{hits}} by company` and the two segments
     would differ only in a preposition. This one is the twelve-month cadence view,
     and the year is the thing that distinguishes it. */
  /**
   * **"Overview"**, asked for directly in place of "Plan" — and the tooltip still
   * carries what one word cannot.
   *
   * The segment was "Companies" originally, which did not discriminate: the *Visits*
   * segment beside it is already grouped by company (`MAIN_VIEW_GROUPING.COMPANIES`,
   * tooltip "{{hits}} by company"), so the pair read as a difference of subject where
   * there is none. What actually changes when this is pressed is the **horizon** —
   * Routes and Visits are two readings of the week in front of you, this one leaves
   * the week for a rolling year and swaps the grid for a table. "Overview" names that
   * the same way "Plan" did; either reads fine against the reasoning above.
   *
   * **This segment's word, not the tab row's.** `getScheduleHeaderTabs` states its own
   * `t('...tabs.overview')` as literal "Overview" for a *multi-service* tenant's
   * cross-service rollup tab — a different id, a different surface, and one that can
   * sit in the same row as `SCHEDULE_TAB_CONFIGS.companies` when Var 1
   * (`includeCompaniesTab`) is in play, because that tab is pushed independent of
   * `isSingleServiceTenant`. This segment cannot collide with it on screen —
   * `canGroupMainViewByCompany` gates the whole toggle to single-service tenants,
   * whose own `overview`-id tab is labelled with the *service* name (`resolveTerm`),
   * never the literal word — but the companies **tab** could, so
   * `obx.schedules.calendar.tabs.companies` is deliberately left as "Plan" rather than
   * following this rename. The two layouts naming the surface identically was a
   * choice, not an invariant; it is worth breaking here rather than handing a
   * multi-service Var 1 tenant two tabs that both read "Overview".
   */
  const timelineGroupingLabel = t('obx.schedules.calendar.grouping.companyTimeline', {
    site: siteTerms(getLabel, t).singular.toLowerCase(),
  });

  /**
   * The book the search offers, assembled from what the client already holds.
   *
   * A company row knows its customer and how many locations it has, never which
   * ones — that fact only reaches the client attached to a visit. So the locations
   * are read back off the week's own visits, per row, deduplicated by site id.
   *
   * A customer with a quiet week therefore lists **no** locations. The company is
   * still offered, because reaching a quiet customer is exactly what a planner uses
   * this for; it is the buildings that cannot be named until something is scheduled
   * at them. Naming them would take the site book, which is a second fetch this
   * toolbar does not make.
   */
  const companyBook = useMemo(() => {
    if (!isCompanyGrouping) return [];

    /**
     * Month has no rows, so its book is read off the visits themselves.
     *
     * Every month event carries `companyName` alongside its site, which is the
     * whole reason the month can be searched at all — there is no row to join to
     * and no second fetch to make.
     *
     * A company is identified here by its **name**, because a month event carries
     * no customer id: the week's ids live on the grid rows this view does not
     * receive. That is only ever an option key and a match key, both of which the
     * name serves; `visibleWeekLocations` knows to fall back to the name so a pick
     * made here survives a switch back to week.
     */
    if (isMonthView) {
      const byCompany = new Map();

      (allDuties || []).forEach((visit) => {
        const name = `${visit?.companyName || ''}`.trim();
        if (!name) return;

        const company = byCompany.get(name) || { customerId: name, name, sites: new Map() };
        const siteName = `${visit?.site?.name || visit?.siteName || ''}`.trim();
        const siteId = visit?.site?.id ?? visit?.siteId ?? null;

        if (siteName) {
          const key = siteId == null ? siteName.toLowerCase() : String(siteId);
          if (!company.sites.has(key)) {
            company.sites.set(key, { id: siteId ?? key, name: siteName });
          }
        }
        byCompany.set(name, company);
      });

      return [...byCompany.values()]
        .map((company) => ({ ...company, sites: [...company.sites.values()].sort(compareByName) }))
        .sort(compareByName);
    }

    const sitesByRow = new Map();
    (allDuties || []).forEach((visit) => {
      const rowId = visit?.resourceId == null ? '' : String(visit.resourceId);
      const siteName = `${visit?.site?.name || visit?.siteName || ''}`.trim();
      if (!rowId || !siteName) return;

      const siteId = visit?.site?.id ?? visit?.siteId ?? null;
      const key = siteId == null ? siteName.toLowerCase() : String(siteId);
      const sites = sitesByRow.get(rowId) || new Map();
      if (!sites.has(key)) sites.set(key, { id: siteId ?? key, name: siteName });
      sitesByRow.set(rowId, sites);
    });

    return (weekViewLocations || [])
      .filter((resource) => resource?.extendedProps?.meta?.isCompanyRow)
      .map((resource) => ({
        customerId: resource.extendedProps.meta.customerId ?? resource.id,
        name: resource.title || '',
        sites: [...(sitesByRow.get(String(resource.id))?.values() || [])].sort(compareByName),
      }));
  }, [isCompanyGrouping, isMonthView, weekViewLocations, allDuties]);

  /* Typing is a new question, so it abandons the answer the last pick committed to.
     Leaving the two to accumulate would let a grid narrowed to one customer be
     re-narrowed by text that no longer has anything to do with it. */
  const handleCompanyQueryChange = useCallback((nextQuery) => {
    setCompanyQuery(nextQuery);
    setCompanySelection(null);
  }, []);

  /* A pick clears the text it was found with: the chip beside the field now states
     the destination, and leaving the half-typed letters behind would show the same
     narrowing twice, once as a commitment and once as a guess. */
  const handleCompanySelect = useCallback((picked) => {
    if (!picked?.customerId) return;
    setCompanyQuery('');
    setCompanySelection(picked);
  }, []);

  const clearCompanySelection = useCallback(() => {
    setCompanyQuery('');
    setCompanySelection(null);
  }, []);

  /**
   * Reaches one company, or one of its buildings.
   *
   * Client-side on purpose: the rows are already here, so typing narrows them at
   * keystroke speed with no request — the same trade the `Companies with Visits`
   * filter makes.
   *
   * It used to be hidden in month too, on the argument that the narrowing acted on
   * week rows and month had none — the box would have swallowed what you typed.
   * That stopped being true when the month grid started drawing a chip per visit
   * instead of a tally per day: there is something to narrow now, so month narrows
   * the **events** rather than the rows (see `visibleDuties`).
   *
   * Day is still out, and for the original reason. It draws `dayViewDuties`, a map
   * of visits keyed by group name that neither the row pass nor the event pass ever
   * touches — a box there would be exactly the one that swallows what you type.
   *
   * **Hidden for now.** The leading `false &&` forces this to `null` unconditionally
   * — the visible input is going away, not the search logic behind it.
   * `companyQuery`/`companySelection` and their handlers are still very much alive
   * (`companySelection` in particular still narrows the grid from a prior pick, see
   * `visibleWeekLocations` and the events pass below); this JSX is kept rather than
   * deleted only so those stay referenced and the box can come back by flipping
   * `SHOW_COMPANY_SEARCH` below. (A literal `false` here trips ESLint's
   * `no-constant-condition`, hence the named flag.)
   */
  const SHOW_COMPANY_SEARCH = false;
  const companySearch =
    SHOW_COMPANY_SEARCH && canSwitchGrouping && isCompanyGrouping && !isDayView ? (
      /* The committed pick is stated inside the field rather than as a chip beside
         it. This filter row's children sum to its full width with nothing spare, so
         a sibling wrapped the whole row onto a second line and pushed the grid down
         the instant anything was picked. */
      <CompanySiteSearch
        value={companyQuery}
        onChange={handleCompanyQueryChange}
        onSelect={handleCompanySelect}
        selection={companySelection}
        onClearSelection={clearCompanySelection}
        companies={companyBook}
        siteTerm={getLabel('terms', 'sites', t)}
      />
    ) : null;

  /**
   * The week grid, narrowed to what the planner committed to.
   *
   * A pick is not a text filter, so it is applied here rather than in the view
   * model's `companyQuery` pass: a company narrows to that one row, and a building
   * narrows that row's **cards** while the row itself stays. Dropping the row for a
   * site pick would have answered "where is this store" by hiding the customer who
   * owns it, and left the grid with nothing to hang the visits off.
   */
  const visibleWeekLocations = useMemo(() => {
    if (!isCompanyGrouping || !companySelection) return weekViewLocations;

    return (weekViewLocations || []).filter((resource) => {
      if (
        `${resource?.extendedProps?.meta?.customerId ?? ''}` === `${companySelection.customerId}`
      ) {
        return true;
      }

      /* A pick made in month can name its company but not identify it — that grid's
         events carry no customer id, so the book built there keys on the name (see
         `companyBook`). The selection outlives the view switch, so without this the
         planner picked a customer in month, went to week, and found an empty grid. */
      const companyName = `${companySelection.companyName || ''}`.trim();
      return (
        Boolean(companyName) &&
        `${resource?.title || ''}`.trim().toLowerCase() === companyName.toLowerCase()
      );
    });
  }, [weekViewLocations, isCompanyGrouping, companySelection]);

  /**
   * The cards, narrowed by whichever half of the search this view can act on.
   *
   * **Week** narrows rows, in the view model's `companyQuery` pass, and a row leaves
   * with its own cards — so the only thing left for the events is a *building* pick,
   * which has to keep its company's row while emptying the rest of it.
   *
   * **Month** has no rows at all, so both halves land here: free text and a company
   * pick alike act on the events, and a building pick means the same thing it does
   * in week. Free text matches the customer **or** the building, the same rule the
   * week rows use — narrowing to buildings alone would hide a company whose name
   * someone had typed in full.
   *
   * **Day** is untouched: it draws `dayViewDuties`, not this, which is why the
   * search is not offered there.
   */
  const visibleDuties = useMemo(() => {
    if (!isCompanyGrouping || isDayView) return allDuties;

    const pickedSiteId = companySelection?.siteId;
    if (pickedSiteId) {
      return (allDuties || []).filter(
        (visit) => `${visit?.site?.id ?? visit?.siteId ?? ''}` === `${pickedSiteId}`,
      );
    }

    if (!isMonthView) return allDuties;

    const pickedCompany = `${companySelection?.companyName || ''}`.trim().toLowerCase();
    if (pickedCompany) {
      return (allDuties || []).filter(
        (visit) => `${visit?.companyName || ''}`.trim().toLowerCase() === pickedCompany,
      );
    }

    const needle = companyQuery.trim().toLowerCase();
    if (!needle) return allDuties;

    return (allDuties || []).filter((visit) =>
      visitSearchNames(visit).some((name) => name.includes(needle)),
    );
  }, [allDuties, isCompanyGrouping, isDayView, isMonthView, companySelection, companyQuery]);

  /**
   * That control, built — see the note on its labels above for what it is and why it
   * leads the row rather than joining the filters.
   *
   * **Routes, then Visits, then Companies** — asked for directly. That means the
   * leading segment is not the default selection (visits is — see
   * `readStoredGrouping`); the order was the explicit ask, and the default has not
   * been revisited with it.
   *
   * The long, tenant-termed labels are the tooltip and the accessible name; the
   * segment itself carries the short noun and a glyph, because a toolbar pill is read
   * at a glance and `{{hits}} by company` is a sentence. Each `Tooltip` wraps the
   * *button* and never a bare glyph — MUI hands its child a ref, and an inline SVG is
   * not a ref-forwarding component.
   */
  /* **Var 2 only.** Asked for directly: the tabbed layout drops the toggle row
     entirely, because under Var 1 all three of its destinations are tabs — routes on
     the service tab, visits on their own, the company pane on Overview — and a
     toggle duplicating the tab row is two controls for one choice that can disagree
     with each other. */
  const groupingSwitch =
    canSwitchGrouping && isUnifiedToggleLayout ? (
      <ToggleButtonGroup
        exclusive
        size="small"
        value={visitGrouping}
        className={classes.scheduleGroupingToggle}
        onChange={(_e, next) => setGrouping(next)}
        aria-label={t('obx.schedules.calendar.grouping.label')}
      >
        <Tooltip arrow placement="top" title={routesGroupingLabel}>
          <ToggleButton
            disableRipple
            className={classes.scheduleGroupingToggleBtn}
            value={MAIN_VIEW_GROUPING.ROUTES}
            aria-label={routesGroupingLabel}
          >
            <RouteGroupingIcon />
            {t('obx.schedules.calendar.grouping.routesShort')}
          </ToggleButton>
        </Tooltip>
        <Tooltip arrow placement="top" title={visitsGroupingLabel}>
          <ToggleButton
            disableRipple
            className={classes.scheduleGroupingToggleBtn}
            value={MAIN_VIEW_GROUPING.COMPANIES}
            aria-label={visitsGroupingLabel}
          >
            <VisitGroupingIcon />
            {t('obx.schedules.calendar.grouping.visitsShort')}
          </ToggleButton>
        </Tooltip>
        {/* **Var 2 only.** This is the segment that swaps the whole surface for the
          twelve-month pane, and it exists here only because that layout has no
          Companies tab to reach the pane by. Under Var 1 the tab is still in the row
          above, so offering the same destination twice would put the two layouts one
          click apart in one direction and zero in the other — and the pane, having no
          toolbar of its own, would leave this segment on screen nowhere to go back
          to. Last in either case: routes and visits are two readings of the week in
          front of you, this one leaves it. */}
        {isUnifiedToggleLayout ? (
          <Tooltip arrow placement="top" title={timelineGroupingLabel}>
            <ToggleButton
              disableRipple
              className={classes.scheduleGroupingToggleBtn}
              value={TIMELINE_PANE_GROUPING}
              aria-label={timelineGroupingLabel}
            >
              <OverviewGroupingIcon />
              {t('obx.schedules.calendar.grouping.companiesShort')}
            </ToggleButton>
          </Tooltip>
        ) : null}
      </ToggleButtonGroup>
    ) : null;

  /**
   * Harmonize, built here rather than inline in the page header.
   *
   * **Back in the header row, as a ghost button ahead of Forecasting** — asked for
   * directly, and it reverses the earlier move down into the grid's toolbar. That
   * move reasoned Harmonize belongs beside the controls that pick the window it acts
   * on; as drawn, a filled green CTA in a row of segmented toggles was the loudest
   * thing on the page and read as a fourth view control. Beside Forecasting it sits
   * with the other *action on the schedule* rather than among the controls that frame
   * it, and the ghost treatment lets the assignment pill keep the row's only colour.
   *
   * `onlyText`, so no fill and no border — the same quiet treatment Forecasting
   * already uses, which is what makes the pair read as two actions rather than a
   * primary and an afterthought.
   *
   * Which surfaces offer it is `offersHarmonize`, declared with the list it acts on
   * so the two cannot disagree. Day view is the one condition left here: a single day
   * has nothing to spread work across. It is waived on the company surfaces, because
   * `isDayView` reads the *grid's* view type and those surfaces have no view switcher
   * — a planner who was last in Day view and then picked Companies would otherwise
   * find the button missing for a reason nothing on screen mentions.
   *
   * Disabled rather than hidden when the week holds no optimisable visit, so the
   * control does not appear and disappear as the planner pages through weeks.
   *
   * **The company surfaces now offer it, reversing an earlier decision.** They were
   * excluded on the reasoning that the optimizer plans the visible window and this
   * one shows twelve months of cadence with no grid behind it to draw the answer on.
   * That is still true of the *pane*, and it is why the button cannot simply borrow
   * the pane's data: the week it acts on there is `currentGridWeekWindow` — today's
   * week, fetched separately — and the answer is drawn inside the workspace, which is
   * full-screen and needs no calendar under it. So the scope is real and stated by
   * the tooltip, and the only thing lost is the settle animation on a grid that is
   * not mounted.
   */
  /**
   * Missed visits — the pill, and every piece of it already existed.
   *
   * The count, its fetch, the pink `destructiveSecondary` treatment, `MHitsIcon` and
   * `MissedHitsDrawer`'s mount at the foot of this file were all live with no trigger. This is
   * the trigger. Built here rather than in the grid because the drawer it opens is this
   * component's state.
   */
  const missedVisitsPill =
    !isEmbeddedScheduleView && Boolean(missedHitsCount) ? (
      <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
        <Button
          variant="destructiveSecondary"
          className={classes.scheduleMissedVisitsButton}
          endIcon={<MHitsIcon />}
          onClick={() =>
            setMissedHitDrawerData({
              startsAt: queryParams.selectedView.windowStart,
              endsAt: queryParams.selectedView.windowEnd,
            })
          }
        >
          {missedHitsCount} {t('obx.runsheet.missedHits', { hits: getLabel('terms', 'hits', t) })}
        </Button>
      </RenderIfHasPermission>
    ) : null;

  /**
   * **Restored to every tab's toolbar, on instruction.**
   *
   * It was `tabConfig.id === 'officer' ? … : null` — the person tab only. That gate was not a
   * decision about the person tab; it was as far as an earlier restoration went, made while the
   * pill had no trigger anywhere and the person tab was the surface being worked on. Dropping
   * it is the whole of *"re-add 'missing visits' red chip"*: every other piece — the count, its
   * fetch, the pink treatment, `MHitsIcon`, `MissedHitsDrawer`'s mount — was already live and
   * already ran on every non-embedded mount regardless of tab.
   *
   * **The toolbar, not the header row, and the reference is what settles it.** The pill sits
   * left of the date navigator, in the row that carries the window and the Day/Week/Month
   * toggle. That is the right row for it on its own terms: it counts what was missed *in the
   * window on screen*, so it belongs beside the control that sets the window rather than beside
   * the header's running total of unrouted demand. Threaded through the grid's
   * `toolbarRightContent`; built here because the drawer it opens is this component's state.
   *
   * The window is `selectedView`'s — the same range the count was fetched for — so the drawer
   * can never list a period the number did not count.
   */
  const missedVisitsAction = missedVisitsPill;

  const harmonizeAction =
    offersHarmonize && (!isDayView || rendersOwnPane) ? (
      /* One action, and it is the optimizer's.
         There used to be two steps here — `Select visits`, then
         `Harmonize N visits` — which asked the planner to decide which
         visits could share a day before anything had worked out whether
         they could. That is the solver's question. It now takes the week
         in scope and answers it, and the planner edits the answer — the
         grid's visible window, or today's week on the company surfaces,
         which draw no window at all. */
      <Button
        variant="onlyText"
        className={classes.scheduleHarmonizeButton}
        disabled={!harmonizableVisits.length}
        startIcon={<AutoAwesomeIcon />}
        /* The scope moved out of the label and into the tooltip rather than
           being dropped: `Harmonize` alone does not say which week it will
           rearrange, and this is the one control on the page that rewrites
           the grid behind it. `optimize.weekAction` keeps the full sentence
           and the short label is a second key, so the button can shrink
           without editing the words any other surface may still be saying. */
        title={t('obx.runsheet.optimize.weekAction')}
        onClick={() => setHarmonizeOpen(true)}
      >
        {t('obx.runsheet.optimize.weekActionShort')}
      </Button>
    ) : null;

  /* The filter row's own view of the tab, and nothing else's: each reading of the
     main tab shows fewer dropdowns than the config declares — three fewer grouped by
     company, two fewer grouped by routes — while the fetch and the grid keep reading
     the real config. Derived per grouping rather than flagged on the tab, because the
     dedicated and patrol tabs and the multi-service overview share that config and
     still ask every question. Anything that is neither reading (the timeline pane,
     both embeds, every other tab) falls through to the config untouched. */
  const filtersTabConfig = useMemo(() => {
    if (isCompanyGrouping) return withCompanyGroupingFilters(tabConfig);
    if (isRouteGrouping) return withRouteGroupingFilters(tabConfig);
    return tabConfig;
  }, [isCompanyGrouping, isRouteGrouping, tabConfig]);

  const scheduleFilters = (
    <ScheduleCalendarFilters
      classes={classes}
      tabConfig={filtersTabConfig}
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
      // Always `null` for now — see the note on `companySearch` above.
      leadingFilter={companySearch}
    />
  );

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
          {/* **On every grouping, including company.** Asked for directly — "we will
              have assignment message instead of missed" — and the removal of the
              Missed pill is what makes it necessary rather than merely consistent.

              This reverses a narrower rule. The pill used to be suppressed on the
              company grouping, on the reasoning that every unrouted visit is already
              *drawn* there — it sits on its customer's row with `Unassigned` in red —
              so a red count restated what the grid was showing. That held while the
              Missed pill was still in this row: the header had a red count either
              way. With Missed gone, suppressing this one left the header **empty** on
              the one grouping the visits work actually happens in, so the screen lost
              its only running total of unrouted demand and the toggle that filters to
              it. A fact being visible card-by-card is not the same as a total.

              It also toggles the `requiresAttention` status filter, which `All
              Statuses` still offers as `Unassigned`, so the filter has a second route
              either way — but this is the one-click one. */}
          {!isUsersModule && requireAttentionJobs !== 0 && (
            <>
              {typeof requireAttentionJobs === 'number' ? (
                <Button
                  variant="destructiveSecondary"
                  className={classes.scheduleAssignmentActionButton}
                  startIcon={<AlertIcon />}
                  aria-pressed={isRequiresAttentionFilterActive}
                  /* The tooltip names the same unit as the label, and states the
                     scope: the number counts the dates on screen, which in month
                     is the whole grid — including the trailing cells of the next
                     month — and not the month in the title. That is the rule the
                     click has to obey anyway, because clicking applies the status
                     filter to the fetched window; a count of the titled month
                     would disagree with the grid it produced. */
                  title={
                    showsVisits
                      ? t(
                          isRequiresAttentionFilterActive
                            ? 'obx.schedules.calendar.visits.showAllVisits'
                            : 'obx.schedules.calendar.visits.showOnlyAwaitingRoute',
                          { hits: getLabel('terms', 'hits', t) },
                        )
                      : t(
                          isRequiresAttentionFilterActive
                            ? 'obx.schedules.calendar.showAllShifts'
                            : 'obx.schedules.calendar.showOnlyRequiresAttention',
                        )
                  }
                  onClick={toggleRequiresAttentionFilter}
                >
                  {/* One message on every grouping — asked for directly. The visits
                      reading used to swap in `N Visits not on a route`, which named the
                      *symptom* (no route yet) where this names the **action** (somebody
                      has to assign it), and which made the same pill read two ways
                      depending on a grouping toggle the planner may not have touched.
                      The tooltip below still specialises, because that is where the
                      scope and the filter it applies are explained. */}
                  {t('obx.schedules.calendar.jobsRequireAttention', {
                    count: requireAttentionJobs,
                  })}
                </Button>
              ) : (
                <Skeleton className={classes.scheduleAssignmentActionSkeleton} />
              )}
            </>
          )}
          {/* No missed-visits pill **in this row**, and that is still right — the pill
              itself is back, one row down. Two red counts side by side here asked the
              planner to hold two numbers at once and then decide which one the morning
              was about; the reference this pill comes from puts it in the toolbar beside
              the date navigator, which is a row about *the window on screen* and is where
              a count of what was missed in that window belongs. See `missedVisitsAction`. */}
          {harmonizeAction}
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
          {/* Harmonize used to close this row. It now sits in the grid's own toolbar
              beside the window controls it acts on — see `harmonizeAction`. */}
          {createMenu}
        </Box>
      </Box>
      {/**
       * The stage the apply sequence plays over.
       *
       * It used to be the stage the sequence played *on* — the grid's flight layer hung
       * inside it and a scoped class switched three per-card animations. Both are gone;
       * what it does now is give `ApplySkeleton` a box to be `inset: 0` against, so the
       * skeleton covers exactly the grid and leaves the toolbar and footer alone. Those
       * are chrome, they are not being reloaded, and hiding them would say they were.
       */}
      <Box
        data-apply-stage="true"
        /* The hook the card-skeleton rules hang off — see `[data-applying]` in
           `scheduleCalendar.styles.js`. Stamped here rather than on the grid because the
           stage is also what positions the status pill, and one attribute driving both keeps
           them from ever disagreeing about whether an apply is running. */
        data-applying={applyMotion.isRunning ? 'true' : undefined}
        className={classes.scheduleCalendarFull}
      >
        <ApplySkeleton phase={applyMotion.phase} routeCount={applyMotion.routeCount} />
        <ScheduleErrorBoundary
          resetKey={`${activeTab}|${visitGrouping}|${queryParams.selectedView?.type}|${queryParams.selectedView?.windowStart}`}
          onRetry={refetchScheduleData}
        >
          {rendersOwnPane ? (
            /* Companies is a list, not a calendar — it replaces the grid rather
               than configuring it, and brings its own scope control with it. The
               date navigator and Day/Week/Month belong to a grid this surface does
               not have, so none of the real toolbar comes with it. */
            <Box className={classes.scheduleOwnPane}>
              <SchedulesCompanies
                initialCustomerId={selectedCompanyId}
                /**
                 * …except the grouping switch, which is the way back out. Under Var 2
                 * this pane is a *segment*, not a tab, so the page's tab row is not a
                 * route out of it — dropping the toggle would make selecting Companies
                 * a one-way door with nothing on screen to undo it.
                 *
                 * **Handed to the pane, not drawn above it.** It used to render in a
                 * bare row of its own here, which put the toggles and the pane's own
                 * filters on two stacked rows — where every other surface in the
                 * scheduler reads them as one, because the grid's toolbar takes the
                 * same element as its `toolbarLeadingContent` (see the branch below).
                 * Reported directly. The pane routes it into the mounted view's filter
                 * row, so both layouts now spend the same one row on it.
                 *
                 * Still the same element in both branches, and still only ever one of
                 * them rendering.
                 */
                groupingSwitch={showsCompanyTimeline ? groupingSwitch : null}
                onOpenVisit={(visit, site) =>
                  setShowDrawer({
                    open: DRAWER_TYPE.DETAIL,
                    data: {
                      id: visit.id,
                      shiftActivityLogId: visit.id,
                      shiftType: SCHEDULE_DUTIES.HIT,
                      /* The **timestamps**, not the date. `visit.date` is `YYYY-MM-DD`,
                       and handing that to the drawer as both ends gave it a
                       zero-length window it rendered as `2p - 2p`, on the previous
                       day once the franchise offset was applied — so a card reading
                       `18 Oct · 8a - 10a` opened a drawer reading `17 Oct · 2p - 2p`.
                       Every visit in this payload now carries real ISO ends; the
                       date-only fallback is kept only for a visit that somehow has
                       none, where a wrong window is worse than a bare date. */
                      startsAt: visit.startsAt || visit.date,
                      endsAt: visit.endsAt || visit.startsAt || visit.date,
                      runsheetName: visit.runsheetName,
                      siteName: site?.name,
                    },
                  })
                }
              />
            </Box>
          ) : (
            /**
             * The toolbar's right cluster reads, from the right, Harmonize → date
             * range → Day/Week/Month. Asked for in exactly those words.
             *
             * Delivered as context, not a prop, because `ScheduleCalendarGrid` sits
             * between this file and the shell and forwards a fixed prop list. The
             * shell's own default is the other order, which every other consumer of
             * it still gets.
             *
             * Var 2 only. That arrangement was asked for against the layout whose
             * toolbar leads with a three-segment grouping switch — with the date
             * ahead of the toggles the row read as two view clusters split by a date.
             * Var 1's toolbar is a different row (two segments, and a Companies tab
             * carrying the third reading), so it keeps the shell's own date-first
             * order and the two layouts stay comparable in the thing being compared.
             */
            <CalendarToolbarArrangementContext.Provider
              /**
               * **Date first, then Day/Week/Month — everywhere now.**
               *
               * This reverses the Var 2 arrangement, on the same authority that asked for
               * it: *"the daily, weekly and monthly filter should be on the right side
               * after the selection"*. It used to lead the right cluster with the toggles
               * on the argument that a row already leading with a three-segment grouping
               * switch read as two view clusters split by a date. Lived with, the date
               * ended up buried between two segmented controls instead — and the toggles
               * are the last thing you touch, so they belong at the end of the row.
               *
               * `TOGGLES_FIRST` stays in the shell: it is the other consumer-facing
               * arrangement and nothing about it was wrong, it is just not what this
               * toolbar wants. Deleting it would take the choice away from the next
               * caller to need it.
               */
              value={CALENDAR_TOOLBAR_ARRANGEMENT.DATE_FIRST}
            >
              <ScheduleCalendarGrid
                onAssignmentSuccess={handleCalendarOfficerAssignSuccess}
                events={visibleDuties}
                listEvents={listDuties}
                dayViewDuties={dayViewDuties}
                dayViewLocations={dayViewLocations}
                weekViewLocations={visibleWeekLocations}
                setShowDrawer={setShowDrawer}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
                loading={loading}
                toolbarLeadingContent={groupingSwitch}
                toolbarLeftContent={scheduleFilters}
                toolbarRightContent={missedVisitsAction}
                showListSwitch={false}
                activeScheduleTab={isEmbeddedScheduleView ? EMBEDDED_SCHEDULE_TAB_ID : activeTab}
                overviewSections={overviewSections}
                selectionMode={selectionMode}
                showOnlyScheduledSites={showOnlyScheduledSites}
                selectedShiftIds={selectedShiftIds}
                onToggleShiftSelect={toggleShiftSelect}
                harmonizePreview={harmonizePreview}
                visitGrouping={visitGrouping}
                companyQuery={companyQuery}
                onSelectCompany={handleSelectCompany}
                visitCardVariant={visitCardVariant}
                routeVisitCounts={routeVisitCounts}
              />
            </CalendarToolbarArrangementContext.Provider>
          )}
        </ScheduleErrorBoundary>

        {/**
         * Three shells, one trigger — see `config/harmonizeShell`.
         *
         * The drawer is not a reskin of the workspace: it implements a different
         * domain model (a range of worked days, one zone each, no radius, no
         * installers) against its own engine, so it takes none of the workspace's
         * props and shares none of its state. That is why this is a branch rather
         * than a `variant` prop — there is nothing for the two to hold in common
         * beyond the fact that a button opened them.
         *
         * **Split is the drawer's model in a different shell**, so it takes the same
         * props the drawer does and produces the same `plan` — which is why the two
         * hand this page identical `onApplied` work. It is written out twice rather
         * than hoisted into a shared handler: these are comparison shells, both due
         * for deletion, and a helper they shared would be one more thing to unpick
         * when two of the three go.
         *
         * **A switch, not a chain of ternaries.** This was `=== DRAWER ? … : Workspace`,
         * which silently rendered the Workspace for any value that was not exactly
         * `'drawer'` — so a third shell would have been added to the config, appeared in
         * the switch, and opened the wrong surface with nothing to say why.
         *
         * `weekVisits` is deliberately not threaded into either new shell. They run on
         * their own fixture while the endpoints in HARMONIZE-CONTEXT §5 are unbuilt;
         * feeding them this page's visits would produce a proposal with no zones, no
         * need-by windows and no filter counts, which is a worse demonstration than an
         * honest one over data shaped like the payload it is waiting for.
         */}
        {/**
         * **The automatic shell, and it is first because it is what the button now opens.**
         *
         * It takes the same two props the other two new shells do and produces the same
         * `plan`, so the apply handler below is the same site-name join — written out again
         * rather than hoisted, on the standing rule for these comparison shells: a helper
         * they shared would be one more thing to unpick when two of the three go.
         *
         * `weekVisits` is deliberately not threaded in here either. It runs on the same
         * fixture the drawer does while the endpoints in HARMONIZE-CONTEXT §5 are unbuilt,
         * and this shell needs more of that payload than the others — a due date and a
         * filter count per visit, which is what the need-by window and the score are made
         * of. Feeding it this page's visits would produce a plan with no windows and no
         * scores, which is a worse demonstration than an honest one over data shaped like
         * what it is waiting for.
         */}
        {props.harmonizeShell === HARMONIZE_SHELL.AUTO ? (
          <HarmonizeAuto
            open={harmonizeOpen}
            onClose={() => setHarmonizeOpen(false)}
            onApplied={(plan) => {
              exitSelection();

              const key = (name) =>
                String(name || '')
                  .trim()
                  .toLowerCase();
              const byName = new Map(
                (harmonizableVisits || [])
                  .map((visit) => [key(visit.site || visit.siteName), visit.id])
                  .filter(([name]) => name),
              );

              applyMotion.start(
                (plan?.runsheets || [])
                  .map((sheet) => ({
                    dayKey: sheet.date,
                    /* Named for the day rather than the zone, because this engine has no
                       zones — a radius is not a place, so there is no territory to name a
                       route after. §14.6 notes the real naming rule is still undefined;
                       this is a legible stand-in, not that rule. */
                    name: `${getLabel('terms', 'runsheet', t)} · ${dayjs(sheet.date).format('ddd D MMM')}`,
                    visitIds: sheet.stops
                      .map((stop) => byName.get(key(stop.site?.name)))
                      .filter((id) => id != null),
                  }))
                  .filter((route) => route.visitIds.length),
              );
            }}
          />
        ) : props.harmonizeShell === HARMONIZE_SHELL.SPLIT ? (
          <HarmonizeSplit
            open={harmonizeOpen}
            onClose={() => setHarmonizeOpen(false)}
            onApplied={(plan) => {
              exitSelection();

              const key = (name) =>
                String(name || '')
                  .trim()
                  .toLowerCase();
              const byName = new Map(
                (harmonizableVisits || [])
                  .map((visit) => [key(visit.site || visit.siteName), visit.id])
                  .filter(([name]) => name),
              );

              applyMotion.start(
                (plan?.runsheets || [])
                  .map((sheet) => ({
                    dayKey: sheet.date,
                    name: `${getLabel('terms', 'runsheet', t)} · ${zoneName(sheet.zoneId)}`,
                    visitIds: sheet.stops
                      .map((stop) => byName.get(key(stop.site?.name)))
                      .filter((id) => id != null),
                  }))
                  .filter((route) => route.visitIds.length),
              );
            }}
          />
        ) : props.harmonizeShell === HARMONIZE_SHELL.DRAWER ? (
          <HarmonizeDrawer
            open={harmonizeOpen}
            onClose={() => setHarmonizeOpen(false)}
            /**
             * **The calendar is this flow's terminal state.**
             *
             * The drawer has no "Applied" screen: it closes and hands the plan here, and
             * what the planner watches is the week actually rearranging — every visit
             * card settles, then the moved ones land on their new days in route order
             * (`useApplyMotion`). Scattered work collapsing onto two or three trips is
             * the one thing this feature exists to demonstrate, and a summary panel
             * describes it where the grid can simply show it. No toast either, for the
             * same reason: a sentence claiming the week changed, over a week visibly
             * changing, is the same fact twice.
             *
             * **Matched by site name, not by id.** The drawer runs on its own fixture
             * while the endpoints in HARMONIZE-CONTEXT §5 are unbuilt, so its visit ids
             * are its own and mean nothing to the grid. The site *names* are shared —
             * the fixture was built from this demo book — so that is the join. It is a
             * demo-grade seam and it goes the moment the drawer is reading real visits;
             * a route whose sites do not resolve simply contributes no moves rather
             * than throwing.
             */
            onApplied={(plan) => {
              exitSelection();

              /* `site`, with `siteName` behind it: this list arrives in the raw shift
                 shape on the routes reading and in the mapped visit shape elsewhere, and
                 the two spell the site differently. Keyed on the wrong one the map has a
                 single `undefined` entry and every route resolves to zero visits — which
                 is exactly what it did, and it fails silently because a route with no
                 visits is dropped rather than throwing. Normalised so a stray case or a
                 trailing space cannot cost a match either. */
              const key = (name) =>
                String(name || '')
                  .trim()
                  .toLowerCase();
              const byName = new Map(
                (harmonizableVisits || [])
                  .map((visit) => [key(visit.site || visit.siteName), visit.id])
                  .filter(([name]) => name),
              );

              applyMotion.start(
                (plan?.runsheets || [])
                  .map((sheet) => ({
                    dayKey: sheet.date,
                    /* Named for the zone it covers, because that is the only thing that
                       distinguishes one of these runsheets from another — one per worked
                       day, one zone each (D15). The generic term alone left three
                       identical "Route" labels on the grid. §14.6 notes the real naming
                       rule is still undefined; this is a legible stand-in, not that rule. */
                    name: `${getLabel('terms', 'runsheet', t)} · ${zoneName(sheet.zoneId)}`,
                    visitIds: sheet.stops
                      .map((stop) => byName.get(key(stop.site?.name)))
                      .filter((id) => id != null),
                  }))
                  .filter((route) => route.visitIds.length),
              );
            }}
          />
        ) : (
          <HarmonizeWorkspace
            open={harmonizeOpen}
            onClose={() => setHarmonizeOpen(false)}
            weekVisits={harmonizableVisits}
            routeTerm={getLabel('terms', 'runsheet', t)}
            onPreviewChange={setHarmonizePreview}
            onApplied={(result) => {
              exitSelection();

              /* The grid, not the toast, is where this lands. Every visit card
               settles, then the moved ones reappear stacked on their own route's
               day — so the payoff of the feature is watched rather than described.
               Started before the toast so the two are not competing for the same
               first second of attention. */
              applyMotion.start(result.routes || []);

              /* One line per route the apply touched, because "12 visits routed" over
               two days hides the thing the planner will be asked about tomorrow:
               which day, and whose route.

               **`appliedToast`, not `appliedRoute`.** The latter was never in the locale, so
               the last thing the happy flow did was raise a toast reading
               `obx.runsheet.harmonize.appliedRoute` — the raw key, in front of the planner,
               at the one moment the feature is supposed to be reporting success. The key
               that does exist takes exactly these three interpolations. */
              toaster.success({
                text: (result.routes || [])
                  .map((route) =>
                    t('obx.runsheet.harmonize.appliedToast', {
                      count: route.visitCount,
                      day: route.day,
                      runsheet: route.worker ? `${route.worker} · ${route.name}` : route.name,
                    }),
                  )
                  .join(' · '),
                position: 'top-right',
                autoClose: toastSettings.AUTO_CLOSE,
              });
            }}
          />
        )}
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
      <SideDrawer isOpen={!!missedHitDrawerData} totalWidth={'571px'}>
        <MissedHitsDrawer
          missedHitDrawerData={missedHitDrawerData}
          setMissedHitDrawerData={setMissedHitDrawerData}
          refreshMissedHitsCount={refreshMissedHitsCount}
        />
      </SideDrawer>
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
  /** Receives the footer variant for the active tab *as grouped*. */
  onFooterVariantChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  /** Receives `{ activeStatus, setStatus }` so siblings can drive the status filter. */
  onStatusControlChange: PropTypes.func,
  /** Which visit card design to draw — see `config/visitViewVariant`. Owned by the
      parent, because the choice also decides which footer it renders. */
  visitCardVariant: PropTypes.oneOf(Object.values(VISIT_VIEW_VARIANT)),
  /** Which candidate layout to draw — see `config/schedulerLayout`. Owned by the
      parent, which also renders the switch that sets it, so the control survives the
      layout change it causes. */
  schedulerLayout: PropTypes.oneOf(Object.values(SCHEDULER_LAYOUT)),
  /** Which Harmonize shell the button opens — see `config/harmonizeShell`. Owned by
      the page above, so the switch survives on screen while the shell changes. */
  harmonizeShell: PropTypes.oneOf(Object.values(HARMONIZE_SHELL)),
};

export default ScheduleCalendar;
