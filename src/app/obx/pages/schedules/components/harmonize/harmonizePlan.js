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
  FILTER_MINUTES,
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
 * A stop's on-site time, split into the part a planner can count and the rest.
 *
 * `filterMinutes` is filters × 20 — the checkable half, and the one the breakdown
 * states as arithmetic. `siteMinutes` is whatever is left of `serviceMinutes`
 * after that, which for model-derived work is exactly the per-stop call-out and
 * for an API-supplied duration absorbs the difference. Split this way round so the
 * two always add back to the total the card is breaking down: a breakdown whose
 * parts do not close is worse than no breakdown.
 *
 * Prefers the values `groupVisitsIntoStops` already computed, because it is the
 * one place that knows a site's several visits share a single arrival. Falls back
 * for stops that never passed through it — an existing runsheet's committed stops
 * come straight from the API.
 */
const splitOf = (stop) => {
  const filterCount = Number(stop.filterCount) || 0;
  const filterMinutes = Number.isFinite(stop.filterMinutes)
    ? stop.filterMinutes
    : filterCount * FILTER_MINUTES;
  const siteMinutes = Number.isFinite(stop.siteMinutes)
    ? stop.siteMinutes
    : Math.max(0, (stop.serviceMinutes || 0) - filterMinutes);

  return { filterCount, filterMinutes, siteMinutes };
};

/**
 * One stop's work, shared between the crew.
 *
 * **A second installer halves the work, it does not double the day — and that correction is the
 * whole of this function.** The budget was `installers × shiftMinutes`, which produced a route
 * measured against a sixteen-hour day: arithmetically equivalent for deciding what fits, and wrong
 * as a description. Nobody works sixteen hours. Two people work eight, and the day holds more
 * because each stop takes half as long.
 *
 * **Only the installation time is divided. The call-out is not.** Arriving, parking, finding the
 * plant room and signing in happen once however many hands are on the job — the second installer
 * does not park a second van — so `siteMinutes` is carried whole and only `filterMinutes` is
 * shared. Halving the call-out too would have made a two-person round look 10 minutes a stop
 * cheaper than it is, which is the sort of error that only shows up as a route that overruns.
 *
 * Applied to this run's own stops and not to committed ones: work already on somebody's runsheet
 * was scheduled by somebody else, for a crew this plan knows nothing about.
 */
