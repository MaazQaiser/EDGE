import { Box, Collapse, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FILTER_MINUTES,
  MAN_DAY_MINUTES,
  SITE_MINUTES,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { formatMinutesLong } from '../durations';
import { useStyles } from '../harmonize.styles';
import FieldLabel from './FieldLabel';
import { ChevronDown } from './Glyphs';

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
 *
 * **The itemised day is a disclosure, closed, under the legend.** The bar says how
 * full the day is and the legend names its three parts; what neither could say is
 * *why* the on-site figure is what it is — and for this feature that is the whole
 * argument, because consolidating a round saves arrivals and an arrival is
 * `SITE_MINUTES` of the day. So the arithmetic is stated rather than left to a
 * tooltip on a bar segment, and it is shut until it is asked for: a card in a
 * quarter-width column cannot spend five more rows of numbers by default, and the
 * total those rows add up to is already printed at 22px directly above them.
 *
 * It sits between the legend and the merge control, which costs the ordering
 * argument above one 17px row and nothing else — the segment the merge control
 * empties is still in view at the moment the target changes. Below the merge
 * control it would have been a breakdown of a bar with a dropdown in between,
 * separated from the only thing it decomposes.
 */
const DayMeter = ({
  existingMinutes = 0,
  serviceMinutes = 0,
  travelMinutes = 0,
  siteMinutes = 0,
  filterMinutes = 0,
  filterCount = 0,
  stopCount = 0,
  pendingTravel = false,
  estimated = false,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const totalMinutes = existingMinutes + serviceMinutes + travelMinutes;
  const overflowMinutes = Math.max(0, totalMinutes - MAN_DAY_MINUTES);
  const isOver = overflowMinutes > 0;

  /* The segment scale, the pending-travel floor and the over-budget band all went with
     the track — the card head owns the bar now, and `RouteCard`'s own `gaugeScale`
     is the one place that arithmetic still lives. Kept here: the total, the overrun and
     whether there is one, all of which this component still states in words. */

  /**
   * Whether the itemised day is worth offering, tested on the figures that would be
   * printed rather than on the inputs behind them.
   *
   * `formatMinutesLong` rounds, so what a planner can add up is the rounded
   * minute of each row — and that is what has to equal the rounded total. Testing the
   * raw inputs would pass a split that is arithmetically fine and visibly out by a
   * minute.
   *
   * `siteMinutes` and `filterMinutes` are the two halves of the service segment, split
   * upstream by `harmonizePlan`'s `splitOf` so that they always close. A caller that
   * hands over a split which does not gets no disclosure at all, which is the right
   * failure: a breakdown whose parts do not add up to the total printed two rows below
   * them is worse than no breakdown.
   */
  const shown = (minutes) => Math.max(0, Math.round(minutes));
  const partsClose =
    shown(existingMinutes) + shown(siteMinutes) + shown(filterMinutes) + shown(travelMinutes) ===
    shown(totalMinutes);

  /* And not while Directions is out. The travel row would be stating a straight-line
     estimate eight pixels under a legend that says the driving is still being worked
     out, and closing it against a total that is about to move. While a part of the day
     is unknown the shimmer is the whole of what there is to say about it. */
  const canBreakdown = partsClose && !pendingTravel;

  /* `3 stops × 10 min` is printed only where it is genuinely the arithmetic behind the
     figure beside it. Model-derived work always reconciles — `SITE_MINUTES` once per
     stop however many visits share the address, `FILTER_MINUTES` per filter — but a
     stop whose duration came from the API carries a number this model did not produce,
     and `siteMinutes` is the half that absorbs the difference. Naming a multiplication
     that does not give the figure next to it is the one thing worse than not naming it,
     so in that case the row states the time and stays quiet about how. */
  const siteDetail =
    stopCount > 0 && stopCount * SITE_MINUTES === shown(siteMinutes)
      ? tt('breakdownSiteDetail', { count: stopCount, minutes: SITE_MINUTES })
      : '';
  const filtersDetail =
    filterCount > 0 && filterCount * FILTER_MINUTES === shown(filterMinutes)
      ? tt('breakdownFiltersDetail', { count: filterCount, minutes: FILTER_MINUTES })
      : '';

  /* One row per addend, in the order the requirement states them — the three parts of
     the work this run is proposing, then the inherited load. `Already on this route` is
     last because it is the only row that is not this run's doing and it is absent from
     every card that is not a merge; sitting immediately above the sum, it reads as what
     it is rather than as the first thing the planner did. */
  const rows = [
    {
      key: 'travel',
      label: tt('breakdownTravel'),
      tip: tt('tipBreakdownTravel'),
      minutes: travelMinutes,
    },
    {
      key: 'site',
      label: tt('breakdownSite'),
      tip: tt('tipBreakdownSite', { minutes: SITE_MINUTES }),
      detail: siteDetail,
      minutes: siteMinutes,
    },
    {
      key: 'filters',
      label: tt('breakdownFilters'),
      detail: filtersDetail,
      minutes: filterMinutes,
    },
    ...(existingMinutes > 0
      ? [{ key: 'existing', label: tt('breakdownExisting'), minutes: existingMinutes }]
      : []),
  ];

  return (
    <Box className={classes.meter}>
      {/**
       * **The 22px total is gone from here, and this is the second time this screen has
       * had to settle where the day's total lives.**
       *
       * The card head now prints `2 hr / 8 hr` as its own figure, always visible whether
       * the rows are folded or not — so the meter restating it forty pixels below was the
       * same number twice, which is the exact fault an earlier pass fixed by hiding the
       * head's figure on an open card. The design forbids that resolution: the head's
       * figure is part of the card's identity and is drawn on every card.
       *
       * So it resolves the other way. The head owns the *total*; the meter owns the
       * *composition* — the bar, the legend and the itemised breakdown, none of which the
       * head can express. What is left on this line is only what the head does not say:
       * whether the figures are measured or estimated, and how much of the day is left.
       */}
      <Box className={classes.meterTopLine}>
        {estimated && <Box className={classes.estimatedPill}>{tt('estimated')}</Box>}
        <Box className={classes.grow} />
        <Typography
          className={classNames(classes.meterRemaining, isOver && classes.meterRemainingOver)}
        >
          {/* "Over by 677h 28m" never said over *what*. The budget is printed two
              elements to the left, but a figure on the opposite end of the row does
              not inherit it — so the comparison is named here. */}
          {isOver
            ? tt('overBudget', {
                time: formatMinutesLong(overflowMinutes),
                budget: formatMinutesLong(MAN_DAY_MINUTES),
              })
            : tt('remaining', { time: formatMinutesLong(MAN_DAY_MINUTES - totalMinutes) })}
        </Typography>
      </Box>

      {/**
       * **The segmented track and its legend are gone, and the card head's bar replaced
       * them.**
       *
       * They drew the same day twice, forty pixels apart: a thin blue bar under the
       * route's title and a three-segment bar with a colour legend directly below it. The
       * design draws one bar, under the title, and it has to be that one — this component
       * lives inside the fold, so a card with its rows folded away would otherwise have no
       * bar at all, and the design draws the bar on every card.
       *
       * What the segments said that a single bar cannot — *what* is taking the room — is
       * not lost: it moved into the itemised disclosure below, which says it in words and
       * figures rather than in three colours needing a legend to decode. That is a better
       * trade than it sounds, because the legend was four swatches explaining a bar the
       * planner could already see.
       */}

      {canBreakdown ? (
        <Box className={classes.breakdown}>
          {/* The same disclosure the routes column's "show working" is: a chevron that
              turns, a 12px label, no border and no fill. There are two disclosure
              patterns in this region already and a third would be a third. */}
          <button
            type="button"
            className={classes.breakdownToggle}
            aria-expanded={showBreakdown}
            onClick={() => setShowBreakdown((previous) => !previous)}
          >
            <ChevronDown
              className={classNames(
                classes.breakdownChevron,
                showBreakdown && classes.breakdownChevronOpen,
              )}
            />
            {tt('breakdownToggle')}
          </button>

          {/* `Collapse`, like the card this sits inside, at 200ms rather than its 300 —
              four rows unfolding inside an already-open card is a smaller gesture than
              the card, and matching its timing would read as the card moving again. */}
          <Collapse in={showBreakdown} timeout={200} unmountOnExit>
            <Box className={classes.breakdownRows}>
              {rows.map((row) => (
                <Box key={row.key} className={classes.breakdownRow}>
                  {/* `FieldLabel` rather than a `Typography` and a hand-rolled `ⓘ`: the
                      label-says-what, tip-says-how split is this screen's rule, and the
                      two rows with a mechanism worth explaining get the same 14px info
                      mark every field in the setup column uses. The other rows pass no
                      `tip` and it draws the label alone. */}
                  <FieldLabel text={row.label} tip={row.tip} className={classes.breakdownLabel} />
                  <Box className={classes.grow} />
                  {/* The arithmetic, muted and beside the figure it produces rather than
                      on a second line under the label — four rows of two lines is the
                      wall of numbers this disclosure exists to stay out of. */}
                  {row.detail ? (
                    <Typography className={classes.breakdownDetail}>{row.detail}</Typography>
                  ) : null}
                  <Typography className={classes.breakdownValue}>
                    {formatMinutesLong(row.minutes)}
                  </Typography>
                </Box>
              ))}

              <Box className={classNames(classes.breakdownRow, classes.breakdownRowTotal)}>
                <Typography
                  className={classNames(classes.breakdownLabel, classes.breakdownLabelTotal)}
                >
                  {tt('breakdownTotal')}
                </Typography>
                <Box className={classes.grow} />
                {/* The meter's own `totalMinutes`, deliberately, and not a sum of the
                    rows above. The rows *are* the addends of this figure — `partsClose`
                    is what guarantees they read as such — and re-adding them here would
                    give one card two sources for a number it prints twice, which is the
                    exact fault the header's figure was removed for. */}
                <Typography
                  className={classNames(classes.breakdownValue, classes.breakdownValueTotal)}
                >
                  {formatMinutesLong(totalMinutes)}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      ) : null}
    </Box>
  );
};

DayMeter.propTypes = {
  existingMinutes: PropTypes.number,
  serviceMinutes: PropTypes.number,
  travelMinutes: PropTypes.number,
  /**
   * The two halves of `serviceMinutes` — the per-site call-outs and the filter time —
   * which must add back to it or the breakdown is withheld. See `partsClose`.
   */
  siteMinutes: PropTypes.number,
  filterMinutes: PropTypes.number,
  /** Filters in the new work, for `filterCount × FILTER_MINUTES`. */
  filterCount: PropTypes.number,
  /** *New* stops only, matching `siteMinutes` being new work only. */
  stopCount: PropTypes.number,
  pendingTravel: PropTypes.bool,
  estimated: PropTypes.bool,
};

export default DayMeter;
