import { SCHEDULE_STATS_FOOTER_VARIANTS } from 'src/app/obx/pages/schedules/components/scheduleStatsFooter';
import {
  buildOverviewFooterStats,
  dropCancelledEvents,
  mapGridV2WeekData,
} from 'src/app/obx/pages/schedules/helper/scheduleResponseAdapter';
import { buildScheduleStats, buildScheduleSummary } from 'src/stubbedData/mocks/schedule.mock';

import { buildRouteVisitCounts, getRouteVisitCount } from './routeVisitCount';
import { sumScheduleWindowTotal } from './scheduleWindowTotal';

/**
 * The number a route card shows, and the one thing it must not do: count a visit
 * that is not on that run, or count one twice.
 *
 * Driven off the demo payload rather than hand-built fixtures for the second half,
 * because the risk this feature carries is not "does a Map count" — it is whether
 * the *two sides of the join* still describe the same week once each has been
 * through its own fetch and its own mapper. Hand-built objects would agree by
 * construction. `schedule.mock.js` is the only place both shapes exist as the page
 * really receives them: route cards mapped through `mapGridV2OverviewSections`, and
 * the visit list raw, exactly as `visitsForHarmonize` holds it.
 */

/* The week the numbers in this suite are quoted for. Fixed, not derived from
   today: every count below is a fact about these seven days. */
const WINDOW = { windowStart: '2026-08-17', windowEnd: '2026-08-23' };

/* August 2026 as the month grid asks for it: `firstDay={6}` puts Saturday first and
   Aug 1 2026 *is* a Saturday, so the grid is exactly five weeks, Aug 1 – Sep 4, and
   `fixedWeekCount: false` spares it a sixth. Bare dates, because that is what
   `getStartEndTimeForView` hands the month. */
const MONTH_WINDOW = { windowStart: '2026-08-01', windowEnd: '2026-09-04' };

const routesWeek = () => {
  const patrol = buildScheduleSummary({ ...WINDOW, view: 'patrol' });
  return {
    cards: mapGridV2WeekData(patrol).shifts,
    footerStats: buildOverviewFooterStats(buildScheduleStats(), patrol.footerStats),
  };
};

/* Raw `shifts`, deliberately un-mapped: the routes reading's own visits fetch hands
   `visitsForHarmonize` the payload array untouched, so its `start` is a full ISO
   instant while a grid card's has already been reduced to `YYYY-MM-DD`. Mapping it
   here would test a shape production never counts. */
const visitsWeek = () =>
  buildScheduleSummary({ ...WINDOW, view: 'visits', groupBy: 'company' }).shifts;

const visit = (over = {}) => ({
  shiftType: 'hit',
  runsheetName: 'Night Shift Patrols',
  start: '2026-08-19T08:00:00.000Z',
  ...over,
});

describe('buildRouteVisitCounts', () => {
  it('has no answer at all when there is no visit list', () => {
    /* `null`, not an empty map — the three live paths that hand over `[]` (the
       aggregate month, the day view and the embeds, and a swallowed fetch failure)
       do not mean "this week is empty", and a card that prints `0` on any of them is
       stating a fact nobody established. */
    expect(buildRouteVisitCounts([])).toBeNull();
    expect(buildRouteVisitCounts(null)).toBeNull();
    expect(buildRouteVisitCounts(undefined)).toBeNull();
  });

  it('counts a route by day, and treats the route name as a display string', () => {
    const counts = buildRouteVisitCounts([
      visit(),
      visit({ runsheetName: '  night shift patrols ' }),
      visit({ start: '2026-08-20T08:00:00.000Z' }),
      visit({ runsheetName: 'Day Time Patrols' }),
    ]);

    expect(
      getRouteVisitCount(counts, { runsheetName: 'Night Shift Patrols', start: '2026-08-19' }),
    ).toBe(2);
    expect(
      getRouteVisitCount(counts, { runsheetName: 'Night Shift Patrols', start: '2026-08-20' }),
    ).toBe(1);
    expect(
      getRouteVisitCount(counts, { runsheetName: 'Day Time Patrols', start: '2026-08-19' }),
    ).toBe(1);
  });

  it('leaves unrouted visits out of every bucket', () => {
    const counts = buildRouteVisitCounts([visit(), visit({ runsheetName: null })]);

    // One card's worth, not two: a visit nobody has routed sits on no route card,
    // and the header's red assignment count is where that demand is reported.
    expect([...counts.values()].reduce((total, value) => total + value, 0)).toBe(1);
  });

  it('does not count a shift as a stop on itself', () => {
    // Only the visits fetches fill this state, but several branches write it, and a
    // runsheet shift carries a `runsheetName` too — its own route's.
    expect(buildRouteVisitCounts([visit({ shiftType: 'patrol' })]).size).toBe(0);
  });
});

