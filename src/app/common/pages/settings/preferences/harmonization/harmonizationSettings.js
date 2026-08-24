/**
 * The harmonization rule — read here, saved here, and nowhere else.
 *
 * There is no endpoint for this yet. Rather than have Save report success over a
 * value that never left the tab, it persists to `localStorage`, which means the
 * setting survives a reload and the Visits drawer can actually read it. The two
 * functions below are the seam: when the API lands, `read` becomes a GET and
 * `save` a PUT, and no caller changes.
 *
 * Because the whole point is not claiming success falsely, `save` returns
 * `{ settings, persisted }` rather than the settings alone: `persisted` is false
 * when the write threw, so the screen can say the rule was not kept instead of
 * showing a saved toast over a value that will be gone on reload.
 *
 * `routeDays: []` is the off state deliberately — there is no `enabled` flag to
 * forget to check. An empty list means the optimizer keeps the behaviour it has
 * today (the day already holding most of the week's work), so a tenant that never
 * opens this screen is unaffected by it shipping.
 */

import { ZONE_DEFINITIONS, ZONE_SITES } from './zoneSites';

const STORAGE_KEY = 'filtergo.harmonization';

/**
 * Days a visit may move either side of its due date.
 *
 * **± 5, not ± 3, and the reason is arithmetic rather than taste.** A run collapses a week
 * of scattered work onto the install days inside its window, and a week is seven days
 * wide. With one install day — which is what most franchises in this product have — that
 * day sits at most three days from one end of the week and four from the other, so ± 3
 * cannot reach a full week from any single route day, whatever the contracts say. A
 * franchise on a Monday-only schedule opening this screen at ± 3 would find a third of
 * every week ineligible and no setting on the page obviously to blame.
 *
 * ± 7 is the value that arithmetic actually forces, and ± 5 was a first attempt at it that
 * measured the week and forgot the drift. A due date is not the scheduled date: contracts
 * put it a day or so either side, so the worst case is *four days from the end of the week
 * to the install day, plus the drift* — six or seven, not five. Verified on the demo week
 * rather than reasoned about a second time: at ± 5 the run reached three of six visits and
 * the panel's own remedy link computed ± 7 as the window that would take the rest.
 *
 * It remains inside the floor's own argument — a working week either side at most — and
 * `NEED_BY_MIN` still refuses the ± 0 that would make six of seven weekdays unschedulable.
 * A franchise wanting a tighter window can still set one; it is no longer the value the
 * product assumes on their behalf, which is what ± 3 was doing when a Monday-only schedule
 * made a third of every week ineligible with nothing on the page to blame.
 */
export const NEED_BY_DEFAULT = 7;

/**
 * **The radius is one value for the whole rule, and it is stated in miles.**
 *
 * It used to belong to the route day — Monday's urban 10, Thursday's rural 25 — which
 * is a real distinction and the wrong one to open with: it asked the planner to answer
 * the same question up to seven times before they had answered it once, and six of
 * those answers were the default nobody had a reason to change. One radius is the
 * setting; a run that needs a different reach for one day still overrides it in the
 * workspace, which is where a per-run exception belongs.
 *
 * Miles because the franchises using this quote territory in miles. The *engine* is
 * metric and stays that way: `distanceKm` is haversine kilometres and every comparison
 * downstream is in km, so the conversion happens once, at the resolver, and nothing
 * below it learns a second unit. That is why both sets of constants live here.
 */
/**
 * **15, not 10.** The old default sat exactly on top of the demo book's own geography — the
 * furthest site in a typical week rounds to 10 mi — so the opening state excluded a visit by
 * a rounding error and offered *Extend to 11 mi* to fix it. A default that a franchise's own
 * work sits on the boundary of is a default that reports a problem on every first run. 15
 * clears the book with margin, and the radius is still the constraint it always was the
 * moment a planner tightens it.
 */
export const RADIUS_DEFAULT_MILES = 15;
export const RADIUS_MIN_MILES = 1;

/**
 * 125, not 124.27.
 *
 * The engine's ceiling is `RADIUS_MAX` kilometres and 200km is 124.274 miles, so the
 * honest conversion is a number no planner would type and no label should print. 125
 * rounds *up*, which would exceed the km ceiling by 1.2km if anything read this as a
 * hard geometric limit. Nothing does: the km bound is enforced separately on the
 * engine's own side, so the worst case is that a 125-mile setting behaves as 124.27,
 * which is a rounding error at the edge of a range nobody works at.
 */
export const RADIUS_MAX_MILES = 125;

/**
 * **Maximum shift hours, per installation day.**
 *
 * A route day is not just a day the crew works, it is a day of a particular length: a
 * Saturday half-day and a Thursday ten-hour push are both real, and until now the planner
 * had one number for all of them — `MAN_DAY_MINUTES`, hardcoded at `8 * 60` in
 * `runSheets/buildRoute/helper`. That is why this belongs to the *day* rather than being one
 * value for the rule, and it is why the weekday table came back: a column of seven numbers
 * is the shape of the question.
 *
 * 8 is the default precisely because it is what the solver already assumes, so a tenant who
 * never opens this screen plans exactly the routes they plan today.
 *
 * 1 to 16: below an hour is not a shift, and above sixteen is not one either. The cap is
 * deliberately not 24 — a setting that lets someone describe a round-the-clock working day
 * is a setting that will eventually be used to schedule one.
 */
