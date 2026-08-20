import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { getCurrentStandardTimeInIsoWrtTimezone } from '../helper';

/**
 * The eight states a visit can be in, and the single place they are decided.
 *
 * The audit found the same visit reading differently in two places — marked
 * missed in its own drawer, indistinguishable from a normal visit on the grid.
 * Every surface that draws a visit resolves its state through `resolveVisitState`
 * so that cannot happen again.
 *
 * **On the grid the state is drawn the way this calendar draws every card**, and
 * that division of labour is the design (see `VISIT_STATE_STATUS` below):
 *
 *   card fill    — the status family, from the calendar's own legend: amber not
 *                  started · blue in progress · green completed · red hatch
 *                  missed · grey hatch cancelled · plain grey unrouted
 *   left accent  — the duty *type*, not the state. A visit is a patrol hit, so
 *                  it takes the patrol accent like every other hit card
 *   status badge — bottom-right, from the resolved state rather than the raw
 *                  record, so a visit the backend has not transitioned yet
 *                  still reads correctly (D11)
 *   text lines   — the tour and the runsheet, each of which says *Unassigned*
 *                  when it is missing. That is how a blocked or unrouted visit
 *                  announces itself, in words, rather than by tint alone
 *
 * The state is also spoken: it is composed into every card's `aria-label` and
 * stated in full in the drawer's callout.
 */
export const VISIT_STATE = {
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  MISSED: 'missed',
  BLOCKED_NO_TOUR: 'blockedNoTour',
  UNASSIGNED: 'unassigned',
  INSERTED_AFTER_START: 'insertedAfterStart',
  ROUTE_IN_PROGRESS: 'routeInProgress',
  SCHEDULED: 'scheduled',
};

const normalize = (value) => `${value ?? ''}`.toLowerCase();

const hasStatus = (visit = {}, status) => {
  const normalized = normalize(visit.scheduleStatus || visit.shiftStatus);
  return normalized === normalize(status);
};

const isCancelled = (visit = {}) =>
  hasStatus(visit, calendarShiftStatusEnum.CANCELLED) ||
  normalize(visit.scheduleStatus) === 'canceled' ||
  visit.isCancelled === true;

const isCompleted = (visit = {}) => hasStatus(visit, calendarShiftStatusEnum.COMPLETED);

const isMissed = (visit = {}) => hasStatus(visit, calendarShiftStatusEnum.MISSED);

/**
 * A visit with no tour template has no defined work, so it cannot be routed —
 * `unassignedHits` refuses it and pushes the user into tour assignment. The grid
 * used to give no warning until that point; this state is what makes the block
 * visible before the user tries.
 *
 * This asks for an *explicit* denial rather than testing `!visit.tour`. Grid rows
 * are a list payload and may simply not carry the tour object, so treating a
 * missing field as "no tour" would badge every visit on the week grid as blocked.
 * Absence of evidence is not evidence here: default to not blocked.
 */
const isBlockedWithoutTour = (visit = {}) => {
  if (typeof visit.hasTour === 'boolean') return !visit.hasTour;
  if (visit.requiresTourAssignment === true) return true;
  if (visit.tour === null) return true;
  return false;
};

const isUnassigned = (visit = {}) =>
  visit.isUnassigned === true ||
  hasStatus(visit, calendarShiftStatusEnum.UNASSIGNED) ||
  (!visit.runsheetId && !visit.runsheetName);

/**
 * A visit inserted into a route that had already left is not the same thing as a
 * planned stop, even though both are "on a runsheet in progress" — the driver did
 * not have it when they set off. Prefer the server's flag; fall back to comparing
 * when it was added against when the route started.
 */
const isInsertedAfterStart = (visit = {}) => {
  if (typeof visit.addedAfterRouteStart === 'boolean') return visit.addedAfterRouteStart;
  if (!visit.addedAt || !visit.runsheetStartedAt) return false;
  return visit.addedAt > visit.runsheetStartedAt;
};

const isRouteInProgress = (visit = {}) =>
  hasStatus(visit, calendarShiftStatusEnum.IN_PROGRESS) ||
  hasStatus(visit, calendarShiftStatusEnum.SHIFT_STARTED) ||
  visit.isRunsheetStarted === true ||
  Boolean(visit.runsheetStartedAt);

/* Declared above `resolveVisitState` because that function calls it — see
   handoff §7.16 on temporal dead zones surviving lint and build. */
const isPastVisit = (visit = {}) => {
  const endsAt = visit.endsAt || visit.end;
  if (!endsAt) return false;
  return getCurrentStandardTimeInIsoWrtTimezone() > endsAt;
};

/**
 * Resolution is ordered, and the order is the design.
 *
 * Terminal states win first — a cancelled visit is cancelled whatever else is
 * true of it. `BLOCKED_NO_TOUR` then outranks `UNASSIGNED` because both sit in the
 * unassigned band but they offer different actions: one wants a runsheet, the
 * other wants a tour template first. Band placement is decided by the row, not
 * by this function, so promoting the state does not move the card.
 */
