import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStyles as useRouteStyles } from 'src/app/obx/pages/schedules/components/harmonize/harmonize.styles';
import { formatCompact } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/durations';
import { zoneName } from 'src/app/obx/pages/schedules/components/harmonizeFlow/model/fixtures';

import EmptyIllustration from './EmptyIllustration';

/**
 * The open day's route card **before there is a route** — the same header, empty.
 *
 * ## Why the header exists this early
 *
 * The column used to swap a centred *No routes yet* panel for a route card, which meant
 * every element in the region moved at the moment of the press: a title arrived, a figure
 * arrived, a gauge arrived, and the stop list pushed the tray down. Pressing a button and
 * having the thing you were reading rearrange itself is the most avoidable kind of
 * disorientation, and it is worst here because the press is the moment the planner is
 * paying most attention.
 *
 * So the frame is built first and filled second. Title, zone chip, figure, gauge and
 * caption occupy their final positions from the first frame; Harmonize changes what they
 * say and hangs a stop list underneath. Nothing above the list moves.
 *
 * ## It is the drawer's card, by class rather than by import
 *
 * Every rule here is `harmonizeFlow.styles.js`'s own — `flowRouteHeader`,
 * `flowZoneChip`, `flowRouteMetric*`, the workspace's `proposedBar` — handed in through
 * `classes`. `DayPane` itself could not be reused: it requires a solved `sheet`, and
 * feeding it a synthetic one with no stops gets its *empty-day* branch, which says
 * "Nothing legal fits Zone North on this day. Its 4h stays unused." That is a finding
 * about a solved day, and printing it before anyone has solved anything would be the
 * screen asserting a failure it has not looked for.
 *
 * Sharing the styles and not the markup is the trade that keeps the two cards looking
 * identical while letting this one say something true.
 *
 * ## The figure is the shift, not a measurement, and the gauge is empty
 *
 * **This reverses a first pass that printed ①'s forecast here.** `5h41m of 4h shift` with
 * a full amber bar looked like a finished measurement and was not one: the forecast counts
 * on-site minutes only, so it omits every mile of driving — which is most of what the
 * optimizer is for and can be an hour and a half on a day like this one. A number in the
 * slot where the route's duration will go, filling the same gauge the route's duration
 * fills, is that gauge lying about what it knows.
 *
 * So the slot states the *shift* and the trough is empty. **The trough is still drawn**,
 * which is the other half of it — the bar is the element whose absence would move
 * everything under it when the answer arrived.
 *
 * What *is* knowable stays, in the caption: how many visits and how many filters are due
 * in this zone. Those are facts about the input, they move when the range moves, and they
 * are the only honest thing this card can say before the engine runs.
 */
