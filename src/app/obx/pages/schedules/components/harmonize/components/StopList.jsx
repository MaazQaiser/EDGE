import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  distanceKm,
  FILTER_MINUTES,
  formatMinutesAsClock,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';
import { useFlipReorder } from 'src/hooks/useFlipReorder';

import { formatMiles, formatMinutesLong } from '../durations';
import { LEG_LINE, STOP_TONES, useStyles } from '../harmonize.styles';
import { routeSignature } from '../routeMotion';
import { reorderToSlot } from '../stopOrder';
import { StopPinIcon, stopTone } from './StopPinIcon';
import { DragHandle, StopFigure, StopRow } from './StopRowParts';

/**
 * A stop the route line has not reached yet.
 *
 * Not a data-loading skeleton — the data is already here, solved synchronously.
 * This is the row *waiting its turn*, and it exists so the list has its true length
 * from the first frame. Appending rows as they land grows a list under the reader
 * and moves everything below it once per stop on the way in.
 */
const PendingStop = ({ classes }) => (
  <Box className={classes.stopLine} aria-hidden="true">
    <Box className={classes.stopGripSpacer} />
    <Box className={classes.stopTrackColumn}>
      {/* `stopPinPending` alone. It was composed with `skeletonBar`, and in a JSS sheet the
          later-declared rule wins whatever order the class names are written in —
          `skeletonBar` sits below it in the file, so its `height: 10` and `borderRadius: 5`
          overrode the placeholder's own geometry and the teardrop this exists to be has never
          rendered. It carries its own shimmer now. */}
      <Box className={classes.stopPinPending} />
      <Box className={classes.stopTrackLine} style={{ color: STOP_TONES.idle.line }} />
    </Box>
    <Box className={classes.stopLabels}>
      <Box className={classes.skeletonBar} style={{ width: '46%' }} />
    </Box>
  </Box>
);

PendingStop.propTypes = { classes: PropTypes.object.isRequired };

/**
 * The ordered day.
 *
 * **Built to the CSS the design tool exported, which replaced the mockup it was read
 * from.** A stop is four children on one line — a grip, a numbered pin, the site name,
 * and the row's figure — and then a dashed connector down to the next one. **The pill is
 * gone**: it was a grey-subtle rounded box with a hairline, argued for on the grounds
 * that it made the pin beside it read as the marker *for* the row, and the measured CSS
 * draws no such box. Nothing was lost with it. The pin reads as the row's marker because
 * it is on the row's baseline, and twelve bordered boxes stacked 4px apart were twelve
 * more edges in a column that already has a card border, a meter and a track in it.
 *
 * The figure is `12 mi · 1 hr 29 min` — how far the van drives to get here and what the
 * stop costs the day once it arrives — with a drawn 2px dot between the halves rather
 * than the middot character an earlier pass typed there.
 *
 * The detail behind the chevron is a *breakdown of the row's own figure* — travel, filter
 * installation, the call-out — rather than a set of loosely related notes, and it is why
 * the figure is a sum rather than any single one of its parts: a number on a row with its
 * arithmetic one click below it can be checked, and a number that is only one of three
 * cannot. It is drawn as two columns now, labels left and values right against a reserved
 * chevron slot, so the values line up under the figure they add up to. See `StopRow`
 * for how the two columns are kept in step.
 *
 * **The open row keeps the closed row.** The spec draws the disclosure as two columns
 * whose first entries are the site name and the figure, which would mean rebuilding the
 * top line out of different boxes the moment the chevron is pressed; instead the line
 * stays exactly as it is and the columns start below it. Same pixels — the name is the
 * top of the label column and the figure is the top of the value column — with nothing
 * re-parented, so opening a stop moves no text sideways.
 *
 * The chevron itself replaced a hover tooltip and a `⋮` that moved the stop out. A
 * tooltip cannot be reached by keyboard and a `⋮` next to a drag handle is two glyphs
 * for two different kinds of move. Both remain behind the chevron, which is one
 * affordance for "tell me more about this stop".
 *
 * Re-ordering happens here and only here — the map is a read-out. Native drag
 * rather than react-beautiful-dnd: the drawer is positioned with a CSS transform,
 * which breaks the absolute positioning that library relies on.
 *
 * Stops the technician has already completed carry no grip. A control that is
 * rendered and then refuses is worse than one that was never offered.
 */