export const SHIFT_HOURS_DEFAULT = 8;
export const SHIFT_HOURS_MIN = 1;
export const SHIFT_HOURS_MAX = 16;

export const MILES_TO_KM = 1.609344;

/** Miles in, kilometres out. The one place the two units meet. */
export const milesToKm = (miles) => Number(miles) * MILES_TO_KM;

/** The inverse, for the harmonize workspace's own radius display — the engine still
 * hands back kilometres, and this is the one place that reads back out in miles. */
export const kmToMiles = (km) => Number(km) / MILES_TO_KM;

/**
 * The engine's own bounds, in kilometres, and deliberately unchanged.
 *
 * `harmonizeRule` compares haversine kilometres against these, and the workspace's
 * run-level radius slider is drawn between them. Renaming or re-basing them in miles
 * would have meant re-expressing every distance in the solver for a unit that only
 * the settings screen and its labels ever needed.
 *
 * `RADIUS_DEFAULT` is the km fallback the resolver fills in for a rule that names no
 * radius, so it is pinned to the miles default rather than written twice: an assumed
 * rule and a saved-but-untouched rule should reach exactly as far as each other.
 */
export const RADIUS_MIN = 1;
export const RADIUS_MAX = 200;
export const RADIUS_DEFAULT = milesToKm(RADIUS_DEFAULT_MILES);

/**
 * The need-by window runs from ± 3 to ± 14, and ± 3 is the floor rather than just
 * the default.
 *
 * **The ceiling was 7 and is now 14, at the user's direction — a reversal, recorded
 * so nobody re-derives the old rule from the argument that used to sit here.** That
 * argument was: ± 14 lets a visit move a fortnight either side of a date a contract
 * fixed, which is not slack, it is a different visit. It is still a fair description
 * of what ± 14 *means*; what it got wrong was whose call that is. A franchise that
 * services quarterly sites has contracts written in months, and a fortnight either
 * side of a 90-day interval is well inside the tolerance the contract itself allows —
 * so the ceiling is a franchise policy, not a safety rail, and refusing to offer it
 * was this screen deciding a commercial question. The visit's own contract window
 * still wins wherever it is tighter (see `triageVisits`), which is the guard that
 * actually protects the work.
 *
 * The floor stands on its original reasoning: ± 0 means a visit can only ever be
 * done on its exact due date, so six of seven due weekdays become unschedulable
 * against a single route day — a rule that quietly discards work.
 *
 * `NEED_BY_MAX` is read by the harmonize workspace as well, so widening it here
 * widens the workspace's own picker by the same amount. That is the point: it is one
 * policy, and a workspace that allowed ± 14 over a Settings screen that allowed ± 7
 * would be two policies wearing one name.
 */
export const NEED_BY_MIN = 3;
export const NEED_BY_MAX = 14;

/**
 * The five values, derived rather than written out, so the dropdown on the settings
 * screen cannot list a value `clampNeedBy` would refuse.
 */
export const NEED_BY_OPTIONS = Array.from(
  { length: NEED_BY_MAX - NEED_BY_MIN + 1 },
  (_, index) => NEED_BY_MIN + index,
);

/**
 * Capped at 28 days because `RANGE_MAX_DAYS` in the harmonize drawer caps its own
 * range picker there.
 *
 * This used to argue that the three presets were fixed values *instead of* a number
 * field, "so the control and the code cannot disagree — a free input would accept 60 and
 * be silently clamped". The screen is both now, and that is what closed the gap rather
 * than opening it: the presets write into the same field the planner types in, and 60 is
 * corrected to 28 on blur, in front of them, before Save. A control that refuses the
 * keystroke never explains the limit; one that corrects it does.
 */
/** The longest window, and the ceiling. Named because two constants below are pinned to it. */
export const PLAN_WINDOW_MONTH_DAYS = 28;

export const PLAN_WINDOW_DAYS = [7, 14, PLAN_WINDOW_MONTH_DAYS];

/**
 * The plan window is a **duration**, and the custom option is a longer duration — not a
 * pair of dates.
 *
 * It was briefly a date range, and the range was the wrong kind of value twice over.
 * Downstream, `resolveHarmonizeRule` reads exactly one thing out of this setting —
 * `planWindowDays` — so the two dates were write-only: stored, redisplayed, and never
 * consulted by anything that plans a route. And a *default* expressed as absolute dates
 * goes stale by standing still: "18 Aug – 14 Sep" saved today is simply wrong next month,
 * which is why the picker had to be given no `minDate`/`maxDate` to stop it rendering in
 * an error state purely because time had passed. A rolling length has neither problem.
 *
 * The three presets stay because they are the three answers almost everyone wants, and
 * `PLAN_WINDOW_DAYS` is read by the screen as a set of shortcuts into one number field
 * rather than as a list of the only legal values. Any whole number in this closed range is
 * reachable, entered the way the radius is — typed freely, clamped on blur. There is no
 * "custom" mode any more, and no second field it would switch to.
 */
export const PLAN_WINDOW_MIN_DAYS = 1;

/**
 * Still 28, and still because `RANGE_MAX_DAYS` in the harmonize drawer caps its own
 * picker there: a longer window would be truncated later, out of sight, and the setting
 * would not mean what it said.
 */
