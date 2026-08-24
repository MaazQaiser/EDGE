import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DetailDrawer from 'src/app/components/common/rightDrawer';

import ComputingState from './components/ComputingState';
import DayPane from './components/DayPane';
import DayTabs from './components/DayTabs';
import ExitPanel from './components/ExitPanel';
import ScopeState from './components/ScopeState';
import SpillTray from './components/SpillTray';
import { useStyles } from './harmonizeFlow.styles';
import { formatCompact } from './model/durations';
import { VISITS } from './model/fixtures';
import { droppableDatesFor } from './model/planner';
import { FLOW_STATE, holdMsForLine, useHarmonizeFlow } from './useHarmonizeFlow';

/**
 * Harmonize, as a side drawer over the schedule grid — the second shell for this feature,
 * built to `HARMONIZE-CONTEXT.md` v0.9.
 *
 * ## What this is, and what it is not
 *
 * `schedules/components/harmonize/` is the shipped Harmonize: a full-screen three-column
 * workspace over a different domain model — one route day, a radius from where the van
 * starts, crews per day. This implements the model the context document specifies
 * instead: **a range of worked days, one zone each (D15), no radius, and no installers
 * anywhere (D14)**. The two disagree about geography and about how many days a run
 * produces, so they share no engine and neither imports the other.
 *
 * ## The shell is the app's, not this feature's
 *
 * It uses `common/rightDrawer` — the same `DetailDrawer` every other side drawer in this
 * product opens — rather than a hand-rolled `Drawer`. An earlier pass built its own at
 * 470px with `variant="persistent"` and no backdrop, arguing that the grid behind had to
 * stay readable. That argument was real but it bought one thing at the cost of many: the
 * drawer looked and behaved like nothing else in the app, and it silently dropped
 * everything the shared chrome supplies — Escape, focus trap, focus restore, `aria-modal`
 * — because all of that arrives with the Modal the backdrop belongs to.
 *
 * So: the app's drawer, the app's width, the app's tabs, the app's footer. Inside it the
 * layout every drawer here uses — fixed head, scrolling body, fixed footer on a 24px
 * gutter.
 *
 * ## Five states, not six
 *
 * ① Scope · ② Computing · ③ Proposal · ④ Adjust · ⑤ Commit. **④ lives inside ③** because
 * the tabs must stay on screen and keep re-pricing while a stop is dragged over them, and
 * there is no ⑥: Apply closes the drawer and the calendar animates the visits onto their
 * new days. See the note on `FLOW_STATE` for why the calendar is the terminal state.
 */
