/**
 * The planner: worked days in, runsheets out.
 *
 * Pure and dateless — every answer is derived from the arguments, dates arrive as
 * `YYYY-MM-DD` strings and are compared as strings, and nothing reads the clock. That
 * is what lets ④ re-price a drag inside a `useMemo` while the pointer is moving, and
 * what lets the tests below assert a whole week without freezing time.
 *
 * **This is not the engine `harmonize/harmonizeRule.js` runs.** That one answers a
 * different question — how much of a week fits into *one* route day inside a radius
 * of where the van starts — and it is pinned by its own suite. This one implements
 * the model in `HARMONIZE-CONTEXT.md`: a range of worked days, **one zone each**
 * (D15), **no radius at all**, and **no installers** (D14). The two disagree about
 * geography and about how many days a run produces, which is not something a shared
 * abstraction can paper over, so they are separate files that never import each other.
 *
 * ## The shape of the problem (§5.2)
 *
 * Dates are flexible inside a contractual window, **geography is rigid**, and
 * **capacity is advisory**. That combination decides the whole algorithm:
 *
 * - Because geography is hard (H4) and each day has exactly one zone, a visit's
 *   candidate days are just *the worked days whose zone matches its site and whose
 *   date its window reaches*. There is no cross-zone trade to search.
 * - Because capacity is soft (S0/H2), **a full day never refuses a visit.** Nothing is
 *   ever unplaced for want of hours; a day simply reports its overrun and the planner
 *   decides what to do about it in ③. This is the single most important consequence of
 *   D3 and it is why `assign` below has no capacity check in its rejection path.
 *
 * So placement (S2, the primary objective) is already maximal the moment candidate
 * days are computed: every visit with at least one candidate is placed. What is left
 * to optimise is *which* candidate, and then the order within a day.
 */

import { onSiteMinsFor } from './durations';
import { BASE, SITES, ZONES } from './fixtures';
import { UNPLACED_REASON } from './reasons';

/**
 * Notional minutes between two points on the fixture's flat grid.
 *
 * `2.2` min/mile is roughly 27 mph — an urban average with stops, which is the right
 * order of magnitude for a van doing four calls in a city. Straight-line, so it is an
 * *under*-estimate of road distance and the flow labels every drive time as estimated
 * (Q25, §14.8). Rounding to the minute here rather than at display time keeps the legs
 * summing to the total the day reports; rounding twice is how a runsheet ends up
 * three minutes short of its own stops.
 */
const MINS_PER_MILE = 2.2;

export const travelMins = (a, b) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) * MINS_PER_MILE);

/**
 * Straight-line miles between two points on the fixture's grid.
 *
 * The same measurement `travelMins` is built from, before it is converted — so a leg's
 * miles and its minutes can never disagree about how far apart two sites are. **Not
 * rounded here**: the row that prints it decides how much precision to claim, and rounding
 * twice is how a route's legs stop summing to its own total.
 *
 * Notional miles on a flat grid, and every surface that quotes one says so (Q25). Nothing
 * here is a road network.
 */
export const travelMiles = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** `YYYY-MM-DD` sorts lexically, so the window test needs no date library. */
const withinWindow = (date, visit) => date >= visit.needByFrom && date <= visit.needByTo;

/**
 * Every worked day this visit could legally go on, in date order.
 *
 * The three hard constraints that matter here, in the order they eliminate most:
 * the day must be worked (H3), its single zone must be the site's (H4), and the date
 * must fall inside the need-by window (H7). Capacity is *not* consulted — see the
 * header; a legal day stays legal however full it is.
 *
 * **A `custom` day skips the zone test and keeps the window one**, matching `priceMove`
 * exactly — see its own note for why a hand-made route is allowed any zone but no
 * relaxation of a customer's need-by window. The two had to agree: this function is what
 * decides whether a **pin** sticks (below), so a day `priceMove` accepted a drop onto but
 * this rejected would take the visit and then silently hand it back to the engine on the
 * next render. That was a real bug, and it looked like the drop landing on the wrong day.
 *
 * This is *not* the list the engine assigns from — see `autoDaysFor`.
 */
export const legalDaysFor = (visit, site, days) =>
  days
    .filter(
      (d) =>
        d.worked &&
        withinWindow(d.date, visit) &&
        (d.custom ? true : Boolean(d.zoneId) && d.zoneId === site.zoneId),
    )
    .map((d) => d.date)
    .sort();