export const PLAN_WINDOW_MAX_DAYS = PLAN_WINDOW_MONTH_DAYS;

/**
 * Where a run leaves from and comes back to. **One place, not two.**
 *
 * There were two fields for a while, `startLocation` and `endLocation`, on the argument that
 * a franchise leaving from a depot and finishing at a technician's home has two points. The
 * product decision is that it does not: the route is a round trip, so the end restates the
 * start, and `endLocation` was stored and never read by anything that plans a route. A
 * setting nothing consumes is worse than a missing one, because it looks answered.
 *
 * `useStartPoint` said this first and was right — "One place, not two: the round trip returns
 * to where it left from, so an 'end' control could only ever restate the start." The field
 * keeps the name `startLocation`, because that is what the engine reads and what it is: the
 * point the route leaves from, returns to, and has its radius drawn around.
 *
 * `null` means "not set", and both stay null rather than defaulting to the franchise address:
 * the screen resolves the planner's own position first and the franchise second, and baking
 * either into the stored default makes an unanswered question indistinguishable from an
 * answered one.
 */
const emptyLocation = () => null;

/**
 * **A zone is a name and a shape; membership lives on the site.**
 *
 * This is the one modelling decision in the section and it is not the obvious one, so
 * it is written down. A zone could reasonably hold `siteIds: []` — that is how the
 * screen reads out loud ("North holds four sites") and it is how the design boards
 * for this feature described it. It is the wrong side of the relation for this app.
 * `harmonizeFlow`'s fixture already puts `zoneId` on the *site*, and the franchise's
 * own `/zones` records already store the same fact as `sites[]` on the zone. Two
 * stores for one relation is the bug where a site is in North according to North and
 * in East according to the site.
 *
 * So the site is the record of truth and the zone stores only what a site cannot:
 * its **shape** — the boundary the planner drew, or the anchor and distance they set.
 * The shape is not the definition of the zone. It is the tool that produced the
 * assignments, kept so it can be reopened and redrawn rather than re-derived by hand.
 * A zone with `shape: null` is a perfectly good zone somebody assigned site by site.
 *
 * Two consequences worth having in front of you:
 *
 * 1. **A site cannot be in two zones.** `zoneId` is one field. E8 in
 *    `HARMONIZE-CONTEXT.md` — "a site falls in two zone boundaries" — is not an edge
 *    case to design a warning for, it is structurally impossible here, and two
 *    overlapping *shapes* just mean whichever was drawn last won the site.
 * 2. **Deleting a zone orphans its sites rather than deleting them.** `zoneOfSite`
 *    resolves through the live zone list, so a site pointing at a zone that no longer
 *    exists reports no zone at all — which is the truthful answer and the one the
 *    coverage panel can act on.
 */
export const ZONE_SHAPE = { BOUNDARY: 'boundary', RADIUS: 'radius' };

const ZONE_NAME_MAX = 40;

/**
 * A drawn boundary needs three points to enclose anything, and sixty is far past
 * the point where another click adds information — it is the guard against a stored
 * shape big enough to make reading the rule slow, not a limit a planner will meet.
 */
const ZONE_POINTS_MIN = 3;
const ZONE_POINTS_MAX = 60;

/**
 * The zones a franchise has before anybody opens this screen.
 *
 * Named rather than empty, and the reasoning is the same as `SHIFT_HOURS_DEFAULT`
 * being 8: a tenant who never touches this screen should plan what they plan today,
 * and today the flow's fixture assigns every site to one of these four. An empty
 * list would mean no day could be given a zone, so shipping the section would take
 * the demo from "works" to "cannot run" — which is not a default, it is a regression
 * wearing one.
 *
 * They arrive with no shape, which is honest: nobody has drawn them. The first time
 * a planner opens one in the editor is the first time it acquires a boundary.
 */
function defaultZones() {
  return ZONE_DEFINITIONS.map((zone) => ({ id: zone.id, name: zone.name, shape: null }));
}

/**
 * The unset rule.
 *
 * Declared in **the same key order `sanitise` returns**, deliberately. Nothing enforces that
 * at runtime any more — `sanitise` has one construction path now, so this object is no longer
 * on the comparison path — but the two being readable side by side is what makes it obvious
 * when a field is added to one and forgotten in the other.
 */
export const DEFAULT_SETTINGS = {
  routeDays: [],
  zones: defaultZones(),
  siteZones: {},
  radiusMiles: RADIUS_DEFAULT_MILES,
  startLocation: emptyLocation(),
  /**
   * Kept in the model with no control on the screen.
   *
   * The Harmonization Window row was removed from the UI, but `resolveHarmonizeRule` reads
   * `planWindowDays` and the workspace's own range picker starts from it, so deleting the
   * field would have changed how far ahead every run looks as a side effect of tidying a
   * settings screen. It sits at the default and nothing on this screen can move it; the
   * workspace still offers it per run, which is where it was actually being used.
   */
  planWindowDays: 7,
  needByDays: NEED_BY_DEFAULT,
};

