// Mock data for the revamped (grid-v2) schedule calendar. Produces the
// section/row/shift shape consumed by schedules/helper/scheduleResponseAdapter,
// plus the overview KPI stats and month aggregate. Shifts are generated
// relative to the requested window so navigating weeks always shows data.

const OFFICERS = [
  { id: 11, name: 'Mike Ross', imageUrl: 'https://i.pravatar.cc/80?img=12' },
  { id: 12, name: 'Sarah Connor', imageUrl: 'https://i.pravatar.cc/80?img=5' },
  { id: 13, name: 'David Nguyen', imageUrl: 'https://i.pravatar.cc/80?img=15' },
  { id: 14, name: 'Priya Shah', imageUrl: 'https://i.pravatar.cc/80?img=32' },
  { id: 15, name: 'James Okoro', imageUrl: 'https://i.pravatar.cc/80?img=8' },
  { id: 16, name: 'Elena Ruiz', imageUrl: 'https://i.pravatar.cc/80?img=45' },
];

const SITES = [
  { id: 2, name: 'Downtown Plaza' },
  { id: 3, name: 'Harborview Logistics Hub' },
  { id: 1, name: 'EDGE Sync Test Site' },
];

const STATUS_CYCLE = [
  'completed',
  'inProgress',
  'notStarted',
  'unassigned',
  'completed',
  'inProgress',
];

const SHIFT_WINDOWS = [
  { label: 'Morning', startHour: 8, endHour: 16 },
  { label: 'Evening', startHour: 16, endHour: 23 },
  { label: 'Night', startHour: 23, endHour: 31 }, // wraps to next day (+7h)
];

const pad = (n) => String(n).padStart(2, '0');

const toDateKey = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

