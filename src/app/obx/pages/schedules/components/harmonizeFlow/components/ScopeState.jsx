import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';

import { formatCompact } from '../model/durations';
import { zoneName } from '../model/fixtures';
import { GearIcon } from './Glyphs';

/** How long the skeleton holds before the real numbers reveal. */
const SETTLE_MS = 420;

/**
 * ① — the drawer opens on **scope**, and scope is one question: *which dates?*
 *
 * ## Two sections, and they are labelled by what they are
 *
 * `Range` is a **field label** and `Scope` is a section heading — a heading over a single
 * input is not what this app does anywhere, so the label follows the system and the gap
 * under the field carries the separation.
 *
 * ## Why the days and the zones are not editable here
 *
 * They are **Config A** — the franchise's standing answer to which days it works and which
 * zone each one covers — and Config A is set in Settings. Asking again at the top of every
 * run made this a second place to answer the same question, and a second place for the
 * answer to be wrong. So the run *reads* them and this screen *states* them, and
 * `Configuration` — with the same gear a planner already knows from Settings — rides the
 * `Scope` heading rather than sitting under the table it applies to.
 *
 * ## What this screen no longer says
 *
 * Two things were removed on review rather than added:
 *
 * - **The forecast notes.** ① used to run the real planner dry and print *"Zone West is
 *   not worked — 2 visits will have no legal day"* and *"Mon 17 has more work than
 *   hours…"* before the planner had pressed anything. Accurate, and the wrong place for
 *   it: both facts are what ③'s Not-placed tab and overspill tray already exist to state,
 *   with a remedy attached, at the moment a planner can act on them. Printing them again
 *   here — in red, ahead of a button that says `Harmonize` — read as two warnings blocking
 *   a scope screen from doing the one thing it does.
 * - **The amber mark on a short day.** The table quoted Config A; it is not the place to
 *   grade it. A day that cannot hold its own work is still true whether or not this screen
 *   colours it, and the colour bought a second airing of a fact ③ already owns.
 *
 * `forecast` still carries every one of these numbers — nothing downstream changed — this
 * screen simply stopped being the one that narrates them.
 *
 * ## Loading, on open and on every range change
 *
 * The three figures and the table are `planRange` run dry, which finishes in well under a
 * millisecond — so without help this panel never *looks* like it computed anything, on the
 * very screen that exists to predict a real run. A short skeleton, held for `SETTLE_MS`,
 * is the honest amount of theatre for an instant answer: long enough to read as "working
 * this out", short enough that the range picker never feels laggy. It reruns on every
 * `range` change for the same reason — a new range is a new question, and swapping the
 * numbers under a planner's eye with no transition at all reads as though nothing moved.
 *
 * `prefersReducedMotion()` skips the delay outright rather than shortening it: the
 * skeleton is scenery, and a reader who has turned motion off wants the numbers on the
 * first frame, not a briefer version of a wait they did not ask to see.
 */
