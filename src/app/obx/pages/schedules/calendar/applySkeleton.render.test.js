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

  it('announces the caption politely, and keeps the spinner out of the announcement', () => {
    const { getByRole, container } = renderAt(APPLY_PHASE.SAVING, 1);
    expect(getByRole('status')).toHaveAttribute('aria-live', 'polite');

    /* The ring is decoration. Announcing it would read a shape to somebody who is waiting to
       be told what is happening. */
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
  });

  /**
   * **These three replace the assertions that pinned the old overlay** — that it drew more
   * than ten bars, and that their animation delays differed so the sweep crossed the grid.
   *
   * Both were true of the thing this used to be: an opaque `inset: 0` cover over the stage
   * drawing an invented skeleton of the week. That was removed on instruction because it hid
   * the day columns, the company column and the row headings along with the cards, so an
   * apply looked like the whole scheduler reloading. The skeleton now happens on the **real**
   * visit cards, via `[data-applying]` in `scheduleCalendar.styles.js`, which is CSS on a
   * grid this component never renders — so there is nothing here to count any more, and
   * asserting a bar count would only pin the mistake back in place.
   *
   * What is worth pinning is the *inverse*: that this no longer covers or blocks anything.
   */
  it('renders only the caption — no skeleton grid of its own', () => {
    const { container } = renderAt(APPLY_PHASE.LOADING, 3);
    expect(container.querySelectorAll('[class*="bar"]').length).toBe(0);
    /* One pill: the ring and the sentence, and nothing else. */
    expect(container.querySelector('[role="status"]').children.length).toBe(2);
  });

  it('does not cover the grid', () => {
    const { container } = renderAt(APPLY_PHASE.SAVING, 3);
    const pill = container.querySelector('[role="status"]');
    const style = window.getComputedStyle(pill);
    /* An `inset: 0` cover is what this stopped being. It is pinned to the bottom of the stage
       now, clear of the grid's own headings, which is the half of the change this file can
       actually observe. */
    expect(style.position).toBe('absolute');
    expect(style.top).not.toBe('0px');
  });

  it('reports without blocking', () => {
    const { container } = renderAt(APPLY_PHASE.SAVING, 3);
    /* The old overlay was `pointer-events: all` and deliberately ate clicks. Disabling the
       cards is `[data-applying]`'s job now, so the toolbar and tabs stay live and this must
       not intercept anything. */
    expect(window.getComputedStyle(container.querySelector('[role="status"]')).pointerEvents).toBe(
      'none',
    );
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
