import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatMinutesAsDuration,
  MAN_DAY_MINUTES,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonizeDrawer.styles';

/**
 * The answer, as a bar.
 *
 * Work already on the runsheet is drawn as its own segment rather than being
 * subtracted from the budget, because "no room" is only useful if you can see
 * what is taking the room. Switching the merge target back to a new runsheet
 * empties that segment in front of the planner, which is the whole reason the
 * merge control sits directly underneath.
 *
 * Travel shimmers until the directions layer answers. Nothing else waits —
 * service time is known the moment the visits are selected, so the hole in the
 * bar is doing the work a spinner would otherwise do badly.
 */
const DayMeter = ({
  existingMinutes = 0,
  serviceMinutes = 0,
  travelMinutes = 0,
  pendingTravel = false,
  estimated = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  const totalMinutes = existingMinutes + serviceMinutes + travelMinutes;
  const scaleMinutes = Math.max(MAN_DAY_MINUTES, totalMinutes);
  const overflowMinutes = Math.max(0, totalMinutes - MAN_DAY_MINUTES);
  const isOver = overflowMinutes > 0;

  /* Segments are drawn against the whole man-day, so an over-budget day widens
     the scale rather than clipping — the bar never lies by running out of room. */
  const travelShown = pendingTravel ? Math.max(travelMinutes, 20) : travelMinutes;

  const segment = (minutes) => ({
    width: `${Math.max(0, (minutes / scaleMinutes) * 100)}%`,
  });

  return (
    <Box className={classes.meter}>
      <Box className={classes.meterTopLine}>
        <Typography className={classes.meterTotal}>
          {formatMinutesAsDuration(totalMinutes)}
        </Typography>
        <Typography className={classes.meterOf}>
          {tt('ofBudget', { budget: formatMinutesAsDuration(MAN_DAY_MINUTES) })}
        </Typography>
        {estimated && <Box className={classes.estimatedPill}>{tt('estimated')}</Box>}
        <Box className={classes.grow} />
        <Typography
          className={classNames(classes.meterRemaining, isOver && classes.meterRemainingOver)}
        >
          {isOver
            ? tt('overBy', { time: formatMinutesAsDuration(overflowMinutes) })
            : tt('remaining', { time: formatMinutesAsDuration(MAN_DAY_MINUTES - totalMinutes) })}
        </Typography>
      </Box>

      <Box className={classes.meterTrack}>
        {existingMinutes > 0 && (
          <Box
            className={classNames(classes.meterSegment, classes.meterExisting)}
            style={segment(existingMinutes)}
          />
        )}
        <Box
          className={classNames(classes.meterSegment, classes.meterService)}
          style={segment(serviceMinutes)}
        />
        <Box
          className={classNames(
            classes.meterSegment,
            classes.meterTravel,
            pendingTravel && classes.meterPending,
          )}
          style={segment(travelShown)}
        />
        {isOver && (
          <Box
            className={classNames(classes.meterSegment, classes.meterOverflow)}
            style={segment(overflowMinutes)}
          />
        )}
      </Box>

      <Box className={classes.meterLegend}>
        {existingMinutes > 0 && (
          <Box className={classes.legendItem}>
            <Box className={classNames(classes.swatch, classes.swatchExisting)} />
            <Typography className={classes.legendText}>
              {tt('alreadyOnRoute', { time: formatMinutesAsDuration(existingMinutes) })}
            </Typography>
          </Box>
        )}
        <Box className={classes.legendItem}>
          <Box className={classNames(classes.swatch, classes.swatchService)} />
          <Typography className={classes.legendText}>
            {tt('onSite', { time: formatMinutesAsDuration(serviceMinutes) })}
          </Typography>
        </Box>
        <Box className={classes.legendItem}>
          <Box className={classNames(classes.swatch, classes.swatchTravel)} />
          <Typography className={classes.legendText}>
            {pendingTravel
              ? tt('drivingPending')
              : tt('driving', { time: formatMinutesAsDuration(travelMinutes) })}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

DayMeter.propTypes = {
  existingMinutes: PropTypes.number,
  serviceMinutes: PropTypes.number,
  travelMinutes: PropTypes.number,
  pendingTravel: PropTypes.bool,
  estimated: PropTypes.bool,
};

export default DayMeter;
