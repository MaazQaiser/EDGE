import { useEffect } from 'react';

/**
 * The two facts about the sidebar's frame that other surfaces have to know.
 *
 * Both exist for the same reason: a `position: fixed` surface that wants to sit *beside*
 * the navigation rather than on top of it has to know where the navigation ends and where
 * it stands in the stack. Harmonize is the first such surface — a full-screen mode that
 * covered the nav made the mode a room with one door — and the alternative was for it to
 * repeat 76, 240 and 999 in its own stylesheet, which is two more copies of numbers that
 * already live in `sideBar.js` and `appMain.module.scss`, and copies are what go stale.
 */

/** How many pixels of the left edge the sidebar is covering right now. */
export const SIDEBAR_INSET_VAR = '--app-sidebar-inset';

/**
 * The sidebar's stacking order, so a surface that must stay *under* the nav can say so
 * relative to it instead of guessing at a number one edit away from being wrong.
 */
export const SIDEBAR_Z_INDEX = 999;

/** How long the rail takes to collapse or expand. Read by the sidebar's own stylesheet. */
export const SIDEBAR_TRANSITION_MS = 350;

/**
 * Keep {@link SIDEBAR_INSET_VAR} equal to the sidebar's right edge.
 *
 * Measured rather than derived from the collapse flag, for two reasons. The collapsed
 * width is partly a media query — a 76px rail on a desktop, the full 240px on a phone —
 * so the flag alone does not know what it means at every viewport. And the width is
 * *animated*, so a surface reading the target value jumps to where the rail is going and
 * spends a third of a second detached from the edge it is supposed to be flush with.
 *
 * Sampled on `requestAnimationFrame` while a transition is in flight, rather than from a
 * ResizeObserver alone. An observer does report every frame of a width transition, but it
 * reports them *after* layout, and writing a custom property from that callback pushes the
 * recalculated `left` into a later frame — measured against a heavy page (a schedules
 * calendar with a live map on it) that put the inset ~190ms behind the rail, which reads
 * as the workspace being dragged along by the sidebar rather than moving with it. Sampling
 * before layout instead means the edge and whatever is bound to it are computed in the
 * same pass. The observer stays as the catch-all for widths that change without animating.
 *
 * The loop is bounded by a deadline rather than stopped on `transitionend`, because
 * `transition: all` on a container full of hover states means these events also arrive
 * from children, and a start with no matching end would leave a frame loop running for
 * the rest of the session.
 *
 * The right edge, not the width: on a phone the sidebar keeps its width and is taken out
 * of the viewport with a transform, where the honest answer is zero.
 */
export function useSidebarInset(sidebarRef) {
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return undefined;

    const root = document.documentElement;
    const publish = () => {
      const { right } = sidebar.getBoundingClientRect();
      /* Clamped at zero: an off-canvas sidebar's right edge is negative, and a negative
         inset would push whatever reads it off the left of the screen. */
      root.style.setProperty(SIDEBAR_INSET_VAR, `${Math.max(0, Math.round(right))}px`);
    };

    let frame = 0;
    let until = 0;
    const sample = () => {
      publish();
      frame = performance.now() < until ? requestAnimationFrame(sample) : 0;
    };
    const follow = () => {
      /* Comfortably past the end of the animation, so the last sample is of the rail at
         rest and no `transitionend` handler is needed to land the final value. */
      until = performance.now() + SIDEBAR_TRANSITION_MS + 100;
      if (!frame) frame = requestAnimationFrame(sample);
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(sidebar);
    sidebar.addEventListener('transitionrun', follow);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      sidebar.removeEventListener('transitionrun', follow);
      /* Nothing left to sit beside. Removed rather than zeroed so that the fallback in
         `var(--app-sidebar-inset, 0px)` is the single answer to "there is no sidebar". */
      root.style.removeProperty(SIDEBAR_INSET_VAR);
    };
  }, [sidebarRef]);
}
