import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  calendarShiftStatusEnum,
  DAY_GRID,
  DEFAULT_CALENDER_VIEW,
} from 'src/utils/constants/schedules';

import Calendar from './calendar';
import SchedulerLayoutSwitch from './calendar/SchedulerLayoutSwitch';
import VisitVariantSwitch from './calendar/VisitVariantSwitch';
import ScheduleIndicators from './components/scheduleIndicators';
import ScheduleStatsFooter, {
  SCHEDULE_STATS_FOOTER_VARIANTS,
} from './components/scheduleStatsFooter';
import ScheduleStatusIcons from './components/scheduleStatusIcons';
import { readSchedulerLayout, writeSchedulerLayout } from './config/schedulerLayout';
import { getScheduleTabConfig, getScheduleTabFooterVariant } from './config/scheduleTabConfigs';
import {
  readVisitViewVariant,
  VISIT_VIEW_VARIANT,
  writeVisitViewVariant,
} from './config/visitViewVariant';
import { mapFooterStatsToScheduleStatsFooter } from './helper/scheduleResponseAdapter';
import { useCanViewSummaryStats } from './hooks/useCanViewSummaryStats';

/**
 * Whether the design-variation switches are on screen.
 *
 * **Off, so the scheduler can be screenshotted.** `VisitVariantSwitch` and
 * `SchedulerLayoutSwitch` are review controls — they exist to compare two drawings of a
 * visit card and two shapes of the scheduler while a decision is still open — and they
 * float over the bottom right corner of the grid, which is exactly where they land in
 * every screenshot of it. Nothing about them is for an end user.
 *
 * A flag rather than a deletion, because the decisions they serve are not settled yet and
 * both controls are new. Flip this to `true` to get them back; nothing else has to change.
 *
 * **Hiding them does not change what is drawn.** Both values are persisted and read
 * independently of the switches (`readSchedulerLayout`, and the visit-card variant beside
 * it), so the grid keeps whichever variation was last chosen — the switches are only the
 * way to change it, not the reason it is what it is. Worth knowing if the screenshots come
 * out in an unexpected variant: set it here, or flip the flag, pick, and flip it back.
 */
const SHOW_VARIATION_SWITCHES = false;

// Keep paddingBottom equal to footer height so the absolute footer covers it (no white gap).
// Bump calendar chrome by the same delta so the grid ends flush above the footer.
const FOOTER_LAYOUT = {
  none: {
    paddingBottom: '0px',
    calendarChrome: '183px',
  },
  default: {
    paddingBottom: '48px',
    calendarChrome: '231px',
  },
  overview: {
    paddingBottom: '84px',
    calendarChrome: '267px',
  },
  // Day/month hide schedule tabs but still show require-attention / create (~48px).
  dayMonth: {
    paddingBottom: '44px',
    calendarChrome: '227px',
  },
};

const isDayOrMonthView = (viewType) => viewType === DAY_GRID.DAY || viewType === DAY_GRID.MONTH;

const useStyles = makeStyles((theme) => ({
  calendarMainWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    minHeight: 0,
    // Grid owns vertical scroll; parent scroll would detach the sticky date header.
    overflow: 'hidden',
  },
  scheduleLegendFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: '0 auto',
    height: '32px',
    padding: '6px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    zIndex: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    background: theme.palette.textOnColor,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  /* The floating card-variant switch. `right: 24px` lines it up with the footer's own
     24px gutter, and it carries a white pill and a shadow because it sits over content
     — a toolbar control can be flat on the page, this cannot. `zIndex` clears the
     footer's 12 so the two never fight, and `pointerEvents` is handed back only to the
     control itself so the wrapper's padding does not swallow clicks meant for a card
     behind it. `bottom` is set inline, from the same layout constant the footer's
     height comes from. */
  visitVariantFloating: {
    position: 'absolute',
    right: '24px',
    zIndex: 13,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    /* Two pills share this shell — the card variant and the layout variation. 8px
       apart, against the 4px *inside* each, so they read as two controls rather than
       one four-segment one. */
    gap: '8px',
    padding: '4px',
    borderRadius: '10px',
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0px 4px 12px 0px rgba(16, 24, 40, 0.12)',
    '& > *': {
      pointerEvents: 'auto',
    },
  },
}));

