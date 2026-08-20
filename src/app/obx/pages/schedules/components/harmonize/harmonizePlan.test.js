import dayjs from 'dayjs';
import {
  FILTER_MINUTES,
  serviceMinutesForFilters,
  SITE_MINUTES,
} from 'src/utils/constants/serviceTime';

import { buildVisits, defaultTargetDay, VISIT_BUCKET } from './demoVisits';
import {
  applyManualOrder,
  defaultMergeTarget,
  optionsAreEquivalent,
  planAllOptions,
  planOption,
  planRun,
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
    expect(plan.fittedVisitCount).toBe(2);
  });

  /**
   * **The saving harmonizing exists to produce, asserted.**
   *
   * A visit's `serviceMinutes` is `SITE_MINUTES` plus its filter time, so two
   * visits at one address must not pay the call-out twice — the van arrives once.
   * 30 + 20 is therefore 40, not 50, and the missing 10 is precisely what
   * consolidating those two visits bought. Before this, on-site time was linear in
   * visits and this screen could not show its own value.
   */
  it('charges the call-out once when two visits share an address', () => {
    const together = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 30), visitAt('b', 'alpha', 0.05, 20)],
      startPoint: START,
    });
    const apart = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 30), visitAt('b', 'bravo', 0.05, 20)],
      startPoint: START,
    });

    expect(together.stops[0].serviceMinutes).toBe(30 + 20 - SITE_MINUTES);
    /* Same work, one address instead of two — one fewer arrival to pay for. */
    expect(apart.serviceMinutes - together.serviceMinutes).toBe(SITE_MINUTES);
  });

  /**
   * The breakdown the route card prints has to add back to the total it is a
   * breakdown *of*, or a planner checking the arithmetic finds it does not close.
   * `filterMinutes` is the exact, countable half; `siteMinutes` absorbs whatever a
   * visit's duration did not derive from this model.
   */
  it('splits a stop into a filter figure and a call-out that add back to the total', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [
        visitAt('a', 'alpha', 0.05, serviceMinutesForFilters(3), { filterCount: 3 }),
        visitAt('b', 'alpha', 0.05, serviceMinutesForFilters(2), { filterCount: 2 }),
      ],
      startPoint: START,
    });

    const [stop] = plan.stops;
    expect(stop.filterCount).toBe(5);
    expect(stop.filterMinutes).toBe(5 * FILTER_MINUTES);
    expect(stop.siteMinutes).toBe(SITE_MINUTES);
    expect(stop.siteMinutes + stop.filterMinutes).toBe(stop.serviceMinutes);
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

/**
 * `applyManualOrder` had no tests at all, and it re-derives eleven fields of a plan
 * by hand — the exact shape of code where a field added upstream silently keeps a
 * stale value. Two of these assertions are regressions, not new behaviour.
 */
