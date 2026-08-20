/**
 * Demo fixtures for the route optimization review screen.
 *
 * A proposal is one object whatever the scope — a sequence proposal is a week
 * proposal with one route and no day moves in it. Everything the review screen
 * renders comes from here; nothing is written anywhere.
 *
 * `dayImpact` is the source of truth for the maths. A change's own saving is
 * always the sum of its impacts, so the headline and the day bars can never
 * disagree with the rows that produced them.
 */

export const MAN_DAY_MINUTES = 8 * 60;

export const CHANGE_TYPE = {
  MOVE_DAY: 'moveDay',
  MOVE_ROUTE: 'moveRoute',
  REORDER: 'reorder',
  EMPTIED: 'emptied',
};

/** Glyph plus word — type is never carried by colour alone. */
export const CHANGE_MARK = {
  [CHANGE_TYPE.MOVE_DAY]: { glyph: '⇄', tone: 'warn' },
  [CHANGE_TYPE.MOVE_ROUTE]: { glyph: '⇢', tone: 'neutral' },
  [CHANGE_TYPE.REORDER]: { glyph: '↕', tone: 'brand' },
  [CHANGE_TYPE.EMPTIED]: { glyph: '○', tone: 'neutral' },
};

export const OPTIMIZE_MODE = {
  TIGHTEST: 'tightest',
  EVEN: 'evenDays',
  CATCH_UP: 'catchUp',
};

/** Whether a proposal changes one week or the recurring pattern. */
export const EFFECT_SCOPE = {
  ONCE: 'once',
  STANDING: 'standing',
};

export const WEEK = [
  { key: 'mon', label: 'Mon', date: '25 Aug', baseMinutes: 380, routes: 1 },
  { key: 'tue', label: 'Tue', date: '26 Aug', baseMinutes: 435, routes: 2 },
  { key: 'wed', label: 'Wed', date: '27 Aug', baseMinutes: 452, routes: 1 },
  { key: 'thu', label: 'Thu', date: '28 Aug', baseMinutes: 395, routes: 1 },
  { key: 'fri', label: 'Fri', date: '29 Aug', baseMinutes: 283, routes: 1 },
];

/** Tuesday's routes, for the day scope. Base minutes sum to Tuesday's 435. */
export const TUE_ROUTES = [
  { key: 'north', label: 'Tuesday North', date: 'Alex Green', baseMinutes: 285, routes: 1 },
  { key: 'south', label: 'Tuesday South', date: 'Alex Green', baseMinutes: 150, routes: 1 },
];

/**
 * Reasons are codes plus their numbers, rendered through templates — so the
 * explanation is literally the term that moved the cost, and stays true when
 * the weights change.
 */