describe('getRouteVisitCount', () => {
  const counts = buildRouteVisitCounts([visit()]);

  it('says zero for a run the list does not mention, and nothing when there is no list', () => {
    /* The distinction the card's `!= null` test depends on: a route running on a day
       with no stops in it is a fact the list can state, so it reads `0`. No list at
       all reads nothing. */
    expect(
      getRouteVisitCount(counts, { runsheetName: 'Night Shift Patrols', start: '2026-08-21' }),
    ).toBe(0);
    expect(
      getRouteVisitCount(null, { runsheetName: 'Night Shift Patrols', start: '2026-08-19' }),
    ).toBeNull();
  });

  it('says nothing for a card with no route to match on', () => {
    // A dedicated or dispatch card, and the unrouted case from the other side.
    expect(getRouteVisitCount(counts, { start: '2026-08-19' })).toBeNull();
  });

  it('puts a raw ISO visit in the same day column the grid put its card in', () => {
    /* The off-by-one this guards is silent and total: `dayjsWithStandardOffset`
       parses a bare `YYYY-MM-DD` as local midnight, so pushing an already-normalised
       card date through it a second time can shunt it a day backwards and leave
       every count one column out. */
    const sameDay = buildRouteVisitCounts([visit({ start: '2026-08-19T23:30:00.000Z' })]);
    const cardDay = mapGridV2WeekData({
      view: 'patrol',
      sections: [
        {
          key: 's',
          id: 's',
          rows: [
            {
              id: 'r',
              title: 'Night Shift Patrols',
              shifts: [
                {
                  id: 9,
                  shiftType: 'patrol',
                  legendType: 'patrol',
                  start: '2026-08-19T23:30:00.000Z',
                  startsAt: '2026-08-19T23:30:00.000Z',
                },
              ],
            },
          ],
        },
      ],
    }).shifts[0];

    expect(getRouteVisitCount(sameDay, cardDay)).toBe(1);
  });
});

