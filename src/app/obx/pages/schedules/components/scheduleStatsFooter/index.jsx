import { AccessTime, PersonOutline } from '@mui/icons-material';
import { Box, Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { DispatchIcon, Runsheet, SplittedCalenderIcon } from 'src/assets/svg';
import { ReactComponent as CancelledIcon } from 'src/assets/svg/CancelledIcon.svg';
import { ReactComponent as CompletedIcon } from 'src/assets/svg/CompletedIcon.svg';
import { ReactComponent as InProgressIcon } from 'src/assets/svg/InProgressIcon.svg';
import { ReactComponent as MissedIcon } from 'src/assets/svg/MissedIcon.svg';
import { ReactComponent as NotStartedIcon } from 'src/assets/svg/notStartedScheduleStatus.svg';
import { ReactComponent as UnassignedIcon } from 'src/assets/svg/UnassignedIcon.svg';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useCanViewSummaryStats } from '../../hooks/useCanViewSummaryStats';

export const SCHEDULE_STATS_FOOTER_VARIANTS = {
  OVERVIEW: 'overview',
  DEDICATED: 'dedicated',
  PATROL: 'patrol',
  VISITS: 'visits',
  /**
   * **No page footer at all** — not "unknown", which is what `null` means here.
   *
   * The page resolves the calendar's reported variant with `??`, so `null` says
   * "I have nothing to report, fall back to the tab's own variant". A surface that
   * brings its own footer needs the opposite: an answer, and the answer is none.
   * Variation 2's company-timeline grouping is the case — it mounts a pane with its
   * own chrome from a tab whose config still says `overview`, so without this the
   * page drew an empty overview stats bar underneath it.
   *
   * Deliberately a truthy string so it survives `??`, and matched explicitly at the
   * page rather than by falsiness — the previous stopgap reported `''` and leaned on
   * `Boolean(footerVariant)`, which works by accident and reads as a missing value.
   */
  NONE: 'none',
};

/**
 * Footer status id → the value the schedule status filter expects. Only ids
 * present here become clickable; `split` has no matching filter option.
 */
const STATUS_FILTER_VALUES = {
  completed: 'completed',
  inProgress: 'inProgress',
  notStarted: 'notStarted',
  unassigned: 'requiresAttention',
  missed: 'missed',
  cancelled: 'cancelled',
};

const STATUS_STATS = [
  { id: 'completed', icon: CompletedIcon, labelKey: 'obx.schedules.filters.status.completed' },
  { id: 'inProgress', icon: InProgressIcon, labelKey: 'obx.schedules.filters.status.inProgress' },
  { id: 'notStarted', icon: NotStartedIcon, labelKey: 'obx.schedules.filters.status.notStarted' },
  { id: 'unassigned', icon: UnassignedIcon, labelKey: 'obx.schedules.filters.status.unassigned' },
  { id: 'split', icon: SplittedCalenderIcon, label: 'Split' },
];

/**
 * Visits count differently from shifts.
 *
 * `split` is a shift concept and always read 0 here. Meanwhile the grid drew
 * missed and cancelled visits that no footer number accounted for, so the counts
 * did not sum to the visits on screen — the footer said 34 of 42. Swapping split
 * for missed and cancelled makes the footer add up and makes both states
 * filterable, which is how a planner finds them.
 *
 * Reached through `resolveScheduleFooterVariant`, not through a tab id: the
 * retired Visits tab used to be the only route in, which left the main tab's
 * company grouping — a grid of visits — counting itself with the shift list.
 */
const VISITS_STATUS_STATS = [
  { id: 'completed', icon: CompletedIcon, labelKey: 'obx.schedules.filters.status.completed' },
  { id: 'inProgress', icon: InProgressIcon, labelKey: 'obx.schedules.filters.status.inProgress' },
  { id: 'notStarted', icon: NotStartedIcon, labelKey: 'obx.schedules.filters.status.notStarted' },
  { id: 'unassigned', icon: UnassignedIcon, labelKey: 'obx.schedules.filters.status.unassigned' },
  {
    id: 'missed',
    icon: MissedIcon,
    labelKey: 'obx.schedules.calendar.scheduleStatus.missed',
  },
  {
    id: 'cancelled',
    icon: CancelledIcon,
    labelKey: 'obx.schedules.calendar.scheduleStatus.cancelled',
    /* The cancelled card is flat grey (`visitFillCancelled`) and this icon is a
       red disc, so the legend contradicted the grid. Greyed at the call site
       rather than in the asset — `CancelledIcon.svg` is shared with the grid's
       card badges and the visit drawer's status chip, where red is intended.
       See `cancelledMark` in `scheduleStatusIcons` for the full reasoning; the
       two legend paths have to agree, so they use the same treatment. */
    mutedMark: true,
  },
];