export const resolveVisitState = (visit = {}) => {
  if (isCancelled(visit)) return VISIT_STATE.CANCELLED;
  if (isCompleted(visit)) return VISIT_STATE.COMPLETED;
  if (isMissed(visit)) return VISIT_STATE.MISSED;
  if (isBlockedWithoutTour(visit)) return VISIT_STATE.BLOCKED_NO_TOUR;
  if (isUnassigned(visit)) return VISIT_STATE.UNASSIGNED;
  if (isInsertedAfterStart(visit)) return VISIT_STATE.INSERTED_AFTER_START;
  if (isRouteInProgress(visit)) return VISIT_STATE.ROUTE_IN_PROGRESS;

  /* A routed visit whose window has closed and which never started did not happen,
     so it is missed — "scheduled" describes a plan, and there is no longer a future
     in which this plan runs. This closes the question `06` left open ("does an
     unrouted visit whose window has passed become missed?") for the routed half of
     it: without this the visit stayed `SCHEDULED` and read-only, which is to say it
     fell out of the workflow entirely — nothing flagged it and nothing could act on
     it, while a visit the backend happened to mark `missed` stayed reschedulable.
     Resolving it here rather than trusting the status means the grid is right even
     when the backend has not transitioned the record yet.

     Deliberately *not* extended to unrouted visits. A past visit that was never on
     a route failed earlier and differently — nobody planned it — and it belongs in
     the unassigned band where that is the thing being counted, not folded in with
     routes that were planned and not run. */
  if (isPastVisit(visit)) return VISIT_STATE.MISSED;

  return VISIT_STATE.SCHEDULED;
};

/** i18n key suffix under `obx.schedules.calendar.visits.state`. */
export const VISIT_STATE_LABEL_KEYS = {
  [VISIT_STATE.CANCELLED]: 'cancelled',
  [VISIT_STATE.COMPLETED]: 'completed',
  [VISIT_STATE.MISSED]: 'missed',
  [VISIT_STATE.BLOCKED_NO_TOUR]: 'blockedNoTour',
  [VISIT_STATE.UNASSIGNED]: 'unassigned',
  [VISIT_STATE.INSERTED_AFTER_START]: 'insertedAfterStart',
  [VISIT_STATE.ROUTE_IN_PROGRESS]: 'routeInProgress',
  [VISIT_STATE.SCHEDULED]: 'scheduled',
};

/**
 * The accent each state is drawn in, and whether that state is on a route.
 *
 * Declared here because this file already owns what a state *is*, so anything in
 * this feature that needs to draw one reads it from here rather than inventing a
 * third copy of the palette.
 *
 * **Known duplication, deliberately not collapsed yet.** `calendar.styles.js` still
 * carries these same hexes in its `visitState*` classes. It is a `components/common`
 * file and importing a schedules helper into it would invert the layering — the real
 * fix is to move the visit-state card classes out of the common stylesheet, which is
 * wider than this change. Until then: **change both, and keep them equal.**
 *
 * `routed` carries the other half of the encoding. On a card it is the left
 * accent's *style* (dashed = not on a route); on a pin it is fill versus ring. That matters
 * because `MISSED` and `UNASSIGNED` share an accent — red — and are told apart by
 * whether anybody ever planned them.
 *
 * Literal hexes rather than theme slots on purpose: these are semantic, and the
 * duty/brand palette means something else per tenant (§7.25).
 */
export const VISIT_STATE_STYLE = {
  [VISIT_STATE.SCHEDULED]: { accent: '#98A2B3', routed: true },
  [VISIT_STATE.UNASSIGNED]: { accent: '#B42318', routed: false },
  [VISIT_STATE.BLOCKED_NO_TOUR]: { accent: '#DC6803', routed: false },
  [VISIT_STATE.ROUTE_IN_PROGRESS]: { accent: '#1570EF', routed: true },
  [VISIT_STATE.INSERTED_AFTER_START]: { accent: '#1570EF', routed: true },
  [VISIT_STATE.COMPLETED]: { accent: '#12B76A', routed: true },
  [VISIT_STATE.MISSED]: { accent: '#B42318', routed: true },
  [VISIT_STATE.CANCELLED]: { accent: '#D0D5DD', routed: true },
};

/**
 * The status each state reads as on a card — the calendar's own status
 * vocabulary, the one its legend spells out along the bottom of the screen.
 *
 * This is what makes a visit card look like every other card here: the fill and
 * the bottom-right badge both come from this status, exactly as a shift card's
 * do. Resolving it from the *state* rather than from `scheduleStatus` is the
 * point — a routed visit whose window closed without starting resolves to
 * `MISSED` (D11) whatever the record says, and the badge follows.
 *
 * Two states share a status because the calendar has no separate mark for them,
 * and they say so in words instead: `BLOCKED_NO_TOUR` and `UNASSIGNED` both read
 * as unassigned, and the card's tour and runsheet lines are what tell them
 * apart. `INSERTED_AFTER_START` is in progress like any other live stop, plus a
 * broken left accent — see `calendar.styles.js`.
 */
