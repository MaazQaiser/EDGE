import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Avatar, Box, Button, Chip, Tooltip, Typography } from '@mui/material';
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
import DutyIndicator from 'src/app/components/obxComponents/dutyIndicator';
import CalendarOfficerAssignPopover from 'src/app/obx/pages/schedules/calendar/CalendarOfficerAssignPopover';
import LegacyCalendarCardContent from 'src/app/obx/pages/schedules/calendar/LegacyCalendarCardContent';
import VisitCardContentV2 from 'src/app/obx/pages/schedules/calendar/VisitCardContentV2';
import {
  calendarIndicatorIcons,
  calendarShiftStatusValues,
} from 'src/app/obx/pages/schedules/components/scheduleStatusIcons';
import {
  getScheduleTabConfig,
  MAIN_VIEW_GROUPING,
  resolveResourceAreaHeader,
  resolveScheduleSectionTitle,
} from 'src/app/obx/pages/schedules/config/scheduleTabConfigs';
import {
  DEFAULT_VISIT_VIEW_VARIANT,
  VISIT_VIEW_VARIANT,
} from 'src/app/obx/pages/schedules/config/visitViewVariant';
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
  VISIT_STATE_STATUS,
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
import { ReactComponent as CalendarIcon } from 'src/assets/svg/calendar.svg';
import { ReactComponent as CarIcon } from 'src/assets/svg/carImage.svg';
import { ReactComponent as AlertIcon } from 'src/assets/svg/DedicatedDuty/alertCircle.svg';
import { ReactComponent as DispatchIndicator } from 'src/assets/svg/dispatchIndicator.svg';
import { ReactComponent as NotesIcon } from 'src/assets/svg/notesStatus.svg';
import { ReactComponent as AccessTimeIcon } from 'src/assets/svg/officerOrangeIcon.svg';
import { ReactComponent as RunsheetIcon } from 'src/assets/svg/runsheetHit.svg';
import { ReactComponent as UnassignedOfficerIcon } from 'src/assets/svg/unassigned-officer.svg';
import { ReactComponent as UnassignedVehicleIcon } from 'src/assets/svg/unassigned-vehicle.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
import { ReactComponent as WhiteCarIcon } from 'src/assets/svg/WhiteCarIcon.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';
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

import { APPLY_PHASE } from './useApplyMotion';

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

/**
 * The customer a visit belongs to, if the payload happens to say.
 *
 * On the week grid the customer is never on the card because it is the *row* — a
 * company row names it once and its cards inherit it by position. The month grid
 * has no rows: it is thirty-five day cells of chips, and the grouping the planner
 * chose is the one fact the view silently drops. So the chip **names it** — leading
 * its label, ahead of the site — and the hover card states it too.
 *
 * Read defensively across the shapes the grid has used for this. The one that
 * actually arrives is `companyName`, stamped on every visit at build time
 * (`schedule.mock.js`, `companyNameForSite`) precisely so this does not depend on
 * the fetch path: the month fetch (`getVisitsByMonth`) hands FullCalendar the flat
 * `shifts` array and never walks the `sections[].rows[]` a joined-on-the-client
 * customer would have to come from. The other shapes are kept because a real
 * backend may nest it instead, and an empty string is a rendering decision the
 * callers already make (no company ⇒ no leading dot).
 */