// Build an ISO datetime `dayOffset` days after `base` at the given hour.
const isoAt = (base, dayOffset, hour) => {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + dayOffset + Math.floor(hour / 24));
  const h = hour % 24;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(h)}:00:00.000Z`;
};

const parseWindowStart = (query = {}) => {
  const raw = query.windowStart || query.startsAt || query.startDate;
  const d = raw ? new Date(raw) : new Date();
  if (Number.isNaN(d.getTime())) return new Date();
  // Normalise to start of that UTC day.
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

let shiftSeq = 1000;

/**
 * Shift id → the row that produced it.
 *
 * The detail endpoints receive only an id, so without this the drawer derived a
 * site arithmetically and could open "EDGE Sync Test Site Route" from a card
 * labelled "Downtown Plaza". Recording what each generated shift belongs to
 * keeps the grid and its drawer telling the same story.
 */
const shiftRegistry = new Map();

const makeShift = (view, site, officer, base, dayOffset, windowIndex, statusIndex) => {
  const win = SHIFT_WINDOWS[windowIndex % SHIFT_WINDOWS.length];
  const status = STATUS_CYCLE[statusIndex % STATUS_CYCLE.length];
  const isUnassigned = status === 'unassigned';
  const startsAt = isoAt(base, dayOffset, win.startHour);
  const endsAt = isoAt(base, dayOffset, win.endHour);
  const id = ++shiftSeq;
  const name = `${win.label} ${view === 'patrol' ? 'Patrol' : 'Guard'}`;
  shiftRegistry.set(String(id), { site, officer: isUnassigned ? null : officer, startsAt, endsAt });
  return {
    id,
    shiftActivityLogId: id,
    name,
    title: name,
    shiftType: view,
    legendType: view,
    status,
    startsAt,
    endsAt,
    start: startsAt,
    end: endsAt,
    site,
    siteName: site.name,
    officer: isUnassigned ? null : officer,
    reassignedOfficer: null,
    runsheetName: view === 'patrol' ? `${site.name} Route` : name,
    isUnassigned,
  };
};

// Build one grid-v2 section (a tab's worth of rows + shifts).
const buildSection = (view, base) => {
  let statusIndex = 0;
  const rows = SITES.map((site, rowIndex) => {
    const shifts = [];
    // A few shifts spread across the week for this row.
    const dayOffsets = [rowIndex % 2, 2 + (rowIndex % 2), 4, 5 + (rowIndex % 2)];
    dayOffsets.forEach((dayOffset, i) => {
      const officer = OFFICERS[(rowIndex * 2 + i) % OFFICERS.length];
      shifts.push(makeShift(view, site, officer, base, dayOffset, i, statusIndex++));
    });
    return {
      id: `${view}-row-${site.id}`,
      key: `site-${site.id}`,
      title: site.name,
      subtitle: view === 'patrol' ? 'Patrol route' : 'Dedicated site',
      sortOrder: rowIndex,
      meta: { locationId: site.id },
      avatar: null,
      shifts,
    };
  });

  const allShifts = rows.flatMap((r) => r.shifts);
  const count = (s) => allShifts.filter((x) => x.status === s).length;
  const legend = {
    dedicated: view === 'dedicated' ? allShifts.length : 0,
    patrol: view === 'patrol' ? allShifts.length : 0,
    extraJob: 1,
    extraRunsheet: 1,
    dispatch: 1,
    completed: count('completed'),
    inProgress: count('inProgress'),
    notStarted: count('notStarted'),
    unassigned: count('unassigned'),
    split: 0,
  };

  return {
    view,
    sections: [
      {
        key: view,
        id: view,
        title: view === 'patrol' ? 'Patrol Shifts' : 'Dedicated Shifts',
        rows,
        locations: SITES.map((s) => ({ id: s.id, name: s.name })),
      },
    ],
    footerStats: {
      legend,
      statuses: {
        completed: legend.completed,
        inProgress: legend.inProgress,
        notStarted: legend.notStarted,
        unassigned: legend.unassigned,
        split: legend.split,
      },
    },
    shifts: allShifts,
  };
};

// Day view consumes a different shape to the week grid: `shifts` keyed by
// location name, plus a flat `locations` list. Without this the day view read an
// array, found no `.length` per key, and rendered "No Shifts Found".
const buildDayView = (view, base) => {
  const grid = buildSection(view, base);
  const shiftsByLocation = {};

  grid.shifts
    .filter((shift) => shift.startsAt.slice(0, 10) === toDateKey(base))
    .forEach((shift) => {
      const key = shift.site.name;
      shiftsByLocation[key] = [...(shiftsByLocation[key] || []), shift];
    });

  // Every site keeps a lane on the day view so empty ones read as "nothing
  // booked" rather than disappearing.
  SITES.forEach((site) => {
    if (!shiftsByLocation[site.name]) shiftsByLocation[site.name] = [];
  });

  return {
    ...grid,
    shifts: shiftsByLocation,
    locations: SITES.map((site) => ({ id: site.id, title: site.name, name: site.name })),
  };
};

/* ------------------------------------------------------------------ visits */

// A visit ("hit" in the API) is one service occurrence at one site: a time
// window on a day. It is the unit of demand, and it exists whether or not a
// runsheet has picked it up — which is exactly why the week grid, whose rows
// are runsheets, could never show the unassigned ones.
const VISIT_WINDOWS = [
  { label: 'Morning', startHour: 8, endHour: 10 },
  { label: 'Midday', startHour: 11, endHour: 13 },
  { label: 'Afternoon', startHour: 14, endHour: 16 },
  { label: 'Evening', startHour: 17, endHour: 19 },
];

/**
 * A routed visit's status, decided by *when it is* and not by a bare cycle.
 *
 * The cycle used to be `completed · completed · inProgress · notStarted · notStarted`
 * applied regardless of date, which produced data that could not be true in either
 * direction: visits three weeks out marked Completed, and visits in the past marked
 * Not Started — which is exactly the reading a planner cannot make sense of, because
 * a scheduled visit whose day has gone did not happen and is therefore missed.
 * `resolveVisitState` now treats past-and-not-started as missed whatever the record
 * says; this makes the record itself honest so the two never disagree.
 *
 *   past    → completed, mostly; some missed (the state has to be demonstrable)
 *   today   → in progress or not started, the only day where either is true
 *   future  → not started. Nothing ahead of now can have happened.
 */
const routedVisitStatus = (dayIndex, statusIndex) => {
  const todayIndex = toDayIndex(new Date());

  if (dayIndex < todayIndex) return statusIndex % 4 === 3 ? 'missed' : 'completed';
  if (dayIndex === todayIndex) return statusIndex % 2 === 0 ? 'inProgress' : 'notStarted';
  return 'notStarted';
};

/**
 * The visits book, as a service cadence rather than a day-by-day schedule.
 *
 * This is the shape of the real business: a site is serviced on an interval
 * measured in weeks or months, so a franchise with dozens of sites still only
 * has a handful of visits in any given week. The previous generator put two
 * visits per site per day, which made the grid dense and made every design
 * decision taken against it wrong — the true pressure on this screen is empty
 * rows, not crowded cells.
 *
 * `intervalDays: null` means the site is on the books with **no recurring
 * schedule at all**. That is the alarming row, and it has to be representable.
 */
const VISIT_SITE_BOOK = [
  // The three sites the other views also use. Kept on the shortest intervals so
  // the current week is never completely empty.
  ['Downtown Plaza', 14, 2],
  ['Harborview Logistics Hub', 14, 3],
  ['EDGE Sync Test Site', 21, 1],

  ['Alderwood Business Park', 14],
  ['Kingsway Retail Centre', 14],
  ['Fairmont Office Tower', 21],
  ['Brookfield Data Centre', 21],
  ['Meridian Hotel', 21],
  ['Northgate Cold Storage', 21],
  ['Riverside Medical Centre', 21],
  ['Sable Ridge Warehouse', 30],
  ['Oakhurst Leisure Club', 30],
  ['Pinecrest Assisted Living', 30],
  ['Vantage Point Labs', 30],
  ['Ironside Manufacturing', 30],
  ['Cedar Mill Campus', 30],
  ['Harlow Distribution Depot', 30],
  ['Southgate Civic Hall', 30],
  ['Ravenswood Print Works', 30],
  ['Tanner Street Studios', 30],
  ['Beaumont Conference Centre', 45],
  ['Clearwater Aquatics', 45],
  ['Dunmore Trade Park', 45],
  ['Elmsworth Academy', 45],
  ['Fenchurch Chambers', 45],
  ['Granby Cold Chain', 45],
  ['Holloway Retail Park', 45],
  ['Inverness Freight Terminal', 45],
  ['Jubilee Sports Complex', 60],
  ['Kelvin Court Offices', 60],
  ['Langford Textiles', 60],
  ['Marchmont Library', 60],
  ['Netherby Care Home', 60],
  ['Ormesby Business Village', 60],
  ['Prescott Bottling Plant', 60],
  ['Quarrywood Depot', 60],
  ['Redhill Chemical Works', 90],
  ['Stanmore Exhibition Hall', 90],
  ['Thornbury Foundry', 90],
  ['Upton Grange Estate', 90],
  ['Verity House', 90],
  ['Wexford Grain Store', 90],
  ['Yarrow Cannery', 120],
  ['Zetland Dockside', 120],
  // On the books with no recurring schedule at all. The alarming rows.
  ['Ashcombe Mill', null],
  ['Bellmont Annexe', null],
];

/**
 * Anchors are derived, not hand-picked: a stride co-prime with the common
 * intervals spreads each site's due-day across its own cycle, so the week does
 * not clump every 30-day site onto the same Monday.
 */
const VISIT_SITES = VISIT_SITE_BOOK.map(([name, intervalDays, fixedId], index) => ({
  id: fixedId ?? 100 + index,
  name,
  intervalDays,
  anchor: intervalDays ? (index * 17) % intervalDays : 0,
}));

/** Fixed anchor so a site's cadence is the same whichever week you navigate to. */
const CADENCE_EPOCH = Date.UTC(2026, 0, 1);

const MS_PER_DAY = 86400000;

const toDayIndex = (date) => Math.round((date.getTime() - CADENCE_EPOCH) / MS_PER_DAY);

const dayIndexToDate = (dayIndex) => new Date(CADENCE_EPOCH + dayIndex * MS_PER_DAY);

/** True when `site` is due on the given absolute day index. */
const isSiteDueOn = (site, dayIndex) => {
  if (!site.intervalDays) return false;
  const offset = dayIndex - site.anchor;
  return offset % site.intervalDays === 0;
};

/**
 * The next day index at or after `fromDayIndex` on which the site is due.
 *
 * This is what answers "when is this site next due" for a quiet row — and note
 * it needs only the schedule, **not** the contracted service interval, which is
 * still an unconfirmed field. The interval is required for compliance ("is this
 * site overdue against its contract"), not for this.
 */
const nextDueDayIndex = (site, fromDayIndex, horizonDays = 400) => {
  if (!site.intervalDays) return null;
  for (let i = 0; i < horizonDays; i++) {
    if (isSiteDueOn(site, fromDayIndex + i)) return fromDayIndex + i;
  }
  return null;
};

/**
 * Assigned / unassigned visit counts for one absolute day, without building the
 * visit objects. The month view is the surface that can actually show a monthly
 * or quarterly rhythm, so its numbers have to come from the same cadence the week
 * grid draws — inventing them made the month view quietly contradict the week.
 */
const visitCountsForDay = (dayIndex) => {
  let assignedCount = 0;
  let unassignedCount = 0;

  VISIT_SITES.forEach((site) => {
    if (!isSiteDueOn(site, dayIndex)) return;
    const plan = planVisitState(Math.abs(site.id * 31 + dayIndex));
    if (plan === 'unassigned' || plan === 'blockedNoTour') unassignedCount += 1;
    else assignedCount += 1;
  });

  return { assignedCount, unassignedCount };
};

/** Visit id → the row that produced it. Same purpose as `shiftRegistry`. */
const visitRegistry = new Map();

/** Day-view group holding visits with no route, kept first in the list. */
const UNASSIGNED_DAY_GROUP = 'Unassigned';

/**
 * Which of the eight visit states this occurrence should demonstrate.
 *
 * The demo has to be able to show every state the grid can draw, otherwise the
 * treatments are unverifiable. Terminal and blocked states are sprinkled on
 * co-prime intervals so no two collide on a predictable cycle.
 */
const planVisitState = (sequence) => {
  if (sequence % 17 === 0) return 'cancelled';
  if (sequence % 7 === 0) return 'missed';
  if (sequence % 9 === 0) return 'blockedNoTour';
  if (sequence % 5 === 0) return 'unassigned';
  if (sequence % 13 === 0) return 'insertedAfterStart';
  return 'routed';
};

/** ISO datetime for an absolute day index at the given hour. */
const isoAtDayIndex = (dayIndex, hour) => {
  const d = dayIndexToDate(dayIndex);
  d.setUTCDate(d.getUTCDate() + Math.floor(hour / 24));
  const h = ((hour % 24) + 24) % 24;
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(h)}:00:00.000Z`;
};

