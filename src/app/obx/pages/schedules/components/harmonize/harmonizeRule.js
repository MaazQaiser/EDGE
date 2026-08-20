/**
 * The harmonization rule: which visits may be pulled onto one day, and why not.
 *
 * The drawer used to answer a geometry question — *how much of this week fits in
 * eight hours* — and take every visit on screen as fair game. That is not what
 * harmonizing is. A filter replacement is due on a date the contract fixed, it may
 * be brought forward or pushed back only so far, and a franchise runs its filter
 * work on particular weekdays inside a particular travelling distance. So the run
 * is decided by three facts before the solver is allowed an opinion at all:
 *
 *   **the route day**   — the weekday the planner works, from Settings. The run
 *                         collapses the window's work *onto* it.
 *   **the need by window** — how far either side of its due date a visit may move.
 *                         `± 3 days` by default, and a contract may be tighter.
 *   **the radius**      — how far from where the day starts the van will travel.
 *
 * Everything here is pure and dateless: days arrive as `YYYY-MM-DD` keys and every
 * answer is derived from its arguments, so the same rule and the same visits give
 * the same triage on every render. That is what lets the drawer compute this inside
 * a `useMemo` while the planner drags a knob.
 *
 * **Two divergences from `docs/harmonization-settings.md`, both deliberate:**
 *
 * 1. **The radius is measured from where the day starts, not from the depot.** §11
 *    of that document keeps two origins for two questions — the van's origin today,
 *    and the depot the territory is drawn around. The product decision is that this
 *    feature does not consider the company's location at all: the planner's own
 *    position is the origin, the route leaves from it and returns to it, and the
 *    radius is drawn around the same point. One origin, one circle, and it is the
 *    circle the map can actually show.
 * 2. **A route day is assumed when Settings has none.** `routeDays: []` still means
 *    "unset" everywhere else (H1), and the resolver reports `fromSettings: false`
 *    when it has filled one in, so the drawer can say where the value came from.
 */