const resolveVisitCompanyName = (shift = {}) =>
  `${
    shift.company?.name ||
    shift.companyName ||
    shift.customer?.name ||
    shift.customerName ||
    shift.site?.company ||
    shift.site?.companyName ||
    ''
  }`.trim();

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

  // Visit state carries facts no status string does — blocked, inserted mid-route,
  // not on a runsheet at all — and the card shows it, so the name must too.
  const visitState = shift.shiftType === SCHEDULE_DUTIES.HIT ? resolveVisitState(shift) : null;

  /* A visit's spoken status comes from its state, for the same reason the badge
     does: the record can still say `notStarted` for a visit the grid has already
     resolved to missed (D11), and hearing both is worse than hearing neither. */
  const statusValue = visitState
    ? calendarShiftStatusValues(t)?.[VISIT_STATE_STATUS[visitState]]
    : getValuesWrtStatuses({ shift, t }).statusValue;

  const visitStateLabel =
    visitState && visitState !== VISIT_STATE.SCHEDULED
      ? t(`obx.schedules.calendar.visits.state.${VISIT_STATE_LABEL_KEYS[visitState]}`, {
          runsheet: getLabel('terms', 'runsheet', t),
          tour: getLabel('terms', 'tour', t),
          hit: getLabel('terms', 'hit', t),
        })
      : null;

  /* The visits card shows the site's preferred service day where it used to show the
     visit's window-derived title, so the spoken name follows it — and it speaks the
     mismatch, which on screen is carried only by colour. */
  const isOffPreferredDay =
    shift.startsAt &&
    dayjsWithTimezone(shift.startsAt).format('ddd') !== shift.preferredDay &&
    // Same read-only guard the card uses, or the two would disagree about a
    // completed visit — see the note in `VisitCardContent`.
    !getVisitActionRules(shift).isReadOnly;

  const preferredDayLabel =
    shift.preferredDay && shift.startsAt
      ? t(
          isOffPreferredDay
            ? 'obx.schedules.calendar.visits.prefersDayOff'
            : 'obx.schedules.calendar.visits.prefersDay',
          { day: shift.preferredDay },
        )
      : null;

  const parts = [
    formatShiftScheduleTimeRange(shift.startsAt, shift.endsAt, is24Hours),
    shift.site?.name || shift.siteName,
    // A visit names its preferred day and its route; every other card names itself.
    ...(preferredDayLabel
      ? [preferredDayLabel, shift.runsheetName]
      : [shift.name || shift.runsheetName]),
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

/**
 * Tear down the nested root that covers an empty overview lane.
 *
 * The teardown is deferred by a microtask and the bookkeeping is not, and the split
 * is the whole point. FullCalendar calls `resourceLaneWillUnmount` from inside
 * React's commit phase, so unmounting there tore down a root while React was still
 * rendering the tree that owns it — which React refuses ("Attempted to
 * synchronously unmount a root while React was already rendering") and which left
 * the warning on screen for anyone with the console open. A microtask runs after
 * the commit that scheduled it, so by then there is no render in progress.
 *
 * The map entry has to go *now*, though: `mountOverviewEmptyState` calls this and
 * then immediately registers a fresh root for the same lane, and a delete that
 * waited for the microtask would erase the new entry instead of the old one. The
 * root is captured in the closure, so the deferred call still unmounts the right
 * one — and it is safe on a container the outer commit has already detached, since
 * `unmount` only clears the container it was created on.
 */
const unmountOverviewEmptyState = (laneEl) => {
  const root = overviewEmptyStateRoots.get(laneEl);
  if (!root) return;
  overviewEmptyStateRoots.delete(laneEl);
  queueMicrotask(() => root.unmount());
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

/**
 * A visit-card resource lane shares one vertical space across the whole
 * week: FullCalendar packs same-day cards from the lane's own top edge down,
 * so whichever day needs the most stacked cards sets the row's height, and
 * every lighter day in that same row is left pinned to that top edge with
 * the rest of the borrowed height showing through as empty space below its
 * card. There is no FullCalendar option for "center each day's stack" — the
 * classic timeline theme always top-aligns — so this reads the geometry
 * FullCalendar already computed and nudges each day's own stack down by
 * half of what it isn't using.
 *
 * Cards for the same day share one `insetInlineStart` (FullCalendar's x
 * position for that day), so grouping by that value groups by day without
 * needing anything from the resource/event models. The offset lands on the
 * absolutely-positioned harness FullCalendar wraps each card in — never on
 * the card itself, which selection and the apply-motion "landing" animation
 * already transform — so the two never fight over the same style, and this
 * is trivially undone by clearing the transform.
 */
const centerVisitDayLanes = (laneEl) => {
  if (!laneEl) return;

  const cardEls = Array.from(laneEl.querySelectorAll('[data-visit-id]'));
  if (!cardEls.length) return;

  const harnessFor = (cardEl) => {
    let node = cardEl.parentElement;
    while (node && node !== laneEl) {
      if (getComputedStyle(node).position === 'absolute') return node;
      node = node.parentElement;
    }
    return null;
  };

  const dayGroups = new Map();
  cardEls.forEach((cardEl) => {
    const harness = harnessFor(cardEl);
    if (!harness) return;
    const dayKey = harness.style.insetInlineStart || harness.style.left || '0';
    if (!dayGroups.has(dayKey)) dayGroups.set(dayKey, []);
    dayGroups.get(dayKey).push(harness);
  });
  if (!dayGroups.size) return;

  const spanOf = (harnesses) => {
    let top = Infinity;
    let bottom = 0;
    harnesses.forEach((harness) => {
      const harnessTop = parseFloat(harness.style.top) || 0;
      const harnessHeight = harness.getBoundingClientRect().height;
      top = Math.min(top, harnessTop);
      bottom = Math.max(bottom, harnessTop + harnessHeight);
    });
    return bottom - top;
  };

  const rowContentHeight = Math.max(...Array.from(dayGroups.values(), spanOf));
  if (!(rowContentHeight > 0)) return;

  /* This only equalizes days *against each other* — it says nothing about
     whether the row itself has more height than any day's content needs.
     `companyRowsUniform` gives the row a height floor independent of what's
     scheduled that week, and FullCalendar fills the remainder with a sibling
     layer of its own beside this lane, sized to exactly the leftover space —
     which means the row's flexbox (`visitResourceLane`, `justify-content:
     center`) has no free space left to center *this* lane within, no matter
     how that CSS is written: 0 (a background layer) + rowContentHeight (this
     lane) + FullCalendar's filler already sums to the full row height. The
     only way left to center the lane in the row is to measure the gap
     directly and add it to every card's own offset. */
  const rowHeight = laneEl.getBoundingClientRect().height;
  const baseOffset = Math.max(0, (rowHeight - rowContentHeight) / 2);

  dayGroups.forEach((harnesses) => {
    const offset = baseOffset + (rowContentHeight - spanOf(harnesses)) / 2;
    harnesses.forEach((harness) => {
      harness.style.transform = offset > 0.5 ? `translateY(${offset}px)` : '';
    });
  });
};

/** One lane can be re-measured many times (new events, a resize) — keep a single
 *  observer per lane rather than piling one on with every mount pass. */
const visitDayLaneObservers = new WeakMap();

const watchVisitDayLanes = (laneEl) => {
  if (!laneEl || typeof ResizeObserver === 'undefined' || visitDayLaneObservers.has(laneEl)) {
    return;
  }
  const observer = new ResizeObserver(() => centerVisitDayLanes(laneEl));
  observer.observe(laneEl);
  visitDayLaneObservers.set(laneEl, observer);
  centerVisitDayLanes(laneEl);
};

const unwatchVisitDayLanes = (laneEl) => {
  if (!laneEl) return;
  visitDayLaneObservers.get(laneEl)?.disconnect();
  visitDayLaneObservers.delete(laneEl);
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
  toolbarLeadingContent = null,
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
  applyMotion,
  visitGrouping = MAIN_VIEW_GROUPING.ROUTES,
  companyQuery = '',
  onSelectCompany,
  toolbarRightContent = null,
  toolbarTrailingContent = null,
  visitCardVariant = DEFAULT_VISIT_VIEW_VARIANT,
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
  const officerAssignPopoverRef = useRef(null);

  const scheduleTabConfig = getScheduleTabConfig(activeScheduleTab);
  /* Which of the two candidate visit cards to draw. Read once here so the week and
     day paths cannot drift apart — they have picked their card independently before
     (§ the legacy/visit/shift ladder in both), and a variant that applied to one
     view and not the other would make the comparison meaningless. */
  const isVisitCardV2 = visitCardVariant === VISIT_VIEW_VARIANT.V2;
  const {
    calendarResources,
    calendarEvents,
    resourceAreaHeaderKey,
    isOverviewWeekView,
    isDedicatedWeekView,
    isOfficerWeekView,
    isVisitsWeekView,
    isCompanyGrouping,
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
    visitGrouping,
    companyQuery,
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

  /**
   * A clicked visit opens **its own drawer** — the visit panel, never the route's.
   *
   * **This reverses an earlier rule**, and the reversal was asked for directly.
   * On the company grouping a visit used to be rewritten into its runsheet on the
   * way to the drawer (`shiftType: HIT → PATROL`, `id → runsheetId`), on the
   * reasoning that a planner reading the week by customer wants the round a stop
   * sits on. In use that was wrong twice over: clicking a *named visit* and
   * getting a *route* is not the object you asked for, and the visit's own facts —
   * its service time, its checkpoints, its report, its instructions — were then
   * two hops away, down the route's stop list. A click should open the thing under
   * the pointer.
   *
   * The route is not lost by this: the visit drawer names its runsheet in the
   * header and its assignment callout is where the route is acted on, so the round
   * is one hop out rather than the landing page.
   *
   * Kept as a named funnel rather than inlined at its three call sites (week
   * click, month click, list click) so that "what does clicking a visit open"
   * stays one answer in one place — it has been two before.
   */
  const openVisitTarget = useCallback(
    (data = {}) => {
      showSideDrawerHandler(data);
    },
    [showSideDrawerHandler],
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
        /* On the company grouping a month cell holds individual visits, not a
           day's count, so a click has a subject and opens its route — the same
           thing the same card does in the week view. Drilling into the day view
           instead would answer a question nobody asked by clicking a named visit. */
        if (isCompanyGrouping) {
          const data = info.event.extendedProps || {};
          if (data.shiftType === SCHEDULE_DUTIES.HIT) {
            openVisitTarget({ ...data, id: info.event?.id });
            return;
          }
        }

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

        openVisitTarget({ ...data, id: info.event?.id });
      }
    },
    [setQueryParams, openVisitTarget, selectionMode, onToggleShiftSelect, isCompanyGrouping],
  );

  const onClickListViewEvent = useCallback(
    (data) => {
      openVisitTarget({ ...data });
    },
    [openVisitTarget],
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

  /*
    Apply, watched rather than described. Two beats, driven by `useApplyMotion`:
    every visit card settles and shimmers while the schedule is recomputed, then the
    moved ones land on their own route's day, staggered in that route's order so a
    column fills top to bottom.

    Painted onto mounted nodes for the same reason the two effects above are:
    FullCalendar caches rendered event content, so a prop threaded through
    `eventContent` would not reach cards it decided not to re-render. The landing
    delay goes on as an inline style rather than a class per position — twelve
    stagger classes to express one multiplication is not a stylesheet.

    `calendarEvents` is a dependency because the relocation *changes* it: the pass
    that paints `landing` has to run against the re-rendered nodes, not the ones
    that were on screen when the phase flipped.
  */
  const applyPhase = applyMotion?.phase;
  const applyMoves = applyMotion?.moves;

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-visit-id]');

    if (!applyPhase || applyPhase === APPLY_PHASE.IDLE) {
      nodes.forEach((node) => {
        delete node.dataset.applying;
        node.style.removeProperty('animation-delay');
      });
      return;
    }

    nodes.forEach((node) => {
      const move = applyMoves?.get(String(node.dataset.visitId));

      if (applyPhase === APPLY_PHASE.SETTLING) {
        /* Every card, not just the movers. The schedule is being recomputed and
           marking only the movers would assert the outcome before showing it. */
        node.dataset.applying = 'settling';
        node.style.removeProperty('animation-delay');
        return;
      }

      if (move) {
        node.dataset.applying = 'landing';
        node.style.setProperty('animation-delay', `${Math.min(move.order, 11) * 55}ms`);
      } else {
        /* Stayed where it was. It comes back out of the shimmer without a landing
           animation, because nothing happened to it and animating it would say
           something did. */
        delete node.dataset.applying;
        node.style.removeProperty('animation-delay');
      }
    });
  }, [applyPhase, applyMoves, calendarEvents]);

  /*
    Today, on the month grid — which until now had no today at all, while the week
    beside it paints the current column's header solid green.

    Stamped rather than read off FullCalendar's own today cell, for the same reason
    the week header's marker exists: FC decides `isToday` against the *browser's*
    clock, so a planner working a franchise several timezones away gets the mark on
    the wrong square. `dayjsWithTimezone()` is the franchise's, and the stylesheet
    clears FC's own wherever the two disagree (see `monthGridCompact`).

    Painted onto mounted nodes like the two effects above, and for the same reason:
    the month cells are FullCalendar's own, and the shared calendar shell exposes no
    `dayCellContent` seam to render one through.

    Cleared rather than left behind when the view is not a month, so switching to a
    week cannot leave a stale mark on a timeline lane that also carries `data-date`.
  */
  const selectedView = queryParams.selectedView;

  useEffect(() => {
    const viewType = selectedView?.type;
    /* The week wants it too now. Its header slot has always had a marker of its own
       (`data-schedule-header-today`), but the grey wash runs down the *whole* column
       and the body's full-height column element lives in a different subtree from
       that header — no selector can reach across, so the mark goes on both. */
    const marksToday = viewType === DAY_GRID.MONTH || viewType === DAY_GRID.WEEK;
    const todayKey = marksToday ? dayjsWithTimezone().format('YYYY-MM-DD') : null;

    /* Every dated node, not just `[role="gridcell"]`: the week's column element
       carries `data-date` and no role. Scoped to the calendar root so a stray
       `data-date` elsewhere on the page cannot pick up a schedule marker. */
    const root = document.querySelector('.fc') || document;
    root.querySelectorAll('[data-date]').forEach((node) => {
      if (todayKey && node.dataset.date === todayKey) node.dataset.scheduleToday = 'true';
      else delete node.dataset.scheduleToday;
    });
  }, [selectedView, calendarEvents]);

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
        /* Grouped by company, a month cell holds the visits themselves rather
           than a tally of them.

           The week card's three lines will not fit a month cell one seventh of the
           grid wide, so the chip drops the line the month can least afford and the
           planner can most easily recover: the route, which is one click away in
           the drawer this chip opens. What is left is the pair that identifies the
           visit — when, and where — carrying the same status wash *and the same
           status mark* the week card takes, so a visit looks like itself in both
           views. FullCalendar's own `dayMaxEvents` (3, set on the month view's
           config) supplies the "+N more".

           **Fill, not a glyph.** The state used to be carried by a leading status
           icon plus a wash — belt and braces, because the wash alone once made
           every state read as a colour with no name (a visit nobody had routed
           came out as the same plain grey a low-priority state would). The icon
           is gone now and the fill is the only signal; nothing here draws a
           second, redundant mark for it. The tooltip still names the status in
           words for anyone who needs the exact one, the same way it still carries
           the window and the route.

           **Company · site, not the window and not the filter count.** The chip
           used to show the visit's time, then the site and how many filters that
           stop needs. It now names the customer and then the building.

           This is the company grouping, and the month is its only view with no
           company row — so the customer was the one fact on this grid that
           appeared nowhere, and it is also what tells two chips in one cell apart
           when they belong to different customers. The filter count told them
           apart not at all, and both it and the time are one hover away in the
           tooltip. Company is the subject and takes the dark ink the week card's
           own subject line does; the site qualifies it in the quieter grey
           `visitRouteName` uses for the same role there. Both truncate. */
        if (isCompanyGrouping && shift.shiftType === SCHEDULE_DUTIES.HIT) {
          const chipSite = shift.site?.name || shift.siteName || '';
          const chipCompany = resolveVisitCompanyName(shift);
          const { statusIcon, statusValue } = getVisitStatusValues({ shift, t });

          return (
            <VisitMonthChipTooltip
              classes={classes}
              company={chipCompany}
              site={chipSite}
              route={shift.runsheetName || t('obx.schedules.calendar.unassigned')}
              statusIcon={statusIcon}
              statusValue={statusValue}
              officer={shift.officer}
              reassignedOfficer={shift.reassignedOfficer}
            >
              <Box
                className={`${classes.visitMonthChip} ${getVisitStateCardClass(classes, shift)}`}
              >
                {chipCompany ? (
                  <Typography component="span" className={classes.visitMonthChipCompany}>
                    {chipCompany}
                  </Typography>
                ) : null}
                {/* Only when there is something on both sides of it — a visit
                    whose company did not resolve must not draw a leading dot. */}
                {chipCompany && chipSite ? (
                  <Typography
                    component="span"
                    className={classes.visitMonthChipSeparator}
                    aria-hidden="true"
                  >
                    ·
                  </Typography>
                ) : null}
                {chipSite ? (
                  <Typography component="span" className={classes.visitMonthChipSite}>
                    {chipSite}
                  </Typography>
                ) : null}
              </Box>
            </VisitMonthChipTooltip>
          );
        }

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

        /* A visit is a smaller unit than a shift — window, tour, and whether a
           route has claimed it — so it draws the *hit* card rather than the
           officer-and-vehicle one.

           Colour is split the way it is split on every other card here: the duty
           class owns the left accent (type), and the visit's state supplies only
           the status wash. It used to own both, because a state-coloured card and
           a brand-coloured `dutyBlueBg` were fighting over the same fill (§7.25);
           the fix was one owner per property, not one owner per card. */
        if (isVisitsWeekView) {
          const visitStatus = getVisitStatusValues({ shift, t });
          /* The two candidate designs. Only the *contents* component differs — the
             shell, its wash and its accent are the same object either way, which is
             what makes this a fair comparison rather than two different cards. */
          const VisitCard = isVisitCardV2 ? VisitCardContentV2 : VisitCardContent;
          return (
            // Same hover card the month chip uses — one visit should read the
            // same way under the pointer regardless of which grid it's on.
            <VisitMonthChipTooltip
              classes={classes}
              company={resolveVisitCompanyName(shift)}
              site={shift.site?.name || shift.siteName || ''}
              route={shift.runsheetName || t('obx.schedules.calendar.unassigned')}
              statusIcon={visitStatus.statusIcon}
              statusValue={visitStatus.statusValue}
              officer={shift.officer}
              reassignedOfficer={shift.reassignedOfficer}
            >
              <Box
                /* Selection state is stamped on FullCalendar's event harness, but the
                   harness is 8px larger than the card on every side. Painting the
                   checkbox and the selected outline against it put the tick outside
                   the card — visually in the row above — and drew the outline around
                   empty margin. This attribute gives those rules a stable handle on
                   the card itself; makeStyles class names are hashed, so a global
                   rule cannot name one. */
                data-visit-card="true"
                /* Two shells, because the variants are two card *designs* and the
                   shell is half of each. V1 keeps `visitCardShell`'s roomier 6px/12px
                   and the `visitFill*` washes; V2 drops it for `eventContent`'s own
                   tighter 4px/6px and takes the reference's duty-palette wash, which
                   is what "match the site scheduler exactly" means — see
                   `getVisitLegacyBgClass`. The duty accent and the attribute the
                   selection rules hang off are common to both. */
                className={
                  isVisitCardV2
                    ? `${classes.eventContent} ${classes.eventContentWeek} ${
                        classes[dutyColor]
                      } ${getVisitLegacyBgClass(classes, shift)} ${cancelledDedicatedClass}`
                    : `${classes.eventContent} ${classes.eventContentWeek} ${
                        classes.visitCardShell
                      } ${classes[dutyColor]} ${getVisitStateCardClass(classes, shift)}`
                }
              >
                <VisitCard
                  shift={shift}
                  statusIcon={visitStatus.statusIcon}
                  statusValue={visitStatus.statusValue}
                  is24Hours={is24Hours}
                  alwaysNameSite={isCompanyGrouping}
                />
              </Box>
            </VisitMonthChipTooltip>
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
      isCompanyGrouping,
      getLabel,
      scheduleTabConfig?.isLegacyEmbeddedView,
      isVisitCardV2,
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
        /* The month's column headers name the weekday and nothing else — the cells
           below carry the numbers. FullCalendar reuses this same generator for the
           "+N more" popover's own header, where that is the wrong answer: the
           popover floats over the cell it came from, so a bare "Mon" is the one
           thing on screen that cannot say which Monday. `inPopover` is FC's own
           flag for this, and it is the only place the month restates a date. */
        return (
          <Box className={classes.calendarHeaderMonthCell}>
            <Typography variant="subtitle2" className={classes.calendarHeaderMonthCellDate}>
              {info.inPopover ? `${dayName}, ${dayMonth} ${date}` : dayName}
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
                      ? isVisitCardV2
                        ? VisitCardContentV2
                        : VisitCardContent
                      : CalendarCardContent;
                  const visitStatus = isVisitCard ? getVisitStatusValues({ shift, t }) : null;

                  const dayCard = (
                    <Box
                      key={shift?.id}
                      className={
                        // Same three shells as the week grid above, for the same
                        // reasons: V2 takes the reference's duty-palette wash and its
                        // tighter padding, V1 keeps `visitCardShell` and the
                        // `visitFill*` washes, and a non-visit card is unchanged.
                        isVisitCard && isVisitCardV2
                          ? `${classes.dayEventContent} ${classes.eventContentWeek} ${classes[DUTY_COLOR_CLASS[shift?.shiftType]]} ${getVisitLegacyBgClass(classes, shift)} ${cancelledDedicatedClass}`
                          : isVisitCard
                            ? `${classes.dayEventContent} ${classes.eventContentWeek} ${classes.visitCardShell} ${classes[DUTY_COLOR_CLASS[shift?.shiftType]]} ${getVisitStateCardClass(classes, shift)}`
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
                        statusIcon={visitStatus?.statusIcon ?? statusIcon}
                        statusValue={visitStatus?.statusValue ?? statusValue}
                        is24Hours={is24Hours}
                        {...(isVisitCard && isCompanyGrouping ? { alwaysNameSite: true } : {})}
                        {...(useLegacyCard || isVisitCard
                          ? {}
                          : {
                              onOfficerAssignClick: handleOfficerAssignClick,
                              showContextualDetails: true,
                            })}
                      />
                    </Box>
                  );

                  // Same hover card the month chip and the week card use — one
                  // visit, one tooltip, wherever it's drawn.
                  return isVisitCard ? (
                    <VisitMonthChipTooltip
                      key={shift?.id}
                      classes={classes}
                      company={resolveVisitCompanyName(shift)}
                      site={shift.site?.name || shift.siteName || ''}
                      route={shift.runsheetName || t('obx.schedules.calendar.unassigned')}
                      statusIcon={visitStatus?.statusIcon}
                      statusValue={visitStatus?.statusValue}
                      officer={shift.officer}
                      reassignedOfficer={shift.reassignedOfficer}
                    >
                      {dayCard}
                    </VisitMonthChipTooltip>
                  ) : (
                    dayCard
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
    isVisitCardV2,
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
           week grid cannot: when is this site next due — and it is the whole of
           why the rows can be alphabetical: the date a row would have encoded by
           its position is written on the row instead. */
        if (isVisitsWeekView) {
          const meta = resource.extendedProps?.meta || {};
          const visitCount = Number(meta.visitCount) || 0;
          const isQuiet = visitCount === 0;
          const nextVisitAt = meta.nextVisitAt;

          /**
           * A company row is **the company's name, and nothing else**.
           *
           * It carried a second line — visits this week and a location count, or a
           * next-due date when quiet — and every one of those facts is already on
           * the screen: the cards in the row are the visits, and the date is the
           * column they sit in. On forty-six rows that line was forty-six
           * restatements, and it made the column the busiest thing on a grid whose
           * subject is the cards.
           *
           * The name is a button, because the question a planner has about a
           * customer they can see is "what does their year look like" — which is the
           * Companies tab, filtered to them.
           */
          if (meta.isCompanyRow) {
            const customerId = meta.customerId;

            return (
              <Box
                className={`${classes.resourceLabelContent} ${
                  isQuiet ? classes.visitsQuietRowLabel : ''
                }`}
              >
                <Typography
                  variant="subtitle2"
                  component={customerId && onSelectCompany ? 'button' : 'div'}
                  className={`${classes.resourceLabelText} ${
                    customerId && onSelectCompany ? classes.companyRowLink : ''
                  }`}
                  title={
                    customerId && onSelectCompany
                      ? t('obx.schedules.calendar.companies.openCompany', {
                          company: resource.title,
                        })
                      : resource.title
                  }
                  onClick={
                    customerId && onSelectCompany ? () => onSelectCompany(customerId) : undefined
                  }
                >
                  {resource.title}
                </Typography>
              </Box>
            );
          }

          const quietSubtitle = nextVisitAt
            ? t('obx.schedules.calendar.visits.rowNextVisit', {
                date: dayjsWithTimezone(nextVisitAt).format('MMM D'),
              })
            : t('obx.schedules.calendar.visits.rowNotScheduled');

          return (
            <Box
              className={`${classes.resourceLabelContent} ${
                isQuiet ? classes.visitsQuietRowLabel : ''
              }`}
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
      onSelectCompany,
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
      /* Visit cards (standalone Visits tab + Overview's company grouping) are
         short relative to the row they share with busier days — center them
         instead of leaving them pinned to the row's top edge. Dedicated/
         Officer/Patrol rows and Overview's own section lanes are handled by
         the branches above and fall through to the default below unchanged. */
      if (isVisitsWeekView) {
        return classes.visitResourceLane;
      }
      return '';
    },
    [
      classes.dedicatedSiteBandResourceLane,
      classes.overviewAccordionResourceLane,
      classes.overviewSectionEmptyResourceLane,
      classes.visitResourceLane,
      isVisitsWeekView,
    ],
  );

  const resourceLaneDidMount = useCallback(
    (info) => {
      const isOverviewSection = info.resource?.extendedProps?.isOverviewSection;
      const isOverviewEmptyState = info.resource?.extendedProps?.isOverviewEmptyState;
      const isDedicatedSiteBand = info.resource?.extendedProps?.isDedicatedSiteBand;
      if (!isOverviewSection && !isOverviewEmptyState && !isDedicatedSiteBand) {
        // Not one of the special accordion/band rows above — the row-height sync,
        // divider paint, and lane-cover logic below are all built for those, not
        // for plain visit-card rows, so this is its own path rather than falling
        // through into it.
        if (isVisitsWeekView) watchVisitDayLanes(info.el);
        return;
      }

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
    [classes, isVisitsWeekView, t, theme],
  );

  const resourceLaneWillUnmount = useCallback(
    (info) => {
      if (isVisitsWeekView) unwatchVisitDayLanes(info.el);
      if (!info.resource?.extendedProps?.isOverviewEmptyState) return;
      unmountOverviewEmptyState(info.el);
    },
    [isVisitsWeekView],
  );

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

  /* The missed-visits pill used to live here, in the calendar's own toolbar row —
     one row below the unrouted-demand pill it belongs with. Both count work that
     needs a person's attention, so they now sit together in the page header; the
     page already owned `missedHitsCount` and was passing it down purely so this
     component could draw a button. Moved to `calendar/index.jsx` along with its
     drawer, since the button and the drawer share one piece of state.

     The slot itself is live again, carrying the Routes/Visits switch — a *view*
     control, so it belongs with Day/Week/Month rather than among the filters. */

  /** The one month grid whose cells hold visits rather than a count of them. */
  const isVisitsMonthView = isCompanyGrouping && queryParams.selectedView?.type === DAY_GRID.MONTH;

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
        toolbarLeadingContent={toolbarLeadingContent}
        toolbarLeftContent={toolbarLeftContent}
        toolbarRightContent={toolbarRightContent}
        toolbarTrailingContent={toolbarTrailingContent}
        /* Two grids, two problems, one slot.

           Week: company rows share one height — see `companyRowsUniform`. Day and
           month are not resource timelines and have no rows to even up.

           Month: only this grouping stacks chips in its cells, so only it gets the
           taller cell floor. `monthGridCompact` is applied to *every* month view by
           the shell, and its tight floor is right for the ones whose cell holds a
           single line — see `visitsMonthChipGrid` for why the two cannot share a
           number. */
        calendarClassName={
          isCompanyGrouping && queryParams.selectedView?.type === DAY_GRID.WEEK
            ? classes.companyRowsUniform
            : isVisitsMonthView
              ? classes.visitsMonthChipGrid
              : ''
        }
        /* A stack of chips needs the height an aggregate count does not — the
           other half of `visitsMonthChipGrid`, which can divide the port only
           once the shell has asked FullCalendar to fill it. */
        monthFillsScrollport={isVisitsMonthView}
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
          isOverviewWeekView || isDedicatedWeekView || isVisitsWeekView
            ? resourceLaneDidMount
            : undefined
        }
        resourceLaneWillUnmount={
          isOverviewWeekView || isVisitsWeekView ? resourceLaneWillUnmount : undefined
        }
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
  /** `routes` | `companies` — what the main view's left column groups by. */
  visitGrouping: PropTypes.string,
  /** Narrows company rows by name, per keystroke. */
  companyQuery: PropTypes.string,
  /** Drill-through: hands a customerId to the Companies tab. */
  onSelectCompany: PropTypes.func,
  /** Sits with the view toggle on the right of the toolbar. */
  toolbarRightContent: PropTypes.node,
  /** Page actions for the toolbar's right edge, after the view toggles. */
  toolbarTrailingContent: PropTypes.node,
  /** Which candidate visit card to draw — see `config/visitViewVariant`. */
  visitCardVariant: PropTypes.oneOf(Object.values(VISIT_VIEW_VARIANT)),
  /** `useApplyMotion`'s state — the two-beat sequence after Apply. */
  applyMotion: PropTypes.object,
  events: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  weekViewLocations: PropTypes.array,
  listEvents: PropTypes.object,
  dayViewDuties: PropTypes.object,
  dayViewLocations: PropTypes.array,
  setShowDrawer: PropTypes.func,
  queryParams: PropTypes.object,
  setQueryParams: PropTypes.func,
  loading: PropTypes.bool,
  /** Leads the toolbar row, ahead of the filters — for the grouping switch. */
  toolbarLeadingContent: PropTypes.node,
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

/**
 * Everything a month chip had to leave out, on hover.
 *
 * **The customer leads it.** On the week grid the company is the row, so a card
 * inherits it by position and repeating it would be noise. The month has no rows
 * — thirty-five day cells of chips — so the grouping the planner deliberately
 * chose is the one fact the view otherwise never states, and a chip 208px wide
 * cannot carry two proper nouns without truncating the more specific of them.
 * Company here, site on the chip, and both are readable.
 *
 * The route and the state follow, because the two questions this grid is scanned
 * for are "whose is this" and "has anyone got it". `resolveVisitCompanyName`
 * explains what happens when the payload does not name a customer: the site
 * moves up and leads instead, rather than leaving an empty first line.
 */
const VisitMonthChipTooltip = ({
  classes,
  company,
  site,
  route,
  statusIcon,
  statusValue,
  officer,
  reassignedOfficer,
  children,
}) => {
  const { t } = useTranslation();
  // Same fallback chain the week card's officer row uses (`officer`, then a
  // reassignment, then the placeholder) — a visit reads as "unassigned" here
  // exactly when it would there.
  const officerAvatar = officer?.imageUrl || reassignedOfficer?.imageUrl || AvatarSchedule;
  const officerName =
    officer?.name || reassignedOfficer?.name || t('obx.schedules.calendar.unassigned');

  return (
    <Tooltip
      arrow
      placement="top"
      enterDelay={120}
      slotProps={{
        // The theme gives every tooltip a 20px margin, which on a 24px chip in a
        // stack of them lands the card two chips away from the one being hovered.
        popper: { modifiers: [{ name: 'offset', options: { offset: [0, -16] } }] },
      }}
      title={
        <Box className={classes.visitMonthChipTip}>
          <Typography component="span" className={classes.visitMonthChipTipLead}>
            {company ? company : site}
          </Typography>
          {/* Labelled rather than bare — "Site:" and "Route:" name what each
              line is instead of leaning on position alone. Neither carries the
              filter count or the visit's time window anymore: the count is a
              card-level fact (the week card and the month chip both already
              print it beside the site name) and the time is one line up on
              the card itself, so the tooltip stops repeating either. */}
          {company && site ? (
            <Typography component="span" className={classes.visitMonthChipTipLine}>
              {t('obx.schedules.calendar.visits.tooltipSite', { site })}
            </Typography>
          ) : null}
          <Typography component="span" className={classes.visitMonthChipTipLine}>
            {t('obx.schedules.calendar.visits.tooltipRoute', { route })}
          </Typography>
          {/* Who's on it sits beside the state, not folded into the text lines
              above — an avatar needs its own row to stay legible at this size.
              Its name takes the tip's brighter, near-full-white tier rather
              than the muted one every other line here uses: who is coming is
              as load-bearing a fact as where and when, not a footnote to them. */}
          <Box className={classes.visitMonthChipTipOfficer}>
            <Avatar
              className={classes.visitMonthChipTipAvatar}
              src={officerAvatar}
              alt={officerName}
            />
            <Typography component="span" className={classes.visitMonthChipTipOfficerName}>
              {officerName}
            </Typography>
          </Box>
          {statusValue ? (
            <Box className={classes.visitMonthChipTipStatus}>
              {statusIcon}
              <Typography component="span" className={classes.visitMonthChipTipLine}>
                {statusValue}
              </Typography>
            </Box>
          ) : null}
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
};

VisitMonthChipTooltip.propTypes = {
  classes: PropTypes.object.isRequired,
  company: PropTypes.string,
  site: PropTypes.string,
  route: PropTypes.string,
  statusIcon: PropTypes.node,
  statusValue: PropTypes.string,
  officer: PropTypes.object,
  reassignedOfficer: PropTypes.object,
  children: PropTypes.node,
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

/**
 * The card's status wash for a visit, plus the broken accent an insert carries.
 *
 * The *accent* is not in here: it is the duty type's, applied at the call site
 * from `DUTY_COLOR_CLASS` like every other card's. See the note above
 * `VISIT_STATE_CARD_CLASSES`.
 */
export const getVisitStateCardClass = (classes, shift) => {
  const state = resolveVisitState(shift);
  const fill = classes[VISIT_STATE_CARD_CLASSES[state]] || '';
  const accent = state === VISIT_STATE.INSERTED_AFTER_START ? classes.visitAccentInserted : '';
  return `${fill} ${accent}`.trim();
};

/**
 * V2's wash: **the site scheduler's own**, from `EVENT_BG_COLOR_CLASSES`.
 *
 * V2 is asked to match the individual site scheduler's card exactly, and that card
 * takes its fill from the duty palette — `dutyYellowBg` not started, `dutyBlueBg` in
 * progress, `dutyGreenBg` completed — not from the `visitFill*` literals V1 uses. So
 * this is deliberately the *other* vocabulary, and two consequences come with it and
 * are not bugs to be fixed behind the user's back:
 *
 * - **`dutyBlueBg` is `surfaceBrandSubtle`, i.e. the tenant brand** (`#E8F7ED`, a pale
 *   green, on Filter Go). An in-progress V2 card is therefore green here. That is
 *   [4.12](docs) / D9's complaint, and it is also precisely what the reference screen
 *   renders on this tenant — matching it exactly means inheriting it. V1 remains the
 *   variant that does not.
 * - **Only three statuses have a fill.** Unassigned, missed and cancelled fall through
 *   to `eventContent`'s plain grey, exactly as they do on the reference, so on V2 those
 *   three are told apart by the card's status badge rather than by its colour.
 *
 * The *status* is resolved through `visitState` rather than read off `scheduleStatus`,
 * which is the one thing not copied: the badge already resolves that way (D11 — a
 * routed visit whose window closed unstarted is missed whatever the record says), and
 * a fill keyed on the raw status would let the wash and the badge on the same card
 * disagree. Same vocabulary as the reference, same answer as the badge beside it.
 */
export const getVisitLegacyBgClass = (classes, shift) =>
  classes[EVENT_BG_COLOR_CLASSES[VISIT_STATE_STATUS[resolveVisitState(shift)]]] || '';

/**
 * The status mark a visit card shows, resolved from its *state* rather than from
 * the record's `scheduleStatus`.
 *
 * The difference is load-bearing: a routed visit whose window closed without
 * starting is missed (D11) even when the backend still says `notStarted`, and the
 * badge has to agree with the fill or the card contradicts itself.
 */
const getVisitStatusValues = ({ shift, t }) => {
  const status = VISIT_STATE_STATUS[resolveVisitState(shift)];
  return {
    statusIcon: calendarIndicatorIcons[status],
    statusValue: calendarShiftStatusValues(t)?.[status],
  };
};

/* The per-state text label that used to sit as a third line on the card is gone —
   the card's colour, border style and status icon carry the state, and the third
   line is now the runsheet. The state's name is still spoken: it is composed into
   every card's aria-label (see `buildEventAccessibleName`) and stated in full in
   the drawer's callout. */

/**
 * Card for a single visit on the visits grid.
 *
 * **This is the hit card**, the one the site schedule has always drawn for a
 * patrol hit — because that is what a visit is. Two lines:
 *
 *   time                    · the site's preferred service day, top-right
 *   runsheet, or Unassigned · which route is coming, and the status mark
 *
 * The top-right slot used to hold the visit's own name — "Morning visit", "Midday
 * visit" — which was derived from its time window and therefore said, in words, what
 * the time beside it already said in numbers. It now holds the **preferred day**: the
 * weekday the customer asked for. That is a constraint rather than a description, and
 * it is the one fact on this card the day column cannot supply — the column says which
 * day the visit *is* on, and this says whether that was the right one. Amber when the
 * two disagree.
 *
 * The tour-template line is gone. It named the *work* ("Tour Template 1") on a
 * card whose row, tab and grid already say the work is a filter replacement, and
 * it said the same thing in every cell of every week — a third of the card's
 * height spent restating the screen. Blocked-with-no-tour was the one case where
 * it carried a fact, and that case is already drawn: the state supplies the
 * card's fill and border, and the badge and `aria-label` name it. What is left is
 * the one line that differs card to card — the route coming for this visit —
 * which still reads `Unassigned` when nothing has claimed it.
 *
 * The site name is *not* here on a site row: the row already names it, exactly
 * as the site schedule's hit cards do not repeat the site they sit under. It is
 * added back for the unassigned band, whose row says only "Unassigned Visits" —
 * the same thing the site schedule does in its own unassigned-location row.
 */
const VisitCardContent = memo(({ shift, is24Hours, alwaysNameSite }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { siteName, site, startsAt, endsAt, runsheetName, preferredDay, filterCount } = shift || {};
  const resolvedSiteName = site?.name || siteName;
  const eventTime = formatShiftScheduleTimeRange(startsAt, endsAt, is24Hours);
  const unassignedLabel = t('obx.schedules.calendar.unassigned');

  const state = resolveVisitState(shift);
  /* Unrouted states are the ones the grid pins into the band, so this is also the
     test for "does the row I am in name my site".

     `alwaysNameSite` is the company grouping's answer to the same question: a
     company row names the *customer*, and a customer has several buildings, so
     without the site line the card cannot say where anybody is going. It is the
     one fact that grouping removes from the row and therefore has to add to the
     card — which is why this is a prop rather than a second card component. */
  const isUnrouted = state === VISIT_STATE.UNASSIGNED || state === VISIT_STATE.BLOCKED_NO_TOUR;
  const namesSite = alwaysNameSite || isUnrouted;

  /* Unassigned now lives top-right in the header (see below), not the footer —
     the runsheet line is gone entirely once a route *has* claimed the visit, so
     there is nothing left to render there when it hasn't either. */
  const isUnassigned = !runsheetName;

  /* Is this visit sitting on the day its site asked for? The card already sits in a
     day column, so the preferred day is only worth its space as a comparison against
     that column — and the mismatch is the half that needs saying. Compared in the
     franchise timezone, the same one the column headers are drawn in, or a visit at
     the edge of a day would read as off a day it is actually on.

     Marked only while it can still be *acted on*. `visitFillCompleted` and
     `visitFillCancelled` deliberately mute every line on their cards — done needs no
     action, so it must not compete with the cards that do — and they do it with
     `!important`, so an amber here would have lost that fight silently anyway. Stating
     the rule keeps the two from disagreeing later. Missed is not read-only and does
     keep the mark: a missed visit on the wrong day can still be rescheduled onto the
     right one, which is exactly when a planner needs to know. */
  const isOffPreferredDay = Boolean(
    preferredDay &&
    startsAt &&
    dayjsWithTimezone(startsAt).format('ddd') !== preferredDay &&
    !getVisitActionRules(shift).isReadOnly,
  );

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
        {/* Top-right slot: one badge at most, because the header is only one
            day-column wide — the comment below already lost the preferred-day
            mark to that limit once, before Unassigned was ever a contender for
            the same corner. Unassigned wins when both apply: it is the more
            urgent, harder fact (nobody is coming) and a short fixed word,
            where the preferred-day mark is a softer, variable-length note that
            is still visible on the card whenever the card *has* room for it
            (the site-grouped view, via the `else` branch below). */}
        {isUnassigned ? (
          <Typography
            className={classes.visitUnassignedText}
            variant="subtitle4"
            title={unassignedLabel}
          >
            {unassignedLabel}
          </Typography>
        ) : preferredDay && !alwaysNameSite ? (
          <Box className={classes.visitTypeLabel}>
            <CalendarIcon />
            <Typography
              className={`${classes.visitTypeLabelText} ${
                isOffPreferredDay ? classes.visitOffPreferredDay : ''
              }`}
              variant="subtitle4"
              title={t(
                isOffPreferredDay
                  ? 'obx.schedules.calendar.visits.prefersDayOff'
                  : 'obx.schedules.calendar.visits.prefersDay',
                { day: preferredDay },
              )}
            >
              {t('obx.schedules.calendar.visits.prefersDay', { day: preferredDay })}
            </Typography>
          </Box>
        ) : null}
      </Box>

      {namesSite && resolvedSiteName ? (
        <Box className={classes.visitSiteLine}>
          <Typography
            className={classes.visitSiteName}
            variant="subtitle4"
            title={resolvedSiteName}
          >
            {resolvedSiteName}
          </Typography>
          {/* The count of filters this visit needs replaced at the site, read
              off `shift.filterCount` — trailing the site name, set apart by a
              middle dot. Its own muted class keeps it subordinate to the site
              name: the line's subject is still where the visit is going, not
              how much work is there. */}
          {typeof filterCount === 'number' ? (
            <Typography
              className={classes.visitFilterCount}
              variant="subtitle4"
              title={resolvedSiteName}
            >
              · {filterCount}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {/* The runsheet line is gone: once a route has claimed the visit its name
          added nothing the row/tab/grid didn't already say, and when nothing
          has claimed it, "Unassigned" now lives in the header above instead —
          so there is no footer left to draw on this card either way. */}
    </>
  );
});

VisitCardContent.displayName = 'VisitCardContent';
VisitCardContent.propTypes = {
  shift: PropTypes.object,
  is24Hours: PropTypes.bool,
  /** Company grouping: the row is a customer, so the card has to say which site. */
  alwaysNameSite: PropTypes.bool,
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
    /* One expression drives both halves of the officer row. The label has always
       fallen through `officer` → `reassignedOfficer` → "Unassigned"; the avatar
       used to run its own chain ending in the AvatarSchedule placeholder, so an
       unassigned shift drew a face next to the word Unassigned and read as if
       somebody had been allocated. Deriving the name once and testing *that* is
       what makes the two unable to disagree — note this is deliberately not the
       `calendarShiftStatusEnum.UNASSIGNED` status, which is a server-side shift
       state shown by the status mark in the corner, not "the officer slot is
       empty". A named officer with no photo still gets the placeholder: that is
       a person without a picture, which is a different thing from nobody. */
    const officerName = officer?.name || reassignedOfficer?.name;
    const isOfficerUnassigned = !officerName;
    // Same derivation, same reason: one expression the icon and the label both read,
    // so an unassigned vehicle cannot draw a car next to the word "Unassigned".
    const vehicleName = vehicle?.name;
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
            {/* The empty slot now draws `unassigned-officer.svg` instead of drawing
                nothing — but the click target does not follow it back onto the
                icon. When a real officer is assigned, `officerClickProps` sits on
                just the avatar's own box (a deliberately narrow re-assign target).
                An unassigned row has no name to anchor a target that tightly, and
                shrinking the shortcut down to a 16px glyph the moment the slot
                empties would make it harder to claim an unassigned shift, not
                easier — so the trigger keeps its wider home on the whole row.
                Because the icon is a child of this row, clicking it still reaches
                the handler via normal bubbling; nothing about restoring the icon
                required moving the trigger back onto it. */}
            <Box
              className={`${classes.reassignedFooterFlex} ${
                isOfficerUnassigned && canAssignOfficer ? classes.officerAssignTrigger : ''
              }`}
              {...(isOfficerUnassigned ? officerClickProps : {})}
            >
              {isOfficerUnassigned ? (
                <Box className={classes.reassignedOfficerFlex}>
                  <UnassignedOfficerIcon className={classes.unassignedOfficerIcon} />
                </Box>
              ) : (
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
              )}
              <Typography className={classes.reassignedName} variant="subtitle4">
                {officerName || t('obx.schedules.calendar.unassigned')}
              </Typography>
            </Box>
            <Box className={`${classes.reassignedFooter} ${classes.newReassignedFooter}`}>
              <Box className={classes.reassignedFooterFlex}>
                {/* A solid `WhiteCarIcon` beside "Unassigned" read as a vehicle
                    having been allocated — same problem the officer row had, and
                    the fix is the same shape: not "drop the icon" but "draw a
                    different one". `unassigned-vehicle.svg` takes the same
                    `carIcon` boxing `WhiteCarIcon` uses (16px, bordered) so the
                    row holds its height and position in both states; only the
                    glyph inside changes with `vehicleName`. This row is wrapped
                    in `reassignedFooter`, which already pins it to 16px, so —
                    unlike the officer row — there was never a height patch to
                    remove here. */}
                <Box className={classes.reassignedOfficerFlex}>
                  {vehicleName ? (
                    <>
                      {vehicle?.images?.[0]?.url ? (
                        <Avatar className={classes.eventAvatar} src={vehicle?.images?.[0]?.url} />
                      ) : (
                        <Box className={classes.carIcon}>
                          <WhiteCarIcon />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box className={classes.carIcon}>
                      <UnassignedVehicleIcon />
                    </Box>
                  )}
                </Box>
                <Typography className={classes.reassignedName} variant="subtitle4">
                  {vehicleName || t('obx.schedules.calendar.unassigned')}
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
              {/* Same rule, and the same row-level click target, as the
                  patrol/dispatch officer row above — see the comment there.
                  `patrolOfficerInfo` is the class in play here (an unassigned
                  shift has no reassignment), and its 6px gap is
                  between-children only, so the icon and name sit flush. */}
              <Box
                className={`${
                  !reassignedOfficer
                    ? classes.patrolOfficerInfo
                    : classes.dedicatedOfficerInfoWithReassign
                } ${isOfficerUnassigned && canAssignOfficer ? classes.officerAssignTrigger : ''}`}
                {...(isOfficerUnassigned ? officerClickProps : {})}
              >
                {isOfficerUnassigned ? (
                  <Box className={classes.reassignedOfficerFlex}>
                    <UnassignedOfficerIcon className={classes.unassignedOfficerIcon} />
                  </Box>
                ) : (
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
                )}
                <Typography className={classes.dedicatedOfficerName} variant="subtitle4">
                  {officerName || t('obx.schedules.calendar.unassigned')}
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
