import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from 'src/app/components/common/RangeDatepicker';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';
import { formatCompact } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/durations';

/** How long the skeleton holds before the real numbers reveal. The drawer's own figure. */
const SETTLE_MS = 420;

/**
 * ① — the dates, and what they scope.
 *
 * ## What is different from the drawer's own ①
 *
 * **It asks the question and stops.** The drawer's ① also prints a Day / Zone / Shift
 * table, and this shell had that as a row of pills for a while — until the pills and the
 * day tabs below them turned out to be two indexes for the same three dates. The tabs won
 * (`DayTabRow`), the zone and the shift went with them into the route header, and what is
 * left here is the range, the three figures it produces, and the press.
 *
 * ## And this panel does not leave
 *
 * The drawer replaces ① with ③ because it has one pane. This shell keeps ① on screen for
 * the whole flow, which turns "the answer is wrong, widen the range" from a trip backwards
 * into an edit: change the dates, watch the figures and the map change, press Harmonize
 * again. It is also why there is no `Back to scope` button anywhere in this shell — there
 * is nothing to go back to.
 *
 * There is no fold control on it either — see the note on that below.
 *
 * The skeleton is the drawer's, unchanged, and for its reason: `planRange` run dry
 * finishes in well under a millisecond, so without a short hold the one screen that exists
 * to predict a run never looks like it computed anything. `prefersReducedMotion` skips it
 * outright rather than shortening it.
 */