/**
 * The days the **engine** may choose from — every legal day that is not a manual route.
 *
 * A route a planner created by hand exists to be filled by hand: it is an empty page they
 * drag work onto, and an optimizer that helpfully pre-loaded it would take that away the
 * moment it appeared. So the split is: `legalDaysFor` answers *may this visit be here*
 * (drops, pins, the tray's own legal-day counts) and this answers *may the engine put it
 * here on its own*. `addRoute` gives a custom route no zone at all, which means this
 * filter is belt to that braces rather than the only thing standing between the two.
 */
const autoDaysFor = (legalDays, days) => {
  const custom = new Set(days.filter((d) => d.custom).map((d) => d.date));
  return legalDays.filter((date) => !custom.has(date));
};

/**
 * The days a **planner** may drop onto — **every worked day, with no further test.**
 *
 * ## Three oracles now, and the split is the point
 *
 * - `legalDaysFor` — where the *engine's* rules allow a visit: worked, zone matches, inside
 *   the need-by window. Still exactly as it was.
 * - `autoDaysFor` — of those, the ones the engine may choose *on its own* (not manual routes).
 * - **this** — where a *hand* may put it. Worked, and nothing else.
 *
 * The zone and window tests used to gate drops too, and dropping was refused with
 * `wrongZone` / `outsideWindow`. Removed on instruction: a planner may now drop any visit
 * on any day in the run. The engine is unchanged — it still only places work where D15's
 * one-zone-per-day and H7's need-by window allow — so what this does is separate *what the
 * optimizer is willing to propose* from *what a human is allowed to overrule*, which is the
 * distinction ④ existed to offer and was only ever half-offering.
 *
 * **`worked` is kept, and it is not a restriction in practice.** The only drop targets on
 * screen are the day tabs, and a tab exists only for a worked day or a manual route — so
 * this rejects nothing a planner can actually aim at. It stays as the guard that stops a
 * stale pin resurrecting a day that has since been switched off, which would otherwise
 * build a runsheet for a day with no shift to measure it against.
 *
 * **This must agree with `priceMove` exactly.** It is the oracle the *pin* is tested
 * against, so a day `priceMove` accepts but this rejects takes the drop and then silently
 * hands the visit back to the engine on the next render — a real bug once, and it looked
 * like the drop landing on the wrong day.
 */
export const droppableDatesFor = (days) =>
  days
    .filter((d) => d.worked)
    .map((d) => d.date)
    .sort();

/**
 * Why this visit has nowhere to go — the distinction the tray's copy is built on.
 *
 * Data faults are tested first and separately from scheduling ones. A site with no
 * zone and a site whose zone is simply not worked this week produce the same empty
 * candidate list and want completely different sentences: one is "fix the site
 * record", the other is "work West on Thursday and I'll place it". Reporting the
 * second for the first is how a config screen gets blamed for a data problem.
 */
const rejectionFor = (visit, site, days) => {
  if (!site) return UNPLACED_REASON.SITE_NOT_LOCATED;
  if (!site.zoneId || !ZONES.some((z) => z.id === site.zoneId)) return UNPLACED_REASON.SITE_NO_ZONE;
  if (!Number.isFinite(site.x) || !Number.isFinite(site.y)) return UNPLACED_REASON.SITE_NOT_LOCATED;

  /* The zone is real; is it ever worked in this range at all? That question and
     "worked, but not on a day this window reaches" are the two halves of E6 and they
     have different remedies — add a day for the zone, versus widen the window. */
  const zoneIsWorked = days.some((d) => d.worked && d.zoneId === site.zoneId);
  return zoneIsWorked ? UNPLACED_REASON.NO_LEGAL_DAY : UNPLACED_REASON.ZONE_NOT_WORKED;
};

/**
 * How far a date sits from the centre of a window, in days — the S4 slack measure.
 *
 * Placing at the centre leaves the most room either side for a future run to move the
 * visit again, which is what "retained slack" means. Both endpoints are inclusive, so
 * a 7-day window has a genuine centre day and this returns 0 for it.
 */
const slackCost = (date, visit) => {
  const day = (s) => Math.round(Date.parse(`${s}T00:00:00Z`) / 86400000);
  const centre = (day(visit.needByFrom) + day(visit.needByTo)) / 2;
  return Math.abs(day(date) - centre);
};