/**
 * A visit's identity is derived from *what it is* — this site, on this date — not
 * from a call counter. The counter meant every fetch minted new ids, so the same
 * visit changed identity when you navigated away and back, and the registry the
 * drawer reads from grew without bound.
 */
const visitIdFor = (site, dayIndex) => 500000 + site.id * 10000 + (dayIndex + 5000);

const makeVisit = ({ site, dayIndex, windowIndex, officer, statusIndex, sequence }) => {
  const win = VISIT_WINDOWS[windowIndex % VISIT_WINDOWS.length];
  const id = visitIdFor(site, dayIndex);
  const plan = planVisitState(sequence);

  // Blocked visits have no tour, so nothing has ever picked them up; the two
  // unrouted plans are the two rows of the pinned band.
  const assigned = plan !== 'unassigned' && plan !== 'blockedNoTour';

  const routedStatus = routedVisitStatus(dayIndex, statusIndex);

  /* An insert mid-route only exists while a route is running, so it is a *today*
     state. Forcing `inProgress` on any day the plan happened to land on put routes
     "in progress" three weeks out and three weeks back. */
  const isToday = dayIndex === toDayIndex(new Date());
  const insertedNow = plan === 'insertedAfterStart' && isToday;

  const status =
    plan === 'cancelled'
      ? 'cancelled'
      : plan === 'missed'
        ? 'missed'
        : assigned
          ? insertedNow
            ? 'inProgress'
            : routedStatus
          : 'unassigned';

  // A route that is under way is what makes an insert material (D3): the driver
  // has already left, so a stop added now was not in the plan they set off with.
  const runsheetStarted = status === 'inProgress';
  const startsAt = isoAtDayIndex(dayIndex, win.startHour);
  const endsAt = isoAtDayIndex(dayIndex, win.endHour);

  visitRegistry.set(String(id), {
    site,
    assigned,
    status,
    plan,
    officer: assigned ? officer : null,
    startsAt,
    endsAt,
    windowLabel: win.label,
  });

  return {
    id,
    hitId: id,
    shiftActivityLogId: id,
    name: `${win.label} visit`,
    title: `${win.label} visit`,
    shiftType: 'hit',
    legendType: 'hit',
    status,
    scheduleStatus: status,
    startsAt,
    endsAt,
    start: startsAt,
    end: endsAt,
    site,
    siteName: site.name,
    officer: assigned ? officer : null,
    reassignedOfficer: null,
    runsheetName: assigned ? `${site.name} Route` : null,
    runsheetId: assigned ? 700 + site.id : null,
    isUnassigned: !assigned,
    requiresAttention: !assigned,
    // Explicit, because the grid must not infer "no tour" from a missing field —
    // see `isBlockedWithoutTour` in helper/visitState.js.
    hasTour: plan !== 'blockedNoTour',
    runsheetStartedAt: runsheetStarted ? isoAtDayIndex(dayIndex, win.startHour - 1) : null,
    addedAfterRouteStart: insertedNow,
  };
};

