import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { theme } from 'src/theme';

import StopList from './components/StopList';

/**
 * A **smoke test**: does this component render at all?
 *
 * It exists because of a bug it would have caught. A helper was deleted along with the block
 * that had been its only other caller, one surviving call site was left pointing at nothing,
 * and the result was a `ReferenceError` thrown from the middle of `StopList`'s render — a blank
 * right-hand region the moment the planner pressed Harmonize. `vite build` passed, `eslint`
 * passed, and **151 unit tests passed**, because every one of them tests a pure function and
 * this file's own `no-undef` rule is switched off (there is no `env` block for it to work
 * against, so it would flag every `window` and `describe` in the repo).
 *
 * So the gap was structural rather than bad luck: nothing in this project ever *rendered* the
 * most-edited component on the screen. This does, with the real theme and no mocks, and asserts
 * only what proves the render completed. It is deliberately not a snapshot — this row has been
 * restyled in four consecutive passes and a snapshot would have been rewritten each time
 * without being read, which is a test that reports churn instead of correctness.
 *
 * `i18next` is not initialised here. `useTranslation` falls back to returning the key, so the
 * assertions below match on structure and figures rather than on English — which is the right
 * thing to assert anyway, and it means the test does not fail the day the copy changes.
 */

/* Two stops at known coordinates and known service times, so the row figures are arithmetic
   rather than fixtures: 45 + 20 minutes of work, and a 12-minute drive into the second. */
const STOPS = [
  {
    siteId: 'site-a',
    siteName: 'Mill Street',
    order: 1,
    lat: 28.06,
    lng: -82.46,
    travelFromPrevious: 8,
    serviceMinutes: 45,
    filterMinutes: 40,
    siteMinutes: 5,
    filterCount: 2,
    visits: [],
    isNew: true,
  },
  {
    siteId: 'site-b',
    siteName: 'Zorinski Lake',
    order: 2,
    lat: 28.12,
    lng: -82.39,
    travelFromPrevious: 12,
    serviceMinutes: 100,
    filterMinutes: 100,
    siteMinutes: 0,
    filterCount: 5,
    visits: [],
    isNew: true,
  },
];

const draw = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <StopList
        stops={STOPS}
        startLabel="Northgate Depot"
        endLabel="Northgate Depot"
        finishMinutes={17 * 60}
        {...props}
      />
    </ThemeProvider>,
  );

describe('StopList renders', () => {
  it('draws every stop, its anchors and its grips', () => {
    draw();

    expect(screen.getByText('Mill Street')).toBeInTheDocument();
    expect(screen.getByText('Zorinski Lake')).toBeInTheDocument();
    /* Both anchors: the day starts and ends at the origin. */
    expect(screen.getAllByText('Northgate Depot')).toHaveLength(2);
    /* One grip per movable stop, and one chevron per stop. */
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
  });

  it('states each stop as travel plus time on site', () => {
    draw();
    /* Stop 2: a 12-minute drive plus 100 minutes of work is 1 hr 52 min, and the row's figure
       has to be that sum — it is what the disclosure below it breaks down. */
    expect(screen.getByText('1 hr 52 min')).toBeInTheDocument();
    /* Stop 1: 8 + 45. */
    expect(screen.getByText('53 min')).toBeInTheDocument();
  });

  it('renders with no stops at all', () => {
    /* The empty case reaches different branches — `stops[0]` is undefined in three places, and
       the finish anchor is gated on every row having landed. */
    expect(() => draw({ stops: [] })).not.toThrow();
  });

  it('renders a route whose road times have not arrived', () => {
    /* `pendingTimes` suppresses the duration and the travel line, which is the branch that had
       the deleted helper in it. */
    draw({ pendingTimes: true });
    expect(screen.getByText('Zorinski Lake')).toBeInTheDocument();
    expect(screen.queryByText('1 hr 52 min')).not.toBeInTheDocument();
  });

  it('renders a hand-ordered route, with its notice', () => {
    const { container } = draw({ manual: true });
    /* The notice is a `role="status"` region — asserted by role rather than by its words, so
       the test survives the copy being rewritten. */
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeInTheDocument();
  });

  it('renders a completed stop, which carries no grip', () => {
    expect(() => draw({ stops: [{ ...STOPS[0], completed: true }, STOPS[1]] })).not.toThrow();
  });

  it('renders a merged route, where some stops are not ours', () => {
    /* `showNewBadge` turns on the `New` badge and the `Already on this route` detail line —
       two branches no other case reaches. */
    expect(() =>
      draw({ showNewBadge: true, stops: [{ ...STOPS[0], isNew: false }, STOPS[1]] }),
    ).not.toThrow();
  });

  it('renders a partly revealed route', () => {
    /* Mid-reveal, some rows are placeholders. `revealCount` is the reveal's own clock. */
    expect(() => draw({ revealCount: 1 })).not.toThrow();
  });
});