const clamp = (value, min, max, fallback) => {
  const number = parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

/**
 * The two range clamps are exported because the screen clamps on blur rather than
 * refusing keystrokes — typing `250` into a radius used to leave `25` in the field,
 * and `0` used to be accepted and silently rewritten on save. Sanitising goes
 * through the same two functions so the field and the stored value cannot end up
 * disagreeing about where the edges are.
 */
export const clampRadiusMiles = (value) =>
  clamp(value, RADIUS_MIN_MILES, RADIUS_MAX_MILES, RADIUS_DEFAULT_MILES);

export const clampShiftHours = (value) =>
  clamp(value, SHIFT_HOURS_MIN, SHIFT_HOURS_MAX, SHIFT_HOURS_DEFAULT);

export const clampNeedBy = (value) => clamp(value, NEED_BY_MIN, NEED_BY_MAX, NEED_BY_DEFAULT);

export const clampPlanWindow = (value) =>
  clamp(value, PLAN_WINDOW_MIN_DAYS, PLAN_WINDOW_MAX_DAYS, DEFAULT_SETTINGS.planWindowDays);

/**
 * A stored location, or null.
 *
 * The coordinates are the part that matters — the planner's address text is a label for
 * a point the solver uses — so a record without a usable pair is not a partial location,
 * it is no location. Rejecting it here rather than downstream is what stops a run being
 * planned from `NaN, NaN`.
 */
const sanitiseLocation = (raw) => {
  const lat = parseFloat(raw?.lat);
  const lng = parseFloat(raw?.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { address: typeof raw.address === 'string' ? raw.address : '', lat, lng };
};

/**
 * The shape a planner drew, or nothing.
 *
 * Invalid becomes `null` rather than being dropped, and the difference matters: a zone
 * whose shape failed to parse is still a zone with sites in it, and deleting the record
 * would take the *assignments* with it. Losing a boundary means "open the editor and
 * draw it again"; losing the zone means five sites silently stop being schedulable.
 */
const sanitiseZoneShape = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  if (raw.kind === ZONE_SHAPE.RADIUS) {
    /* The anchor is a location like any other, so it goes through the same guard — a
       radius drawn around `NaN, NaN` is the bug `sanitiseLocation` exists to stop, and
       it would place a circle in the Gulf of Guinea rather than fail loudly. */
    const anchorPoint = sanitiseLocation(raw.anchor);
    if (!anchorPoint) return null;

    return {
      kind: ZONE_SHAPE.RADIUS,
      /**
       * **A radius is centred on a site, not on an arbitrary point.**
       *
       * `siteId` is the answer; `anchor` is that site's coordinates, denormalised so the
       * shape can still be drawn if the site book is unavailable — the same reasoning that
       * stores an officer's name beside their id. A dropped pin with no address was the
       * earlier model and it produced zones described as "12 mi around a dropped pin",
       * which is not something a planner can check.
       *
       * The id is optional rather than required so a rule saved under the old model keeps
       * its circle instead of losing the zone.
       */
      siteId: typeof raw.siteId === 'string' && raw.siteId.trim() ? raw.siteId.trim() : null,
      anchor: anchorPoint,
      /* The same clamp the rule-level radius uses, so a zone cannot reach further than
         the setting elsewhere on this screen allows. One range, stated once. */
      radiusMiles: clampRadiusMiles(raw.radiusMiles),
    };
  }

  if (raw.kind === ZONE_SHAPE.BOUNDARY) {
    const points = (Array.isArray(raw.points) ? raw.points : [])
      .map((point) => sanitiseLocation({ address: '', lat: point?.lat, lng: point?.lng }))
      .filter(Boolean)
      .slice(0, ZONE_POINTS_MAX)
      .map(({ lat, lng }) => ({ lat, lng }));

    /* Two points are a line and one is a dot; neither encloses a site, so neither is a
       boundary. Better to report no shape than a shape that captures nothing. */
    if (points.length < ZONE_POINTS_MIN) return null;

    return { kind: ZONE_SHAPE.BOUNDARY, points };
  }

  return null;
};

/**
 * The zone list. `undefined` means nobody has saved one, which is not the same as an
 * empty one — a planner who deletes every zone has said something, and this keeps it
 * said rather than helpfully restoring the four they just removed.
 */
const sanitiseZones = (raw) => {
  if (!Array.isArray(raw)) return defaultZones();

  const byId = new Map();
  raw.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const id = typeof entry.id === 'string' ? entry.id.trim() : '';
    if (!id) return;
    if (byId.has(id)) return;
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, ZONE_NAME_MAX) : '';
    /* A zone that lost its name is still usable if it can be called something, and its
       id is the only other thing it has. Better a row reading "north" than a blank one
       the planner cannot point at. */
    byId.set(id, { id, name: name || id, shape: sanitiseZoneShape(entry.shape) });
  });

  return [...byId.values()];
};

/**
 * Which zone each site was moved to, where a planner has moved one.
 *
 * Only the *overrides* are stored, not the whole assignment table. The site book ships
 * its own `defaultZoneId`, so writing all fifteen would mean a rule that has to be
 * migrated every time a site is added — and a franchise that never opened this screen
 * would carry a snapshot of an assignment it never made.
 *
 * `null` is a real value here and it is not the same as a missing key: `null` means the
 * planner took a site *out* of every zone, and dropping it would let the book's default
 * quietly put it back.
 *
 * **Keys are written in sorted order**, which is not tidiness. `isDirty` compares
 * `JSON.stringify` of the normalised form against the stored rule, and object key order
 * is insertion order — so a planner who assigned two sites in one order and reopened the
 * screen in the other would find it claiming unsaved changes over an identical rule.
 */