describe('the routes week of 17–23 Aug 2026', () => {
  it('is twelve route cards under a header with no total of its own', () => {
    const { cards, footerStats } = routesWeek();

    expect(cards).toHaveLength(12);
    /* No total above these cards, deliberately — it used to read `12 Routes`, a count
       of the cards themselves in a unit nobody plans in, and it is gone. So the
       per-card counts are the only numbers on this reading, and there is nothing for a
       planner to try to add them up to and find they do not match. */
    expect(sumScheduleWindowTotal(footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW)).toBeNull();
  });

  it('counts every routed visit on exactly one card, and never a cancelled one', () => {
    const { cards } = routesWeek();
    const visits = visitsWeek();
    const counts = buildRouteVisitCounts(visits);

    expect(visits).toHaveLength(13);
    expect(visits.filter((one) => one.status === 'cancelled')).toHaveLength(0);

    /* Summed over **route-days**, not over cards: a route that runs twice in one day
       has two cards showing that day's one count, so a sum over cards can exceed the
       work in the window. Two of these twelve cards are such a pair. */
    const byRouteDay = new Map();
    cards.forEach((card) => {
      const count = getRouteVisitCount(counts, card);
      if (count == null) return;
      byRouteDay.set(`${card.runsheetName}|${card.start}`, count);
    });

    const onCards = [...byRouteDay.values()].reduce((total, value) => total + value, 0);
    const routed = visits.filter((one) => one.runsheetName).length;

    /* Where the other visits are, and why this is a `<=` and not an equality: two of
       the thirteen are unrouted (they belong to no card here), and the rest are on
       routes this demo's runsheet grid never runs on the day they fall — the mock
       builds its three patrol rows from a different site book than its 46-site
       visits book, so the two barely intersect. Every visit that *is* on a card is
       counted once. */
    expect(onCards).toBeLessThanOrEqual(routed);
    expect(routed).toBe(11);

    /**
     * **No exact figure here, on purpose.**
     *
     * This used to assert `onCards === 1`, and name the card it landed on as Orlando
     * Day Time Runsheet on `2026-08-20`. It went red the next morning: the single
     * visit that coincides with a card is the demo's forced in-progress one, pinned to
     * `todayIndex()`, so which card it meets moves every midnight. A literal date in a
     * fixture whose data follows the clock is a test that passes on the day it is
     * written.
     *
     * Recomputing the expected figure here is also wrong, and subtly: the counts key
     * on the day the *grid* puts a card in, which `dayKeyOf` resolves through the
     * franchise offset. Slicing a visit's ISO stamp instead lands a day out for any
     * visit whose UTC date and franchise date differ — the exact off-by-one that
     * function exists to prevent. Reimplementing it in the test would only assert that
     * two derivations agree, and a wrong one would look like a product bug.
     *
     * So what is pinned is the property that does not depend on the clock: nothing is
     * double-counted, no cancelled visit is ever counted, and the total on cards can
     * never exceed the routed work in the window. The two-windows-agree claim — the one
     * that actually guards against drift — is asserted over the whole map in the month
     * suite below.
     */
    expect([...byRouteDay.values()].every((count) => Number.isInteger(count) && count >= 0)).toBe(
      true,
    );
    expect(buildRouteVisitCounts(visits)).toEqual(counts);
  });
});

/**
 * The **routes month**, which now fetches the same two payloads the routes week does
 * (`getRoutesByMonth`) instead of the `/aggregate` tally it used to draw.
 *
 * `dropCancelledEvents` is applied to the visit list here because production applies
 * it before the list reaches `visitsForHarmonize`, and it is the whole reason the
 * month's counts can be trusted: the aggregate excluded cancelled work in the mock's
 * own `visitCountsForDay`, and this path has to keep that property by a different
 * mechanism — a cut on arrival rather than a tally that never counted it.
 */
const routesMonth = () => {
  const patrol = buildScheduleSummary({ ...MONTH_WINDOW, view: 'patrol' });
  const raw = buildScheduleSummary({
    ...MONTH_WINDOW,
    view: 'visits',
    groupBy: 'company',
  }).shifts;

  return {
    cards: mapGridV2WeekData(patrol).shifts,
    raw,
    visits: dropCancelledEvents(raw, false),
  };
};