const getFooterPresentation = (t, getLabel, services = {}, shiftTypes = {}) => {
  const resolveDutyLabel = (key, fallback) => {
    const fromShiftTypes =
      shiftTypes?.[key]?.label || (typeof shiftTypes?.[key] === 'string' ? shiftTypes[key] : '');
    const fromTerms = getLabel?.('terms', key, t);
    return fromShiftTypes || fromTerms || fallback;
  };

  const dedicated = resolveDutyLabel('dedicated', 'Dedicated');
  const patrol = resolveDutyLabel('patrol', 'Patrol');
  // Same source as scheduleIndicators — full tenant display term (no hardcoded "Job").
  const extra = resolveDutyLabel('extra', 'Extra');
  const dispatch = resolveDutyLabel('dispatch', 'Dispatch');
  const officers = getLabel?.('terms', 'officers', t) || 'Officers';
  const runsheets = getLabel?.('terms', 'runsheets', t) || 'Runsheets';
  const runsheet = getLabel?.('terms', 'runsheet', t) || 'Runsheet';

  const withLabels = (items) =>
    items.map((item) => ({
      ...item,
      label: item.labelKey ? t(item.labelKey) : item.label,
    }));

  const statusStats = withLabels(STATUS_STATS);
  const visitsStatusStats = withLabels(VISITS_STATUS_STATS);

  const overviewDutyStats = [];
  if (services?.dedicated === true) {
    overviewDutyStats.push({ id: 'dedicated', color: '#31A150', label: dedicated });
  }
  if (services?.patrol === true) {
    overviewDutyStats.push({ id: 'patrol', color: '#146DFF', label: patrol });
  }
  if (services?.extra === true) {
    overviewDutyStats.push({ id: 'extra', color: '#F79009', label: extra });
  }
  if (services?.dispatch === true) {
    overviewDutyStats.push({ id: 'dispatch', color: '#9747FF', label: dispatch });
  }

  const overviewMetrics = [
    {
      id: 'scheduledOfficers',
      icon: PersonOutline,
      color: '#9747FF',
      label: `Scheduled ${officers}`,
    },
    {
      id: 'hoursCompleted',
      icon: AccessTime,
      color: '#12B76A',
      label: 'Hrs Completed',
    },
  ];

  if (services?.patrol === true) {
    overviewMetrics.push({
      id: 'runsheetsCompleted',
      icon: Runsheet,
      color: '#146DFF',
      label: `${runsheets} Completed`,
    });
  }

  if (services?.dispatch === true) {
    overviewMetrics.push({
      id: 'dispatchCompleted',
      icon: DispatchIcon,
      color: '#9747FF',
      label: `${dispatch} Completed`,
    });
  }

  const dedicatedDutyStats = [];
  if (services?.dedicated === true) {
    dedicatedDutyStats.push({ id: 'dedicated', color: '#31A150', label: dedicated });
  }
  if (services?.extra === true) {
    dedicatedDutyStats.push({ id: 'extra', color: '#F79009', label: extra });
  }
  if (services?.dispatch === true) {
    dedicatedDutyStats.push({ id: 'dispatch', color: '#9747FF', label: dispatch });
  }

  const patrolDutyStats = [];
  if (services?.patrol === true) {
    patrolDutyStats.push({ id: 'patrol', color: '#146DFF', label: patrol });
  }
  if (services?.extra === true) {
    patrolDutyStats.push({
      id: 'extraRunsheet',
      color: '#F79009',
      label: `${extra} ${runsheet}`,
    });
  }
  if (services?.dispatch === true) {
    patrolDutyStats.push({ id: 'dispatch', color: '#9747FF', label: dispatch });
  }

  const hits = getLabel?.('terms', 'hits', t) || 'Visits';

  return {
    [SCHEDULE_STATS_FOOTER_VARIANTS.VISITS]: {
      /* The KPI row is the *week's* facts — coverage, hours, routes completed —
         not the shift vocabulary's, so it survives the switch to this variant.
         Without it, correcting the status row (swapping the permanently-zero
         `Split` for the Missed and Cancelled the grid actually draws) would have
         silently cost the company grouping its coverage ring and top row, which
         is a trade nobody asked for. Rendered only when the payload carries an
         `overview` block, so the month — which has no KPI call — still collapses
         to the short footer. */
      metrics: overviewMetrics,
      dutyStats: [
        { id: 'patrol', color: '#146DFF', label: `${hits} on a ${runsheet}` },
        { id: 'extraRunsheet', color: '#F04438', label: `Unassigned ${hits}` },
        // Density, stated plainly. With a monthly or quarterly cadence most of
        // the site list is untouched in any given week, and a planner needs to
        // know that is the schedule working, not the screen failing to load.
        {
          id: 'sitesServiced',
          color: '#667085',
          label: t('obx.schedules.calendar.visits.sitesServiced'),
        },
      ],
      statusStats: visitsStatusStats,
    },
    [SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW]: {
      metrics: overviewMetrics,
      dutyStats: overviewDutyStats,
      statusStats,
    },
    [SCHEDULE_STATS_FOOTER_VARIANTS.DEDICATED]: {
      dutyStats: dedicatedDutyStats,
      statusStats,
    },
    [SCHEDULE_STATS_FOOTER_VARIANTS.PATROL]: {
      dutyStats: patrolDutyStats,
      statusStats,
    },
  };
};

