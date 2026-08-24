import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { dayjsWithStandardOffset } from '../helper';

/**
 * How many visits each route card is carrying — one tally, read from the week's
 * own visit list.
 *
 * ── Why a lookup and not a field ──
 *
 * The routes reading's grid draws **runsheet shifts**: rows are routes, cards are
 * one route's run on one day. Nothing in that payload counts hits — a route is not
 * a visit on that fetch — so the number has to come from the visit list the page
 * already holds for the same window (`visitsForHarmonize` in `calendar/index.jsx`,
 * which is fetched alongside the grid for Harmonize).
 *
 * Reading *that* list rather than a rawer one is the whole point: cancelled visits
 * are already out of it (`dropCancelledEvents`), and cancelled records are not drawn
 * on the grid unless the status filter asks for them, so counting them here would
 * put a number on a card for work no card shows. The same list also arrives narrowed
 * by whatever status filter is applied, which is what keeps a card's count moving in
 * step with the footer's status row and the header total above it.
 *
 * ── The join key: route **name** plus day ──
 *
 * `runsheetName` is the only route identity both sides of this join actually carry.
 * A visit has a real `runsheetId` (the route it is planned on); a runsheet shift's
 * own `id` is *that day's run*, and `shift.runsheetId` where the payload sends one
 * is the same per-day object (it is what `CalendarOfficerAssignPopover` posts an
 * officer assignment to). Those are two different id spaces, so joining on them
 * would not be fragile — it would be wrong, and wrong in the silent direction: every
 * card would read zero. The name is a display string, so it is matched
 * case-insensitively and trimmed, and it is the weaker key of the two available:
 * two routes sharing a display name pool their stops. Pairing it with the day bounds
 * that damage — the collision has to happen on the same date — and it is the honest
 * trade, because the alternative is no number at all. If the grid payload ever
 * carries the route's own id on its cards, that id belongs here in front of the name.
 *
 * The **day** is in the key because a card is a day's run, not a route. A route
 * appears once per day it runs, so a count scoped to the whole week would print the
 * same number four times across one row, describe none of the four cards it sat on,
 * and be unsummable — four cards' counts would triple-count the same visits. Scoped
 * to the card's own date, each visit is counted on the one card whose run it is.
 */

/** `mapShiftToCalendarEvent` has already normalised a mapped card's `start` to this. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The day column a record sits in, in the grid's own convention.
 *
 * Both sides have to agree, and they reach this function in different shapes: grid
 * cards come through `mapShiftToCalendarEvent`, which has already rewritten `start`
 * to a bare `YYYY-MM-DD` in the tenant's standard offset, while the visit list is
 * raw payload whose `start` is a full ISO instant. An already-normalised date must
 * not be pushed through the offset a second time — `dayjsWithStandardOffset` parses
 * a bare date as local midnight, so a negative offset would shunt it to the day
 * before and every count would land one column off.
 */
const dayKeyOf = (record) => {
  const raw = record?.start || record?.startsAt;
  if (!raw) return null;
  if (typeof raw === 'string' && DATE_ONLY.test(raw)) return raw;

  const day = dayjsWithStandardOffset(raw);
  return day.isValid() ? day.format('YYYY-MM-DD') : null;
};

const routeKeyOf = (name) => {
  const trimmed = `${name ?? ''}`.trim();
  return trimmed ? trimmed.toLowerCase() : null;
};

const keyFor = (routeName, dayKey) => {
  const route = routeKeyOf(routeName);
  return route && dayKey ? `${route}|${dayKey}` : null;
};

/**
 * Visits per route per day, or `null` when this window has no visit list to count.
 *
 * **`null`, not an empty map, for an empty list** — the difference between "no
 * visits" and "no answer" is the difference between a card that can honestly print
 * `0` and one that must print nothing. Two live paths hand over `[]` without meaning
 * "the window is empty": the day view and the embedded grids never fetch a visit
 * list, and both windows that do fetch one — the week (`harmonizeVisitsPromise`) and
 * the month (`getRoutesByMonth`) — swallow that call's failures with
 * `.catch(() => [])` so a grid that loaded is not blanked by a list that did not.
 * Printing `0 Visits` across a grid in either case would be inventing a fact. The
 * cost is that a genuinely empty window also shows no counts, which is the safe side
 * of the same ambiguity.
 *
 * The month used to be a third such path, and is deliberately no longer one: the
 * routes reading's month asks for the very list the week asks for, so a route card
 * carries the same count in both views rather than a count in one and a blank in the
 * other.
 *
 * Unrouted visits are skipped, not bucketed: a visit with no route belongs to no
 * card on this grid. They are counted in the header's own total, which is why the
 * per-card counts sum to *less* than it — see the reconciliation note in
 * `PatrolCardBody`.
 *
 * @param {Array|null} visits Visits for the window — already cancelled-free.
 * @returns {Map<string, number>|null}
 */
export const buildRouteVisitCounts = (visits) => {
  if (!Array.isArray(visits) || !visits.length) return null;

  const counts = new Map();

  visits.forEach((visit) => {
    /* Defensive rather than decorative: the state this reads is written by several
       fetch branches, and only the visits ones hold hits. A patrol shift that found
       its way in must not be counted as a stop on itself. */
    const shiftType = visit?.shiftType || visit?.legendType;
    if (shiftType !== SCHEDULE_DUTIES.HIT) return;

    const key = keyFor(visit?.runsheetName || visit?.runsheet?.name, dayKeyOf(visit));
    if (!key) return;

    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
};

/**
 * This card's visit count — `null` whenever the window has no count to give.
 *
 * A route-day the visit list never mentions answers `0`, deliberately: the list
 * covers the whole window, so a route running that day with no stops in it is a
 * fact the list is entitled to state. `null` is reserved for "there is no list",
 * which `buildRouteVisitCounts` decides once, above every card.
 */
export const getRouteVisitCount = (counts, shift) => {
  /**
   * **The card's own `totalHits` wins, whenever the payload sends one.**
   *
   * Asked for directly: the badge must read exactly what the route drawer reads. The
   * drawer's number is the route's stop list; the map below is a different question —
   * visits from the week's list that fall on this route *this day* — and the two
   * legitimately disagree, which is what put `0` on a card whose drawer listed three
   * stops. Where the card knows its own total there is nothing to reconcile, so the
   * join is not consulted at all.
   *
   * `!= null` so a genuine `0` from the payload is honoured rather than falling
   * through to a second derivation that might contradict it.
   */
  if (shift?.totalHits != null) return shift.totalHits;

  if (!counts) return null;

  const key = keyFor(shift?.runsheetName || shift?.runsheet?.name, dayKeyOf(shift));
  if (!key) return null;

  return counts.get(key) || 0;
};
