import { Box, Button, Typography } from '@mui/material';
import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { capacityDelta, formatCompact } from '../model/durations';
import { zoneName } from '../model/fixtures';

/**
 * The decision box: **what happened · what it means · what you can do.**
 *
 * ## The structure is unchanged. The treatment is.
 *
 * It carries the E1 sequence — raise the day's hours · accept the overrun · move the work
 * · set it aside — and ④'s move preview, because they occupy the same slot: at any moment
 * there is one thing the planner is deciding, and it belongs in one place under the work
 * it is about.
 *
 * What changed is the weight. It was a filled amber card with four equally-weighted
 * outlined buttons in a row, and it had three problems:
 *
 * 1. **The fill collided with the work.** It sits directly beneath a stop list that
 *    already marks the tipping stop in amber; two amber fills touching read as one block,
 *    and the notice ended up louder than the route it was about. Now it is a white card
 *    with a **3px edge** in the state's colour — the same device the stop rail uses, so
 *    the two agree instead of competing.
 * 2. **Four equal buttons made the planner read all four, every time.** Exactly one is
 *    the likely answer at any moment. So: one filled primary, and the rest as text
 *    actions. The others cost a click they were going to make deliberately anyway.
 * 3. **A disabled control explained itself in a separate italic line at the bottom**, as
 *    far from the greyed-out button as the box allowed. The reason now sits directly
 *    under the row, which is the only place it reads as belonging to that control.
 *
 * The colour rule is unchanged and still worth stating: **amber for the overrun** (D3
 * makes the cap soft — red would say "you cannot", which is what D3 spent a decision
 * denying), **red for refusals only** (a wrong-zone drop is the one genuinely impossible
 * action here), **green when the problem is gone**, **grey when the decision is settled**.
 */