/**
 * A window of visits, generated from each site's service cadence.
 *
 * Most sites produce nothing in a given week — that is the point. Every site
 * still gets a row, carrying `nextVisitAt` so a quiet row can say when the site
 * is next due instead of just "0". Empty rows are the bulk of this screen, so
 * they had better be worth their space.
 */
const buildVisitsSection = (base, { days = 7 } = {}) => {
  const startDayIndex = toDayIndex(base);
  const endDayIndex = startDayIndex + days - 1;

  const unassigned = [];
  const bySite = new Map(VISIT_SITES.map((site) => [site.id, []]));

  VISIT_SITES.forEach((site) => {
    for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
      if (!isSiteDueOn(site, dayIndex)) continue;

      // Seeded from site + date so a visit keeps the same state and technician
      // however you reach it — week, day, month or the drawer.
      const seed = site.id * 31 + dayIndex;
      const visit = makeVisit({
        site,
        dayIndex,
        windowIndex: seed,
        officer: OFFICERS[Math.abs(seed) % OFFICERS.length],
        statusIndex: Math.abs(seed),
        sequence: Math.abs(seed),
      });

      if (visit.isUnassigned) unassigned.push(visit);
      else bySite.get(site.id).push(visit);
    }
  });

  const siteRows = VISIT_SITES.map((site, index) => {
    const shifts = bySite.get(site.id);
    const nextDue = shifts.length ? null : nextDueDayIndex(site, endDayIndex + 1);

    return {
      id: `visits-site-${site.id}`,
      key: `site-${site.id}`,
      title: site.name,
      sortOrder: index,
      meta: {
        locationId: site.id,
        visitCount: shifts.length,
        intervalDays: site.intervalDays,
        // Absent when the site has no future visit at all — a site that has
        // fallen off the schedule, which is the one worth surfacing.
        nextVisitAt: nextDue == null ? null : isoAtDayIndex(nextDue, VISIT_WINDOWS[0].startHour),
      },
      shifts,
    };
  });

  const rows = [
    {
      id: 'visits-unassigned',
      key: 'unassigned',
      title: 'Unassigned',
      subtitle: `${unassigned.length} awaiting a route`,
      sortOrder: -1,
      meta: { isUnassignedDemand: true, visitCount: unassigned.length },
      shifts: unassigned,
    },
    ...siteRows,
  ];

  const allVisits = rows.flatMap((row) => row.shifts);
  const servicedSiteCount = siteRows.filter((row) => row.shifts.length > 0).length;
  const count = (status) => allVisits.filter((visit) => visit.status === status).length;

  const legend = {
    dedicated: 0,
    patrol: allVisits.length - unassigned.length,
    extraJob: 0,
    extraRunsheet: unassigned.length,
    dispatch: 0,
    completed: count('completed'),
    inProgress: count('inProgress'),
    notStarted: count('notStarted'),
    unassigned: unassigned.length,
    missed: count('missed'),
    cancelled: count('cancelled'),
    split: 0,
    // Density, as a number: how much of the site list this week actually touches.
    sitesServiced: servicedSiteCount,
    sitesTotal: siteRows.length,
  };

  return {
    view: 'visits',
    sections: [
      {
        key: 'visits',
        id: 'visits',
        title: 'Visits',
        rows,
        locations: VISIT_SITES.map((site) => ({ id: site.id, name: site.name })),
      },
    ],
    footerStats: {
      legend,
      statuses: {
        completed: legend.completed,
        inProgress: legend.inProgress,
        notStarted: legend.notStarted,
        unassigned: legend.unassigned,
        missed: legend.missed,
        cancelled: legend.cancelled,
        split: 0,
      },
    },
    unassignedCount: unassigned.length,
    shifts: allVisits,
  };
};

