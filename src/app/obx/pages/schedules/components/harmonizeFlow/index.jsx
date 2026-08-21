import { Box, Button, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import DetailDrawer from 'src/app/components/common/rightDrawer';

import CommitState from './components/CommitState';
import ComputingState from './components/ComputingState';
import DayPane from './components/DayPane';
import DayTabs from './components/DayTabs';
import ExitPanel from './components/ExitPanel';
import { CloseIcon } from './components/Glyphs';
import ScopeState from './components/ScopeState';
import TrayPane from './components/TrayPane';
import { useStyles } from './harmonizeFlow.styles';
import { formatCompact } from './model/durations';
import { SITES, VISITS } from './model/fixtures';
import { legalDaysFor } from './model/planner';
import { FLOW_STATE, TRAY, useHarmonizeFlow } from './useHarmonizeFlow';

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
const HarmonizeDrawer = ({ open, onClose, onApplied, onOpenSettings }) => {
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

  /* Every visit's legal days, once per render: the window strip on each stop needs it,
     the tray needs it, and X1 needs it to know whether `Move day` can be offered. */
  const legalDaysByVisit = useMemo(
    () =>
      Object.fromEntries(
        VISITS.map((v) => [
          v.id,
          legalDaysFor(v, SITES.find((s) => s.id === v.siteId) || {}, days),
        ]),
      ),
    [days],
  );

  const openSheet = plan.runsheets.find((r) => r.date === openDay) || null;

  /* The stop the shift expires during — derived, so the sentence naming it stays true
     when the sequence changes rather than pointing at a fixed index. */
  const tippingStop = openSheet?.overrunMins
    ? openSheet.stops.find((s) => s.departMins > openSheet.shiftMins)
    : null;

  const dragVisit = useMemo(() => {
    if (!drag?.visitId) return null;
    const placed = plan.runsheets.flatMap((r) => r.stops).find((s) => s.visit.id === drag.visitId);
    return placed || plan.unplaced.find((u) => u.visit.id === drag.visitId) || null;
  }, [drag, plan]);

  const movedCount = useMemo(
    () =>
      plan.runsheets.flatMap((r) => r.stops.map((s) => s.visit.dueDate !== r.date)).filter(Boolean)
        .length,
    [plan],
  );

  const isProposal = state === FLOW_STATE.PROPOSAL;
  const startMove = (visitId) => flow.setDrag({ visitId, overDate: null });

  const title = {
    [FLOW_STATE.SCOPE]: tt('titleScope'),
    [FLOW_STATE.COMPUTING]: tt('titleComputing'),
    [FLOW_STATE.PROPOSAL]: tt('titleProposal'),
    [FLOW_STATE.COMMIT]: tt('titleCommit', {
      runsheets: tt('count.runsheet', { count: plan.runsheets.length }),
    }),
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
        <Box className={classes.head}>
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

          {/* The headline lives here now, as the drawer's own subtext, rather than in a
              row of stat tiles. §14.4 still holds — it leads with **hours**, because the
              cost model says filters drive time and a visit count treats an 8-filter data
              centre and a 1-filter library as the same event. */}
          {subtitle ? <Typography className={classes.subtitle}>{subtitle}</Typography> : null}

          {isProposal ? (
            <DayTabs
              classes={classes}
              runsheets={plan.runsheets}
              unplaced={plan.unplaced}
              openDay={openDay}
              onOpenDay={flow.setOpenDay}
              accepted={flow.accepted}
              drag={drag}
              quotesForDrag={flow.quotesForDrag}
              onDropOn={actions.commitDrag}
              onDragOverDay={(date) => flow.setDrag((d) => (d ? { ...d, overDate: date } : d))}
            />
          ) : null}
        </Box>

        <Box
          className={classes.body}
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
              onOpenSettings={onOpenSettings}
              onShiftRange={actions.shiftRange}
            />
          ) : null}

          {state === FLOW_STATE.COMPUTING ? (
            <ComputingState
              classes={classes}
              line={flow.revealLines[Math.min(flow.step, flow.revealLines.length - 1)]}
              lineIndex={Math.min(flow.step, flow.revealLines.length - 1)}
              lineCount={flow.revealLines.length}
              holdMs={flow.lineMs}
            />
          ) : null}

          {isProposal && openDay === TRAY ? (
            <TrayPane
              classes={classes}
              unplaced={plan.unplaced}
              onRestore={actions.restoreVisit}
              onDragStart={startMove}
              onDragEnd={() => flow.setDrag(null)}
              onWorkZone={onOpenSettings}
            />
          ) : null}

          {isProposal && openSheet ? (
            <DayPane
              classes={classes}
              sheet={openSheet}
              legalDaysByVisit={legalDaysByVisit}
              accepted={flow.accepted}
              draggingId={drag?.visitId}
              onDragStart={startMove}
              onDragEnd={() => flow.setDrag(null)}
              onStartMove={startMove}
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
              tippingLegalDays={tippingStop ? legalDaysByVisit[tippingStop.visit.id] : []}
              drag={drag}
              dragQuote={dragQuote}
              dragVisit={dragVisit}
              onAccept={actions.acceptOverrun}
              onUnaccept={actions.unacceptOverrun}
              onRaise={actions.raiseHours}
              onRestoreHours={actions.restoreHours}
              onSetAside={actions.setAsideVisit}
              onCancelDrag={() => flow.setDrag(null)}
              onConfirmDrag={actions.commitDrag}
              onStartMove={startMove}
            />
          ) : null}

          {state === FLOW_STATE.COMMIT ? (
            <CommitState
              classes={classes}
              plan={plan}
              accepted={flow.accepted}
              movedCount={movedCount}
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

        <Box className={classes.footer}>
          {state === FLOW_STATE.SCOPE ? (
            <>
              <Button disableRipple variant="secondaryGrey" onClick={onClose}>
                {tt('cancel')}
              </Button>
              <Button
                disableRipple
                variant="primary"
                disabled={!workedDays.length}
                onClick={actions.run}
              >
                {tt('harmonize')}
              </Button>
            </>
          ) : null}

          {state === FLOW_STATE.COMPUTING ? (
            <>
              <Typography className={classes.footerNote}>{tt('nothingWritten')}</Typography>
              <Button disableRipple variant="secondaryGrey" onClick={actions.cancel}>
                {tt('stop')}
              </Button>
            </>
          ) : null}

          {isProposal ? (
            <>
              <Button disableRipple variant="secondaryGrey" onClick={actions.cancel}>
                {tt('discard')}
              </Button>
              <Button
                disableRipple
                variant="primary"
                disabled={!plan.runsheets.length}
                onClick={actions.review}
              >
                {tt('applyN', {
                  runsheets: tt('count.runsheet', { count: plan.runsheets.length }),
                })}
              </Button>
            </>
          ) : null}

          {state === FLOW_STATE.COMMIT ? (
            <>
              <Button disableRipple variant="secondaryGrey" onClick={actions.backToProposal}>
                {tt('backToProposal')}
              </Button>
              <Button disableRipple variant="primary" onClick={actions.apply}>
                {tt('apply')}
              </Button>
            </>
          ) : null}
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
  onOpenSettings: PropTypes.func,
};

export default HarmonizeDrawer;
