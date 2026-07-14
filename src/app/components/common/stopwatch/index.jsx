import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  dayjsWithStandardOffset,
  getCurrentStandardTimeInIsoWrtTimezone,
} from 'src/app/obx/pages/schedules/helper';
const useStyles = makeStyles((theme) => ({
  clockStyle: {
    color: theme.palette.textBrand,
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '18px',
    letterSpacing: '-0.08px',
    textTransform: 'uppercase',
    borderRadius: '34px',
    background: theme.palette.surfaceBrandSubtle,
    padding: '2px 6px',
  },
}));
const Stopwatch = ({ startDate }) => {
  const classes = useStyles();

  const [timeState, setTimeState] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = dayjsWithStandardOffset(startDate);

    const updateTimer = () => {
      const now = dayjsWithStandardOffset(getCurrentStandardTimeInIsoWrtTimezone());
      // const diff = now.diff(start);

      const diffInMilliseconds = now - start;

      // Calculate hours, minutes, and seconds
      const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

      // Format with leading zeros if necessary
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

      setTimeState((prevState) => {
        return {
          ...prevState,
          hours: formattedHours,
          minutes: formattedMinutes,
          seconds: formattedSeconds,
        };
      });

      // setElapsedTime(`${hours}:${minutes}:${seconds}`);
    };

    // Start the timer and update every second
    const intervalId = setInterval(updateTimer, 1000);

    // Cleanup on component unmount
    return () => clearInterval(intervalId);
  }, [startDate]);

  return (
    <div>
      <Box className={classes.clockStyle}>
        <span>{timeState?.hours}</span>:<span>{timeState?.minutes}</span>:
        <span>{timeState?.seconds}</span>
      </Box>
    </div>
  );
};

Stopwatch.propTypes = {
  startDate: PropTypes.string,
  offsetTimestamp: PropTypes.string,
};

Stopwatch.defaultProps = {
  startDate: new Date(),
  offsetTimestamp: new Date(),
};

export default Stopwatch;
