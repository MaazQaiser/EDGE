import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Avatar, Box, Button, Chip, Skeleton, Tooltip, Typography } from '@mui/material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { ReactComponent as CancelIcon } from 'assets/svg/cancelHit.svg';
import { ReactComponent as WarningIcon } from 'assets/svg/warningCalander.svg';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Calendar, { getStartEndTimeForView } from 'src/app/components/common/calendar';
import { useStyles } from 'src/app/components/common/calendar/calendar.styles';
import SideDrawer from 'src/app/components/common/sideDrawer';
import DutyIndicator from 'src/app/components/obxComponents/dutyIndicator';
import CalendarOfficerAssignPopover from 'src/app/obx/pages/schedules/calendar/CalendarOfficerAssignPopover';
import LegacyCalendarCardContent from 'src/app/obx/pages/schedules/calendar/LegacyCalendarCardContent';
import MissedHitsDrawer from 'src/app/obx/pages/schedules/components/missedHitsDrawer';
import {
  calendarIndicatorIcons,
  calendarShiftStatusValues,
} from 'src/app/obx/pages/schedules/components/scheduleStatusIcons';
import {
  getScheduleTabConfig,
  resolveResourceAreaHeader,
  resolveScheduleSectionTitle,
} from 'src/app/obx/pages/schedules/config/scheduleTabConfigs';
import {
  dayjsWithTimezone,
  formatShiftScheduleTimeRange,
  getCurrentStandardTimeInIsoWrtTimezone,
} from 'src/app/obx/pages/schedules/helper';
import { DUTY_COLORS } from 'src/app/obx/pages/schedules/helper/scheduleColors';
import {
  getVisitActionRules,
  resolveVisitState,
  VISIT_STATE,
  VISIT_STATE_CARD_CLASSES,
  VISIT_STATE_LABEL_KEYS,
} from 'src/app/obx/pages/schedules/helper/visitState';
import {
  buildSortedDayViewData,
  useScheduleCalendarViewModel,
} from 'src/app/obx/pages/schedules/hooks/useScheduleCalendarViewModel';
import { ACL_OBX_SCHEDULES_UPDATE } from 'src/app/router/constant/OBXMODULE';
import AvatarSchedule from 'src/assets/images/Avatar-schedule.png';
import { ReactComponent as NoShiftIcon } from 'src/assets/images/no-shift.svg';
import { SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as UnAssignHit } from 'src/assets/svg/assignHit.svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg';
import { ReactComponent as AlertIcon } from 'src/assets/svg/DedicatedDuty/alertCircle.svg';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg';
import { ReactComponent as MHitsIcon } from 'src/assets/svg/MHitsIcon.svg';
import { ReactComponent as NotesIcon } from 'src/assets/svg/notesStatus.svg';
import { ReactComponent as AccessTimeIcon } from 'src/assets/svg/officerOrangeIcon.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
import { ReactComponent as WhiteCarIcon } from 'src/assets/svg/WhiteCarIcon.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import useDateTime from 'src/hooks/useDateTime';
import userHasPermission from 'src/utils/auth/userHasPermission';
import {
  calendarShiftStatusEnum,
  DAY_GRID,
  DRAWER_TYPE,
  SCHEDULE_CALENDAR_VIRTUALIZATION,
  SCHEDULE_DUTIES,
  ShiftStatus,
  TIME_GRID,
} from 'src/utils/constants/schedules';
import { capitalizeFirstLetter } from 'src/utils/string/common';

const DUTY_COLOR_CLASS = {
  [SCHEDULE_DUTIES.DEDICATED]: 'dutyGreen',
  [SCHEDULE_DUTIES.PATROL]: 'dutyBlue',
  [SCHEDULE_DUTIES.DISPATCH]: 'dutyPurple',
  [SCHEDULE_DUTIES.HIT]: 'dutyBlue',
  [SCHEDULE_DUTIES.EXTRA]: 'dutyYellow',
};

const EVENT_BG_COLOR_CLASSES = {
  [calendarShiftStatusEnum.NOT_STARTED]: 'dutyYellowBg',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'dutyBlueBg',
  [calendarShiftStatusEnum.COMPLETED]: 'dutyGreenBg',
};

const isShiftCancelled = (shift = {}) => {
  const normalizedShiftStatus = `${
    shift?.shiftStatus || shift?.scheduleStatus || ''
  }`.toLowerCase();
  const isCancelledByStatus =
    normalizedShiftStatus === 'cancelled' || normalizedShiftStatus === 'canceled';
  const isCancelledByFlag =
    shift?.isCancelled === true || `${shift?.isCancelled}`.toLowerCase() === 'true';
  return isCancelledByStatus || isCancelledByFlag;
};

/**
 * Whether a card can be picked in harmonize's selection mode.
 *
 * Harmonize *moves work*, so anything that cannot be moved must not be
 * selectable. A completed visit is history (D4) and a cancelled one is void —
 * offering them a checkbox invites a planner to build a selection the Apply step
 * would then have to refuse or silently drop, which is worse than not offering
 * it. `getVisitActionRules` already knows which states are read-only, so this
 * asks it rather than keeping a second list that could disagree.
 *
 * Shifts that are not visits keep the old rule: dedicated and dispatch are a
 * different unit of work and harmonize has nothing to say about them.
 */
const isSelectableForHarmonize = (shift = {}, shiftType) => {
  if (shiftType === SCHEDULE_DUTIES.DEDICATED || shiftType === SCHEDULE_DUTIES.DISPATCH) {
    return false;
  }
  if (shiftType !== SCHEDULE_DUTIES.HIT) return true;
  return !getVisitActionRules(shift).isReadOnly;
};

const getValuesWrtStatuses = ({ shift, t }) => {
  const { scheduleStatus, shiftStatus } = shift || {};
  const isInProgressState = [
    ShiftStatus.SHIFT_STARTED,
    ShiftStatus.BREAK_STARTED,
    ShiftStatus.BREAK_ENDED,
  ].includes(shiftStatus);

  const effectiveScheduleStatus = isInProgressState
    ? calendarShiftStatusEnum.IN_PROGRESS
    : scheduleStatus;

  return {
    statusIcon: calendarIndicatorIcons[effectiveScheduleStatus],
    statusValue: calendarShiftStatusValues(t)?.[effectiveScheduleStatus],
    eventBgColorClass: EVENT_BG_COLOR_CLASSES[effectiveScheduleStatus],
  };
};

const SHIFT_COUNT_THIS_WEEK_RE = /^(\d+)\s+(Shift|Shifts)\s+this week$/i;

const INITIAL_OVERVIEW_EXPANDED_SECTIONS = {
  'overview-patrol': true,
  'overview-dedicated': true,
};

const OVERVIEW_ACCORDION_BG = '#F5F5F6';
const SITE_BAND_BG = '#E6F6FD';
const BAND_ROW_HEIGHT_PX = 36;
/** Hard cap so a bad scrollHeight read cannot stretch the blue lane cover over the grid. */
const SITE_BAND_MAX_HEIGHT_PX = 240;
const OVERVIEW_EMPTY_ROW_HEIGHT_PX = 280;
const overviewEmptyStateRoots = new WeakMap();

const OverviewSectionEmptyState = ({ classes, title, description }) => (
  <Box className={classes.overviewSectionEmptyState} data-overview-empty="true">
    <NoShiftIcon className={classes.overviewSectionEmptyIcon} />
    <Typography variant="h2" className={classes.overviewSectionEmptyTitle}>
      {title}
    </Typography>
    <Typography variant="body2" className={classes.overviewSectionEmptyText}>
      {description}
    </Typography>
  </Box>
);

OverviewSectionEmptyState.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

/**
 * Screen-reader name for a calendar card, assembled from the same facts the
 * card shows: when, where, who, and its status.
 */
const buildEventAccessibleName = (info, { t, is24Hours, getLabel }) => {
  const shift = info.event?.extendedProps || {};
  const { statusValue } = getValuesWrtStatuses({ shift, t });

  // Visit state carries facts no status string does — blocked, inserted mid-route,
  // not on a runsheet at all — and the card shows it, so the name must too.
  const visitState = shift.shiftType === SCHEDULE_DUTIES.HIT ? resolveVisitState(shift) : null;
  const visitStateLabel =
    visitState && visitState !== VISIT_STATE.SCHEDULED
      ? t(`obx.schedules.calendar.visits.state.${VISIT_STATE_LABEL_KEYS[visitState]}`, {
          runsheet: getLabel('terms', 'runsheet', t),
          tour: getLabel('terms', 'tour', t),
          hit: getLabel('terms', 'hit', t),
        })
      : null;

  const parts = [
    formatShiftScheduleTimeRange(shift.startsAt, shift.endsAt, is24Hours),
    shift.site?.name || shift.siteName,
    shift.name || shift.runsheetName,
    shift.officer?.name || shift.reassignedOfficer?.name,
    visitStateLabel,
    statusValue,
  ];

  // "Unassigned" can arrive from both the officer slot and the status, and
  // hearing it twice in a row tells the listener nothing extra.
  return [...new Set(parts.filter(Boolean))].join(', ');
};