const shareBetweenCrew = (stop, crewSize) => {
  const crew = Math.max(1, Number(crewSize) || 1);
  if (crew === 1) return stop;

  const { filterMinutes, siteMinutes } = splitOf(stop);
  const sharedFilterMinutes = Math.round(filterMinutes / crew);

  return {
    ...stop,
    filterMinutes: sharedFilterMinutes,
    siteMinutes,
    serviceMinutes: sharedFilterMinutes + siteMinutes,
  };
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
  let filterCount = 0;
  let siteMinutes = 0;
  let filterMinutes = 0;

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

    /* The two halves of on-site time, summed as the route is walked so the card's
       breakdown does not have to re-derive them from a finished plan. `splitOf`
       prefers what `groupVisitsIntoStops` already worked out and falls back for a
       stop that never went through it — an existing runsheet's committed stops
       arrive from the API and carry neither half. */
    const split = splitOf(stop);
    filterCount += split.filterCount;
    siteMinutes += split.siteMinutes;
    filterMinutes += split.filterMinutes;

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
    filterCount,
    siteMinutes,
    filterMinutes,
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
  pinnedSiteIds = null,
  /** How many installers are on this run. Divides the installation time — see `shareBetweenCrew`. */
  crewSize = 1,
  /**
   * How much day there is, in minutes.
   *
   * **Defaulted to `MAN_DAY_MINUTES` rather than made required, because that is what
   * every one of this module's own tests and its two other callers already assume.** The
   * value now arrives from the run — the installer count multiplied by the weekday's
   * stored shift hours — which is what finally consumes the `shiftMinutesFor` seam
   * `harmonizeRule` has exposed and nothing has read. A run with two installers is one
   * round trip measured against sixteen hours, not two routes.
   */
  budgetMinutes = MAN_DAY_MINUTES,
}) => {
  /**
   * **A site the planner dragged onto this day is as binding as one already
   * committed to it, and it says so by reusing the same mechanism.**
   *
   * `canSpill: false` is what `packStops` reads to mean *this stop stays even if the
   * day overruns*, and it exists for work the runsheet has already promised. A hand
   * drag deserves exactly that treatment: the planner has said this visit goes on
   * this day, and a solver that answered by quietly spilling it back off again would
   * be overruling the gesture it was asked to honour. The day goes over instead, and
   * the meter carries the bad news — which is the same trade `applyManualOrder`
   * already makes for a hand-ordered sequence.
   */
  const newStops = groupVisitsIntoStops(visits).map((stop) => ({
    ...shareBetweenCrew(stop, crewSize),
    isNew: true,
    ...(pinnedSiteIds?.has(stop.siteId) ? { canSpill: false } : null),
  }));

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
      budgetMinutes,
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

  /* The same subtraction `serviceMinutes` gets, applied to each half of it.
     Without this the breakdown would count somebody else's stops as work this run
     is proposing — which is the exact double-count `existingLoadMinutes` exists to
     prevent, reintroduced one level down. */
  const newWork = newWorkSplit(packed.stops);

  return {
    option,
    ...packed,
    existingLoadMinutes,
    /* Service time here means the new work only — the existing load is its own
       segment, and counting it twice would double the bar. */
    serviceMinutes: packed.serviceMinutes - existingLoadMinutes,
    ...newWork,
    budgetMinutes,
    dayTotalMinutes: packed.totalMinutes,
    remainingMinutes: Math.max(0, budgetMinutes - packed.totalMinutes),
    overflowMinutes: Math.max(0, packed.totalMinutes - budgetMinutes),
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

/**
 * The on-site halves for the *new* work only.
 *
 * Summed over `isNew` stops rather than subtracted from the packed totals, because
 * a subtraction would need the existing stops' own split and those are the stops
 * least likely to carry one.
 */
const newWorkSplit = (stops = []) =>
  stops
    .filter((stop) => stop.isNew)
    .reduce(
      (totals, stop) => {
        const split = splitOf(stop);
        return {
          filterCount: totals.filterCount + split.filterCount,
          filterMinutes: totals.filterMinutes + split.filterMinutes,
          siteMinutes: totals.siteMinutes + split.siteMinutes,
        };
      },
      { filterCount: 0, filterMinutes: 0, siteMinutes: 0 },
    );

export const planAllOptions = (input) =>
  ROUTE_OPTION_ORDER.map((option) => planOption({ ...input, option }));

/**
 * The route the optimizer proposes, and why.
 *
 * The drawer used to show three orderings and ask the planner to choose. That was
 * the wrong question to put to them: the three differ by a few minutes, the
 * difference is not visible on a map, and "shortest driving" versus "fits the
 * most" is a trade only the solver can actually evaluate. So all three still run
 * — they are cheap — and the one that **serves the most visits**, breaking ties
 * towards the shorter drive, is the answer. What the planner gets instead of a
 * choice is the reasoning.
 *
 * `rationale` is deliberately made of numbers the drawer already shows elsewhere.
 * An explanation that introduces its own figures is a second source of truth.
 */
export const planBestRoute = (input) => {
  const candidates = planAllOptions(input).filter(Boolean);
  if (!candidates.length) return null;

  const best = candidates.reduce((winner, candidate) =>
    candidate.fittedVisitCount > winner.fittedVisitCount ||
    (candidate.fittedVisitCount === winner.fittedVisitCount &&
      candidate.totalMinutes < winner.totalMinutes)
      ? candidate
      : winner,
  );

  const siteCount = new Set(best.stops.filter((stop) => stop.isNew).map((stop) => stop.siteId))
    .size;

  return {
    ...best,
    rationale: {
      strategy: best.option,
      fittedVisitCount: best.fittedVisitCount,
      overflowVisitCount: best.overflowVisitCount,
      siteCount,
      travelMinutes: best.travelMinutes,
      serviceMinutes: best.serviceMinutes,
      /* Whether choosing differently would have served more work. When every
         ordering fits the same visits — which is most of the time on a real
         week — saying "considered 3 orderings" is honest and saying "found a
         better one" is not. */
      alternativesConsidered: candidates.length,
      beatAlternativeBy: Math.max(
        0,
        best.fittedVisitCount - Math.min(...candidates.map((plan) => plan.fittedVisitCount)),
      ),
    },
  };
};

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

/** A run of routes cannot grow without bound — a week of work is 1–3 days of it. */
export const MAX_ROUTES = 6;

/**
 * The whole selection, laid across as many days as it takes.
 *
 * **Greedy by day, and that is the design.** The brief is "cover the maximum in
 * one day; if not possible, spill to another day" — so this fills day one as far
 * as it goes, hands the remainder to the next available day, and repeats. It does
 * not balance the days: two half-full routes are two technician-days, and one full
 * day plus a short second is what the planner asked for.
 *
 * Pure, and deliberately so. Route count is an *output*, days and merge targets
 * are *inputs*, and computing this in a `useMemo` rather than an effect is what
 * stops a re-solve from fighting the planner's own edits (§7.16's neighbourhood).
 *
 * @param {object}   params
 * @param {Array}    params.visits        Everything still to place.
 * @param {Array}    params.days          Day keys the plan may use, in order.
 * @param {Function} params.dayOverride   (index) → day key the planner pinned, or null.
 * @param {Function} params.routesForDay  (dayKey) → existing routes on that day.
 * @param {Function} params.targetOverride (index) → route id the planner chose, or undefined.
 * @param {Function} params.servesOn      (visit, dayKey) → may this day take this visit?
 */
export const planRun = ({
  visits = [],
  startPoint,
  days = [],
  dayOverride = () => null,
  routesForDay = () => [],
  targetOverride = () => undefined,
  servesOn = () => true,
  returnToStart = true,
  defaultDayStartMinutes = 9 * 60,
  sitePins = {},
  /**
   * The budget for one route day, asked per day rather than passed as one number.
   *
   * Both terms of it vary by weekday — shift hours are stored per installation day and
   * the crew is the planner's — so a run spanning a full Monday and a half Saturday has
   * to measure each against its own. Defaulted so every existing caller and test keeps
   * the single man-day it was written against.
   */
  budgetFor = () => MAN_DAY_MINUTES,
  /** Installers on the run. Passed through to `planOption` — see `shareBetweenCrew`. */
  crewSize = 1,
}) => {
  const routes = [];
  const usedDays = new Set();
  let remaining = visits;
  let cursor = 0;

  while (remaining.length && routes.length < MAX_ROUTES) {
    /* The planner's pin wins; otherwise take the next day nothing has claimed. A
       pinned day is allowed to be one an earlier route already used — that is a
       legitimate thing to ask for, and the merge control is how it resolves. */
    const pinned = dayOverride(routes.length);
    let day = pinned;

    if (!day) {
      /* Auto-picked days always move forward from the last route's day, not from
         the start of the window. Otherwise pinning route 1 to Thursday would send
         route 2 back to Monday — technically an unused day, and nonsense as a
         sequence of work. Keys are `YYYY-MM-DD`, so a string compare is a date
         compare. */
      const lastDay = routes.length ? routes[routes.length - 1].day : null;
      while (
        cursor < days.length &&
        (usedDays.has(days[cursor]) || (lastDay && days[cursor] <= lastDay))
      ) {
        cursor += 1;
      }
      day = days[cursor] || null;
      cursor += 1;
    }

    if (!day) break;
    usedDays.add(day);

    /**
     * Work this day is *allowed* to take, which is not the same as work left over.
     *
     * Capacity is what the solver knows about; whether a visit may legally be done
     * on a given date is not. A visit that spills off Monday can only land on
     * Thursday if Thursday is still inside its need-by window, so the remainder is
     * split before the solver sees it: `offered` goes in, `held` waits for a day
     * that can serve it, and anything still held when the days run out is reported
     * as unplaced rather than quietly dropped onto a date that breaks its contract.
     */
    /**
     * **A pinned site is offered to its own day and to no other.**
     *
     * Dragging a visit from one route to another is expressed as a pin from its site
     * to the destination route's *day*, not to a route index — routes are identified
     * by their day here, and `planRun` reassigns `index` on every solve, so an index
     * would name a different route as soon as the run's shape changed.
     *
     * The pin is a constraint in both directions, and both halves matter: a pinned
     * site must not be taken by an earlier day that happens to have room (or the drag
     * would appear to do nothing), and it must not be considered by a later one (or a
     * site dragged off Monday could be quietly handed back to Monday's spill day).
     * `servesOn` still has the last word — a pin cannot buy a visit out of its
     * contract window, which is why the caller refuses the drag before setting one.
     */
    const pinnedElsewhere = (visit) => {
      const pin = sitePins[visit.siteId];
      return Boolean(pin) && pin !== day;
    };
    const takes = (visit) => servesOn(visit, day) && !pinnedElsewhere(visit);

    const offered = remaining.filter(takes);
    const held = remaining.filter((visit) => !takes(visit));

    /* The sites this day is holding by hand, so `planOption` can make them
       unspillable. Derived from what was actually offered rather than from the whole
       pin map: a pin for a site that is not in this run at all is not this day's
       business. */
    const pinnedSiteIds = new Set(
      offered.filter((visit) => sitePins[visit.siteId] === day).map((visit) => visit.siteId),
    );

    const dayRoutes = routesForDay(day);
    const override = targetOverride(routes.length);

    const solveFor = (candidate) => ({
      target: candidate,
      plan: planBestRoute({
        visits: offered,
        startPoint,
        returnToStart,
        existingStops: candidate?.existingStops || [],
        dayStartMinutes: candidate?.startMinutes || defaultDayStartMinutes,
        pinnedSiteIds,
        budgetMinutes: budgetFor(day),
        crewSize,
      }),
    });

    let chosen;

    if (override !== undefined) {
      chosen = solveFor(dayRoutes.find((route) => route.id === override) || null);
    } else {
      /**
       * Merge, or start a fresh route?
       *
       * **Merging is the default, and that is a product decision, not an
       * optimization one:** if a route already runs on that day, the work joins it
       * — one technician out instead of two. `defaultMergeTarget` picks the
       * emptiest one there.
       *
       * The single exception is a merge that *cannot be worked*. The emptiest route
       * on a day can still be nearly full, and dropping a 100-minute visit into it
       * produced a card reading `1 visit · 9h 38m of 8h` — a day the optimizer
       * proposed and nobody could do. So the merge is taken whenever it fits inside
       * the eight hours, a fresh route is taken when the merge would overrun and a
       * fresh one would not, and if neither fits the one serving more visits wins.
       *
       * Note the order matters and an earlier version had it wrong: ranking by
       * visits-served *first* made a fresh route win almost every time, because an
       * empty day always has room for more. That is a better *number* and the wrong
       * *answer* — it quietly stopped merging altogether.
       *
       * The planner can still choose the overflowing merge; the dropdown offers it,
       * and their choice arrives here as an override.
       */
      const merged = solveFor(
        dayRoutes.find((route) => route.id === defaultMergeTarget(dayRoutes)) || null,
      );
      const fresh = merged.target ? solveFor(null) : merged;

      const fits = (candidate) =>
        candidate.plan && candidate.plan.dayTotalMinutes <= candidate.plan.budgetMinutes;
      const served = (candidate) => candidate.plan?.fittedVisitCount || 0;

      if (fits(merged)) chosen = merged;
      else if (fits(fresh)) chosen = fresh;
      else chosen = served(fresh) > served(merged) ? fresh : merged;
    }

    const { plan, target } = chosen;

    if (!plan) break;

    const fitted = plan.stops.filter((stop) => stop.isNew);
    const spilledIds = new Set(
      plan.overflow.flatMap((stop) => stop.visits.map((visit) => visit.id)),
    );

    /* A day that takes nothing is not a route — it is a day to skip. Emitting it
       would show the planner an empty card and count it in "3 routes". The one
       exception is a day the planner pinned: they asked for it, so they see why
       it did not work rather than watching their choice silently vanish. */
    if (!fitted.length && !pinned && !pinnedSiteIds.size) {
      remaining = [...held, ...offered.filter((visit) => spilledIds.has(visit.id))];
      continue;
    }

    routes.push({
      index: routes.length,
      day,
      plan,
      target,
      targetId: target ? target.id : '',
      dayRoutes,
      pinnedDay: Boolean(pinned),
      visitCount: plan.fittedVisitCount,
    });

    remaining = [...held, ...offered.filter((visit) => spilledIds.has(visit.id))];
  }

  return {
    routes,
    /* Work no day in the window could take. Named rather than dropped: the window
       is the planner's constraint, and the honest response is to say it is too
       small, not to quietly lose four visits. */
    unplaced: remaining,
  };
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
    ...newWorkSplit(packed.stops),
    dayTotalMinutes: packed.totalMinutes,
    /* **The plan's own budget, not the constant.** `applyManualOrder` rebuilds these two
       figures after a drag, and reading `MAN_DAY_MINUTES` here meant a two-installer
       route reported its remaining time against eight hours the moment the planner
       re-ordered it — the meter jumped from `11h of 16h` to over budget on a gesture
       that moved no work. `plan.budgetMinutes` is what `planOption` measured it against
       and it survives the spread above. */
    remainingMinutes: Math.max(0, plan.budgetMinutes - packed.totalMinutes),
    overflowMinutes: Math.max(0, packed.totalMinutes - plan.budgetMinutes),
    fittedVisitCount: packed.stops
      .filter((stop) => stop.isNew)
      .reduce((total, stop) => total + stop.visits.length, 0),
    /* **Carried over from `plan` before, and wrong.** `overflow` is deliberately
       kept from the pre-reorder plan, so its visit count has to be kept with it —
       `...packed` supplies neither, and a hand-ordered route was reporting whatever
       count the original solve happened to leave in `...plan`. */
    overflowVisitCount: (plan.overflow || []).reduce(
      (total, stop) => total + stop.visits.length,
      0,
    ),
    /**
     * **Recomputed, not inherited.**
     *
     * This survived from the pre-reorder pack via `...plan` and went stale the
     * moment the planner dragged anything — and it is not a cosmetic number: it
     * feeds `stopsReordered` on the card and the Apply payload, so it is the
     * screen's disclosure that a merge is about to rewrite somebody else's day.
     * A trust-critical count that silently describes a previous arrangement is
     * worse than no count.
     *
     * Measured against `plan.stops` rather than the original `existingStops`,
     * which this function is not given: the question a hand order raises is what
     * moved *relative to the plan being edited*.
     */
    reorderedExistingCount: packed.stops.filter(
      (stop, index) => !stop.isNew && !stop.completed && plan.stops[index]?.siteId !== stop.siteId,
    ).length,
    windowRiskCount: packed.stops.filter((stop) => stop.windowRisk).length,
  };
};