const useStyles = makeStyles((theme) => ({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 12,
    minHeight: '40px',
    padding: '8px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(255, 255, 255, 0.96)',
    boxShadow: '0 -12px 24px rgba(16, 24, 40, 0.08)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  overviewFooter: {
    minHeight: '78px',
    paddingTop: '8px',
    paddingBottom: '8px',
    alignItems: 'stretch',
  },
  overviewSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    minWidth: 0,
    flex: 1,
  },
  coverageBlock: {
    width: '52px',
    minWidth: '52px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: '14px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
  },
  coverageRing: {
    '--coverage-angle': '0deg',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#E8F1FF',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      inset: '6px',
      borderRadius: '50%',
      background: '#FFFFFF',
    },
  },
  coverageRingProgress: {
    background:
      'conic-gradient(#146DFF 0 var(--coverage-angle), #E8F1FF var(--coverage-angle) 360deg)',
  },
  coverageValue: {
    '&.MuiTypography-root': {
      marginTop: '2px',
      fontSize: '12px',
      lineHeight: '14px',
      fontWeight: 700,
      color: theme.palette.textPrimary,
    },
  },
  coverageLabel: {
    '&.MuiTypography-root': {
      fontSize: '11px',
      lineHeight: '12px',
      color: theme.palette.textSecondary1,
    },
  },
  overviewContent: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px',
  },
  metricsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    // Matches the dutyStats/statusStats gap in the legend row below so the
    // spacing reads as one consistent system now that space-between no
    // longer stretches items across the row.
    gap: '22px',
    minWidth: '980px',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    '&:first-child': {
      paddingLeft: 0,
      borderLeft: 'none',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      color: 'var(--metric-color)',
    },
    '& svg': {
      width: '16px',
      height: '16px',
      color: 'var(--metric-color)',
      flexShrink: 0,
    },
  },
  // "Scheduled Technicians" rendered narrower than its neighbors on request.
  // A nowrap flex item won't shrink below its content's min width without
  // overflowing into the next metric (verified: a bare `width` override with
  // nowrap intact just prints past its box and collides with "Hrs Completed").
  // Allowing the label to wrap is the only way to actually shrink the box;
  // 120px is tuned so it breaks cleanly after "Scheduled" onto a second line
  // (matches the two-line "78% / Coverage" pattern already used on the left
  // of this footer) instead of fragmenting into three lines. That is roughly
  // 65% of the original ~187px width — not a literal 50%, since anything
  // narrower forced an ugly three-line break (tested at 112px). If tenant
  // copy for this label changes, re-check that the break still lands cleanly.
  metricItemNarrow: {
    width: '120px',
    whiteSpace: 'normal',
  },
  metricText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      lineHeight: '16px',
      color: theme.palette.textSecondary1,
    },
  },
  statValue: {
    fontWeight: 700,
    color: theme.palette.textPrimary,
  },
  statSuffix: {
    fontWeight: 500,
    color: theme.palette.textSecondary1,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    width: '100%',
    minWidth: '760px',
  },
  compactLegendRow: {
    minWidth: '640px',
  },
  dividedLegendRow: {
    paddingTop: '8px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  dutyStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    flex: '0 0 auto',
  },
  statusStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flex: '0 0 auto',
  },
  dutyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    whiteSpace: 'nowrap',
  },
  dutyMarker: {
    width: '2px',
    height: '16px',
    borderRadius: '2px',
    background: 'var(--duty-color)',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    '& svg': {
      width: '16px',
      height: '16px',
      flex: '0 0 auto',
    },
  },
  /* A status whose card carries no colour of its own — see `mutedMark`. Scoped to
     the one entry that asks for it rather than applied to `statusItem`, so the
     four coloured marks beside it are untouched. */
  statusMarkMuted: {
    '& svg': {
      filter: 'grayscale(1)',
    },
  },
  // The status counts are the most natural drill-down on the page, so where a
  // matching schedule filter exists they behave as one.
  statusItemInteractive: {
    border: 'none',
    background: 'transparent',
    padding: '2px 6px',
    margin: '0 -6px',
    borderRadius: '6px',
    cursor: 'pointer',
    font: 'inherit',
    '&:hover': {
      background: theme.palette.backgroundSubtle1 || 'rgba(16, 24, 40, 0.06)',
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.borderBrand || '#146DFF'}`,
      outlineOffset: '1px',
    },
  },
  statusItemActive: {
    background: theme.palette.backgroundSubtle1 || 'rgba(16, 24, 40, 0.08)',
    boxShadow: `inset 0 0 0 1px ${theme.palette.borderBrand || '#146DFF'}`,
  },
  legendText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      lineHeight: '16px',
      color: theme.palette.textSecondary1,
    },
  },
  skeletonCoverageRing: {
    borderRadius: '50%',
  },
  skeletonCoverageValue: {
    marginTop: '4px',
    borderRadius: '6px',
  },
  skeletonCoverageLabel: {
    marginTop: '4px',
    borderRadius: '6px',
  },
  skeletonRowBar: {
    borderRadius: '6px',
    width: '100%',
  },
}));

const renderStatText = (classes, item) => (
  <Typography className={classes.legendText}>
    {item.value ? (
      <>
        <Box component="span" className={classes.statValue}>
          {item.value}
          {/* "9/46 Sites serviced" — a bare 9 would read as a total. */}
          {item.suffix || ''}
        </Box>{' '}
      </>
    ) : null}
    {item.label}
  </Typography>
);

const mergeFooterData = (baseData = {}, apiData = {}) => ({
  ...baseData,
  ...apiData,
  // API supplies values only — keep tenant-aware labels / icons / colors from presentation.
  metrics: baseData.metrics?.map((metric) => {
    const apiMetric = apiData.metrics?.find((item) => item.id === metric.id) || {};
    return {
      ...metric,
      ...apiMetric,
      label: metric.label,
      icon: metric.icon,
      color: metric.color,
    };
  }),
  dutyStats: baseData.dutyStats
    ?.map((item) => {
      const apiStat = apiData.dutyStats?.find((stat) => stat.id === item.id) || {};
      return {
        ...item,
        ...apiStat,
        label: item.label,
        color: item.color,
        icon: item.icon,
      };
    })
    .filter((item) => item.id !== 'sitesServiced' || item.value),
  statusStats: baseData.statusStats?.map((item) => {
    const apiStat = apiData.statusStats?.find((stat) => stat.id === item.id) || {};
    return {
      ...item,
      ...apiStat,
      label: item.label,
      icon: item.icon,
      color: item.color,
    };
  }),
});

const LegendRowSkeleton = ({ compact = false, withTopDivider = false }) => {
  const classes = useStyles();

  return (
    <Box
      className={`${classes.legendRow} ${compact ? classes.compactLegendRow : ''} ${
        withTopDivider ? classes.dividedLegendRow : ''
      }`}
    >
      <Skeleton
        animation="wave"
        variant="rounded"
        width="100%"
        height={16}
        className={classes.skeletonRowBar}
      />
    </Box>
  );
};

const OverviewFooterSkeleton = () => {
  const classes = useStyles();

  return (
    <Box className={classes.overviewSummary}>
      <Box className={classes.coverageBlock}>
        <Skeleton
          animation="wave"
          variant="circular"
          width={26}
          height={26}
          className={classes.skeletonCoverageRing}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={28}
          height={12}
          className={classes.skeletonCoverageValue}
        />
        <Skeleton
          animation="wave"
          variant="rounded"
          width={48}
          height={10}
          className={classes.skeletonCoverageLabel}
        />
      </Box>
      <Box className={classes.overviewContent}>
        <Skeleton
          animation="wave"
          variant="rounded"
          width="70%"
          height={16}
          className={classes.skeletonRowBar}
        />
        <LegendRowSkeleton withTopDivider />
      </Box>
    </Box>
  );
};

const withEmptyValues = (presentation = {}) => ({
  coverage: 0,
  metrics: (presentation.metrics || []).map((metric) => ({
    ...metric,
    value: '0',
    suffix: '/0',
  })),
  dutyStats: (presentation.dutyStats || []).map((item) => ({
    ...item,
    value: '0',
  })),
  statusStats: (presentation.statusStats || []).map((item) => ({
    ...item,
    value: '0',
  })),
});

const ScheduleStatsFooter = ({
  variant = SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW,
  data = null,
  loading = false,
  legendLoading = false,
  onStatusSelect,
  activeStatus,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const services = useSelector((state) => state.auth.tenantInfo?.services || {});
  const shiftTypes = useSelector((state) => state.tenantConfigs?.labels?.shift_types || {});
  const canViewSummaryStats = useCanViewSummaryStats();
  const footerPresentation = getFooterPresentation(t, getLabel, services, shiftTypes);
  const presentation =
    footerPresentation[variant] || footerPresentation[SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW];
  /**
   * Coverage + KPI metrics come from summary/stats, which restricted roles never
   * fetch — so this is a question about the *payload*, not about the variant name.
   *
   * It used to test `variant === OVERVIEW`. That made the tall footer the private
   * property of one variant, and the moment the company grouping started reporting
   * itself as `VISITS` — which it must, so the status row stops counting a
   * permanently-zero `Split` and starts counting Missed and Cancelled — the week
   * would have lost its coverage ring as a side effect of a status-row fix.
   */
  const hasKpiMetrics = Boolean(data?.metrics?.length);
  const isOverview = hasKpiMetrics && canViewSummaryStats;

  if (loading) {
    return (
      <Box className={`${classes.footer} ${isOverview ? classes.overviewFooter : ''}`}>
        {isOverview ? <OverviewFooterSkeleton /> : <LegendRowSkeleton compact />}
      </Box>
    );
  }

  // Compact footers are legend-only — treat legendLoading as a full skeleton.
  if (!isOverview && legendLoading) {
    return (
      <Box className={classes.footer}>
        <LegendRowSkeleton compact />
      </Box>
    );
  }

  const footerData = data ? mergeFooterData(presentation, data) : withEmptyValues(presentation);
  const hasCoverage =
    footerData.coverage !== null && footerData.coverage !== undefined && footerData.coverage !== '';
  const coveragePercent = hasCoverage ? Number(footerData.coverage) : NaN;
  const safeCoverage = Number.isFinite(coveragePercent)
    ? Math.max(0, Math.min(100, coveragePercent))
    : 0;
  const coverageAngle = `${safeCoverage * 3.6}deg`;
  const showCoverageProgress = hasCoverage && safeCoverage > 0;

  return (
    <Box className={`${classes.footer} ${isOverview ? classes.overviewFooter : ''}`}>
      {isOverview ? (
        <Box className={classes.overviewSummary}>
          <Box className={classes.coverageBlock}>
            <Box
              className={`${classes.coverageRing} ${
                showCoverageProgress ? classes.coverageRingProgress : ''
              }`}
              style={{ '--coverage-angle': coverageAngle }}
            />
            <Typography className={classes.coverageValue}>
              {hasCoverage ? `${safeCoverage}%` : '—'}
            </Typography>
            <Typography className={classes.coverageLabel}>Coverage</Typography>
          </Box>
          <Box className={classes.overviewContent}>
            <Box className={classes.metricsRow}>
              {(footerData.metrics || []).map((metric) => {
                const Icon = metric.icon;
                if (!Icon) return null;

                return (
                  <Box
                    className={`${classes.metricItem} ${
                      metric.id === 'scheduledOfficers' ? classes.metricItemNarrow : ''
                    }`}
                    key={metric.id}
                    sx={{ '--metric-color': metric.color }}
                  >
                    <Icon />
                    <Typography className={classes.metricText}>
                      {metric.value ? (
                        <Box component="span" className={classes.statValue}>
                          {metric.value}
                        </Box>
                      ) : null}
                      {metric.suffix ? (
                        <Box component="span" className={classes.statSuffix}>
                          {metric.suffix}
                        </Box>
                      ) : null}
                      {metric.value || metric.suffix ? ' ' : null}
                      {metric.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            {legendLoading ? (
              <LegendRowSkeleton withTopDivider />
            ) : (
              <LegendRow
                footerData={footerData}
                withTopDivider
                onStatusSelect={onStatusSelect}
                activeStatus={activeStatus}
              />
            )}
          </Box>
        </Box>
      ) : (
        <LegendRow
          footerData={footerData}
          compact
          onStatusSelect={onStatusSelect}
          activeStatus={activeStatus}
        />
      )}
    </Box>
  );
};

const LegendRow = ({
  footerData,
  compact = false,
  withTopDivider = false,
  onStatusSelect,
  activeStatus,
}) => {
  const classes = useStyles();

  return (
    <Box
      className={`${classes.legendRow} ${compact ? classes.compactLegendRow : ''} ${
        withTopDivider ? classes.dividedLegendRow : ''
      }`}
    >
      <Box className={classes.dutyStats}>
        {(footerData.dutyStats || []).map((item) => (
          <Box className={classes.dutyItem} key={item.id} sx={{ '--duty-color': item.color }}>
            <Box className={classes.dutyMarker} />
            {renderStatText(classes, item)}
          </Box>
        ))}
      </Box>
      <Box className={classes.statusStats}>
        {(footerData.statusStats || []).map((item) => {
          const Icon = item.icon;
          if (!Icon) return null;

          const filterValue = STATUS_FILTER_VALUES[item.id];
          const isInteractive = Boolean(filterValue) && typeof onStatusSelect === 'function';
          const markClass = item.mutedMark ? classes.statusMarkMuted : '';

          if (!isInteractive) {
            return (
              <Box className={`${classes.statusItem} ${markClass}`} key={item.id}>
                <Icon />
                {renderStatText(classes, item)}
              </Box>
            );
          }

          const isActive = activeStatus === filterValue;

          return (
            <Box
              component="button"
              type="button"
              key={item.id}
              className={`${classes.statusItem} ${markClass} ${classes.statusItemInteractive} ${
                isActive ? classes.statusItemActive : ''
              }`}
              aria-pressed={isActive}
              onClick={() => onStatusSelect(isActive ? null : filterValue)}
            >
              <Icon />
              {renderStatText(classes, item)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

ScheduleStatsFooter.propTypes = {
  variant: PropTypes.oneOf(Object.values(SCHEDULE_STATS_FOOTER_VARIANTS)),
  data: PropTypes.shape({
    coverage: PropTypes.number,
    metrics: PropTypes.array,
    dutyStats: PropTypes.array,
    statusStats: PropTypes.array,
  }),
  loading: PropTypes.bool,
  legendLoading: PropTypes.bool,
  /** Receives the status filter value, or null to clear it. */
  onStatusSelect: PropTypes.func,
  activeStatus: PropTypes.string,
};

LegendRowSkeleton.propTypes = {
  compact: PropTypes.bool,
  withTopDivider: PropTypes.bool,
};

LegendRow.propTypes = {
  footerData: PropTypes.shape({
    dutyStats: PropTypes.array,
    statusStats: PropTypes.array,
  }).isRequired,
  compact: PropTypes.bool,
  withTopDivider: PropTypes.bool,
  onStatusSelect: PropTypes.func,
  activeStatus: PropTypes.string,
};

export default ScheduleStatsFooter;