const getEscapedResourceId = (resourceId) =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(resourceId)) : String(resourceId);

const getResourceElements = (calendarRoot, resourceId) => {
  if (!calendarRoot || resourceId == null) return [];
  const escapedId = getEscapedResourceId(resourceId);
  return Array.from(calendarRoot.querySelectorAll(`[data-resource-id="${escapedId}"]`));
};

/**
 * FullCalendar v7 no longer uses a table divider column. Paint sibling
 * resource nodes so left label + timeline lane read as one band.
 */
const paintTimelineDivider = (element, backgroundColor) => {
  if (!element) return;

  const labelCell = element.closest?.('[role="rowheader"], [role="gridcell"], td') || element;
  if (labelCell?.style) {
    labelCell.style.borderRight = 'none';
  }

  const calendarRoot = element.closest('.fc');
  const resourceId =
    element.getAttribute?.('data-resource-id') || labelCell?.getAttribute?.('data-resource-id');
  if (!calendarRoot || resourceId == null) return;

  getResourceElements(calendarRoot, resourceId).forEach((node) => {
    if (node === labelCell || node === element) return;
    if (node.getAttribute('role') === 'gridcell') {
      node.style.backgroundColor = backgroundColor;
      node.style.background = backgroundColor;
    }
  });
};

const hideAccordionTimelineDivider = (element) =>
  paintTimelineDivider(element, OVERVIEW_ACCORDION_BG);

const paintSiteBandTimelineDivider = (element) => paintTimelineDivider(element, SITE_BAND_BG);

const applyFrameHeight = (frame, heightPx) => {
  if (!frame) return;
  frame.style.setProperty('height', `${heightPx}px`, 'important');
  frame.style.setProperty('min-height', `${heightPx}px`, 'important');
  frame.style.setProperty('max-height', `${heightPx}px`, 'important');
};

/** Keep label + lane the same height (FC7 uses div gridcells, not datagrid frames). */
const forceResourceRowHeight = (info, heightPx = BAND_ROW_HEIGHT_PX) => {
  if (!info?.el) return;

  const calendarRoot = info.el.closest?.('.fc');
  const resourceId = info.resource?.id;
  applyFrameHeight(info.el, heightPx);

  if (!calendarRoot || resourceId == null) return;

  getResourceElements(calendarRoot, resourceId).forEach((node) => applyFrameHeight(node, heightPx));
};

const unmountOverviewEmptyState = (laneEl) => {
  const root = overviewEmptyStateRoots.get(laneEl);
  if (!root) return;
  root.unmount();
  overviewEmptyStateRoots.delete(laneEl);
};

const mountOverviewEmptyState = (laneEl, { classes, title, description, theme }) => {
  if (!laneEl) return;

  unmountOverviewEmptyState(laneEl);

  const existingCover = laneEl.querySelector('[data-lane-cover="true"]');
  if (existingCover) existingCover.remove();

  // Hide day-column borders inside this empty lane (FC7 classic hashed slot classes).
  laneEl.style.setProperty('--fc-classic-border', 'transparent');
  laneEl.style.setProperty('--fc-classic-strong-border', 'transparent');
  laneEl.querySelectorAll('*').forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.borderLeftColor = 'transparent';
    node.style.borderRightColor = 'transparent';
  });

  const cover = document.createElement('div');
  cover.dataset.laneCover = 'true';
  cover.className = classes.overviewSectionEmptyLaneCover;
  laneEl.style.position = 'relative';
  laneEl.style.overflow = 'hidden';
  laneEl.style.background = '#FFFFFF';
  laneEl.appendChild(cover);

  const root = createRoot(cover);
  root.render(
    <ThemeProvider theme={theme}>
      <OverviewSectionEmptyState classes={classes} title={title} description={description} />
    </ThemeProvider>,
  );
  overviewEmptyStateRoots.set(laneEl, root);
};

/**
 * Measure site-band label content only.
 * Prefer the inner label box — using the resource cell's scrollHeight can include
 * unrelated layout and stretch the #E6F6FD lane cover across the grid.
 */
const measureSiteBandLabelHeight = (labelEl) => {
  const measureEl = labelEl.querySelector(':scope > div') || labelEl.firstElementChild || labelEl;
  measureEl.style.setProperty('white-space', 'normal', 'important');
  measureEl.style.setProperty('height', 'auto', 'important');
  measureEl.style.setProperty('max-height', 'none', 'important');

  const innerHeight = Math.ceil(
    measureEl.getBoundingClientRect().height || measureEl.offsetHeight || 0,
  );
  return Math.min(SITE_BAND_MAX_HEIGHT_PX, Math.max(BAND_ROW_HEIGHT_PX, innerHeight));
};

/**
 * Measure the left site-band label and mirror that height onto the calendar lane
 * so both sides stay aligned (same as pre-FC7 band sync).
 */
const syncSiteBandRowHeight = (info) => {
  if (!info?.el || !info.resource?.extendedProps?.isDedicatedSiteBand) return;

  const calendarRoot = info.el.closest?.('.fc');
  const resourceId = info.resource?.id;
  if (!calendarRoot || resourceId == null) return;

  const nodes = getResourceElements(calendarRoot, resourceId);
  const labelEl = nodes.find((node) => node.getAttribute?.('role') === 'rowheader') || info.el;
  const laneEl = nodes.find((node) => node.getAttribute?.('role') === 'gridcell');

  // Let the label size to its content before measuring.
  labelEl.style.setProperty('height', 'auto', 'important');
  labelEl.style.setProperty('min-height', `${BAND_ROW_HEIGHT_PX}px`, 'important');
  labelEl.style.removeProperty('max-height');

  const heightPx = measureSiteBandLabelHeight(labelEl);

  // Lock label + lane to the same height so the blue band is one uniform row.
  applyFrameHeight(labelEl, heightPx);
  if (laneEl) applyFrameHeight(laneEl, heightPx);
  // Keep band chrome clipped so a cover cannot paint over neighboring rows.
  labelEl.style.setProperty('overflow', 'hidden', 'important');
  if (laneEl) laneEl.style.setProperty('overflow', 'hidden', 'important');

  labelEl.style.backgroundColor = SITE_BAND_BG;
  labelEl.style.background = SITE_BAND_BG;
  if (laneEl) {
    laneEl.style.backgroundColor = SITE_BAND_BG;
    laneEl.style.background = SITE_BAND_BG;
  }
};

const renderShiftCountSubtitle = (subtitle, classes) => {
  const shiftCountMatch = String(subtitle).match(SHIFT_COUNT_THIS_WEEK_RE);
  if (!shiftCountMatch) return subtitle;

  return (
    <>
      <Box component="span" className={classes.resourceLabelSubtitleCount}>
        {`${shiftCountMatch[1]} ${shiftCountMatch[2]}`}
      </Box>{' '}
      <Box component="span" className={classes.resourceLabelSubtitleMuted}>
        this week
      </Box>
    </>
  );
};

/**
 * Schedule-domain calendar: builds view-model data and renderers, then
 * passes them into the common Calendar shell.
 */