/**
 * Choose one day per visit.
 *
 * **Heaviest first.** Visits are considered in descending on-site time so the big
 * commitments claim their day while the picture is still open, and the small ones
 * fill in around them — the standard bin-packing intuition, and it matters for S5:
 * seeding a day with a 90-minute visit and then balancing is far better than
 * discovering the 90-minute visit last when both candidate days already look equal.
 *
 * **Nothing is ever rejected for capacity.** A visit with one candidate takes it
 * however full it is; that is S0, and the resulting overrun is the proposal's job to
 * report rather than the planner's job to avoid. `loadMins` therefore breaks ties
 * (S5) instead of gating.
 *
 * Ties resolve S4 before S5 — slack is a promise to the contract, load balance is a
 * preference about the week — and finally by date so the result is deterministic.
 * A run that reorders itself between two identical inputs is a run nobody can review.
 */
const assign = (candidates, days) => {
  const loadMins = Object.fromEntries(days.map((d) => [d.date, 0]));
  const placements = {};

  const order = [...candidates].sort(
    (a, b) =>
      onSiteMinsFor(b.visit.filterCount) - onSiteMinsFor(a.visit.filterCount) ||
      a.visit.id.localeCompare(b.visit.id),
  );

  order.forEach(({ visit, autoDays }) => {
    /* Pin-only: every legal day this visit has is a manual route, which the engine does
       not place onto (see `autoDaysFor`). `planRange`'s pin pass is what gives it a day;
       leaving it out of `placements` here is what lets that pass be the only author. */
    if (!autoDays.length) return;

    const best = [...autoDays].sort(
      (x, y) =>
        slackCost(x, visit) - slackCost(y, visit) ||
        loadMins[x] - loadMins[y] ||
        x.localeCompare(y),
    )[0];
    placements[visit.id] = best;
    loadMins[best] += onSiteMinsFor(visit.filterCount);
  });

  return placements;
};

/** Total driving for a base→…→base tour over `stops`, in minutes. */
const tourMins = (stops) => {
  let total = 0;
  let prev = BASE;
  stops.forEach((s) => {
    total += travelMins(prev, s.site);
    prev = s.site;
  });
  return total + travelMins(prev, BASE);
};

/**
 * Order one day's stops: nearest-neighbour, then 2-opt to convergence.
 *
 * S1 asks for minimum travel and this is a travelling-salesman problem, so "minimum"
 * is aspirational — but at the sizes this feature actually sees (§13's canonical week
 * is 4, 4 and 5 stops; the fixture's worst day is 5) **2-opt from a nearest-neighbour
 * seed reaches the optimum essentially always**, and it does so in microseconds. A
 * real solver would be the wrong kind of correct here: ④ re-prices on hover, so the
 * sequencer runs on every pointer move over a day tab.
 *
 * The loop is bounded rather than trusted to converge. 2-opt on a symmetric metric
 * does terminate, but this runs inside a render path and a geometry bug that made an
 * improvement look infinite would hang the drawer rather than draw a bad route.
 */