/**
 * Honour `shiftStatus` so the status dropdown, the "require assignment" pill and
 * the footer counts visibly change the grid. Rows are kept even when they empty
 * out, so the grid does not reshuffle underneath the user as they filter.
 */
const STATUS_QUERY_ALIASES = { requiresAttention: 'unassigned' };

const filterGridByStatus = (grid, shiftStatus) => {
  if (!shiftStatus) return grid;

  const wanted = STATUS_QUERY_ALIASES[shiftStatus] || shiftStatus;
  const matches = (shift) => shift.status === wanted;

  const sections = (grid.sections || []).map((section) => ({
    ...section,
    rows: (section.rows || []).map((row) => ({
      ...row,
      shifts: (row.shifts || []).filter(matches),
    })),
  }));

  return {
    ...grid,
    sections,
    shifts: (grid.shifts || []).filter(matches),
  };
};

/**
 * Visits for a single day, grouped by site with unassigned demand first — the
 * same ordering the week grid uses, so moving between them is not disorienting.
 */
const buildVisitsDayView = (base) => {
  const grid = buildVisitsSection(base, { days: 1 });
  const dayKey = toDateKey(base);
  const forToday = (grid.shifts || []).filter((visit) => visit.startsAt.slice(0, 10) === dayKey);

  const unassigned = forToday.filter((visit) => visit.isUnassigned);
  const shiftsByLocation = {};

  if (unassigned.length) shiftsByLocation[UNASSIGNED_DAY_GROUP] = unassigned;

  /* Unlike the week grid, the day view lists **only** the sites being serviced
     today. A quiet row earns its place on a planning surface — it says "this site
     exists and is next due on the 12th". On an execution surface it says nothing
     the week grid did not already say, and twenty empty sections would bury the
     three that matter. */
  const servicedSites = VISIT_SITES.filter((site) =>
    forToday.some((visit) => !visit.isUnassigned && visit.site.id === site.id),
  );

  servicedSites.forEach((site) => {
    shiftsByLocation[site.name] = forToday.filter(
      (visit) => !visit.isUnassigned && visit.site.id === site.id,
    );
  });

  return {
    ...grid,
    shifts: shiftsByLocation,
    locations: [
      ...(unassigned.length
        ? [{ id: null, title: UNASSIGNED_DAY_GROUP, name: UNASSIGNED_DAY_GROUP }]
        : []),
      ...servicedSites.map((site) => ({ id: site.id, title: site.name, name: site.name })),
    ],
  };
};

