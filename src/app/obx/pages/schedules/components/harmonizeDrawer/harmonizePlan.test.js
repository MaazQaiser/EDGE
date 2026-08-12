import dayjs from 'dayjs';

import { buildVisits, defaultTargetDay, VISIT_BUCKET } from './demoVisits';
import {
  defaultMergeTarget,
  optionsAreEquivalent,
  planAllOptions,
  planOption,
  ROUTE_OPTION,
} from './harmonizePlan';

const START = { label: 'Depot', lat: 28.0, lng: -82.5 };

/** ~0.1° of latitude is roughly 11km, which is about 17 minutes at 38km/h. */
const visitAt = (id, siteId, latOffset, serviceMinutes, extra = {}) => ({
  id,
  siteId,
  siteName: siteId,
  address: `${siteId}, Tampa`,
  lat: 28.0 + latOffset,
  lng: -82.5,
  serviceMinutes,
  bucket: VISIT_BUCKET.AHEAD,
  hasAccessWindow: false,
  scheduledFor: dayjs('2026-08-10'),
  ...extra,
});

/** A stop the merge target is already carrying. */
const existingStopAt = (siteId, latOffset, serviceMinutes, extra = {}) => ({
  siteId,
  siteName: siteId,
  address: `${siteId}, Tampa`,
  lat: 28.0 + latOffset,
  lng: -82.5,
  serviceMinutes,
  visits: [{ id: siteId, serviceMinutes, bucket: VISIT_BUCKET.TODAY }],
  completed: false,
  ...extra,
});

