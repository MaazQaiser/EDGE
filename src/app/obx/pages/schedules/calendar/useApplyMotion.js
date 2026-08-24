import { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';

/**
 * Apply, as what actually happens: **a write to another system, then a reload.**
 *
 * ## What this replaced, and why
 *
 * The previous version was a three-beat choreography on the grid itself — a gloss swept
 * every card, then the movers lifted off their old day, then a photograph of each one flew
 * across the week and set down in its new column. It was a FLIP animation: measure every
 * card, clone it, position the clones in a floating layer, animate them to rectangles
 * measured *after* React had re-rendered the week, then unpick all of it. Around three
 * hundred lines across the hook, the grid and the stylesheet, plus a retry loop for the
 * frames where the destination had not laid out yet.
 *
 * It was replaced on instruction with something simpler, and the simpler thing is also the
 * more truthful one. **Routes are not moved by this application.** Applying sends them to
 * the scheduling system that owns them and then re-reads the week back. The flight animation
 * dramatised a local rearrangement that does not exist; a save and a reload is the event.
 *
 * ## The two beats
 *
 *   **saving**  — the plan is going to the other system. The grid is covered by a skeleton
 *                 of itself and the caption names what is being written and where.
 *   **loading** — it has been accepted, and the week is being read back. Same skeleton, a
 *                 caption that has moved on.
 *
 * Then the skeleton clears and the grid is the new week.
 *
 * ## The relocation is invisible on purpose
 *
 * It happens at the turn between the two beats, **under the skeleton**. That is the whole
 * reason this can be three dozen lines where the last one was three hundred: nothing has to
 * be measured, cloned or flown, because at the moment the arrangement changes there is
 * nothing on screen to animate *from*. The skeleton is not decoration hiding a shortcut — a
 * reload genuinely does not show you the old data rearranging itself.
 *
 * ## What is lost, and the trade
 *
 * The old sequence showed *five scattered days becoming one trip*, which is the thing the
 * feature exists to do. This one does not; it shows a save. The planner has, though, just
 * spent a minute reading that exact rearrangement in the proposal, per route and per stop —
 * the flight was the third telling of it, and it was the one costing a retry loop.
 *
 * **Reduced motion writes and reloads with no skeleton at all** — the two beats are the
 * telling, and a reader who has turned motion off wants the new week, not a shorter wait
 * for it.
 */

/**
 * How long the write is shown for.
 *
 * Long enough to read a sentence naming the system being written to, which is the one thing
 * this beat exists to say. Shorter and it is a flash nobody can attribute a cause to; much
 * longer and a demo is waiting on a timer for no reason, since nothing is actually in
 * flight. When this is wired to a real endpoint, this constant goes and the phase ends when
 * the request settles.
 */
const SAVE_MS = 1400;

/**
 * How long the read-back is shown for.
 *
 * Shorter than the write. Fetching is the cheaper half in reality, and by this point the
 * planner is waiting for a result rather than reading a caption.
 */
const LOAD_MS = 1100;

export const APPLY_PHASE = {
  IDLE: 'idle',
  SAVING: 'saving',
  LOADING: 'loading',
};

/**
 * @param {object} params
 * @param {Function} params.onRelocate Called at the turn between the two beats, with the
 *                                     applied routes. Performs the move. Its return value
 *                                     is no longer read — the landing stagger that needed a
 *                                     `moves` map is gone with the flights.
 */
export const useApplyMotion = ({ onRelocate }) => {
  const [phase, setPhase] = useState(APPLY_PHASE.IDLE);
  /** How many routes are being written, for the caption to name. */
  const [routeCount, setRouteCount] = useState(0);
  const timers = useRef([]);

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  /* A calendar that unmounts mid-sequence — a tab change, a navigation — must not leave
     timers behind that call `setState` on a component that has gone. */
  useEffect(() => clear, []);

  const start = useCallback(
    (routes = []) => {
      clear();

      if (prefersReducedMotion()) {
        onRelocate?.(routes);
        setPhase(APPLY_PHASE.IDLE);
        return;
      }

      setRouteCount(routes.length);
      setPhase(APPLY_PHASE.SAVING);

      timers.current.push(
        window.setTimeout(() => {
          /* Under the skeleton. See the note above — this being unwatched is what lets the
             whole flight apparatus go. */
          onRelocate?.(routes);
          setPhase(APPLY_PHASE.LOADING);
        }, SAVE_MS),
      );

      timers.current.push(window.setTimeout(() => setPhase(APPLY_PHASE.IDLE), SAVE_MS + LOAD_MS));
    },
    [onRelocate],
  );

  return { phase, routeCount, start, isRunning: phase !== APPLY_PHASE.IDLE };
};
