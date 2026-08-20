import {
  anchorForRange,
  COMPANIES_VIEW,
  fetchWindowFor,
  formatRangeLabel,
  isExecutionGrain,
  isViewingCurrentPeriod,
  rangeForView,
  snapsToGrain,
  stepRange,
} from './companiesViewRange';

/**
 * The Companies tab's date arithmetic, pinned.
 *
 * This is the half of the four-grain work that is worth testing rather than
 * looking at: everything here is a pure string-in/string-out answer, and the
 * failures it guards against are the quiet kind — a stepper that drifts off its
 * grain over a February, a pill that names a period the arrows do not visit, a
 * "narrowed" request that turns out to be a full year.
 *
 * The clock is frozen because half of these functions ask "where is today". A
 * Wednesday in August was picked so that every boundary case has a name: the week
 * runs 16–22 (Sunday-start, matching the scheduler tab next door), the month is
 * one of the 31-day ones, and the rolling year crosses into the following one.
 */
const TODAY = '2026-08-19';

beforeAll(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(`${TODAY}T09:00:00`));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('rangeForView', () => {
  it('gives a day both of its ends', () => {
    expect(rangeForView(COMPANIES_VIEW.DAY, TODAY)).toEqual({ from: TODAY, to: TODAY });
  });

  it('cuts a week Sunday to Saturday, the way the scheduler tab does', () => {
    expect(rangeForView(COMPANIES_VIEW.WEEK, TODAY)).toEqual({
      from: '2026-08-16',
      to: '2026-08-22',
    });
  });

  it('gives a month its own last day rather than a fixed 30th', () => {
    expect(rangeForView(COMPANIES_VIEW.MONTH, '2026-02-14')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    });
  });

  /* The alignment the matrix view depends on: a window running the 19th to the
     19th spans thirteen calendar months and hands it a thirteenth column holding
     one usable week. */
  it('makes the year twelve whole months from the anchor month, not from the anchor', () => {
    expect(rangeForView(COMPANIES_VIEW.YEAR, TODAY)).toEqual({
      from: '2026-08-01',
      to: '2027-07-31',
    });
  });

  it('falls back to the year for a view it does not know', () => {
    expect(rangeForView('listing', TODAY)).toEqual(rangeForView(COMPANIES_VIEW.YEAR, TODAY));
  });

  it('anchors on today when given no anchor', () => {
    expect(rangeForView(COMPANIES_VIEW.DAY)).toEqual({ from: TODAY, to: TODAY });
  });
});

describe('stepRange', () => {
  it('moves a day by a day, in both directions', () => {
    const day = rangeForView(COMPANIES_VIEW.DAY, TODAY);
    expect(stepRange(COMPANIES_VIEW.DAY, day, 1)).toEqual({
      from: '2026-08-20',
      to: '2026-08-20',
    });
    expect(stepRange(COMPANIES_VIEW.DAY, day, -1)).toEqual({
      from: '2026-08-18',
      to: '2026-08-18',
    });
  });

  it('moves a week to the next whole week', () => {
    const week = rangeForView(COMPANIES_VIEW.WEEK, TODAY);
    expect(stepRange(COMPANIES_VIEW.WEEK, week, 1)).toEqual({
      from: '2026-08-23',
      to: '2026-08-29',
    });
  });

  it('moves a month to the next whole month', () => {
    const month = rangeForView(COMPANIES_VIEW.MONTH, TODAY);
    expect(stepRange(COMPANIES_VIEW.MONTH, month, 1)).toEqual({
      from: '2026-09-01',
      to: '2026-09-30',
    });
  });

  /**
   * The reason the narrow grains re-derive their window instead of adding to both
   * ends. Adding a month to 31 January lands on 28 February; stepping back from
   * *that* would land on 28 January and the window would have quietly stopped
   * being a month. n forward and n back has to be where you started.
   */
  it('does not drift across a short month', () => {
    const january = rangeForView(COMPANIES_VIEW.MONTH, '2026-01-31');
    const february = stepRange(COMPANIES_VIEW.MONTH, january, 1);

    expect(february).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(stepRange(COMPANIES_VIEW.MONTH, february, -1)).toEqual(january);
  });

  /* Year steps by a month on purpose — it draws a column per month, and it is the
     one grain whose span the planner may have made ragged, so both ends move
     together rather than being re-snapped to twelve months. */
  it('steps the year by one month, keeping whatever span it had', () => {
    expect(stepRange(COMPANIES_VIEW.YEAR, { from: '2026-08-01', to: '2027-07-31' }, 1)).toEqual({
      from: '2026-09-01',
      to: '2027-08-31',
    });
  });

  it('preserves a ragged year span instead of snapping it back to twelve months', () => {
    expect(stepRange(COMPANIES_VIEW.YEAR, { from: '2026-03-12', to: '2026-06-06' }, 1)).toEqual({
      from: '2026-04-12',
      to: '2026-07-06',
    });
  });
});