const ScopeState = ({ classes, days, range, forecast, onOpenSettings, onRangeChange }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const worked = days.filter((d) => d.worked);

  const [settling, setSettling] = useState(!prefersReducedMotion());
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (prefersReducedMotion()) {
      setSettling(false);
      return undefined;
    }
    setSettling(true);
    timer.current = setTimeout(() => setSettling(false), SETTLE_MS);
    return () => clearTimeout(timer.current);
  }, [range.from, range.to]);

  /* Counts first, then the ratio that decides. Filters lead the pair of counts — the cost
     model is `10 + 20 × filters`, so filters are what the hours are made of — and the work
     figure is the plain ratio `formatCompact` already gives everywhere else in this drawer
     (§14.4), with the label underneath naming both halves of it rather than the value
     trying to spell that out inline. */
  const stats = [
    { key: 'visits', value: String(forecast.visitCount) },
    { key: 'filters', value: String(forecast.filterCount) },
    {
      key: 'work',
      value: `${formatCompact(forecast.workMins)} / ${formatCompact(forecast.availableMins)}`,
      /* The pool alone exceeds the shifts, before a mile is driven. Amber ink on the
         figure — not a dot, not a repeated sentence — is what is left of that warning
         after the forecast notes were removed: the fact still marks itself, once. */
      warn: forecast.workMins > forecast.availableMins,
    },
  ];

  return (
    <Box>
      <Box className={classes.rangeSection}>
        <Typography component="span" className={classes.fieldLabel}>
          {tt('range')}
        </Typography>
        <DateRangePicker
          selectedDates={[dayjs(range.from), dayjs(range.to)]}
          setDates={([from, to]) => onRangeChange(from, to)}
          format="MM/DD/YYYY"
          styleClass={classes.rangePicker}
          syncSelectedDatesOnStateChange
        />
      </Box>

      <Box className={classes.section}>
        {/* The heading carries its own action, which is where a reader looks for one — not
            at the foot of the list it applies to. */}
        <Box className={classes.sectionHead}>
          <Typography component="h3" className={classes.sectionHeading}>
            {tt('scope')}
          </Typography>
          <Button
            disableRipple
            variant="onlyText"
            className={classes.sectionAction}
            onClick={onOpenSettings}
          >
            <GearIcon className={classes.sectionActionIcon} />
            {tt('configuration')}
          </Button>
        </Box>

        {settling ? (
          <Box aria-hidden="true">
            <Box className={classes.statRow}>
              {stats.map((stat) => (
                <Box className={classes.stat} key={stat.key}>
                  <Box className={classNames(classes.skeletonBar, classes.skeletonStatValue)} />
                  <Box className={classNames(classes.skeletonBar, classes.skeletonStatLabel)} />
                </Box>
              ))}
            </Box>
            {(worked.length ? worked : [0, 1]).map((day, index) => (
              <Box className={classes.dayRow} key={day.date || index}>
                <Box className={classNames(classes.skeletonBar, classes.skeletonDayName)} />
                <Box className={classNames(classes.skeletonBar, classes.skeletonDayZone)} />
                <Box className={classNames(classes.skeletonBar, classes.skeletonDayShift)} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            className={classes.scopeReveal}
            /* Live, but not `assertive`: the numbers replacing a skeleton are useful to
               hear and not urgent enough to interrupt anything. */
            role="status"
            aria-live="polite"
          >
            <Box className={classes.statRow}>
              {stats.map((stat) => (
                <Box className={classes.stat} key={stat.key}>
                  <Typography
                    className={classNames(classes.statValue, stat.warn && classes.statValueWarn)}
                  >
                    {stat.value}
                  </Typography>
                  <Typography className={classes.statLabel}>{tt(`stat.${stat.key}`)}</Typography>
                </Box>
              ))}
            </Box>

            {worked.length ? (
              <Box className={classes.dayTable} role="table">
                <Box className={classes.dayHeadRow} role="row">
                  <Typography className={classes.dayHeadCell} role="columnheader">
                    {tt('colDay')}
                  </Typography>
                  <Typography className={classes.dayHeadCell} role="columnheader">
                    {tt('colZone')}
                  </Typography>
                  <Typography className={classes.dayHeadNum} role="columnheader">
                    {tt('colShift')}
                  </Typography>
                </Box>

                {worked.map((day) => (
                  <Box className={classes.dayRow} role="row" key={day.date}>
                    <Typography className={classes.dayName} role="cell">
                      {dayjs(day.date).format('ddd D MMM')}
                    </Typography>
                    <Typography className={classes.dayZone} role="cell">
                      {zoneName(day.zoneId)}
                    </Typography>
                    <Typography className={classes.dayShift} role="cell">
                      {formatCompact(day.shiftMins)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography className={classes.hint}>{tt('noWorkedDays')}</Typography>
            )}
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
  onRangeChange: PropTypes.func.isRequired,
};

export default ScopeState;
