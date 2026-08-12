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
 * The visual encoding is layered on purpose, and never leans on colour alone:
 *
 *   border style — is there a plan?   dashed = not on a route, solid = routed
 *   colour       — which family?      red needs attention · amber blocked ·
 *                                     blue live · green done · grey void
 *   icon + label — the state's name, so the card is readable in greyscale and
 *                  to a screen reader
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

/** Card class in `calendar.styles.js`. Every state has one — the visit card's
 *  colour comes from here alone, not from the tenant duty palette. */
export const VISIT_STATE_CARD_CLASSES = {
  [VISIT_STATE.CANCELLED]: 'visitStateCancelled',
  [VISIT_STATE.COMPLETED]: 'visitStateCompleted',
  [VISIT_STATE.MISSED]: 'visitStateMissed',
  [VISIT_STATE.BLOCKED_NO_TOUR]: 'visitStateBlocked',
  [VISIT_STATE.UNASSIGNED]: 'visitStateUnassigned',
  [VISIT_STATE.INSERTED_AFTER_START]: 'visitStateInserted',
  [VISIT_STATE.ROUTE_IN_PROGRESS]: 'visitStateInProgress',
  [VISIT_STATE.SCHEDULED]: 'visitStateScheduled',
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