const sequence = (visits) => {
  const stops = visits.map((visit) => ({ visit, site: SITES.find((s) => s.id === visit.siteId) }));
  if (stops.length < 2) return stops;

  const remaining = [...stops];
  const path = [];
  let cursor = BASE;
  while (remaining.length) {
    let bestIndex = 0;
    let bestCost = Infinity;
    remaining.forEach((s, i) => {
      const cost = travelMins(cursor, s.site);
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = i;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    path.push(next);
    cursor = next.site;
  }

  let improved = true;
  let guard = 0;
  while (improved && guard < 64) {
    improved = false;
    guard += 1;
    for (let i = 0; i < path.length - 1; i += 1) {
      for (let k = i + 1; k < path.length; k += 1) {
        const candidate = [
          ...path.slice(0, i),
          ...path.slice(i, k + 1).reverse(),
          ...path.slice(k + 1),
        ];
        if (tourMins(candidate) < tourMins(path)) {
          path.splice(0, path.length, ...candidate);
          improved = true;
        }
      }
    }
  }

  return path;
};

/**
 * Walk an ordered day and stamp every stop with its elapsed arrival and departure.
 *
 * **Elapsed from leaving base, not from a clock (D16).** The first stop's arrival is
 * the first leg's driving time, so a day that opens with a 20-minute drive has its
 * first arrival at `0:20` — which is the notation carrying the whole of D16's meaning.
 * §14.3 is right that this cannot reach the field as-is (Q23); that is a gap
 * downstream of Apply, not a reason for the planner to invent a start hour it was
 * explicitly denied.
 */
const withElapsed = (orderedStops) => {
  let cursor = 0;
  let prev = BASE;

  const stops = orderedStops.map((stop, index) => {
    const travelFromPrev = travelMins(prev, stop.site);
    /* Carried on the stop beside its minutes because the row prints one or the other and
       both come from the same measurement — see `travelMiles`. */
    const milesFromPrev = travelMiles(prev, stop.site);
    const arriveMins = cursor + travelFromPrev;
    const onSiteMins = onSiteMinsFor(stop.visit.filterCount);
    const departMins = arriveMins + onSiteMins;

    cursor = departMins;
    prev = stop.site;

    return {
      ...stop,
      index: index + 1,
      travelFromPrev,
      milesFromPrev,
      arriveMins,
      onSiteMins,
      departMins,
    };
  });

  const returnMins = travelMins(prev, BASE);
  return { stops, returnMins, durationMins: cursor + returnMins };
};

/**
 * One worked day plus the visits assigned to it, as a finished runsheet.
 *
 * Extracted from `planRange` because **three callers now build a day**: the plan itself,
 * `priceMove` quoting what a move would cost, and `overspill.js` re-solving a day after
 * lifting a stop off it. Each of the three has to produce a day the other two would
 * recognise — same sequence, same elapsed chain, same overrun arithmetic — and three
 * copies of that is three places for `travelMins` to stop summing to `durationMins`.
 *
 * Sequencing lives here rather than in the caller, which is what makes it safe to hand
 * this a *set* of visits and get back a day: removing a stop changes the tour, so a caller
 * that dropped a visit and kept the old order would report a duration the route does not
 * have.
 */
export const buildRunsheet = (day, dayVisits) => {
  const { stops, returnMins, durationMins } = withElapsed(sequence(dayVisits));
  const travelTotal = stops.reduce((sum, s) => sum + s.travelFromPrev, 0) + returnMins;

  return {
    date: day.date,
    zoneId: day.zoneId,
    shiftMins: day.shiftMins,
    stops,
    returnMins,
    durationMins,
    travelMins: travelTotal,
    onSiteMins: durationMins - travelTotal,
    filterCount: stops.reduce((sum, s) => sum + s.visit.filterCount, 0),
    overrunMins: Math.max(0, durationMins - day.shiftMins),
  };
};

/**
 * The run's figures, from its days and what they hold.
 *
 * Exported for the same reason `buildRunsheet` is: `overspill.js` moves stops out of days
 * and has to restate every one of these, and a second copy of the arithmetic is how a
 * headline ends up disagreeing with the cards under it.
 *
 * **§14.4 — the headline is hours, not visits.** "13 of 15 placed" treats an 8-filter data
 * centre and a 1-filter library as the same event, when the cost model says one is 170
 * minutes and the other 30. Both numbers are computed; the flow leads with
 * `placedMins / availableMins` and keeps the count as the secondary figure, which is the
 * cheap fix §14.4 asks for and also makes the under-filled day (E4) legible in the same
 * unit as everything else.
 */
export const totalsFor = ({ runsheets, days, unplaced, visitCount }) => ({
  placedMins: runsheets.reduce((sum, r) => sum + r.durationMins, 0),
  availableMins: days.reduce((sum, d) => sum + (d.worked ? d.shiftMins : 0), 0),
  unplacedMins: unplaced.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0),
  placedCount: runsheets.reduce((sum, r) => sum + r.stops.length, 0),
  visitCount,
  travelMins: runsheets.reduce((sum, r) => sum + r.travelMins, 0),
  overrunDays: runsheets.filter((r) => r.overrunMins > 0).length,
  spareMins: runsheets.reduce((sum, r) => sum + Math.max(0, r.shiftMins - r.durationMins), 0),
});

/**
 * Plan the range.
 *
 * Returns `{ runsheets, unplaced, totals }`. Everything the six states render is
 * derived from this one object — the capacity strip, the day pane, the tray, ⑤'s diff
 * and ⑥'s banner — so a figure can only disagree with another figure by one of them
 * recomputing rather than reading.
 *
 * `pinned` maps a visit id to the date a planner dragged it onto (④); `setAside` is a
 * set of visit ids the planner removed by hand (X4). They arrive here
 * rather than being filtered by the caller so that the run still *knows* about them:
 * a set-aside visit is unplaced with a reason, not absent, which is what lets the tray
 * offer to put it back and what keeps the "15 in scope" total honest.
 */
export const planRange = ({ days, visits, setAside = [], pinned = {} }) => {
  const asideSet = new Set(setAside);
  /* Where a hand may have put something — see `droppableDatesFor`. Built once here because
     both the placeable test and the pin pass below have to ask the same question. */
  const droppable = new Set(droppableDatesFor(days));
  const candidates = [];
  const unplaced = [];

  visits.forEach((visit) => {
    const site = SITES.find((s) => s.id === visit.siteId);

    if (asideSet.has(visit.id)) {
      unplaced.push({ visit, site, reason: UNPLACED_REASON.SET_ASIDE, legalDays: [] });
      return;
    }

    const legalDays = site ? legalDaysFor(visit, site, days) : [];
    const autoDays = autoDaysFor(legalDays, days);
    const pin = pinned[visit.id];

    /**
     * **Placeable means: the engine can place it, or a pin already has.**
     *
     * `autoDays.length` alone was the test, and it is wrong once manual routes exist. A
     * West visit whose only legal day is a hand-made route has no auto day — so it would
     * have been reported unplaced while *also* being pinned to that route, and the pin pass
     * below would then place it. Reported missing and drawn on a runsheet at the same time.
     *
     * Checking the pin here is what keeps the two lists disjoint: pinned onto a legal day
     * makes it a candidate, and everything else with nowhere to go is genuinely unplaced.
     */
    if (!autoDays.length && !(pin && droppable.has(pin))) {
      /* `legalDays` rather than `[]`: a visit the engine cannot place but a *planner* could
         — its only legal day being a manual route — is exactly the row the tray should be
         able to say "there is somewhere for this" about. */
      unplaced.push({ visit, site, reason: rejectionFor(visit, site, days), legalDays });
      return;
    }
    candidates.push({ visit, site, legalDays, autoDays });
  });

  /**
   * Manual placements win, and they are the reason D5 can be true.
   *
   * "Manual edits never trigger re-harmonization" is stated as a rule about the
   * *engine*, but it is really a rule about this line: a hand-moved visit has to
   * survive the next `planRange` call, and ④ re-plans on every drag. Pinning is
   * applied after `assign` rather than by removing the visit from the pool, so a
   * pin that has become illegal — the planner raised the hours, changed a zone, and
   * the pinned day no longer matches — falls back to the engine's own choice instead
   * of stranding the visit on a day it may not legally occupy (H4/H7 outrank a pin).
   */
  const placements = assign(candidates, days);
  candidates.forEach(({ visit }) => {
    const pin = pinned[visit.id];
    /* **Tested against the droppable set, not `legalDays`.** A pin is a planner's decision
       and it now outranks the zone and the window, which is the whole of the "drop anywhere"
       change — `priceMove` accepted the drop, so this has to honour it or the visit bounces
       back to the engine's choice on the next render. `worked` is still checked (via
       `droppable`) so a pin cannot survive its day being switched off. */
    if (pin && droppable.has(pin)) placements[visit.id] = pin;
  });

  const runsheets = days
    .filter((d) => d.worked)
    .map((day) =>
      buildRunsheet(
        day,
        candidates.filter((c) => placements[c.visit.id] === day.date).map((c) => c.visit),
      ),
    );

  return {
    runsheets,
    /**
     * **Empty here, always.** The engine's job ends at "everything legal is placed", and
     * `overspill.js` is what decides which of those placements the day actually has hours
     * for. Declared rather than omitted so a consumer reading `plan.spilled` off a raw
     * `planRange` result gets a list to iterate rather than `undefined` — the two plans
     * are the same shape, and only one of them has done the fitting.
     */
    spilled: [],
    unplaced,
    totals: totalsFor({ runsheets, days, unplaced, visitCount: visits.length }),
  };
};

/**
 * What moving `visitId` to `targetDate` would cost — ④'s live pricing, or its refusal.
 *
 * §13.7 makes this a stated design decision rather than a nicety: the cost of a move
 * is visible *before* it is made, so ④ is not trial and error. It also makes a refusal
 * explainable — "the window allows the date, the zone does not" is the difference
 * between a rule and a bug, and that sentence needs both halves tested separately,
 * which is why this returns `windowAllows` alongside `legal`.
 *
 * Prices by replanning both affected days from scratch rather than by adding the
 * visit's on-site time to a running total. A move changes the *sequence*, so the true
 * cost includes the detour, and an estimate that ignored it would price a move at
 * +90m and then deliver +130m the moment it was made.
 */
export const priceMove = ({ plan, days, visitId, targetDate }) => {
  const day = days.find((d) => d.date === targetDate);
  const stop = plan.runsheets.flatMap((r) => r.stops).find((s) => s.visit.id === visitId);
  /**
   * **Three places a visit can be, and a move starts from any of them.**
   *
   * A stop on a day, a card in the overspill tray, or a card in the not-placed tray. The
   * spill list is the one added last and it is the one the drawer's commonest drag comes
   * from: work the day had no hours for, being put back by hand.
   */
  const spilled = (plan.spilled || []).find((u) => u.visit.id === visitId);
  const parked = plan.unplaced.find((u) => u.visit.id === visitId);
  const visit = stop?.visit || spilled?.visit || parked?.visit;
  const site = stop?.site || spilled?.site || parked?.site;

  if (!visit || !site || !day?.worked) return { legal: false, reason: 'notWorked' };

  /**
   * **Neither the zone nor the window refuses a drop any more.**
   *
   * Both used to, and the refusals were `wrongZone` and `outsideWindow`. With one zone per
   * day and each zone worked once, the arithmetic of that was brutal: *no* cross-day move
   * was ever legal on the canonical week — every drag came back "wrong zone" — so ④ was a
   * gesture the feature advertised and then declined. Removed on instruction: a planner may
   * drop any visit on any day.
   *
   * The two facts are still **computed and still returned**, because they are the difference
   * between a move that is merely unusual and one that breaks a promise to a customer. H7's
   * need-by window in particular is no longer *enforced* here, and `windowAllows: false` is
   * now the only trace of that — anything wanting to warn about it reads this flag. The
   * engine has not been relaxed: `legalDaysFor` still applies both, so nothing gets placed
   * outside a window unless a human put it there deliberately.
   */
  const windowAllows = withinWindow(targetDate, visit);
  const zoneAllows = Boolean(day.custom) || day.zoneId === site.zoneId;

  /**
   * The day this visit is being taken *off*, if it is on one.
   *
   * **A spilled visit has no source**, and that is what makes its commonest drop legal:
   * it came off this very day for want of hours, so dropping it back on the same date is
   * the whole gesture rather than a no-op. Only a visit that is currently a placed stop
   * can be `alreadyHere`.
   */
  const source = plan.runsheets.find((r) => r.stops.some((s) => s.visit.id === visitId));
  if (source?.date === targetDate) return { legal: false, reason: 'alreadyHere' };

  /* Replan both days with the visit moved, through the same builder the plan itself uses.
     Cheaper than it looks — `sequence` is 2-opt over at most a handful of stops — and it
     is the only way the quoted figure and the figure after the drop are guaranteed to be
     the same number. */
  const rebuild = (date, visits) =>
    buildRunsheet(
      days.find((x) => x.date === date),
      visits,
    );

  const targetSheet = plan.runsheets.find((r) => r.date === targetDate);
  const targetAfter = rebuild(targetDate, [...targetSheet.stops.map((s) => s.visit), visit]);
  const sourceAfter = source
    ? rebuild(
        source.date,
        source.stops.filter((s) => s.visit.id !== visitId).map((s) => s.visit),
      )
    : null;

  return {
    legal: true,
    windowAllows,
    zoneAllows,
    target: {
      date: targetDate,
      before: targetSheet,
      after: targetAfter,
      deltaMins: targetAfter.durationMins - targetSheet.durationMins,
    },
    source: source
      ? {
          date: source.date,
          before: source,
          after: sourceAfter,
          deltaMins: sourceAfter.durationMins - source.durationMins,
        }
      : null,
  };
};
