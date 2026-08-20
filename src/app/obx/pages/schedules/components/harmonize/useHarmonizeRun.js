import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  kmToMiles,
  milesToKm,
  NEED_BY_MAX,
  NEED_BY_MIN,
  RADIUS_MIN_MILES,
  readHarmonizationSettings,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';
import {
  distanceKm,
  FILTER_MINUTES,
  formatMinutesAsDuration,
  MAN_DAY_MINUTES,
} from 'src/app/obx/pages/runSheets/buildRoute/helper';

import { defaultTargetDay, runsheetsOnDay } from './demoVisits';
import { applyManualOrder, planRun } from './harmonizePlan';
import {
  canServeOn,
  EXCLUDED,
  hasContractWindow,
  isoWeekdayOf,
  resolveHarmonizeRule,
  routeDaysInWindow,
  smallestRadiusToInclude,
  smallestWindowToInclude,
  triageVisits,
} from './harmonizeRule';

/**
 * The run: one question, its answer, and the planner's edits to it.
 *
 * **Why this is a hook and not a component's body.** The workspace is three columns
 * that all read the same run — the setup column *asks* the question, the routes
 * column shows the answer, the map draws whichever route is selected — so the run
 * cannot belong to any one of them. It used to be 1,000 lines inside the drawer's
 * own component, which is why there was only ever one place it could be rendered.
 *
 * **What harmonizing is.** The planner works particular weekdays. Every filter
 * replacement is due on a date the contract fixed and may be pulled forward or
 * pushed back only so far. The van leaves from where the planner is, travels a set
 * distance, and comes back. Given that, a run collapses a week's scattered work
 * **onto one route day**: everything whose need-by window reaches that date and whose
 * site is inside the radius, sequenced into the shortest round trip that fits eight
 * hours, with whatever will not fit handed to the next route day and solved again.
 *
 * Three rules decide who is in it before the solver is consulted at all — see
 * `harmonizeRule.js`, which owns that arithmetic — and `harmonizePlan.js` owns the
 * sequencing and the packing. This hook owns neither. It holds the question's state,
 * feeds those two, and exposes the edits.
 *
 * Nothing here writes anything. `apply` hands a payload to its caller.
 */

/* The route leaves from and returns to one place, so the drive home is always
   charged to the day. There is no open-route variant to choose between. */
const RETURN_TO_START = true;

const DAY_START_MINUTES = 9 * 60;

/** How far ahead the plan window may reach when the planner widens it. */
export const RANGE_MAX_DAYS = 28;

/** How long Apply spends pretending to write. Nothing is persisted in this build. */
const APPLY_MS = 700;

/**
 * Past this, the start point is not a long commute — it is the wrong origin.
 *
 * A day is eight hours, so at the 38km/h the solver assumes, everything reachable and
 * returnable is inside ~150km. 300km is generous enough that no real franchise trips
 * it and tight enough to catch the actual failure: the demo synthesises site
 * coordinates around a Tampa anchor, so a real geocoded address on another continent
 * produced legs of thousands of kilometres and a meter reading
 * `685h 28m of 8h · Over by 677h 28m`.
 */
const FAR_START_KM = 300;

/**
 * This run's starting radius, in whole kilometres.
 *
 * **Rounded, because Settings states the radius in miles and the engine works in
 * kilometres.** `radiusFor` does that conversion, so a franchise set to a perfectly round
 * ten miles seeded this run at `16.09344` — a true number, rendered by the control as
 * `16.09344 km`, on a stepper that moves in fives. Five decimal places is not a radius
 * anyone chose and it is not a value anyone can steer.
 *
 * Rounded at the *seed* rather than only where it is displayed, which is the part that
 * matters: rounding for display alone would have the strip say `16 km` while the solver
 * used `16.09344`, and a screen whose stated number is not the number it computed with is
 * the one thing this feature cannot afford. A kilometre either way is inside the tolerance
 * the control already assumes — its own note observes that the difference between a 10km
 * and an 11km round is nothing a planner needs to express.
 *
 * This deliberately leaves the larger question alone: whether harmonize should present
 * miles, as Settings now does, rather than the kilometres the engine speaks. That is a
 * product decision and it belongs with whoever is moving Settings to miles.
 */
const seedRadiusKm = (rule) => Math.round(rule.radiusFor(rule.preferredWeekdays[0]));

export const dayKey = (day) => (day?.isValid?.() ? day.format('YYYY-MM-DD') : '');
export const dayLabelOf = (key) => (key ? dayjs(key).format('ddd D MMM') : '');

/**
 * The narration, as steps the map can be at.
 *
 * These are indices into `facts.lines`, and they exist so the map and the spoken line
 * are the same event rather than two things that happen to look synchronised. The ring
 * appears on `RADIUS` because that is the line that says "within 10 km"; the route
 * draws on `SEQUENCE` because that is the line that says "sequencing 6 stops". Reorder
 * the chain and this constant moves with it, in one place.
 *
 * `DONE` is a sentinel above every real step, for when the machine has stopped talking.
 */
export const MAP_STEP = {
  READ: 0,
  NEED_BY: 1,
  RADIUS: 2,
  ESTIMATE: 3,
  SEQUENCE: 4,
  FIT: 5,
  DONE: 99,
};

/**
 * A visit the planner took out by hand.
 *
 * Not one of `harmonizeRule`'s three causes, because the rule did not refuse it —
 * they did. It is here so the map can grey it out from the first frame: the other
 * three are conclusions the narration reaches, and this one was true before the
 * narration started.
 */
export const REMOVED_BY_HAND = 'manual';

/**
 * The crew sizes the workspace offers, and the one it opens on.
 *
 * **Two, by default, because that is how this franchise works** — filter replacement is
 * a two-person job on all but the smallest sites, and a screen that opened on one
 * installer would have every planner changing it before every run. One is still
 * offered, because a single technician covering a light week is real; three is the
 * ceiling because a fourth pair of hands stops paying for itself once the van is the
 * constraint rather than the labour.
 *
 * Written out rather than derived from a range, so the set the pills draw and the set
 * the run will accept cannot come apart.
 */
export const INSTALLERS_OPTIONS = [1, 2, 3];

/**
 * The need-by window, as a quantity again.
 *
 * **The four pills are gone, and with them the two snapping functions that existed to serve
 * them.** `NEED_BY_PILLS = [3, 5, 7, 14]` closed the set to the four windows a franchise was
 * held to work to; `snapNeedBy` rounded a wanted value *up* onto one of them so a remedy link
 * could not promise a reach it then fell short of, and `snapNeedByDown` rounded a ceiling
 * *down* so a limit could not be breached by the rounding meant to enforce it. Two functions
 * in opposite directions, one of which had to be picked correctly at every call site, all to
 * keep a segmented control lit.
 *
 * The supplied design draws both numeric fields as a stepper, which reopens the set — and
 * every one of those problems dissolves rather than moving. The window is any whole number of
 * days the settings policy allows, the ceiling is the ceiling, and **the remedy link now sets
 * the exact figure it names**: *Allow ± 8* sets 8, where before it printed 8, set 14, and lit
 * a segment the sentence had never mentioned.
 *
 * `NEED_BY_MIN` and `NEED_BY_MAX` are the settings screen's own bounds, read rather than
 * restated — that screen is setting the policy this run works inside, and a second opinion
 * about what a legal window is would be a second policy.
 */
export const clampNeedBy = (days, ceiling = NEED_BY_MAX) => {
  const wanted = Math.round(Number(days) || 0);
  /* The ceiling itself is clamped into the policy range before it is applied, so a caller
     handing over a 40-day window cannot raise the maximum by passing a limit above it. */
  const top = Math.max(NEED_BY_MIN, Math.min(NEED_BY_MAX, Math.round(Number(ceiling) || 0)));
  return Math.max(NEED_BY_MIN, Math.min(top, wanted));
};

export const INSTALLERS_DEFAULT = 2;

