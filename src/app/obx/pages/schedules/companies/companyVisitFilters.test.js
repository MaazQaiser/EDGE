import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { narrowCompanies } from './companyVisitFilters';

/**
 * The client-side cuts, and specifically the two the four-grain views added: the
 * trim from the fetched month envelope down to the days on show, and the dropping
 * of quiet rows on the execution grains.
 *
 * The invariant that matters most here is the boring one — **month buckets are
 * positional**. The matrix view indexes `site.months` against the payload's month
 * columns, so a filter may empty a bucket but must never remove or reorder one.
 */

const visit = (date, status = calendarShiftStatusEnum.NOT_STARTED) => ({
  id: `visit-${date}`,
  date,
  status,
});

/** Two months of August–September, as the endpoint returns a straddling week. */
const payload = () => [
  {
    customerId: 'CUST-1',
    name: 'Northwind',
    totalVisits: 3,
    sites: [
      {
        id: 1,
        name: 'Northwind Depot',
        intervalMonths: 1,
        months: [[visit('2026-08-05'), visit('2026-08-19')], [visit('2026-09-04')]],
      },
      {
        id: 2,
        name: 'Northwind Annexe',
        intervalMonths: 1,
        months: [[visit('2026-08-02')], []],
      },
    ],
  },
  {
    customerId: 'CUST-2',
    name: 'Acme',
    totalVisits: 1,
    sites: [
      { id: 3, name: 'Acme Works', intervalMonths: 3, months: [[visit('2026-08-19')], []] },
      { id: 4, name: 'Acme Yard', intervalMonths: null, months: [[], []] },
    ],
  },
];

const datesIn = (site) => (site.months || []).flat().map((entry) => entry.date);

