import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';

import { formatCompact } from '../model/durations';
import VisitScopeList from './VisitScopeList';

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
 * ## Config A is neither shown nor reachable from here any more
 *
 * The worked days, their zones and their shift hours are **Config A** — the franchise's
 * standing answer, set in Settings. ① used to *state* them in a Day / Zone / Shift table
 * and link to them with a `Configuration` gear on the `Scope` heading. **Both were removed
 * on instruction.** The run still reads Config A — the `shift hours` denominator in the
 * stat row is summed from the worked days — it simply no longer displays it, and offers no
 * way to go and change it. See the comment on the heading for what that costs.
 *
 * ## The summary, then the work
 *
 * ① is two answers. The stat row is the **summary** — what the run adds up to. Under it,
 * `VisitScopeList` is the **detail**: every visit in the pool, its target and its filter
 * count, with a box the planner can clear to take it out of this run.
 *
 * That pairing is why the figures above are computed from the *selection* and not from the
 * fixture (see `forecast` in `useHarmonizeFlow`). Clearing three boxes drops the visit
 * count, the filter count and the estimated hours in the same gesture, so the summary is
 * always a summary of the list under it. Before this, ① summarised fifteen visits it never
 * showed, and half the panel's height was empty below the table.
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
 * The three figures are `planRange` run dry, which finishes in well under a
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
const ScopeState = ({
  classes,
  days,
  range,
  forecast,
  visits,
  excluded,
  onRangeChange,
  onToggleVisit,
}) => {
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
        {/* **No action on this heading any more.** `Configuration` — the gear that opened
            Config A in Settings — was removed on instruction. Worth knowing what went with
            it: this drawer no longer offers *any* route to the screen that decides the
            worked days, their zones and their hours, and the tray's own `Give Zone X a
            working day in settings` button had already been removed on the argument that
            ①'s link was the one to keep. So a planner who reads `Zone West is not worked`
            now has nowhere in the flow to go and fix it. Accepted on instruction; this is
            the note to read if that turns out to matter. */}
        <Box className={classes.sectionHead}>
          <Typography component="h3" className={classes.sectionHeading}>
            {tt('scope')}
          </Typography>
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

            {/* **The Day / Zone / Shift table is gone**, on instruction — with it the
                skeleton rows above, `colDay`/`colZone`/`colShift`, and ①'s only statement
                of what Config A actually says. The three figures remain, and the `work /
                shift hours` denominator is still computed from the worked days, so the
                *hours* the run has are still on screen even though the days that supply
                them are not.

                `noWorkedDays` is kept and promoted to stand on its own. It is the one thing
                the table said that a planner cannot get anywhere else in the drawer: with no
                worked days there is nothing to harmonize onto and the footer's button is
                closed, so without this line ① would be three zeros and a dead button. */}
            {worked.length ? null : (
              <Typography className={classes.hint}>{tt('noWorkedDays')}</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Held back behind the same skeleton as the figures, though nothing in it is
          computed — it is the fixture, available on the first frame. ① reveals as one
          panel or it reveals as two, and a real list under a skeletonised summary reads
          as the summary having failed to load rather than as a deliberate stagger. */}
      {settling ? null : (
        <VisitScopeList
          classes={classes}
          visits={visits}
          excluded={excluded}
          onToggle={onToggleVisit}
        />
      )}
    </Box>
  );
};

ScopeState.propTypes = {
  classes: PropTypes.object.isRequired,
  days: PropTypes.array.isRequired,
  range: PropTypes.object.isRequired,
  forecast: PropTypes.object.isRequired,
  /** The whole pool. `forecast` describes the *selection* — this is what it is a subset of. */
  visits: PropTypes.array.isRequired,
  excluded: PropTypes.array.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  onToggleVisit: PropTypes.func.isRequired,
};

export default ScopeState;