const ScheduleCalendarGrid = ({
  events,
  listEvents,
  weekViewLocations,
  dayViewDuties,
  dayViewLocations,
  setShowDrawer,
  queryParams,
  setQueryParams,
  loading,
  missedHitsCount,
  refreshMissedHitsCount,
  toolbarLeftContent,
  showListSwitch = true,
  activeScheduleTab,
  overviewSections = [],
  onAssignmentSuccess,
  selectionMode,
  showOnlyScheduledSites = false,
  selectedShiftIds,
  onToggleShiftSelect,
  harmonizePreview,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const shiftTypes = useSelector((state) => state.tenantConfigs?.labels?.shift_types || {});
  const { is24Hours } = useDateTime();
  const [overviewExpandedSections, setOverviewExpandedSections] = useState(
    INITIAL_OVERVIEW_EXPANDED_SECTIONS,
  );
  const [missedHitDrawerData, setMissedHitDrawerData] = useState(null);
  const officerAssignPopoverRef = useRef(null);

  const scheduleTabConfig = getScheduleTabConfig(activeScheduleTab);
  const {
    calendarResources,
    calendarEvents,
    resourceAreaHeaderKey,
    isOverviewWeekView,
    isDedicatedWeekView,
    isOfficerWeekView,
    isVisitsWeekView,
    hasCustomResourceLabels,
    hasNoScheduleData,
    skeletonVariant,
  } = useScheduleCalendarViewModel({
    scheduleTabConfig,
    selectedViewType: queryParams.selectedView?.type,
    overviewSections,
    weekViewLocations,
    events,
    overviewExpandedSections,
    dayViewDuties,
    showOnlyScheduledSites,
  });
  const resourceAreaHeader = resolveResourceAreaHeader(resourceAreaHeaderKey, getLabel, t);
  const syncBandRowMounts = isOverviewWeekView || isDedicatedWeekView || isOfficerWeekView;
  const isEmbeddedWeekView =
    Boolean(scheduleTabConfig?.isLegacyEmbeddedView) &&
    queryParams.selectedView?.type === DAY_GRID.WEEK;

  const isOverviewSectionsEmptyOnly = useMemo(() => {
    if (!isOverviewWeekView || !calendarResources?.length) return false;
    return calendarResources.every((resource) => {
      const extended = resource.extendedProps || resource;
      return extended.isOverviewSection || extended.isOverviewEmptyState;
    });
  }, [isOverviewWeekView, calendarResources]);

  const { sortedEvents: sortedDayViewEvents } = useMemo(
    () => buildSortedDayViewData(dayViewDuties, dayViewLocations),
    [dayViewDuties, dayViewLocations],
  );

  const showSideDrawerHandler = useCallback(
    ({ requiresAttention, id, shiftId, ...rest }) => {
      let open = undefined;
      let activeIndex = 0;

      if (
        requiresAttention &&
        [SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(rest?.shiftType)
      ) {
        if (getCurrentStandardTimeInIsoWrtTimezone() >= rest?.endsAt || rest?.isCancelled) {
          open = DRAWER_TYPE.DETAIL;
          activeIndex = 2;
        } else if (userHasPermission(ACL_OBX_SCHEDULES_UPDATE)) {
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
    },
    [setShowDrawer],
  );

  const handleOfficerAssignClick = useCallback((event, shift = {}) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();

    if (!userHasPermission(ACL_OBX_SCHEDULES_UPDATE)) return;
    if (isShiftCancelled(shift)) return;
    if (shift?.endsAt && getCurrentStandardTimeInIsoWrtTimezone() >= shift.endsAt) return;

    const { shiftType } = shift;
    if (
      ![
        SCHEDULE_DUTIES.DEDICATED,
        SCHEDULE_DUTIES.EXTRA,
        SCHEDULE_DUTIES.PATROL,
        SCHEDULE_DUTIES.DISPATCH,
      ].includes(shiftType)
    ) {
      return;
    }

    // Imperative open keeps popover state out of this grid (no FullCalendar re-render).
    officerAssignPopoverRef.current?.open(event.currentTarget, shift);
  }, []);

  const handleOfficerAssignSuccess = useCallback(
    (payload) => {
      onAssignmentSuccess?.(payload);
    },
    [onAssignmentSuccess],
  );

  const handleEventClick = useCallback(
    (info, calendarRef) => {
      // FullCalendar listens natively; React stopPropagation on the person icon
      // does not cancel eventClick — skip drawer when assign trigger was clicked.
      if (info.jsEvent?.target?.closest?.('[data-officer-assign-trigger="true"]')) {
        return;
      }

      if (info.view.type === DAY_GRID.MONTH) {
        const updatedViewType = DAY_GRID.DAY;
        const API = calendarRef.current?.getApi?.();
        if (!API) return;

        API.changeView(updatedViewType, info.event.start);
        const { activeEnd, activeStart, type } = API.view || {};
        const { windowStart, windowEnd } = getStartEndTimeForView({ activeEnd, activeStart, type });

        setQueryParams((prev) => ({
          ...prev,
          selectedView: {
            ...prev.selectedView,
            type: updatedViewType,
            windowStart,
            windowEnd,
          },
        }));
        return;
      }

      if (info.view.type === DAY_GRID.WEEK) {
        let data = info.event.extendedProps || {};
        data = { ...data, startsAt: data?.startsAt };

        /* While selecting, a click on a visit means "pick this" rather than
           "open this" — so the whole card is the target, not a small tick.

           A card that cannot be harmonized falls through to opening its drawer
           instead of being inert: a completed visit still has a report worth
           reading, and a click that does nothing at all reads as a broken
           screen. Same predicate as the checkbox, so what is clickable and what
           is ticked can never disagree. */
        if (selectionMode && isSelectableForHarmonize(data, data.shiftType)) {
          onToggleShiftSelect?.({ ...data, id: info.event?.id });
          return;
        }

        showSideDrawerHandler({ ...data, id: info.event?.id });
      }
    },
    [setQueryParams, showSideDrawerHandler, selectionMode, onToggleShiftSelect],
  );

  const onClickListViewEvent = useCallback(
    (data) => {
      showSideDrawerHandler({ ...data });
    },
    [showSideDrawerHandler],
  );

  const isDedicatedCancelledShift = useCallback(
    (shift = {}) => shift?.shiftType === SCHEDULE_DUTIES.DEDICATED && isShiftCancelled(shift),
    [],
  );

  const eventMounted = useCallback(
    (info) => {
      const { shiftType } = info.event.extendedProps || {};
      const eventClassName = classes[DUTY_COLOR_CLASS[shiftType]];
      if (eventClassName) {
        info.el.className += ` ${eventClassName}`;
      }
      /* Stamp identity on the node so selection can be painted without asking
         FullCalendar to re-render content it has already cached. */
      info.el.dataset.visitId = info.event.id;
      info.el.dataset.selectable = isSelectableForHarmonize(info.event.extendedProps, shiftType)
        ? 'true'
        : 'false';

      /* Every card is a focusable, clickable node but FullCalendar gives it no
         accessible name, so the whole grid read as a run of bare "button"s.
         Compose one from what the card actually shows. */
      const accessibleName = buildEventAccessibleName(info, { t, is24Hours, getLabel });
      if (accessibleName) info.el.setAttribute('aria-label', accessibleName);
    },
    [classes, is24Hours, t, getLabel],
  );

  /*
    FullCalendar caches rendered event content, so the tick is painted onto the
    already-mounted nodes rather than rendered through eventContent.
  */
  useEffect(() => {
    document.querySelectorAll('[data-visit-id]').forEach((node) => {
      const isSelected = selectedShiftIds?.has(node.dataset.visitId) ? 'true' : 'false';
      node.dataset.selecting = selectionMode ? 'true' : 'false';
      node.dataset.selected = isSelected;

      /* FullCalendar exposes each card as a button, so in selection mode it is a
         toggle button and has to say so — a screen reader otherwise gets the same
         accessible name whether the visit is picked or not, with the tick being
         purely visual. `aria-pressed` is removed on exit rather than set to false,
         because outside selection mode the card is a plain button again. */
      if (selectionMode && node.dataset.selectable === 'true') {
        node.setAttribute('aria-pressed', isSelected);
      } else {
        node.removeAttribute('aria-pressed');
      }
    });
  }, [selectedShiftIds, selectionMode, calendarEvents]);

  /*
    While the harmonize drawer is open the calendar shows what would happen:
    visits leaving their day fade in place, spilled ones grey out, and the day
    they are heading for is marked. Apply then confirms something the planner
    has already been looking at, rather than announcing a change after the fact.
  */
  useEffect(() => {
    const moving = new Set(harmonizePreview?.movingVisitIds || []);
    const spilling = new Set(harmonizePreview?.overflowVisitIds || []);

    document.querySelectorAll('[data-visit-id]').forEach((node) => {
      const { visitId } = node.dataset;
      if (moving.has(visitId)) node.dataset.harmonizing = 'leaving';
      else if (spilling.has(visitId)) node.dataset.harmonizing = 'spilling';
      else delete node.dataset.harmonizing;
    });

    document.querySelectorAll('[data-date]').forEach((node) => {
      const { date } = node.dataset;
      if (date && date === harmonizePreview?.targetDay) node.dataset.harmonizeTarget = 'landing';
      else if (date && date === harmonizePreview?.overflowDay) {
        node.dataset.harmonizeTarget = 'overflow';
      } else delete node.dataset.harmonizeTarget;
    });
  }, [harmonizePreview, calendarEvents]);

  // The visits tab styles its cards and month cells itself, in every view.
  const isVisitsView = scheduleTabConfig?.id === 'visits';

  const eventContent = useCallback(
    (info) => {
      // FullCalendar stores `id` on the event, not in extendedProps — merge it back.
      const shift = {
        ...(info.event.extendedProps || {}),
        id: info.event?.id || info.event.extendedProps?.id,
      };
      const { requiresAttention, name, shiftType, unassignedCount } = shift;
      const currentView = info.view.type;

      if (currentView === DAY_GRID.MONTH) {
        /* The visits month cell answers two questions — how many, and does any of
           it need me — and nothing else. Naming the service in all 35 cells was
           noise: it is the same service every day, the tab already says which,
           and at a seventh of the grid's width the tenant term truncated to
           "Filter Replacement Se…" while the count shrank to a "1x" prefix.
           Count first, at size; the service name is dropped entirely. */
        if (isVisitsView) {
          const assigned = Number(shift.assignedCount) || 0;
          const unassigned = Number(unassignedCount) || 0;
          const total = assigned + unassigned;
          const hitsTerm = total === 1 ? getLabel('terms', 'hit', t) : getLabel('terms', 'hits', t);

          return (
            <Box className={classes.visitsMonthCell}>
              <Box className={classes.visitsMonthTotal}>
                <Typography component="span" className={classes.visitsMonthCount}>
                  {total}
                </Typography>
                <Typography component="span" className={classes.visitsMonthTerm}>
                  {hitsTerm}
                </Typography>
              </Box>
              {unassigned > 0 ? (
                <Box
                  className={classes.visitsMonthUnassigned}
                  title={t('obx.schedules.calendar.visits.monthUnassigned', {
                    count: unassigned,
                  })}
                >
                  <UnassignedIcon />
                  <Typography component="span" className={classes.visitsMonthUnassignedCount}>
                    {unassigned}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          );
        }

        return (
          <Box className={`${classes.eventContentMonthAlert}`}>
            <DutyIndicator color={DUTY_COLORS[shiftType]} label={name} />
            {requiresAttention && (
              <ToolTipComponent unassignedCount={unassignedCount} shiftType={shiftType} />
            )}
          </Box>
        );
      }

      if (currentView === DAY_GRID.WEEK) {
        const { statusIcon, statusValue, eventBgColorClass } = getValuesWrtStatuses({ shift, t });
        const cancelledDedicatedClass = isDedicatedCancelledShift(shift)
          ? classes.cancelledDedicatedCard
          : '';
        const isExtraHit = shiftType === SCHEDULE_DUTIES.HIT && shift?.isExtra;
        const dutyColor = isExtraHit
          ? DUTY_COLOR_CLASS[SCHEDULE_DUTIES.EXTRA]
          : DUTY_COLOR_CLASS[shiftType];
        const useLegacyCard = scheduleTabConfig?.isLegacyEmbeddedView;
        const CardContent = useLegacyCard ? LegacyCalendarCardContent : CalendarCardContent;

        // A visit is a smaller unit than a shift — window, site, and whether a
        // route has claimed it. The shift card's officer/vehicle rows would be
        // mostly empty here, so visits get their own compact card.
        /* The visit state owns this card's colour outright — no duty class, no
           status background. Both of those resolve through the tenant brand
           palette (`dutyBlueBg` is `surfaceBrandSubtle`), so on a green-branded
           tenant a live-route card rendered green while its label said blue. Two
           systems were colouring one card; now one does. */
        if (isVisitsWeekView) {
          return (
            <Box
              /* Selection state is stamped on FullCalendar's event harness, but the
                 harness is 8px larger than the card on every side. Painting the
                 checkbox and the selected outline against it put the tick outside
                 the card — visually in the row above — and drew the outline around
                 empty margin. This attribute gives those rules a stable handle on
                 the card itself; makeStyles class names are hashed, so a global
                 rule cannot name one. */
              data-visit-card="true"
              className={`${classes.eventContent} ${classes.eventContentWeek} ${getVisitStateCardClass(
                classes,
                shift,
              )}`}
            >
              <VisitCardContent
                shift={shift}
                statusIcon={statusIcon}
                statusValue={statusValue}
                is24Hours={is24Hours}
              />
            </Box>
          );
        }

        return (
          <Box
            className={`${classes.eventContent} ${classes.eventContentWeek} ${classes[dutyColor]} ${classes[eventBgColorClass]} ${cancelledDedicatedClass}`}
          >
            <CardContent
              shift={shift}
              statusIcon={statusIcon}
              statusValue={statusValue}
              is24Hours={is24Hours}
              {...(useLegacyCard ? {} : { onOfficerAssignClick: handleOfficerAssignClick })}
            />
          </Box>
        );
      }

      return null;
    },
    [
      classes,
      handleOfficerAssignClick,
      isDedicatedCancelledShift,
      is24Hours,
      isVisitsWeekView,
      isVisitsView,
      getLabel,
      scheduleTabConfig?.isLegacyEmbeddedView,
      selectionMode,
      selectedShiftIds,
      onToggleShiftSelect,
      t,
    ],
  );

  const customTimeSlotView = useCallback(
    (info) => {
      const hour = info.date.getHours();
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return (
        <Typography variant="subtitle3" className={classes.calendarTimeSlot}>
          {formattedHour} {ampm}
        </Typography>
      );
    },
    [classes.calendarTimeSlot],
  );

  const weekViewCustomDaysHeader = useCallback(
    (info) => {
      const date = info.date.getDate();
      const dayName = info.date.toLocaleString('default', { weekday: 'short' });
      // Franchise "today" only — do not use info.isToday (browser/system TZ).
      // Marker drives full-slot blue fill via :has([data-schedule-header-today]).
      const franchiseToday = dayjsWithTimezone();
      const isCurrentDate =
        info.date.getFullYear() === franchiseToday.year() &&
        info.date.getMonth() === franchiseToday.month() &&
        info.date.getDate() === franchiseToday.date();

      return (
        <Box
          className={`${classes.calendarHeaderCell} ${
            isCurrentDate ? classes.calendarHeaderCellToday : ''
          }`}
          {...(isCurrentDate ? { 'data-schedule-header-today': 'true' } : {})}
        >
          <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
            {dayName}
          </Typography>
          <Typography variant="subtitle2" className={classes.calendarHeaderCellDate}>
            {date}
          </Typography>
        </Box>
      );
    },
    [
      classes.calendarHeaderCell,
      classes.calendarHeaderCellToday,
      classes.calendarHeaderCellDate,
      classes.calendarHeaderCellDay,
    ],
  );

  const customHeaderView = useCallback(
    (info) => {
      const date = info.date.getDate();
      const dayName = info.date.toLocaleString('default', { weekday: 'short' });
      const dayMonth = info.date.toLocaleString('default', { month: 'short' });
      const currentView = info.view.type;
      const currentDate = dayjsWithTimezone();
      const isCurrentDate =
        info.date.getFullYear() === currentDate.year() &&
        info.date.getMonth() === currentDate.month() &&
        info.date.getDate() === currentDate.date();
      const highlightClass = isCurrentDate ? classes.highlightCurrentDate : '';
      const highlightClassDay = isCurrentDate ? classes.highlightCurrentDay : '';

      if ([DAY_GRID.WEEK].includes(currentView)) {
        return weekViewCustomDaysHeader(info);
      }

      if (currentView === DAY_GRID.MONTH) {
        return (
          <Box className={classes.calendarHeaderMonthCell}>
            <Typography variant="subtitle2" className={classes.calendarHeaderMonthCellDate}>
              {dayName}
            </Typography>
          </Box>
        );
      }

      if ([DAY_GRID.DAY].includes(currentView)) {
        // Date chip only — location/shift cards render via belowGridContent so FC's
        // classic centered dayHeaderContent cannot shrink-wrap the day grid.
        return (
          <Box className={`${classes.calendarHeaderCell} ${classes.calendarDayViewDateHeader}`}>
            <Typography variant="subtitle2" className={classes.calendarHeaderCellDay}>
              {dayName}
            </Typography>
            <Typography
              variant="subtitle2"
              className={`${classes.calendarHeaderCellDate} ${highlightClass}`}
            >
              {date}
            </Typography>
          </Box>
        );
      }

      if (currentView === TIME_GRID.LIST) {
        const dayEvents = listEvents?.[date];
        return (
          <Box className={classes.calendarListView}>
            <Box className={classes.calendarListViewTime}>
              <Typography
                variant="subtitle1"
                className={`${classes.calendarListViewDate} ${highlightClass}`}
              >
                {date}
              </Typography>
              <Box>
                <Typography
                  variant="subtitle2"
                  className={`${classes.calendarListViewDay} ${highlightClassDay}`}
                >
                  {dayMonth}, {dayName}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.calendarListViewRight}>
              {dayEvents?.map((event) => (
                <Box
                  key={event?.id}
                  className={classes.calendarListViewEvent}
                  onClick={() => onClickListViewEvent(event)}
                >
                  <Box className={classes.calendarListViewEventBody}>
                    <DutyIndicator
                      color={DUTY_COLORS[event?.shiftType]}
                      label={formatShiftScheduleTimeRange(event?.start, event?.end, is24Hours)}
                      className={classes.calendarListViewDutyTime}
                    />
                  </Box>
                  <Typography variant="subtitle3" className={classes.calendarListViewDutyName}>
                    {event?.name}
                  </Typography>
                  {event?.requiresAttention && <ToolTipComponent shiftType={event?.shiftType} />}
                </Box>
              ))}
            </Box>
          </Box>
        );
      }

      return null;
    },
    [classes, is24Hours, listEvents, onClickListViewEvent, weekViewCustomDaysHeader],
  );

  const isDayView = queryParams.selectedView?.type === DAY_GRID.DAY;

  const dayViewBelowGridContent = useMemo(() => {
    if (!isDayView || loading || hasNoScheduleData) return null;

    return (
      <Box className={classes.calendarDayCustom} data-testid="schedule-day-view-body">
        {sortedDayViewEvents?.map(([locationName, shifts], index) => {
          const rowShifts = shifts || [];
          // Unassigned demand leads the day the same way it leads the week.
          const isUnassignedGroup = `${locationName}`.trim().toLowerCase() === 'unassigned';

          return (
            <Box
              key={index}
              className={`${classes.dayViewBorder} ${
                isUnassignedGroup ? classes.dayViewUnassignedSection : ''
              }`}
            >
              <Box className={classes.dayLocationHeader}>
                <Typography
                  variant="subtitle2"
                  className={`${classes.dayLocationName} ${
                    isUnassignedGroup ? classes.dayLocationNameUnassigned : ''
                  }`}
                >
                  {resolveScheduleSectionTitle(locationName, { getLabel, t, shiftTypes })}
                </Typography>
                <Typography variant="subtitle3" className={classes.dayLocationCount}>
                  {t('obx.schedules.calendar.dayView.scheduledCount', { count: rowShifts.length })}
                </Typography>
              </Box>
              {/* A site with nothing booked has to say so — an empty heading
                  reads as a rendering failure rather than a free day. */}
              {rowShifts.length === 0 ? (
                <Typography variant="body3" className={classes.dayLocationEmpty}>
                  {t('obx.schedules.calendar.dayView.nothingScheduled')}
                </Typography>
              ) : null}
              <Box className={classes.dayViewWrapper}>
                {rowShifts.map((shift) => {
                  const { statusIcon, statusValue, eventBgColorClass } = getValuesWrtStatuses({
                    shift,
                    t,
                  });
                  const cancelledDedicatedClass = isDedicatedCancelledShift(shift)
                    ? classes.cancelledDedicatedCard
                    : '';
                  const useLegacyCard = scheduleTabConfig?.isLegacyEmbeddedView;
                  const isVisitCard = shift?.shiftType === SCHEDULE_DUTIES.HIT;
                  const CardContent = useLegacyCard
                    ? LegacyCalendarCardContent
                    : isVisitCard
                      ? VisitCardContent
                      : CalendarCardContent;

                  return (
                    <Box
                      key={shift?.id}
                      className={
                        // Same single-owner rule as the week grid above.
                        isVisitCard
                          ? `${classes.dayEventContent} ${classes.eventContentWeek} ${getVisitStateCardClass(classes, shift)}`
                          : `${classes.dayEventContent} ${classes.eventContentWeek} ${classes[DUTY_COLOR_CLASS[shift?.shiftType]]} ${classes[eventBgColorClass]} ${cancelledDedicatedClass}`
                      }
                      onClick={(event) => {
                        if (event.target?.closest?.('[data-officer-assign-trigger="true"]')) {
                          return;
                        }
                        onClickListViewEvent(shift);
                      }}
                    >
                      <CardContent
                        shift={shift}
                        statusIcon={statusIcon}
                        statusValue={statusValue}
                        is24Hours={is24Hours}
                        {...(useLegacyCard || isVisitCard
                          ? {}
                          : {
                              onOfficerAssignClick: handleOfficerAssignClick,
                              showContextualDetails: true,
                            })}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }, [
    classes,
    getLabel,
    handleOfficerAssignClick,
    hasNoScheduleData,
    is24Hours,
    isDayView,
    isDedicatedCancelledShift,
    loading,
    onClickListViewEvent,
    scheduleTabConfig?.isLegacyEmbeddedView,
    shiftTypes,
    sortedDayViewEvents,
    t,
  ]);

  const handleToggleOverviewSection = useCallback(
    (section) => (event) => {
      event.stopPropagation();
      setOverviewExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    [],
  );

  const resourceLabelContent = useCallback(
    (info) => {
      const { resource } = info;
      const isOverviewSection = resource.extendedProps?.isOverviewSection;
      const isOverviewEmptyState = resource.extendedProps?.isOverviewEmptyState;
      const isDedicatedSiteBand = resource.extendedProps?.isDedicatedSiteBand;
      const isUnassignedLocation = resource.extendedProps?.isUnassignedLocation;
      const subtitle = resource.extendedProps?.subtitle;
      const isOverviewDedicatedRow =
        resource.extendedProps?.overviewSection === 'overview-dedicated';
      const officerHours = resource.extendedProps?.meta?.hoursThisWeek;
      const officerOvertime = resource.extendedProps?.meta?.overtimeHours;

      if (isOverviewEmptyState) {
        // In-flow spacer so FC virtualization measures a real row height.
        // Empty UI is mounted into the timeline lane in resourceLaneDidMount.
        return <Box className={classes.overviewSectionEmptyLabelSpacer} aria-hidden />;
      }

      if (isDedicatedSiteBand) {
        return (
          <Box className={classes.dedicatedSiteBandLabel}>
            <Typography
              component="div"
              className={classes.dedicatedSiteBandTitle}
              title={resource?.title}
            >
              {resource.title}
            </Typography>
            {subtitle ? (
              <Typography
                component="div"
                className={classes.dedicatedSiteBandSubtitle}
                title={subtitle}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        );
      }

      // The pinned unassigned band is the headline row of the visits view — it
      // is the demand nobody has picked up — so it is labelled louder than the
      // site rows beneath it.
      if (isUnassignedLocation && isVisitsWeekView) {
        return (
          <Box className={classes.unassignedVisitsLabel}>
            <Box className={classes.unassignedVisitsTitleRow}>
              <UnassignedIcon />
              <Typography
                variant="subtitle2"
                className={classes.unassignedVisitsTitle}
                title={resource.title}
              >
                {t('obx.schedules.calendar.visits.unassignedRow', {
                  hits: getLabel('terms', 'hits', t),
                })}
              </Typography>
            </Box>
            {subtitle ? (
              <Typography variant="subtitle3" className={classes.unassignedVisitsSubtitle}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        );
      }

      if (isUnassignedLocation && (isDedicatedWeekView || isOverviewDedicatedRow)) {
        return (
          <Box className={classes.unassignedLocationLabel}>
            <Box className={classes.unassignedLocationTitleRow}>
              <Typography
                variant="subtitle2"
                className={classes.unassignedLocationTitle}
                title={resource.title}
              >
                {resource.title}
              </Typography>
              <Box className={classes.unassignedLocationIcon}>
                <UnassignedIcon />
              </Box>
            </Box>
          </Box>
        );
      }

      if (!isOverviewSection) {
        const overtimeHours = Number(officerOvertime);
        const showOfficerOvertime =
          isOfficerWeekView && Number.isFinite(overtimeHours) && overtimeHours > 0;
        const officerAvatar =
          resource.extendedProps?.avatar ||
          resource.extendedProps?.meta?.imageUrl ||
          resource.extendedProps?.meta?.avatar;

        if (isOfficerWeekView) {
          return (
            <Box className={classes.officerResourceLabel}>
              <Avatar
                className={classes.officerResourceAvatar}
                src={officerAvatar || AvatarSchedule}
                alt={resource.title || getLabel('terms', 'officer', t) || 'Officer'}
              />
              <Box className={classes.officerResourceText}>
                <Typography
                  variant="subtitle2"
                  className={classes.resourceLabelText}
                  title={resource.title}
                >
                  {resource.title}
                </Typography>
                {officerHours ? (
                  <Typography variant="subtitle3" className={classes.resourceLabelSubtitle}>
                    ${officerHours}
                    <span className={classes.resourceLabelSubtitleWrite}>hours this week</span>
                  </Typography>
                ) : null}
                {showOfficerOvertime ? (
                  <Box className={classes.officerOvertimeRow}>
                    <Box component="span" aria-hidden>
                      <AccessTimeIcon />
                    </Box>
                    <Typography variant="subtitle3" className={classes.officerOvertimeText}>
                      {`${officerOvertime} hours OT`}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </Box>
          );
        }

        /* Visit cadence is sparse, so most site rows in any week are empty and
           the label column is where they either earn their space or waste it.
           "0 this week" wastes it. "Next visit Sep 12" answers the question the
           week grid cannot: when is this site next due. */
        if (isVisitsWeekView) {
          const meta = resource.extendedProps?.meta || {};
          const visitCount = Number(meta.visitCount) || 0;
          const isQuiet = visitCount === 0;
          const nextVisitAt = meta.nextVisitAt;

          const quietSubtitle = nextVisitAt
            ? t('obx.schedules.calendar.visits.rowNextVisit', {
                date: dayjsWithTimezone(nextVisitAt).format('MMM D'),
              })
            : t('obx.schedules.calendar.visits.rowNotScheduled');

          return (
            <Box
              className={`${classes.resourceLabelContent} ${
                isQuiet ? classes.visitsQuietRowLabel : ''
              } ${resource.extendedProps?.isFirstQuietRow ? classes.visitsQuietGroupStart : ''}`}
            >
              <Typography
                variant="subtitle2"
                className={classes.resourceLabelText}
                title={resource.title}
              >
                {resource.title}
              </Typography>
              <Typography
                variant="subtitle3"
                className={`${classes.resourceLabelSubtitleDedicated} ${
                  // A site with no future visit at all has fallen off the
                  // schedule. That is not a quiet row, it is a problem.
                  isQuiet && !nextVisitAt ? classes.visitsRowNotScheduled : ''
                } ${isQuiet && nextVisitAt ? classes.visitsQuietRowNextDue : ''}`}
              >
                {isQuiet
                  ? quietSubtitle
                  : t('obx.schedules.calendar.visits.rowThisWeek', { count: visitCount })}
              </Typography>
            </Box>
          );
        }

        return (
          <Box className={classes.resourceLabelContent}>
            <Typography
              variant="subtitle2"
              className={classes.resourceLabelText}
              title={resource.title}
            >
              {resource.title}
            </Typography>
            {(isDedicatedWeekView || isOverviewDedicatedRow) && subtitle ? (
              <Typography
                variant="subtitle3"
                className={classes.resourceLabelSubtitleDedicated}
                title={typeof subtitle === 'string' ? subtitle : undefined}
              >
                {renderShiftCountSubtitle(subtitle, classes)}
              </Typography>
            ) : null}
          </Box>
        );
      }

      const section = resource.extendedProps?.overviewSection;
      const isExpanded = overviewExpandedSections[section];

      return (
        <Button
          className={classes.overviewAccordionButton}
          disableRipple
          onClick={handleToggleOverviewSection(section)}
        >
          <ExpandMoreIcon
            className={`${classes.overviewAccordionIcon} ${
              isExpanded ? classes.overviewAccordionIconOpen : ''
            }`}
          />
          {resource.title}
        </Button>
      );
    },
    [
      classes,
      getLabel,
      handleToggleOverviewSection,
      isDedicatedWeekView,
      isOfficerWeekView,
      isVisitsWeekView,
      overviewExpandedSections,
      t,
    ],
  );

  const resourceLabelClassNames = useCallback(
    (info) => {
      if (info.resource?.extendedProps?.isOverviewSection) {
        return classes.overviewAccordionResourceLabel;
      }
      if (info.resource?.extendedProps?.isOverviewEmptyState) {
        return classes.overviewSectionEmptyResourceLabel;
      }
      if (info.resource?.extendedProps?.isDedicatedSiteBand) {
        return classes.dedicatedSiteBandResourceLabel;
      }
      if (isOfficerWeekView) {
        return classes.officerResourceAreaLabel;
      }
      return classes.resourceAreaLabel;
    },
    [
      classes.dedicatedSiteBandResourceLabel,
      classes.officerResourceAreaLabel,
      classes.overviewAccordionResourceLabel,
      classes.overviewSectionEmptyResourceLabel,
      classes.resourceAreaLabel,
      isOfficerWeekView,
    ],
  );

  const resourceLaneClassNames = useCallback(
    (info) => {
      if (info.resource?.extendedProps?.isOverviewSection) {
        return classes.overviewAccordionResourceLane;
      }
      if (info.resource?.extendedProps?.isOverviewEmptyState) {
        return classes.overviewSectionEmptyResourceLane;
      }
      if (info.resource?.extendedProps?.isDedicatedSiteBand) {
        return classes.dedicatedSiteBandResourceLane;
      }
      return '';
    },
    [
      classes.dedicatedSiteBandResourceLane,
      classes.overviewAccordionResourceLane,
      classes.overviewSectionEmptyResourceLane,
    ],
  );

  const resourceLaneDidMount = useCallback(
    (info) => {
      const isOverviewSection = info.resource?.extendedProps?.isOverviewSection;
      const isOverviewEmptyState = info.resource?.extendedProps?.isOverviewEmptyState;
      const isDedicatedSiteBand = info.resource?.extendedProps?.isDedicatedSiteBand;
      if (!isOverviewSection && !isOverviewEmptyState && !isDedicatedSiteBand) return;

      if (isOverviewEmptyState) {
        forceResourceRowHeight(info, OVERVIEW_EMPTY_ROW_HEIGHT_PX);
        paintTimelineDivider(info.el, '#FFFFFF');
        mountOverviewEmptyState(info.el, {
          classes,
          theme,
          title: t('obx.schedules.calendar.noEvents.title'),
          description: t('obx.schedules.calendar.noEvents.description'),
        });
        return;
      }

      if (isOverviewSection) {
        hideAccordionTimelineDivider(info.el);
        forceResourceRowHeight(info, BAND_ROW_HEIGHT_PX);
      }

      if (isDedicatedSiteBand) {
        paintSiteBandTimelineDivider(info.el);
        requestAnimationFrame(() => {
          syncSiteBandRowHeight(info);
          requestAnimationFrame(() => syncSiteBandRowHeight(info));
        });
      }

      const laneEl = info.el;
      if (!laneEl) return;

      const existingCover = laneEl.querySelector('[data-lane-cover="true"]');
      if (existingCover) existingCover.remove();

      const cover = document.createElement('div');
      cover.dataset.laneCover = 'true';
      cover.className = isDedicatedSiteBand
        ? classes.dedicatedSiteBandLaneCover
        : classes.overviewAccordionLaneCover;
      laneEl.style.position = 'relative';
      laneEl.appendChild(cover);
    },
    [classes, t, theme],
  );

  const resourceLaneWillUnmount = useCallback((info) => {
    if (!info.resource?.extendedProps?.isOverviewEmptyState) return;
    unmountOverviewEmptyState(info.el);
  }, []);

  const resourceLabelDidMount = useCallback((info) => {
    const isOverviewSection = info.resource?.extendedProps?.isOverviewSection;
    const isOverviewEmptyState = info.resource?.extendedProps?.isOverviewEmptyState;
    const isDedicatedSiteBand = info.resource?.extendedProps?.isDedicatedSiteBand;
    if (!isOverviewSection && !isOverviewEmptyState && !isDedicatedSiteBand) return;

    if (isOverviewEmptyState) {
      forceResourceRowHeight(info, OVERVIEW_EMPTY_ROW_HEIGHT_PX);
      paintTimelineDivider(info.el, '#FFFFFF');
      return;
    }

    if (isOverviewSection) {
      hideAccordionTimelineDivider(info.el);
      requestAnimationFrame(() => forceResourceRowHeight(info, BAND_ROW_HEIGHT_PX));
      return;
    }

    paintSiteBandTimelineDivider(info.el);
    requestAnimationFrame(() => {
      syncSiteBandRowHeight(info);
      requestAnimationFrame(() => syncSiteBandRowHeight(info));
    });
  }, []);

  // Clear any leftover fixed overlays from earlier experiments.
  useEffect(() => {
    document.querySelectorAll('[data-site-band-overlay]').forEach((node) => node.remove());
  }, []);

  const resourceCellContent = useCallback(
    (info) => {
      if (info.field !== 'title') return true;
      return resourceLabelContent(info);
    },
    [resourceLabelContent],
  );

  const resourceCellClass = useCallback(
    (info) => {
      if (info.field !== 'title') return '';
      return resourceLabelClassNames(info);
    },
    [resourceLabelClassNames],
  );

  const resourceCellDidMount = useCallback(
    (info) => {
      if (info.field !== 'title') return;
      resourceLabelDidMount(info);
    },
    [resourceLabelDidMount],
  );

  const isDayOrMonthView =
    queryParams.selectedView?.type === DAY_GRID.DAY ||
    queryParams.selectedView?.type === DAY_GRID.MONTH;
  const showMissedHitsAction = scheduleTabConfig?.id !== 'dedicated' || isDayOrMonthView;

  const toolbarRightContent = (
    <>
      {showMissedHitsAction && (
        <>
          {missedHitsCount === undefined && (
            <Skeleton variant="rectangular" className={classes.loaderBox} />
          )}
          <RenderIfHasPermission name={ACL_OBX_SCHEDULES_UPDATE}>
            {!!missedHitsCount && (
              <Button
                onClick={() => {
                  setMissedHitDrawerData({
                    startsAt: queryParams.selectedView.windowStart,
                    endsAt: queryParams.selectedView.windowEnd,
                  });
                }}
                endIcon={<MHitsIcon />}
                variant="destructiveSecondary"
                className={classes.missedHitsButton}
              >
                {missedHitsCount}{' '}
                {t('obx.runsheet.missedHits', { hits: getLabel('terms', 'hits', t) })}
              </Button>
            )}
          </RenderIfHasPermission>
        </>
      )}
      <SideDrawer isOpen={!!missedHitDrawerData} totalWidth={'571px'}>
        <MissedHitsDrawer
          missedHitDrawerData={missedHitDrawerData}
          setMissedHitDrawerData={setMissedHitDrawerData}
          refreshMissedHitsCount={refreshMissedHitsCount}
        />
      </SideDrawer>
    </>
  );

  return (
    <>
      <Calendar
        resources={calendarResources}
        events={calendarEvents}
        queryParams={queryParams}
        setQueryParams={setQueryParams}
        loading={loading}
        isEmpty={hasNoScheduleData}
        skeletonVariant={skeletonVariant}
        toolbarLeftContent={toolbarLeftContent}
        toolbarRightContent={toolbarRightContent}
        showListSwitch={showListSwitch}
        resourceColumnHeader={resourceAreaHeader}
        resourceOrder={hasCustomResourceLabels ? 'sortOrder' : undefined}
        eventContent={eventContent}
        eventDidMount={eventMounted}
        eventClick={handleEventClick}
        dayHeaderContent={customHeaderView}
        slotHeaderContent={customTimeSlotView}
        weekSlotHeaderContent={weekViewCustomDaysHeader}
        resourceCellContent={
          hasCustomResourceLabels || isEmbeddedWeekView ? resourceCellContent : undefined
        }
        resourceCellClass={
          hasCustomResourceLabels || isEmbeddedWeekView ? resourceCellClass : undefined
        }
        resourceLaneClass={hasCustomResourceLabels ? resourceLaneClassNames : undefined}
        resourceCellDidMount={syncBandRowMounts ? resourceCellDidMount : undefined}
        resourceLaneDidMount={
          isOverviewWeekView || isDedicatedWeekView ? resourceLaneDidMount : undefined
        }
        resourceLaneWillUnmount={isOverviewWeekView ? resourceLaneWillUnmount : undefined}
        resourceColumnsWidth={
          isDedicatedWeekView || isOverviewWeekView || isVisitsWeekView ? '220px' : undefined
        }
        isOverviewSectionsEmptyOnly={isOverviewSectionsEmptyOnly}
        belowGridContent={dayViewBelowGridContent}
        // Virtualization: main Schedule week timeline only (env flag).
        // Off for day/month and for site/user embedded schedules.
        virtualization={
          SCHEDULE_CALENDAR_VIRTUALIZATION &&
          !scheduleTabConfig?.isLegacyEmbeddedView &&
          queryParams.selectedView?.type === DAY_GRID.WEEK
        }
      />
      <CalendarOfficerAssignPopover
        ref={officerAssignPopoverRef}
        onAssignmentSuccess={handleOfficerAssignSuccess}
      />
    </>
  );
};

ScheduleCalendarGrid.propTypes = {
  selectionMode: PropTypes.bool,
  showOnlyScheduledSites: PropTypes.bool,
  selectedShiftIds: PropTypes.object,
  onToggleShiftSelect: PropTypes.func,
  harmonizePreview: PropTypes.object,
  events: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  weekViewLocations: PropTypes.array,
  listEvents: PropTypes.object,
  dayViewDuties: PropTypes.object,
  dayViewLocations: PropTypes.array,
  setShowDrawer: PropTypes.func,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  loading: PropTypes.bool,
  missedHitsCount: PropTypes.number,
  refreshMissedHitsCount: PropTypes.func,
  toolbarLeftContent: PropTypes.node,
  showListSwitch: PropTypes.bool,
  activeScheduleTab: PropTypes.string,
  overviewSections: PropTypes.array,
  onAssignmentSuccess: PropTypes.func,
};

export default ScheduleCalendarGrid;

const ToolTipComponent = ({ unassignedCount = '', shiftType }) => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const msg = {
    [SCHEDULE_DUTIES.DEDICATED]: t('obx.schedules.calendar.tooltips.dedicatedAttention', {
      dedicated: getLabel('terms', 'dedicated', t),
    }),
    [SCHEDULE_DUTIES.PATROL]: t('obx.schedules.calendar.tooltips.patrolAttention', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.HIT]: t('obx.schedules.calendar.tooltips.patrolAttention', {
      patrol: getLabel('terms', 'patrol', t),
    }),
    [SCHEDULE_DUTIES.EXTRA]: t('obx.schedules.calendar.tooltips.extraAttention', {
      extra: getLabel('terms', 'extra', t),
    }),
  };

  return (
    <Tooltip
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -14] } }],
          sx: { cursor: 'pointer' },
        },
      }}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertIcon />
          {unassignedCount} {msg[shiftType]}
        </Box>
      }
      placement="bottom"
    >
      <AlertIcon />
    </Tooltip>
  );
};

ToolTipComponent.propTypes = {
  unassignedCount: PropTypes.number,
  shiftType: PropTypes.string,
};

/**
 * Status glyph with its label on hover.
 *
 * Renders nothing without an icon — a status with no glyph previously reached
 * Tooltip with `children: undefined`, which warns and renders nothing useful.
 * The icon is wrapped in a span because MUI Tooltip needs to hold a ref, and the
 * generated SVG components do not forward one.
 */
const StatusTooltip = ({ title, icon }) => {
  if (!icon) return null;

  return (
    <Tooltip
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -14] } }],
          sx: { cursor: 'pointer' },
        },
      }}
      title={title || ''}
      placement="bottom"
    >
      <Box component="span" sx={{ display: 'inline-flex', lineHeight: 0 }}>
        {icon}
      </Box>
    </Tooltip>
  );
};

StatusTooltip.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
};

const canAssignOfficerFromCalendar = (shift = {}) => {
  if (!userHasPermission(ACL_OBX_SCHEDULES_UPDATE)) return false;
  if (isShiftCancelled(shift)) return false;

  const { shiftType, endsAt } = shift;
  if (
    ![
      SCHEDULE_DUTIES.DEDICATED,
      SCHEDULE_DUTIES.EXTRA,
      SCHEDULE_DUTIES.PATROL,
      SCHEDULE_DUTIES.DISPATCH,
    ].includes(shiftType)
  ) {
    return false;
  }

  if (endsAt && getCurrentStandardTimeInIsoWrtTimezone() >= endsAt) return false;
  return true;
};

/** Resolves the card's background/border treatment for a visit's state. */
export const getVisitStateCardClass = (classes, shift) =>
  classes[VISIT_STATE_CARD_CLASSES[resolveVisitState(shift)]] || '';

/* The per-state text label that used to sit as a third line on the card is gone —
   the card's colour, border style and status icon carry the state, and the third
   line is now the runsheet. The state's name is still spoken: it is composed into
   every card's aria-label (see `buildEventAccessibleName`) and stated in full in
   the drawer's callout. */

/**
 * Card for a single visit on the visits grid.
 *
 * Deliberately narrower than the shift card: a visit answers "when is this site
 * due, and has a route claimed it yet". Officer and vehicle belong to the
 * runsheet, not the visit, so they are represented by the route name alone —
 * and its absence is the signal the whole view exists to surface.
 */
const VisitCardContent = memo(({ shift, statusIcon, statusValue, is24Hours }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { siteName, site, startsAt, endsAt, runsheetName, isUnassigned } = shift || {};
  const resolvedSiteName = site?.name || siteName;
  const eventTime = formatShiftScheduleTimeRange(startsAt, endsAt, is24Hours);
  const isRouted = !isUnassigned && Boolean(runsheetName);

  /* Every card reads the same three lines whatever state it is in: when, where,
     and which route is coming. It used not to — the middle line meant the site in
     the unassigned band and the runsheet in a site row, and the last line was a
     state label that appeared or vanished per state, so no two cards had the same
     shape. The colour, the border and the status icon already carry the state;
     spelling it out a fourth time was what pushed the card to three ragged
     heights and left the runsheet — the one thing a planner is scanning for —
     sharing a slot with the site name. */
  const routeLine = isRouted ? runsheetName : t('obx.schedules.calendar.unassigned');

  return (
    <>
      <Box className={classes.eventDetailHeaderWrapper}>
        <Box className={classes.eventDetailHeader}>
          <Typography
            className={`${classes.eventSiteNameColor} ${classes.visitTime}`}
            variant="subtitle4"
          >
            {eventTime}
          </Typography>
        </Box>
        <StatusTooltip title={statusValue} icon={statusIcon} />
      </Box>

      <Box className={classes.reassignedFooterFlex}>
        <Typography className={classes.visitSiteName} variant="subtitle4" title={resolvedSiteName}>
          {resolvedSiteName}
        </Typography>
      </Box>

      <Box className={classes.reassignedFooterFlex}>
        <Box className={classes.reassignedOfficerFlex}>
          {isRouted ? <RunsheetIcon /> : <UnassignedIcon />}
        </Box>
        <Typography
          className={`${classes.visitRouteName} ${isRouted ? '' : classes.visitUnassignedText}`}
          variant="subtitle4"
          title={routeLine}
        >
          {routeLine}
        </Typography>
      </Box>
    </>
  );
});

VisitCardContent.displayName = 'VisitCardContent';
VisitCardContent.propTypes = {
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  is24Hours: PropTypes.bool,
};

const CalendarCardContent = memo(
  ({ shift, statusIcon, statusValue, is24Hours, onOfficerAssignClick, showContextualDetails }) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const isDedicatedCancelledShift =
      isShiftCancelled(shift) && shift?.shiftType === SCHEDULE_DUTIES.DEDICATED;
    const canAssignOfficer = canAssignOfficerFromCalendar(shift);

    const {
      name,
      shiftType,
      site,
      siteName,
      startsAt,
      endsAt,
      officer,
      vehicle,
      reassignedOfficer,
      tour,
      runsheetName,
      overTime,
      hasNotes,
      missedHits,
    } = shift || {};

    const eventTime = formatShiftScheduleTimeRange(startsAt, endsAt, is24Hours);
    const resolvedSiteName = site?.name || siteName;
    const patrolOrDispatchName = name || runsheetName;
    const truncatedPatrolOrDispatchName =
      patrolOrDispatchName?.length > 25
        ? `${capitalizeFirstLetter(patrolOrDispatchName).substring(0, 25)}...`
        : capitalizeFirstLetter(patrolOrDispatchName || '');

    const handleOfficerClick = (event) => {
      if (!canAssignOfficer || !onOfficerAssignClick) return;
      onOfficerAssignClick(event, shift);
    };

    const officerClickProps = canAssignOfficer
      ? {
          'data-officer-assign-trigger': 'true',
          onClick: handleOfficerClick,
          onMouseDown: (event) => event.stopPropagation(),
          role: 'button',
          tabIndex: 0,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOfficerClick(event);
            }
          },
        }
      : {};

    return (
      <>
        {overTime ? (
          <Box className={classes.warnWrapper}>
            <WarningIcon />
            <Typography className={classes.eventSiteNameColor} variant="subtitle4">
              {t('obx.schedules.calendar.scheduleStatus.overTime')}
            </Typography>
          </Box>
        ) : null}

        <Box className={classes.eventDetailHeaderWrapper}>
          <Box className={classes.eventDetailHeader}>
            <Typography className={classes.eventSiteNameColor} variant="subtitle4">
              {eventTime}
            </Typography>

            {[SCHEDULE_DUTIES.HIT].includes(shiftType) && (
              <>
                <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                  <CarIcon />
                </Typography>
                <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                  {name}
                </Typography>
              </>
            )}
            {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType) && (
              <>
                <Typography className={classes.eventSiteNameColor} variant="subtitle4">
                  •
                </Typography>
                <Typography className={classes.dedicatedShiftLabel} variant="subtitle4">
                  {name}
                </Typography>
              </>
            )}
          </Box>
          {[SCHEDULE_DUTIES.PATROL].includes(shiftType) && missedHits > 0 && (
            <Chip
              className={classes.missedHitsChip}
              size="small"
              variant="Filled"
              color="error"
              label={t('obx.schedules.calendar.hitsMissed', { count: missedHits })}
            />
          )}
        </Box>

        {[SCHEDULE_DUTIES.HIT].includes(shiftType) && (
          <>
            <Box className={classes.reassignedFooterFlex}>
              <Box className={classes.reassignedOfficerFlex}>
                <UnAssignHit />
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {tour?.title || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
              <Box className={classes.reassignedFooterFlex}>
                <Box className={classes.reassignedOfficerFlex}>
                  <RunsheetIcon />
                </Box>
                <Typography className={classes.reassignedName} variant="subtitle4">
                  {runsheetName || t('obx.schedules.calendar.unassigned')}
                </Typography>
              </Box>
              <StatusTooltip title={statusValue} icon={statusIcon} />
            </Box>
          </>
        )}

        {[SCHEDULE_DUTIES.PATROL, SCHEDULE_DUTIES.DISPATCH].includes(shiftType) && (
          <>
            {showContextualDetails ? (
              <Box className={classes.reassignedFooterFlex}>
                <Box className={classes.reassignedOfficerFlex}>
                  {shiftType === SCHEDULE_DUTIES.DISPATCH ? <DispatchIndicator /> : <CarIcon />}
                </Box>
                <Typography className={classes.reassignedName} variant="subtitle4">
                  {patrolOrDispatchName?.length > 25 ? (
                    <Tooltip arrow title={patrolOrDispatchName}>
                      <span>{truncatedPatrolOrDispatchName}</span>
                    </Tooltip>
                  ) : (
                    truncatedPatrolOrDispatchName || t('obx.schedules.calendar.unassigned')
                  )}
                </Typography>
              </Box>
            ) : null}
            <Box className={classes.reassignedFooterFlex}>
              <Box
                className={`${classes.reassignedOfficerFlex} ${
                  canAssignOfficer ? classes.officerAssignTrigger : ''
                }`}
                {...officerClickProps}
              >
                <Avatar
                  className={classes.eventAvatar}
                  src={officer?.imageUrl || reassignedOfficer?.imageUrl || AvatarSchedule}
                />
              </Box>
              <Typography className={classes.reassignedName} variant="subtitle4">
                {officer?.name || reassignedOfficer?.name || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
              <Box className={classes.reassignedFooterFlex}>
                <Box className={classes.reassignedOfficerFlex}>
                  {vehicle?.images?.[0]?.url ? (
                    <Avatar className={classes.eventAvatar} src={vehicle?.images?.[0]?.url} />
                  ) : (
                    <Box className={classes.carIcon}>
                      <WhiteCarIcon />
                    </Box>
                  )}
                </Box>
                <Typography className={classes.reassignedName} variant="subtitle4">
                  {vehicle?.name || t('obx.schedules.calendar.unassigned')}
                </Typography>
              </Box>
              <Box className={classes.reassignedFooter}>
                {shift?.isSplit && (
                  <Tooltip title={t('obx.schedules.splitShift.splitShift')}>
                    <Box className={classes.splitShiftIconWrapperInView}>
                      <SplittedCalenderIcon />
                    </Box>
                  </Tooltip>
                )}
                {!!hasNotes && (
                  <StatusTooltip
                    title={t('obx.schedules.calendar.scheduleStatus.noteStatusShow')}
                    icon={<NotesIcon />}
                  />
                )}
                <StatusTooltip title={statusValue} icon={statusIcon} />
              </Box>
            </Box>
          </>
        )}

        {[SCHEDULE_DUTIES.DEDICATED, SCHEDULE_DUTIES.EXTRA].includes(shiftType) && (
          <>
            {showContextualDetails && resolvedSiteName ? (
              <Box className={classes.reassignedFooterFlex}>
                <Typography className={classes.eventSiteName} variant="subtitle4">
                  {resolvedSiteName}
                </Typography>
              </Box>
            ) : null}
            <Box className={classes.dedicatedCardBody}>
              <Box
                className={
                  !reassignedOfficer
                    ? classes.patrolOfficerInfo
                    : classes.dedicatedOfficerInfoWithReassign
                }
              >
                <Box
                  className={`${classes.reassignedOfficerFlex} ${
                    canAssignOfficer ? classes.officerAssignTrigger : ''
                  }`}
                  {...officerClickProps}
                >
                  <Avatar
                    className={classes.eventAvatar}
                    src={officer?.imageUrl || AvatarSchedule}
                  />
                  {reassignedOfficer && (
                    <Avatar
                      className={classes.eventAvatarReassignedOfficer}
                      src={reassignedOfficer?.imageUrl || AvatarSchedule}
                    />
                  )}
                </Box>
                <Typography className={classes.dedicatedOfficerName} variant="subtitle4">
                  {officer?.name ||
                    reassignedOfficer?.name ||
                    t('obx.schedules.calendar.unassigned')}
                </Typography>
              </Box>
              <Box className={classes.patrolCardStatusIcons}>
                {isDedicatedCancelledShift ? (
                  <CancelIcon />
                ) : (
                  <>
                    {[SCHEDULE_DUTIES.DEDICATED].includes(shiftType) && shift.isSplit && (
                      <Tooltip title={t('obx.schedules.splitShift.splitShift')}>
                        <Box className={classes.splitShiftIconWrapperInView}>
                          <SplittedCalenderIcon />
                        </Box>
                      </Tooltip>
                    )}
                    {!!hasNotes && (
                      <StatusTooltip
                        title={t('obx.schedules.calendar.scheduleStatus.noteStatusShow')}
                        icon={<NotesIcon />}
                      />
                    )}
                    <StatusTooltip title={statusValue} icon={statusIcon} />
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </>
    );
  },
);

CalendarCardContent.displayName = 'CalendarCardContent';
CalendarCardContent.propTypes = {
  shift: PropTypes.object,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  is24Hours: PropTypes.bool,
  onOfficerAssignClick: PropTypes.func,
  showContextualDetails: PropTypes.bool,
};
