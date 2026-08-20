/**
 * The route's motion, and the one clock the map and the stop list both run on.
 *
 * Two different events, deliberately animated differently:
 *
 * **A route arriving** (there was none, now there is) is the payoff of the whole
 * drawer — five scattered days becoming one trip. A route is an *order*, and order
 * is inherently temporal, so the reveal is sequential: the line draws from the start
 * point outward and each stop lands as the line reaches it. Simultaneous fades would
 * say "here is a picture"; this says "here is a journey".
 *
 * **A route changing** (option switched, stop moved out, day changed) is a *diff*.
 * Replaying the reveal there would be both slow and disorienting — the planner is
 * comparing two answers and needs the difference, not a performance. So a re-solve
 * redraws fast and lets the rows travel to their new positions, which is what makes
 * a small change legible (see `useFlipReorder`'s own note on churn).
 *
 * **The map and the list share this clock.** Stop *n*'s pin lands on the map at the
 * same instant row *n* arrives in the list, because both read `delayForIndex` from
 * here. Two halves of the screen telling one story is the whole trick; two halves
 * telling it on separate timers is worse than not animating at all.
 *
 * Everything here animates **only** `opacity`, `transform` and `stroke-dashoffset` —
 * paint and composite properties. Handoff §7.22 is explicit about the trap: a meter
 * rewritten to animate layout computed correctly and painted at zero width, and the
 * fix was no animation rather than a cleverer one. Note also what is deliberately
 * *not* animated here: the capacity meter. It is a readout and it should snap — a
 * number sliding towards its value is a number you cannot read yet.
 */

/**
 * **Paced for a room, not for a power user.**
 *
 * These were 380 / 900 / 60, tuned on the argument that past ~900ms a reveal stops
 * being feedback and becomes a cutscene. That argument holds for a planner running
 * twenty of these a day and is wrong for the situation this drawer is actually in: it
 * is being *demonstrated*, to people who have never seen it, while somebody talks over
 * it. At 900ms a six-stop route drew before a viewer had found the map.
 *
 * So the line takes about a second and a half to travel, and the pins land under it at
 * a pace you can follow. The route is the payoff of the whole feature; it is allowed to
 * take a moment. If it ever needs to be brisk again, these three numbers are the dial,
 * and `prefersReducedMotion` still skips all of it.
 */
const MIN_DRAW_MS = 900;
const MAX_DRAW_MS = 2200;
const PER_STOP_MS = 130;

/** A re-solve keeps up with the planner instead of performing for them. */
export const REDRAW_MS = 420;

/**
 * Decisive ease-out. Nothing here overshoots — a route is not playful.
 *
 * A gentler curve than the old `0.22, 0.61, 0.36, 1`: at this duration a sharp ease-out
 * spends most of the time almost stopped, which reads as the line *stalling* near the
 * last stop rather than arriving at it.
 */
export const ROUTE_EASING = 'cubic-bezier(0.33, 0.1, 0.28, 1)';

/**
 * Long enough to read as travel. Scales with the number of stops so a two-stop hop does
 * not take as long as a twelve-stop day, then caps.
 */
export const drawDurationMs = (stopCount = 0) =>
  Math.min(MAX_DRAW_MS, Math.max(MIN_DRAW_MS, MIN_DRAW_MS + stopCount * PER_STOP_MS));

/**
 * When stop `index` should appear, as a fraction of the line's own progress — so the
 * pin lands exactly as the line arrives at it, whether there are three stops or
 * fifteen. This is what keeps the map and the list in step.
 */
export const delayForIndex = (index, stopCount, durationMs) => {
  if (stopCount <= 1) return 0;
  return (index / stopCount) * durationMs;
};

/** One place asks, so one answer. Animation is a courtesy, never a requirement. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * What makes a route "the same route". Order is the whole identity: the same stops in
 * a different sequence is a different answer and must re-animate, while a re-render
 * that changes nothing must not.
 */
export const routeSignature = (stops = []) =>
  stops.map((stop) => stop.siteId ?? stop.id ?? '').join('>');
