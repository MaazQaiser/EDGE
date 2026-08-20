import { useLayoutEffect, useRef } from 'react';

/**
 * Animates rows to their new positions after a reorder, and — more importantly —
 * refuses to when it would hurt.
 *
 * Seeing a stop travel to its new place is what makes a small diff legible. A
 * forty-row reshuffle in motion is the visual form of the churn problem: it is
 * exactly what makes an optimizer feel random. So the cap is the design, not a
 * performance concession.
 */
export const MOTION_ROW_CAP = 8;

const DURATION_MS = 180;
const EASING = 'cubic-bezier(0.2, 0.7, 0.3, 1)';

export const useFlipReorder = (containerRef, dependency) => {
  const previousTops = useRef(new Map());

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const items = [...node.querySelectorAll('[data-flip-id]')];
    const nextTops = new Map(
      items.map((element) => [element.dataset.flipId, element.getBoundingClientRect().top]),
    );
    const previous = previousTops.current;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const movedIds = [...nextTops.keys()].filter(
      (id) => previous.has(id) && Math.abs(previous.get(id) - nextTops.get(id)) > 1,
    );

    const shouldAnimate =
      previous.size > 0 &&
      !prefersReducedMotion &&
      movedIds.length > 0 &&
      movedIds.length <= MOTION_ROW_CAP;

    if (shouldAnimate) {
      items.forEach((element) => {
        const from = previous.get(element.dataset.flipId);
        const to = nextTops.get(element.dataset.flipId);
        if (from === undefined || Math.abs(from - to) <= 1) return;

        element.animate(
          [{ transform: `translateY(${from - to}px)` }, { transform: 'translateY(0)' }],
          { duration: DURATION_MS, easing: EASING },
        );
      });
    }

    previousTops.current = nextTops;
  }, [containerRef, dependency]);
};

export default useFlipReorder;
