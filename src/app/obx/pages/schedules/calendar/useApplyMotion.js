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
 *   **settling** — every visit card on screen goes quiet and shimmers. *Every* one,
 *                  not just the movers: at this moment the schedule is being
 *                  recomputed, and marking only the movers would be claiming to
 *                  know the outcome before showing it. It also stops the eye
 *                  hunting for which cards are about to change, which is a
 *                  distraction from watching them change.
 *   **landing**  — the visits are on their new days, and each one arrives with a
 *                  short stagger in its route's own order, so a column fills top
 *                  to bottom rather than appearing all at once.
 *
 * Then it is over and the cards are ordinary cards again. There is no third beat
 * and no success state: the calendar *is* the success state, which is the same
 * reason Apply closes the drawer instead of showing a confirmation.
 *
 * **Reduced motion moves the visits and skips both beats.** The relocation is the
 * information; the shimmer and the stagger are the telling of it.
 */

const SETTLE_MS = 620;
const LAND_MS = 900;

export const APPLY_PHASE = { IDLE: 'idle', SETTLING: 'settling', LANDING: 'landing' };

/**
 * @param {object} params
 * @param {Function} params.onRelocate Called at the turn between the two beats
 *                                     with the applied routes. Must perform the
 *                                     move and return the `moves` map, which is
 *                                     what the landing stagger is keyed on.
 */
export const useApplyMotion = ({ onRelocate }) => {
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

      setPhase(APPLY_PHASE.SETTLING);
      setMoves(new Map());

      timers.current.push(
        window.setTimeout(() => {
          /* The move happens here, between the beats — late enough that the
             shimmer was a real pause rather than a decoration over an already
             finished change, and early enough that the cards animate in *from*
             their new positions rather than travelling to them. */
          const applied = onRelocate?.(routes);
          setMoves(applied instanceof Map ? applied : new Map());
          setPhase(APPLY_PHASE.LANDING);
        }, SETTLE_MS),
      );

      timers.current.push(
        window.setTimeout(() => {
          setPhase(APPLY_PHASE.IDLE);
          setMoves(new Map());
        }, SETTLE_MS + LAND_MS),
      );
    },
    [onRelocate],
  );

  return { phase, moves, start, isRunning: phase !== APPLY_PHASE.IDLE };
};
