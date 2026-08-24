import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { theme } from 'src/theme';

import { COMPANIES_VIEW } from './companiesViewRange';
import SchedulesCompanies from './index';

/**
 * The year matrix — **two readings, opening on the packed one.**
 *
 * The density button was retired for a stretch and this file pinned the removal;
 * it is back, so the pair is driven from here again. What the tests hold now is the
 * asymmetry: collapsed is where the pane *opens* (`DEFAULT_MATRIX_DENSITY`) and
 * expanded is a press away, which is the arrangement that keeps the button from
 * reading as an undo of the packed default.
 *
 * Storage is cleared between cases. `readMatrixDensity` runs at mount and the click
 * below persists, so without it the expand test would decide what the two after it
 * open on — through jsdom's `localStorage`, which survives an unmount.
 *
 * The invariant still worth a test is the **cell count**: the `colgroup` commits to
 * two frozen columns plus one strip, and a body row that disagrees does not throw —
 * it silently slides every border out of line with the header, a row at a time, which
 * is a failure that only shows up to a human looking at the right part of a wide
 * table. Counting `<td>`s costs nothing.
 *
 * The toolbar is stubbed to its `viewSwitch` and `filterAction` slots. It is the one
 * thing in this view that reaches for the dropdown, date-picker and search
 * components, none of which this test is about — but the density button arrives
 * through `filterAction`, so the stub has to draw that slot for the assertions below
 * to be about the button rather than about the stub.
 *
 * Structure, not copy: `i18next` is uninitialised in tests, so `useTranslation`
 * returns the key. The card's own text is asserted literally, because the format is
 * the thing that changed — `19 Aug '26`, no clock window.
 */

/* Hoisted above the imports by babel-jest, which is why `./index` can be imported
   normally with the rest of them and still get the stub. */
jest.mock('./CompaniesFilters', () => {
  const ReactRef = require('react');
  return {
    __esModule: true,
    default: ({ viewSwitch, filterAction }) =>
      ReactRef.createElement('div', null, viewSwitch, filterAction),
  };
});

const KEY = 'obx.schedules.calendar.companies';

/** Three month buckets, so a row's cells are countable by hand. */
const MONTHS = [
  { year: 2026, month: 7 },
  { year: 2026, month: 8 },
  { year: 2026, month: 9 },
];

const SERVICED = {
  id: 'site-1',
  name: 'Harborview Depot',
  intervalMonths: 3,
  months: [
    [
      {
        id: 'v-1',
        date: '2026-08-19',
        status: 'NOT_STARTED',
        startsAt: '2026-08-19T08:00:00Z',
        endsAt: '2026-08-19T10:00:00Z',
        runsheetName: 'Riverside Loop',
        officer: { id: 9, name: 'Mike Ross' },
      },
    ],
    [],
    [{ id: 'v-2', date: '2026-10-14', status: 'COMPLETED', startsAt: '2026-10-14T13:30:00Z' }],
  ],
};

/** A projected occurrence: arithmetic, so no id, no route, no technician (D19). */
const PROJECTED = {
  id: 'site-3',
  name: 'Anvil Yard',
  intervalMonths: 6,
  months: [[{ date: '2026-08-26', status: 'NOT_STARTED' }], [], []],
};

const UNSCHEDULED = {
  id: 'site-2',
  name: 'Cold Store Annex',
  intervalMonths: null,
  months: [[], [], []],
};

const DATA = {
  months: MONTHS,
  companies: [
    { customerId: 'c-1', name: 'Acme Holdings', sites: [SERVICED, UNSCHEDULED, PROJECTED] },
  ],
  filterOptions: { companies: [] },
};

const SCOPE = { from: '2026-08-01', to: '2026-10-31', customerIds: [], siteIds: [] };

/* `useTenantLabel` reads tenant labels off the store, and this view asks it for the
   word it heads the location column with. An empty label set is the real fallback
   path — it lands on `siteTerms`' own `Sites`/`Site` default. */
const STATE = { tenantConfigs: { labels: {} } };
const store = {
  /* The *same* object every call. `useSelector` compares snapshots by identity, so
     a fresh literal here is a state change on every render — which React correctly
     reports as an infinite update loop rather than as a bad test double. */
  getState: () => STATE,
  subscribe: () => () => {},
  dispatch: () => {},
};

const draw = (props = {}) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SchedulesCompanies
          data={DATA}
          loading={false}
          scope={SCOPE}
          onScopeChange={() => {}}
          view={COMPANIES_VIEW.YEAR}
          onViewChange={() => {}}
          {...props}
        />
      </ThemeProvider>
    </Provider>,
  );

/**
 * A location's row, found by the name in its frozen cell.
 *
 * `narrowCompanies` sorts sites by name, so **Cold Store Annex leads the group** and
 * is the row carrying the row-spanned company cell — the serviced row has one cell
 * fewer than it, which is what the counts below are stated against.
 */
const rowFor = (site) => screen.getByText(site.name).closest('tr');