describe('planOption', () => {
  it('fits an easy day with nothing left over', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.02, 30), visitAt('b', 'bravo', 0.05, 30)],
      startPoint: START,
    });

    expect(plan.stops).toHaveLength(2);
    expect(plan.overflow).toHaveLength(0);
    expect(plan.fittedVisitCount).toBe(2);
  });

  it('charges the drive home to the day', () => {
    const visits = [visitAt('a', 'alpha', 0.3, 60)];

    const roundTrip = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits,
      startPoint: START,
      returnToStart: true,
    });
    const openRoute = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits,
      startPoint: START,
      returnToStart: false,
    });

    expect(roundTrip.returnLegMinutes).toBeGreaterThan(0);
    expect(openRoute.returnLegMinutes).toBe(0);
    /* Same work, two endings — the difference is the drive home. */
    expect(roundTrip.totalMinutes - openRoute.totalMinutes).toBe(roundTrip.returnLegMinutes);
  });

  it('fits more work as an open route than as a round trip', () => {
    const visits = [visitAt('a', 'alpha', 0.3, 180), visitAt('b', 'bravo', 0.45, 180)];

    const roundTrip = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits,
      startPoint: START,
      returnToStart: true,
    });
    const openRoute = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits,
      startPoint: START,
      returnToStart: false,
    });

    /* This is the whole reason the end control is a visible lever. */
    expect(roundTrip.fittedVisitCount).toBe(1);
    expect(openRoute.fittedVisitCount).toBe(2);
  });

  it('spills what will not fit rather than silently dropping it', () => {
    const visits = [
      visitAt('a', 'alpha', 0.05, 240),
      visitAt('b', 'bravo', 0.9, 240),
      visitAt('c', 'charlie', 1.8, 240),
    ];

    const plan = planOption({ option: ROUTE_OPTION.SHORTEST, visits, startPoint: START });

    expect(plan.overflow.length).toBeGreaterThan(0);
    expect(plan.fittedVisitCount + plan.overflowVisitCount).toBe(3);
  });

  it('keeps trying later stops after one is too big to fit', () => {
    const visits = [
      visitAt('a', 'a-site', 0.05, 60),
      visitAt('b', 'b-site', 0.1, 420), // too long to fit after a
      visitAt('c', 'c-site', 0.15, 20), // short enough that it still does
    ];

    const plan = planOption({ option: ROUTE_OPTION.SHORTEST, visits, startPoint: START });

    /* The walk must not stop at the first miss — a short stop further out still
       fits where a long nearer one could not. */
    expect(plan.stops.map((stop) => stop.siteId)).toEqual(['a-site', 'c-site']);
    expect(plan.overflow.map((stop) => stop.siteId)).toEqual(['b-site']);
  });

  it('collapses two visits at one site into a single stop', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 30), visitAt('b', 'alpha', 0.05, 20)],
      startPoint: START,
    });

    expect(plan.stops).toHaveLength(1);
    expect(plan.stops[0].visits).toHaveLength(2);
    expect(plan.stops[0].serviceMinutes).toBe(50);
    expect(plan.fittedVisitCount).toBe(2);
  });

  it('lets an existing runsheet load eat the budget without rescaling the day', () => {
    const visits = [visitAt('a', 'alpha', 0.05, 120), visitAt('b', 'bravo', 0.1, 120)];
    const existingStops = [existingStopAt('x', 0.08, 320)];

    const empty = planOption({ option: ROUTE_OPTION.SHORTEST, visits, startPoint: START });
    const merged = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits,
      startPoint: START,
      existingStops,
    });

    expect(empty.overflow).toHaveLength(0);
    expect(merged.overflow.length).toBeGreaterThan(0);
    /* The existing work is drawn as its own segment, not subtracted from the
       budget — the man-day is still eight hours. */
    expect(merged.existingLoadMinutes).toBe(320);
    expect(merged.budgetMinutes).toBe(480);
  });

  it('interleaves a merge instead of appending to the end of the route', () => {
    /* The existing route runs far out; the new visit sits between the depot and
       it, so an interleaved solve must reach the new visit first. */
    const merged = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('n', 'new-site', 0.1, 30)],
      startPoint: START,
      existingStops: [existingStopAt('far', 0.4, 40)],
    });

    expect(merged.stops.map((stop) => stop.siteId)).toEqual(['new-site', 'far']);
    expect(merged.stops[0].isNew).toBe(true);
  });

  it('never spills work the runsheet has already committed to', () => {
    const merged = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('n', 'new-site', 0.05, 300)],
      startPoint: START,
      existingStops: [existingStopAt('a', 0.1, 300), existingStopAt('b', 0.2, 300)],
    });

    /* The day is hopelessly over, but committed stops stay on the route and the
       meter carries the bad news instead. */
    expect(merged.stops.filter((stop) => !stop.isNew)).toHaveLength(2);
    expect(merged.overflowMinutes).toBeGreaterThan(0);
  });

  it('keeps completed stops at the front, in their original order', () => {
    const merged = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('n', 'new-site', 0.02, 30)],
      startPoint: START,
      existingStops: [
        existingStopAt('done-far', 0.5, 30, { completed: true }),
        existingStopAt('pending', 0.3, 30),
      ],
    });

    /* new-site is nearest the depot, but a completed stop cannot be moved
       behind work that has not happened yet. */
    expect(merged.stops[0].siteId).toBe('done-far');
    expect(merged.stops[0].completed).toBe(true);
  });

  it('puts overdue work first when asked, even at a cost', () => {
    const visits = [
      visitAt('near', 'near-site', 0.02, 30),
      visitAt('late', 'late-site', 0.9, 30, { bucket: VISIT_BUCKET.OVERDUE }),
    ];

    const shortest = planOption({ option: ROUTE_OPTION.SHORTEST, visits, startPoint: START });
    const overdue = planOption({ option: ROUTE_OPTION.OVERDUE_FIRST, visits, startPoint: START });

    expect(shortest.stops[0].siteId).toBe('near-site');
    expect(overdue.stops[0].siteId).toBe('late-site');
  });

  it('does not count a stop with an unchecked access window as proven to fit', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 30, { hasAccessWindow: true })],
      startPoint: START,
    });

    expect(plan.windowRiskCount).toBe(1);
    expect(plan.stops[0].windowRisk).toBe(true);
  });
});

describe('planAllOptions', () => {
  it('returns one plan per ordering strategy', () => {
    const plans = planAllOptions({
      visits: [visitAt('a', 'alpha', 0.05, 30), visitAt('b', 'bravo', 0.4, 90)],
      startPoint: START,
    });

    expect(plans.map((plan) => plan.option)).toEqual([
      ROUTE_OPTION.SHORTEST,
      ROUTE_OPTION.MOST_FIT,
      ROUTE_OPTION.OVERDUE_FIRST,
    ]);
  });

  it('never lets "fits the most" fit fewer than the other options', () => {
    /* Clustered work with uneven service times — the case where cheapest-next
       loses to plain proximity and the label would otherwise be a lie. */
    const visits = [
      visitAt('a', 'alpha', 0.05, 30),
      visitAt('b', 'bravo', 0.08, 200),
      visitAt('c', 'charlie', 0.12, 40),
      visitAt('d', 'delta', 0.5, 180),
      visitAt('e', 'echo', 0.55, 60),
    ];

    const plans = planAllOptions({ visits, startPoint: START });
    const mostFit = plans.find((plan) => plan.option === ROUTE_OPTION.MOST_FIT);
    const others = plans.filter((plan) => plan.option !== ROUTE_OPTION.MOST_FIT);

    others.forEach((other) => {
      expect(mostFit.fittedVisitCount).toBeGreaterThanOrEqual(other.fittedVisitCount);
    });
  });

  it('reports options as equivalent when there is no real choice to make', () => {
    const plans = planAllOptions({
      visits: [visitAt('a', 'alpha', 0.02, 30)],
      startPoint: START,
    });

    expect(optionsAreEquivalent(plans)).toBe(true);
  });
});