export const MOCK_CHANGES = [
  {
    id: 'c1',
    type: CHANGE_TYPE.MOVE_DAY,
    site: 'Kiln Lane Industrial',
    unit: 'Unit 9',
    group: 'tue',
    from: { day: 'Wed', route: 'Wednesday East', position: 3 },
    to: { day: 'Tue', route: 'Tuesday North', position: 4 },
    dayImpact: { wed: -57, tue: 35 },
    routeImpact: { north: 35 },
    reasons: [
      { code: 'clusterProximity', minutes: -22 },
      { code: 'serviceWindowOk', used: 24, of: 30 },
    ],
  },
  {
    id: 'c2',
    type: CHANGE_TYPE.REORDER,
    site: 'Oak Plaza',
    unit: 'Unit 2',
    group: 'tue',
    from: { day: 'Tue', route: 'Tuesday North', position: 1 },
    to: { day: 'Tue', route: 'Tuesday North', position: 3 },
    dayImpact: { tue: -11 },
    routeImpact: { north: -11 },
    reasons: [{ code: 'servedBefore', site: 'Mill Road Retail', minutes: -11 }],
  },
  {
    id: 'c3',
    type: CHANGE_TYPE.REORDER,
    site: 'Harbour Way Offices',
    unit: 'Unit 3',
    group: 'tue',
    from: { day: 'Tue', route: 'Tuesday North', position: 2 },
    to: { day: 'Tue', route: 'Tuesday North', position: 6 },
    dayImpact: { tue: -18 },
    routeImpact: { north: -18 },
    reasons: [{ code: 'clusterProximity', minutes: -18 }],
    /* Saves time and still costs something a planner has to weigh. */
    regression: { code: 'arrivalMoved', was: '09:15', now: '15:40' },
    requiresNotification: { contact: 'Harbour Way Offices', reason: 'arrivalMoved' },
  },
  {
    id: 'c4',
    type: CHANGE_TYPE.MOVE_ROUTE,
    site: 'Bayside Clinic',
    unit: 'Unit 4',
    group: 'tue',
    from: { day: 'Tue', route: 'Tuesday South', position: 1 },
    to: { day: 'Tue', route: 'Tuesday North', position: 5 },
    dayImpact: { tue: -14 },
    routeImpact: { south: -64, north: 50 },
    reasons: [{ code: 'sameCluster', route: 'Tuesday North', minutes: -14 }],
    /* Consequence rows appear only once their trigger is accepted. */
    empties: 'Tuesday South',
  },
  {
    id: 'c5',
    type: CHANGE_TYPE.REORDER,
    site: 'Crestwood Labs',
    unit: 'Unit 5',
    group: 'tue',
    from: { day: 'Tue', route: 'Tuesday North', position: 4 },
    to: { day: 'Tue', route: 'Tuesday North', position: 2 },
    dayImpact: { tue: -9 },
    routeImpact: { north: -9 },
    reasons: [{ code: 'clusterProximity', minutes: -9 }],
  },
  {
    id: 'c6',
    type: CHANGE_TYPE.MOVE_DAY,
    site: 'Fen Court',
    unit: 'Unit 4',
    group: 'wed',
    from: { day: 'Wed', route: 'Wednesday East', position: 5 },
    to: { day: 'Thu', route: 'Thursday Central', position: 2 },
    dayImpact: { wed: -62, thu: 45 },
    reasons: [
      { code: 'clusterProximity', minutes: -17 },
      { code: 'serviceWindowOk', used: 27, of: 30 },
    ],
  },
  {
    id: 'c7',
    type: CHANGE_TYPE.MOVE_DAY,
    site: 'Riverwalk Hotel',
    unit: 'Unit 2',
    group: 'fri',
    from: { day: 'Fri', route: 'Friday West', position: 2 },
    to: { day: 'Thu', route: 'Thursday Central', position: 5 },
    dayImpact: { fri: -71, thu: 58 },
    reasons: [
      { code: 'clusterProximity', minutes: -13 },
      { code: 'serviceWindowOk', used: 29, of: 30 },
    ],
    requiresNotification: { contact: 'Riverwalk Hotel', reason: 'dayChanged' },
  },
  {
    id: 'c8',
    type: CHANGE_TYPE.MOVE_DAY,
    site: 'Parkway Business Centre',
    unit: 'Unit 8',
    group: 'fri',
    from: { day: 'Fri', route: 'Friday West', position: 4 },
    to: { day: 'Mon', route: 'Monday Ridge', position: 3 },
    dayImpact: { fri: -59, mon: 40 },
    reasons: [
      { code: 'clusterProximity', minutes: -19 },
      { code: 'earlyReplacement', days: 4 },
    ],
    regression: { code: 'filterLife', days: 4 },
  },
];

/** Stops the solver was not allowed to consider, and who said so. */
export const MOCK_HELD = [
  {
    id: 'h1',
    site: 'Depot Street Works',
    unit: 'Unit 7',
    group: 'tue',
    level: 'day',
    by: 'A. Qamar',
    at: '6 Aug',
    reason: 'Client only accepts Tuesday mornings',
  },
  {
    id: 'h2',
    site: 'Mill Road Retail',
    unit: 'Unit 1',
    group: 'tue',
    level: 'position',
    by: null,
    at: null,
    /* A lock the planner did not set, so it has to explain itself. */
    reason: 'Already sent to the installer’s device',
  },
];

/** Named intents rather than weight sliders. Each states its cost, not just its benefit. */
export const MODE_OPTIONS = [
  { value: OPTIMIZE_MODE.TIGHTEST, labelKey: 'modeTightest', hintKey: 'modeTightestHint' },
  { value: OPTIMIZE_MODE.EVEN, labelKey: 'modeEven', hintKey: 'modeEvenHint' },
  { value: OPTIMIZE_MODE.CATCH_UP, labelKey: 'modeCatchUp', hintKey: 'modeCatchUpHint' },
];

export const PROPOSAL_META = {
  solvedAt: '14:02',
  basis: 'plan@81',
  range: 'Mon 25 – Fri 29 Aug',
  effectiveFrom: 'Mon 1 Sep',
};

/** The near-miss returned instead of "no solution found". */
export const MOCK_BLOCKER = {
  site: 'Harbour Way Offices',
  windowStart: '07:00',
  windowEnd: '09:00',
  earliestArrival: '10:24',
  lockedBy: 'A. Qamar',
};

export const MOCK_STALE = {
  who: 'R. Ahmed',
  what: 'added 2 visits to Wednesday East',
  conflictingChangeIds: ['c1'],
};
