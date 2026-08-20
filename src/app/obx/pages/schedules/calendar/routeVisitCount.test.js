import { SCHEDULE_STATS_FOOTER_VARIANTS } from 'src/app/obx/pages/schedules/components/scheduleStatsFooter';
import {
  buildOverviewFooterStats,
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
    expect(onCards).toBe(1);

    // And the one that lands: Orlando Day Time Runsheet, Thursday 20 Aug.
    const orlando = cards.find(
      (card) => card.runsheetName === 'Orlando Day Time Runsheet' && card.start === '2026-08-20',
    );
    expect(getRouteVisitCount(counts, orlando)).toBe(1);
  });
});