const ScopePanel = ({ classes, range, forecast, onRangeChange, quiet }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeSplit.${key}`, options);

  /**
   * **The picker's value, memoised on the two strings — and this is load-bearing, not tidy.**
   *
   * `DateRangePicker` under `syncSelectedDatesOnStateChange` runs two effects that form a
   * cycle: one watches `[selectedDates]` and copies it into its own state, the other
   * watches that state and calls `setDates` back out. Handed a freshly built
   * `[dayjs(from), dayjs(to)]` the cycle never closes — the array is a new identity every
   * render and the dayjs objects inside it are too, so React cannot bail out of either
   * update, and each turn of the loop calls `onRangeChange`, which replaces `range`, which
   * renders again. Measured at ~3,500 renders per second, with the ② narration pinned at
   * its first line because the reveal effect was being torn down and restarted faster than
   * its own 870ms timer could fire.
   *
   * **The drawer has the same call and does not show it**, which is the only reason this
   * has survived: its ① is unmounted the moment Harmonize is pressed, so the loop stops
   * before anything time-dependent is on screen. This shell keeps ① mounted for the whole
   * flow — that is the point of it — so the loop had nowhere to end.
   *
   * Memoising on `range.from`/`range.to` (plain `YYYY-MM-DD` strings) means the identity
   * only moves when the dates actually do, which closes the cycle at the first effect.
   *
   * The picker itself should compare by value rather than by identity so no caller can
   * reach this; that is a change to a component a dozen screens share and is worth making
   * deliberately rather than as a side effect of building this one.
   */
  const pickerDates = useMemo(() => [dayjs(range.from), dayjs(range.to)], [range.from, range.to]);

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

  /**
   * The forecast — **the drawer's own three figures, and the bar is gone.**
   *
   * ## This reverses the two-counts-and-a-meter pass
   *
   * That pass split these into `15 visits · 57 filters` on one line and `21h 30m` over a 4px
   * capacity bar on the next, on the argument that the ratio is not a third statistic but a
   * *comparison* — the only one of the three that can come out wrong, and the reason a planner
   * reads the panel at all. The argument still looks right to me and it is overruled on
   * instruction: *"the hour meter in the top grey summary box. It should be the same component
   * as in the side drawer."*
   *
   * So this is `ScopeState`'s stat row again, and **literally** so rather than by resemblance —
   * `index.jsx` hands this panel `statRow`/`stat`/`statValue`/`statLabel` off
   * `harmonizeFlow.styles.js`, so the two shells cannot drift by a pixel. The only thing Split
   * still owns here is the grey `scopeBox` around them.
   *
   * `statOfShift` and the whole `statBar*` family are deleted rather than left dormant.
   *
   * Counts first, then the ratio that decides. Filters lead the pair of counts — the cost model
   * is `10 + 20 × filters`, so filters are what the hours are made of — and the work figure is
   * the plain ratio this feature quotes everywhere else, with the label underneath naming both
   * halves rather than the value trying to spell it out inline.
   */
  const stats = [
    { key: 'visits', value: String(forecast.visitCount) },
    { key: 'filters', value: String(forecast.filterCount) },
    {
      key: 'work',
      value: `${formatCompact(forecast.workMins)} / ${formatCompact(forecast.availableMins)}`,
      /* The pool exceeds the shifts before a mile is driven. Amber ink on the figure, once. */
      warn: forecast.workMins > forecast.availableMins,
    },
  ];

  /**
   * **① does not fold, and there is no control that folds it.**
   *
   * There was a `Hide` button on the `Scope` heading and a `15 Aug – 21 Aug ▾` chip it
   * collapsed to. Removed on instruction, and the history is worth keeping because it is
   * the second time this idea has been cut back rather than the first.
   *
   * It began as an *automatic* fold on the Harmonize press, on the arithmetic that ①'s
   * 144px is charged against the route once there is a route to read. That was reversed
   * because the fold moved everything below it — the tab row, the route title, the figure,
   * the gauge — at the exact moment the planner pressed the button, which contradicts the
   * whole reason `RoutePreview` draws the header early. What survived was the manual
   * button: the same 144px, on request.
   *
   * That is what has now gone too, and the case against it is that nobody was ever going
   * to press it. The panel it hides is two controls and three figures, all of which stay
   * useful at ③ — the range is what a planner edits when the answer is wrong, and the
   * figures are the denominator for everything below. A control whose only job is to hide
   * a live part of the screen is a control that has to be explained, and it was sitting on
   * the `Scope` heading between the heading and `Configuration`, making a three-item row
   * out of a two-item one.
   *
   * **If height ever genuinely runs short, the answer is not this button.** It is that the
   * column is scrollable above the plan region, or that the figures earn their space
   * better — not a manual toggle whose cost is a permanent extra control.
   */

  return (
    <Box className={classNames(classes.scopeSection, quiet && classes.scopeSectionQuiet)}>
      <Box className={classes.rangeRow}>
        <Typography component="span" className={classes.fieldLabel}>
          {tt('range')}
        </Typography>
        <DateRangePicker
          selectedDates={pickerDates}
          setDates={([from, to]) => onRangeChange(from, to)}
          format="MM/DD/YYYY"
          styleClass={classes.rangePicker}
          syncSelectedDatesOnStateChange
        />
      </Box>

      {/**
       * Everything quoted from Config A, in one container — see `scopeBox`.
       *
       * **The `Scope` heading and the `Configuration` link are both gone**, on instruction,
       * and the box is what is left. Worth recording what each one was for, because the
       * arguments were real and were overruled rather than refuted:
       *
       * - The heading named the region so a reader could tell a *quoted* forecast from the
       *   proposal below it. What replaces it is position and the container itself — this is
       *   the only filled box in the column, it sits directly under the field that changes
       *   it, and the figures inside it say what they are. A one-word heading over three
       *   labelled numbers is a label for labels.
       * - The link was the way out to Config A, deliberately a new tab because this surface
       *   holds unsaved work. Removing it leaves no route from here to the rule these
       *   figures come from, which is a genuine loss; the settings page is still reachable
       *   the way every other page is.
       */}
      <Box className={classes.scopeBox}>
        {settling ? (
          <Box className={classes.statRow} aria-hidden="true">
            {stats.map((stat) => (
              <Box className={classes.stat} key={stat.key}>
                <Box className={classNames(classes.skeletonBar, classes.skeletonStatValue)} />
                <Box className={classNames(classes.skeletonBar, classes.skeletonStatLabel)} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box className={classes.statRow} role="status" aria-live="polite">
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
        )}
      </Box>
    </Box>
  );
};

ScopePanel.propTypes = {
  classes: PropTypes.object.isRequired,
  range: PropTypes.object.isRequired,
  forecast: PropTypes.object.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  quiet: PropTypes.bool,
};

export default ScopePanel;
