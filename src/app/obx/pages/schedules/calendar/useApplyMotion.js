import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';

/**
 * The calendar taking the plan on, in two beats.
 *
 * Apply used to be instantaneous and invisible: the drawer closed, a toast said
 * how many visits went where, and the calendar underneath carried on showing the
 * old week. The one thing the feature exists to demonstrate — five scattered days
 * becoming one or two trips — was the one thing never shown.
 *
 *   **settling**  — a slow gloss crosses every visit card on screen, staggered by how far
 *                   across the grid it sits so the pass reads as one wave crossing the week.
 *                   *Every* card, not just the movers: at this moment the schedule is being
 *                   recomputed, and marking only the movers would be claiming to know the
 *                   outcome before showing it. It also stops the eye hunting for which cards
 *                   are about to change, which is a distraction from watching them change.
 *   **departing** — the movers, and only the movers, lift off the day they are on: up a
 *                   little, forward a little, and half out of the page. Nothing has moved in
 *                   the data yet. This beat exists because **it is the only moment the old
 *                   arrangement is still on screen and already known to be wrong**, and the
 *                   whole difficulty of the landing beat — see the grid's `runLanding` — is
 *                   that by the time the visits have moved, where they came from is gone.
 *                   Here it is still there to be measured, photographed and animated.
 *   **landing**   — the visits are on their new days, and each one arrives from where it
 *                   was: a copy of the card taken during the departure flies to the new
 *                   column and sets down, staggered in its route's own order so a day fills
 *                   top to bottom. A mover whose journey cannot be worked out fades up in
 *                   place instead, which is the arrival this beat had before flights.
 *
 * Then it is over and the cards are ordinary cards again. There is no third beat
 * and no success state: the calendar *is* the success state, which is the same
 * reason Apply closes the drawer instead of showing a confirmation.
 *
 * **And no second beat before it either, as of the ⑤ removal.** There used to be a review
 * screen between the proposal and this, listing what would move and what would be left. It
 * restated a plan the operator had just finished reading, and it put two clicks between
 * deciding and seeing. Everything it described is what these two beats now show happening,
 * which is the argument the drawer's own note makes about why there is no ⑥ either.
 *
 * **Reduced motion moves the visits and skips both beats.** The relocation is the
 * information; the gloss and the flights are the telling of it.
 */

/**
 * How long the gloss runs before the visits move.
 *
 * **2150ms.** It has been 620, 1100 and 1450, and every one of those was shorter than one
 * pass of the thing it was timing, so the right-hand side of the grid was cut off mid-gloss
 * and the beat read as a flicker there.
 *
 * This number is arithmetic rather than taste now: the sweep takes **1800ms** to cross a
 * card and the rightmost cards start **300ms** after the leftmost (`APPLY_WAVE_MS` in the
 * grid), so 2100 is the first value at which every card finishes. The extra 50 is a pause
 * between the last card completing and the week rearranging — without it the cards move
 * while the far side is still lighting up, and the two beats read as one confused event
 * rather than as *thinking*, then *acting*.
 *
 * And this sequence is now the *whole* of Apply. The review screen that used to stand
 * between the proposal and this moment is gone, so there is no longer a step explaining what
 * is about to happen — the grid has to be legible on its own, which means the pause has to
 * be long enough to register as a pause. Just under two seconds end to end.
 */
const SETTLE_MS = 2150;

/**
 * How long the landing beat holds the cards.
 *
 * **1300ms.** The cards used to fade in where they had been put; they now fly from where
 * they were, and the flight has to *finish* inside this window — the phase going `IDLE`
 * cancels every flight in progress, and a cancelled flight takes its card straight to the
 * destination, which is the teleport this beat exists to remove.
 *
 * The budget, from the grid's own constants: 50ms of stagger per position capped at the
 * twelfth card (550ms), plus a 620ms flight, plus a few frames for the landing pass to find
 * the cards in their new places.
 */
const LAND_MS = 1300;

/**
 * How long the movers spend lifting off before the week rearranges.
 *
 * Short — this is a wind-up, not a beat in its own right, and the sequence is already
 * three-and-a-half seconds end to end. Long enough to see the cards pick themselves up and
 * to know *which* cards are about to move, which is the second thing this beat is for: it is
 * the only moment the grid says "these ones" while they are still in their old places.
 */
const DEPART_MS = 280;

export const APPLY_PHASE = {
  IDLE: 'idle',
  SETTLING: 'settling',
  DEPARTING: 'departing',
  LANDING: 'landing',
};

/**
 * @param {object} params
 * @param {Function} params.onPlan     Called at the *start*, with the applied routes. Must
 *                                     return the `moves` map **without changing anything** —
 *                                     the sequence needs to know which cards are leaving one
 *                                     beat before they leave, and asking the same question
 *                                     twice is cheaper than threading a plan through the
 *                                     page's state.
 * @param {Function} params.onRelocate Called at the turn between departing and landing with
 *                                     the applied routes. Performs the move and returns the
 *                                     `moves` map, which is what the landing stagger is keyed
 *                                     on.
 */
export const useApplyMotion = ({ onPlan, onRelocate }) => {
  const [phase, setPhase] = useState(APPLY_PHASE.IDLE);
  const [moves, setMoves] = useState(() => new Map());
  const timers = useRef([]);

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  /* A calendar that unmounts mid-sequence — a tab change, a navigation — must not
     leave timers behind that call `setState` on a gone component, and must not
     leave `data-applying` painted on nodes that outlive it either. The attribute
     cleanup belongs to the grid; the timers belong here. */
  useEffect(() => clear, []);

  const start = useCallback(
    (routes = []) => {
      clear();

      if (prefersReducedMotion()) {
        onRelocate?.(routes);
        setPhase(APPLY_PHASE.IDLE);
        setMoves(new Map());
        return;
      }

      /* Asked before anything moves, so the departing beat knows which cards are leaving.
         An empty plan here is worth saying out loud rather than playing a two-second
         sequence over a grid where nothing is going to happen: the shells that match their
         own fixture to this page's visits by *site name* produce exactly that when a name
         stops matching, and it is silent by design at every other layer. */
      const planned = onPlan?.(routes);
      const upcoming = planned instanceof Map ? planned : new Map();
      if (!upcoming.size && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[harmonize] Apply produced no moves — no visit on the grid matched the plan.',
          routes,
        );
      }

      setPhase(APPLY_PHASE.SETTLING);
      setMoves(upcoming);

      timers.current.push(window.setTimeout(() => setPhase(APPLY_PHASE.DEPARTING), SETTLE_MS));

      timers.current.push(
        window.setTimeout(() => {
          /* The move happens here, between the beats — late enough that the gloss was a real
             pause rather than a decoration over an already finished change, and late enough
             that the cards have visibly picked themselves up off the day they are leaving. */
          const applied = onRelocate?.(routes);
          setMoves(applied instanceof Map ? applied : upcoming);
          setPhase(APPLY_PHASE.LANDING);
        }, SETTLE_MS + DEPART_MS),
      );

      timers.current.push(
        window.setTimeout(
          () => {
            setPhase(APPLY_PHASE.IDLE);
            setMoves(new Map());
          },
          SETTLE_MS + DEPART_MS + LAND_MS,
        ),
      );
    },
    [onPlan, onRelocate],
  );

  return { phase, moves, start, isRunning: phase !== APPLY_PHASE.IDLE };
};