describe('applyManualOrder', () => {
  const reordered = () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [
        visitAt('a', 'alpha', 0.02, serviceMinutesForFilters(2), { filterCount: 2 }),
        visitAt('b', 'bravo', 0.05, serviceMinutesForFilters(3), { filterCount: 3 }),
      ],
      startPoint: START,
    });

    return applyManualOrder({
      plan,
      /* The reverse of what the solver chose. */
      orderedSiteIds: ['bravo', 'alpha'],
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });
  };

  it('keeps the planner order and re-walks the arrival times', () => {
    const plan = reordered();

    expect(plan.stops.map((stop) => stop.siteId)).toEqual(['bravo', 'alpha']);
    expect(plan.stops[0].order).toBe(1);
    /* Times are re-walked, not carried: stop two must arrive after stop one. */
    expect(plan.stops[1].arrivalMinutes).toBeGreaterThan(plan.stops[0].arrivalMinutes);
  });

  it('carries the on-site split through a reorder', () => {
    const plan = reordered();

    /* A hand order changes the sequence, never the work — five filters either way,
       and the halves still add back to the service total. */
    expect(plan.filterCount).toBe(5);
    expect(plan.filterMinutes).toBe(5 * FILTER_MINUTES);
    expect(plan.siteMinutes + plan.filterMinutes).toBe(plan.serviceMinutes);
  });

  it('counts the overflow it keeps, rather than inheriting a count of something else', () => {
    /* Three stops, sized so one cannot fit — the overflow is deliberately kept
       from the pre-reorder plan, so its count has to be kept with it. */
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [
        visitAt('a', 'alpha', 0.05, 240),
        visitAt('b', 'bravo', 0.9, 240),
        visitAt('c', 'charlie', 1.8, 240),
      ],
      startPoint: START,
    });
    expect(plan.overflow.length).toBeGreaterThan(0);

    const manual = applyManualOrder({
      plan,
      orderedSiteIds: plan.stops.map((stop) => stop.siteId).reverse(),
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });

    expect(manual.overflow).toEqual(plan.overflow);
    expect(manual.overflowVisitCount).toBe(
      plan.overflow.reduce((total, stop) => total + stop.visits.length, 0),
    );
  });

  it('recomputes how much of somebody else s route the order moved', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('n', 'new-site', 0.02, 30)],
      startPoint: START,
      existingStops: [existingStopAt('x', 0.1, 30), existingStopAt('y', 0.2, 30)],
    });

    const untouched = applyManualOrder({
      plan,
      orderedSiteIds: plan.stops.map((stop) => stop.siteId),
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });
    const shuffled = applyManualOrder({
      plan,
      orderedSiteIds: plan.stops.map((stop) => stop.siteId).reverse(),
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });

    /* This feeds the card's "N stops re-ordered" disclosure and the Apply payload,
       so it has to describe the order on screen and not the one before it. */
    expect(untouched.reorderedExistingCount).toBe(0);
    expect(shuffled.reorderedExistingCount).toBeGreaterThan(0);
  });

  it('keeps a hand order that overruns the day rather than re-spilling it', () => {
    /* Both fit as the solver ordered them — nearest first. Reversed by hand the
       driving is longer, and `budgetMinutes: Infinity` means the route keeps both
       stops and lets the meter carry the bad news. */
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 120), visitAt('b', 'bravo', 0.3, 120)],
      startPoint: START,
    });
    expect(plan.stops).toHaveLength(2);

    const manual = applyManualOrder({
      plan,
      orderedSiteIds: ['bravo', 'alpha'],
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });

    expect(manual.stops.map((stop) => stop.siteId)).toEqual(['bravo', 'alpha']);
    /* `budgetMinutes: Infinity` — manual means manual. */
    expect(manual.stops).toHaveLength(2);
  });

  /**
   * **The constraint that decides how cross-route dragging has to be built.**
   *
   * `bySiteId` is built from `plan.stops` alone and unknown ids are dropped by
   * `.filter(Boolean)`, so this function cannot be handed a stop that is not
   * already on the route — not one from the overflow, and not one from another
   * route. It fails *silently*, returning a shorter route rather than an error,
   * which is the failure mode worth a test: a drag wired through here would
   * quietly delete the visit it was supposed to move.
   *
   * Moving work between routes therefore has to go through a real `planRun`
   * re-solve. This test exists to make that non-negotiable rather than a comment
   * somebody can talk themselves out of.
   */
  it('silently ignores a site it is not already carrying', () => {
    const plan = planOption({
      option: ROUTE_OPTION.SHORTEST,
      visits: [visitAt('a', 'alpha', 0.05, 30)],
      startPoint: START,
    });

    const manual = applyManualOrder({
      plan,
      orderedSiteIds: ['somewhere-else', 'alpha'],
      startPoint: START,
      returnToStart: true,
      dayStartMinutes: 8 * 60,
    });

    expect(manual.stops.map((stop) => stop.siteId)).toEqual(['alpha']);
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

describe('planRun', () => {
  /**
   * Two visits sized so the shape of the run is not up to the solver's mood: at
   * 300 minutes each, one fills the day and the other cannot join it (a 49-minute
   * hop out plus a 53-minute drive home puts the pair at 706 of 480), but the
   * second fits comfortably alone on a later day (406). Every ordering strategy
   * agrees on which one goes first, so `near` is always route one's work and `mid`
   * is always the spill.
   */
  const near = () => visitAt('near', 'near-site', 0.02, 300);
  const mid = () => visitAt('mid', 'mid-site', 0.3, 300);

  const MONDAY = '2026-08-17';
  const THURSDAY = '2026-08-20';
  const NEXT_MONDAY = '2026-08-24';

  it('spills what will not fit onto the next available day', () => {
    const run = planRun({ visits: [near(), mid()], startPoint: START, days: [MONDAY, THURSDAY] });

    expect(run.routes.map((route) => route.day)).toEqual([MONDAY, THURSDAY]);
    expect(run.routes[0].plan.stops.map((stop) => stop.siteId)).toEqual(['near-site']);
    expect(run.routes[1].plan.stops.map((stop) => stop.siteId)).toEqual(['mid-site']);
    expect(run.unplaced).toEqual([]);
  });

  /**
   * **The `servesOn` hook.** Capacity is what the solver knows about; whether a
   * visit may legally be done on a given date is not. Work that spills off Monday
   * can only land on Thursday if Thursday is still inside its need-by window — so
   * without this hook the greedy day-filling would quietly drop a visit onto a
   * date that breaks its contract, and every number on the card would still look
   * plausible.
   */
  it('does not let spill land on a day the visit cannot be served on', () => {
    const run = planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY],
      servesOn: (visit, day) => !(visit.id === 'mid' && day === THURSDAY),
    });

    expect(run.routes.map((route) => route.day)).toEqual([MONDAY]);
    /* Named as unplaced rather than dropped: the window is the planner's
       constraint, and the honest response is to say it is too small. */
    expect(run.unplaced.map((visit) => visit.id)).toEqual(['mid']);
  });

  it('holds spill for a later day that can serve it rather than giving up on it', () => {
    const run = planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY, NEXT_MONDAY],
      servesOn: (visit, day) => !(visit.id === 'mid' && day === THURSDAY),
    });

    /* Thursday cannot take it, so Thursday is not emitted as an empty route — the
       work waits for the Monday that can. */
    expect(run.routes.map((route) => route.day)).toEqual([MONDAY, NEXT_MONDAY]);
    expect(run.routes[1].plan.stops.map((stop) => stop.siteId)).toEqual(['mid-site']);
    expect(run.unplaced).toEqual([]);
  });

  it('withholds a visit from the very first day too, not only from the spill', () => {
    /* Both would fit Monday on capacity alone. The hook is a constraint on every
       day the run considers, not a filter applied after the first one. */
    const run = planRun({
      visits: [visitAt('a', 'a-site', 0.02, 30), visitAt('b', 'b-site', 0.05, 30)],
      startPoint: START,
      days: [MONDAY],
      servesOn: (visit, day) => !(visit.id === 'b' && day === MONDAY),
    });

    expect(run.routes).toHaveLength(1);
    expect(run.routes[0].plan.stops.map((stop) => stop.siteId)).toEqual(['a-site']);
    expect(run.unplaced.map((visit) => visit.id)).toEqual(['b']);
  });

  it('asks the hook about each visit against each day it considers', () => {
    const asked = [];

    planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY],
      servesOn: (visit, day) => {
        asked.push(`${visit.id}@${day}`);
        return true;
      },
    });

    expect(asked).toContain(`near@${MONDAY}`);
    expect(asked).toContain(`mid@${MONDAY}`);
    /* Only the spill is offered to the second day — work already routed is not
       reconsidered. */
    expect(asked).toContain(`mid@${THURSDAY}`);
    expect(asked).not.toContain(`near@${THURSDAY}`);
  });

  it('places everything when the hook allows every day', () => {
    const permissive = planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY],
      servesOn: () => true,
    });
    const byDefault = planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY],
    });

    /* The default has to be the permissive one, or a caller that has no need-by
       opinion would silently lose work. */
    expect(permissive.routes.map((route) => route.day)).toEqual(
      byDefault.routes.map((route) => route.day),
    );
    expect(permissive.unplaced).toEqual([]);
  });

  it('reports everything as unplaced when no day may serve it', () => {
    const run = planRun({
      visits: [near(), mid()],
      startPoint: START,
      days: [MONDAY, THURSDAY],
      servesOn: () => false,
    });

    expect(run.routes).toEqual([]);
    expect(run.unplaced.map((visit) => visit.id)).toEqual(['near', 'mid']);
  });

  it('leaves work unplaced when the window runs out of days', () => {
    const run = planRun({ visits: [near(), mid()], startPoint: START, days: [MONDAY] });

    expect(run.routes.map((route) => route.day)).toEqual([MONDAY]);
    expect(run.unplaced.map((visit) => visit.id)).toEqual(['mid']);
  });

  /**
   * **The cross-route drag, at the level the state model expresses it.**
   *
   * A drag is a pin from a site to a *day*, honoured by `planRun` and made unspillable
   * by `planOption`. These four assertions are the whole contract, and they are the
   * behaviour the product owner chose: the solver re-sequences the destination, the
   * drop may push a day past the man-day, and it may not break a contract window.
   */
  describe('sitePins', () => {
    it('moves a site onto the day it was pinned to', () => {
      const unpinned = planRun({
        visits: [near(), mid()],
        startPoint: START,
        days: [MONDAY, THURSDAY],
      });
      const pinned = planRun({
        visits: [near(), mid()],
        startPoint: START,
        days: [MONDAY, THURSDAY],
        /* `near` fills Monday on its own, so the solver puts it there every time.
           Pinned to Thursday, it has to go to Thursday instead. */
        sitePins: { 'near-site': THURSDAY },
      });

      expect(unpinned.routes[0].plan.stops.map((stop) => stop.siteId)).toEqual(['near-site']);
      const thursday = pinned.routes.find((route) => route.day === THURSDAY);
      expect(thursday.plan.stops.map((stop) => stop.siteId)).toContain('near-site');
      /* And it must be gone from Monday — a pin that added a stop without removing it
         would silently duplicate the visit across two days. */
      const monday = pinned.routes.find((route) => route.day === MONDAY);
      expect(monday?.plan.stops.map((stop) => stop.siteId) || []).not.toContain('near-site');
    });

    it('keeps a pinned site even when it pushes the day past the man-day', () => {
      /* Both are 300-minute visits and the pair cannot fit one day — the solver spills
         one. Pinning both to Monday says do them anyway. */
      const run = planRun({
        visits: [near(), mid()],
        startPoint: START,
        days: [MONDAY, THURSDAY],
        sitePins: { 'near-site': MONDAY, 'mid-site': MONDAY },
      });

      const monday = run.routes.find((route) => route.day === MONDAY);
      expect(monday.plan.stops.map((stop) => stop.siteId).sort()).toEqual([
        'mid-site',
        'near-site',
      ]);
      /* The meter carries the bad news rather than the solver dropping a stop. */
      expect(monday.plan.overflowMinutes).toBeGreaterThan(0);
      expect(run.unplaced).toEqual([]);
    });

    it('lets the solver re-sequence the day it was dropped into', () => {
      /* Three sites, dropped onto one day. The planner said *which day*; the order is
         still the solver's answer, which is the semantics chosen over honouring the
         drop position. Nearest-first from the depot is that answer. */
      const run = planRun({
        visits: [
          visitAt('a', 'far-site', 0.3, 30),
          visitAt('b', 'near-site', 0.02, 30),
          visitAt('c', 'mid-site', 0.15, 30),
        ],
        startPoint: START,
        days: [MONDAY],
        sitePins: { 'far-site': MONDAY, 'near-site': MONDAY, 'mid-site': MONDAY },
      });

      expect(run.routes[0].plan.stops.map((stop) => stop.siteId)).toEqual([
        'near-site',
        'mid-site',
        'far-site',
      ]);
    });

    it('cannot buy a visit out of its contract window', () => {
      /* `servesOn` still has the last word. The UI refuses this drag before it ever
         sets a pin, but the solver must not honour one that slipped through — a pin
         that overrode a need-by window would put work on a day its contract forbids
         and every number on the card would still look plausible. */
      const run = planRun({
        visits: [near(), mid()],
        startPoint: START,
        days: [MONDAY, THURSDAY],
        sitePins: { 'mid-site': THURSDAY },
        servesOn: (visit, day) => !(visit.id === 'mid' && day === THURSDAY),
      });

      expect(
        run.routes.flatMap((route) => route.plan.stops.map((stop) => stop.siteId)),
      ).not.toContain('mid-site');
      expect(run.unplaced.map((visit) => visit.id)).toEqual(['mid']);
    });
  });

  it('plans nothing at all when given no days', () => {
    const run = planRun({ visits: [near()], startPoint: START, days: [] });

    expect(run.routes).toEqual([]);
    expect(run.unplaced.map((visit) => visit.id)).toEqual(['near']);
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
