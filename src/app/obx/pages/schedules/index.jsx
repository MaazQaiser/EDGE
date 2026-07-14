import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import Calendar from './calendar';
import ScheduleIndicators from './components/scheduleIndicators';
import ScheduleStatusIcons from './components/scheduleStatusIcons';

const useStyles = makeStyles((theme) => ({
  scheduleFooter: {
    position: 'absolute',
    bottom: 0,
    left: '0',
    right: '0',
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
  calendarMainWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
}));
export default function Schedules({ selectedSite, officerId, className }) {
  const statuses = selectedSite
    ? [
        calendarShiftStatusEnum.IN_PROGRESS,
        calendarShiftStatusEnum.NOT_STARTED,
        calendarShiftStatusEnum.COMPLETED,
        calendarShiftStatusEnum.INCOMPLETE,
        calendarShiftStatusEnum.MISSED,
        calendarShiftStatusEnum.CANCELLED,
        calendarShiftStatusEnum.UNASSIGNED,
        calendarShiftStatusEnum.SPLITTED_SHIFT,
      ]
    : [
        calendarShiftStatusEnum.NOT_STARTED,
        calendarShiftStatusEnum.IN_PROGRESS,
        calendarShiftStatusEnum.COMPLETED,
        calendarShiftStatusEnum.UNASSIGNED,
        calendarShiftStatusEnum.SPLITTED_SHIFT,
      ];
  const classes = useStyles();
  return (
    <Box className={classes.calendarMainWrapper}>
      <Calendar className={className} selectedSite={selectedSite} officerId={officerId} />
      <Box className={classes.scheduleFooter}>
        <ScheduleIndicators />
        <ScheduleStatusIcons statuses={statuses} />
      </Box>
    </Box>
  );
}

Schedules.propTypes = {
  selectedSite: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  officerId: PropTypes.number,
  className: PropTypes.string,
};