export const buildScheduleSummary = (query = {}) => {
  const base = parseWindowStart(query);
  const isDayView = query.isDayView === true || query.isDayView === 'true';

  if (query.view === 'visits') {
    return isDayView
      ? buildVisitsDayView(base)
      : filterGridByStatus(buildVisitsSection(base), query.shiftStatus);
  }

  const view = query.view === 'dedicated' ? 'dedicated' : 'patrol';

  if (isDayView) {
    return buildDayView(view, base);
  }

  return filterGridByStatus(buildSection(view, base), query.shiftStatus);
};

// Overview KPI stats. buildOverviewFooterStats spreads this object as
// `footerStats.overview`, and the footer mapper reads coverage / scheduledOfficers
// / hoursCompleted etc. from the top level here.
export const buildScheduleStats = () => ({
  coverage: { percentage: 78 },
  scheduledOfficers: { scheduled: 12, total: 15 },
  hoursCompleted: { completed: 284, total: 360 },
  overtimeHours: 12,
  runsheetsCompleted: { completed: 18, total: 24 },
  patrolVisitsCompleted: { completed: 96, total: 120 },
  dispatchCompleted: { completed: 7, total: 9 },
});

/* ------------------------------------------------- runsheet / visit detail */

/**
 * Detail payloads for the side drawers.
 *
 * Neither endpoint was mocked, so both fell through to a generic handler and
 * the drawers rendered with no title, no route, an empty visit list and
 * "Undefined" totals. Shapes here follow what the drawers actually read:
 * `runsheetDetails.{runsheetName,hits,startEndLocation}` plus the roll-ups the
 * header and stat row show.
 */
const SITE_ADDRESSES = {
  1: '2400 Sync Parkway, Tampa, FL, USA',
  2: '118 Downtown Plaza, Tampa, FL, USA',
  3: '9 Harborview Road, Tampa, FL, USA',
};

/**
 * Street lines for the wider site book, derived from the site name so the drawer
 * has a real location to show. Two sites are left without one on purpose — the
 * "no address" fallback (case 4.6) still needs something to exercise it.
 */
const STREET_TYPES = ['Street', 'Road', 'Avenue', 'Way', 'Lane', 'Drive'];
VISIT_SITES.forEach((site, index) => {
  if (SITE_ADDRESSES[site.id] || site.name === 'Ashcombe Mill') return;
  const number = 10 + ((index * 37) % 340);
  const street = site.name.split(' ')[0];
  const type = STREET_TYPES[index % STREET_TYPES.length];
  SITE_ADDRESSES[site.id] = `${number} ${street} ${type}, Tampa, FL, USA`;
});

const siteForRunsheet = (runsheetId) => {
  const numeric = Number(String(runsheetId).replace(/\D/g, '')) || 0;
  return SITES[numeric % SITES.length];
};

const buildVisitRow = ({ site, base, dayOffset, windowIndex, index, isVisited }) => {
  const win = VISIT_WINDOWS[windowIndex % VISIT_WINDOWS.length];
  const hitId = 6000 + index;

  return {
    hitId,
    id: hitId,
    siteId: site.id,
    siteName: site.name,
    name: site.name,
    address: SITE_ADDRESSES[site.id],
    order: index + 1,
    startsAt: isoAt(base, dayOffset, win.startHour),
    endsAt: isoAt(base, dayOffset, win.endHour),
    windowStart: isoAt(base, dayOffset, win.startHour),
    windowEnd: isoAt(base, dayOffset, win.endHour),
    duration: 45,
    visitType: 'Filter replacement',
    isVisited,
    status: isVisited ? 'completed' : 'notStarted',
    instructions: '<p>Use the loading bay entrance. Report any damaged housings.</p>',
    tour: {
      tourReportName: 'Filter Replacement Report',
      reportId: isVisited ? 900 + index : null,
      checkpoints: [
        { id: 1, type: 'nfc', location: { locationName: 'Roof plant room — AHU-1' } },
        { id: 2, type: 'qr', location: { locationName: 'Level 3 riser — AHU-2' } },
      ],
    },
  };
};

