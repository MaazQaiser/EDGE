import { Box, Chip, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from '../buildRoute.styles';
import { formatMinutesAsClock, formatMinutesAsDuration } from '../helper';

/**
 * The ordered route. Same-site visits arrive here already collapsed into one stop
 * carrying several jobs, so travel is only paid once for them.
 */
const RouteTimeline = ({
  stops = [],
  startLabel,
  endLabel,
  returnLegMinutes = 0,
  finishMinutes,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.timeline}>
      <Box className={classes.stopRow}>
        <Box className={classNames(classes.stopIndex, classes.stopIndexDone)}>▲</Box>
        <Box className={classes.stopBody}>
          <Typography className={classes.stopName}>{startLabel}</Typography>
          <Typography className={classes.stopMeta}>
            {t('obx.runsheet.buildRoute.routeStart')}
          </Typography>
        </Box>
      </Box>

      {stops.map((stop) => (
        <Box key={stop.siteId}>
          <Box className={classes.legRow}>
            <Typography className={classes.legText}>
              {t('obx.runsheet.buildRoute.drive', {
                time: formatMinutesAsDuration(stop.travelFromPrevious),
              })}
            </Typography>
          </Box>

          <Box className={classes.stopRow}>
            <Box
              className={classNames(classes.stopIndex, stop.isOverBudget && classes.stopIndexOver)}
            >
              {stop.order}
            </Box>

            <Box className={classes.stopBody}>
              <Box className={classes.candidateTopLine}>
                <Typography className={classes.stopName}>{stop.siteName}</Typography>
                {stop.visits.length > 1 && (
                  <Chip
                    className={classes.jobsBadge}
                    label={t('obx.runsheet.buildRoute.jobsAtStop', { count: stop.visits.length })}
                  />
                )}
              </Box>

              <Typography className={classes.stopMeta}>
                {stop.visits.map((visit) => visit.unit).join(' · ')} ·{' '}
                {formatMinutesAsDuration(stop.serviceMinutes)}
              </Typography>

              {stop.visits.some((visit) => visit.bucket === 'ahead') && (
                <Box className={classes.candidateSubLine}>
                  <Box component="span" className={classNames(classes.pill, classes.pillMoved)}>
                    {t('obx.runsheet.buildRoute.movedFrom', {
                      day: stop.visits.find((visit) => visit.bucket === 'ahead')?.scheduledFor,
                    })}
                  </Box>
                </Box>
              )}

              {stop.visits.some((visit) => visit.bucket === 'overdue') && (
                <Box className={classes.candidateSubLine}>
                  <Box component="span" className={classNames(classes.pill, classes.pillOverdue)}>
                    {t('obx.runsheet.buildRoute.catchUp')}
                  </Box>
                </Box>
              )}
            </Box>

            <Typography
              className={classNames(
                classes.stopArrival,
                stop.isOverBudget && classes.stopArrivalOver,
              )}
            >
              {formatMinutesAsClock(stop.arrivalMinutes)}
            </Typography>
          </Box>
        </Box>
      ))}

      {returnLegMinutes > 0 && (
        <>
          <Box className={classes.legRow}>
            <Typography className={classes.legText}>
              {t('obx.runsheet.buildRoute.drive', {
                time: formatMinutesAsDuration(returnLegMinutes),
              })}
            </Typography>
          </Box>

          <Box className={classes.stopRow}>
            <Box className={classNames(classes.stopIndex, classes.stopIndexDone)}>■</Box>
            <Box className={classes.stopBody}>
              <Typography className={classes.stopName}>{endLabel}</Typography>
              <Typography className={classes.stopMeta}>
                {t('obx.runsheet.buildRoute.routeEnd')}
              </Typography>
            </Box>
            <Typography className={classes.stopArrival}>
              {formatMinutesAsClock(finishMinutes)}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

RouteTimeline.propTypes = {
  stops: PropTypes.array,
  startLabel: PropTypes.string,
  endLabel: PropTypes.string,
  returnLegMinutes: PropTypes.number,
  finishMinutes: PropTypes.number,
};

export default RouteTimeline;