const sanitiseSiteZones = (raw, zones) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const live = new Set(zones.map((zone) => zone.id));
  const out = {};
  Object.keys(raw)
    .map((key) => String(key).trim())
    .filter(Boolean)
    .sort()
    .forEach((siteId) => {
      const value = raw[siteId];
      if (value === null) {
        out[siteId] = null;
        return;
      }
      const zoneId = typeof value === 'string' ? value.trim() : '';
      /* An override naming a deleted zone is discarded rather than kept as a dangling
         id, which lets the site fall back to its book default instead of reading as
         permanently unzoned. */
      if (zoneId && live.has(zoneId)) out[siteId] = zoneId;
    });

  return out;
};

/**
 * The officers assigned to one installation day.
 *
 * **Per day, not per rule.** It was briefly a single list for the whole rule, and that could
 * not say the thing a franchise actually needs to say: the two people who work Saturdays are
 * not the four who work Tuesdays. It lives in the weekday record beside `shiftHours`, which is
 * the other fact that belongs to a day rather than to the week.
 *
 * **The name is stored beside the id, and that is not redundancy.** An id alone makes the
 * setting undisplayable whenever the roster cannot be read — a failed employees request, or
 * a planner opening this on a session whose franchise has changed — and "3 installers
 * selected" that cannot name any of them is worse than useless, because it cannot be checked.
 * Storing the name means the setting always describes itself. The same reasoning puts
 * `address` beside `lat`/`lng` on the location.
 *
 * The id is the identity, so duplicates collapse on it and a record without one is dropped
 * rather than kept as a name nothing can be matched back to. Ids are coerced to strings
 * because the endpoint has returned both numbers and strings for them.
 */
const sanitiseOfficers = (raw) => {
  if (!Array.isArray(raw)) return [];

  const byId = new Map();
  raw.forEach((entry) => {
    const id = entry?.id;
    if (id === undefined || id === null || id === '') return;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    if (!name) return;
    const key = String(id);
    if (byId.has(key)) return;
    byId.set(key, { id: key, name });
  });

  return [...byId.values()];
};

/**
 * Anything unrecognised falls back to the default rather than reaching the UI.
 *
 * Exported as `normaliseSettings` below, because the screen needs the answer to "would
 * saving this change anything?" and that is exactly this function applied to the form.
 * Comparing the raw form instead was the source of a real bug: a field cleared for
 * retyping holds `''`, which differs from the stored number, so the form read as dirty
 * and Save enabled — then `mousedown` blurred the field, the clamp put the stored value
 * back, `isDirty` went false and the button disabled *before the click dispatched*. The
 * press did nothing and said nothing.
 */
