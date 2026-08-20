import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { drawDurationMs, prefersReducedMotion } from './routeMotion';

/**
 * The drawer's reveal, as one clock.
 *
 * Opening harmonize is the moment the feature makes its case, and it has three
 * beats. This hook owns all three, because the alternative — each component
 * running its own timer — is how two halves of a screen end up telling the same
 * story out of step, which is worse than not animating at all (`routeMotion`'s
 * own note).
 *
 *   **composing** — the drawer holds the question and nothing else: the plan
 *                   window, the days, where the day starts. The body is the
 *                   optimizer, working, with a single line under it naming what
 *                   it is doing right now. One line, replaced — not a stack —
 *                   because a list that grows while you read it is a list you
 *                   stop reading.
 *   **drawing**    — the map arrives with the answer already on it: the route
 *                   line draws from the start point outward, each pin landing as
 *                   the line reaches it, and the stops below resolve out of
 *                   skeletons on the same clock. Row *n* and pin *n* are the
 *                   same instant.
 *   **ready**      — the motion stops. That is the signal: an avatar that has
 *                   settled is what says the numbers above it are final.
 *
 * **The full sequence plays on open, and only on open.** A re-solve — a re-dated
 * route, a new start point, a stop moved out — is a *diff*, and replaying two
 * seconds of reveal over a diff is both slow and disorienting; the planner is
 * comparing two answers, not watching one arrive. Edits therefore get a short
 * `resolving` blip and the map's fast redraw, and the reveal stays where it
 * belongs, which is the first time.
 *
 * **Reduced motion goes straight to `ready`.** Someone who asked for less
 * movement did not ask for less explanation, so every line the reveal would have
 * spoken is still on screen, as the record under "show working".
 */

/**
 * One status line, held long enough to **read out loud**.
 *
 * This has now been tuned twice in opposite directions and the second time is the one to
 * keep. It was 620ms for four lines, then 440ms when the harmonization rule made it six,
 * on a budget of "the whole composition in about two and a half seconds" — the right
 * instinct for a planner who runs this twenty times a day and the wrong one for what
 * this screen is doing now, which is being *presented*. Six lines in 2.6 seconds is a
 * flicker: a viewer seeing the drawer for the first time has not finished reading line
 * one before line three is up, and the presenter cannot talk over it.
 *
 * 900ms is about the pace of a spoken sentence. It is deliberately not derived from a
 * total budget any more, because the total is not the thing being optimised — the
 * legibility of each line is, and the number of lines is small and fixed.
 *
 * **Exported** because the line's own fade is timed to it. The stage fades each line in and
 * back out inside its slot, and a fade whose duration is written down twice is a fade that
 * will eventually be cut off mid-word by the next line arriving.
 */
export const LINE_MS = 900;

/** How long an edit is allowed to look like it is being reconsidered. */
const RESOLVE_MS = 380;

export const REVEAL = {
  COMPOSING: 'composing',
  DRAWING: 'drawing',
  RESOLVING: 'resolving',
  READY: 'ready',
};

/**
 * @param {object} params
 * @param {string} params.runKey    Identity of this *sitting* — a new set of
 *                                  visits. Changing it replays the whole reveal.
 * @param {string} params.solveKey  Identity of the current *answer*. Changing it
 *                                  while ready is an edit, not an arrival.
 * @param {boolean} params.enabled  Off while the drawer is closed.
 * @param {number} params.lineCount How many status lines there are to speak.
 * @param {number} params.stopCount Stops on the route being drawn — the row
 *                                  reveal and the map's line share its clock.
 * @param {number} params.drawFromLine Which line the route starts drawing on.
 *                                  Defaults to after the last one.
 */