const HarmonizeDrawer = ({ open, onClose, onApplied }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const flow = useHarmonizeFlow({
    open,
    onApplied: (plan) => {
      /* Close first, then hand over: the calendar's own motion is the answer, and a
         drawer still on screen would be covering half of it. */
      onClose();
      onApplied?.(plan);
    },
  });
  const { state, plan, days, workedDays, openDay, drag, dragQuote, actions } = flow;

  /**
   * Whether the issues accordion — spilled and stranded visits together, see `SpillTray`
   * — is open.
   *
   * **View state, so it lives here rather than in the flow hook.** The hook holds exactly
   * what a planner has *decided*; a disclosure is not a decision, and the same line is
   * already drawn by `DayPane`'s own `openId`. Shut by default — the proposal is the
   * answer and the tray is the exception to it. One boolean, not two: the two lists used
   * to be separate accordions with separate open state, and merging the shell without
   * merging this would have left a planner able to open one half of what now reads as one
   * control.
   */
  const [spillOpen, setSpillOpen] = useState(false);

  /**
   * Where a stop could be moved to — **one list for the whole run, not one per visit.**
   *
   * This was `legalDaysByVisit`: `legalDaysFor` per visit, keyed by id, because the answer
   * genuinely differed visit to visit while a drop had to match the day's zone and the
   * visit's need-by window. Dropping is unrestricted now (see `droppableDatesFor`), so
   * every visit has the same answer and the map was fifteen copies of one array.
   *
   * X1 is the only consumer: `canMove` asks whether the tipping stop has anywhere else to
   * go before offering `Move day`. Under the old rule that was usually *no* on the
   * canonical week — one zone per day, each zone worked once — which is why the panel so
   * often showed `Move day is unavailable`. It is now yes whenever the run has a second
   * worked day.
   */
  const droppableDates = useMemo(() => droppableDatesFor(days), [days]);

  const openSheet = plan.runsheets.find((r) => r.date === openDay) || null;

  /* The stop the shift expires during — derived, so the sentence naming it stays true
     when the sequence changes rather than pointing at a fixed index. */
  const tippingStop = openSheet?.overrunMins
    ? openSheet.stops.find((s) => s.departMins > openSheet.shiftMins)
    : null;

  /* The visit in flight, wherever it came from — a stop on a day, a card in the overspill
     tray, or a card in the not-placed tray. The spill list has to be searched too or ④'s
     preview draws nothing for the drawer's commonest drag. */
  const dragVisit = useMemo(() => {
    if (!drag?.visitId) return null;
    const placed = plan.runsheets.flatMap((r) => r.stops).find((s) => s.visit.id === drag.visitId);
    return (
      placed ||
      plan.spilled.find((u) => u.visit.id === drag.visitId) ||
      plan.unplaced.find((u) => u.visit.id === drag.visitId) ||
      null
    );
  }, [drag, plan]);

  const isProposal = state === FLOW_STATE.PROPOSAL;
  const isComputing = state === FLOW_STATE.COMPUTING;
  const startMove = (visitId) => flow.setDrag({ visitId, overDate: null });

  const title = {
    [FLOW_STATE.SCOPE]: tt('titleScope'),
    [FLOW_STATE.COMPUTING]: tt('titleComputing'),
    [FLOW_STATE.PROPOSAL]: tt('titleProposal'),
  }[state];

  const subtitle = {
    [FLOW_STATE.SCOPE]: tt('scopeSubtitle'),
    [FLOW_STATE.PROPOSAL]: tt('proposalSubtitle', {
      work: formatCompact(plan.totals.placedMins),
      available: formatCompact(plan.totals.availableMins),
      placed: plan.totals.placedCount,
      total: plan.totals.visitCount,
    }),
  }[state];

  return (
    <DetailDrawer open={open} position="right" onClose={onClose}>
      <Box className={classes.shell}>
        {/* The wash, at the **shell** and not inside whichever state is on screen.
            Back to front: the colour, the grain that sits inside it, then — ② only —
            the white that occludes the middle so the orb has a ground to stand on. Each
            colour layer has its own drift timing; all are inert.

            They live here because the aurora is anchored *above its own top edge* and
            falls inward from it — the shape only exists if that edge is the paper's. Drawn
            from inside the body they were clipped flat at the heading's bottom, which is
            the fault this fixes: the glow now runs behind the title, the tab band and the
            footer with no seam at any of them.

            **Mounted in every state now, not only ②.** It used to unmount the instant the
            reveal finished, which made the drawer's own background go flat the moment
            there was anything to read against it — the one state with real content
            (③) was the one state with no life behind it. `washQuiet` is what keeps that
            from competing with the proposal: the same drift, at roughly a third of ②'s
            already-subtle strength, so it reads as the paper having a surface rather than
            as motion asking to be looked at. `eclipse` stays ②-only — it is calibrated to
            clear a centred orb, which nothing outside ② has. */}
        <Box className={classNames(classes.washGroup, !isComputing && classes.washQuiet)}>
          <Box className={classNames(classes.washLayer, classes.auroraTop)} aria-hidden="true" />
          <Box className={classNames(classes.washLayer, classes.auroraSides)} aria-hidden="true" />
          <Box className={classNames(classes.washLayer, classes.grain)} aria-hidden="true" />
        </Box>
        {isComputing ? (
          <Box className={classNames(classes.washLayer, classes.eclipse)} aria-hidden="true" />
        ) : null}

        <Box className={classNames(classes.head, isProposal && classes.headProposal)}>
          <Box className={classes.titleRow}>
            <Typography component="h2" className={classes.title}>
              {title}
            </Typography>
            <Box
              component="button"
              type="button"
              className={classes.closeButton}
              aria-label={tt('close')}
              onClick={onClose}
            >
              <CloseIcon />
            </Box>
          </Box>

          {/* The headline lives here, as the drawer's own subtext, rather than in a row of
              stat tiles. §14.4 still holds — it leads with **hours**, because the cost model
              says filters drive time and a visit count treats an 8-filter data centre and a
              1-filter library as the same event.

              **`Configuration` is not here, and it is not on ① either any more.** It rode
              this row for a while, then moved to ①'s `Scope` heading, and has now been
              removed from the drawer altogether — see the note on that heading in
              `ScopeState` for what that leaves unreachable. */}
          {subtitle ? <Typography className={classes.subtitle}>{subtitle}</Typography> : null}

          {/* **`ReasoningTrail` is gone from this head**, on instruction ("hide the
              reasoning from the top").

              It was a numbered disclosure between the subtitle and the day tabs, and the
              placement was the problem rather than the content: opening it pushed the route
              card **234px** down and clipped the stops — a rarely-opened control sitting in
              the path between the day you just picked and the route you picked it to read.
              `harmonizeSplit` had already moved the same shared component to a band at the
              *foot* of its answer for exactly this reason; the drawer never got that change
              and has now simply dropped it instead.

              The component still exists and Split still renders it. If it should come back
              here, the foot of the body — below the route, above the tray — is where Split
              settled it after trying the two positions above the card. */}
          {isProposal ? (
            <DayTabs
              classes={classes}
              runsheets={plan.runsheets}
              openDay={openDay}
              onOpenDay={flow.setOpenDay}
              accepted={flow.accepted}
              drag={drag}
              quotesForDrag={flow.quotesForDrag}
              onDropOn={actions.commitDrag}
              onDragOverDay={(date) => flow.setDrag((d) => (d ? { ...d, overDate: date } : d))}
              onAddRoute={actions.addRoute}
            />
          ) : null}
        </Box>

        <Box
          className={classNames(classes.body, isProposal && classes.bodyProposal)}
          {...(isProposal
            ? {
                role: 'tabpanel',
                id: 'harmonize-panel',
                'aria-labelledby': `harmonize-tab-${openDay}`,
              }
            : {})}
        >
          {state === FLOW_STATE.SCOPE ? (
            <ScopeState
              classes={classes}
              days={days}
              range={flow.range}
              forecast={flow.forecast}
              onRangeChange={actions.setRangeDates}
              /* The pool, not `flow.scopeVisits` — the list has to draw the rows a planner
                 has cleared as well as the ones they have kept, or clearing a box would
                 make the row disappear and take its own undo with it. */
              visits={VISITS}
              excluded={flow.excluded}
              onToggleVisit={actions.toggleVisit}
            />
          ) : null}

          {state === FLOW_STATE.COMPUTING ? (
            <ComputingState
              classes={classes}
              line={flow.revealLines[Math.min(flow.step, flow.revealLines.length - 1)]}
              lineIndex={Math.min(flow.step, flow.revealLines.length - 1)}
              lineCount={flow.revealLines.length}
              holdMs={holdMsForLine(
                flow.revealLines[Math.min(flow.step, flow.revealLines.length - 1)],
              )}
            />
          ) : null}

          {isProposal && openSheet ? (
            <DayPane
              classes={classes}
              sheet={openSheet}
              forced={flow.forced}
              name={flow.routeNames[openSheet.date] || ''}
              onNameChange={(value) => actions.setRouteName(openSheet.date, value)}
              installerId={flow.installers[openSheet.date] || ''}
              onAssignInstaller={actions.setInstaller}
              /* `days` is the config, `plan.runsheets` is the output — `custom` lives on
                 the former, so the flag is looked up rather than read off the sheet. */
              isCustom={Boolean(days.find((d) => d.date === openSheet.date)?.custom)}
              onRemoveRoute={actions.removeRoute}
              draggingId={drag?.visitId}
              onDragStart={startMove}
              onDragEnd={() => flow.setDrag(null)}
              onStartMove={startMove}
              /* The move menu's destinations and its pricing. `workedDays` rather than
                 `days`: only a worked day has a route to move onto, and it is the same list
                 the tabs are built from, so the menu cannot offer a day the tabs do not. */
              workedDays={workedDays}
              onQuoteMove={actions.quoteMove}
              onMoveTo={actions.moveVisitTo}
              isTipping={(stop) => stop.visit.id === tippingStop?.visit.id}
            />
          ) : null}

          {isProposal ? (
            <ExitPanel
              classes={classes}
              sheet={openSheet}
              accepted={flow.accepted}
              raisedFrom={flow.raisedFrom}
              tippingStop={tippingStop}
              tippingLegalDays={tippingStop ? droppableDates : []}
              tippingWasForced={Boolean(tippingStop && flow.forced.includes(tippingStop.visit.id))}
              drag={drag}
              dragVisit={dragVisit}
              onAccept={actions.acceptOverrun}
              onUnaccept={actions.unacceptOverrun}
              onRaise={actions.raiseHours}
              onRestoreHours={actions.restoreHours}
              onSetAside={actions.setAsideVisit}
              onReturnToTray={actions.returnToTray}
              onStartMove={startMove}
            />
          ) : null}

          {/* ④ announces its pricing and refusals rather than only colouring them — the
              refusal reason is the most information-dense thing in the flow, and a drag
              that reports itself in hue alone is unusable without sight. */}
          <Box className={classes.srOnly} aria-live="polite">
            {drag?.overDate && dragQuote
              ? dragQuote.legal
                ? tt('quoteHere', { delta: formatCompact(Math.abs(dragQuote.target.deltaMins)) })
                : tt(`refuse.${dragQuote.reason}`)
              : ''}
          </Box>
        </Box>

        {/* **Between the body and the footer, and that ordering is the design.**
            The drag travels upward — out of the tray, past the route it is about to join, on
            to the day tab that accepts it — so the tray has to be below the route and the
            tabs above it, and all three have to stay on screen while the pointer crosses
            them. A tray inside the scrolling body would scroll away from its own drop
            targets. See `SpillTray`. */}
        {isProposal ? (
          <SpillTray
            classes={classes}
            spilled={plan.spilled}
            unplaced={plan.unplaced}
            open={spillOpen}
            draggingId={drag?.visitId}
            onToggle={() => setSpillOpen((prev) => !prev)}
            onDragStart={startMove}
            onDragEnd={() => flow.setDrag(null)}
            onRestore={actions.restoreVisit}
          />
        ) : null}

        {/* **The footer note that used to live here is gone, on instruction.** It said what
            Apply does — the runsheets arrive unassigned (D14) and the old arrival times
            are discarded (D1) — which mattered while nothing on ③ let a planner change
            either fact before pressing it. Assigning an installer inline (`RouteAvatar`)
            now answers the first for any route it is used on; the second, D1, has no
            other home on screen and is simply not stated any more. */}
        <Box className={classNames(classes.footerBand, isComputing && classes.footerBandBare)}>
          <Box className={classNames(classes.footer, isProposal && classes.footerProposal)}>
            {state === FLOW_STATE.SCOPE ? (
              <>
                <Button disableRipple variant="secondaryGrey" onClick={onClose}>
                  {tt('cancel')}
                </Button>
                {/* Two ways there is nothing to do, and both have to close this button.
                    No worked days is a Settings problem (`noWorkedDays` says so under the
                    table); no selected visits is one the reader just created in the list
                    above, and `noVisitsSelected` names the fix rather than leaving a dead
                    green button to be poked at. */}
                <Button
                  disableRipple
                  variant="primary"
                  disabled={!workedDays.length || !flow.scopeVisits.length}
                  onClick={actions.run}
                >
                  {tt('harmonize')}
                </Button>
              </>
            ) : null}

            {state === FLOW_STATE.COMPUTING ? (
              <Button disableRipple variant="secondaryGrey" onClick={actions.cancel}>
                {tt('stop')}
              </Button>
            ) : null}

            {isProposal ? (
              <>
                {/* **`Back`, not `Discard`.** `actions.cancel` only changes which state is
                    on screen — the range, the pins, the set-asides and the accepted
                    overruns all survive the trip, so a planner can adjust the range and
                    re-harmonize without losing what they had already decided. `Discard`
                    said the opposite of that: the one word that most reads as "throw this
                    away" on a control that throws nothing away. Left-aligned
                    (`footerBackButton`), apart from `Apply`, the way a step backward and a
                    step forward read in every other multi-step flow in the app. */}
                <Button
                  disableRipple
                  variant="secondaryGrey"
                  className={classes.footerBackButton}
                  onClick={actions.cancel}
                >
                  {tt('backToScope')}
                </Button>
                <Button
                  disableRipple
                  variant="primary"
                  disabled={!plan.runsheets.length}
                  onClick={actions.apply}
                >
                  {/* **`routes`, not `runsheets`.** The surface title went `Proposed
                      runsheets` → `Proposed Routes` on instruction, and this button was the
                      other half of the same word: a screen headed Routes whose primary
                      action applied runsheets. `runsheet` is the *model's* noun — it is
                      still what `plan.runsheets` is called and still the right word in the
                      grid behind — but it is not the word this drawer speaks. `harmonizeSplit`
                      had already made the same call with its own `applyRoutes` key. */}
                  {tt('applyRoutes', { count: plan.runsheets.length })}
                </Button>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
    </DetailDrawer>
  );
};

HarmonizeDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  /** Handed the finished plan. The caller animates the calendar with it. */
  onApplied: PropTypes.func,
  /** Days, shift hours and zones are Config A — this is the route to where they live. */
};

export default HarmonizeDrawer;