const sanitise = (input) => {
  /**
   * **One construction path, and the reason is a bug this shipped for ten minutes.**
   *
   * This used to early-return `{ ...DEFAULT_SETTINGS }` for anything that was not an object,
   * which produced the right *values* in a different *key order* from the return below. That
   * is invisible almost everywhere and fatal in exactly one place: `isDirty` compares
   * `JSON.stringify` of the normalised form against the saved rule, and `JSON.stringify` is
   * order-sensitive. So on a browser with nothing stored, `saved` came back in
   * `DEFAULT_SETTINGS` order, the form normalised into *this* order, the two strings differed,
   * and the screen opened already claiming "Unsaved changes" with Save lit.
   *
   * Treating a non-object as `{}` and falling through means there is one literal, one order,
   * and nothing to keep in step. Every clamp below already answers with its default for
   * `undefined`, which is what makes it work.
   */
  const raw = input && typeof input === 'object' ? input : {};

  const stored = Array.isArray(raw.routeDays) ? raw.routeDays : [];

  /**
   * Three stored shapes are read, because all three exist in somebody's browser.
   *
   *   `[{ weekday, shiftHours, officers }]`  what is written now
   *   `[{ weekday, shiftHours }]`  before officers moved into the day
   *   `[weekday]`                  the spell when the radius was one value and the days were
   *                                a multi-select with nothing else to carry
   *   `[{ weekday, radius }]`      the original, radius per day, in kilometres
   *
   * A day that arrives without shift hours gets the default rather than being dropped, which
   * is the whole point of migrating rather than resetting: the days a planner chose are the
   * expensive part of this setting, and opening the screen to find the week blank would read
   * as the rule having been lost with no way to tell that it had not.
   */
  /* Before the days, because a day's zone is only meaningful if that zone still exists
     and this is where that is known. */
  const zones = sanitiseZones(raw.zones);
  const liveZoneIds = new Set(zones.map((zone) => zone.id));

  const byWeekday = new Map();
  stored.forEach((entry) => {
    const isRecord = typeof entry === 'object' && entry !== null;
    const weekday = parseInt(isRecord ? entry.weekday : entry, 10);
    if (!(weekday >= 1 && weekday <= 7)) return;
    /* First write wins, so a duplicated weekday keeps the earlier of the two rather than
       whichever happened to be serialised last. */
    if (byWeekday.has(weekday)) return;
    byWeekday.set(weekday, {
      weekday,
      shiftHours: clampShiftHours(isRecord ? entry.shiftHours : undefined),
      /* Nobody is the off state, the way `routeDays: []` is for the week. A day with no
         officers named is a day the planner has not staffed yet, which is different from a
         day staffed by everyone — and there is no `allOfficers` flag to forget to check. */
      officers: sanitiseOfficers(isRecord ? entry.officers : undefined),
      /* **One zone, and `null` is the off state** (D15 — a day and a runsheet are 1:1,
         and a day never covers two zones). A day with no zone is legal and means what it
         says: the crew works that day and no work can legally land on it. That reads as
         an odd thing to allow until you watch somebody turn Thursday on — refusing to
         store the day until it also had a zone would make switching a day on a two-step
         commit, and the coverage panel says the thing out loud anyway.

         Validated against the live list rather than trusted, so deleting a zone leaves
         the days that used it unzoned instead of pointing at nothing. */
      zoneId:
        isRecord && typeof entry.zoneId === 'string' && liveZoneIds.has(entry.zoneId.trim())
          ? entry.zoneId.trim()
          : null,
    });
  });

  const routeDays = [...byWeekday.values()].sort((a, b) => a.weekday - b.weekday);

  /* The *widest* of the old per-day radii, not the first and not an average: collapsing
     seven answers into one has to be the reading that keeps every day reaching at least
     as far as it did, or the migration quietly shrinks somebody's territory. Converted
     out of the kilometres it was stored in. Only consulted when there is no `radiusMiles`
     already, so it runs once and the planner's own later edit always wins. */
  const legacyKm = stored
    .map((day) => (typeof day === 'object' && day !== null ? Number(day.radius) : NaN))
    .filter((radius) => Number.isFinite(radius));

  const radiusMiles =
    raw.radiusMiles === undefined && legacyKm.length
      ? clampRadiusMiles(Math.round(Math.max(...legacyKm) / MILES_TO_KM))
      : clampRadiusMiles(raw.radiusMiles);

  /* `endLocation` is read and discarded rather than carried: it was stored for a while and
     never consumed, and the route is a round trip, so the start is the whole answer. A rule
     saved with both keeps its start and loses a value nothing was reading. */
  return {
    routeDays,
    zones,
    siteZones: sanitiseSiteZones(raw.siteZones, zones),
    radiusMiles,
    startLocation: sanitiseLocation(raw.startLocation),
    planWindowDays: clampPlanWindow(raw.planWindowDays),
    needByDays: clampNeedBy(raw.needByDays),
  };
};

/**
 * What this form would store if it were saved right now.
 *
 * The screen compares this against the saved rule to decide whether anything is
 * outstanding, so "dirty" means "saving would change something" rather than "the form
 * object differs from the stored one". Those are not the same question while a field is
 * empty mid-retype, and the difference was a Save button that disabled itself under the
 * pointer.
 */
export const normaliseSettings = (form) => sanitise(form);

/**
 * The unsaved edit, held only for as long as the tab lives.
 *
 * The screen sits in a `TabPanel` that unmounts the moment the planner clicks
 * another item in the settings list, which used to throw away a half-built rule
 * with no warning. A module variable outlives that unmount, which is all the
 * problem needs.
 *
 * Deliberately not `localStorage`: a half-finished rule that survived a reload
 * would be indistinguishable from a saved one, and the planner would trust it.
 * Deliberately not sanitised either — the screen holds `''` in a field the moment
 * it is cleared for retyping, and running that through `sanitise` would snap it
 * back to the default under the cursor.
 */
let draft = null;

export const readDraft = () => draft;

export const writeDraft = (form) => {
  draft = form;
};

export const clearDraft = () => {
  draft = null;
};

/**
 * The rule's reach in **kilometres**, from settings that state it in miles.
 *
 * This is the conversion seam, and it is here rather than in `resolveHarmonizeRule`
 * because the legacy reading belongs beside the migration in `sanitise` that performs
 * the same collapse. Both answer one question: given whatever is stored, how far does
 * this rule reach, in the unit the solver compares against.
 *
 * Three readings, in order. A `radiusMiles` is the setting and wins. Failing that, the
 * widest of the old per-day kilometre radii, for a rule saved before the radius moved
 * out of the table and read here by the resolver before the screen has migrated it.
 * Failing both, the default.
 */
export const radiusKmFromSettings = (settings = {}) => {
  if (settings.radiusMiles !== undefined && settings.radiusMiles !== null) {
    return milesToKm(clampRadiusMiles(settings.radiusMiles));
  }

  const legacyKm = (Array.isArray(settings.routeDays) ? settings.routeDays : [])
    .map((day) => (typeof day === 'object' && day !== null ? Number(day.radius) : NaN))
    .filter((radius) => Number.isFinite(radius));

  return legacyKm.length ? Math.max(...legacyKm) : RADIUS_DEFAULT;
};

/**
 * The shift length for one weekday, in **minutes**, because that is the unit the solver
 * budgets in (`MAN_DAY_MINUTES`, `packStops`' `budgetMinutes`).
 *
 * Falls back to the default for a weekday the rule does not name, so a caller asking about
 * a day that is not an installation day gets today's behaviour rather than zero minutes and
 * an empty route.
 */
