/**
 * Re-costing for the proposal review.
 *
 * Unticking a change re-costs, it does not re-solve (D28) — otherwise the list
 * would rearrange under the cursor while the planner is working through it. So
 * everything here is arithmetic over the accepted subset, never a new ordering.
 */

import { MAN_DAY_MINUTES, MOCK_CHANGES, WEEK } from './mockProposal';

export { MAN_DAY_MINUTES };

export const formatMinutesAsDuration = (minutes = 0) => {
  const safe = Math.abs(Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/** Signed, always — a saving and a cost must never look alike. */
export const formatSignedDuration = (minutes = 0) => {
  if (!minutes) return '—';
  return `${minutes < 0 ? '−' : '+'}${formatMinutesAsDuration(minutes)}`;
};

/** A change's own saving is the sum of what it does to each day. */
export const changeDelta = (change) =>
  Object.values(change?.dayImpact || {}).reduce((total, minutes) => total + minutes, 0);

/**
 * Walks the accepted subset once and returns everything the screen needs, so the
 * headline, the day bars and the commit button are all reading the same numbers.
 */
export const buildProposalSummary = ({
  changes = MOCK_CHANGES,
  acceptedIds = new Set(),
  /* The day scope is the same arithmetic one level down: swap the rows for
     routes and the impact key for routeImpact, and every number still agrees. */
  rows = WEEK,
  impactKey = 'dayImpact',
}) => {
  const accepted = changes.filter((change) => acceptedIds.has(change.id));

  const days = rows.map((day) => {
    const delta = accepted.reduce(
      (total, change) => total + (change[impactKey]?.[day.key] || 0),
      0,
    );
    const afterMinutes = day.baseMinutes + delta;

    return {
      ...day,
      delta,
      afterMinutes,
      overflowMinutes: Math.max(0, afterMinutes - MAN_DAY_MINUTES),
      wasOver: day.baseMinutes > MAN_DAY_MINUTES,
    };
  });

  const driveMinutesDelta = accepted.reduce((total, change) => total + changeDelta(change), 0);

  /* Anything that got worse, collected as first-class entries rather than
     derived in the view — a summary that can only go green is a sales pitch. */
  const regressions = days
    .filter((day) => day.delta > 0)
    .map((day) => ({ label: day.label, minutesDelta: day.delta }))
    .sort((a, b) => b.minutesDelta - a.minutesDelta);

  const notifications = accepted
    .filter((change) => change.requiresNotification)
    .map((change) => ({ id: change.id, ...change.requiresNotification }));

  const emptiedRoutes = accepted
    .filter((change) => change.empties)
    .map((change) => ({ id: change.id, route: change.empties }));

  return {
    days,
    driveMinutesDelta,
    regressions,
    notifications,
    emptiedRoutes,
    visitsChangingDay: accepted.filter((change) => change.from?.day !== change.to?.day).length,
    acceptedCount: accepted.length,
    totalCount: changes.length,
    daysOverBudget: days.filter((day) => day.overflowMinutes > 0).length,
  };
};

/**
 * Below the threshold we report "already optimal" rather than offering a
 * reshuffle nobody wants. The percentage scales with route size; the floor stops
 * it nagging on a short day.
 */
export const TRIVIAL_PERCENT = 0.05;
export const TRIVIAL_FLOOR_MINUTES = 10;

export const isTriviallySmall = (savedMinutes, totalMinutes) =>
  Math.abs(savedMinutes) < Math.max(TRIVIAL_FLOOR_MINUTES, totalMinutes * TRIVIAL_PERCENT);

/** Longest bar in the set, so the day bars share one scale including any overrun. */
export const barScaleMinutes = (days = []) =>
  Math.max(MAN_DAY_MINUTES, ...days.map((day) => Math.max(day.baseMinutes, day.afterMinutes)));

/** Reason codes render through templates so they stay translatable and honest. */
export const reasonToKey = (reason) => `obx.runsheet.optimize.reason.${reason.code}`;
