import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles as useCardStyles } from '../harmonize.styles';
import { useStyles as useWorkspaceStyles } from '../harmonizeWorkspace.styles';
import { dayLabelOf } from '../useHarmonizeRun';
import AiPanel from './AiPanel';
import { ChevronDown } from './Glyphs';
import RouteCard from './RouteCard';
import SelectionList from './SelectionList';

/**
 * The answer: one card per route the run produced, and one panel for what it left out.
 *
 * **Selection is the whole interaction here.** One card is open, and the map beside it is
 * drawing that card — so clicking a route is how the planner reads it on the ground, and
 * the two cannot disagree because they are the same value. The drawer allowed no card to
 * be open while the map quietly kept drawing the first one; there is no such state now.
 *
 * **The triage goes at the bottom, under the routes.** The routes are what the planner
 * came for and the exclusions are the footnote — three causes, their counts, the visits
 * named under each and the one remedy that would take them. Above the cards, that
 * footnote was 400px tall and pushed the answer off the first screen.
 */
const RoutesColumn = ({
  run,
  startAddress,
  startPending,
  travelMinutes,
  directionsState,
  revealStops,
  highlightedSiteId,
  onHighlight,
}) => {
  const workspace = useWorkspaceStyles();
  /* **The card sheet, borrowed for two marks.** The measured design gave this column one
     disclosure chevron — the 7px stroked V on a stop row — and one quiet-label ramp,
     `Inter 300 12px/16px` in `#6A6A70`. Both live in `harmonize.styles` because the stop
     rows are their main tenant, and the `Reasoning` block below now uses them instead of
     its own heavier pair. Reaching across sheets rather than approximating them here is the
     point: two disclosures in one column that look different are two things to learn. */
  const cardStyles = useCardStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  /* Closed by default. A planner who trusts the numbers should not have to fold the
     reasoning away before they can read the routes it produced. */
  const [showWorking, setShowWorking] = useState(false);

  const {
    routes,
    selectedRoute,
    setSelectedRoute,
    activeVisits,
    facts,
    hasPlan,
    triageGroups,
    routeNames,
    manualOrders,
    nameMissingFor,
    setRouteName,
    reorder,
    reoptimize,
    dropStop,
    dropSpillRoute,
  } = run;

  /* **Six of `run`'s members are no longer pulled out here, and that is a removal, not a
     tidy-up.** `rangeStart` / `rangeEnd` / `setDayPin` fed the card's date picker,
     `routeOptionsFor` / `setTargetPin` / `term` fed its merge-target dropdown, and both
     controls have been taken off the card. The hook still exposes all six and still sends a
     target with the Apply payload — so a route's day and its destination are now whatever
     the solver defaulted them to, with nothing in the UI able to change either.

     `rangeStart` / `rangeEnd` / `term` survive in `index.jsx`, which draws the run's date
     range in the header and the tenant's word for a runsheet in the footer. `setDayPin`,
     `setTargetPin` and `routeOptionsFor` have no caller left anywhere. Left in
     `useHarmonizeRun` rather than deleted, because deciding whether a planner may re-date a
     route is a product question and this is only the file that stopped asking it. */

  /**
   * **The composing branch is gone from here, and the orb with it.**
   *
   * This component used to guard its own working state: `composing || !showPlan` returned a
   * `ThinkingStage` instead of the cards. The workspace lifted that decision out two passes
   * ago — the orb needed the whole region while the map was being withheld — and this branch
   * has been unreachable ever since, because the shell renders `RoutesColumn` only once
   * `hasRun && !reveal.isComposing` and `showPlan` is defined as `!isComposing`.
   *
   * Deleted rather than left as a fallback, because it had already started to drift: it was
   * passing a prop (`onSkip`) that `ThinkingStage` no longer has, so the one thing the dead
   * code was for — being correct if it ever ran again — was no longer true of it. The shell
   * owns which of the three states this pane is in; this file draws exactly one of them.
   */

  return (
    <>
      {/**
       * How these routes came to be, folded away at the top of them.
       *
       * **It was in the setup column and that was the wrong column.** The setup column asks
       * the question; this is a footnote on the *answer*, and a footnote belongs with the
       * thing it annotates. It is also the record of what the orb said while it was standing
       * here a moment ago, so it is now in the same place the planner was already looking.
       *
       * **`Reasoning`, not `Show working`.** The mockup's word, and the better one for what
       * is behind it: these steps are the account the optimizer gives of its own decisions,
       * which is a noun the planner can weigh, where "show working" is an instruction to the
       * screen and reads as arithmetic to be checked. The chevron already says it opens, so
       * the label does not have to; it is the only disclosure in this column whose label
       * stayed the same in both states for exactly that reason.
       *
       * Only once there is a plan to explain: a disclosure on a screen that worked nothing
       * out is a disclosure with nothing behind it.
       *
       * **Quieter, by subtraction.** It had grown into a small feature: a 14px chevron on a
       * 12px label, and behind it a rail with a 7px brand dot per step. Both were arguing
       * for attention that a footnote does not want, and the dots were arguing in the wrong
       * colour — `surfaceBrand` renders green under Filter Go, on a column whose pins already
       * use green to mean *this visit is done*, which is the same miscolouring that just cost
       * `routeSlotSelected` its accent. So the rail and the dots are gone and the steps are
       * plain lines, and the chevron is the same 7px mark the stop rows disclose with. What
       * remains is a grey word, a small arrow, and six sentences.
       */}
      {hasPlan && facts.steps.length ? (
        <Box className={workspace.workingBlock}>
          <button
            type="button"
            className={workspace.workingToggle}
            aria-expanded={showWorking}
            aria-controls="harmonizeReasoning"
            onClick={() => setShowWorking((previous) => !previous)}
          >
            {/* Label first, chevron after it — the mockup's order, and the one the rest of
                this screen's disclosures already use: the chevron on a stop row sits at the
                end of the row it opens. Leading, it read as a bullet on a line of small
                print rather than as the affordance.

                `stopChevronIcon` rather than `workingChevron`: 7px instead of 14, and no
                colour of its own, so it takes the toggle's grey and its hover instead of
                being a second thing on the line with its own temperature. The rotation is
                `stopChevronOpen`, which is the transform *without* the 200ms easing — that
                lives on `stopChevron`, the stop row's button, and `stopChevron` cannot come
                along: its `margin: -8` buys a hit box by eating its own gaps, which inside
                this toggle's `gap: 6` would overlap the label by two pixels. So this mark
                snaps where a stop row's eases, until the transition moves onto the icon key
                where it belongs. */}
            {tt('reasoning')}
            <ChevronDown
              className={classNames(
                cardStyles.stopChevronIcon,
                showWorking && cardStyles.stopChevronOpen,
              )}
            />
          </button>
          {/* Still a list and still unnumbered — this column's numbers already mean a stop's
              place in a sequence, and a second numbering counting something else invites
              exactly one misreading. What it no longer is, is a *timeline*: the rail and its
              dots claimed these six sentences were a process worth following, and they are a
              record worth checking once. `stopDetailLabel` is the design's own quiet-label
              ramp, which is what a record should be set in. */}
          {showWorking ? (
            <Box component="ul" id="harmonizeReasoning" className={workspace.workingTimeline}>
              {facts.steps.map((step) => (
                <Typography component="li" key={step} className={cardStyles.stopDetailLabel}>
                  {step}
                </Typography>
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}

      {hasPlan
        ? routes.map((route) => (
            <Box
              key={route.index}
              /* **No selected variant.** `routeSlotSelected` was the 2px green rule down
                 the leading edge and it has been taken out of the sheet — it miscoloured
                 itself under Filter Go's branding, and the design runs the cards flush to
                 the column with nothing in the gutter to draw it in. Selection is still
                 marked, by the whole card: the open one is the one showing its stops.
                 `routeSlot` remains, carrying the entry animation. */
              className={workspace.routeSlot}
              /* Cards arrive in the order the solver filled them, which is information:
                 day one was decided before day two existed. */
              style={{ animationDelay: `${route.index * 120}ms` }}
            >
              <RouteCard
                index={route.index}
                /* Only the fallback title for a merge whose target has no name. The card's
                   own date field is gone, so this is all that is left of `route.day` here. */
                dayLabel={dayLabelOf(route.day)}
                plan={route.plan}
                target={route.target}
                routeTargetId={route.targetId}
                newRouteName={routeNames[route.index] || ''}
                nameError={nameMissingFor(route)}
                travelMinutes={
                  route.index === selectedRoute ? travelMinutes : route.plan.travelMinutes
                }
                expanded={route.index === selectedRoute}
                pendingTimes={route.index === selectedRoute && directionsState === 'loading'}
                /* **No `estimated` any more.** It was `route.index !== selectedRoute ||
                   directionsState !== 'ready'`, and it drove the day meter's `Estimated`
                   pill — the only place the screen admitted that every unselected route's
                   figures are straight-line rather than measured. The meter has been
                   removed, so the qualifier has nowhere to appear and the caveat is now
                   unstated. `directionsState` is still read, one line above, for the
                   stop rows' pending shimmer. */
                manual={Boolean(manualOrders[route.index])}
                /* Every route after the first exists because the day before it ran out of
                   hours. Naming that day is what turns a second card from a surprise into
                   a disclosure. */
                spilledFromDay={route.index > 0 ? dayLabelOf(routes[route.index - 1].day) : ''}
                /* Only the route being revealed withholds rows, and only while it is
                   being revealed. */
                revealCount={route.index === 0 ? revealStops : Infinity}
                highlightedSiteId={highlightedSiteId}
                /* Never the rung's name. While the geocoder is out, the anchor says it is
                   waiting; if it comes back empty the point falls through to coordinates
                   upstream. */
                startLabel={startAddress || startPending}
                /* **No toggle to closed.** Selecting is exclusive: the map is always
                   drawing one of these, so there is no honest state in which none of
                   them is open. */
                onExpand={setSelectedRoute}
                onNewRouteNameChange={setRouteName}
                onHighlight={onHighlight}
                onReorder={reorder}
                onReoptimize={reoptimize}
                onMoveOut={dropStop}
                onDropSpill={dropSpillRoute}
              />
            </Box>
          ))
        : null}

      {/* No sequence, and nothing the rule can explain either — which means there is no
          origin yet, so nothing has been assessed. The visits still exist and are worth
          listing: a list with no order is honest, and an empty column implies there is
          nothing to plan. Where the rule *can* explain the emptiness, the triage below
          carries these same names plus the reason and the remedy, so this list would be
          the names twice. */}
      {!hasPlan && !triageGroups.length ? (
        <SelectionList
          visits={activeVisits}
          label={tt('weekListLabel')}
          highlightedSiteId={highlightedSiteId}
          onHighlight={onHighlight}
        />
      ) : null}

      {/**
       * The exception report, at the foot of the answer.
       *
       * **Only the groups now.** It used to be handed a `title` built from
       * `notInPlanCount` and a copy of `facts.steps`, and both were wrong from here.
       * The headline has to count the rows the panel actually lists — `notInPlanCount`
       * includes the unplaced work whose group is only built when there is a plan, so on
       * the no-plan path the two disagreed — so the panel derives it from the groups it
       * was given and cannot contradict itself. The steps were the *same* steps rendered
       * a second time: they are behind `Reasoning` at the top of this column, above the
       * cards they explain, which is where the mockup puts the reasoning and the only
       * place it needs to be.
       */}
      {triageGroups.length ? <AiPanel groups={triageGroups} /> : null}
    </>
  );
};

RoutesColumn.propTypes = {
  run: PropTypes.object.isRequired,
  startAddress: PropTypes.string,
  /** What to call the origin while the geocoder is still out. */
  startPending: PropTypes.string,
  /** Measured travel for the selected route, once Directions answers. */
  travelMinutes: PropTypes.number,
  directionsState: PropTypes.string,
  /** How many stop rows have landed on the first route while it is being revealed. */
  revealStops: PropTypes.number,
  highlightedSiteId: PropTypes.string,
  onHighlight: PropTypes.func,
};

export default RoutesColumn;