export const useHarmonizeReveal = ({
  runKey,
  solveKey,
  enabled,
  lineCount = 0,
  stopCount = 0,
  drawFromLine,
}) => {
  const [stage, setStage] = useState(REVEAL.COMPOSING);
  const [lineIndex, setLineIndex] = useState(0);
  const [stopsRevealed, setStopsRevealed] = useState(0);
  const timers = useRef([]);

  /* Whether this sitting has already had its reveal. Held in a ref rather than
     state because it must not itself cause a render — it is the answer to "is
     this an arrival or an edit", asked by an effect. */
  const revealed = useRef(false);

  /* The last answer this hook saw. `null` means it has not seen one yet, which is
     the case the edit effect has to recognise: React runs every effect on mount,
     so without this the *first* solve looks like a change to it. That went unseen
     on the animated path — `revealed` is still false there when the edit effect
     first runs — and fired on the reduced-motion path, where the arrival is
     resolved synchronously, giving the one reader who asked for no movement a
     spurious 380ms of it. */
  const lastSolveKey = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  const after = (ms, fn) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /* --- the arrival --- */
  useEffect(() => {
    clearTimers();
    revealed.current = false;
    /* A new sitting has not been edited yet, so the first answer it produces must
       not read as one. */
    lastSolveKey.current = null;

    if (!enabled) {
      setStage(REVEAL.COMPOSING);
      setLineIndex(0);
      setStopsRevealed(0);
      return undefined;
    }

    /* Nothing to say and nothing to draw. Skipping to ready keeps the empty and
       no-start-point states from sitting behind two seconds of theatre about a
       plan that does not exist. */
    if (!lineCount || prefersReducedMotion()) {
      revealed.current = true;
      setStage(REVEAL.READY);
      setLineIndex(Math.max(0, lineCount - 1));
      setStopsRevealed(Infinity);
      return undefined;
    }

    setStage(REVEAL.COMPOSING);
    setLineIndex(0);
    setStopsRevealed(0);

    for (let index = 1; index < lineCount; index += 1) {
      after(LINE_MS * index, () => setLineIndex(index));
    }

    /**
     * **The route draws on the line that announces it, not after the last one.**
     *
     * The narration is now a funnel — what there is, what may legally move to this day,
     * what is close enough, how long it takes, sequencing it, whether it fits — and the
     * map follows it step by step. So drawing cannot wait for the whole speech: the line
     * has to start travelling as *"Sequencing 6 stops"* is being said, with the last line
     * or two landing while it travels. The caller names that line; without it the
     * behaviour is what it always was, drawing after the last line.
     */
    const drawAt = Number.isFinite(drawFromLine)
      ? Math.max(0, Math.min(lineCount, drawFromLine))
      : lineCount;
    const composingMs = LINE_MS * drawAt;

    /* The rows and the map's line begin at the same instant, so the line drawing itself
       across the map and the rows resolving beneath it are one gesture. */
    after(composingMs, () => setStage(REVEAL.DRAWING));

    const drawMs = drawDurationMs(stopCount);
    for (let index = 1; index <= stopCount; index += 1) {
      after(composingMs + (index / Math.max(1, stopCount)) * drawMs, () => setStopsRevealed(index));
    }

    /* **Every line gets its full time, even the ones spoken over the draw.** With the
       draw starting on line five, the last line landed less than a second before `ready`
       swapped the whole stage out from under it — the one line stating the conclusion was
       the one nobody could finish reading. Ready is therefore whichever comes later: the
       drawing finishing, or the last line having been up as long as every other line. */
    after(Math.max(composingMs + drawMs, LINE_MS * lineCount + 240), () => {
      revealed.current = true;
      setStage(REVEAL.READY);
      setStopsRevealed(Infinity);
    });

    return clearTimers;
    // `stopCount` is deliberately absent: it settles a render or two after the
    // visits do, and re-running would restart the reveal from line one.
    // eslint-disable-next-line
  }, [runKey, enabled, lineCount]);

  /* --- the edit ---
     A brief acknowledgement that the question changed, and then the answer. No
     stage replay: the map's own redraw is 240ms and the rows travel rather than
     re-enter, which is what makes a small change legible. */
  useEffect(() => {
    const isFirstAnswer = lastSolveKey.current === null;
    lastSolveKey.current = solveKey;

    if (isFirstAnswer || !enabled || !revealed.current) return undefined;
    if (prefersReducedMotion()) return undefined;

    setStage(REVEAL.RESOLVING);
    const timer = window.setTimeout(() => setStage(REVEAL.READY), RESOLVE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line
  }, [solveKey]);

  /**
   * Past the introduction, on request.
   *
   * The run is solved before the first line is spoken — the narration explains an answer
   * that already exists — so a planner who has seen it once is being made to wait on
   * nothing. Cancelling the timers and jumping to `ready` is therefore not a shortcut
   * around anything: every line the reveal would have spoken is still on the record under
   * "how this was worked out", and the map lands on the same frame it would have reached.
   *
   * `revealed` is set so this sitting is not replayed, and so the *next* change to the
   * answer is treated as the edit it is rather than as a first arrival.
   */
  const skip = useCallback(() => {
    clearTimers();
    revealed.current = true;
    setStage(REVEAL.READY);
    setLineIndex((previous) => Math.max(previous, 0));
    setStopsRevealed(Infinity);
  }, []);

  return useMemo(() => {
    const isComposing = stage === REVEAL.COMPOSING;

    return {
      stage,
      isComposing,
      /* The avatar keeps moving through the draw and stops when the plan is
         final — the two are the same event, seen twice. */
      isWorking: isComposing || stage === REVEAL.DRAWING || stage === REVEAL.RESOLVING,
      isReady: stage === REVEAL.READY,
      /* The map reads this to know whether to draw a sequence or a set of candidates. */
      isDrawing: stage === REVEAL.DRAWING,
      /* The route cards and the footer appear together with the line being drawn: they
         are views of one answer, and staging them apart would read as separate things
         loading. The *map* no longer waits for any of it — it is mounted from the first
         frame now, because it is where the working-out is shown. */
      showPlan: !isComposing,
      lineIndex,
      /* `Infinity` once ready, so a route the planner expands later is not
         drip-fed rows it has no reason to withhold. */
      stopsRevealed,
      skip,
    };
  }, [stage, lineIndex, stopsRevealed, skip]);
};
