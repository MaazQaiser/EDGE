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
import ScheduleIndicators from './components/scheduleIndicators';
import ScheduleStatsFooter, {
  SCHEDULE_STATS_FOOTER_VARIANTS,
} from './components/scheduleStatsFooter';
import ScheduleStatusIcons from './components/scheduleStatusIcons';
import { getScheduleTabFooterVariant } from './config/scheduleTabConfigs';
import { mapFooterStatsToScheduleStatsFooter } from './helper/scheduleResponseAdapter';
import { useCanViewSummaryStats } from './hooks/useCanViewSummaryStats';

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

const DEFAULT_LEGEND_STATUSES = [
  calendarShiftStatusEnum.NOT_STARTED,
  calendarShiftStatusEnum.IN_PROGRESS,
  calendarShiftStatusEnum.COMPLETED,
  calendarShiftStatusEnum.UNASSIGNED,
  calendarShiftStatusEnum.SPLITTED_SHIFT,
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
  const showLegendFooter = isEmbeddedSchedule || isDayOrMonthView(calendarViewType);
  const footerVariant = getScheduleTabFooterVariant(activeScheduleTab);
  const footerData = mapFooterStatsToScheduleStatsFooter(footerStats, footerVariant);
  // Without coverage + KPI metrics the Overview footer collapses to a single legend row.
  const isTallFooter =
    footerVariant === SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW && canViewSummaryStats;
  const showStatsFooter = Boolean(footerVariant);
  const footerLayout = showLegendFooter
    ? FOOTER_LAYOUT.dayMonth
    : isTallFooter
      ? FOOTER_LAYOUT.overview
      : showStatsFooter
        ? FOOTER_LAYOUT.default
        : FOOTER_LAYOUT.none;

  const legendStatuses = selectedSite ? SITE_LEGEND_STATUSES : DEFAULT_LEGEND_STATUSES;

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
        onLoadingChange={setScheduleLoading}
        onStatusControlChange={setStatusControl}
      />
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
