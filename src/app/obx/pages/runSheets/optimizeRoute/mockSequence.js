/**
 * Demo fixture for the smallest scope: reordering the stops inside one route.
 *
 * This is the live-route case, so most of the interest is in what *can't* move.
 * Completed and in-progress stops are frozen, and the stop the technician has
 * already been sent is locked by the system rather than by the planner — which
 * is why it has to explain itself.
 */

export const SEQUENCE_ROUTE = {
  name: 'Tuesday North',
  date: 'Tue 26 Aug',
  live: true,
  savedMinutes: 23,
  finishWas: '16:02',
  finishNow: '15:39',
  elapsedMinutes: 235,
  remainingMinutes: 245,
};

export const STOP_STATE = {
  DONE: 'done',
  IN_PROGRESS: 'inProgress',
  MOVED: 'moved',
  SAME: 'same',
  LOCKED: 'locked',
};

/** Array order is the proposed order; `was` is where each stop sits today. */
export const SEQUENCE_STOPS = [
  {
    id: 'q1',
    site: 'Elm Court',
    unit: 'Unit 3',
    state: STOP_STATE.DONE,
    was: 1,
    arrival: '08:40',
  },
  {
    id: 'q2',
    site: 'Oak Plaza',
    unit: 'Unit 2',
    state: STOP_STATE.IN_PROGRESS,
    was: 2,
    arrival: '09:20',
  },
  {
    id: 'q3',
    site: 'Mill Road Retail',
    unit: 'Unit 1',
    state: STOP_STATE.MOVED,
    was: 5,
    arrival: '10:35',
    deltaMinutes: -14,
    reason: { code: 'servedBefore', site: 'Depot Street Works', minutes: 14 },
  },
  {
    id: 'q4',
    site: 'Depot Street Works',
    unit: 'Unit 7',
    state: STOP_STATE.SAME,
    was: 3,
    arrival: '11:52',
  },
  {
    id: 'q5',
    site: 'Crestwood Labs',
    unit: 'Unit 5',
    state: STOP_STATE.MOVED,
    was: 6,
    arrival: '12:40',
    deltaMinutes: -9,
    reason: { code: 'clusterProximity', minutes: 9 },
  },
  {
    id: 'q6',
    site: 'Harbour Way Offices',
    unit: 'Unit 3',
    state: STOP_STATE.LOCKED,
    was: 4,
    arrival: '13:10',
    /* A lock the planner did not set — so the tooltip has to say why, not just that. */
    lockReason: 'Already sent to the technician’s device',
  },
];

export const isFrozen = (stop) =>
  stop.state === STOP_STATE.DONE || stop.state === STOP_STATE.IN_PROGRESS;