export const shiftMinutesFor = (settings = {}, weekday) => {
  const days = Array.isArray(settings.routeDays) ? settings.routeDays : [];
  const match = days.find((day) => (typeof day === 'object' ? day.weekday : day) === weekday);
  const hours = typeof match === 'object' && match !== null ? match.shiftHours : undefined;
  return clampShiftHours(hours) * 60;
};

/** ISO weekday numbers out of either the current or the legacy stored shape. */
/**
 * The officers named against one weekday.
 *
 * **Returns `[]` rather than a default crew, and that asymmetry with `shiftMinutesFor` is
 * deliberate.** An unnamed weekday has a defensible shift length — eight hours, what the
 * solver has always assumed — but it has no defensible *headcount*: inventing two people for
 * a day the franchise never staffed would be this function asserting a fact rather than
 * filling a gap. Empty is the honest answer and the caller decides what to open a picker on.
 *
 * Tolerates a bare-number entry and a non-array `routeDays` for the same reason
 * `shiftMinutesFor` does — an unsanitised draft can reach here through `readDraft`, and the
 * legacy shapes `sanitise` still reads carry no officers at all.
 */
export const officersFor = (settings = {}, weekday) => {
  const days = Array.isArray(settings.routeDays) ? settings.routeDays : [];
  const match = days.find((day) => (typeof day === 'object' ? day.weekday : day) === weekday);
  return sanitiseOfficers(typeof match === 'object' && match !== null ? match.officers : undefined);
};

export const weekdaysFromSettings = (settings = {}) =>
  (Array.isArray(settings.routeDays) ? settings.routeDays : [])
    .map((day) => (typeof day === 'object' && day !== null ? day.weekday : day))
    .map((weekday) => parseInt(weekday, 10))
    .filter((weekday) => weekday >= 1 && weekday <= 7);