import dayjs from 'dayjs';
import {
  NEED_BY_DEFAULT,
  NEED_BY_MAX,
  officersFor,
  RADIUS_MAX,
  RADIUS_MIN,
  radiusKmFromSettings,
  shiftMinutesFor,
  weekdaysFromSettings,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';
import { distanceKm } from 'src/app/obx/pages/runSheets/buildRoute/helper';

/** Why a visit is not in the plan. Ordered by what the planner would fix first. */
export const EXCLUDED = {
  NEED_BY: 'needBy',
  RADIUS: 'radius',
  CAPACITY: 'capacity',
};

export const EXCLUSION_ORDER = [EXCLUDED.NEED_BY, EXCLUDED.RADIUS, EXCLUDED.CAPACITY];

/**
 * The weekday the prototype assumes when Settings names none.
 *
 * Monday, because that is the shape of the franchise this was designed against: one
 * filter day a week, a tight urban radius, three days of contractual slack. An
 * unset rule would otherwise send the drawer back to its old behaviour — the day
 * that already holds the most work — and the whole feature would be invisible until
 * somebody found the settings screen.
 */
const ASSUMED_WEEKDAY = 1;

export const dayKeyOf = (day) => (day?.isValid?.() ? day.format('YYYY-MM-DD') : '');

/**
 * The rule this run will be planned by.
 *
 * Reads the saved settings and fills in what is missing.
 *
 * **The radius is one value for the whole rule now, and Settings states it in miles.**
 * It used to belong to the route day — Monday's urban 10km, Thursday's rural 25km — so
 * `radiusFor(weekday)` existed to pick the right one when a run was re-dated onto a
 * different day. There is one radius to pick, so it answers the same for every weekday.
 * The signature is kept rather than collapsed to a field because `useHarmonizeRun` and
 * `SetupColumn` call it, and because the per-day distinction is a plausible thing to
 * want back; the shape is the seam it would come back through.
 *
 * Everything below this function still speaks kilometres. `radiusKmFromSettings` is the
 * single conversion, and it also reads the legacy per-day shape, so a rule saved before
 * the change resolves without the screen having had to migrate it first.
 */
export const resolveHarmonizeRule = (settings = {}) => {
  const configured = weekdaysFromSettings(settings);
  const fromSettings = configured.length > 0;

  /* Sorted so the run order is the week's order and not the order the planner happened
     to tick the days in. `Set` because two stored copies of Thursday are one Thursday. */
  const routeDays = fromSettings
    ? [...new Set(configured)].sort((a, b) => a - b)
    : [ASSUMED_WEEKDAY];

  const radiusKm = radiusKmFromSettings(settings);

  return {
    fromSettings,
    /* ISO weekday numbers, not records. `preferredWeekdays` is kept as the name every
       caller already uses; `routeDays` is now the same list rather than a parallel one. */
    routeDays,
    preferredWeekdays: routeDays,
    needByDays: Number.isFinite(settings.needByDays) ? settings.needByDays : NEED_BY_DEFAULT,
    planWindowDays: Number.isFinite(settings.planWindowDays) ? settings.planWindowDays : 7,
    radiusKm,
    /* Where the round trip leaves from and returns to. One point, not two: `endLocation`
       existed for a while, was never consumed, and is gone — the route comes back to where
       it started, so the start is the whole answer. */
    startLocation: settings.startLocation ?? null,
    radiusFor: () => radiusKm,
    /**
     * How long the crew works on a given day, in minutes.
     *
     * **Exposed and not yet consumed, and that is worth stating plainly.** The solver budgets
     * `MAN_DAY_MINUTES` — a module constant of `8 * 60` in `runSheets/buildRoute/helper` —
     * at three call sites in `harmonizePlan`, plus `DayMeter` and `RouteCard` which draw the
     * budget. Routing the per-day value through all five is a real change to the planner and
     * its tests, not a settings-screen change, so this is the seam it will come through:
     * `packStops` already takes `budgetMinutes` as a parameter rather than reading the
     * constant itself. Until then a Saturday set to 4 hours is stored, shown, and planned as
     * if it were 8.
     */
    shiftMinutesFor: (weekday) => shiftMinutesFor(settings, weekday),
    /* The crew named against one weekday, for the installer count the workspace opens on.
       A closure over `settings` rather than a lookup on `routeDays` above, because that field
       is flattened to bare weekday numbers by `weekdaysFromSettings` and the officers do not
       survive it — the same reason `shiftMinutesFor` is written this way. */
    officersFor: (weekday) => officersFor(settings, weekday),
  };
};

/** ISO weekday, 1 = Monday. `dayjs().day()` is 0 = Sunday, which is not this. */
export const isoWeekdayOf = (day) => (((day?.day?.() ?? 0) + 6) % 7) + 1;

/**
 * The route days inside a window, in order.
 *
 * These are the only days a harmonized run may land on: that is the point of
 * setting them. A day that has already passed is not one of them — work cannot be
 * scheduled into last Monday — and the list is capped so a four-week window with
 * two route days a week cannot propose eight routes.
 */
export const routeDaysInWindow = ({ rule, from, to, today = dayjs(), max = 4 }) => {
  if (!from?.isValid?.() || !to?.isValid?.()) return [];

  const startOfToday = dayjs(today).startOf('day');
  const first = from.isBefore(startOfToday, 'day') ? startOfToday : from.startOf('day');
  const days = [];

  for (let cursor = first; !cursor.isAfter(to, 'day'); cursor = cursor.add(1, 'day')) {
    if (rule.preferredWeekdays.includes(isoWeekdayOf(cursor))) days.push(dayKeyOf(cursor));
    if (days.length >= max) break;
  }

  return days;
};

/**
 * The date the visit is actually due.
 *
 * Not the date it currently sits on. A visit is scheduled onto a day by whoever
 * built the route; it is *due* on the date the contract and the first filter fitting
 * decided, and that is the date the need-by window is measured from. Where a visit
 * arrives without one — live data that has not caught up, mostly — the day it is
 * scheduled on is the honest stand-in, because that is what the schedule is
 * currently claiming about it.
 */
export const needByOf = (visit) => {
  const stated = visit?.needByDate ? dayjs(visit.needByDate) : null;
  if (stated?.isValid?.()) return stated.startOf('day');
  return visit?.scheduledFor?.isValid?.() ? visit.scheduledFor.startOf('day') : null;
};

/**
 * The visit's own contractual window, or null when it does not state one.
 *
 * **`Number()` is not a null check, and reading it as one cost a whole screen.** The
 * first version of this asked `Number.isFinite(Number(visit.needByWindowDays))`, and
 * `Number(null)` is `0` — a perfectly finite number — so every visit that had *no*
 * contract window was read as having a **zero-day** one. The effect was total: only
 * visits due exactly on the route day qualified, the panel reported eleven of fourteen
 * as contract-bound, and both the count and the advice attached to it were wrong while
 * every individual number on screen looked plausible. Absence has to be tested for
 * absence.
 */
const contractWindowOf = (visit) => {
  const stated = visit?.needByWindowDays;
  if (stated == null || stated === '') return null;
  const days = Number(stated);
  return Number.isFinite(days) ? Math.max(0, days) : null;
};

/**
 * How far this visit may move, in days.
 *
 * The planner's knob and the contract are both constraints, so the tighter of the
 * two wins. A contract that allows five days does not license a run the planner
 * capped at three, and a run set to five cannot stretch a contract that allows one.
 */
export const windowDaysOf = (visit, rule) => {
  const runWindow = Number.isFinite(rule?.needByDays) ? rule.needByDays : NEED_BY_DEFAULT;
  const contract = contractWindowOf(visit);
  return contract == null ? runWindow : Math.min(runWindow, contract);
};

/**
 * One visit, measured against one day.
 *
 * `slackDays` is signed and reads as the planner would say it: negative is early,
 * positive is late. Both `daysOutside` and `kmOutside` are reported even when the
 * visit is included, because the remedy arithmetic needs the amount and not just
 * the verdict.
 */
export const assessVisit = ({ visit, dayKey, rule, startPoint, radiusKm }) => {
  const day = dayKey ? dayjs(dayKey).startOf('day') : null;
  const needBy = needByOf(visit);
  const windowDays = windowDaysOf(visit, rule);

  const slackDays = day && needBy ? day.diff(needBy, 'day') : 0;
  const daysOutside = Math.max(0, Math.abs(slackDays) - windowDays);

  /* No origin, no circle. The drawer blocks on a missing start point with its own
     message, so treating every visit as in-radius here keeps one fault reported
     once rather than turning it into a second, wrong diagnosis. */
  const measuredKm = startPoint ? distanceKm(startPoint, visit) : null;
  const limitKm = Number.isFinite(radiusKm) ? radiusKm : rule?.radiusKm;
  const kmOutside =
    measuredKm != null && Number.isFinite(limitKm) ? Math.max(0, measuredKm - limitKm) : 0;

  /* Need by before radius, deliberately: a visit that cannot legally be done on
     this day is not a distance problem, and reporting it as one would send the
     planner to widen a radius that would change nothing. */
  const reason = daysOutside > 0 ? EXCLUDED.NEED_BY : kmOutside > 0 ? EXCLUDED.RADIUS : null;

  return {
    eligible: !reason,
    reason,
    needBy,
    windowDays,
    slackDays,
    daysOutside,
    distanceKm: measuredKm,
    kmOutside,
  };
};

/**
 * One visit, measured against every day the run may land on, keeping its best.
 *
 * **Why a run needs this at all.** A run used to collapse work onto a single route
 * day, so one day was the only thing a visit could be measured against. Now the
 * planner picks a *set* of install days, and the question changes shape: a visit is
 * in the run if its need-by window reaches **any** of those days, not if it reaches
 * the one the run happens to be centred on. Measured against a single day, ticking a
 * second weekday would admit nothing and the field would look broken — the run would
 * be allowed to use Wednesday while still refusing every visit that only Wednesday
 * could serve.
 *
 * "Best" is the day that misses by least, which for an included visit is a day that
 * misses by nothing. That choice is what makes the remedy arithmetic downstream
 * honest: `daysOutside` has to be the distance from the *nearest* legal day, or
 * `smallestWindowToInclude` would widen the window far enough to reach a day the run
 * was never going to use.
 *
 * `servedOn` names the day that answered, because "this visit is in" is not much use
 * to a panel that has to say *which day it is in on*.
 */
export const assessVisitAcrossDays = ({ visit, dayKeys = [], rule, startPoint, radiusKm }) => {
  const keys = dayKeys.filter(Boolean);

  /* No days at all is not the same question, and `assessVisit` already answers it:
     with no date there is no need-by verdict to reach, so only the radius decides. */
  if (!keys.length) {
    return { ...assessVisit({ visit, dayKey: null, rule, startPoint, radiusKm }), servedOn: '' };
  }

  return keys.reduce((best, dayKey) => {
    const assessment = {
      ...assessVisit({ visit, dayKey, rule, startPoint, radiusKm }),
      servedOn: dayKey,
    };
    if (!best) return assessment;
    /* Strictly closer wins, so ties keep the earliest day — the run fills its days in
       order and a visit with a free choice belongs on the first one that will take it. */
    return assessment.daysOutside < best.daysOutside ? assessment : best;
  }, null);
};

/**
 * Everything in play, sorted into what the run may take and what it may not.
 *
 * The funnel counts are part of the answer rather than something the caller
 * re-derives: the drawer prints them under the two knobs as the *consequence* of
 * where they are set, and a count computed twice is a count that will disagree with
 * itself.
 *
 * Takes `dayKeys` — the whole set of install days — and keeps `dayKey` as the
 * one-day form. They are not two ways of saying the same thing: `dayKey` alone is
 * still correct for anything asking *about a particular day* (the map's own
 * per-day pins, a single card), while `dayKeys` is the question the run asks.
 */
export const triageVisits = ({ visits = [], dayKey, dayKeys, rule, startPoint, radiusKm }) => {
  const keys = (dayKeys?.length ? dayKeys : [dayKey]).filter(Boolean);
  const eligible = [];
  const excluded = [];
  let inNeedByWindow = 0;

  visits.forEach((visit) => {
    const assessment = assessVisitAcrossDays({ visit, dayKeys: keys, rule, startPoint, radiusKm });
    if (assessment.reason !== EXCLUDED.NEED_BY) inNeedByWindow += 1;

    if (assessment.eligible) eligible.push({ ...visit, ...assessment });
    else excluded.push({ ...visit, ...assessment });
  });

  return {
    eligible,
    excluded,
    counts: {
      total: visits.length,
      inNeedByWindow,
      inRadius: eligible.length,
    },
  };
};

/**
 * The smallest need-by window that would include the visits it excluded, or null
 * when no legal value would.
 *
 * The remedy has to name the number. *Widen the window* leaves the planner guessing
 * how far, and guessing at a compliance setting is exactly the guess nobody should
 * be asked to make — the same reasoning that put `smallestSafeNeedBy` on the
 * settings screen.
 */
export const smallestWindowToInclude = (excluded = []) => {
  const blocked = excluded.filter((visit) => visit.reason === EXCLUDED.NEED_BY);
  if (!blocked.length) return null;

  /* A contract window is not the planner's to widen, so those visits are not part of
     the arithmetic: a remedy computed to reach one would set the knob to a value that
     still does not include it. Only the visits the knob can actually reach count. */
  const reachable = blocked.filter((visit) => contractWindowOf(visit) == null);
  if (!reachable.length) return null;

  const needed = Math.max(...reachable.map((visit) => Math.abs(visit.slackDays)));
  if (needed > NEED_BY_MAX) return null;

  return needed;
};

/** The smallest radius that would reach them, rounded up to a whole kilometre. */
export const smallestRadiusToInclude = (excluded = []) => {
  const blocked = excluded.filter(
    (visit) => visit.reason === EXCLUDED.RADIUS && Number.isFinite(visit.distanceKm),
  );
  if (!blocked.length) return null;

  const needed = Math.ceil(Math.max(...blocked.map((visit) => visit.distanceKm)));
  if (needed > RADIUS_MAX) return null;

  return Math.max(RADIUS_MIN, needed);
};

/**
 * Whether a visit may be pulled onto a *later* route day than the one being
 * planned. Used by the run: work that spills off Monday can only land on Thursday
 * if Thursday is still inside its need-by window, which is not something the
 * capacity solver would ever check for itself.
 */
export const canServeOn = ({ visit, dayKey, rule }) =>
  assessVisit({ visit, dayKey, rule, startPoint: null }).reason !== EXCLUDED.NEED_BY;

/** Whether the visit carries a contract window tighter than the run's own. */
export const hasContractWindow = (visit) => contractWindowOf(visit) != null;
