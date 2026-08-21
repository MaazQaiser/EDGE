import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatCompact } from '../model/durations';
import { zoneName } from '../model/fixtures';

/**
 * `West`, `West and North`, `West, North and South`.
 *
 * A bare `join(', ')` produced "Zone West, North is not worked this week" — a list where
 * the sentence expects a subject. Serial comma deliberately absent before the
 * conjunction, matching `formatDayList` in the sibling feature.
 */
const joinZones = (names) => {
  if (names.length < 2) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
};
import { ChevronLeft, ChevronRight } from './Glyphs';

/**
 * ① — the drawer opens on **scope**, and scope is one question: *which weeks of work?*
 *
 * ## Why the days and the zones are not here
 *
 * They used to be: seven rows, each with a shift stepper and a zone select. They are
 * gone because they are **Config A** — the franchise's standing answer to *which days do
 * we work and which zone does each one cover* — and Config A is asked for in Settings.
 * Asking again at the top of every run made this screen a second place to answer the
 * same question, and a second place for the answer to be wrong: a planner who set a zone
 * here and a different one in Settings had no way to know which the next run would use.
 *
 * So the run **reads** them, and this screen **states** them. The read-out below is not a
 * shrunken version of the controls; it is a different thing — the standing rule, quoted,
 * with a route to where it is actually changed. That is the Config A / Config B line
 * drawn in the interface instead of only in a document, and it is what the subtitle's
 * *"changes here apply to this run only"* is now telling the truth about, because the
 * only change available here is the range.
 *
 * §14.5's prediction stays, and matters more now than it did: with the days no longer
 * editable on this screen, "Zone West is not worked" has to carry the planner all the way
 * to Settings, so it names the consequence in hours rather than reporting a ratio.
 */
const ScopeState = ({ classes, days, range, forecast, onOpenSettings, onShiftRange }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const worked = days.filter((d) => d.worked);

  return (
    <Box>
      <Box className={classes.section}>
        <Typography component="span" className={classes.fieldLabel}>
          {tt('range')}
        </Typography>
        <Box className={classes.rangeRow}>
          <Box
            component="button"
            type="button"
            className={classes.rangeStep}
            aria-label={tt('previousWeek')}
            onClick={() => onShiftRange(-7)}
          >
            <ChevronLeft />
          </Box>
          <Typography className={classes.rangeValue}>
            {dayjs(range.from).format('MMM D')} – {dayjs(range.to).format('MMM D, YYYY')}
          </Typography>
          <Box
            component="button"
            type="button"
            className={classes.rangeStep}
            aria-label={tt('nextWeek')}
            onClick={() => onShiftRange(7)}
          >
            <ChevronRight />
          </Box>
        </Box>
        <Typography className={classes.hint}>
          {tt('rangeHint', {
            days: tt('count.day', { count: dayjs(range.to).diff(dayjs(range.from), 'day') + 1 }),
          })}
        </Typography>
      </Box>

      <Box className={classes.section}>
        <Typography component="span" className={classes.fieldLabel}>
          {tt('fromSettingsLabel')}
        </Typography>
        <Box className={classes.fromSettings}>
          {worked.length ? (
            worked.map((day) => (
              <Box className={classes.fromSettingsRow} key={day.date}>
                <Typography className={classes.fromSettingsDay}>
                  {dayjs(day.date).format('ddd D MMM')}
                </Typography>
                <Typography className={classes.fromSettingsZone}>
                  {tt('zoneAndShift', {
                    zone: zoneName(day.zoneId),
                    shift: formatCompact(day.shiftMins),
                  })}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography className={classes.forecastBody}>{tt('noWorkedDays')}</Typography>
          )}
          <Box
            component="button"
            type="button"
            className={classes.settingsLink}
            onClick={onOpenSettings}
          >
            {tt('changeInSettings')}
          </Box>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Typography component="span" className={classes.fieldLabel}>
          {tt('inScope')}
        </Typography>
        <Typography className={classes.forecastBody}>
          {tt('scopeSummary', {
            visits: tt('count.visit', { count: forecast.visitCount }),
            filters: tt('count.filter', { count: forecast.filterCount }),
            work: formatCompact(forecast.workMins),
          })}
        </Typography>
        <Typography className={classes.hint}>{tt('scopePool')}</Typography>

        {forecast.unplacedCount ? (
          <Box className={classes.forecast}>
            <Typography className={classes.forecastTitle}>
              {/* Pluralised on the zone count: joined into "Zone West, North is not worked"
                  it was ungrammatical the moment a second zone appeared. */}
              {tt('forecastTitle', {
                count: forecast.unplacedZones.length,
                zones: joinZones(forecast.unplacedZones.map(zoneName)),
              })}
            </Typography>
            <Typography className={classes.forecastBody}>
              {tt('forecastBody', {
                visits: tt('count.visit', { count: forecast.unplacedCount }),
                work: formatCompact(forecast.unplacedMins),
              })}
            </Typography>
          </Box>
        ) : (
          <Box className={classNames(classes.forecast, classes.forecastOk)}>
            <Typography className={classes.forecastTitle}>{tt('forecastOkTitle')}</Typography>
            <Typography className={classes.forecastBody}>{tt('forecastOkBody')}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

ScopeState.propTypes = {
  classes: PropTypes.object.isRequired,
  days: PropTypes.array.isRequired,
  range: PropTypes.object.isRequired,
  forecast: PropTypes.object.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onShiftRange: PropTypes.func.isRequired,
};

export default ScopeState;
