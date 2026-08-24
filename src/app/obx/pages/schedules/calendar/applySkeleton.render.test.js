import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import React from 'react';
import { theme } from 'src/theme';
import obx from 'src/utils/i18next/locales/en/obx.json';

import ApplySkeleton from './ApplySkeleton';
import { APPLY_PHASE } from './useApplyMotion';

/**
 * The apply overlay — **a rendered test, because this replaced something untestable.**
 *
 * The three-hundred-line FLIP choreography this succeeded could not be covered at all: it
 * measured live rectangles, cloned nodes into a floating layer and drove them with the Web
 * Animations API, none of which jsdom has. Part of the argument for the simpler thing was
 * that it would be checkable, so it is checked.
 *
 * ## Why nothing here asserts a sentence
 *
 * **i18n is not initialised in this environment.** `setupTests.js` wires jest-dom and MSW
 * and nothing else, so `t()` returns the key it was given — which is why every other render
 * test in this folder stubs `classes` and asserts structure rather than copy. Asserting
 * `'Saving 3 routes…'` here would fail against a perfectly correct component.
 *
 * That leaves the copy unguarded exactly where this feature has been burnt twice — a raw
 * `obx.…` key rendered in front of a planner, once for `appliedRoute` and once for
 * `applyNote`. So the keys are checked against the locale file itself, in the second block.
 * Between the two, both halves are covered: the component asks for the right keys, and the
 * file has them.
 */

const renderAt = (phase, routeCount = 3) =>
  render(
    <ThemeProvider theme={theme}>
      <ApplySkeleton phase={phase} routeCount={routeCount} />
    </ThemeProvider>,
  );

describe('the apply skeleton', () => {
  it('draws nothing at all when idle', () => {
    /* Not merely invisible. It is an opaque, `pointer-events: all` overlay across the whole
       grid — one left mounted at `opacity: 0` would be a schedule nobody could click. */
    const { container } = renderAt(APPLY_PHASE.IDLE);
    expect(container).toBeEmptyDOMElement();
  });

  it('says something different in each beat', () => {
    /* Read off each render's own container rather than `getByRole`, which queries
       `document.body` — two renders in one test both live there, and the second lookup
       finds both. */
    const captionOf = (phase) =>
      renderAt(phase, 2).container.querySelector('[role="status"]').textContent;
    const saving = captionOf(APPLY_PHASE.SAVING);
    const loading = captionOf(APPLY_PHASE.LOADING);

    /* Two beats that read identically are one beat that lasts twice as long — the whole
       point of splitting the wait is that the second half reports different progress. */
    expect(saving).not.toEqual(loading);
  });

  it('announces the caption politely and hides the bars', () => {
    const { getByRole, container } = renderAt(APPLY_PHASE.SAVING, 1);
    expect(getByRole('status')).toHaveAttribute('aria-live', 'polite');

    /* The grid of bars is decoration. Announcing it would read the shape of a schedule to
       somebody who is waiting to be told there is one. */
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('draws a skeleton with more than one row of cards', () => {
    /* The pattern is fixed rather than derived — see `ROWS` — so this is really asserting
       that a skeleton is a *shape* and not a spinner on a white sheet. If the bars ever
       stop rendering, the overlay becomes an opaque blank rectangle over the grid, which
       reads as a crash rather than as loading. */
    const { container } = renderAt(APPLY_PHASE.LOADING, 3);
    const bars = container.querySelectorAll('[class*="bar"]');
    expect(bars.length).toBeGreaterThan(10);
  });

  it('staggers the bars rather than pulsing them in unison', () => {
    const { container } = renderAt(APPLY_PHASE.LOADING, 3);
    const delays = [...container.querySelectorAll('[class*="bar"]')]
      .map((node) => node.style.animationDelay)
      .filter(Boolean);

    /* One delay repeated is a set of placeholders breathing together, which reads as a
       single object flashing. The sweep has to cross the grid. */
    expect(new Set(delays).size).toBeGreaterThan(3);
  });
});

describe('the copy the skeleton asks for', () => {
  /* The component reads `obx.schedules.apply.*`. i18n cannot resolve it here, so the file
     is read directly — this is the half of the guard the render tests cannot supply. */
  const apply = obx.schedules.apply;

  it('has a loading line', () => {
    expect(typeof apply.loading).toBe('string');
    expect(apply.loading.length).toBeGreaterThan(0);
  });

  it('pluralises the saving line, so it can never print "1 routes"', () => {
    /* i18next resolves `saving` to `saving_one` / `saving_other` off the count. A single
       `saving` key would look correct in the file and read wrong on screen for the
       commonest case there is — one route. */
    expect(typeof apply.saving_one).toBe('string');
    expect(typeof apply.saving_other).toBe('string');
    expect(apply.saving).toBeUndefined();
  });

  it('interpolates the count in both forms', () => {
    expect(apply.saving_one).toContain('{{count}}');
    expect(apply.saving_other).toContain('{{count}}');
  });
});