const ExitPanel = ({
  classes,
  sheet,
  accepted,
  raisedFrom,
  tippingStop,
  tippingLegalDays,
  drag,
  dragQuote,
  dragVisit,
  onAccept,
  onUnaccept,
  onRaise,
  onRestoreHours,
  onSetAside,
  onCancelDrag,
  onConfirmDrag,
  onStartMove,
}) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const primary = (label, onClick) => (
    <Button disableRipple variant="primary" onClick={onClick}>
      {label}
    </Button>
  );
  const text = (label, onClick, disabled) => (
    <Box
      component="button"
      type="button"
      className={classes.textAction}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </Box>
  );

  /* ── ④ — a move is in flight, so the box is the move preview ─────────────────
     It outranks the overrun: while the planner is holding a stop, their question is
     "what does this cost", not "what shall I do about Monday". */
  if (drag?.visitId && dragVisit) {
    const target = drag.overDate;

    if (!target) {
      return (
        <Box className={classNames(classes.decision, classes.decisionNeutral)}>
          <Typography className={classes.decisionTitle}>
            {tt('movePrompt', { site: dragVisit.site?.name })}
          </Typography>
          <Typography className={classes.decisionBody}>{tt('moveDayHint')}</Typography>
          <Box className={classes.decisionActions}>{text(tt('cancelMove'), onCancelDrag)}</Box>
        </Box>
      );
    }

    if (!dragQuote?.legal) {
      return (
        <Box className={classNames(classes.decision, classes.decisionRefused)}>
          <Typography className={classes.decisionTitle}>
            {tt('moveRefusedTitle', { day: dayjs(target).format('ddd D') })}
          </Typography>
          {/* Both halves of the rule, because naming only the failing one leaves the
              planner wondering whether the other would have failed too. */}
          <Typography className={classes.decisionBody}>
            {tt(`moveRefused.${dragQuote?.reason || 'notWorked'}`, {
              day: dayjs(target).format('ddd D'),
              siteZone: zoneName(dragVisit.site?.zoneId),
            })}
          </Typography>
          <Box className={classes.decisionActions}>{text(tt('cancelMove'), onCancelDrag)}</Box>
        </Box>
      );
    }

    const sourceAfter = dragQuote.source?.after;
    const sourceDelta = sourceAfter
      ? capacityDelta(sourceAfter.durationMins, dragQuote.source.before.shiftMins)
      : null;

    return (
      <Box className={classNames(classes.decision, classes.decisionNeutral)}>
        <Typography className={classes.decisionTitle}>
          {tt('moveTitle', { site: dragVisit.site?.name, day: dayjs(target).format('ddd D') })}
        </Typography>
        {/* The price, in the one place on screen with room to state it in full — this is
            why the tabs no longer try to carry it. */}
        <Typography className={classes.dropHint}>
          {tt('quoteHere', { delta: formatCompact(Math.abs(dragQuote.target.deltaMins)) })}
        </Typography>
        <Typography className={classes.decisionBody}>
          {tt('moveBody', {
            source: dayjs(dragQuote.source?.date).format('ddd'),
            sourceAfter: formatCompact(sourceAfter?.durationMins || 0),
            sourceWord: tt(sourceDelta?.direction || 'spare', {
              amount: formatCompact(sourceDelta?.magnitude || 0),
            }),
            target: dayjs(target).format('ddd'),
            targetAfter: formatCompact(dragQuote.target.after.durationMins),
          })}
        </Typography>
        <Typography className={classes.decisionNote}>{tt('manualIsFinal')}</Typography>
        <Box className={classes.decisionActions}>
          {primary(tt('dropOn', { day: dayjs(target).format('ddd D') }), () =>
            onConfirmDrag(target),
          )}
          {text(tt('cancelMove'), onCancelDrag)}
        </Box>
      </Box>
    );
  }

  if (!sheet) return null;

  const delta = capacityDelta(sheet.durationMins, sheet.shiftMins);
  const wasRaised = raisedFrom[sheet.date] !== undefined;
  const isAccepted = accepted.includes(sheet.date);

  /* ── X3 — the hours were raised and the day is clear ───────────────────────── */
  if (wasRaised && !delta.isOver) {
    return (
      <Box className={classNames(classes.decision, classes.decisionResolved)}>
        <Typography className={classes.decisionTitle}>
          {tt('raisedTitle', {
            day: dayjs(sheet.date).format('ddd'),
            from: formatCompact(raisedFrom[sheet.date]),
            to: formatCompact(sheet.shiftMins),
          })}
        </Typography>
        <Typography className={classes.decisionBody}>
          {tt('raisedBody', { spare: formatCompact(delta.magnitude) })}
        </Typography>
        {/* D6 — the run config does not write back to settings — and D5, the one exit
            that legitimately re-ran the engine. */}
        <Typography className={classes.decisionNote}>
          {tt('raisedNote', { original: formatCompact(raisedFrom[sheet.date]) })}
        </Typography>
        <Box className={classes.decisionActions}>
          {text(tt('backToHours', { hours: formatCompact(raisedFrom[sheet.date]) }), () =>
            onRestoreHours(sheet.date),
          )}
          {text(tt('alsoChangeSettings'), undefined, true)}
          <Typography className={classes.actionReason}>
            {tt('alsoChangeSettingsUnavailable')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!delta.isOver) return null;

  /* ── X2 — accepted. Same numbers, quieter voice. ────────────────────────────
     N4's finding: an accepted overrun is a settled decision, not an open alarm. The
     numbers do not move; the edge goes grey and only Undo remains. */
  if (isAccepted) {
    return (
      <Box className={classNames(classes.decision, classes.decisionSettled)}>
        <Typography className={classes.decisionTitle}>
          {tt('acceptedTitle', { amount: formatCompact(delta.magnitude) })}
        </Typography>
        <Typography className={classes.decisionBody}>
          {tt('acceptedBody', { day: dayjs(sheet.date).format('dddd') })}
        </Typography>
        <Box className={classes.decisionActions}>
          {text(tt('undo'), () => onUnaccept(sheet.date))}
        </Box>
      </Box>
    );
  }

  /* ── X1 — discovered. Four exits, one of them the likely answer. ────────────
     `Raise to 6h` is the primary: it is the only exit that makes the problem *go away*
     rather than record it, and the next whole hour is the figure Config A is written in.
     Rounding up also guarantees the offered value clears the overrun, which an exact fit
     would only do until the sequence changed. */
  const raiseTo = Math.ceil(sheet.durationMins / 60) * 60;
  const canMove = tippingLegalDays.length > 1;

  return (
    <Box className={classes.decision}>
      <Typography className={classes.decisionTitle}>
        {tt('overrunTitle', {
          day: dayjs(sheet.date).format('dddd'),
          amount: formatCompact(delta.magnitude),
          shift: formatCompact(sheet.shiftMins),
        })}
      </Typography>
      {tippingStop ? (
        <Typography className={classes.decisionBody}>
          {tt('overrunBody', { site: tippingStop.site.name, index: tippingStop.index })}
        </Typography>
      ) : null}

      <Box className={classes.decisionActions}>
        {primary(tt('raiseTo', { hours: formatCompact(raiseTo) }), () =>
          onRaise(sheet.date, raiseTo),
        )}
        {text(tt('accept'), () => onAccept(sheet.date))}
        {text(tt('moveDay'), () => tippingStop && onStartMove(tippingStop.visit.id), !canMove)}
        {text(tt('setAside'), () => tippingStop && onSetAside(tippingStop.visit.id), !tippingStop)}
        {/* With the control it explains, not in its own row at the bottom. */}
        {!canMove && tippingStop ? (
          <Typography className={classes.actionReason}>
            {tt('moveUnavailable', { zone: zoneName(sheet.zoneId) })}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
};

ExitPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  sheet: PropTypes.object,
  accepted: PropTypes.array.isRequired,
  raisedFrom: PropTypes.object.isRequired,
  tippingStop: PropTypes.object,
  tippingLegalDays: PropTypes.array,
  drag: PropTypes.object,
  dragQuote: PropTypes.object,
  dragVisit: PropTypes.object,
  onAccept: PropTypes.func.isRequired,
  onUnaccept: PropTypes.func.isRequired,
  onRaise: PropTypes.func.isRequired,
  onRestoreHours: PropTypes.func.isRequired,
  onSetAside: PropTypes.func.isRequired,
  onCancelDrag: PropTypes.func.isRequired,
  onConfirmDrag: PropTypes.func.isRequired,
  onStartMove: PropTypes.func.isRequired,
};

ExitPanel.defaultProps = { tippingLegalDays: [] };

export default ExitPanel;
