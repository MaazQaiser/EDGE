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
  tippingLegalDays = [],
  tippingWasForced = false,
  drag,
  dragVisit,
  onAccept,
  onUnaccept,
  onRaise,
  onRestoreHours,
  onSetAside,
  onReturnToTray,
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

  /**
   * ── ④ — **nothing is shown while a move is in flight.**
   *
   * This block used to be the move preview, and it was three panels: *Moving Kelvin Court*
   * with a hint while no day was hovered, a refusal naming which rule failed, and — over a
   * legal target — the full quote (`+1h 30m here`, what both days become, a note that manual
   * edits are final) with `Drop on Tue 18` and `Cancel` buttons.
   *
   * **Removed on instruction: "when dragging a visit in the day, do not show the message."**
   * Two things make that safe rather than merely obedient:
   *
   * - **`DayTabs` already carries the verdict.** Each tab paints `tabDropLegal` or
   *   `tabDropRefused` for the visit in flight and handles the drop itself, so the target is
   *   marked where the pointer is going rather than in a panel at the bottom of the drawer.
   * - **The refusal panel had almost nothing left to say.** Dropping is unrestricted now
   *   (see `droppableDatesFor`), so `wrongZone` and `outsideWindow` cannot come back — the
   *   panel's most informative branch was already unreachable.
   *
   * What genuinely went with it is the **priced quote before the drop** — §13.7's "the cost
   * of a move is visible before it is made". That cost is not gone from the product: the
   * move menu (`StopMoveMenu`) prints the same `priceMove` figure per day, in amber when the
   * day would end over. So the number moved from *after you pick up* to *before you pick*,
   * which is arguably the better moment; but on the **drag** path specifically it is now
   * absent, and the day going amber after the fact is the only feedback. That is the trade,
   * recorded here rather than discovered later.
   *
   * The screen-reader announcement in `index.jsx` is deliberately kept — it is not a visible
   * message, and it is the only thing making the drag usable without sight.
   */
  if (drag?.visitId && dragVisit) return null;

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
      {/**
       * **Two different sentences, because there are now two different causes.**
       *
       * The day used to be able to arrive over its shift on its own — the engine placed
       * everything legal and reported the overrun. It cannot any more: `splitOverspill`
       * fits every day to its hours before ③ draws it, so an overrun exists only where the
       * planner put work back that the fitter had lifted off. That has an author and a
       * name, and saying so is the difference between *the plan overran* and *you asked
       * for this, here is what it costs.*
       *
       * The generic sentence is kept for the case that survives: a day whose *own*
       * arithmetic cannot fit even one stop, where nothing was forced and the shift is
       * simply too short for the work its zone demands.
       */}
      {tippingStop ? (
        <Typography className={classes.decisionBody}>
          {tippingWasForced
            ? tt('overrunForcedBody', { site: tippingStop.site.name })
            : tt('overrunBody', { site: tippingStop.site.name, index: tippingStop.index })}
        </Typography>
      ) : null}

      <Box className={classes.decisionActions}>
        {/* `Raise to 6h` stays primary, and forced work is the reason it deserves to be:
            the planner has just said this work belongs on this day, so the exit that makes
            that legitimate is the one they want — not the one that undoes what they did.
            The next whole hour, because Config A is written in whole hours and rounding up
            guarantees the offered value clears the overrun where an exact fit would only
            do so until the sequence changed. */}
        {primary(tt('raiseTo', { hours: formatCompact(raiseTo) }), () =>
          onRaise(sheet.date, raiseTo),
        )}
        {text(tt('accept'), () => onAccept(sheet.date))}
        {text(tt('moveDay'), () => tippingStop && onStartMove(tippingStop.visit.id), !canMove)}
        {/* **`Set aside` and `Back to the tray` are the same slot and not the same act.**
            Setting a visit aside says *this is not served this week*; sending forced work
            back to the tray says *not on this day* and leaves it exactly where the fitter
            had it — still legal, still waiting for hours. Offering the destructive verb for
            a reversible action the planner performed thirty seconds ago would be the wrong
            one to reach for. */}
        {tippingWasForced
          ? text(tt('backToTray'), () => tippingStop && onReturnToTray(tippingStop.visit.id))
          : text(
              tt('setAside'),
              () => tippingStop && onSetAside(tippingStop.visit.id),
              !tippingStop,
            )}
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
  /** Whether the tipping stop is there because the planner put it back — see `overspill.js`. */
  tippingWasForced: PropTypes.bool,
  drag: PropTypes.object,
  dragVisit: PropTypes.object,
  onAccept: PropTypes.func.isRequired,
  onUnaccept: PropTypes.func.isRequired,
  onRaise: PropTypes.func.isRequired,
  onRestoreHours: PropTypes.func.isRequired,
  onSetAside: PropTypes.func.isRequired,
  onReturnToTray: PropTypes.func.isRequired,
  onStartMove: PropTypes.func.isRequired,
};

export default ExitPanel;