export const buildRunsheetShiftDetail = (runsheetId, query = {}) => {
  const base = parseWindowStart({ windowStart: query.startsAt });
  // Prefer the row the grid actually rendered; fall back to a deterministic
  // pick for ids this session never generated (a deep link, say).
  const known = shiftRegistry.get(String(runsheetId));
  const site = known?.site || siteForRunsheet(runsheetId);
  const officer =
    known?.officer ?? OFFICERS[Number(String(runsheetId).replace(/\D/g, '')) % OFFICERS.length];

  // Three stops, the first already served — enough to exercise the ordered
  // list, the visited/unvisited split and the "N of M done" roll-up.
  const hits = [
    buildVisitRow({
      site: SITES[0],
      base,
      dayOffset: 0,
      windowIndex: 0,
      index: 0,
      isVisited: true,
    }),
    buildVisitRow({
      site: SITES[1],
      base,
      dayOffset: 0,
      windowIndex: 1,
      index: 1,
      isVisited: false,
    }),
    buildVisitRow({
      site: SITES[2],
      base,
      dayOffset: 0,
      windowIndex: 2,
      index: 2,
      isVisited: false,
    }),
  ];

  const visitedHit = hits.filter((hit) => hit.isVisited).length;

  return {
    id: runsheetId,
    runsheetId,
    shiftType: 'patrol',
    scheduleStatus: 'inProgress',
    shiftStatus: 'shiftStarted',
    startsAt: query.startsAt || isoAt(base, 0, 8),
    endsAt: query.endsAt || isoAt(base, 0, 16),
    site,
    siteName: site.name,
    officer,
    vehicle: { id: 41, name: 'Van 12 — FL 4821 KQ', images: [] },
    totalHits: hits.length,
    visitedHit,
    missingHits: 0,
    runsheetDetails: {
      runsheetName: `${site.name} Route`,
      runsheetId,
      startsAt: query.startsAt || isoAt(base, 0, 8),
      endsAt: query.endsAt || isoAt(base, 0, 16),
      autoClockoutOff: false,
      hits,
      startEndLocation: {
        name: 'Tampa Depot',
        address: '1200 Depot Way, Tampa, FL, USA',
        lat: 27.9506,
        lng: -82.4572,
        isVisited: false,
      },
    },
    // Straight-line legs only; the drawer reads distance/duration totals from
    // the first entry and per-leg values for the covered roll-up.
    pathData: [
      {
        hitId: null,
        totalDistance: 41800,
        totalDuration: 190,
        distance: { value: 0 },
        duration: { value: 0 },
        mapPath: '',
      },
      { hitId: hits[0].hitId, distance: { value: 12400 }, duration: { value: 55 }, mapPath: '' },
      { hitId: hits[1].hitId, distance: { value: 15200 }, duration: { value: 70 }, mapPath: '' },
      { hitId: hits[2].hitId, distance: { value: 14200 }, duration: { value: 65 }, mapPath: '' },
    ],
  };
};