const RoutePreview = ({ classes, day, filterCount, visitCount, children }) => {
  /* The gauge is the **workspace's** rule, not the drawer's — `DayPane` reaches across for
     the same three classes and this card has to draw the identical bar. Taken here rather
     than threaded through `classes` so the two cards cannot end up measuring the same day
     against differently-built tracks. */
  const route = useRouteStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeSplit.${key}`, options);
  const tf = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  if (!day) return null;

  return (
    <Box className={classes.routeBody}>
      <Box className={classes.flowRouteHeader}>
        <Box className={classes.flowRouteHeaderTop}>
          {/* A plain heading, where the solved card has an inline-editable field. There is
              no route to name yet, and an empty text input at the top of an empty state
              would be a form asking to be filled in before the thing it names exists. */}
          <Typography component="h3" className={classes.previewTitle}>
            {tf('routeFor', { day: dayjs(day.date).format('ddd D MMM') })}
          </Typography>
          <Typography component="span" className={classes.flowZoneChip}>
            {day.zoneId ? zoneName(day.zoneId) : tf('anyZone')}
          </Typography>
        </Box>

        {/**
         * The shift — **as a figure with a label, not as one grey sentence.**
         *
         * ## What was wrong with `4h shift`
         *
         * It was a single 14px string in `flowRouteMetricOf`, the *denominator* style. So
         * this rank — the one the solved card gives to a 20px/700 duration — held nothing
         * but a caption, and the header had no anchor anywhere below its title. Measured:
         * the metric read 14px/400 in `#5B5B5F` and the caption under it 12px/500 in
         * `#5B5B5F`, the **same colour** at almost the same size. Two interchangeable grey
         * lines with a rule between them is what "scattered" was describing, and it is a
         * hierarchy problem rather than a spacing one — no amount of gap-tuning fixes a
         * rank with nothing in it that outranks anything.
         *
         * So the rank gets its figure back: `4h` in the duration's own `flowRouteMetricValue`,
         * `shift` beside it in the qualifier style. The solved card then reads `3h48m` +
         * `of 4h shift` — the same shape, the same anchor position, the number swapped for
         * the one the run produced. Before the run the only number that exists is the
         * budget, so the budget is what leads.
         *
         * ## The height is still pinned, and now by construction
         *
         * `previewMetricRow`'s `minHeight: 28` was compensating for a 20px line box in a
         * slot the solved state fills with a 28px one (`h3` is 20px/28px — checked, not
         * assumed). With a real `h3` figure here the line box *is* 28, so the rank matches
         * across the press because the two states are typeset the same, not because a
         * magic number happens to equal the other side. The pin stays as a floor.
         */}
        <Box className={classNames(classes.flowRouteMetric, classes.previewMetricRow)}>
          <Typography className={classes.flowRouteMetricValue}>
            {formatCompact(day.shiftMins)}
          </Typography>
          <Typography className={classes.flowRouteMetricOf}>{tt('shiftLabel')}</Typography>
        </Box>

        {/* The trough's **space**, with no trough drawn in it — see `previewTrack`. Still
            rendered rather than omitted: it is 4px, and 4px that appears when the answer
            does is 4px everything below it jumps by. */}
        <Box className={classNames(route.proposedBar, classes.previewTrack)} aria-hidden="true" />

        {/* Where the solved card prints `3 stops · 6 filters · drive 1h18m`. Two of those
            three are knowable now; the drive is the thing Harmonize works out. */}
        <Box className={classes.flowRouteCaption}>
          <Typography className={classes.flowRouteCaptionText}>
            {tt('previewCaption', {
              visits: tt('visits', { count: visitCount }),
              filters: tf('count.filter', { count: filterCount }),
            })}
          </Typography>
        </Box>
      </Box>

      {/**
       * The list's place — holding the reason there is no list, or the optimizer working
       * one out.
       *
       * **The header stays up while ② runs**, which is why the thinking is a child here
       * rather than a state that replaces this whole card. The orb used to take over the
       * region, so the title, the zone, the gauge and the caption all left for four
       * seconds and came back — a card blinking out at the moment its contents are being
       * computed is the opposite of what the wait is supposed to communicate. Now the
       * frame holds and the work happens inside it.
       */}
      {/**
       * One centred slot, holding whichever of the two things belongs there.
       *
       * **Both the note and the orb are centred in it, and that reverses an earlier pass**
       * which top-aligned the note on the argument that this space *is* the stop list, so
       * its placeholder should start where the first row will. The counter-argument, and
       * the instruction, is that neither of these things is a row: the note is a sentence
       * about the whole region and the orb is the region working. A short block pinned to
       * the top edge of a 300px void reads as content that failed to load; the same block
       * in the middle of it reads as a state.
       *
       * They share one box rather than centring separately because they occupy the same
       * space one after the other — the note until the press, the orb during ② — and two
       * boxes with two sets of centring rules is two places for that to drift. `flex: 1`
       * against `routeBody`'s own full-height column is what makes "the middle" mean the
       * middle of the space under the header rather than the middle of the text itself.
       */}
      <Box className={classes.previewBody}>
        {children || (
          <Box className={classes.previewEmpty}>
            <EmptyIllustration className={classes.previewIllustration} />
            <Typography className={classes.previewEmptyText}>{tt('emptyText')}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

RoutePreview.propTypes = {
  classes: PropTypes.object.isRequired,
  /** The Config A day this stands in for — date, zone and shift. */
  day: PropTypes.object,
  filterCount: PropTypes.number,
  visitCount: PropTypes.number,
  /** The body slot: ②'s orb while it runs, the empty note otherwise. */
  children: PropTypes.node,
};

RoutePreview.defaultProps = { filterCount: 0, visitCount: 0 };

export default RoutePreview;
