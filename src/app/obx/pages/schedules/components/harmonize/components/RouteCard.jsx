import { Box, Collapse, InputBase, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MAN_DAY_MINUTES } from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { formatMinutesLong } from '../durations';
import { useStyles } from '../harmonize.styles';
import { WarningTriangle } from './Glyphs';
import StopList from './StopList';

/**
 * One proposed route: a name, a day's worth of hours, and the ordered work.
 *
 * The spill used to be a *bucket* — a list of names handed to a date, with no
 * sequence and no capacity, described as "they'll land unassigned". That was an
 * unfinished sentence, and it also meant the second day was the only part of the
 * plan the planner could not check. Every route in the run is now the same object:
 * solved, sequenced, measured against the eight hours, and pointed at either a
 * route that already exists on its day or a new one.
 *
 * **Three children, and that is the whole card**: the head (`Route for Monday`,
 * `2 hr / 8 hr`, `−` `+`), the progress bar, and a bounded region that scrolls the
 * stops. The measured design says so, and the things that used to sit between them
 * are gone by request:
 *
 * - **The day meter** — the `Where the time goes` disclosure and the `Estimated`
 *   pill with it. The head's own figure is the day's total; the itemisation behind
 *   the disclosure (travel, on site, filters, already on route) has no home on the
 *   card any more. `DayMeter` is no longer rendered anywhere.
 * - **`Day` and `Route`** — the per-route date picker and the merge-target dropdown.
 *   The card no longer lets a planner re-date a route or pick which existing route
 *   to join; both now take whatever `useHarmonizeRun` defaulted them to. That is a
 *   capability removed, not a capability moved, and it is written down here because
 *   the hook still exposes the setters and still sends a target in the Apply payload.
 *
 * **The spill ribbon stays, between the bar and the stop list** — a deliberate
 * fourth child. It is the only place the card says *this route exists because the day
 * before it ran out of hours*, and `Drop` is the only undo for that decision; the
 * merge dropdown that used to sit directly under it as the alternative remedy is the
 * very thing that just left, so removing the ribbon too would delete the disclosure
 * and its last remaining action in one pass.
 *
 * **Only one route is expanded at a time**, which the design does not picture and this
 * card still has to honour: the map draws the selected route, and `Collapse
 * unmountOnExit` is what stops two five-hundred-pixel stop lists from sharing a
 * quarter-width column. So a shut card keeps exactly what the design draws above the
 * rows — name, figure, bar — and it is the *rows* that come and go.
 */