const StopList = ({
  stops = [],
  startLabel,
  endLabel,
  finishMinutes,
  manual = false,
  summary,
  showNewBadge = false,
  pendingTimes = false,
  revealCount = Infinity,
  highlightedSiteId,
  onHighlight,
  onReorder,
  onMoveToOverflow,
  onReoptimize,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  const [draggingId, setDraggingId] = useState(null);
  /**
   * Where the drop will land: a row, and which of its edges.
   *
   * **The edge is the half that was missing.** This was a bare `dragOverId` and the drop
   * always landed *above* it, which has two consequences a planner meets immediately: the
   * last position in the route cannot be reached with the mouse at all — nothing sits below
   * the final row to be above of — and any release in the lower half of a row lands one
   * place higher than they aimed, which reads as the list refusing to take the stop where
   * they put it. The edge comes from the pointer's position inside the row, so the mark and
   * the outcome are the same decision.
   */
  const [dragOver, setDragOver] = useState(null);
  const [openId, setOpenId] = useState(null);
  /* What the arrow keys just did, for anyone not watching the screen. */
  const [announcement, setAnnouncement] = useState('');

  const timelineRef = useRef(null);
  /**
   * The row elements, so a drag can carry a picture of the row.
   *
   * Native drag-and-drop snapshots whatever element `setDragImage` is given, and with no
   * call it snapshots the element the gesture started on — which is the 20px grip. The
   * gesture was therefore: press six dots, watch six dots follow the cursor across a list
   * of twelve near-identical rows, release, and find out afterwards which one moved. Handing
   * it the row means the thing under the cursor is the thing being moved.
   */
  const rowRefs = useRef(new Map());
  const orderSignature = routeSignature(stops);

  /* A re-solve moves rows rather than replacing them, so the planner can see *what
     changed* instead of re-reading the whole list. */
  useFlipReorder(timelineRef, orderSignature);

  /**
   * How many stops have landed. Handed down from `useHarmonizeReveal` rather than
   * computed here, because the map is running the same stagger and pin *n* has to
   * land as row *n* arrives — two components each deriving it from their own effect
   * is the same clock twice, which drifts.
   */
  const landed = (index) => index < revealCount;
  const allLanded = stops.length <= revealCount;

  /* The arithmetic is in `stopOrder.js` and tested there — see that file for why slots
     rather than indices, and why a no-op has to stay a no-op. This is the wiring: identity
     of the returned array is the signal that nothing moved, so a drag that ends where it
     started does not put the route into hand-ordered mode. */
  const moveToSlot = (fromSiteId, slot) => {
    const order = stops.map((stop) => stop.siteId);
    const next = reorderToSlot(order, fromSiteId, slot);
    if (next !== order) onReorder?.(next);
  };

  const endDrag = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  const commitDrop = () => {
    if (!draggingId || !dragOver) return;
    const target = stops.findIndex((stop) => stop.siteId === dragOver.siteId);
    if (target === -1) return;

    const slot = dragOver.edge === 'below' ? target + 1 : target;
    moveToSlot(draggingId, slot);
    setAnnouncement(
      tt('reorderAnnounce', {
        site: stops.find((stop) => stop.siteId === draggingId)?.siteName || '',
        position: Math.min(stops.length, dragOver.edge === 'below' ? target + 1 : target + 1),
        total: stops.length,
      }),
    );
  };

  /**
   * Which edge of a row the pointer is nearest.
   *
   * Measured against the *row's* box rather than the unit's, because a unit is a 36px row
   * over a 32px connector and using the whole 68px would put the midpoint down in the
   * dashed line — so the top half of the connector under a row would read as "above" that
   * row while looking like it belongs to the gap below it.
   */
  const edgeFor = (event, node) => {
    if (!node) return 'above';
    const box = node.getBoundingClientRect();
    return event.clientY - box.top > box.height / 2 ? 'below' : 'above';
  };

  /* Dragging is a mouse gesture. The same handle takes arrow keys so the route can
     be reordered without one — and says so, because a reorder that only reports itself
     visually is not a keyboard path, it is a keyboard shortcut for looking. */
  const nudge = (siteId, delta) => {
    const index = stops.findIndex((stop) => stop.siteId === siteId);
    const target = index + delta;
    if (target < 0 || target >= stops.length) return;
    if (stops[target]?.completed) return; // cannot move behind finished work
    /* `delta > 0` means down, and moving down by one means landing in the slot *after* the
       row currently there — `target + 1` in pre-move coordinates. Moving up lands in that
       row's own slot. Getting this wrong makes the down arrow a no-op, because `moveToSlot`
       correctly refuses a move that ends where it started. */
    moveToSlot(siteId, delta > 0 ? target + 1 : target);
    setAnnouncement(
      tt('reorderAnnounce', {
        site: stops[index]?.siteName || '',
        position: target + 1,
        total: stops.length,
      }),
    );
  };

  const clock = (minutes) => (pendingTimes ? '—:—' : formatMinutesAsClock(minutes));
  const reorderable = stops.filter((stop) => !stop.completed).length > 1;

  /**
   * **`legAfter` and `legLabel` are gone with the connector they wrote on.**
   *
   * The old shape gave every stop its own connector box below it, and `Drive 12m` was set
   * beside the dashed rule there — argued for on the grounds that it let the day be read by
   * scanning rather than by opening twelve chevrons. The supplied design has no such mark: the
   * track is a bare dashed rule inside the row, and the drive leg is the *first line of the
   * disclosure* (`Travel time: 13 min`), which is the same number in the one place it can be
   * checked against the total it is part of.
   *
   * What is lost is real and worth stating: the drive times are no longer scannable down a
   * closed list. What is gained is that the row's figure — `18 mi · 2 hr 12 min` — is the only
   * number on a closed row, and it is the one a planner compares between stops.
   *
   * `startLeg` below survives, because the leading connector is not a stop's row: it is the
   * run out of the origin, it has no disclosure to carry its number, and nothing else on the
   * screen says how far the day starts from its first call.
   */
  const startLeg = legLabel(stops[0]?.travelFromPrevious);

  /**
   * How far the van drives to reach stop `index`, in kilometres.
   *
   * **The plan carries no per-leg distance at all** — `travelFromPrevious` is minutes and
   * nothing else, and every screen downstream of `buildRoutePlan` has only ever needed the
   * minutes. The mockup's row asks for the miles beside them, so they are computed here
   * from the two stops' own `lat`/`lng` with `distanceKm`, which is the same haversine the
   * minutes were derived from in the first place: **a straight line, not a driven route**,
   * exactly as provisional as the duration it sits next to. Recomputing rather than
   * threading a new field through the solver keeps the figure honest about that — a
   * distance stored on the stop would look like something the planner measured.
   *
   * **The first leg is the one that cannot be measured.** It runs out of the day's origin,
   * and the only thing this list is handed about the origin is `startLabel` — a string;
   * neither `RouteCard` nor the plan it renders carries the run's `startPoint` down here.
   * Rather than quote a distance between the wrong pair of places, stop 1's figure degrades
   * to its duration alone. Hence `null` and not `0`: nought miles is a claim, and no claim
   * is the truthful answer.
   */
  const legKm = (index) => (index > 0 ? distanceKm(stops[index - 1], stops[index]) : null);

  /**
   * What a stop costs the day: the drive in, plus the time spent there.
   *
   * **Leg plus on-site, and the chevron is the evidence.** The disclosure below the row
   * breaks out travel time, filter installation and the call-out as three separate
   * figures, and a breakdown is only a breakdown of something — so the figure it opens
   * under has to be their sum. The two rejected readings both fail on that: the leg alone
   * leaves the filter and call-out rows explaining nothing, and the on-site time alone
   * leaves the travel row doing the same. The sum is also the number the row is *used* for,
   * which is the stronger
   * argument — a planner deciding whether to move a stop out is asking what the day gets
   * back, and what it gets back is the drive plus the work.
   */
  const stopMinutes = (stop) =>
    (Number(stop.travelFromPrevious) || 0) + (Number(stop.serviceMinutes) || 0);

  /**
   * The two halves of a stop's on-site time, whichever way the stop was built.
   *
   * `groupVisitsIntoStops` splits `serviceMinutes` into `filterMinutes` and the
   * `siteMinutes` remainder and carries both, and for work this run is adding those fields
   * are simply there. **Stops already on a runsheet do not come through that function** —
   * a merge takes them as the runsheet stored them, with a `filterCount` and a
   * `serviceMinutes` and neither half of the split — so the same arithmetic is repeated
   * here as a fallback rather than letting a merged route's rows read `0 min`. Expressed as
   * a fallback and not a recomputation on purpose: where the stop knows its own split, its
   * split wins, because a visit may carry a duration the API decided.
   */
  const serviceSplit = (stop) => {
    const filterMinutes =
      Number(stop.filterMinutes) || (Number(stop.filterCount) || 0) * FILTER_MINUTES;
    const siteMinutes =
      Number(stop.siteMinutes) || Math.max(0, (Number(stop.serviceMinutes) || 0) - filterMinutes);

    return { filterMinutes, siteMinutes };
  };

  /**
   * `12 mi` and `1 hr 29 min`, as two strings, or as much of the pair as is true.
   *
   * **Two values rather than one joined string, because the separator is drawn now.** This
   * returned `18 mi · 2 hr 12 min` with a middot in it, defended on the grounds that the
   * two halves are one unbreakable figure a flex gap must never split. The measured CSS
   * settles it the other way: the separator is a 2 × 2 `#7C92A1` disc, which is the same
   * treatment every other separator in this list already gets and for the same reason — a
   * typographic middot inherits the font's own vertical centring and drifts against a
   * 20px line. `stopFigure` keeps `nowrap` on each half, so neither number can break
   * internally; only the pair can wrap, and it wraps at the dot, which is where a reader
   * would break it anyway.
   *
   * **While `pendingTimes` the duration is absent rather than stubbed**, the same rule the
   * connectors' drive legs follow: the road times are in flight and about to replace the
   * straight-line estimate, and a total quietly containing a provisional part is worse than
   * a total that waits. The miles do not wait — a straight line is a straight line either
   * way — so the figure narrows to the distance for the second or two it takes.
   */
  const rowFigure = (stop, index) => {
    const km = legKm(index);

    return {
      distance: km === null ? '' : formatMiles(km),
      duration: pendingTimes ? '' : formatMinutesLong(stopMinutes(stop)),
    };
  };

  /* The tone rule lives in `StopPinIcon` now, beside the shape it colours: the shut
     card's pin strip draws these same stops, and a stop that is blue in one surface and
     grey in the other is not a discrepancy a planner can resolve by looking. */

  /**
   * A badge only when there is something to say.
   *
   * The spec hides it on the plain planned row (`display: none`) and shows it on the
   * completed and the grey ones, which is the right rule and worth stating: every
   * stop in the list was added by this plan, so a badge saying so was on nearly every
   * row and therefore distinguished nothing. The blue pin already says "this route
   * will do this". The badge is for the two states that are *not* the default.
   *
   * **On a merge that argument inverts, which is why `New` is back.** The premise was
   * "every stop here was added by this plan", and it is false the moment the route is
   * merged into an existing runsheet: the solver interleaves our work with stops that
   * already belonged to somebody's day, and until now the two rendered identically. §2
   * decision 17 requires the re-solve to be disclosed, and a count in the footer is not
   * the same as being able to see which three of eight rows are ours. `showNewBadge` is
   * false on a fresh route, so the original objection still holds where it applied.
   */
  const badgeFor = (stop) => {
    if (stop.completed) return { text: tt('badgeDone'), variant: classes.stopBadgeSuccess };
    /* No `Window` badge. It went with the grey pin for the same reason — see `stopTone`: a
       caveat about an unchecked access window is not something this screen asks the planner to
       decide, and as the only amber thing in a route it read as a fault in the plan. */
    if (showNewBadge && stop.isNew) return { text: tt('newStop'), variant: classes.stopBadgeNew };
    return null;
  };

  /**
   * The paired half of the disclosure: the row's figure, taken apart.
   *
   * **One array, mapped into both columns by `StopRow`, and that is the whole of the
   * pairing guarantee.** The two columns are not two lists that happen to come out the
   * same length — they are two projections of these objects, so a label and its value are
   * the same entry seen twice and a conditional that drops a row drops both halves of it
   * at once. The version this replaces built the pairs as adjacent JSX in a single
   * full-width column, which was safe for the same reason and stops being safe the moment
   * the labels and the values live in different boxes.
   *
   * Order is reading order, not construction convenience: whose time this is, then the
   * three terms of the sum, largest cause first.
   */
  const stopDetails = (stop) => {
    const { filterMinutes, siteMinutes } = serviceSplit(stop);
    /* Work that was already on the runsheet this route is merging into. `isNew` is only
       ever set on stops this run added, so its absence is the test — and it is only
       *meaningful* on a merge, which is the same condition `showNewBadge` gates the `New`
       badge on. */
    const existing = showNewBadge && !stop.isNew;
    const details = [];

    /* **Whose time this is, before any of the arithmetic.** A merged route interleaves
       this run's work with stops the runsheet already owned, and those minutes are in the
       day's load without being anything this plan is proposing. Said first, with the
       stop's own total, because it changes how every row under it should be read. Silent
       on a fresh route, where there is no other kind of stop to tell it from. */
    if (existing) {
      details.push({
        key: 'existing',
        label: tt('rowAlreadyOnRoute'),
        value: formatMinutesLong(stopMinutes(stop)),
      });
    }

    /* **The drive leg is in here, and the note that once removed it was right at the
       time.** It said the connector above already prints this number and that two
       sentences 20px apart saying the same thing is a fault — which held while the row's
       figure was `45m on site`, a quantity the leg had nothing to do with. The row's
       figure is *travel plus on-site*, so these three entries are the sum's parts and
       dropping the first of them would leave a total no one can check. The connector keeps
       its copy because it is legible without opening anything; the difference is that this
       one is no longer a second sentence about driving, it is a term in an addition. Absent
       while `pendingTimes`, for the same reason the total is. */
    if (!pendingTimes) {
      details.push({
        key: 'travel',
        label: tt('rowTravelTime'),
        value: formatMinutesLong(stop.travelFromPrevious),
      });
    }

    /**
     * **The work at the site, as one entry — and the call-out is inside it.**
     *
     * The design draws two rows here, travel and filter installation, and it draws no third
     * row for the per-site call-out: arriving, parking, finding the units, signing in.
     * There were three, and the third existed for a good reason that has now been served a
     * better way. Left out entirely, the parts came to less than the total they sit under,
     * and a breakdown that does not reconcile reads as a bug in the estimate. Given a row
     * of its own, it was a third line of arithmetic in a panel whose whole job is to answer
     * one question — *where did this stop's time go* — in a glance.
     *
     * Folded in, both problems go. `Filter Installation (5)` names the job performed at the
     * site, not a multiplication the reader is invited to check: the count is which filters
     * were replaced, and the minutes are what replacing them at this address costs, call-out
     * included. Two rows, and they sum to the figure on the row above them.
     *
     * The consequence worth knowing: this value is no longer `filterCount × 20`, so it will
     * read a little above whatever that product is. That is the honest number — the
     * technician does not teleport into the plant room.
     */
    if (filterMinutes + siteMinutes > 0) {
      details.push({
        key: 'install',
        label: tt('rowFilterInstall', { count: stop.filterCount }),
        value: formatMinutesLong(filterMinutes + siteMinutes),
      });
    }

    return details;
  };

  return (
    /* `routeStops`, not `stopList`. This list always renders inside a route card,
       which has a narrower inset than the drawer body — sharing the drawer's class put
       the stop track 24px right of the card's own fields and meter. `SelectionList`
       keeps `stopList`, because it does sit in the drawer body. */
    <Box className={classes.routeStops}>
      {/**
       * The header, reduced to the two things in it that were doing work.
       *
       * **`Stops, in order` and `Drag a handle, or use ↑ ↓ to reorder` are gone.** The first
       * labelled a list inside a card whose head is a route, in a column whose heading is
       * *Proposed Route* — a section label that repeats its container's name labels nothing.
       * The second advertised an affordance the handles already show: six dots in a grip
       * column, on every row, next to a numbered pin. Both were chrome, and between them
       * they took a whole line above every route.
       *
       * What stays is a disclosure and a control. `stopSummary` is the merge disclosure —
       * how many of somebody else's stops this plan would re-order — which is §2 decision 17
       * and belongs at the sequence rather than only in the footer. `Re-optimize` is the
       * only path back to solver order once a planner has dragged a row; there is no other
       * caller. **The row is not rendered at all when neither is present**, which on a fresh
       * route is most of the time — an empty flex box with a bottom margin is 8px of nothing.
       */}
      {summary ? (
        <Box className={classes.stopListHeader}>
          <Typography className={classes.stopSummary}>{summary}</Typography>
        </Box>
      ) : null}

      {/**
       * **A hand-ordered route says what that cost, inside the card.**
       *
       * This was a `Your order` pill and a `Re-optimize` link on one line — two words that
       * named the state and never named the consequence. The consequence is the thing a
       * planner needs: the sequence is theirs now, it is not the shortest round the solver
       * found, and it will not be re-solved as they keep working. Dragging one stop to put
       * two neighbouring sites together is a perfectly good trade, and they made it
       * knowingly; what they cannot know without being told is that the trade is *standing*.
       *
       * **Stated, not asked.** A confirmation on the drag would put a dialog in front of the
       * primary editing gesture of this screen, to ask a question whose answer is always
       * yes — they just dragged the row deliberately. So it appears after the fact, in the
       * card the change happened in, with the one control that undoes it.
       *
       * `aria-live="polite"`: it appears in response to the planner's own action, several
       * hundred pixels above where their attention was, and a keyboard reorder never moves
       * the eye to it at all.
       */}
      {manual ? (
        <Box className={classes.manualNotice} role="status" aria-live="polite">
          <Typography className={classes.manualNoticeTitle}>{tt('manualNoticeTitle')}</Typography>
          <Typography className={classes.manualNoticeText}>{tt('manualNoticeText')}</Typography>
          <Box className={classes.manualNoticeActions}>
            <button type="button" className={classes.linkButton} onClick={onReoptimize}>
              {tt('reoptimize')}
            </button>
          </Box>
        </Box>
      ) : null}

      {/* Clipped, not hidden — a `display: none` node is not announced. */}
      <Box className={classes.stopReorderStatus} aria-live="polite" role="status">
        {announcement}
      </Box>

      <Box
        className={classNames(classes.stopTrack, draggingId && classes.stopTrackDragging)}
        ref={timelineRef}
      >
        {/* The anchors reserve the grip column with `stopAnchor`'s own `paddingLeft`
            rather than by rendering a hidden handle. The spec draws the handle at
            `opacity: 0` on these two rows, which is the same outcome — the space is kept
            and the mark is not — and rendering one *as well* would indent the anchors by
            a second grip's width, because the padding is in a style key this pass does
            not own. Same reason a completed stop keeps its grip and gets
            `stopGripHidden`: the pins all have to sit on one axis. */}
        <Box className={classes.stopAnchor}>
          {/* **The same teardrop as a stop, in grey.** It was a dashed circle, which the
              mockup does not draw and which made the day begin with a different *kind* of
              mark rather than with a different-coloured one — and the map beside this list
              has always drawn its origin as a pin. Grey and unnumbered is the whole of the
              difference: this is where the day starts, not a stop the planner chose, so
              there is no number to give it and nothing to open. `StopPinIcon` leaves
              `number` optional for exactly this. */}
          <StopPinIcon
            tone={STOP_TONES.idle}
            className={classes.stopMarker}
            maskId={`stopPinStart-${stops[0]?.siteId || 'empty'}`}
          />
          <Box className={classes.stopAnchorText}>
            <Typography className={classes.stopAnchorName}>{startLabel}</Typography>
            <Box className={classes.stopPillDot} />
            <Typography className={classes.stopPillMeta}>{tt('routeStarts')}</Typography>
          </Box>
        </Box>

        {/* The first leg: out of the start point and into stop 1, which is stop 1's own
            `travelFromPrevious` and not something the anchor knows.

            Grey, where every connector between two stops is violet. The colour is carrying
            one distinction and it is worth stating: the violet track is the part of the day
            the planner can *reorder*, and this run is not — wherever the sequence ends up,
            it still begins at the origin. */}
        <Box className={classes.stopConnector} style={{ color: STOP_TONES.idle.line }}>
          <Box className={classes.stopConnectorSpacer} />
          <Box className={classes.stopConnectorLine} />
          {startLeg ? (
            <Typography className={classes.stopConnectorLeg}>{startLeg}</Typography>
          ) : null}
        </Box>

        {stops.map((stop, index) => {
          const locked = Boolean(stop.completed);

          /* Its turn has not come. */
          if (!landed(index)) return <PendingStop key={stop.siteId} classes={classes} />;

          const tone = stopTone(stop);
          const badge = badgeFor(stop);
          const isOpen = openId === stop.siteId;
          const figure = rowFigure(stop, index);
          /* **The last unit's track is grey and every other one is violet**, and the open
             disclosure has to agree with the connector it interrupts — a dashed rule that
             changes colour halfway down one stop reads as two different tracks. Computed
             once here so the two cannot disagree. */
          const lineColor = index === stops.length - 1 ? STOP_TONES.idle.line : LEG_LINE;

          return (
            /**
             * **One row, where there were three stacked boxes.**
             *
             * `data-flip-id` is what `useFlipReorder` measures between renders. It hangs off
             * the stop's own id so a stop keeps its identity — and therefore its node —
             * through a re-solve, which is the precondition for animating it rather than
             * replacing it.
             *
             * The drop-edge classes are on this element rather than on an inner row, so the
             * 2px rule marks the whole unit including its track. `boxShadow` and not a border,
             * so the mark costs no layout and the list cannot twitch under a drag.
             */
            <Box
              key={stop.siteId}
              ref={(node) => {
                /* Deleted rather than left holding a detached node: a re-solve unmounts rows,
                   and a `Map` that keeps growing across a session of edits would hand
                   `setDragImage` an element no longer in the document. */
                if (node) rowRefs.current.set(stop.siteId, node);
                else rowRefs.current.delete(stop.siteId);
              }}
              data-flip-id={stop.siteId}
              className={classNames(
                classes.stopRowEnter,
                draggingId === stop.siteId && classes.stopUnitDragging,
                dragOver?.siteId === stop.siteId &&
                  (dragOver.edge === 'below'
                    ? classes.stopUnitOverBelow
                    : classes.stopUnitOverAbove),
                highlightedSiteId === stop.siteId && classes.stopRowHighlighted,
              )}
              onDragOver={(event) => {
                if (locked || !draggingId || draggingId === stop.siteId) return;
                event.preventDefault();
                /* The edge has to be re-read as the pointer travels *within* one row, which
                   `dragEnter` fires only once for — and `dragOver` is the event that has to be
                   `preventDefault`ed for a drop to be allowed at all, so the mark and the
                   permission cannot get out of step. */
                const edge = edgeFor(event, rowRefs.current.get(stop.siteId));
                if (dragOver?.siteId !== stop.siteId || dragOver?.edge !== edge) {
                  setDragOver({ siteId: stop.siteId, edge });
                }
              }}
              onDragLeave={(event) => {
                /* `dragleave` bubbles from every child, so crossing from the name onto the
                   chevron reads as leaving the row unless the new target is checked. Without
                   this the drop rule flickers once per internal boundary. */
                if (event.currentTarget.contains(event.relatedTarget)) return;
                if (dragOver?.siteId === stop.siteId) setDragOver(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                commitDrop();
                endDrag();
              }}
              /* Suppressed mid-drag: the pointer crosses every row between the grip and the
                 destination, so without this a drag repaints a different pin on the map on
                 each one — a strobe across the map while the planner is trying to aim. */
              onMouseEnter={() => !draggingId && onHighlight?.(stop.siteId)}
              onMouseLeave={() => !draggingId && onHighlight?.(null)}
            >
              <StopRow
                classes={classes}
                lineColor={lineColor}
                /* Shut rows pass no details, so the label and value stacks are one line each
                   and the row collapses to the design's closed height without a second
                   codepath deciding what a closed row looks like. */
                details={isOpen ? stopDetails(stop) : []}
                grip={
                  /* The grip is the drag target, not the whole row — a draggable row fights
                     text selection and swallows the chevron. Completed stops keep the column
                     and lose the control, so every pin in the list stays on one axis. */
                  <button
                    type="button"
                    draggable={!locked && reorderable}
                    className={classNames(
                      classes.stopGrip,
                      (locked || !reorderable) && classes.stopGripHidden,
                    )}
                    tabIndex={locked || !reorderable ? -1 : 0}
                    aria-label={tt('reorderGrab', { site: stop.siteName })}
                    onDragStart={(event) => {
                      setDraggingId(stop.siteId);
                      event.dataTransfer.effectAllowed = 'move';
                      /* Firefox refuses to start a drag without a payload. */
                      event.dataTransfer.setData('text/plain', stop.siteId);

                      /* Carry the row, not the handle. Without this, native drag snapshots the
                         element the gesture started on — a 20px grip following the cursor
                         across a list of near-identical rows. The offset puts the grabbed
                         point back under the cursor. Guarded because `setDragImage` is absent
                         in some automation environments, and a missing drag *picture* must
                         never abort a drag. */
                      const node = rowRefs.current.get(stop.siteId);
                      if (node && event.dataTransfer.setDragImage) {
                        event.dataTransfer.setDragImage(node, 10, 18);
                      }
                    }}
                    onDragEnd={endDrag}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                      event.preventDefault();
                      nudge(stop.siteId, event.key === 'ArrowUp' ? -1 : 1);
                    }}
                  >
                    <DragHandle className={classes.stopGripIcon} />
                  </button>
                }
                pin={
                  <StopPinIcon
                    number={stop.order}
                    tone={tone}
                    className={classes.stopMarker}
                    maskId={`stopPinRim-${stop.siteId}`}
                  />
                }
                title={
                  <Box className={classes.stopTitleRow}>
                    <Typography className={classes.stopPillName}>{stop.siteName}</Typography>
                    {/* The badge belongs to the name, not to the arithmetic: it says *what kind
                        of stop this is*, which is what the numbers need before they mean
                        anything. */}
                    {badge ? (
                      <Box className={classNames(classes.stopBadge, badge.variant)}>
                        {badge.text}
                      </Box>
                    ) : null}
                  </Box>
                }
                figure={
                  <Box className={classes.stopFigureRow}>
                    <StopFigure
                      classes={classes}
                      distance={figure.distance}
                      duration={figure.duration}
                      open={isOpen}
                      onToggle={() => setOpenId(isOpen ? null : stop.siteId)}
                      toggleLabel={tt('stopDetailToggle', { site: stop.siteName })}
                    />
                  </Box>
                }
              >
                {/* Under the labels, and only on an open row. The breakdown answers *where did
                    this stop's time go*; this is the one action that answers *and what can I
                    do about it*. */}
                {isOpen && !locked ? (
                  <Box className={classes.stopDetailActions}>
                    <button
                      type="button"
                      className={classes.linkButton}
                      onClick={() => onMoveToOverflow?.(stop.siteId)}
                    >
                      {tt('moveOut', { site: stop.siteName })}
                    </button>
                  </Box>
                ) : null}
              </StopRow>
            </Box>
          );
        })}

        {/* The drive home and the finish time land last, once every stop has. A
            finish time printed above rows still arriving is an answer offered
            before its question. */}
        {allLanded ? (
          <Box className={classes.stopAnchor}>
            {/* The grey pin again, and the day closes the way it opened. */}
            <StopPinIcon
              tone={STOP_TONES.idle}
              className={classes.stopMarker}
              maskId={`stopPinEnd-${stops[stops.length - 1]?.siteId || 'empty'}`}
            />
            <Box className={classes.stopAnchorText}>
              <Typography className={classes.stopAnchorName}>{endLabel}</Typography>
              <Box className={classes.stopPillDot} />
              {/* Always `Route ends here`, never the drive home. This meta *was* the
                  only place the return leg appeared, which is why it borrowed the slot;
                  the leg is now on the connector directly above this anchor, where it
                  reads as the last hop in the sequence rather than as a property of the
                  depot. Keeping both printed `Drive 25m` twice a row apart, which is
                  the same duplication the chevron detail just lost. */}
              <Typography className={classes.stopPillMeta}>{tt('routeEnds')}</Typography>
              <Box className={classes.stopPillDot} />
              <Typography className={classes.stopPillMeta}>{clock(finishMinutes)}</Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

StopList.propTypes = {
  stops: PropTypes.array,
  startLabel: PropTypes.string,
  endLabel: PropTypes.string,
  /* `returnLegMinutes` is no longer taken. It fed `legAfter`, which set the drive home on the
     last connector — a mark the supplied design does not draw. The run home is still charged to
     the day and still in the card's own total; what is gone is a duplicate statement of it on a
     rule. `RouteCard` still passes it, harmlessly, and that is the seam it comes back through
     if the legs are ever wanted on the track again. */
  finishMinutes: PropTypes.number,
  manual: PropTypes.bool,
  /** The merge disclosure — how many of somebody else's stops this re-solve moved. */
  summary: PropTypes.string,
  /**
   * Whether to mark this run's own work. True only on a merge, where the list holds
   * both our stops and the runsheet's existing ones; on a fresh route every row is new
   * and a badge on all of them distinguishes nothing.
   */
  showNewBadge: PropTypes.bool,
  pendingTimes: PropTypes.bool,
  /**
   * How many stops have landed. `Infinity` means the whole list, which is the right
   * default: only the route being revealed for the first time withholds rows.
   */
  revealCount: PropTypes.number,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
  onReorder: PropTypes.func,
  onMoveToOverflow: PropTypes.func,
  onReoptimize: PropTypes.func,
};

export default StopList;
