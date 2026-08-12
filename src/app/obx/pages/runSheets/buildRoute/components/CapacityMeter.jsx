import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../buildRoute.styles';
import { formatMinutesAsDuration, MAN_DAY_MINUTES } from '../helper';

/**
 * The man-day as a bar you fill rather than a count you tick. Service and travel
 * are drawn separately because a distant visit costing an hour of driving should
 * look different from an hour spent on site.
 */
const CapacityMeter = ({ serviceMinutes = 0, travelMinutes = 0, totalMinutes = 0, children }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // The bar is scaled to whichever is larger: the man-day, or the day we've built.
  const scaleMinutes = Math.max(MAN_DAY_MINUTES, totalMinutes);
  const overflowMinutes = Math.max(0, totalMinutes - MAN_DAY_MINUTES);
  const withinBudget = totalMinutes - overflowMinutes;

  // Travel and service share the in-budget portion proportionally.
  const inBudgetService = totalMinutes ? (serviceMinutes / totalMinutes) * withinBudget : 0;
  const inBudgetTravel = Math.max(0, withinBudget - inBudgetService);

  const percent = (minutes) => `${(minutes / scaleMinutes) * 100}%`;
  const isOver = overflowMinutes > 0;

  return (
    <Box className={classes.meterBar}>
      <Box className={classes.meterMain}>
        <Box className={classes.meterTopLine}>
          <Typography className={classes.meterTitle}>
            {t('obx.runsheet.buildRoute.manDay')}
          </Typography>
          <Typography className={classes.meterTotal}>
            {formatMinutesAsDuration(totalMinutes)}
          </Typography>
          <Typography className={classes.meterTitle}>
            {t('obx.runsheet.buildRoute.ofBudget', {
              budget: formatMinutesAsDuration(MAN_DAY_MINUTES),
            })}
          </Typography>
          <Typography
            className={classNames(classes.meterRemaining, isOver && classes.meterRemainingOver)}
          >
            {isOver
              ? t('obx.runsheet.buildRoute.overBy', {
                  time: formatMinutesAsDuration(overflowMinutes),
                })
              : t('obx.runsheet.buildRoute.remaining', {
                  time: formatMinutesAsDuration(MAN_DAY_MINUTES - totalMinutes),
                })}
          </Typography>
        </Box>

        <Box className={classes.meterTrack}>
          <Box className={classes.meterService} style={{ width: percent(inBudgetService) }} />
          <Box className={classes.meterTravel} style={{ width: percent(inBudgetTravel) }} />
          {isOver && (
            <Box className={classes.meterOverflow} style={{ width: percent(overflowMinutes) }} />
          )}
        </Box>

        <Box className={classes.meterLegend}>
          <Box className={classes.legendItem}>
            <Box className={classNames(classes.legendSwatch, classes.legendSwatchService)} />
            <Typography className={classes.legendText}>
              {t('obx.runsheet.buildRoute.serviceTime', {
                time: formatMinutesAsDuration(serviceMinutes),
              })}
            </Typography>
          </Box>
          <Box className={classes.legendItem}>
            <Box className={classNames(classes.legendSwatch, classes.legendSwatchTravel)} />
            <Typography className={classes.legendText}>
              {t('obx.runsheet.buildRoute.travelTime', {
                time: formatMinutesAsDuration(travelMinutes),
              })}
            </Typography>
          </Box>
          {isOver && (
            <Box className={classes.legendItem}>
              <Box className={classNames(classes.legendSwatch, classes.legendSwatchOverflow)} />
              <Typography className={classes.legendText}>
                {t('obx.runsheet.buildRoute.overflow')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box className={classes.meterActions}>{children}</Box>
    </Box>
  );
};

CapacityMeter.propTypes = {
  serviceMinutes: PropTypes.number,
  travelMinutes: PropTypes.number,
  totalMinutes: PropTypes.number,
  children: PropTypes.node,
};

export default CapacityMeter;