describe('defaultMergeTarget', () => {
  it('picks the runsheet with the most room', () => {
    expect(
      defaultMergeTarget([
        { id: 'busy', loadMinutes: 400, worker: 'A', status: 'notStarted' },
        { id: 'quiet', loadMinutes: 90, worker: 'B', status: 'notStarted' },
      ]),
    ).toBe('quiet');
  });

  it('never auto-selects a runsheet somebody is already driving', () => {
    expect(
      defaultMergeTarget([
        { id: 'live', loadMinutes: 30, worker: 'A', status: 'live' },
        { id: 'planned', loadMinutes: 200, worker: 'B', status: 'notStarted' },
      ]),
    ).toBe('planned');
  });

  it('falls back to a new runsheet when every option is live', () => {
    expect(defaultMergeTarget([{ id: 'live', loadMinutes: 30, status: 'live' }])).toBeNull();
    expect(defaultMergeTarget([])).toBeNull();
  });
});

describe('defaultTargetDay', () => {
  /* `today` is passed explicitly throughout: the rule below depends on it, so
     leaving it to the wall clock would make these pass or fail by the date they
     happen to run on. */
  const today = dayjs('2026-08-12');

  it('chooses the day already holding the most of the selection', () => {
    const visits = [
      { scheduledFor: dayjs('2026-08-13') },
      { scheduledFor: dayjs('2026-08-15') },
      { scheduledFor: dayjs('2026-08-15') },
    ];

    expect(defaultTargetDay(visits, today).format('YYYY-MM-DD')).toBe('2026-08-15');
  });

  it('breaks a tie towards the earlier day', () => {
    const visits = [{ scheduledFor: dayjs('2026-08-17') }, { scheduledFor: dayjs('2026-08-14') }];

    expect(defaultTargetDay(visits, today).format('YYYY-MM-DD')).toBe('2026-08-14');
  });

  it('never targets a day that has already passed, even if it holds the most visits', () => {
    const visits = [
      { scheduledFor: dayjs('2026-08-10') },
      { scheduledFor: dayjs('2026-08-10') },
      { scheduledFor: dayjs('2026-08-14') },
    ];

    expect(defaultTargetDay(visits, today).format('YYYY-MM-DD')).toBe('2026-08-14');
  });

  it('falls back to today when the whole selection is in the past', () => {
    const visits = [{ scheduledFor: dayjs('2026-08-09') }, { scheduledFor: dayjs('2026-08-11') }];

    expect(defaultTargetDay(visits, today).format('YYYY-MM-DD')).toBe('2026-08-12');
  });

  it('counts today itself as available', () => {
    const visits = [{ scheduledFor: dayjs('2026-08-12') }, { scheduledFor: dayjs('2026-08-15') }];

    expect(defaultTargetDay(visits, today).format('YYYY-MM-DD')).toBe('2026-08-12');
  });
});

describe('buildVisits', () => {
  it('is deterministic, so the same selection never produces a different plan', () => {
    const selection = [{ id: 'v-1', site: 'Downtown Plaza', startsAt: '2026-08-10T09:00:00Z' }];

    const first = buildVisits(selection)[0];
    const second = buildVisits(selection)[0];

    expect(first.lat).toBe(second.lat);
    expect(first.serviceMinutes).toBe(second.serviceMinutes);
  });

  it('gives two visits at the same site the same place', () => {
    const [one, two] = buildVisits([
      { id: 'v-1', site: 'Downtown Plaza', startsAt: '2026-08-10T09:00:00Z' },
      { id: 'v-2', site: 'Downtown Plaza', startsAt: '2026-08-11T09:00:00Z' },
    ]);

    expect(one.siteId).toBe(two.siteId);
    expect(one.lat).toBe(two.lat);
  });

  it('prefers real coordinates over the generated fallback', () => {
    const [visit] = buildVisits([
      { id: 'v-1', site: 'Real Site', lat: 27.5, lng: -82.1, serviceMinutes: 45 },
    ]);

    expect(visit.lat).toBe(27.5);
    expect(visit.serviceMinutes).toBe(45);
  });
});