export const VISIT_STATE_STATUS = {
  [VISIT_STATE.SCHEDULED]: calendarShiftStatusEnum.NOT_STARTED,
  [VISIT_STATE.UNASSIGNED]: calendarShiftStatusEnum.UNASSIGNED,
  [VISIT_STATE.BLOCKED_NO_TOUR]: calendarShiftStatusEnum.UNASSIGNED,
  [VISIT_STATE.ROUTE_IN_PROGRESS]: calendarShiftStatusEnum.IN_PROGRESS,
  [VISIT_STATE.INSERTED_AFTER_START]: calendarShiftStatusEnum.IN_PROGRESS,
  [VISIT_STATE.COMPLETED]: calendarShiftStatusEnum.COMPLETED,
  [VISIT_STATE.MISSED]: calendarShiftStatusEnum.MISSED,
  [VISIT_STATE.CANCELLED]: calendarShiftStatusEnum.CANCELLED,
};

/**
 * The card's *fill* class in `calendar.styles.js` — the status wash, nothing
 * else. The left accent is the duty type's and is applied alongside this, the
 * same way a patrol or dedicated card gets one.
 *
 * Several states share a fill because they share a status. What separates them
 * on screen is the badge, the two text lines, and — for an insert — the accent.
 */
export const VISIT_STATE_CARD_CLASSES = {
  [VISIT_STATE.CANCELLED]: 'visitFillCancelled',
  [VISIT_STATE.COMPLETED]: 'visitFillCompleted',
  [VISIT_STATE.MISSED]: 'visitFillMissed',
  [VISIT_STATE.BLOCKED_NO_TOUR]: 'visitFillUnrouted',
  [VISIT_STATE.UNASSIGNED]: 'visitFillUnrouted',
  [VISIT_STATE.INSERTED_AFTER_START]: 'visitFillInProgress',
  [VISIT_STATE.ROUTE_IN_PROGRESS]: 'visitFillInProgress',
  [VISIT_STATE.SCHEDULED]: 'visitFillNotStarted',
};

/**
 * What the UI may offer for a visit, per the session-3 decisions in
 * `docs/visits-feature/06-visits-scheduler-edge-cases.md`.
 *
 *   D3 — a route that has already started still accepts visits, but the insert is
 *        marked rather than silently absorbed.
 *   D4 — a completed visit is history. No reassignment.
 *   D5 — a past date is read-only, with one exception: a missed visit stays
 *        actionable so it can be re-added to a runsheet or moved to a new day.
 */
export const getVisitActionRules = (visit = {}) => {
  const state = resolveVisitState(visit);
  const isPast = isPastVisit(visit);

  // Missed is the only state that survives its own date, which is why the grid
  // has to mark it — it is the one thing still actionable in a past week.
  if (state === VISIT_STATE.MISSED) {
    return {
      state,
      isPast,
      isReadOnly: false,
      canAssignToRunsheet: true,
      canReschedule: true,
      requiresTourFirst: false,
      warnsLiveRoute: false,
      readOnlyReasonKey: null,
    };
  }

  if (state === VISIT_STATE.COMPLETED) {
    return {
      state,
      isPast,
      isReadOnly: true,
      canAssignToRunsheet: false,
      canReschedule: false,
      requiresTourFirst: false,
      warnsLiveRoute: false,
      readOnlyReasonKey: 'completed',
    };
  }

  if (state === VISIT_STATE.CANCELLED) {
    return {
      state,
      isPast,
      isReadOnly: true,
      canAssignToRunsheet: false,
      canReschedule: false,
      requiresTourFirst: false,
      warnsLiveRoute: false,
      readOnlyReasonKey: 'cancelled',
    };
  }

  if (isPast) {
    return {
      state,
      isPast,
      isReadOnly: true,
      canAssignToRunsheet: false,
      canReschedule: false,
      requiresTourFirst: state === VISIT_STATE.BLOCKED_NO_TOUR,
      warnsLiveRoute: false,
      readOnlyReasonKey: 'past',
    };
  }

  if (state === VISIT_STATE.BLOCKED_NO_TOUR) {
    return {
      state,
      isPast,
      isReadOnly: false,
      canAssignToRunsheet: false,
      canReschedule: false,
      requiresTourFirst: true,
      warnsLiveRoute: false,
      readOnlyReasonKey: null,
    };
  }

  const onLiveRoute =
    state === VISIT_STATE.ROUTE_IN_PROGRESS || state === VISIT_STATE.INSERTED_AFTER_START;

  return {
    state,
    isPast,
    isReadOnly: false,
    canAssignToRunsheet: true,
    canReschedule: true,
    requiresTourFirst: false,
    warnsLiveRoute: onLiveRoute,
    readOnlyReasonKey: null,
  };
};
