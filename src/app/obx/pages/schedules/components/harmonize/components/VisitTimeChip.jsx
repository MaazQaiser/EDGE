import { Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FILTER_MINUTES,
  formatMinutesAsClock,
  formatMinutesAsDuration,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonize.styles';

/**
 * How long a stop takes — one number, with the arithmetic one hover away.
 *
 * The estimate is filters × 20 minutes, and every part of that is real: the
 * filter count comes from the site, the 20 minutes is the model, the drive leg
 * comes from the route. Putting all of it on the row would be four figures per
 * stop and a stop list nobody reads; hiding it entirely would be an estimate the
 * planner has to take on faith. So the row carries the total and the tooltip
 * carries the working.
 *
 * The number itself is deliberately quiet — it is not the *decision*, it is the
 * input to the day meter, which is where the decision lives.
 */
const VisitTimeChip = ({
  filterCount = 0,
  serviceMinutes = 0,
  visitCount = 1,
  travelFromPrevious = null,
  arrivalMinutes = null,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  /* A stop can hold several visits at one site, and then the filter count is the
     sum. Falling back to the service time keeps the chip honest when a visit
     arrived without a count rather than inventing one. */
  const filters = Number(filterCount) || 0;

  const tooltip = (
    <Box className={classes.timeTooltip}>
      <Typography className={classes.timeTooltipTitle}>
        {tt('timeOnSite', { time: formatMinutesAsDuration(serviceMinutes) })}
      </Typography>
      {filters > 0 ? (
        <Typography className={classes.timeTooltipRow}>
          {tt('timeFilters', { count: filters, minutes: FILTER_MINUTES })}
        </Typography>
      ) : null}
      {visitCount > 1 ? (
        <Typography className={classes.timeTooltipRow}>
          {tt('timeVisitsAtSite', { count: visitCount })}
        </Typography>
      ) : null}
      {travelFromPrevious != null ? (
        <Typography className={classes.timeTooltipRow}>
          {tt('timeDrive', { time: formatMinutesAsDuration(travelFromPrevious) })}
        </Typography>
      ) : null}
      {arrivalMinutes != null ? (
        <Typography className={classes.timeTooltipRow}>
          {tt('timeArrive', { time: formatMinutesAsClock(arrivalMinutes) })}
        </Typography>
      ) : null}
    </Box>
  );

  return (
    <Tooltip arrow placement="top" title={tooltip}>
      {/* A span, not the Typography itself: MUI's Tooltip needs a child that can
          hold a ref, and it needs one element — §7.12 in the handoff. */}
      <Box component="span" className={classes.timeChip}>
        <Typography component="span" className={classes.timeChipText}>
          {formatMinutesAsDuration(serviceMinutes)}
        </Typography>
        <Box component="span" className={classes.timeChipMark} aria-hidden="true">
          ⓘ
        </Box>
      </Box>
    </Tooltip>
  );
};

VisitTimeChip.propTypes = {
  filterCount: PropTypes.number,
  serviceMinutes: PropTypes.number,
  visitCount: PropTypes.number,
  travelFromPrevious: PropTypes.number,
  arrivalMinutes: PropTypes.number,
};

export default VisitTimeChip;