describe('the routes month of August 2026', () => {
  it('draws real route cards, inside the window it asked for', () => {
    const { cards } = routesMonth();

    /* Records, not a tally: every one of these has a route to name and a status to
       wash, which is exactly what `/aggregate` could not supply. */
    expect(cards).toHaveLength(12);
    expect(cards.every((card) => card.runsheetName)).toBe(true);
    expect(cards.every((card) => card.start >= '2026-08-01' && card.start <= '2026-09-04')).toBe(
      true,
    );
    // Flattened to a bare date by the same mapper the week uses, which is what makes
    // each card an all-day event in its cell rather than a card on a time axis.
    expect(cards.every((card) => /^\d{4}-\d{2}-\d{2}$/.test(card.start))).toBe(true);

    /* **A demo-data fact, recorded rather than asserted as a contract.** All twelve
       land in Aug 1–7: `buildSection` places its four shifts per row at day offsets
       *relative to the window start* and never repeats them, so it answers a 35-day
       window with one week's worth of runs. Nothing in the wiring above is
       window-relative — if this ever reads more than seven populated days, the mock
       has been fixed and this expectation is what should move. */
    const populatedDays = [...new Set(cards.map((card) => card.start))].sort();
    expect(populatedDays).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
      '2026-08-04',
      '2026-08-06',
      '2026-08-07',
    ]);
  });

  it('never disagrees with the week about a route-day', () => {
    /* The property the whole approach is for. Both readings count the same list with
       the same function, so a route-day the two windows share must answer identically
       — a card cannot read `2` in the week and `3` in the month. Asserted across
       *every* shared key rather than on one example, because the failure mode is a
       single day drifting, not the whole map. */
    const weekCounts = buildRouteVisitCounts(visitsWeek());
    const monthCounts = buildRouteVisitCounts(routesMonth().visits);

    const disagreements = [...weekCounts.entries()].filter(
      ([key, count]) => (monthCounts.get(key) || 0) !== count,
    );

    expect(disagreements).toEqual([]);
    // And the month's window is genuinely the wider of the two, so this is not
    // vacuous: 32 route-days against the week's 11.
    expect(weekCounts.size).toBe(11);
    expect(monthCounts.size).toBe(32);
  });

  it('gives a shared route-day the same figure the week gives it', () => {
    /* Was pinned to `Orlando Day Time Runsheet` on `2026-08-20`, which is the day the
       demo's forced in-progress visit happened to fall on when this was written. It
       moves with `todayIndex()`, so the pair is now found rather than named: take any
       route-day the week's narrower list knows about and check the month agrees. The
       claim — two windows, one number — is the same one, and it no longer expires. */
    const monthCounts = buildRouteVisitCounts(routesMonth().visits);
    const weekCounts = buildRouteVisitCounts(visitsWeek());

    const shared = [...weekCounts.keys()].filter((key) => monthCounts.has(key));
    expect(shared.length).toBeGreaterThan(0);

    shared.forEach((key) => {
      const [runsheetName, start] = key.split('|');
      const card = { runsheetName, start };
      expect(getRouteVisitCount(monthCounts, card)).toBe(getRouteVisitCount(weekCounts, card));
    });
  });

  it('leaves cancelled visits out of the month`s counts', () => {
    /* The aggregate never counted them (`visitCountsForDay` skips cancelled), and the
       month must not start counting them now that it counts records. Four of the
       month's 46 visits are called off, and this is one route-day where that changes
       the answer — 1 before the cut, 0 after. */
    const { raw, visits } = routesMonth();
    expect(raw).toHaveLength(46);
    expect(visits).toHaveLength(42);

    const key = { runsheetName: 'Orlando Day Time Runsheet', start: '2026-08-03' };
    expect(getRouteVisitCount(buildRouteVisitCounts(raw), key)).toBe(1);
    expect(getRouteVisitCount(buildRouteVisitCounts(visits), key)).toBe(0);
  });

  it('reads 0 on every card, because of the demo`s two disjoint site books', () => {
    /* Correct wiring, honest zeroes — and worth pinning so nobody reads a grid of
       noughts as a broken join. The patrol grid is built from a 3-entry `SITES` list
       and the visits book from a 46-entry `VISIT_SITES`, so the two agree on only
       three route *names* and, in this window, never on a route and a day together:
       the grid's runs are all in Aug 1–7 while the list's stops on those three routes
       start on Aug 7 and run to Aug 31. */
    const { cards, visits } = routesMonth();
    const counts = buildRouteVisitCounts(visits);

    expect(cards.map((card) => getRouteVisitCount(counts, card))).toEqual(Array(12).fill(0));
    /* `0` and not `null`, which is the distinction that matters here: the month *has*
       a visit list, so every card is entitled to state that its run is empty. Before
       `getRoutesByMonth` there was no list on this reading at all and no card could
       have printed anything. */
    expect(counts).not.toBeNull();
  });
});
