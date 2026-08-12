import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { formatMinutesAsDuration } from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { useStyles } from '../harmonizeDrawer.styles';

/**
 * What did not fit, and where it goes instead.
 *
 * Deliberately a bucket and not a second plan: a date, a list, and the service
 * time being added. No map, no ordering, no meter — travel cannot be computed
 * without solving a second route, and solving a second route doubles this
 * drawer and then raises the same question about a third day.
 *
 * These visits land unassigned. We never routed them, so putting them on a
 * runsheet would imply an order and a technician that were never worked out.
 * The calendar's "awaiting a route" row is where they belong.
 */
const OverflowBucket = ({
  stops = [],
  day,
  targetDayLabel = '',
  dayOptions = [],
  onDayChange,
  onReturn,
  reason = '',
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  if (!stops.length) return null;

  const visitCount = stops.reduce((total, stop) => total + stop.visits.length, 0);
  const serviceMinutes = stops.reduce((total, stop) => total + stop.serviceMinutes, 0);

  return (
    <Box className={classes.overflow}>
      {/* Named for what it holds and where it is going, in that order. It used to
          be headed "DOESN'T FIT — 2 VISITS": an uppercase label naming only the
          failure, with no subject and no destination. When *nothing* fits this box
          holds the planner's entire selection, so that heading turned their own
          list into a rejection pile and left them asking where the list went. */}
      <Typography className={classes.overflowTitle}>
        {tt('overflowTitle', { count: visitCount, day: targetDayLabel })}
      </Typography>

      <Box className={classes.overflowList}>
        {stops.map((stop) => (
          <Box key={stop.siteId} className={classes.overflowRow}>
            <Typography className={classes.overflowSite}>{stop.siteName}</Typography>
            {stop.visits.length > 1 && (
              <Box className={classes.jobsBadge}>
                {tt('jobsAtStop', { count: stop.visits.length })}
              </Box>
            )}
            <Box className={classes.grow} />
            <button
              type="button"
              className={classes.linkButton}
              onClick={() => onReturn?.(stop.siteId)}
            >
              {tt('bringBack')}
            </button>
          </Box>
        ))}
      </Box>

      {/* The day picker reads as the end of a sentence rather than as a filter
          floating beside a heading — it is the one decision this box asks for. */}
      <Box className={classes.overflowMove}>
        <Typography className={classes.overflowMoveLabel}>{tt('overflowMoveLabel')}</Typography>
        <Box className={classes.overflowDay}>
          <CustomDropDown
            name="harmonizeOverflowDay"
            options={dayOptions}
            selectedValues={
              dayOptions.find((option) => option.value === day) || {
                value: '',
                label: tt('overflowDayLabel'),
              }
            }
            handleChange={(event) => onDayChange(event?.target?.value)}
            placeHolder={tt('overflowDayLabel')}
            maxWidth="100%"
            className={classes.dropdown}
            bordered
          />
        </Box>
      </Box>

      {/* The consequence, promoted. "Lands unassigned — someone still needs to
          route it" was the most important line in the box and the quietest. */}
      <Typography className={classes.overflowFooter}>
        {tt('overflowFooter', {
          time: formatMinutesAsDuration(serviceMinutes),
        })}
      </Typography>

      {/* Why nothing fit, and what else to try. It used to float above the box as
          loose orange text, which read as a separate warning about something else —
          when in fact it is the explanation for exactly this list. Inside, and last,
          because it answers "why" after the box has said what and what next. */}
      {reason ? <Typography className={classes.overflowReason}>{reason}</Typography> : null}
    </Box>
  );
};

OverflowBucket.propTypes = {
  stops: PropTypes.array,
  day: PropTypes.string,
  targetDayLabel: PropTypes.string,
  dayOptions: PropTypes.array,
  onDayChange: PropTypes.func.isRequired,
  onReturn: PropTypes.func,
  reason: PropTypes.string,
};

export default OverflowBucket;