const SITE_LEGEND_STATUSES = [
  calendarShiftStatusEnum.IN_PROGRESS,
  calendarShiftStatusEnum.NOT_STARTED,
  calendarShiftStatusEnum.COMPLETED,
  calendarShiftStatusEnum.INCOMPLETE,
  calendarShiftStatusEnum.MISSED,
  calendarShiftStatusEnum.CANCELLED,
  calendarShiftStatusEnum.UNASSIGNED,
  calendarShiftStatusEnum.SPLITTED_SHIFT,
];

/** The shift vocabulary. Missed, cancelled and incomplete are hit-specific. */
const DEFAULT_LEGEND_STATUSES = [
  calendarShiftStatusEnum.NOT_STARTED,
  calendarShiftStatusEnum.IN_PROGRESS,
  calendarShiftStatusEnum.COMPLETED,
  calendarShiftStatusEnum.UNASSIGNED,
  calendarShiftStatusEnum.SPLITTED_SHIFT,
];

/**
 * The visits legend — every wash a visit card can take, and nothing else.
 *
 * Day and month carry no status counts, so this list is the only thing on those
 * views that says what the grid's colours mean. It used to be
 * `DEFAULT_LEGEND_STATUSES`, which is the **shift** vocabulary: it omits Missed —
 * a hit-specific status (`calendarShiftStatusEnum`) — so the visits grid drew red
 * cards, and the drawer named that state in full, while the legend underneath
 * admitted to neither. A legend that describes fewer colours than the grid draws
 * is the failure `visitCardInk` calls out.
 *
 * The inverse failure is why **Cancelled is not here**, reversing half of D28,
 * which mandated it: a cancelled visit is no longer drawn on any of these views
 * unless the planner picks Cancelled in the status dropdown
 * (`dropCancelledEvents` / `dropCancelledGroups`). A key naming a colour the grid
 * never paints describes nothing — and on the footer that does carry counts it
 * was worse than nothing, since the number beside it made the total overshoot the
 * cards on screen.
 *
 * Kept as its own list rather than added to the shift one, for the same reason
 * the stats footer keeps `VISITS_STATUS_STATS` apart from `STATUS_STATS`: the
 * dedicated and patrol day views share `DEFAULT_LEGEND_STATUSES`, and a Missed
 * entry there would be a mark those grids never make.
 *
 * Split shift is deliberately absent — a shift concept, permanently 0 for visits,
 * which is exactly why the footer swaps it out for Missed. Incomplete likewise:
 * no visit state resolves to it (`VISIT_STATE_STATUS`). Order matches
 * `VISITS_STATUS_STATS` so both legend paths read the same, whichever footer the
 * view happens to be showing.
 */
const VISITS_LEGEND_STATUSES = [
  calendarShiftStatusEnum.COMPLETED,
  calendarShiftStatusEnum.IN_PROGRESS,
  calendarShiftStatusEnum.NOT_STARTED,
  calendarShiftStatusEnum.UNASSIGNED,
  calendarShiftStatusEnum.MISSED,
];

