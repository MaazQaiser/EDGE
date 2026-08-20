import { SCHEDULE_STATS_FOOTER_VARIANTS } from 'src/app/obx/pages/schedules/components/scheduleStatsFooter';
import {
  buildOverviewFooterStats,
  dropCancelledEvents,
} from 'src/app/obx/pages/schedules/helper/scheduleResponseAdapter';
import { buildScheduleSummary } from 'src/stubbedData/mocks/schedule.mock';

import { resolveScheduleWindowTerm, sumScheduleWindowTotal } from './scheduleWindowTotal';

/* The demo payload, not a hand-written fixture: the point of this total is that it
   agrees with the cards the real response produces, and a fixture invented here
   could only ever agree with itself. */
const WINDOW = { windowStart: '2026-08-17', windowEnd: '2026-08-23' };

describe('the window total', () => {
  it('has nothing to say about a reading whose cards are not visits', () => {
    const patrol = buildScheduleSummary({ ...WINDOW, view: 'patrol' });
    /* The routes reading fetches through the overview branch — its tab config *is*
       the overview config — so its footer is built the same way the page builds it,
       and it does have numbers in it. It still gets no total: this used to read
       `12 Routes` over twelve route cards, a count of what is already on screen in a
       unit nobody plans in, and it was asked to go. What that reading needed is the
       per-card visit counts (`routeVisitCount.js`), not a tally of its own cards. */
    const footerStats = buildOverviewFooterStats({}, patrol.footerStats, null);

    expect(patrol.shifts).toHaveLength(12);
    expect(Number(footerStats.statuses.notStarted)).toBeGreaterThan(0);
    expect(sumScheduleWindowTotal(footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW)).toBeNull();
    // Nor the per-service tabs, whose cards are shifts for the same reason.
    expect(sumScheduleWindowTotal(footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.PATROL)).toBeNull();
    expect(
      sumScheduleWindowTotal(footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.DEDICATED),
    ).toBeNull();
  });

  it('equals the visit cards the company reading draws', () => {
    const visits = buildScheduleSummary({ ...WINDOW, view: 'visits', groupBy: 'company' });

    expect(sumScheduleWindowTotal(visits.footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.VISITS)).toBe(
      dropCancelledEvents(visits.shifts).length,
    );
  });

  /* A month, because the demo week this file measures happens to hold no
     cancellation — so only a longer window can show that the gap between the
     payload and the grid is exactly the cancelled records, and that the total
     lands on the grid's side of it. */
  it('counts what the grid draws, not what the payload holds, when a window has cancellations', () => {
    const visits = buildScheduleSummary({
      windowStart: '2026-08-01',
      windowEnd: '2026-08-31',
      view: 'visits',
      groupBy: 'company',
    });
    const drawn = dropCancelledEvents(visits.shifts);
    const cancelled = visits.shifts.length - drawn.length;

    expect(cancelled).toBe(Number(visits.footerStats.statuses.cancelled));
    expect(cancelled).toBeGreaterThan(0);
    expect(sumScheduleWindowTotal(visits.footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.VISITS)).toBe(
      drawn.length,
    );
  });

  it('does not read the payload cancelled count that nothing else reads', () => {
    const footerStats = {
      statuses: { completed: 2, inProgress: 1, notStarted: 3, unassigned: 1, missed: 1 },
    };

    expect(sumScheduleWindowTotal(footerStats, SCHEDULE_STATS_FOOTER_VARIANTS.VISITS)).toBe(8);
    expect(
      sumScheduleWindowTotal(
        { statuses: { ...footerStats.statuses, cancelled: 4 } },
        SCHEDULE_STATS_FOOTER_VARIANTS.VISITS,
      ),
    ).toBe(8);
  });

  it('has no answer, rather than zero, when the window has not reported yet', () => {
    expect(sumScheduleWindowTotal(null, SCHEDULE_STATS_FOOTER_VARIANTS.VISITS)).toBeNull();
    expect(
      sumScheduleWindowTotal({ statuses: {} }, SCHEDULE_STATS_FOOTER_VARIANTS.NONE),
    ).toBeNull();
  });
});

describe('what a count of visits is called', () => {
  const getLabel = (_category, key) =>
    ({ hit: 'Visit', hits: 'Visits', runsheet: 'Route', runsheets: 'Routes' })[key] || '';

  it('is the tenant term, singular or plural to match', () => {
    expect(resolveScheduleWindowTerm({ count: 8, getLabel })).toBe('Visits');
    expect(resolveScheduleWindowTerm({ count: 1, getLabel })).toBe('Visit');
  });

  /* One word now, because there is only one subject left to name: with the routes
     total gone, every count this resolves is a count of visits. It also names the
     count in a route card's own tooltip, which is the other place this chrome writes
     a number of visits — one resolution, so the two cannot call it two things. */
  it('never reaches for the runsheets term, whatever the surface', () => {
    expect(resolveScheduleWindowTerm({ count: 12, getLabel })).toBe('Visits');
    expect(resolveScheduleWindowTerm({ count: 12, showsVisits: false, getLabel })).toBe('Visits');
  });

  it('falls back to English when the tenant has no term of its own', () => {
    const noLabels = () => '';

    expect(resolveScheduleWindowTerm({ count: 2, getLabel: noLabels })).toBe('Visits');
    expect(resolveScheduleWindowTerm({ count: 1, getLabel: noLabels })).toBe('Visit');
  });
});