describe('the year matrix', () => {
  beforeEach(() => window.localStorage.clear());

  it('opens packed: no month headings, and the strip named instead', () => {
    draw();

    expect(screen.queryByText('Aug 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('Oct 2026')).not.toBeInTheDocument();
    expect(screen.getByText(`${KEY}.visitsColumn`)).toBeInTheDocument();
  });

  /**
   * The button is labelled with the **action**, not the state, so its label is also
   * the assertion that the view is in the other one: "Expand" showing means the axis
   * is folded. Both labels are checked in both cases for that reason — a control
   * stuck on one word passes a one-sided test.
   */
  it('offers the axis back, labelled with what the press does', () => {
    draw();

    expect(screen.getByText(`${KEY}.density.expand`)).toBeInTheDocument();
    expect(screen.queryByText(`${KEY}.density.collapse`)).not.toBeInTheDocument();
  });

  it('draws the month headings once expanded, and offers the fold back', () => {
    draw();

    fireEvent.click(screen.getByText(`${KEY}.density.expand`));

    expect(screen.getByText('Aug 2026')).toBeInTheDocument();
    expect(screen.getByText('Oct 2026')).toBeInTheDocument();
    expect(screen.getByText(`${KEY}.density.collapse`)).toBeInTheDocument();

    /* The `colgroup` commits to two frozen columns plus one per month, and a body row
       that disagrees slides every border out of line rather than throwing. Cold Store
       Annex carries the spanned company cell; the serviced row does not. */
    expect(rowFor(SERVICED).querySelectorAll('td')).toHaveLength(1 + MONTHS.length);
  });

  it('gives every row the two frozen columns and one strip', () => {
    draw();

    /* Location + strip. The company cell is not on this row — it is spanned down
       from the group's first, and sites sort A–Z, so that is Anvil Yard. */
    expect(rowFor(SERVICED).querySelectorAll('td')).toHaveLength(2);
    /* Company + location + strip, being the group's first row. */
    expect(rowFor(PROJECTED).querySelectorAll('td')).toHaveLength(3);
    expect(rowFor(UNSCHEDULED).querySelectorAll('td')).toHaveLength(2);
  });

  it('packs a row of visits into that one cell, in date order', () => {
    draw();

    const cells = rowFor(SERVICED).querySelectorAll('td');
    /* Both visits, in date order, in the strip. */
    expect(cells[1].textContent).toBe("19 Aug '2614 Oct '26");
  });

  it('states the date with its year and no clock window', () => {
    draw();

    expect(screen.getByText("19 Aug '26")).toBeInTheDocument();
    expect(screen.getByText("14 Oct '26")).toBeInTheDocument();
    /* The window that used to follow the date. `8a`/`1:30p` were its two forms. */
    expect(screen.queryByText(/\d(:\d\d)?[ap]\b/)).not.toBeInTheDocument();
  });

  /**
   * **Left blank, and named only for assistive tech** — asked for directly, and it
   * brings this reading into line with the expanded one, which already dropped the
   * sentence.
   *
   * The copy used to run here on the argument that a packed row has no spanning cell
   * to colour, so the fact had to be words. In a column of dated chips it was the
   * table's only prose and drew the eye to the one row with nothing to say.
   */
  it('leaves an unscheduled location`s row blank, but still names it', () => {
    draw();

    expect(screen.queryByText(`${KEY}.notScheduled`)).not.toBeInTheDocument();
    expect(document.querySelector(`[aria-label="${KEY}.notScheduled"]`)).not.toBeNull();
  });
});

describe('the card tooltip', () => {
  /* MUI mounts `title` only while the tooltip is open, and opens it on a 100ms
     `enterDelay` — so every case hovers and then *awaits* the content. `findByText`
     polls, which is what lets the delay elapse without fake timers. The content
     renders in a portal, which `screen` still reaches. */
  const hover = (label) => fireEvent.mouseOver(screen.getByText(label));

  it('leads with the weekday and full date, which the card cannot give', async () => {
    draw();
    hover("19 Aug '26");

    expect(await screen.findByText('Wed 19 Aug 2026')).toBeInTheDocument();
  });

  it('carries the window that came off the card', async () => {
    draw();
    hover("19 Aug '26");
    await screen.findByText('Wed 19 Aug 2026');

    /* Formatted through the franchise offset, so the hour is whatever that resolves
       to — the shape is what is pinned here, not the timezone. */
    expect(screen.getByText(/^\d{1,2}(:\d\d)?[ap] - \d{1,2}(:\d\d)?[ap]$/)).toBeInTheDocument();
  });

  it("states the route and who is on it, in the tenant's own words", async () => {
    draw();
    hover("19 Aug '26");

    /* `getLabel` finds nothing in this tenant's label set, so the defaults show. */
    /* Empty label set, so the *generic* fallbacks show — deliberately not Filter Go's
       own "Route"/"Technician", which is what these used to read. */
    expect(await screen.findByText('Runsheet: Riverside Loop')).toBeInTheDocument();
    expect(screen.getByText('Officer: Mike Ross')).toBeInTheDocument();
  });

  it('never names the status — the fill and the legend do that', async () => {
    draw();
    hover("19 Aug '26");
    await screen.findByText('Wed 19 Aug 2026');

    expect(screen.queryByText(/NOT_STARTED|notStarted/)).not.toBeInTheDocument();
    /* The old tooltip was `{{date}} · {{status}}`; nothing joins them now. */
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it('says nothing about routing for a projected date', async () => {
    draw();
    hover("26 Aug '26");
    await screen.findByText('Wed 26 Aug 2026');

    /* D19: a projection is arithmetic, not a record. Claiming it is off-route would
       assert something the system does not know. */
    expect(screen.queryByText(/Not on a/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Officer:/)).not.toBeInTheDocument();
  });

  it('names the absence of a route for a real visit that has none', async () => {
    draw();
    hover("14 Oct '26");

    expect(await screen.findByText(`${KEY}.visitTooltip.noRoute`)).toBeInTheDocument();
  });
});