export const useHarmonizeRun = ({ open, visits, routeTerm, startPoint }) => {
  const { t } = useTranslation();
  const tt = useCallback((key, options) => t(`obx.runsheet.harmonize.${key}`, options), [t]);
  const term = routeTerm || 'Route';

  /**
   * "1 day" or "3 days", as a phrase to be dropped into a longer sentence.
   *
   * i18next pluralizes on `count`, and every sentence that mentions the need-by window
   * already spends its `count` on something else — the number of visits, in the
   * narration. So the day count is pluralized on its own and interpolated as text,
   * which is what stopped the map's bubbles from reading "outside ± 1 days".
   */
  const daysPhrase = useCallback((days) => tt('dayCount', { count: Number(days) || 0 }), [tt]);

  /**
   * The franchise's rule, read once per opening.
   *
   * Read on open rather than held in module scope so a planner who changes Settings and
   * comes back gets the new policy without a reload. It seeds and does not bind:
   * `needByDays` and `radiusKm` below are this run's own copies, and turning them
   * changes nothing that is saved.
   */
  const [rule, setRule] = useState(() => resolveHarmonizeRule(readHarmonizationSettings()));
  const [needByDays, setNeedByDays] = useState(() => clampNeedBy(rule.needByDays));
  const [radiusKm, setRadiusKm] = useState(() => seedRadiusKm(rule));

  /**
   * The radius as the planner reads and sets it: whole miles.
   *
   * **The engine's units do not move, and that is the whole design of this boundary.**
   * `radiusKm` above stays the state, `runRule.radiusKm` stays kilometres, and the map's
   * ring geometry stays metres — everything downstream of here was written against
   * kilometres and re-unitising a solver to change a label is the tail wagging the dog.
   * What changes is that the *control* speaks the same unit the Settings screen does, so a
   * franchise that set 15 mi sees 15 mi here rather than the 24 km it converts to.
   *
   * Rounded on the way in and out. The round trip is lossy by a few hundred metres, which is
   * inside the tolerance a radius control already assumes — the difference between a 15-mile
   * and a 15.1-mile round is not a distinction a planner is expressing.
   *
   * **Floored and not capped, deliberately.** This used `clampRadiusMiles`, which is the
   * settings screen's clamp and pins the value to its 1–125 mile policy range. That is the
   * right clamp for a *policy*, which has to be a number the franchise's saved rule can hold,
   * and the wrong one for this run: the radius here has no agreed ceiling yet, and a control
   * that silently refuses 200 while the number keeps reading 125 is worse than one that
   * accepts it. So the floor stays — a zero-mile radius is a run that can reach nothing, and
   * a negative one is not a distance — and the top is open.
   *
   * **The one place the missing ceiling still shows** is the *Extend to N mi* remedy under
   * the field: `smallestRadiusToInclude` returns `null` above `RADIUS_MAX`, so a visit 150
   * miles out gets no link even though the field would now take 150. The link's absence is
   * correct-by-accident there rather than by design, and settling it means deciding whether
   * the policy range is a policy or a limit — which is the settings screen's question, not
   * this one's.
   */
  const radiusMiles = Math.max(RADIUS_MIN_MILES, Math.round(kmToMiles(radiusKm)));
  const setRadiusMiles = useCallback(
    (miles) =>
      setRadiusKm(
        Math.round(milesToKm(Math.max(RADIUS_MIN_MILES, Math.round(Number(miles) || 0)))),
      ),
    [],
  );

  /**
   * How many installers are out, and therefore how much day there is.
   *
   * **Two installers do not make two routes — they make one route with twice the
   * hours in it.** They travel together in one van and work each stop side by side, so
   * the driving is paid for once and the on-site work halves; expressed as a budget,
   * that is the same round trip measured against `installers × shiftMinutes`. Modelling
   * it as two parallel routes would have been the other reading and it is a different
   * product: two vans, two sequences, two sets of arrival times, and a merge UI for
   * deciding who takes which stop. Nothing on this screen is built for that, and the
   * brief asks for one optimized route covering the work.
   *
   * This is the first thing in the workspace to consume `rule.shiftMinutesFor`, which
   * has been exposed and unread since the settings screen learned to store per-day
   * shift hours — so a Saturday set to four hours now plans as four rather than as
   * eight, for the same reason and by the same multiplication.
   */
  const [installers, setInstallers] = useState(INSTALLERS_DEFAULT);
  /**
   * Whether the planner has picked a crew size themselves.
   *
   * The count follows the install days until they touch it, and stops following the moment
   * they do. Without this flag the auto-seed below would fight them: pick 3, tick Thursday,
   * and the field would snap back to whatever Thursday is staffed with — a control that
   * undoes the last thing you did to it.
   */
  const [installersTouched, setInstallersTouched] = useState(false);

  /**
   * Whether the planner has asked for a plan yet.
   *
   * **The solve used to run during the first render, and the whole right-hand side was
   * an answer to a question nobody had finished asking.** The screen opened on a
   * proposal built from whatever Settings happened to say, which read as confident and
   * was in fact a guess: the planner had not chosen their days, their window or their
   * crew. So the run is a *request* now. Everything above this line — the rule, the
   * window, the triage counts, the coverage figures the left column draws — is computed
   * as before, because none of it needs the solver and all of it is what the planner is
   * deciding *with*. Only `planRun` waits.
   *
   * It stays true once set, and the knobs stay live afterwards: turning the need-by
   * window after the first press re-solves and the reveal acknowledges it with its
   * 380ms settle rather than replaying the whole narration. That is deliberate — the
   * remedy links under the plan (*Extend to 17 mi*) are only worth pressing if the
   * answer moves when they are, so the press is a gate on the first solve, not a
   * commit barrier around every later one.
   */
  /**
   * The question, as it stood when the planner last pressed Harmonize.
   *
   * **This replaces a bare `hasRun` flag, and the change is what makes the button honest.**
   * The knobs used to stay live after the first press: turning the need-by window re-solved
   * immediately and the plan updated under the planner. That is defensible on its own, but it
   * cannot coexist with a Harmonize button that is *disabled until the configuration changes* —
   * the two together would mean the answer had already moved before the control offering to
   * move it became pressable, which is a button asking to do something that has happened.
   *
   * So the press is the only solve. Everything the solver reads is captured here at press time,
   * and live edits to the setup column change nothing on the right until the next press. Plan
   * edits are different and stay live — re-dating a route, dragging a stop, dropping a spill are
   * changes *to the answer*, not to the question, and they go on reading `dayPins`, `sitePins`
   * and `manualOrders` directly.
   *
   * `null` means the planner has not asked yet, which is what the empty region reads.
   */
  const [solved, setSolved] = useState(null);
  const hasRun = Boolean(solved);

  /* Every path that sets the window goes through the clamp — the stepper, the coverage
     remedy in the setup column, and the triage panel's own group remedy. The *window's* own
     ceiling is applied on read rather than here, so narrowing the range and widening it again
     gives the planner their number back; see `needByCeiling`. */
  const setNeedBy = useCallback((days) => setNeedByDays(clampNeedBy(days)), []);

  /* Every path a planner can change the crew by. Marking the override here rather than in the
     component keeps the rule in the hook that owns the seeding. */
  const pickInstallers = useCallback((count) => {
    setInstallersTouched(true);
    setInstallers(count);
  }, []);

  useEffect(() => {
    if (!open) return;
    const next = resolveHarmonizeRule(readHarmonizationSettings());
    setRule(next);
    setNeedByDays(clampNeedBy(next.needByDays));
    setRadiusKm(seedRadiusKm(next));
    /* **No `setInstallers` here, and that omission is the fix for a real bug.** This effect
       used to reset the count to the default on every open, which clobbered the crew the
       seeding effect below had already derived from Settings — and because that effect's
       dependencies had not moved, it never ran again to put the right value back. A franchise
       with three people on Monday opened on `2`. Clearing the override is all this effect
       owes: the seeding effect owns the value, and it re-runs on `open`. */
    setInstallersTouched(false);
    /* A reopened workspace asks its question again. Without this, closing a solved run
       and coming back showed the previous answer under a fresh set of controls. */
    setSolved(null);
  }, [open]);

  /**
   * The install days this run may use, when the planner has narrowed or widened them.
   *
   * `null` means *whatever Settings says* — not "none", and not a copy of the
   * settings value taken at mount. The distinction matters because a copy would go
   * stale the moment Settings changed underneath an open workspace, and because
   * `[]` is a real, different answer the planner can give (no days, therefore no
   * run) that a null-as-empty encoding could not express.
   */
  const [weekdays, setWeekdays] = useState(null);

  /**
   * The window this run may reach for install days.
   *
   * **Declared here rather than beside the other plan state below, and the move is
   * load-bearing.** The need-by ceiling is derived from this window and `runRule` has to
   * read the ceilinged window, so the range has to exist above the rule. A `useMemo`
   * referencing a `const` from a line above its own declaration is a temporal-dead-zone
   * `ReferenceError` that lints clean, builds clean and blanks the screen — this file has
   * paid for that three times, and the rule that prevents it is exactly this: declare a
   * derived value below every input it reads.
   */
  const [range, setRange] = useState(null);

  /**
   * The widest need-by window this window may ask for.
   *
   * **A run cannot reach further than the window it is planning.** The two controls were
   * independent: a planner could set a three-day Harmonize window and a ± 14 day need-by,
   * which asks the rule to pull in work due a fortnight outside the dates the run is
   * allowed to touch. The visits it admitted were real and legal — their contracts do
   * stretch that far — but nothing about the window the planner drew said so, and the
   * coverage counts under the pills then reported a reach the window could not honour.
   *
   * So the window is the ceiling, measured the same way the planner reads it: a Mon–Sun
   * range is seven days wide and admits at most ± 7. Floored at `NEED_BY_MIN` and capped at
   * `NEED_BY_MAX` by `clampNeedBy`, because there has to be a window in force even on a
   * single-day range and it still has to be one the policy allows.
   *
   * The planner's own choice is *not* overwritten — `needByDays` keeps whatever they
   * picked and the ceiling is applied on the way out. Widening the range back out restores
   * their ± 14 rather than making them press it again.
   */
  const windowDays =
    range?.[0]?.isValid?.() && range?.[1]?.isValid?.() ? range[1].diff(range[0], 'day') + 1 : null;
  const needByCeiling = windowDays == null ? NEED_BY_MAX : clampNeedBy(windowDays);
  const effectiveNeedByDays = clampNeedBy(needByDays, needByCeiling);

  /**
   * The day's capacity, for the weekday a route lands on.
   *
   * **One shift, not one shift per installer.** This was `installers × shiftMinutesFor`, which
   * put a two-person round against a sixteen-hour budget — arithmetically the same answer for
   * what fits, and a description of a day nobody works. The crew's effect belongs on the *work*:
   * two installers halve the installation time at each stop, so the same round fits inside the
   * eight hours the shift actually is. See `shareBetweenCrew` in `harmonizePlan`.
   */
  const budgetFor = useCallback((weekday) => rule.shiftMinutesFor(weekday), [rule]);

  /* The rule as the solver sees it: the policy with this run's overrides applied. */
  const runRule = useMemo(
    () => ({
      ...rule,
      /* The ceilinged window, not the raw pill — see `needByCeiling`. The solver, the
         triage counts and the narration all have to speak the window actually in force, or
         the screen reports a reach it is not planning to. */
      needByDays: effectiveNeedByDays,
      radiusKm: Number(radiusKm) || 0,
      /* `preferredWeekdays` is what `routeDaysInWindow` reads, so overriding it here is
         the whole of the multi-day change as far as the solver is concerned — the run's
         days, its spill days and its eligibility all fall out of this one field. */
      preferredWeekdays: weekdays || rule.preferredWeekdays,
    }),
    [rule, effectiveNeedByDays, radiusKm, weekdays],
  );
  /* Per-route overrides, indexed by route position. Everything not pinned here is the
     optimizer's own answer, so an untouched workspace holds no state at all. */
  const [dayPins, setDayPins] = useState([]);
  const [targetPins, setTargetPins] = useState([]);
  const [routeNames, setRouteNames] = useState({});
  const [manualOrders, setManualOrders] = useState({});
  const [namesTouched, setNamesTouched] = useState({});
  const [movedOut, setMovedOut] = useState(() => new Set());
  /**
   * Sites the planner has dragged onto a particular day, as `siteId -> 'YYYY-MM-DD'`.
   *
   * **Keyed by day, not by route index.** `planRun` assigns `index` as it fills days, so
   * a pin naming route 2 would name a *different* route the moment the run's shape
   * changed — and a cross-route drag changes the run's shape by definition, which makes
   * an index-keyed pin wrong precisely when it is being used. The day is the stable
   * identity of a route here, so that is what a drag records.
   *
   * Site-keyed rather than visit-keyed because a stop *is* a site: `groupVisitsIntoStops`
   * collapses every visit at one address into a single arrival, and there is no row in
   * this UI that means one visit at a shared address. Moving a stop moves all of it.
   */
  const [sitePins, setSitePins] = useState({});
  /**
   * Which route the middle column has open and the map is drawing.
   *
   * One value for both, and that is the fix. The drawer had an `expandedRoute` that
   * could be toggled to `-1` — no card open — while the map fell back to `routes[0]`
   * anyway, so the two halves of the screen were describing different routes and
   * nothing on screen said which. In a three-column layout the map *is* the selected
   * route's view, so selection is exclusive and never empty.
   */
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [applying, setApplying] = useState(false);

  /**
   * A fresh set of visits, by content rather than by array identity.
   *
   * **The effect below keyed on `visits` itself, and that array is rebuilt whenever the
   * calendar behind this screen re-renders.** `harmonizableVisits` is memoised on
   * `visitsForHarmonize`, which does not survive a refetch — and this workspace *causes*
   * parent re-renders, because reporting a plan through `onPreviewChange` sets state up
   * there. So the sequence was: press Harmonize, routes solve, the preview is reported,
   * the parent re-renders, `visits` arrives with a new identity, and this effect resets the
   * run it had just produced. On screen the plan appeared and then vanished on its own.
   *
   * It was a live bug before this pass, too, and a worse one for being silent: every
   * override in the list below — pinned days, route names, hand-ordered stops — was being
   * discarded on any parent re-render, so a planner's edits could evaporate mid-session
   * with nothing to blame. Keying on the ids means the effect fires when the *work*
   * changes and not when the array wrapping it is rebuilt.
   */
  const visitsKey = useMemo(() => visits.map((visit) => visit.id).join('|'), [visits]);

  /* A fresh set of visits is a fresh question — every override goes back to the
     optimizer's answer rather than inheriting the last run's edits. */
  useEffect(() => {
    if (!visits.length) return;
    /* The window opens on the work and runs for as long as Settings says a single run
       may reach. A week or more always contains every weekday, and therefore every
       route day, which is what makes `planWindowDays` safe to take literally here. */
    const first = defaultTargetDay(visits);
    setRange([first, first.add(Math.max(1, rule.planWindowDays) - 1, 'day')]);
    setDayPins([]);
    setTargetPins([]);
    setRouteNames({});
    setNamesTouched({});
    setManualOrders({});
    setMovedOut(new Set());
    setSitePins({});
    setSelectedRoute(0);
    /* Back to Settings, not to the last run's day set — a fresh set of visits is a
       fresh question, and the policy is the answer until the planner says otherwise. */
    setWeekdays(null);
    setInstallersTouched(false);
    /* Same reasoning as the open effect: a new week has not been harmonized yet, and
       inheriting the last one's `hasRun` would present a solved plan for visits the
       planner has never seen. */
    setSolved(null);
    // eslint-disable-next-line
  }, [visitsKey]);

  const rangeStart = range?.[0] || null;
  const rangeEnd = range?.[1] || null;

  /* **A stable array, not a fresh literal.** `DateRangePicker` mirrors this prop into
     its own state from an effect keyed on the prop itself, so handing it a new
     `[start, end]` every render makes that effect fire every render and the field
     renders blank about half the time. */
  const rangeDates = useMemo(
    () => [rangeStart, rangeEnd],
    // eslint-disable-next-line
    [dayKey(rangeStart), dayKey(rangeEnd)],
  );

  /**
   * The days a harmonized run may land on: the route days inside the window.
   *
   * It used to be every day in the range, which is what a capacity solver wants and the
   * opposite of what harmonizing means. The franchise runs filter work on Mondays;
   * spreading the overflow onto Tuesday because Tuesday had room would quietly undo the
   * setting the whole feature reads.
   */
  const runDays = useMemo(
    () => routeDaysInWindow({ rule: runRule, from: rangeStart, to: rangeEnd }),
    [runRule, rangeStart, rangeEnd],
  );

  const activeVisits = useMemo(
    () => visits.filter((visit) => !movedOut.has(visit.siteId)),
    [visits, movedOut],
  );

  /**
   * Of the route days in the window, the one the work can actually reach.
   *
   * **This was `runDays[0]` — the earliest — and that is how the drawer came to open on
   * "0 of 5 visits qualify" with an empty plan underneath it.** Take a week of work
   * running Tue 18 to Mon 24 on a franchise that runs Mondays: the only route day in
   * that window is the 24th, the *last* day of it, so every visit sits three to six days
   * before it and at ± 3 almost nothing reaches it. The rule was working perfectly and
   * the answer was useless, which is the worst kind of correct.
   *
   * What the planner wants is the day that collapses the most work, so that is what is
   * chosen: score each candidate by how many visits qualify for it and keep the best,
   * earliest on a tie. The planner's own pin still wins outright.
   */
  const bestRouteDay = useMemo(() => {
    if (!runDays.length) return '';
    if (runDays.length === 1 || !activeVisits.length) return runDays[0];

    const score = (key) =>
      triageVisits({
        visits: activeVisits,
        dayKey: key,
        rule: runRule,
        startPoint: startPoint.point,
        radiusKm: runRule.radiusKm,
      }).eligible.length;

    return runDays.reduce((best, day) => (score(day) > score(best) ? day : best), runDays[0]);
  }, [runDays, activeVisits, runRule, startPoint.point]);

  const targetDay = dayPins[0] || bestRouteDay || dayKey(defaultTargetDay(visits));
  const targetDayLabel = dayLabelOf(targetDay);

  /**
   * The crew the franchise has actually staffed, for the days this run may use.
   *
   * **The target day first, then the other install days.** A run has one crew size and may
   * have several route days, so something has to break the tie; the day the run is aiming at
   * is the one whose staffing the planner is about to rely on. Falling through to the other
   * ticked weekdays covers the common case where only some days are staffed — a Monday-only
   * franchise that ticks Thursday to widen the window should not have the count drop to a
   * default because Thursday has nobody named against it yet.
   *
   * Zero is not a candidate. An unstaffed day means the franchise has not got to it, not that
   * the van goes out empty, so it falls through — and if no ticked day is staffed at all the
   * default stands. `officersFor` returns `[]` rather than a default crew precisely so this
   * decision is made here, where the ordering is known.
   */
  const configuredInstallers = useMemo(() => {
    const target = targetDay ? isoWeekdayOf(targetDay) : null;
    const ordered = [
      ...(target ? [target] : []),
      ...(runRule.preferredWeekdays || []).filter((weekday) => weekday !== target),
    ];

    for (const weekday of ordered) {
      const staffed = rule.officersFor?.(weekday)?.length || 0;
      if (staffed > 0) return staffed;
    }
    return INSTALLERS_DEFAULT;
  }, [rule, runRule.preferredWeekdays, targetDay]);

  /**
   * The options the pills offer.
   *
   * **Widened to hold the configured crew rather than clamping it.** A franchise with five
   * people on Monday would otherwise open on a control showing `3` — the field silently
   * disagreeing with Settings, and the one number on this panel a planner could check against
   * something else. The offered set and the accepted set must not come apart, so the set grows
   * instead: 1, 2, 3 always, plus whatever is actually staffed.
   */
  const installerOptions = useMemo(
    () => [...new Set([...INSTALLERS_OPTIONS, configuredInstallers])].sort((a, b) => a - b),
    [configuredInstallers],
  );

  /**
   * Follows the install days until the planner overrules it — see `installersTouched`.
   *
   * **`open` is in the dependencies, and it is not decoration.** This hook keeps running while
   * the workspace is shut, so the crew is usually already seeded by the time it is opened; with
   * only `configuredInstallers` and the override flag to watch, reopening after a manual pick
   * would clear the flag and then find nothing to react to, leaving the planner's old override
   * on screen with no way back to the configured value. Re-running on `open` makes reopening
   * mean what it says.
   */
  useEffect(() => {
    if (!open || installersTouched) return;
    setInstallers(configuredInstallers);
  }, [open, configuredInstallers, installersTouched]);

  /**
   * Who the rule lets in, measured against the day being harmonized onto.
   *
   * This runs *before* the solver and is the reason the solver's answer is small: a
   * visit whose need-by window cannot reach this date, or whose site is outside the
   * radius, is not a routing problem and never becomes one. Both halves are reported
   * with the amount they miss by, so the panel can name the value that would include
   * them instead of telling the planner to widen something.
   */
  const triage = useMemo(
    () =>
      triageVisits({
        visits: activeVisits,
        /* **Every install day, not just the one the run is centred on.** A visit is in
           this run if any of its days can legally take it; measured against `targetDay`
           alone, ticking a second weekday admitted nothing and the run would refuse the
           very work that weekday was ticked to reach. `dayKey` stays as the fallback for
           the case where the window contains no route day at all. */
        dayKeys: runDays,
        dayKey: targetDay,
        rule: runRule,
        startPoint: startPoint.point,
        radiusKm: runRule.radiusKm,
      }),
    [activeVisits, runDays, targetDay, runRule, startPoint.point],
  );

  const routesForDay = useCallback((key) => (key ? runsheetsOnDay(dayjs(key)) : []), []);

  /**
   * Every input the planner can change that would change the answer.
   *
   * Compared against the snapshot to decide whether Harmonize has anything left to do. Plan
   * edits are deliberately absent — they already apply live, so including them would enable a
   * button whose press would do nothing new. The start point is reduced to coordinates because
   * the object identity moves when its address finishes reverse-geocoding, which is not a change
   * to the question.
   */
  const configSignature = useMemo(
    () =>
      JSON.stringify({
        /* The window in force, not the pill. A range narrow enough to lower the ceiling
           changes what the run would admit, so it has to move the signature — otherwise the
           plan on screen answers a wider question than the one the controls now state and
           nothing says so. */
        needBy: effectiveNeedByDays,
        radius: Number(radiusKm) || 0,
        installers: Number(installers) || 0,
        weekdays: weekdays || rule.preferredWeekdays,
        from: dayKey(range?.[0]),
        to: dayKey(range?.[1]),
        start: startPoint.point
          ? [Number(startPoint.point.lat).toFixed(5), Number(startPoint.point.lng).toFixed(5)]
          : null,
      }),
    [
      effectiveNeedByDays,
      radiusKm,
      installers,
      weekdays,
      rule.preferredWeekdays,
      range,
      startPoint.point,
    ],
  );

  /* Whether the plan on screen still answers the question on screen. */
  const isStale = hasRun && solved.signature !== configSignature;
  const canHarmonize = !hasRun || isStale;

  /**
   * The press.
   *
   * Captures the question and asks it. Declared here rather than beside `solved` because it
   * closes over the derived values the solver consumes, and those are computed above this line —
   * a `useCallback` referencing them from higher up would be reading consts before their
   * declaration, which this file has been bitten by twice.
   */
  const harmonize = useCallback(() => {
    setSolved((previous) => ({
      /**
       * Which press this is.
       *
       * **The reveal needs it and nothing else does.** `useHarmonizeReveal` treats a change
       * of sitting as an arrival worth narrating and anything else as an edit worth a
       * 380ms settle, and it decides which by the identity of the answer. Cancelling and
       * pressing again with the configuration untouched produces a byte-identical
       * signature, so without a counter the second press would replay nothing: the plan
       * would simply appear, finished, which is the "opens on an answer" behaviour the
       * twentieth pass removed. A press is always an arrival, so a press always moves this.
       */
      attempt: (previous?.attempt || 0) + 1,
      eligible: triage.eligible,
      /* The whole triage, not just what qualified — the exception panel under the plan has to
         describe *this* plan's refusals, and those go stale with it. See `planTriage`. */
      triage,
      start: startPoint.point,
      days: runDays,
      rule: runRule,
      budgetFor,
      /* Snapshotted with the rest of the question: the crew decides how long each stop takes, so
         changing it has to mark the plan stale rather than silently rewriting its timings. */
      crewSize: Math.max(1, Number(installers) || 1),
      signature: configSignature,
    }));
  }, [triage, startPoint.point, runDays, runRule, budgetFor, installers, configSignature]);

  /**
   * Abandon the run and give the planner their question back.
   *
   * **This is what the working state's button does now, and it is not a skip.** That
   * control used to fast-forward the narration to its end — the plan was solved before the
   * first line was spoken, so the wait was genuinely skippable. Cancel is the other
   * intention, and it is the one a planner actually reaches for mid-run: they have realised
   * the radius is wrong, or the wrong days are ticked, and they want to change it rather
   * than sit through an answer they already know they are going to discard.
   *
   * Dropping the snapshot is the whole of it. `hasRun` goes false, the region returns to the
   * map-and-controls state it was in before the press, and every plan edit that was keyed
   * off the old answer is dropped with it. The setup column is untouched, so what they came
   * back to change is exactly where they left it.
   */
  const cancel = useCallback(() => setSolved(null), []);

  /**
   * The triage as the plan on screen was built from.
   *
   * **Two triages, and the split is not an accident.** The live one describes the question the
   * planner is asking *now* — it feeds the coverage hints under the need-by pills, which have to
   * react as the pills are pressed, or the control would report on a setting it no longer holds.
   * This one describes the question the plan on screen actually answers, and it feeds everything
   * that sits *with* that plan: the exception panel, the reasoning steps, the not-included figure
   * in the footer.
   *
   * Without the split, changing a pill after a run left the panel under the routes reporting
   * `2 visits not included` at the new setting while the routes above it were still solved at the
   * old one — a footnote describing a plan that was not on screen. Falls back to the live triage
   * before the first press, when there is no plan for a footnote to be wrong about.
   */
  const planTriage = solved?.triage || triage;

  /**
   * The whole run, solved from the snapshot the press took.
   *
   * Pure — days and merge targets in, routes out — which is what stops a re-solve from fighting
   * the planner's own edits. **Every rule-shaped input is read off `solved` rather than from
   * live state**, so turning a knob after the press leaves this alone and only marks the answer
   * stale; see `solved`'s docstring. The plan-shaped inputs below it (`dayPins`, `targetPins`,
   * `sitePins`) are still live, because those are edits to the answer.
   */
  const run = useMemo(() => {
    /* The snapshot's own emptiness joins the two conditions that already meant "no plan", so
       nothing downstream needs a null check it did not already have — every consumer of
       `routes` has always had to survive an empty array. */
    if (!solved || !solved.start || !solved.eligible.length || !solved.days.length) {
      return { routes: [], unplaced: [] };
    }
    return planRun({
      /* Only what the rule allows. The solver is a capacity engine and would happily
         put a visit on a day its contract forbids. */
      visits: solved.eligible,
      startPoint: solved.start,
      days: solved.days,
      dayOverride: (index) => dayPins[index] || null,
      routesForDay,
      targetOverride: (index) => targetPins[index],
      /* Spill has to obey the same rule as the first day. Work that will not fit on
         Monday may only move to Thursday if Thursday is still inside its need-by
         window, which the packer has no way of knowing. */
      servesOn: (visit, day) => canServeOn({ visit, dayKey: day, rule: solved.rule }),
      /* The planner's drags. Offered to their own day and no other, and unspillable
         once there — see `planRun`. */
      sitePins,
      returnToStart: RETURN_TO_START,
      defaultDayStartMinutes: DAY_START_MINUTES,
      /* Per route day, because both terms of it are: the shift hours are stored per
         weekday and the crew is the planner's. `planRun` asks per route rather than
         being handed one number, so a run spanning a full Monday and a half Saturday
         measures each against its own day. */
      budgetFor: (day) => solved.budgetFor(isoWeekdayOf(dayjs(day))),
      crewSize: solved.crewSize,
    });
  }, [solved, dayPins, targetPins, routesForDay, sitePins]);

  /* A manual re-order survives every other change to its own route; only Re-optimize
     hands that route back to the solver. */
  const routes = useMemo(
    () =>
      run.routes.map((route) => {
        const order = manualOrders[route.index];
        if (!order) return route;
        return {
          ...route,
          manual: true,
          plan: applyManualOrder({
            plan: route.plan,
            orderedSiteIds: order,
            startPoint: startPoint.point,
            returnToStart: RETURN_TO_START,
            dayStartMinutes: route.target?.startMinutes || DAY_START_MINUTES,
          }),
        };
      }),
    [run.routes, manualOrders, startPoint.point],
  );

  const routeCount = routes.length;
  const placedVisitCount = routes.reduce((total, route) => total + route.plan.fittedVisitCount, 0);

  /**
   * Two quite different ways to be left out, counted apart.
   *
   * `unplacedCount` is work the rule allowed and the eight hours refused — a capacity
   * answer, fixable with another route day. `excludedCount` is work the rule never
   * offered the solver, because its need-by window does not reach this date or its site
   * is outside the radius. Merging them into one "left over" figure would put a routing
   * remedy in front of a compliance problem, which is the one substitution this screen
   * exists to prevent.
   */
  const unplacedCount = run.unplaced.length;
  const excludedCount = planTriage.excluded.length;
  const notInPlanCount = unplacedCount + excludedCount;
  /* Work the planner took out of the run — a stop removed, or a whole spill route
     declined. It is not "left over"; it was deliberately left alone, and those are
     different facts, so the summary states them separately. */
  const keptCount = visits.length - activeVisits.length;

  /* Names, defaulted per route and only until the planner types. */
  useEffect(() => {
    if (!routes.length) return;
    setRouteNames((previous) => {
      const next = { ...previous };
      let changed = false;
      routes.forEach((route) => {
        if (namesTouched[route.index]) return;
        /* `routeForDay` ('Route for Mon 18 Aug'), not `newRouteDefault` ('Mon 18 Aug
           Route'). The card's title *is* this value now — an editable field rather than a
           label with a form field elsewhere — so the default has to read as a name a
           planner would leave alone, and a date with a noun bolted on the end reads as a
           slug. Seeded rather than defaulted at the field: Apply writes this state, and a
           title showing text the state does not hold is a name that vanishes on save. */
        const wanted = tt('routeForDay', { day: dayLabelOf(route.day) });
        if (next[route.index] !== wanted) {
          next[route.index] = wanted;
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [routes, namesTouched, tt]);

  /* The selected card must exist. Dropping a route — by re-dating, or because a
     re-solve now fits everything in one day — would otherwise leave the map drawing a
     route the column no longer lists. */
  useEffect(() => {
    if (routeCount && selectedRoute >= routeCount) setSelectedRoute(0);
  }, [routeCount, selectedRoute]);

  const activeRoute = routes[selectedRoute] || routes[0] || null;

  const routeOptionsFor = useCallback(
    (dayRoutes) => [
      { value: '', label: tt('newRunsheet', { route: term.toLowerCase() }) },
      ...dayRoutes.map((route) => ({
        value: route.id,
        label: [
          route.worker || tt('unassigned'),
          route.name,
          tt('loadedShort', { time: formatMinutesAsDuration(route.loadMinutes) }),
          route.status === 'live' ? tt('liveTag') : null,
        ]
          .filter(Boolean)
          .join(' · '),
        description: route.name,
      })),
    ],
    [term, tt],
  );

  /* --- the optimizer's working-out, worded from the run it produced --- */

  const siteCount = useMemo(
    () => new Set(activeVisits.map((visit) => visit.siteId)).size,
    [activeVisits],
  );

  /**
   * The work being sequenced, measured over the visits that qualify.
   *
   * **Not over every visit on screen, which is what it used to be.** The narration is a
   * funnel — fourteen read, ten inside the need-by window, seven inside the radius —
   * and then the line under it said "18h on site, from 54 filters": the time for all
   * fourteen, quoted after three lines of narrowing, in a sequence whose next line is
   * "sequenced 6 stops". Each number was individually true and the passage as a whole
   * was not. It describes the set it is about to fit.
   */
  const totalFilters = useMemo(
    () => planTriage.eligible.reduce((total, visit) => total + (Number(visit.filterCount) || 0), 0),
    [planTriage.eligible],
  );
  const totalServiceMinutes = useMemo(
    () =>
      planTriage.eligible.reduce((total, visit) => total + (Number(visit.serviceMinutes) || 0), 0),
    [planTriage.eligible],
  );

  const stopTotal = useMemo(
    () => routes.reduce((total, route) => total + route.plan.stops.length, 0),
    [routes],
  );

  /**
   * What the run adds up to, across every route in it.
   *
   * **Composed the same way a card composes its own figure**, and that is the point:
   * `existingLoadMinutes + serviceMinutes + travelMinutes`, per route, summed. Reading
   * `plan.dayTotalMinutes` instead would be one line shorter and wrong in a way nobody
   * would notice for a while — that field is haversine throughout, while the open card
   * has a measured Directions figure, so the screen's headline total would disagree
   * with the card the planner is looking at by however much the roads differ from
   * straight lines. This screen has already paid for that exact mismatch once, forty
   * pixels apart on one card.
   *
   * Travel is taken from the plan rather than from Directions because only the selected
   * route is ever measured; a total that mixed one measured route with three estimated
   * ones would move every time the planner clicked a different card, which is the one
   * thing a headline figure must not do.
   */
  const totalCoveredMinutes = useMemo(
    () =>
      routes.reduce(
        (total, route) =>
          total +
          (route.plan.existingLoadMinutes || 0) +
          (route.plan.serviceMinutes || 0) +
          (route.plan.travelMinutes || 0),
        0,
      ),
    [routes],
  );

  /**
   * The funnel, as three numbers the knobs can be labelled with.
   *
   * `radiusOutsideCount` is measured against `inNeedByWindow` and **not** against
   * `counts.total`, because `assessVisit` decides need-by first and deliberately so —
   * a visit whose contract cannot reach any install day is not a distance problem, and
   * counting it against the radius would send the planner to widen a circle that would
   * change nothing. So each knob is answerable for what it actually refused.
   */
  const coverage = useMemo(
    () => ({
      coversCount: triage.counts.inRadius,
      radiusOutsideCount: Math.max(0, triage.counts.inNeedByWindow - triage.counts.inRadius),
      needByOutsideCount: Math.max(0, triage.counts.total - triage.counts.inNeedByWindow),
      /* The values that *would* include what each knob refused, so a label can name a
         number instead of telling the planner to widen something. `null` where no legal
         setting would — a contract window is not the planner's to overrule. */
      radiusReachMiles: (() => {
        const km = smallestRadiusToInclude(triage.excluded);
        return km == null ? null : Math.round(kmToMiles(km));
      })(),
      needByReachDays: smallestWindowToInclude(triage.excluded),
    }),
    [triage.counts, triage.excluded],
  );

  /**
   * The working-out, in two voices.
   *
   * `lines` are what the map's status strip speaks while it composes — present tense,
   * one at a time. `steps` are the same facts kept as a record behind "how this was
   * worked out" once the plan is on screen. Two sets rather than one because a status
   * line and a log read differently: "Sequencing 12 stops…" is what is happening,
   * "Sequenced 12 stops" is what was done, and a list of gerunds after the fact reads
   * like a process that never finished.
   *
   * Every one of them names a number the plan actually used. That is the whole
   * discipline: a line reading "analysing…" would be theatre, and theatre is what makes
   * a planner distrust the numbers underneath it.
   */
  const facts = useMemo(() => {
    if (!visits.length) return { lines: [], steps: [] };

    const budget = formatMinutesAsDuration(MAN_DAY_MINUTES);
    const service = formatMinutesAsDuration(totalServiceMinutes);
    const sequenced = stopTotal || planTriage.eligible.length;

    /* The chain, in the order the rule applies it: what there is, what may legally move
       to this day, what is close enough to reach, how long it all takes, and whether it
       fits. Each line is the *input* to the next, which is why the narration is worth
       watching at all — the counts come down as it goes, and by the last line the
       planner has seen where every visit went. */
    const chain = [
      ['Read', { count: activeVisits.length, sites: siteCount }],
      [
        'NeedBy',
        {
          count: planTriage.counts.inNeedByWindow,
          day: targetDayLabel,
          window: daysPhrase(runRule.needByDays),
        },
      ],
      [
        'Radius',
        { count: planTriage.counts.inRadius, mi: Math.round(kmToMiles(runRule.radiusKm)) },
      ],
      ['Estimate', { time: service, filters: totalFilters, minutes: FILTER_MINUTES }],
      ['Sequence', { count: sequenced }],
      routeCount > 1
        ? ['Split', { count: routeCount, budget }]
        : ['Fit', { budget, day: targetDayLabel }],
    ];

    return {
      lines: chain.map(([key, options]) => tt(`line${key}`, options)),
      steps: chain.map(([key, options]) => tt(`step${key}`, options)),
    };
    // eslint-disable-next-line
  }, [
    visits.length,
    activeVisits.length,
    siteCount,
    totalFilters,
    totalServiceMinutes,
    stopTotal,
    routeCount,
    targetDayLabel,
    planTriage.counts.inNeedByWindow,
    planTriage.counts.inRadius,
    planTriage.eligible.length,
    runRule.needByDays,
    runRule.radiusKm,
  ]);

  const startPointDistanceKm = useMemo(() => {
    if (!startPoint.point || !activeVisits.length) return 0;
    return Math.min(...activeVisits.map((visit) => distanceKm(startPoint.point, visit)));
  }, [startPoint.point, activeVisits]);

  /* **`radiusSpanMiles` is gone with the slider it existed for.** It ended a track just past
     the furthest visit so every part of the travel changed the answer — a sound fix for a
     control that needs two ends, and a *derived* ceiling standing in for a real one: it moved
     as the week's work moved, so one thumb position meant different miles on different days.
     The stepper has one end and needs no range. */

  const startPointIsFar = startPointDistanceKm > FAR_START_KM;
  const hasPlan = routeCount > 0 && !startPointIsFar;

  /**
   * Everything the plan does not include, grouped by *why*, each with the one action
   * that would take it.
   *
   * The remedies name their value. `smallestWindowToInclude` and
   * `smallestRadiusToInclude` compute the smallest setting that would reach the whole
   * group, so the button says *Allow ± 5 days* rather than *widen the window*. Where a
   * contract is what refuses the visit there is no such value, and the group says so
   * instead of offering a control that cannot help.
   */
  /**
   * The install day worth adding, when the eight hours are what refused the work.
   *
   * **This remedy could not exist until the day set did.** The capacity group used to
   * carry a note saying, in effect, *there is nothing this panel can do* — what the
   * work needed was another route day, and a route day was a Settings decision taken
   * somewhere else. Now that the planner picks install days on this screen, "another
   * route day" is a tick, so the group can offer the same shape of remedy the other
   * two already do: a named value, applied in one press.
   *
   * Chosen by how much of the refused work it would actually take, not by which day
   * comes next in the week. A Thursday that can serve one of the four spilled visits
   * is a worse offer than a Friday that can serve all four, and a remedy that names
   * the wrong day teaches the planner to distrust the next one. Ties break to the
   * earlier weekday, matching how the run fills its days.
   *
   * `null` when no unselected weekday falls inside the plan window, or when none of
   * them could legally take any of this work — an offer that would change nothing is
   * not an offer, and this screen's rule is that a control which cannot help is not
   * drawn.
   */
  const capacityDay = useMemo(() => {
    if (!run.unplaced.length || !rangeStart || !rangeEnd) return null;

    const selected = new Set(runRule.preferredWeekdays);
    const best = { weekday: null, day: null, serves: 0 };

    /* Walked as dates rather than as weekday numbers, because the answer has to be a
       real date inside the window: a weekday the window does not contain is not an
       install day this run could use, however plausible it looks in a chip row. */
    for (let cursor = rangeStart; !cursor.isAfter(rangeEnd); cursor = cursor.add(1, 'day')) {
      const weekday = isoWeekdayOf(cursor);
      if (selected.has(weekday) || weekday === best.weekday) continue;

      const key = dayKey(cursor);
      const serves = run.unplaced.filter((visit) =>
        canServeOn({ visit, dayKey: key, rule: runRule }),
      ).length;

      if (serves > best.serves) {
        best.weekday = weekday;
        best.day = cursor;
        best.serves = serves;
      }
    }

    return best.weekday ? best : null;
  }, [run.unplaced, rangeStart, rangeEnd, runRule]);

  const triageGroups = useMemo(() => {
    const excludedFor = (reason) => planTriage.excluded.filter((visit) => visit.reason === reason);
    const needBy = excludedFor(EXCLUDED.NEED_BY);
    const radius = excludedFor(EXCLUDED.RADIUS);
    const groups = [];

    if (needBy.length) {
      const widerWindow = smallestWindowToInclude(needBy);
      const contractBound = needBy.filter(hasContractWindow).length;

      groups.push({
        reason: EXCLUDED.NEED_BY,
        title: tt('groupNeedBy', { count: needBy.length, day: targetDayLabel }),
        remedy:
          widerWindow != null
            ? {
                label: tt('remedyNeedBy', { window: daysPhrase(widerWindow) }),
                /* `setNeedBy`, not the `setNeedByPill` this used to call: the pills are gone
                   and with them the snap that rounded a remedy up to the next offered window.
                   The link now sets the exact figure it names. */
                onApply: () => setNeedBy(widerWindow),
              }
            : null,
        /* A tighter contract is not the planner's to overrule, so the note says which of
           these are beyond the knob rather than leaving them looking like a setting
           that did not work. */
        note: contractBound ? tt('noteContractWindow', { count: contractBound }) : null,
        visits: needBy.map((visit) => ({
          ...visit,
          detail: tt('excludedNeedBy', {
            date: visit.needBy ? visit.needBy.format('ddd D MMM') : '',
            count: Math.abs(visit.slackDays),
          }),
        })),
      });
    }

    if (radius.length) {
      const widerRadius = smallestRadiusToInclude(radius);

      groups.push({
        reason: EXCLUDED.RADIUS,
        title: tt('groupRadius', {
          count: radius.length,
          mi: Math.round(kmToMiles(runRule.radiusKm)),
        }),
        remedy:
          widerRadius != null
            ? {
                /* `widerRadius` is `smallestRadiusToInclude`'s own answer, in the
                   kilometres the rule engine speaks — converted for the label, applied
                   in the unit `setRadiusKm` still expects. */
                label: tt('remedyRadius', { mi: Math.round(kmToMiles(widerRadius)) }),
                onApply: () => setRadiusKm(widerRadius),
              }
            : null,
        visits: radius.map((visit) => ({
          ...visit,
          detail: tt('excludedRadius', { mi: kmToMiles(visit.distanceKm || 0).toFixed(1) }),
        })),
      });
    }

    /* Capacity is the one cause that cannot be reported without a route: "no room left
       in the day" is a claim about a day that has been packed. */
    if (hasPlan && run.unplaced.length) {
      groups.push({
        reason: EXCLUDED.CAPACITY,
        title: tt('groupCapacity', { count: run.unplaced.length }),
        /**
         * **There is a remedy here now, where the comment used to explain why there
         * could not be.** What this group needs is another route day; that used to mean
         * a Settings change or a wider plan window, neither of which this panel could
         * reach, so it stated the problem and stopped. The install-day set moved that
         * decision onto this screen, so the remedy is now the same shape as the other
         * two groups': a named day, added in one press.
         *
         * Still absent when `capacityDay` is null — no unselected weekday inside the
         * window, or none that could legally take any of this work. The note carries
         * the bad news in that case, as it always did.
         */
        remedy: capacityDay
          ? {
              label: tt('remedyAddDay', { day: capacityDay.day.format('ddd') }),
              onApply: () =>
                setWeekdays([...new Set([...runRule.preferredWeekdays, capacityDay.weekday])]),
            }
          : null,
        note: capacityDay ? null : tt('noteCapacity', { days: runRule.preferredWeekdays.length }),
        visits: run.unplaced.map((visit) => ({
          ...visit,
          /**
           * **`reason` is spread here because nothing upstream sets it.** These visits
           * came from `run.unplaced`, which came from `triage.eligible` — so every one
           * of them carries `eligible: true, reason: null`, and any styling or logic
           * keyed on `visit.reason` silently skipped the entire capacity group. The
           * panel dims excluded rows by reason, so without this the one group whose
           * work is genuinely left out was the one group that did not look it.
           */
          reason: EXCLUDED.CAPACITY,
          detail: formatMinutesAsDuration(visit.serviceMinutes),
        })),
      });
    }

    return groups;
    // eslint-disable-next-line
  }, [hasPlan, planTriage.excluded, run.unplaced, targetDayLabel, runRule.radiusKm, capacityDay]);

  /**
   * The grey pins, and the sentence each one carries.
   *
   * Built here rather than in the two map renderers: the copy for a cause belongs with
   * the code that knows the cause, and the Google map and the keyless one must not word
   * the same fact two ways. `canInclude` is the one bubble that gets a button.
   */
  const mapExclusions = useMemo(() => {
    const takenOut = visits
      .filter((visit) => movedOut.has(visit.siteId))
      .map((visit) => ({
        ...visit,
        /* **A reason, where there used to be none.** The map greys pins out in step with
           the narration by filtering on `reason`, and a visit with none matched no step
           — so a stop the planner had removed by hand stayed drawn as a live candidate
           until the sequencing line, four seconds after they removed it. */
        reason: REMOVED_BY_HAND,
        excludeNote: tt('mapTakenOut'),
        canInclude: true,
      }));

    const noRoom = run.unplaced.map((visit) => ({
      ...visit,
      excludeNote: tt('mapNoRoom', { day: targetDayLabel }),
    }));

    const ruledOut = triage.excluded.map((visit) => ({
      ...visit,
      excludeNote:
        visit.reason === EXCLUDED.RADIUS
          ? tt('mapOutsideRadius', {
              away: kmToMiles(visit.distanceKm || 0).toFixed(1),
              mi: Math.round(kmToMiles(runRule.radiusKm)),
            })
          : tt('mapOutsideNeedBy', {
              date: visit.needBy ? visit.needBy.format('ddd D MMM') : '',
              window: daysPhrase(visit.windowDays),
            }),
    }));

    return [...takenOut, ...noRoom, ...ruledOut];
    // eslint-disable-next-line
  }, [visits, movedOut, run.unplaced, triage.excluded, targetDayLabel, runRule.radiusKm]);

  /**
   * One cause, one remedy, read by both places that need it.
   *
   * The setup column and the action bar were each deciding for themselves what to
   * advise, and on the far-origin screen they disagreed. So the diagnosis is derived
   * once, in the order the planner would have to fix things, and both surfaces render
   * from it.
   */
  /**
   * **Only the last branch waits for the run, and the split is the point.**
   *
   * The first three causes are all true before a solve — there is no origin, the origin is
   * on another continent, the rule admits nothing — and they are exactly what the
   * Harmonize button needs in order to refuse in words rather than just arriving grey. So
   * the chain is evaluated from the first frame and the *button* reads it.
   *
   * `!routeCount` is different: with no solve there are no routes by construction, so
   * reading it before the press made the screen announce "nothing fits inside an 8 hr day"
   * about arithmetic that had never been performed — the same wrong-remedy substitution
   * the `blockNothingQualifies` branch above it was added to prevent, reintroduced from
   * the other end. Gated on `hasRun`, it means what it says.
   */
  const diagnosis = !startPoint.point
    ? { text: tt('blockNoStart'), field: 'start' }
    : startPointIsFar
      ? {
          text: tt('blockStartFar', { distance: Math.round(kmToMiles(startPointDistanceKm)) }),
          field: 'start',
        }
      : /* Nothing qualified, which is a *rule* failure and not a routing one. Before
           this it fell through to "nothing fits in one day", which advised the planner
           about eight hours when the eight hours had never been consulted. */
        !triage.eligible.length
        ? { text: tt('blockNothingQualifies', { day: targetDayLabel }), field: 'rule' }
        : hasRun && !routeCount
          ? {
              text: tt('blockNothingFits', {
                /* The crew's day, not the constant. With two installers the refusal has
                   to name the 16 hr nothing fitted inside, or it is quoting a budget
                   this run never used. */
                budget: formatMinutesAsDuration(budgetFor(isoWeekdayOf(targetDay))),
              }),
            }
          : null;

  /* --- edits --- */

  const setDayPin = useCallback((index, value) => {
    const next = dayKey(dayjs(value));
    if (!next) return;
    setDayPins((previous) => {
      const copy = [...previous];
      copy[index] = next;
      return copy;
    });
    /* A re-dated route is a different day with different work on it, so its hand-made
       order no longer describes anything. */
    setManualOrders((previous) => {
      const copy = { ...previous };
      delete copy[index];
      return copy;
    });
  }, []);

  const setTargetPin = useCallback((index, value) => {
    setTargetPins((previous) => {
      const copy = [...previous];
      copy[index] = value || '';
      return copy;
    });
    setManualOrders((previous) => {
      const copy = { ...previous };
      delete copy[index];
      return copy;
    });
  }, []);

  const setRouteName = useCallback((index, value) => {
    setNamesTouched((previous) => ({ ...previous, [index]: true }));
    setRouteNames((previous) => ({ ...previous, [index]: value }));
  }, []);

  const reorder = useCallback((index, order) => {
    setManualOrders((previous) => ({ ...previous, [index]: order }));
  }, []);

  const reoptimize = useCallback((index) => {
    setManualOrders((previous) => {
      const copy = { ...previous };
      delete copy[index];
      return copy;
    });
  }, []);

  const setPlanWindow = useCallback((from, to) => {
    const start = dayjs(from);
    const end = dayjs(to);
    if (!start.isValid() || !end.isValid()) return;
    setRange([start.startOf('day'), end.startOf('day')]);
    setDayPins([]);
  }, []);

  /* Taking a stop out of the run entirely — it stays on the day it is already on. The
     alternative, pushing it to the next route, is what the run does by itself. */
  /**
   * Whether a site may be dragged onto a day — asked *during* the drag, not after it.
   *
   * A drop that lands and is then refused is a gesture the planner completed and the
   * screen undid; a drop target that never lights up is a refusal they can see coming.
   * So this is a predicate the drag UI can call per candidate route, and the refusal is
   * spent on hover rather than on release.
   *
   * **Every visit at the site has to be able to serve the day, not just one.** A stop is
   * a whole address, so moving it moves every visit at it; taking the majority verdict
   * would move a visit onto a day its own contract forbids while the row that reported
   * the move looked entirely reasonable.
   *
   * Capacity is deliberately *not* checked. The planner is allowed to overfill a day —
   * that decision was made explicitly, the pin makes the stop unspillable, and the meter
   * goes over and says so. What they are not allowed to do is break a need-by window,
   * which is the one constraint that is not theirs to overrule.
   */
  const canMoveSiteToDay = useCallback(
    (siteId, dayKey_) => {
      if (!siteId || !dayKey_) return false;
      const atSite = activeVisits.filter((visit) => visit.siteId === siteId);
      if (!atSite.length) return false;
      return atSite.every((visit) => canServeOn({ visit, dayKey: dayKey_, rule: runRule }));
    },
    [activeVisits, runRule],
  );

  /**
   * The drag itself: this site, onto this day.
   *
   * Returns whether it took, so the caller can leave the row where it was and say why
   * rather than animating a move that did not happen.
   *
   * **The hand order goes.** The planner chose solver re-sequencing for a cross-route
   * drop, so the destination's sequence is the solver's answer again — and a hand order
   * kept across a move would be a sequence of site ids that no longer matches the stops
   * on either route. Cleared for both ends rather than for all routes: `dropStop`,
   * `bringBack` and `dropSpillRoute` all reset the whole map, which throws away the hand
   * order on routes the edit never touched, and that is a blast radius worth not
   * copying. The indices are resolved *before* the pin is set, while they still describe
   * the run on screen.
   */
  const moveSiteToDay = useCallback(
    (siteId, dayKey_) => {
      if (!canMoveSiteToDay(siteId, dayKey_)) return false;

      const fromIndex = routes.findIndex((route) =>
        route.plan.stops.some((stop) => stop.siteId === siteId),
      );
      const toIndex = routes.findIndex((route) => route.day === dayKey_);

      setManualOrders((previous) => {
        const next = { ...previous };
        if (fromIndex >= 0) delete next[fromIndex];
        if (toIndex >= 0) delete next[toIndex];
        return next;
      });

      setSitePins((previous) => ({ ...previous, [siteId]: dayKey_ }));
      return true;
    },
    [canMoveSiteToDay, routes],
  );

  /**
   * Hands a dragged site back to the solver, without taking it out of the run.
   *
   * Distinct from `dropStop`, which removes the work altogether. This only forgets that
   * the planner ever moved it, which is the undo a drag needs: the day it lands on
   * becomes the solver's answer again rather than staying wherever it was dropped.
   */
  const unpinSite = useCallback((siteId) => {
    setSitePins((previous) => {
      if (!(siteId in previous)) return previous;
      const next = { ...previous };
      delete next[siteId];
      return next;
    });
  }, []);

  const dropStop = useCallback((_index, siteId) => {
    setMovedOut((previous) => new Set(previous).add(siteId));
    setManualOrders({});
  }, []);

  /**
   * Putting one back: the other half of `dropStop`.
   *
   * It returns the site to the run and lets the rule and the solver decide again. It
   * deliberately does **not** force the visit into the day: a stop the planner took out
   * comes straight back, and one the *rule* refused will be refused again, which is the
   * honest answer. Overriding a contract window is not a thing a click should do
   * silently, and the triage's own remedy — widening the window, on the record — is how
   * that decision gets made.
   */
  const bringBack = useCallback((siteId) => {
    setMovedOut((previous) => {
      if (!previous.has(siteId)) return previous;
      const next = new Set(previous);
      next.delete(siteId);
      return next;
    });
    setManualOrders({});
  }, []);

  /**
   * Undoing a route the optimizer created without being asked.
   *
   * The spill ribbon's way out. It drops that route's work from the run rather than
   * re-dating it: the visits go back to being whatever they already were, on the days
   * they already sit on, which is the outcome the planner is asking for when they say
   * they did not want a second day.
   */
  const dropSpillRoute = useCallback(
    (index) => {
      const route = routes[index];
      if (!route) return;
      const siteIds = route.plan.stops.filter((stop) => stop.isNew).map((stop) => stop.siteId);
      setMovedOut((previous) => {
        const next = new Set(previous);
        siteIds.forEach((siteId) => next.add(siteId));
        return next;
      });
      setManualOrders({});
    },
    [routes],
  );

  const nameMissingFor = (route) =>
    !route.targetId && namesTouched[route.index] && !(routeNames[route.index] || '').trim();

  const unnamedRoutes = routes.filter(
    (route) => !route.targetId && !(routeNames[route.index] || '').trim(),
  );

  const reorderedCount = routes.reduce(
    (total, route) => total + (route.plan.reorderedExistingCount || 0),
    0,
  );

  /**
   * What pressing Apply will write, in a sentence.
   *
   * The routes column says what the *plan* is; this says what happens to the schedule —
   * which is a different fact. It names existing routes by their worker, because "adds
   * 3 visits to Alex Green · Sun North" is a sentence a planner can act on and "adds 3
   * visits" is not.
   *
   * Composed from clauses rather than written as one string per case: the cases multiply
   * (create only · merge only · both · with leftovers · with re-orders) and one key per
   * combination is how copy goes stale.
   */
  const writeSummary = useMemo(() => {
    if (!hasPlan) return '';

    const created = routes.filter((route) => !route.targetId);
    const merged = routes.filter((route) => route.targetId);
    const mergedVisits = merged.reduce((total, route) => total + route.plan.fittedVisitCount, 0);
    const mergedNames = merged
      .map((route) =>
        route.target?.worker ? `${route.target.worker} · ${route.target.name}` : route.target?.name,
      )
      .filter(Boolean);

    const clauses = [
      created.length
        ? tt('footerWriteCreates', { count: created.length, route: term.toLowerCase() })
        : null,
      merged.length
        ? tt('footerWriteMerges', { count: mergedVisits, names: mergedNames.join(', ') })
        : null,
      /* Everything the write does not touch, in one clause: the work the rule ruled out,
         the work that had no room, and the work the planner took out by hand. The
         sentence is about the *consequence of pressing Apply*, and from there those
         three are the same outcome — these visits stay exactly where they are. */
      notInPlanCount + keptCount
        ? tt('footerWriteUnplaced', { count: notInPlanCount + keptCount })
        : null,
    ].filter(Boolean);

    if (!clauses.length) return '';

    /* "A", "A and B", "A, B and C" — an Oxford-less list, because this is prose and not
       a specification. */
    const list =
      clauses.length === 1
        ? clauses[0]
        : `${clauses.slice(0, -1).join(', ')} and ${clauses[clauses.length - 1]}`;

    return tt('footerWriteSentence', { clauses: list });
    // eslint-disable-next-line
  }, [routes, hasPlan, notInPlanCount, keptCount, term]);

  /**
   * The payload, or `null` when a new route still has no name.
   *
   * Returning `null` rather than doing nothing is what lets the caller *say* why: the
   * drawer's version marked the fields, opened the card and returned, which in a
   * scrolling panel looks exactly like a button that does nothing.
   */
  const apply = useCallback(
    (onApplied) => {
      const unnamed = routes.filter(
        (route) => !route.targetId && !(routeNames[route.index] || '').trim(),
      );
      if (unnamed.length) {
        setNamesTouched((previous) => {
          const next = { ...previous };
          unnamed.forEach((route) => {
            next[route.index] = true;
          });
          return next;
        });
        setSelectedRoute(unnamed[0].index);
        return;
      }

      setApplying(true);
      window.setTimeout(() => {
        setApplying(false);
        onApplied?.({
          /* One entry per route the apply touches, so the caller can report what
             happened without re-deriving it. */
          routes: routes.map((route) => ({
            day: dayLabelOf(route.day),
            /* The ISO day and the visit ids alongside the human label, because the
               calendar has to *move* these cards, not just report them: each route's
               visits land on that route's own day, so the caller needs the pairing and
               cannot re-derive it from a formatted date. */
            dayKey: route.day,
            visitIds: route.plan.stops
              .filter((stop) => stop.isNew)
              .flatMap((stop) => stop.visits.map((visit) => visit.id)),
            visitCount: route.plan.fittedVisitCount,
            created: !route.targetId,
            name: route.targetId ? route.target?.name : (routeNames[route.index] || '').trim(),
            worker: route.target?.worker || null,
          })),
          /* Everything `editRunsheet` needs, so the integration is a payload rather
             than a re-interview. */
          createdRoutes: routes
            .filter((route) => !route.targetId)
            .map((route) => ({
              runsheetName: (routeNames[route.index] || '').trim(),
              startDate: route.day,
              startEndLocation: startPoint.point
                ? {
                    address: startPoint.point.address || startPoint.point.label,
                    lat: startPoint.point.lat,
                    lng: startPoint.point.lng,
                  }
                : null,
              visitSet: route.plan.stops
                .filter((stop) => stop.isNew)
                .flatMap((stop) => stop.visits.map((visit) => visit.id)),
            })),
          unplacedCount,
          reorderedCount,
        });
      }, APPLY_MS);
    },
    [routes, routeNames, startPoint.point, unplacedCount, reorderedCount],
  );

  return {
    tt,
    term,
    daysPhrase,

    /* the question */
    rule,
    runRule,
    /* The request, and the flag every region on the right reads to decide whether it has
       anything to say yet. */
    hasRun,
    harmonize,
    /* The way back out of a run in progress — see `cancel`. */
    cancel,
    /* Whether the plan on screen still answers the question on screen, and therefore whether
       the Harmonize button has anything left to do. */
    isStale,
    canHarmonize,
    /* Identifies the answer on screen. The reveal keys its replay on this: a press can only
       happen after the configuration moved, so a changed signature *is* a new sitting. */
    solvedSignature: solved?.signature || '',
    /* Which press produced the plan on screen. Part of the reveal's sitting identity, so a
       cancel-and-retry narrates rather than appearing finished. */
    solvedAttempt: solved?.attempt || 0,
    installers,
    setInstallers: pickInstallers,
    installerOptions,
    /* The crew's day, for the surfaces that print a budget rather than enforce one. */
    budgetFor,
    /* The window in force, which on a narrow range is not the pill the planner last
       pressed — the control lights this and the field explains the ceiling. */
    needByDays: effectiveNeedByDays,
    /* The widest window this run may ask for: the narrower of the policy's own `NEED_BY_MAX`
       and the Harmonize window's width. The stepper's `+` stops here. */
    needByCeiling,
    /* And the floor, so the stepper's `−` knows where to stop without restating the policy. */
    needByFloor: NEED_BY_MIN,
    radiusKm,
    /* The radius as the control speaks it. `radiusKm` stays the state and the solver's
       unit — see `radiusMiles`. */
    radiusMiles,
    setRadiusMiles,
    /* Wrapped rather than exposed raw, so every writer goes through one clamp — see
       `clampNeedBy`. */
    setNeedByDays: setNeedBy,
    setRadiusKm,
    rangeStart,
    rangeEnd,
    rangeDates,
    setPlanWindow,
    runDays,
    targetDay,
    targetDayLabel,
    /* The install days, and the two forms the field needs: what is ticked right now
       (`runRule.preferredWeekdays`, always populated) and whether the planner has said
       anything at all (`weekdays === null` means the policy is still answering). */
    weekdays: runRule.preferredWeekdays,
    weekdaysOverridden: weekdays != null,
    setWeekdays,

    /* the input */
    visits,
    activeVisits,
    siteCount,
    triage,

    /* the answer */
    routes,
    routeCount,
    activeRoute,
    selectedRoute,
    setSelectedRoute,
    run,
    unplaced: run.unplaced,
    facts,
    hasPlan,
    diagnosis,
    triageGroups,
    mapExclusions,

    /* the tallies */
    placedVisitCount,
    notInPlanCount,
    keptCount,
    reorderedCount,
    writeSummary,
    /* **Both of these were computed and never returned.** The screen had one merged
       `notInPlanCount` to work with, which is the merge the comment above their
       declaration argues against: a capacity answer and a compliance answer read the
       same in a single figure, and the remedies for them are nothing alike. */
    unplacedCount,
    excludedCount,
    /* What the run amounts to, and what each knob is letting through. See
       `totalCoveredMinutes` and `coverage`. */
    totalCoveredMinutes,
    ...coverage,

    /* per-route form state */
    routeNames,
    routeOptionsFor,
    manualOrders,
    nameMissingFor,
    unnamedRoutes,

    /* the edits */
    setDayPin,
    setTargetPin,
    setRouteName,
    reorder,
    reoptimize,
    dropStop,
    bringBack,
    dropSpillRoute,
    /* Cross-route drag: ask before the drop, then move. `sitePins` is exposed so a row
       can show it was placed by hand rather than by the solver. */
    sitePins,
    canMoveSiteToDay,
    moveSiteToDay,
    unpinSite,

    /* the write */
    apply,
    applying,
  };
};
