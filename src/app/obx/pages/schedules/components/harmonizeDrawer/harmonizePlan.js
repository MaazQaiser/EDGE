/**
 * Consolidation planning, built on the route maths the build-route screen
 * already uses.
 *
 * The question this answers is not "how do I drive less this week" but "how
 * much of this week fits in one day". So every function here ends up at the
 * same place: an ordered list that fits inside the budget, and a list that
 * doesn't and has to go somewhere else.
 *
 * Ordering is done on haversine distance because ordering does not need
 * precision. The times the planner actually decides on are refined by the
 * directions layer once it answers.
 */

import {
  groupVisitsIntoStops,
  MAN_DAY_MINUTES,
  travelMinutes,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { VISIT_BUCKET } from './demoVisits';

export const ROUTE_OPTION = {
  SHORTEST: 'shortest',
  MOST_FIT: 'mostFit',
  OVERDUE_FIRST: 'overdueFirst',
};

export const ROUTE_OPTION_ORDER = [
  ROUTE_OPTION.SHORTEST,
  ROUTE_OPTION.MOST_FIT,
  ROUTE_OPTION.OVERDUE_FIRST,
];

const isOverdueStop = (stop) => stop.visits.some((visit) => visit.bucket === VISIT_BUCKET.OVERDUE);

const hasWindowRisk = (stop) => stop.visits.some((visit) => visit.hasAccessWindow);

/** Nearest-next: classic proximity ordering, ignores how long the stop takes. */
const orderByProximity = (startPoint, stops) => {
  const remaining = [...stops];
  const ordered = [];
  let cursor = startPoint;

  while (remaining.length) {
    let bestIndex = 0;
    let bestMinutes = Infinity;

    remaining.forEach((stop, index) => {
      const minutes = travelMinutes(cursor, stop);
      if (minutes < bestMinutes) {
        bestMinutes = minutes;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    cursor = next;
  }

  return ordered;
};

/**
 * Cheapest-next: weighs the drive *and* the time on site, so quick nearby jobs
 * come first. Fits more stops into the same budget than nearest-next whenever
 * service times vary, at the cost of a little more driving.
 */
const orderByCheapestNext = (startPoint, stops) => {
  const remaining = [...stops];
  const ordered = [];
  let cursor = startPoint;

  while (remaining.length) {
    let bestIndex = 0;
    let bestCost = Infinity;

    remaining.forEach((stop, index) => {
      const cost = travelMinutes(cursor, stop) + stop.serviceMinutes;
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    });

    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    cursor = next;
  }

  return ordered;
};

/** Compliance-safe: everything late goes first, each group ordered by proximity. */
const orderByOverdueFirst = (startPoint, stops) => {
  const late = stops.filter(isOverdueStop);
  const rest = stops.filter((stop) => !isOverdueStop(stop));

  const orderedLate = orderByProximity(startPoint, late);
  const cursor = orderedLate[orderedLate.length - 1] || startPoint;

  return [...orderedLate, ...orderByProximity(cursor, rest)];
};

const ORDERERS = {
  [ROUTE_OPTION.SHORTEST]: orderByProximity,
  [ROUTE_OPTION.MOST_FIT]: orderByCheapestNext,
  [ROUTE_OPTION.OVERDUE_FIRST]: orderByOverdueFirst,
};

/**
 * Walks an ordered list against the budget, keeping what fits.
 *
 * A stop that would push the day over does not stop the walk — later stops are
 * still tried, because a short one nearby can fit where a long one couldn't.
 * The return leg is charged on every candidate, since finishing far from home
 * is only free when the planner has said the route may end there.
 */
const packStops = ({ ordered, startPoint, returnToStart, budgetMinutes, dayStartMinutes }) => {
  const fitted = [];
  const overflow = [];

  let cursor = startPoint;
  let elapsed = 0;
  let serviceMinutes = 0;
  let travelMinutesTotal = 0;

  ordered.forEach((stop) => {
    const legMinutes = travelMinutes(cursor, stop);
    const returnLeg = returnToStart ? travelMinutes(stop, startPoint) : 0;

    /* Work already committed to the runsheet cannot be spilled — it is not ours
       to move. When it overruns the day, the meter says so instead. */
    const canSpill = stop.canSpill !== false;

    if (canSpill && elapsed + legMinutes + stop.serviceMinutes + returnLeg > budgetMinutes) {
      overflow.push(stop);
      return;
    }

    elapsed += legMinutes;
    const arrivalMinutes = dayStartMinutes + elapsed;
    elapsed += stop.serviceMinutes;

    serviceMinutes += stop.serviceMinutes;
    travelMinutesTotal += legMinutes;

    fitted.push({
      ...stop,
      order: fitted.length + 1,
      travelFromPrevious: legMinutes,
      arrivalMinutes,
      departureMinutes: dayStartMinutes + elapsed,
      windowRisk: hasWindowRisk(stop),
    });

    cursor = stop;
  });

  const returnLegMinutes = returnToStart && fitted.length ? travelMinutes(cursor, startPoint) : 0;
  travelMinutesTotal += returnLegMinutes;

  return {
    stops: fitted,
    overflow,
    serviceMinutes,
    travelMinutes: travelMinutesTotal,
    returnLegMinutes,
    totalMinutes: serviceMinutes + travelMinutesTotal,
    finishMinutes: dayStartMinutes + elapsed + returnLegMinutes,
  };
};

/**
 * One planned day for one ordering strategy.
 *
 * When the day is being merged into an existing runsheet, that runsheet's stops
 * are solved *together* with the new ones rather than having the new work
 * appended to the end. Appending would save nothing — the technician would
 * drive out past a new site, run their old round, and come back — so an
 * interleaved re-solve is the only version of merging worth offering.
 *
 * The price is that stops the planner never selected can move, which is why the
 * footer says how many did. Stops already completed do not move at all.
 */
export const planOption = ({
  option,
  visits = [],
  startPoint,
  returnToStart = true,
  existingStops = [],
  dayStartMinutes = 9 * 60,
}) => {
  const newStops = groupVisitsIntoStops(visits).map((stop) => ({ ...stop, isNew: true }));

  /* Committed work is part of the route but never part of the spill. */
  const committed = existingStops.map((stop) => ({ ...stop, canSpill: false }));
  const done = committed.filter((stop) => stop.completed);
  const movable = [...committed.filter((stop) => !stop.completed), ...newStops];

  /* The solver picks up from wherever the technician already is. */
  const cursor = done[done.length - 1] || startPoint;

  const pack = (orderer) =>
    packStops({
      ordered: [...done, ...orderer(cursor, movable)],
      startPoint,
      returnToStart,
      budgetMinutes: MAN_DAY_MINUTES,
      dayStartMinutes,
    });

  const countFitted = (result) =>
    result.stops.filter((stop) => stop.isNew).reduce((total, s) => total + s.visits.length, 0);

  let packed;

  if (option === ROUTE_OPTION.MOST_FIT) {
    /* The name is a promise, so this option cannot simply run one heuristic and
       hope. Cheapest-next usually wins, but on clustered work plain proximity
       fits more — so try both and keep whichever actually does, breaking ties
       towards the shorter drive. Without this the row can read "fits the most"
       above a smaller number than the row above it. */
    const candidates = [pack(orderByCheapestNext), pack(orderByProximity)];
    packed = candidates.reduce((best, candidate) =>
      countFitted(candidate) > countFitted(best) ||
      (countFitted(candidate) === countFitted(best) && candidate.totalMinutes < best.totalMinutes)
        ? candidate
        : best,
    );
  } else {
    packed = pack(ORDERERS[option] || orderByProximity);
  }

  /* What the runsheet was already carrying, drawn as its own segment so "no
     room" always shows what is taking the room. */
  const existingLoadMinutes = packed.stops
    .filter((stop) => !stop.isNew)
    .reduce((total, stop) => total + stop.serviceMinutes, 0);

  return {
    option,
    ...packed,
    existingLoadMinutes,
    /* Service time here means the new work only — the existing load is its own
       segment, and counting it twice would double the bar. */
    serviceMinutes: packed.serviceMinutes - existingLoadMinutes,
    budgetMinutes: MAN_DAY_MINUTES,
    dayTotalMinutes: packed.totalMinutes,
    remainingMinutes: Math.max(0, MAN_DAY_MINUTES - packed.totalMinutes),
    overflowMinutes: Math.max(0, packed.totalMinutes - MAN_DAY_MINUTES),
    fittedVisitCount: packed.stops
      .filter((stop) => stop.isNew)
      .reduce((total, stop) => total + stop.visits.length, 0),
    overflowVisitCount: packed.overflow.reduce((total, stop) => total + stop.visits.length, 0),
    /* How many of somebody else's stops this would shuffle. Said out loud on
       the footer, because silently rewriting a route destroys trust in the
       tool faster than a wrong number does. */
    reorderedExistingCount: packed.stops.filter(
      (stop, index) =>
        !stop.isNew && !stop.completed && existingStops[index]?.siteId !== stop.siteId,
    ).length,
    /* A stop with a hard access window is not counted as proven to fit — the
       solver does not know when the site is open. */
    windowRiskCount: packed.stops.filter((stop) => stop.windowRisk).length,
  };
};

export const planAllOptions = (input) =>
  ROUTE_OPTION_ORDER.map((option) => planOption({ ...input, option }));

/**
 * Two strategies can land on exactly the same route — "fits the most" falls back
 * to proximity ordering whenever that fits more, and then it *is* the shortest
 * drive. Showing both would offer a choice that does not exist, so identical
 * outcomes collapse to the first one that produced them.
 */
export const dedupePlans = (plans = []) => {
  const seen = new Set();

  return plans.filter((plan) => {
    /* Keyed on what the row actually shows. Two sequences that cost the same
       and fit the same give the planner nothing to choose between, even when
       the stop order differs internally. */
    const key = `${plan.fittedVisitCount}|${plan.totalMinutes}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Near-identical options are still three ways of asking the same question, so
 * the strip only earns its place when the answers genuinely differ.
 */
export const optionsAreEquivalent = (plans = []) => {
  if (plans.length < 2) return true;

  const times = plans.map((plan) => plan.totalMinutes);
  const fits = plans.map((plan) => plan.fittedVisitCount);

  return Math.max(...times) - Math.min(...times) < 5 && Math.max(...fits) === Math.min(...fits);
};

/**
 * The merge target the planner most likely wants: the one with the most room.
 *
 * A live runsheet is never chosen automatically — inserting into a route
 * someone is already driving rewrites a day they have in their head. It stays
 * selectable, just not by default.
 */
export const defaultMergeTarget = (runsheets = []) => {
  const eligible = runsheets.filter((runsheet) => runsheet.status !== 'live');
  if (!eligible.length) return null;

  const [best] = [...eligible].sort(
    (a, b) =>
      a.loadMinutes - b.loadMinutes ||
      /* Tie goes to the unassigned runsheet — nobody's day gets rewritten. */
      (a.worker === null ? -1 : b.worker === null ? 1 : 0),
  );

  return best.id;
};

/** Reorders a plan's stops to a planner-supplied sequence, then re-walks times. */
export const applyManualOrder = ({
  plan,
  orderedSiteIds,
  startPoint,
  returnToStart,
  dayStartMinutes,
}) => {
  const bySiteId = new Map(plan.stops.map((stop) => [stop.siteId, stop]));
  const ordered = orderedSiteIds.map((siteId) => bySiteId.get(siteId)).filter(Boolean);

  const packed = packStops({
    ordered,
    startPoint,
    returnToStart,
    /* Manual means manual: the planner's order is kept even when it spills, and
       the meter goes over rather than the drawer quietly dropping a stop. */
    budgetMinutes: Number.POSITIVE_INFINITY,
    dayStartMinutes,
  });

  const existingLoadMinutes = packed.stops
    .filter((stop) => !stop.isNew)
    .reduce((total, stop) => total + stop.serviceMinutes, 0);

  return {
    ...plan,
    ...packed,
    overflow: plan.overflow,
    existingLoadMinutes,
    serviceMinutes: packed.serviceMinutes - existingLoadMinutes,
    dayTotalMinutes: packed.totalMinutes,
    remainingMinutes: Math.max(0, MAN_DAY_MINUTES - packed.totalMinutes),
    overflowMinutes: Math.max(0, packed.totalMinutes - MAN_DAY_MINUTES),
    fittedVisitCount: packed.stops
      .filter((stop) => stop.isNew)
      .reduce((total, stop) => total + stop.visits.length, 0),
    windowRiskCount: packed.stops.filter((stop) => stop.windowRisk).length,
  };
};