describe('formatRangeLabel', () => {
  it('omits the weekday on a day — the grid below already states it', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.DAY, { from: TODAY, to: TODAY })).toBe('19 Aug 2026');
  });

  it('says the month once for a week inside one', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.WEEK, { from: '2026-08-16', to: '2026-08-22' })).toBe(
      '16 – 22 Aug 2026',
    );
  });

  it('repeats the month for a week that straddles two', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.WEEK, { from: '2026-08-30', to: '2026-09-05' })).toBe(
      '30 Aug – 5 Sep 2026',
    );
  });

  it('repeats the year for a week that straddles two', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.WEEK, { from: '2026-12-27', to: '2027-01-02' })).toBe(
      '27 Dec 2026 – 2 Jan 2027',
    );
  });

  it('spells a month out', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.MONTH, { from: '2026-08-01', to: '2026-08-31' })).toBe(
      'August 2026',
    );
  });

  /* Unchanged, and the same format the matrix's own column headers use — the pill
     and the grid it narrows must not say a month two ways. */
  it('keeps the year label the tab has always had', () => {
    expect(formatRangeLabel(COMPANIES_VIEW.YEAR, { from: '2026-08-01', to: '2027-07-31' })).toBe(
      "Aug '26 – Jul '27",
    );
  });
});

describe('isViewingCurrentPeriod', () => {
  it('is true for the window each grain opens on', () => {
    Object.values(COMPANIES_VIEW).forEach((view) => {
      expect(isViewingCurrentPeriod(view, rangeForView(view))).toBe(true);
    });
  });

  it('is false one step away', () => {
    const week = rangeForView(COMPANIES_VIEW.WEEK);
    expect(
      isViewingCurrentPeriod(COMPANIES_VIEW.WEEK, stepRange(COMPANIES_VIEW.WEEK, week, 1)),
    ).toBe(false);
  });

  /**
   * Containment would be the wrong test here. This window holds today and is still
   * eleven months from the one "Today" would take you to, so a containment check
   * would grey the button out with somewhere left to go.
   */
  it('is false for a year window that merely contains today', () => {
    expect(
      isViewingCurrentPeriod(COMPANIES_VIEW.YEAR, { from: '2025-09-01', to: '2026-08-31' }),
    ).toBe(false);
  });
});

describe('anchorForRange', () => {
  it('keeps today when today is on screen', () => {
    expect(anchorForRange({ from: '2026-08-01', to: '2027-07-31' }).format('YYYY-MM-DD')).toBe(
      TODAY,
    );
  });

  /* Stepping back to March and then narrowing to Week has to land in March. Using
     today would silently undo the navigation the planner just did. */
  it('falls back to the window start when today is not', () => {
    expect(anchorForRange({ from: '2026-03-01', to: '2026-03-31' }).format('YYYY-MM-DD')).toBe(
      '2026-03-01',
    );
  });

  it('holds the first and last day of the window, not just the inside of it', () => {
    expect(anchorForRange({ from: TODAY, to: TODAY }).format('YYYY-MM-DD')).toBe(TODAY);
  });

  it('answers today for a window it cannot read', () => {
    expect(anchorForRange({}).format('YYYY-MM-DD')).toBe(TODAY);
  });
});

describe('fetchWindowFor', () => {
  it('rounds a single day out to its whole month', () => {
    expect(fetchWindowFor({ from: TODAY, to: TODAY })).toEqual({
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('asks for both months when a week straddles them', () => {
    expect(fetchWindowFor({ from: '2026-08-30', to: '2026-09-05' })).toEqual({
      from: '2026-08-01',
      to: '2026-09-30',
    });
  });

  /**
   * The load-bearing one: Year's window is month-aligned by construction, so the
   * envelope *is* the window and the request the endpoint sees is the one the tab
   * has always sent. Nothing about Year changes because Day/Week/Month exist.
   */
  it('leaves every grain-aligned window exactly as it is', () => {
    Object.values(COMPANIES_VIEW).forEach((view) => {
      const range = rangeForView(view);
      const widened = fetchWindowFor(range);
      if (view === COMPANIES_VIEW.MONTH || view === COMPANIES_VIEW.YEAR) {
        expect(widened).toEqual(range);
      } else {
        // Day and Week are the ones that gain: one month asked for, not twelve.
        expect(widened.from <= range.from && widened.to >= range.to).toBe(true);
      }
    });
  });
});

describe('grain predicates', () => {
  it('lets only the year keep a ragged, planner-chosen span', () => {
    expect(snapsToGrain(COMPANIES_VIEW.DAY)).toBe(true);
    expect(snapsToGrain(COMPANIES_VIEW.WEEK)).toBe(true);
    expect(snapsToGrain(COMPANIES_VIEW.MONTH)).toBe(true);
    expect(snapsToGrain(COMPANIES_VIEW.YEAR)).toBe(false);
  });

  /* Day and week are execution surfaces and drop their quiet rows; month and year
     are planning surfaces, where "due nothing" is the answer. */
  it('treats only day and week as execution grains', () => {
    expect(isExecutionGrain(COMPANIES_VIEW.DAY)).toBe(true);
    expect(isExecutionGrain(COMPANIES_VIEW.WEEK)).toBe(true);
    expect(isExecutionGrain(COMPANIES_VIEW.MONTH)).toBe(false);
    expect(isExecutionGrain(COMPANIES_VIEW.YEAR)).toBe(false);
  });
});