describe('narrowCompanies — the visible window', () => {
  it('drops the visits the fetched envelope carried but the view does not show', () => {
    const [acme, northwind] = narrowCompanies(payload(), {
      from: '2026-08-19',
      to: '2026-08-19',
    });

    // Sorted A–Z, companies and their locations both — the helper's other job, and
    // the reason Annexe leads Depot below.
    expect(acme.name).toBe('Acme');
    expect(datesIn(northwind.sites[0])).toEqual([]);
    expect(datesIn(northwind.sites[1])).toEqual(['2026-08-19']);
  });

  it('keeps every month bucket in place while emptying it', () => {
    const [, northwind] = narrowCompanies(payload(), { from: '2026-08-19', to: '2026-08-19' });

    expect(northwind.sites[1].months).toHaveLength(2);
    expect(northwind.sites[1].months[1]).toEqual([]);
  });

  it('recounts the company total against what survived, not against the payload', () => {
    const [acme, northwind] = narrowCompanies(payload(), {
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(northwind.totalVisits).toBe(1);
    expect(acme.totalVisits).toBe(0);
  });

  /* The Year path. Its window is month-aligned, so the envelope and the window are
     the same range and this cut has to be provably invisible. */
  it('is a no-op when the window already covers the payload', () => {
    const wide = narrowCompanies(payload(), { from: '2026-08-01', to: '2026-09-30' });
    const untouched = narrowCompanies(payload(), {});

    expect(wide.map((company) => company.sites.map(datesIn))).toEqual(
      untouched.map((company) => company.sites.map(datesIn)),
    );
  });
});

describe('narrowCompanies — quiet rows', () => {
  /* A planning grain: the empty row is the answer — this location is on the books
     and due nothing — and dropping it reshuffles the list under the planner. */
  it('keeps a location with nothing due by default', () => {
    const [, northwind] = narrowCompanies(payload(), { from: '2026-08-19', to: '2026-08-19' });

    expect(northwind.sites.map((site) => site.name)).toEqual([
      'Northwind Annexe',
      'Northwind Depot',
    ]);
  });

  it('drops it on an execution grain, where it is one of forty', () => {
    const [, northwind] = narrowCompanies(payload(), {
      from: '2026-08-19',
      to: '2026-08-19',
      dropQuiet: true,
    });

    expect(northwind.sites.map((site) => site.name)).toEqual(['Northwind Depot']);
  });

  it('drops the company once every one of its locations has gone quiet', () => {
    const companies = narrowCompanies(payload(), {
      from: '2026-09-01',
      to: '2026-09-30',
      dropQuiet: true,
    });

    expect(companies.map((company) => company.name)).toEqual(['Northwind']);
  });

  it('can empty the tab entirely, which is a day with no visits on it', () => {
    expect(
      narrowCompanies(payload(), { from: '2026-08-11', to: '2026-08-11', dropQuiet: true }),
    ).toEqual([]);
  });
});

describe('narrowCompanies — window beside the other cuts', () => {
  it('applies the status filter and the window in one pass', () => {
    const withStatuses = payload();
    withStatuses[0].sites[0].months[0][1].status = calendarShiftStatusEnum.COMPLETED;

    const [, northwind] = narrowCompanies(withStatuses, {
      from: '2026-08-01',
      to: '2026-08-31',
      status: calendarShiftStatusEnum.COMPLETED,
    });

    expect(datesIn(northwind.sites[1])).toEqual(['2026-08-19']);
  });

  it('lets the search drop a company the window would have kept', () => {
    const companies = narrowCompanies(payload(), {
      from: '2026-08-01',
      to: '2026-09-30',
      query: 'acme',
    });

    expect(companies.map((company) => company.name)).toEqual(['Acme']);
  });
});

describe('narrowCompanies — cancelled visits', () => {
  /* A quarterly location with one of its four called off, plus a neighbour whose
     only visit was cancelled — the row that must not silently vanish. */
  const withCancelled = () => [
    {
      customerId: 'CUST-9',
      name: 'Vector',
      totalVisits: 3,
      sites: [
        {
          id: 9,
          name: 'Vector Depot',
          intervalMonths: 1,
          months: [
            [
              visit('2026-08-05', calendarShiftStatusEnum.COMPLETED),
              visit('2026-08-19', calendarShiftStatusEnum.CANCELLED),
            ],
            [visit('2026-09-04')],
          ],
        },
        {
          id: 10,
          name: 'Vector Yard',
          intervalMonths: 3,
          months: [[visit('2026-08-11', calendarShiftStatusEnum.CANCELLED)], []],
        },
      ],
    },
  ];

  it('hides them when no status is chosen', () => {
    const [vector] = narrowCompanies(withCancelled(), {});

    expect(datesIn(vector.sites[0])).toEqual(['2026-08-05', '2026-09-04']);
    /* The cancelled-only location keeps its row, emptied — the same rule every other
       quiet row follows on a planning grain. */
    expect(datesIn(vector.sites[1])).toEqual([]);
    /* And the header count describes what is on screen, not what arrived. */
    expect(vector.totalVisits).toBe(2);
  });

  it('hides them when a different status is chosen', () => {
    const [vector] = narrowCompanies(withCancelled(), {
      status: calendarShiftStatusEnum.COMPLETED,
    });

    expect(datesIn(vector.sites[0])).toEqual(['2026-08-05']);
  });

  it('shows them, and only them, when Cancelled is chosen', () => {
    const [vector] = narrowCompanies(withCancelled(), {
      status: calendarShiftStatusEnum.CANCELLED,
    });

    expect(datesIn(vector.sites[0])).toEqual(['2026-08-19']);
    expect(datesIn(vector.sites[1])).toEqual(['2026-08-11']);
  });

  it('keeps the buckets positional while hiding them', () => {
    const [vector] = narrowCompanies(withCancelled(), {});

    /* The matrix indexes these against the payload's month columns, so emptying a
       bucket must never shorten the array. */
    expect(vector.sites[0].months).toHaveLength(2);
    expect(vector.sites[0].months[0]).toHaveLength(1);
  });

  it('lets a cancelled-only location go quiet on an execution grain', () => {
    const [vector] = narrowCompanies(withCancelled(), { dropQuiet: true });

    expect(vector.sites.map((site) => site.name)).toEqual(['Vector Depot']);
  });
});
