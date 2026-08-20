import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { theme } from 'src/theme';

import AiPanel from './components/AiPanel';
import { EXCLUDED } from './harmonizeRule';

/**
 * The exceptions panel, rendered.
 *
 * The companion to `stopList.render.test.js`, and here for the same reason: this panel draws the
 * **same row component** as the planned stops — that shared row is the whole point of
 * `StopRowParts` — so a change made for the route list reaches this file too, and it appears on
 * screen only when something has been excluded, which is not the case a passing demo exercises.
 *
 * Structure, not copy. `i18next` is uninitialised in tests, so `useTranslation` returns keys;
 * the assertions match on the visit names and figures this panel is handed, which is what should
 * be asserted regardless.
 */

const VISIT = {
  id: 'v-1',
  siteId: 'site-c',
  siteName: 'Harborview Logistics Hub',
  distanceKm: 29.2,
  serviceMinutes: 80,
  filterCount: 4,
  reason: EXCLUDED.RADIUS,
  detail: 'due Fri 28 Aug · 12 mi outside the radius',
  canInclude: false,
};

const GROUPS = [
  {
    reason: EXCLUDED.RADIUS,
    title: '1 visit outside the radius',
    remedy: { label: 'Extend to 19 mi', onApply: () => {} },
    note: null,
    visits: [VISIT],
  },
];

const draw = (groups = GROUPS) =>
  render(
    <ThemeProvider theme={theme}>
      <AiPanel groups={groups} />
    </ThemeProvider>,
  );

describe('AiPanel renders', () => {
  it('draws a group, its remedy and the visit under it', () => {
    draw();
    expect(screen.getByText('Harborview Logistics Hub')).toBeInTheDocument();
    expect(screen.getByText('1 visit outside the radius')).toBeInTheDocument();
    expect(screen.getByText('Extend to 19 mi')).toBeInTheDocument();
  });

  it('states the distance in whole miles and the work in words', () => {
    draw();
    /* 29.2 km is 18 miles, and the row's duration is the visit's own service time — there is no
       travel time to a visit that is on no route. */
    expect(screen.getByText('18 mi')).toBeInTheDocument();
    /* **`getAllBy`, and the count is the assertion.** The figure appears twice on purpose: once
       as this row's own, and once as the panel's total for the group — which with one visit in
       it is the same number. `getByText` throws on two matches, so a single-visit fixture made a
       correct panel look broken. Two is the right answer here and one would mean the group total
       had stopped being drawn. */
    expect(screen.getAllByText('1 hr 20 min')).toHaveLength(2);
  });

  it('renders a group with no remedy', () => {
    /* A contract-bound visit has no setting that would reach it, and the panel must not draw a
       control that cannot help. */
    expect(() => draw([{ ...GROUPS[0], remedy: null, note: '1 is contract-bound' }])).not.toThrow();
  });

  it('renders a visit with nothing measured from', () => {
    /* `assessVisit` leaves `distanceKm` null when there is no origin, and `0 mi` would report the
       visit as being on the doorstep of a point that does not exist. */
    expect(() =>
      draw([{ ...GROUPS[0], visits: [{ ...VISIT, distanceKm: null, detail: '' }] }]),
    ).not.toThrow();
  });

  it('renders several groups, and with none at all', () => {
    expect(() =>
      draw([GROUPS[0], { ...GROUPS[0], reason: EXCLUDED.CAPACITY, title: '2 with no room' }]),
    ).not.toThrow();
    expect(() => draw([])).not.toThrow();
  });
});