export const readHarmonizationSettings = () => {
  try {
    return sanitise(JSON.parse(window.localStorage.getItem(STORAGE_KEY)));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveHarmonizationSettings = (settings) => {
  const clean = sanitise(settings);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    /* Private browsing, quota, a locked-down profile. The caller still gets the
       sanitised value back so the screen stays consistent with itself, but
       `persisted: false` tells it not to claim the rule was kept — and the draft
       stays put, because it is now the only copy of the planner's edit. */
    return { settings: clean, persisted: false };
  }

  /* Cleared here rather than by the caller: a saved rule is the one the screen
     should read back, and leaving it to the screen means one forgotten call
     resurrects a stale edit on the next visit. */
  clearDraft();
  return { settings: clean, persisted: true };
};

/**
 * Whether a visit due on `dueWeekday` can be served on `routeWeekday`.
 *
 * The served-by interval is `needByDays` either side of the due date, so it spans
 * `2 × needByDays + 1` days. A weekly-recurring route day falls inside it only if
 * the interval is long enough to contain that weekday:
 *
 *     (route − due + needBy) mod 7  <  2 × needBy + 1
 *
 * At ± 3 the interval is exactly seven days, so every due date reaches every route
 * day — and since `NEED_BY_MIN` is 3, that is now true of every window the screen
 * will accept. This is the arithmetic that lets the settings screen carry no
 * unreachable-day warning at all rather than carrying one that can never fire.
 */
const canReach = (dueWeekday, routeWeekday, needByDays) => {
  const span = needByDays * 2 + 1;
  if (span >= 7) return true;
  return (((routeWeekday - dueWeekday + needByDays) % 7) + 7) % 7 < span;
};

/**
 * The weekdays whose due dates cannot reach any route day — visits that would
 * never be scheduled, for reasons no other screen would ever mention.
 *
 * Returns ISO weekday numbers (1 = Monday), empty when the rule is sound.
 *
 * **Nothing renders this any more, and it is kept on purpose.** With `NEED_BY_MIN` at
 * 3 it returns `[]` for every window the settings screen can produce, so the amber
 * note it used to feed was removed rather than left as UI that can never appear. What
 * it is now is the *proof* of that claim, exercised by `harmonizationSettings.test.js`
 * against the §6 table: if a future change lowers the floor below 3, the tests here
 * are what say which weekdays go dark, and the note becomes worth restoring.
 */
export const unreachableWeekdays = ({ routeDays = [], needByDays = NEED_BY_DEFAULT }) => {
  if (!routeDays.length) return [];

  /* Normalised rather than read directly, because this is exported and both shapes
     reach it: the screen passes weekday numbers, and a rule loaded straight out of an
     unmigrated store still carries `{ weekday, radius }` records. Reading `day` as a
     number against a record gives NaN, and NaN compares false, which would report every
     weekday as unreachable rather than failing. */
  const weekdays = weekdaysFromSettings({ routeDays });

  const dark = [];
  for (let due = 1; due <= 7; due += 1) {
    const reachable = weekdays.some((weekday) => canReach(due, weekday, needByDays));
    if (!reachable) dark.push(due);
  }
  return dark;
};

/**
 * The smallest need-by value that would leave nothing unreachable, or null when
 * no value fixes it. The remedy had to name a number, not a direction — "widen
 * the window" leaves the planner guessing how far.
 *
 * Kept for the same reason as `unreachableWeekdays`, and its search deliberately
 * still starts at 0 rather than at `NEED_BY_MIN`. It answers an arithmetic question —
 * the smallest window that reaches everything — not a question about what this screen
 * will let anybody type, and the two are only the same question by coincidence. A
 * floor bolted on here would make the answer for `{Mon, Thu}` read 3 when it is 2.
 */
export const smallestSafeNeedBy = ({ routeDays = [] }) => {
  if (!routeDays.length) return null;
  for (let candidate = 0; candidate <= NEED_BY_MAX; candidate += 1) {
    if (!unreachableWeekdays({ routeDays, needByDays: candidate }).length) return candidate;
  }
  return null;
};

/**
 * A zone by id, or null. Reads the rule rather than the site book, because the rule is
 * where a renamed or deleted zone is known about.
 */
export const zoneById = (settings = {}, zoneId) =>
  (Array.isArray(settings.zones) ? settings.zones : []).find((zone) => zone.id === zoneId) || null;

/**
 * Which zone a site is in, all three readings in order.
 *
 * An explicit `null` override wins — the planner took it out of every zone and that is
 * an answer. Then a named override, then the site book's own default. The result is
 * always checked against the live zone list, so a site whose zone was deleted reports
 * no zone rather than a dangling id: the coverage panel can act on "in no zone" and can
 * do nothing at all with "in zone `east-old`".
 */
export const zoneOfSite = (settings = {}, site) => {
  const overrides =
    settings.siteZones && typeof settings.siteZones === 'object' ? settings.siteZones : {};
  const siteId = site?.id;
  if (!siteId) return null;

  const override = Object.prototype.hasOwnProperty.call(overrides, siteId)
    ? overrides[siteId]
    : undefined;

  const resolved = override === null ? null : override || site.defaultZoneId || null;
  if (!resolved) return null;

  return zoneById(settings, resolved) ? resolved : null;
};

/**
 * What this configuration cannot do, computed before anything runs.
 *
 * Every one of these is knowable in Settings. Zone membership is static and each day's
 * zone is static, so "these two sites have no legal day" does not need the engine — it
 * needs a set difference. §14.5 of `HARMONIZE-CONTEXT.md` asks the run's scope step to
 * *predict* rather than describe; this is the same finding one screen earlier, where the
 * fix actually lives, and it is the same shape as `unreachableWeekdays` already computes
 * for the need-by window. One idea, two constraints.
 *
 * **`stranded` is the finding that matters** — a zone with sites in it that no
 * installation day covers. An unused *empty* zone is untidy, not broken, so it is
 * reported separately and the screen can stay quiet about it.
 *
 * Filters, not just site counts, because `10 + 20 × filters` is the cost model: two
 * stranded sites carrying thirteen filters is four hours forty of work, and calling it
 * "2 sites" is the same mistake §14.4 catches the flow's own headline metric making.
 */
export const zoneCoverage = ({ settings = {}, sites = ZONE_SITES } = {}) => {
  const zones = Array.isArray(settings.zones) ? settings.zones : [];
  const routeDays = Array.isArray(settings.routeDays) ? settings.routeDays : [];

  const buckets = new Map(
    zones.map((zone) => [zone.id, { zone, sites: [], filters: 0, weekdays: [] }]),
  );
  const orphanSites = [];

  sites.forEach((site) => {
    const zoneId = zoneOfSite(settings, site);
    const bucket = zoneId ? buckets.get(zoneId) : null;
    if (!bucket) {
      orphanSites.push(site);
      return;
    }
    bucket.sites.push(site);
    bucket.filters += Number(site.filters) || 0;
  });

  routeDays.forEach((day) => {
    const bucket = day?.zoneId ? buckets.get(day.zoneId) : null;
    if (bucket) bucket.weekdays.push(day.weekday);
  });

  const byZone = [...buckets.values()];

  /**
   * **With no installation days at all, nothing is *stranded* — everything is.**
   *
   * `routeDays: []` is the documented off state, and a franchise in it would otherwise get
   * one "this zone is covered by no day" warning per zone: four bands, four remedies, all
   * of them downstream of the single fact that no day is switched on. Reporting the cause
   * once beats reporting its consequences four times, so the per-zone finding is suppressed
   * and `noWorkedDays` lets the screen say the true thing instead.
   *
   * Orphans are *not* suppressed the same way: a site in no zone is broken whether or not
   * any day is worked, and fixing the days will not fix it.
   */
  const noWorkedDays = !routeDays.length;

  return {
    byZone,
    noWorkedDays,
    /* Everything a run would have to place, for the no-days message to be able to size it. */
    zonesHoldingWork: byZone.filter((entry) => entry.sites.length).length,
    orphanSites,
    orphanFilters: orphanSites.reduce((total, site) => total + (Number(site.filters) || 0), 0),
    /* Worked by no day *and* holding work. */
    stranded: noWorkedDays
      ? []
      : byZone.filter((entry) => !entry.weekdays.length && entry.sites.length),
    /* Worked by no day and holding nothing — reportable, not a problem. */
    unusedEmpty: byZone.filter((entry) => !entry.weekdays.length && !entry.sites.length),
    /* An installation day the crew works that nothing can legally land on. */
    daysWithoutZone: routeDays.filter((day) => !day?.zoneId).map((day) => day.weekday),
  };
};