/** Detail for one visit, opened from the visits grid or a runsheet's stop list. */
export const buildVisitDetail = (hitId, query = {}) => {
  const base = parseWindowStart({ windowStart: query.startsAt });
  const numeric = Number(String(hitId).replace(/\D/g, '')) || 0;
  const known = visitRegistry.get(String(hitId));

  /* A visit id encodes the site and the date it belongs to (see `visitIdFor`), so
     the drawer can reconstruct the visit even on a cold load where the grid was
     never fetched and the registry is empty. Previously it derived the site
     arithmetically from the id and contradicted the card that opened it. */
  const decoded = (() => {
    if (numeric < 500000) return null;
    const rest = numeric - 500000;
    const siteId = Math.floor(rest / 10000);
    const site = VISIT_SITES.find((candidate) => candidate.id === siteId);
    if (!site) return null;
    return { site, dayIndex: (rest % 10000) - 5000 };
  })();

  const site = known?.site || decoded?.site || SITES[numeric % SITES.length];

  const decodedPlan = decoded
    ? planVisitState(Math.abs(decoded.site.id * 31 + decoded.dayIndex))
    : null;
  const decodedAssigned =
    decodedPlan == null ? null : decodedPlan !== 'unassigned' && decodedPlan !== 'blockedNoTour';

  const isAssigned = known
    ? known.assigned
    : (decodedAssigned ?? (Boolean(query.runsheetId) || numeric % 5 !== 0));
  const officer = known?.officer ?? OFFICERS[numeric % OFFICERS.length];
  const status = known?.status || (isAssigned ? 'notStarted' : 'unassigned');

  // The drawer has to resolve to the same state as the card that opened it, so
  // the state-bearing fields come from the registry first, then from the id.
  const plan = known?.plan || decodedPlan || 'routed';
  const hasTour = plan !== 'blockedNoTour';
  const routeStartedAt = status === 'inProgress' ? known?.startsAt || null : null;

  return {
    hitId,
    id: hitId,
    siteId: site.id,
    siteName: site.name,
    name: site.name,
    address: SITE_ADDRESSES[site.id],
    startsAt: known?.startsAt || query.startsAt || isoAt(base, 0, 9),
    endsAt: known?.endsAt || query.endsAt || isoAt(base, 0, 11),
    windowStart: known?.startsAt || query.startsAt || isoAt(base, 0, 9),
    windowEnd: known?.endsAt || query.endsAt || isoAt(base, 0, 11),
    duration: 45,
    visitType: 'Filter replacement',
    scheduleStatus: status,
    hitStatus: status,
    isVisited: status === 'completed',
    isUnassigned: !isAssigned,
    runsheetId: isAssigned ? query.runsheetId || 700 + site.id : null,
    runsheetName: isAssigned ? `${site.name} Route` : null,
    officer: isAssigned ? officer : null,
    vehicle: isAssigned ? { id: 41, name: 'Van 12 — FL 4821 KQ', images: [] } : null,
    instructions: '<p>Use the loading bay entrance. Report any damaged housings.</p>',
    hasTour,
    runsheetStartedAt: routeStartedAt,
    addedAfterRouteStart: plan === 'insertedAfterStart',
    tour: hasTour
      ? {
          tourReportName: 'Filter Replacement Report',
          reportId: null,
          checkpoints: [
            { id: 1, type: 'nfc', location: { locationName: 'Roof plant room — AHU-1' } },
            { id: 2, type: 'qr', location: { locationName: 'Level 3 riser — AHU-2' } },
          ],
        }
      : null,
  };
};

/**
 * Month view aggregate. `getDutiesByMonth` walks `shifts[]`, and for each entry
 * reads every value that carries a `type` plus assigned/unassigned counts — so
 * one row per date, with a keyed object per duty type.
 */
export const buildScheduleAggregate = (query = {}, { services = {} } = {}) => {
  const base = parseWindowStart(query);
  const shifts = [];
  let unassignedTotal = 0;

  // A tenant that does not sell a service should never see it on the month
  // view — Filter Go sells filter replacement only.
  const includePatrol = services.patrol !== false;
  const includeDedicated = services.dedicated === true;

  for (let i = 0; i < 35; i++) {
    const d = new Date(base.getTime());
    d.setUTCDate(d.getUTCDate() + i);
    const date = toDateKey(d);

    const entry = { date };

    if (includePatrol) {
      const { assignedCount, unassignedCount } = visitCountsForDay(toDayIndex(d));
      unassignedTotal += unassignedCount;
      entry.patrol = {
        type: 'patrol',
        assignedCount,
        unassignedCount,
        requiresAttention: unassignedCount > 0,
      };
    }

    if (includeDedicated) {
      const assignedCount = (i + 1) % 4;
      const unassignedCount = i % 6 === 0 ? 1 : 0;
      unassignedTotal += unassignedCount;
      entry.dedicated = {
        type: 'dedicated',
        assignedCount,
        unassignedCount,
        requiresAttention: unassignedCount > 0,
      };
    }

    shifts.push(entry);
  }

  return { shifts, unassignedCount: unassignedTotal };
};

// Missed visits list. Only the count endpoint was mocked before, so the list
// request fell through to a generic handler and returned an object — which the
// drawer then tried to `.map`.
const MISSED_HITS = [
  { site: SITES[0], hitName: 'Visit 3', dayOffset: 1, startHour: 9, endHour: 10 },
  { site: SITES[1], hitName: 'Visit 1', dayOffset: 2, startHour: 13, endHour: 14 },
  { site: SITES[2], hitName: 'Visit 5', dayOffset: 3, startHour: 18, endHour: 19 },
];

export const buildMissedHits = (query = {}) => {
  const base = parseWindowStart(query);

  return MISSED_HITS.map((entry, index) => ({
    hitId: 9100 + index,
    hitName: entry.hitName,
    siteId: entry.site.id,
    siteName: entry.site.name,
    runsheetName: `${entry.site.name} Route`,
    startsAt: isoAt(base, entry.dayOffset, entry.startHour),
    endsAt: isoAt(base, entry.dayOffset, entry.endHour),
    status: 'missed',
  }));
};

export const buildMissedHitsCount = () => ({ missedHitsCount: MISSED_HITS.length });