export default function Schedules({ selectedSite, officerId, className }) {
  const classes = useStyles();
  const isEmbeddedSchedule = Boolean(selectedSite) || Boolean(officerId);
  const [activeScheduleTab, setActiveScheduleTab] = useState('overview');
  const [calendarViewType, setCalendarViewType] = useState(DEFAULT_CALENDER_VIEW);
  const [footerStats, setFooterStats] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  // Supplied by Calendar so the footer's status counts drive the same filter.
  const [statusControl, setStatusControl] = useState({ activeStatus: null, setStatus: null });
  const canViewSummaryStats = useCanViewSummaryStats();
  /**
   * A tab that draws its own pane owns its own footer too.
   *
   * `calendarViewType` is the *calendar's* state and it survives a tab change, so
   * leaving the grid on Day and switching to Companies put the calendar's status
   * legend — "Not started · In progress · Split shift" — underneath a company
   * listing that has no shifts, no split shifts and a footer of its own. Two footers
   * stacked, one of them describing the wrong screen.
   */
  const tabRendersOwnPane = Boolean(getScheduleTabConfig(activeScheduleTab)?.rendersOwnPane);

  /**
   * The variant is a question about the *subject*, and only the calendar knows it.
   *
   * It used to be read straight off the tab config, which is why the visits footer
   * was unreachable: the company grouping is a mode of the main service tab, and
   * that tab's config says `overview`. So a grid full of visits was summarised with
   * the shift vocabulary — `Split shift`, permanently 0 here — while Missed and
   * Cancelled went uncounted, and the footer added up to 6 of the 8 visits on
   * screen. The calendar reports the resolved variant up; the tab config is the
   * fallback until it has.
   */
  const [reportedFooterVariant, setReportedFooterVariant] = useState(null);
  const footerVariant = reportedFooterVariant ?? getScheduleTabFooterVariant(activeScheduleTab);
  const isVisitsSubject = footerVariant === SCHEDULE_STATS_FOOTER_VARIANTS.VISITS;
  /* An explicit "no page footer", distinct from "nothing reported yet" — the surface
     on screen brings its own chrome. Variation 2's company timeline is the case: it
     mounts a pane from a tab whose config still says `overview`, so `tabRendersOwnPane`
     is false and both footers below would otherwise draw against a grid that is not
     there. Answered by the calendar rather than inferred here, because only it knows
     which grouping is showing. */
  const rendersOwnFooter = footerVariant === SCHEDULE_STATS_FOOTER_VARIANTS.NONE;

  /**
   * Which of the two visit card designs the grid is drawing — V1 or V2.
   *
   * Held **here** rather than in the calendar, even though the switch that sets it
   * lives on the calendar's toolbar, because the choice changes the *footer* as well
   * as the cards: V2 is the site scheduler's card, and the site scheduler states its
   * colours in a plain icon legend rather than a row of clickable counts. The legend
   * is rendered by this component, so this is the lowest node that owns both halves.
   * The calendar receives it and reports changes back up.
   *
   * Remembered between sessions like the grouping choice: a reviewer comparing two
   * designs re-opens the screen many times, and re-picking the variant every time
   * would be the app forgetting the only thing it was asked to remember.
   */
  const [visitCardVariant, setVisitCardVariant] = useState(readVisitViewVariant);
  const handleVisitCardVariantChange = (next) => {
    setVisitCardVariant(next);
    writeVisitViewVariant(next);
  };

  /**
   * Which of the two candidate scheduler layouts the page is drawing — see
   * `config/schedulerLayout`.
   *
   * Held here for the same reason the card variant is: the calendar is the thing it
   * reshapes, so it cannot also be the thing that owns the choice — the switch has to
   * survive on screen while the layout beneath it changes. Remembered between
   * sessions, because a reviewer comparing two layouts re-opens this screen many
   * times and re-picking the variation every time would be the app forgetting the one
   * thing it was asked to remember.
   */
  const [schedulerLayout, setSchedulerLayout] = useState(readSchedulerLayout);
  const handleSchedulerLayoutChange = (next) => {
    setSchedulerLayout(next);
    writeSchedulerLayout(next);
  };

  const showsVisitCardV2 = isVisitsSubject && visitCardVariant === VISIT_VIEW_VARIANT.V2;
  /* Shown only over a grid of visit cards. Not on the embedded site/user schedules
     (those draw the legacy card, so the choice would change nothing) and not on a tab
     that renders its own pane, whose content this switch does not reach. */
  const showsVisitVariantSwitch = isVisitsSubject && !isEmbeddedSchedule && !tabRendersOwnPane;

  /**
   * Day and month show the legend, because neither carries status counts — with one
   * exception, which is the whole point of this line: the company grouping's month
   * *does* fetch them. Given real numbers, printing a legend instead is throwing
   * away the answer and showing the key to it.
   */
  /* V2 brings the site scheduler's footer with it, on every view including the week.
     That is not decoration: the card being compared states its status in a *badge*,
     and a badge is only readable against a key that names the marks. V1 keeps the
     stats footer, whose clickable counts are the thing V1 has and V2 does not — so
     the two footers are part of what is being judged, not a side effect of it. */
  const showLegendFooter =
    !tabRendersOwnPane &&
    !rendersOwnFooter &&
    (isEmbeddedSchedule ||
      showsVisitCardV2 ||
      (isDayOrMonthView(calendarViewType) && !footerStats));
  const footerData = mapFooterStatsToScheduleStatsFooter(footerStats, footerVariant);
  /* Without coverage + KPI metrics the footer collapses to a single legend row.
     Keyed on the mapped data rather than on the variant name, for the same reason
     the footer itself is: the visits variant carries the KPI block on the week and
     drops it on the month, so the chrome height has to follow the payload. */
  const isTallFooter = Boolean(footerData?.metrics?.length) && canViewSummaryStats;
  // `NONE` is a variant, so it passes a truthiness test — matched by name instead.
  const showStatsFooter = Boolean(footerVariant) && !rendersOwnFooter;
  const footerLayout = showLegendFooter
    ? FOOTER_LAYOUT.dayMonth
    : isTallFooter
      ? FOOTER_LAYOUT.overview
      : showStatsFooter
        ? FOOTER_LAYOUT.default
        : FOOTER_LAYOUT.none;

  /* Which vocabulary the legend spells out is the same question the footer variant
     answers — what this grid is a grid *of* — so it is read off the resolved
     variant rather than the tab id. The company grouping is a visits view living
     on a shift tab's config, and the tab id cannot tell the two readings apart. */
  const legendStatuses = selectedSite
    ? SITE_LEGEND_STATUSES
    : isVisitsSubject
      ? VISITS_LEGEND_STATUSES
      : DEFAULT_LEGEND_STATUSES;

  const handleScheduleTabChange = (tab) => {
    setActiveScheduleTab(tab);
    setFooterStats(null);
  };

  return (
    <Box
      className={classes.calendarMainWrapper}
      style={{
        paddingBottom: footerLayout.paddingBottom,
        // Inherited by FullCalendar / skeleton height calc in calendar.styles.
        '--schedule-calendar-chrome': footerLayout.calendarChrome,
      }}
    >
      <Calendar
        className={className}
        selectedSite={selectedSite}
        officerId={officerId}
        activeTab={isEmbeddedSchedule ? undefined : activeScheduleTab}
        onTabChange={isEmbeddedSchedule ? undefined : handleScheduleTabChange}
        onViewTypeChange={setCalendarViewType}
        onFooterStatsChange={setFooterStats}
        onFooterVariantChange={setReportedFooterVariant}
        onLoadingChange={setScheduleLoading}
        onStatusControlChange={setStatusControl}
        visitCardVariant={visitCardVariant}
        schedulerLayout={schedulerLayout}
      />
      {/* Floating over the grid, bottom right, rather than sitting in the toolbar.
          Asked for that way, and it suits what the control is: the toolbar is where
          you change *what* the grid shows, and this changes how one card is drawn —
          a reviewer's control, parked out of the way of the filters it is not part
          of. Anchored above the footer from the same layout constant the footer's own
          height comes from, so it cannot drift onto the legend when the footer
          changes height between views. */}
      {SHOW_VARIATION_SWITCHES && !isEmbeddedSchedule ? (
        <Box
          className={classes.visitVariantFloating}
          style={{ bottom: `calc(${footerLayout.paddingBottom} + 16px)` }}
        >
          {showsVisitVariantSwitch ? (
            <VisitVariantSwitch value={visitCardVariant} onChange={handleVisitCardVariantChange} />
          ) : null}
          {/* Unconditional inside this shell, unlike the card switch beside it. The
              card variant only means something over a grid of visit cards, so it
              comes and goes with one; the layout variation decides whether the
              Companies *tab* exists at all, and a control that vanished on the
              surfaces it governs would be unreachable from half of what it changes —
              including, on Var 1, the Companies tab itself. */}
          <SchedulerLayoutSwitch value={schedulerLayout} onChange={handleSchedulerLayoutChange} />
        </Box>
      ) : null}
      {showLegendFooter ? (
        <Box className={classes.scheduleLegendFooter}>
          <ScheduleIndicators />
          <ScheduleStatusIcons statuses={legendStatuses} />
        </Box>
      ) : showStatsFooter ? (
        <ScheduleStatsFooter
          variant={footerVariant}
          data={footerData}
          loading={scheduleLoading && !footerStats}
          legendLoading={scheduleLoading && Boolean(footerStats)}
          onStatusSelect={statusControl.setStatus}
          activeStatus={statusControl.activeStatus}
        />
      ) : null}
    </Box>
  );
}

Schedules.propTypes = {
  selectedSite: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  officerId: PropTypes.number,
  className: PropTypes.string,
};