const RouteCard = ({
  index,
  dayLabel,
  plan,
  target,
  routeTargetId = '',
  newRouteName = '',
  nameError = false,
  travelMinutes = 0,
  expanded = false,
  pendingTimes = false,
  manual = false,
  spilledFromDay,
  revealCount = Infinity,
  highlightedSiteId,
  startLabel,
  onExpand,
  onNewRouteNameChange,
  onHighlight,
  onReorder,
  onReoptimize,
  onMoveOut,
  onDropSpill,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  if (!plan) return null;

  /* This route exists because the day before it ran out of hours. That is the most
     consequential thing the optimizer did without being asked, and before the
     ribbon it was inferable only by noticing there were two cards. */
  const isSpill = Boolean(spilledFromDay);
  const isCreating = !routeTargetId;
  const budget = plan.budgetMinutes || MAN_DAY_MINUTES;

  /**
   * **Composed from the same three parts the meter used to add up, not read off the plan.**
   *
   * `plan.dayTotalMinutes` is haversine throughout, and on the expanded route
   * `travelMinutes` is the Directions figure. So the collapsed header said `7h 12m of
   * 8h` while the meter one element below it said `7h 26m of 8h` about the same day —
   * two numbers for one fact, differing by however much the roads differ from straight
   * lines. The meter has since gone, which does not make the composition optional: this
   * figure and the bar under it are now the *only* statement of the day's cost, so it had
   * better be the measured one wherever a measurement exists.
   */
  const existingMinutes = plan.existingLoadMinutes || 0;
  const usedMinutes = existingMinutes + (plan.serviceMinutes || 0) + travelMinutes;
  const over = usedMinutes > budget;

  /* The bar's scale rule — the man-day, stretched if the day overruns — so a column of
     cards puts its bars on one axis at one length, which is the only arrangement where
     "which of these days is fullest" is answered by looking. Where the eight hours ended
     on a bar that has run past them used to be marked with a hairline tick; the design
     carries the overrun in colour instead, and `proposedBarOver` is the whole of it. */
  const gaugeScale = Math.max(budget, usedMinutes);
  const gaugeFill = gaugeScale ? Math.min(1, usedMinutes / gaugeScale) : 0;

  /**
  /**
   * Whether the rows are on screen.
   *
   * **This was `expanded && stopsOpen`, and the second term is gone with the `−`/`+` pair
   * that was its only way of becoming false.** Folding a selected card is no longer a state
   * the screen has: a card is open because it is the selected route, and shut because
   * another one is. Keeping the flag would have left a value that started `true`, had one
   * writer that set it `true`, and could never be anything else — which reads as a feature
   * until somebody tries to use it.
   */
  const open = expanded;

  /* Selecting is the whole gesture now. A no-op on a card that is already selected, which is
     what makes it safe to hang off the head. */
  const openCard = () => onExpand?.(index);

  /* Named so the head can point at the rows it discloses. */
  const bodyId = `harmonizeRouteBody-${index}`;

  /* Somebody else's stops, re-ordered by our merge. §2 decision 17. */
  const reorderedCount = plan.reorderedExistingCount || 0;
  const hasExistingStops = (plan.stops || []).some((stop) => !stop.isNew);

  return (
    /* **A card again**, where the column's own slot was carrying the whole appearance of
       one — white, a hairline, 12px corners. The slot is down to the entry animation now:
       the accent it used to draw on the leading edge went with the design's decision to
       run the cards flush to the column. */
    <Box className={classes.proposedCard}>
      {/**
       * **The head is no longer a `<button>`, and it could not stay one.** It holds a text
       * input and two icon buttons now, and a control nested inside a button is invalid
       * markup whose clicks are swallowed by the outer one — the planner would not be able
       * to type in the name at all.
       *
       * So the affordance splits. The `+` is the real control: a button, in the tab order,
       * labelled, and the accessible way into a shut card. This click handler is the mouse
       * shortcut the old header gave for free, and it is worth keeping because clicking a
       * route is how a planner puts it on the map. Clicks from the name field and from the
       * `+` bubble into it and land on the same intent, so nothing needs to stop
       * propagating; the `−` is only ever pressed on an open card, where the handler is not
       * installed.
       *
       * The design nests the figure and the two buttons in a right-hand group of their own.
       * They are flat siblings of the title here because the result is the same pixels: the
       * title is the only flexible child, so it takes the slack and the other two sit hard
       * right at the same 12px gap the group would have given them. There is no
       * `proposedHeadRight` key to nest them with, and inventing a plain `<div>` to hold two
       * elements that are already where they belong buys nothing.
       */}
      {/**
       * **The head is the way in, and it had to become keyboard-reachable to stay one.**
       * The `+` that used to sit at its right end was the only focusable control that could
       * select a route — the head is a `Box` with a click handler, and it cannot be a
       * `<button>` because it contains the name field. Removing the `+` without this would
       * have left routes selectable by mouse only.
       *
       * So a *shut* head takes `role="button"`, a tab stop, and Enter/Space; an open one
       * takes none of them, because it is not a control when there is nothing left to do to
       * it — and a focus stop that does nothing is worse than no focus stop. `aria-expanded`
       * and `aria-controls` moved here from the buttons for the same reason: this is the
       * disclosure now.
       */}
      <Box
        className={classes.proposedHead}
        onClick={open ? undefined : openCard}
        role={open ? undefined : 'button'}
        tabIndex={open ? undefined : 0}
        aria-expanded={open}
        aria-controls={bodyId}
        onKeyDown={
          open
            ? undefined
            : (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                /* Space scrolls the pane otherwise, and the pane is the thing this card is
                   in — so the card would open and jump out of view at the same time. */
                event.preventDefault();
                openCard();
              }
        }
        /* Inline because it is a function of state and there is no `proposedHeadShut`. */
        style={{ cursor: open ? 'default' : 'pointer' }}
      >
        {/**
         * **The title is the field, and the field is the route's name.**
         *
         * It used to be a bordered `TextField` low in the card body, under a `Runsheet
         * name` label and drawn only while the route was a new one — which put the one
         * thing on this card the planner *authors* below a stop list, on a card that is
         * shut most of the time. As the title it is the first thing read and the first
         * thing reachable, and `proposedName` is what stops that from turning every card
         * into a form: no chrome until hovered, the full input treatment only on focus.
         *
         * The value is the column's `routeNames` state, not a local copy — it is what
         * Apply writes and what the footer's "name the new routes" block reads, and a
         * second copy of it here is a second answer to one question. `nameError` arrives
         * the same way, from the same state's touched set.
         *
         * **A merge gets a label, not a field.** When `routeTargetId` is set the name
         * belongs to the route being joined; nothing typed here would ever be written, and
         * an editable title over a name we intend to discard is a lie about what Apply
         * does. So the title states the target's name, on `proposedNameStatic` — the same
         * 14px/600 ramp as the field, so the head does not change height between the two
         * cases, and truncating rather than wrapping because the head is one 20px row.
         *
         * That title is now the *only* statement of the merge target, which is the sharp
         * edge of losing the dropdown below: the planner can read which route this joins
         * and can no longer change it.
         */}
        {isCreating ? (
          <InputBase
            className={classes.proposedName}
            value={newRouteName}
            onChange={(event) => onNewRouteNameChange?.(index, event.target.value)}
            placeholder={tt('routeNamePlaceholder')}
            error={nameError}
            /* No visible label — the design gives the title the whole line — so the label
               is on the input, and `aria-invalid` is set explicitly rather than trusting
               `error` to reach the input through a `FormControl` that is not there. */
            inputProps={{
              'aria-label': tt('routeNameLabel'),
              'aria-invalid': nameError,
            }}
          />
        ) : (
          <Typography className={classes.proposedNameStatic}>
            {target?.name || tt('routeForDay', { day: dayLabel })}
          </Typography>
        )}

        {/**
         * **The visit count is not in the head, and it was — briefly.**
         *
         * It went in on the argument that a folded card is a summary of rows that are not
         * on screen, and the size of a day is what a planner compares routes on. That
         * argument is sound and the layout refused it: the head is a flexible title
         * between two fixed-width figures, so a third fixed item took its width from the
         * one element that can lose it, and `Route for Tuesday` rendered as
         * `Route for Tuesda`. A clipped route name is worse than a count you get by
         * unfolding, because the name is the thing Apply writes.
         *
         * The design draws name, figure, steps — and the bar underneath already answers
         * how full the day is, which is the comparison the count was standing in for.
         */}

        {/* `2 hr / 8 hr`. **Both halves in one string, in one tier**, where the head used
            to stack `7h 12m` over `of 8h` and only while shut. What the day costs and what
            the day is are one comparison, and the bar directly underneath is the same
            comparison drawn — so the pair is what the head is for and neither of them is
            conditional any more. `formatMinutesLong`, because at this size `2 hr 30 min`
            is a duration and `2h 30m` is a unit code; see `durations.js`. */}
        <Typography className={classNames(classes.proposedTime, over && classes.proposedTimeOver)}>
          {tt('routeBudget', {
            used: formatMinutesLong(usedMinutes),
            budget: formatMinutesLong(budget),
          })}
        </Typography>
      </Box>

      {/* How full the day is, full width under the head.
          **Drawn whether the card is open or shut**, which reverses the rule that used to
          take the bar away the moment `DayMeter` arrived to say the same thing at 22px.
          There is no meter to defer to now, so this and the head's figure are the only
          account of the day's hours the card gives.

          `scaleX` rather than a width, because width is a layout property and transitioning
          it thrashes. */}
      <Box className={classes.proposedBar} aria-hidden="true">
        <Box
          className={classNames(classes.proposedBarFill, over && classes.proposedBarOver)}
          style={{ transform: `scaleX(${gaugeFill})` }}
        />
      </Box>

      {/* **Outside the `Collapse`, deliberately.** This started inside the card
          body, directly above the two controls that answered it — which read well and
          was wrong, because only one card is expanded at a time and it is never this
          one. The single most consequential thing the optimizer did without being
          asked was therefore invisible until the planner opened a card they had no
          reason to suspect.

          So it sits between the bar and the stops and shows either way: what did not
          fit and off which day. It used to be able to say "the remedy is the date picker
          and the route dropdown immediately below" — those are gone, and `Drop` is what
          is left of the remedy, which is the reason this ribbon is now load-bearing
          rather than a courtesy.

          It is also the *only* mark a shut spill card carries: the amber index disc
          that used to make the exception findable in a column of three went with the
          disc itself, and this ribbon was always the better sentence — it names the day
          the work came off instead of tinting a number. */}
      {isSpill ? (
        <Box className={classes.spillRibbon}>
          <WarningTriangle className={classes.spillRibbonIcon} />
          <Box className={classes.spillRibbonText}>
            {/* **One sentence, where there were two.** The second said what was created
                or joined, which the card's title now says by *being* either the name of
                the route being made or the name of the one being joined. Three lines of
                amber on a shut card made the exception louder than the route it is a
                footnote to. */}
            <Typography className={classes.spillRibbonTitle}>
              {tt('spillRibbonTitle', {
                count: plan.fittedVisitCount,
                day: spilledFromDay,
              })}
            </Typography>
          </Box>
          {/* Undoes the decision by taking this work out of the run altogether —
              the visits stay on the days they already sit on, which is the one
              outcome nobody needed to be told about. */}
          {onDropSpill ? (
            <button
              type="button"
              className={classes.spillRibbonAction}
              onClick={() => onDropSpill(index)}
            >
              {tt('spillRibbonDrop')}
            </button>
          ) : null}
        </Box>
      ) : null}

      {/* 300ms, up from 220. The card opening is the gesture the whole region turns
          on, and at 220 it reads as a jump-cut rather than as a card unfolding.

          `open`, not `expanded`: the rows are away either because another route is
          selected or because this card's `−` folded them, and the planner should not be
          able to tell those apart by looking at the card.

          The two `sx` facts are about this *composition* rather than about the design, so
          they are here and not in the sheet. `proposedCard` aligns its children to
          `flex-start`, and every other child claims `alignSelf: stretch` for itself —
          `Collapse` renders its own root and cannot, so a full-width stop list would
          otherwise shrink to the width of its longest site name. And `MuiCollapse-hidden`
          is the class MUI puts on a root that has finished collapsing to zero: without
          `display: none` a shut card still spends one of the card's 12px gaps on an empty
          element, which is visible as dead space under the bar on every folded card. */}
      <Collapse
        in={open}
        timeout={300}
        unmountOnExit
        sx={{
          alignSelf: 'stretch',
          minWidth: 0,
          '&.MuiCollapse-hidden': { display: 'none' },
        }}
      >
        {/* **The list does not scroll inside the card any more.** It used to be bounded at
            252px, on the argument that three cards each listing eight stops is 24 rows in a
            quarter-width column and the planner's real question — how do these days compare —
            needs the heads visible at once. The cost was that a route's last stops were
            reachable only by finding a second scrollbar inside the first, and the per-stop
            disclosures below the fold looked as though they did not exist. The pane scrolls;
            the card is whole. `proposedBody` is `proposedScroll` without the cap — the
            horizontal refusal stays, because that is about flex rows pushing their figures
            out of view and has nothing to do with height. */}
        <Box className={classes.proposedBody} id={bodyId}>
          <StopList
            stops={plan.stops}
            startLabel={startLabel}
            endLabel={startLabel}
            returnLegMinutes={plan.returnLegMinutes}
            finishMinutes={plan.finishMinutes}
            manual={manual}
            /* **The `summary` prop, finally passed.** It has existed on `StopList`
               since the list was rebuilt and no caller ever supplied it, so the
               `summary && …` branch was unreachable code. §2 decision 17 is what it is
               for: a merge re-solves somebody else's route, and that has to be said
               where the re-ordering is visible rather than only in the footer six
               hundred pixels below. Silent when nothing of theirs moved. */
            summary={reorderedCount ? tt('stopsReordered', { count: reorderedCount }) : ''}
            /* Tell the new work from the work that was already on the runsheet — only
               meaningful when the route is a merge, which is the only time both kinds
               are in the list. */
            showNewBadge={hasExistingStops}
            pendingTimes={pendingTimes}
            revealCount={revealCount}
            highlightedSiteId={highlightedSiteId}
            onHighlight={onHighlight}
            onReorder={(order) => onReorder?.(index, order)}
            onMoveToOverflow={(siteId) => onMoveOut?.(index, siteId)}
            onReoptimize={() => onReoptimize?.(index)}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

RouteCard.propTypes = {
  index: PropTypes.number.isRequired,
  /** Only read as the fallback title of a merge whose target has no name. */
  dayLabel: PropTypes.string,
  plan: PropTypes.object,
  /**
   * The route this one is being merged into, when there is one. Its name is the card's
   * title in that case, because the name is then not the planner's to set — and with the
   * merge dropdown gone, the title is the only place the target is stated at all.
   */
  target: PropTypes.object,
  /**
   * Which existing route this one joins, or empty for a route being created. Now read
   * only to choose between an editable title and a static one: the control that used to
   * *set* it has been removed, so whatever `useHarmonizeRun` defaulted it to is what
   * Apply will use.
   */
  routeTargetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The name a new route will be created under — the card's title, and the column's
   * `routeNames` state rather than anything this card owns. Seeded per route there and
   * left alone once the planner types.
   */
  newRouteName: PropTypes.string,
  /** The name is blank and the planner has been in the field. Rings the title. */
  nameError: PropTypes.bool,
  travelMinutes: PropTypes.number,
  /**
   * Whether this is the selected route — the one the map is drawing, and the one whose rows
   * are on screen. It used to be necessary but not sufficient, because the card carried its
   * own fold; that second dimension is gone with the `−`/`+` pair.
   */
  expanded: PropTypes.bool,
  /** Directions is out for this route; the stop rows shimmer their figures. */
  pendingTimes: PropTypes.bool,
  manual: PropTypes.bool,
  /** The day that refused this work, when this route exists to absorb a spill. */
  spilledFromDay: PropTypes.string,
  /** How many stops have landed while the route is being revealed. */
  revealCount: PropTypes.number,
  highlightedSiteId: PropTypes.string,
  startLabel: PropTypes.string,
  onExpand: PropTypes.func,
  onNewRouteNameChange: PropTypes.func,
  onHighlight: PropTypes.func,
  onReorder: PropTypes.func,
  onReoptimize: PropTypes.func,
  onMoveOut: PropTypes.func,
  onDropSpill: PropTypes.func,
};

export default RouteCard;
