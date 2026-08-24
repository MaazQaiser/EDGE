// Mock data for the revamped (grid-v2) schedule calendar. Produces the
// section/row/shift shape consumed by schedules/helper/scheduleResponseAdapter,
// plus the overview KPI stats and month aggregate. Shifts are generated
// relative to the requested window so navigating weeks always shows data.

import { serviceMinutesForFilters } from 'src/utils/constants/serviceTime';

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

/**
 * The routes this franchise runs, named the way the schedule UI names them.
 *
 * A route is a *round* — one vehicle's ordered list of stops — so its name
 * describes the round, not the site. The mock used to derive `"<Site> Route"`,
 * which invented one route per site and made every visit card repeat the site
 * name its own row already carried; on a one-day-column card that name was also
 * the first thing to truncate, so the line carried no information at all.
 *
 * One list, exported, because the card, the visit drawer's "move to route"
 * dropdown and the Routes page all have to name the same routes — a planner who
 * reads "Night Shift Patrols" on a card must be able to find it in the list.
 */
export const ROUTE_NAMES = [
  'Day Time Patrols',
  'Holiday Event Runsheet',
  'Night Shift Patrols',
  'Orlando Day Time Runsheet',
  'Patrol Runsheet',
  'Runsheet Extras',
  'Weekend Special Operations',
];

/**
 * Which route covers this site.
 *
 * Derived from the site id rather than assigned at random, so every surface —
 * grid, drawer, missed-visit list — names the same route for the same site, and
 * so several sites share a route the way a real round does.
 */
const routeForSite = (site = {}) => {
  const index = Math.abs(Number(site.id) || 0) % ROUTE_NAMES.length;
  return { id: 700 + index, name: ROUTE_NAMES[index] };
};

/**
 * The **variety** a shift row wants, not the status it gets — see `shiftStatusFor`,
 * which is what `makeShift` actually calls.
 *
 * Read straight, this cycle is date-blind: `statusIndex` counts shifts as they are
 * generated, so a week three weeks out came back "4 Completed, 4 In Progress" in its
 * footer counts and in the status filter. Kept as the source of *spread* — four
 * distinct readings across a row, and which rows are unassigned — with the date now
 * deciding what each one is allowed to mean.
 */
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

/**
 * Nothing in this book is booked before noon UTC — the visit windows run 13:00 to
 * 24:00, which is 08:00–19:00 in the franchise's timezone. So a window boundary
 * that lands in the small hours cannot be the close of *that* day's work.
 */
const WINDOW_END_MIN_HOUR_UTC = 12;

/**
 * The last day the caller asked for, **inclusive**, or `null` when it named none.
 *
 * `windowEnd` is the last *visible date* of the grid, so a window naming
 * 2026-08-29 has to answer for everything booked on the 29th. The mock had no
 * notion of an end at all — `buildScheduleAggregate` walked a hardcoded 35 days
 * from the start — so the month grid's last cells were answered from a window
 * nobody had asked for.
 *
 * A boundary that carries a clock time in the small hours names the day *before*
 * it, and two callers produce exactly that: FullCalendar hands over an exclusive
 * `activeEnd` (the following midnight), and the missed-visits drawer converts an
 * end-of-day through the franchise's standard offset, which is behind UTC and so
 * lands after midnight on the next UTC date. Both mean the same day, and by
 * `WINDOW_END_MIN_HOUR_UTC` neither can mean the day that has barely begun. A bare
 * `YYYY-MM-DD` carries no clock time and is taken at face value.
 */
const parseWindowEnd = (query = {}) => {
  const raw = query.windowEnd || query.endsAt || query.endDate;
  if (!raw) return null;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const carriesClockTime = typeof raw === 'string' && /\d{2}:\d{2}/.test(raw);
  if (carriesClockTime && d.getUTCHours() < WINDOW_END_MIN_HOUR_UTC) {
    day.setUTCDate(day.getUTCDate() - 1);
  }

  return day;
};

/**
 * How many whole days a window covers, counting both ends.
 *
 * Six weeks is the ceiling because that is the largest month grid; one day is the
 * floor because a window that resolves to nothing is a window we cannot draw.
 */
const WINDOW_MAX_DAYS = 42;

const inclusiveDayCount = (start, end) =>
  Math.min(
    Math.max(Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1, 1),
    WINDOW_MAX_DAYS,
  );

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
  const startsAt = isoAt(base, dayOffset, win.startHour);
  /* Date first, then status: what this shift is allowed to say depends on the day it
     lands on. See `shiftStatusFor`. */
  const status = shiftStatusFor(dayIndexOfIso(startsAt), statusIndex);
  const isUnassigned = status === 'unassigned';
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
    runsheetName: view === 'patrol' ? routeForSite(site).name : name,
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
/* The hours are **UTC**, because that is what `isoAtDayIndex` writes, and the
   grid renders them in the franchise's timezone (US Central). The offset is why
   these are not the numbers you would expect from the labels: a window built at
   08:00 UTC drew as `3a` on screen, so a card that named itself "Morning visit"
   sat at three in the morning and contradicted itself. Local-clock hour + 5.

   Only the visits' own windows are corrected here. Every other time in this mock
   carries the same skew — a shift written 08:00–16:00 draws as `3a - 11a` — and
   putting that right means changing `isoAt`/`isoAtDayIndex` for every surface at
   once, which is a bigger change than one card's copy. */
const VISIT_WINDOWS = [
  { label: 'Morning', startHour: 13, endHour: 15 }, // 8a – 10a Central
  { label: 'Midday', startHour: 16, endHour: 18 }, // 11a – 1p
  { label: 'Afternoon', startHour: 19, endHour: 21 }, // 2p – 4p
  { label: 'Evening', startHour: 22, endHour: 24 }, // 5p – 7p
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
  const today = todayIndex();

  if (dayIndex < today) return statusIndex % 4 === 3 ? 'missed' : 'completed';
  if (dayIndex === today) return statusIndex % 2 === 0 ? 'inProgress' : 'notStarted';
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
  // The four Meridian Health Group locations share an interval as well as an
  // anchor — see GROUP_ROUND_SITES. Both are needed: a shared interval alone
  // still lets the cadence drift them onto different days.
  ['Meridian Hotel', 28],
  ['Northgate Cold Storage', 21],
  ['Riverside Medical Centre', 28],
  ['Sable Ridge Warehouse', 30],
  ['Oakhurst Leisure Club', 30],
  ['Pinecrest Assisted Living', 28],
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
  ['Netherby Care Home', 28],
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
 * The group round: one customer's whole portfolio serviced in a single day.
 *
 * Meridian Health Group's four locations sit on one contract that puts them all on
 * the same four-weekly round, which is how a genuinely busy day arises in a real
 * book — not a dozen unrelated sites colliding by accident, but one customer's
 * sites worked off one vehicle. Without it no day in this demo carried more than
 * three visits, so a month cell had never overflowed and the "+N more" path had
 * never been drawn by anyone building, reviewing or testing this screen.
 *
 * The anchor is a **day index, not a date**, so the round recurs: 2026-01-15 and
 * every 28th day after it. A hand-placed date would give the demo one busy day
 * that goes stale the moment "today" moves past it; a cadence puts one in nearly
 * every month a planner can navigate to. 28 is a whole number of weeks, so every
 * round falls on the same weekday — a Thursday, which is also what
 * `preferredDayFor` will then report for these four sites.
 */
const GROUP_ROUND_SITES = new Set([
  'Meridian Hotel',
  'Riverside Medical Centre',
  'Pinecrest Assisted Living',
  'Netherby Care Home',
]);

/** 2026-01-15, counted from `CADENCE_EPOCH`. */
const GROUP_ROUND_ANCHOR = 14;

/**
 * Anchors are otherwise derived, not hand-picked: a stride co-prime with the
 * common intervals spreads each site's due-day across its own cycle, so the week
 * does not clump every 30-day site onto the same Monday.
 */
const VISIT_SITES = VISIT_SITE_BOOK.map(([name, intervalDays, fixedId], index) => ({
  id: fixedId ?? 100 + index,
  name,
  intervalDays,
  anchor: GROUP_ROUND_SITES.has(name)
    ? GROUP_ROUND_ANCHOR
    : intervalDays
      ? (index * 17) % intervalDays
      : 0,
}));

/** Fixed anchor so a site's cadence is the same whichever week you navigate to. */
const CADENCE_EPOCH = Date.UTC(2026, 0, 1);

const MS_PER_DAY = 86400000;

const toDayIndex = (date) => Math.round((date.getTime() - CADENCE_EPOCH) / MS_PER_DAY);

/**
 * Today's day index — the one thing `toDayIndex(new Date())` could not answer.
 *
 * Every other date this mock indexes is a UTC midnight (`Date.UTC(y, m, d)`), so
 * `Math.round` was exact for them. `new Date()` carries a time of day, and rounding
 * a fraction of a day sends **every clock reading past 12:00 UTC to tomorrow**: at
 * 14:09 UTC on 20 Aug the "today" index was the 21st, so a visit dated today was
 * generated as *past* (completed, or missed) and tomorrow's visit was generated as
 * the one in progress. Both are states the date forbids, and they appeared for
 * twelve hours of every day — which is why they read as intermittent.
 *
 * `Math.floor` off a UTC-midnight epoch is the calendar day count outright. UTC
 * rather than local because that is the frame the whole file already works in: date
 * keys are built with `Date.UTC` and visit windows are 13:00–22:00 UTC, which is one
 * working day in US Central, the franchise clock these visits are drawn on.
 */
const todayIndex = () => Math.floor((Date.now() - CADENCE_EPOCH) / MS_PER_DAY);

const dayIndexToDate = (dayIndex) => new Date(CADENCE_EPOCH + dayIndex * MS_PER_DAY);

/**
 * A **shift's** status, gated by its date — the dedicated and patrol tabs' answer to
 * what `resolveVisitStatus` does for visits.
 *
 * Those two tabs do not go through `resolveVisitStatus` at all: their rows come from
 * `makeShift`, which read `STATUS_CYCLE` positionally and so reported shifts
 * *completed* and *in progress* on any week the planner paged forward to. It did not
 * paint a status icon — `makeShift` sets only `status`, and the card reads
 * `shiftStatus || scheduleStatus` — so it surfaced instead in the footer's legend
 * counts and in the status filter, which is why it outlived the visit-side fix.
 *
 * The three readings, and why each is the only honest one:
 *
 * - **Past** — `completed`. Not `missed`: a shift has no missed state on this
 *   surface (the status filter has no row for it, see the note in
 *   `companies/companyVisitFilters.js`), which is exactly the difference between a
 *   shift and a visit and must not be blurred by making the mock emit one.
 * - **Today** — whatever the cycle picked. Every reading is legitimate on the day
 *   itself: the morning patrol is done, the evening one is running, the night one has
 *   not started. This is what keeps the *default* week — the one the scheduler opens
 *   on — showing the full mix the legend describes.
 * - **Future** — `notStarted`.
 *
 * `unassigned` passes through on any date, and deliberately. It is a fact about the
 * roster rather than about the clock — nobody was put on this shift — and a past one
 * stays unassigned rather than becoming completed, the same call D11 makes for
 * unrouted visits in `docs/visits-feature/06-visits-scheduler-edge-cases.md`.
 */
const shiftStatusFor = (dayIndex, statusIndex) => {
  const planned = STATUS_CYCLE[statusIndex % STATUS_CYCLE.length];
  if (planned === 'unassigned') return 'unassigned';

  const today = todayIndex();
  if (dayIndex < today) return 'completed';
  if (dayIndex > today) return 'notStarted';
  return planned;
};

/**
 * The day index of an ISO stamp, from its **date part only**.
 *
 * `toDayIndex(new Date(iso))` would carry the stamp's time of day into a `Math.round`
 * and land on tomorrow for any shift starting at 13:00Z or later — the same
 * off-by-half-a-day that `todayIndex` exists to avoid. Slicing to `YYYY-MM-DD` and
 * reading it as UTC midnight makes the comparison a whole-day one on both sides.
 */
const dayIndexOfIso = (iso) =>
  Math.floor((Date.parse(`${`${iso}`.slice(0, 10)}T00:00:00.000Z`) - CADENCE_EPOCH) / MS_PER_DAY);

/**
 * The same-day pair: one customer, two of its sites, one day.
 *
 * On the company grouping a row is a **customer**, not a site, so two visits to two
 * different buildings on the same date land in the same row *and* the same day
 * column, stacked one above the other. That is the case the card's site name exists
 * for — `alwaysNameSite` is the only thing telling those two cards apart — and until
 * now it appeared only when two of a customer's cadences happened to collide, which
 * is nothing a reviewer can open the screen and find.
 *
 * So it is forced, for one customer, as an **extra** due day rather than as a
 * rewritten cadence: both sites keep the 60-day interval and the preferred day their
 * rows report, and an off-cadence date covering two of a customer's buildings in one
 * trip is a thing that really happens in this book. Elmsworth Trust because it owns
 * four sites, so the pair sits in a row that has other visits to be distinguished
 * from rather than in a row that holds nothing else.
 *
 * The two are deliberately unalike, because the point is that a reviewer can tell
 * them apart *and* read the state treatments in one look: different sites, different
 * windows (08:00 and 14:00 local), different routes, different filter counts, and
 * one routed-and-scheduled visit against one with no route at all — a red
 * `Unassigned` route line stacked directly under a named route. Kelvin Court is on
 * its preferred day here and Langford Textiles (which asks for Saturdays) is not, so
 * the stack also carries the preferred-day treatment on exactly one of its cards.
 *
 * `statusIndex: 1` on both: odd, so `routedVisitStatus` reads the routed one as Not
 * Started on the day itself rather than In Progress — scheduled-but-not-yet-run is
 * the state that pairs most legibly with Unassigned — and as Completed, not Missed,
 * on the repeats that have already gone by.
 */
const SAME_DAY_PAIR = [
  { siteName: 'Kelvin Court Offices', windowIndex: 0, statusIndex: 1, plan: 'routed' },
  { siteName: 'Langford Textiles', windowIndex: 2, statusIndex: 1, plan: 'unassigned' },
];

/**
 * The visit that demonstrates **In Progress** — the one state the book could not
 * reach on its own.
 *
 * `resolveVisitStatus` allows in-progress on exactly one date, today, and rightly:
 * a route is either running now or it is not, so the blue treatment is a today-only
 * reading and putting it on any other day is one of the date violations this file
 * spent a session removing. But *allowed on today* is not *present on today*. Only
 * sites whose cadence happens to land on today produce a card there at all, the
 * status then depends on that visit's own seed parity, and across a full year of
 * generated visits the count of in-progress ones was **zero** — the `#EFF8FF` wash,
 * its legend row and its footer count were undrawable, which is exactly the failure
 * `planVisitState`'s own docstring says the demo must not have.
 *
 * So it is forced, on the same anchor as the pair above, and forced on *today only*
 * in effect: the 28-day repeats resolve through `routedVisitStatus` like any other
 * routed visit (Completed behind us, Not Started ahead), because in-progress is not
 * a state a past or future date may hold.
 *
 * The choices, and why:
 *
 * - **`plan: 'routed'`, not `insertedAfterStart`.** Both reach in-progress on today,
 *   but the insert plan also sets `addedAfterRouteStart`, which draws the D3 insert
 *   treatment on the card. That would leave the blue wash demonstrable only on a card
 *   carrying a second, louder mark — two treatments on the one card meant to verify
 *   one. `routed` with an even `statusIndex` reaches it down the ordinary path, the
 *   same one every real routed visit takes. (The insert treatment is still unreachable
 *   in the demo for the same reason in-progress was; that is a separate forced visit,
 *   not a rider on this one.)
 * - **`statusIndex: 0`.** Even, so `routedVisitStatus` reads today as In Progress; and
 *   `0 % 4 !== 3`, so the repeats behind us are Completed rather than Missed — a site
 *   whose route ran is not a site that was missed.
 * - **Ormesby Business Village**, on a 60-day interval whose own cadence comes nowhere
 *   near today. Its row is otherwise empty in the current week, so the blue card is the
 *   only thing in it and a reviewer cannot fail to find it; and it belongs to Beaumont
 *   Group rather than to Elmsworth Trust, which keeps the pair's lane a pair. Today
 *   already carries Kelvin Court as Not Started, so the two treatments the request
 *   compares sit in the same day column without crowding one row.
 * - **Midday**, against the pair's Morning and Afternoon: three distinct windows on
 *   one date, and a route still out at midday is the plainest reading of a route
 *   under way.
 */
const TODAY_IN_PROGRESS = {
  siteName: 'Ormesby Business Village',
  windowIndex: 1,
  statusIndex: 0,
  plan: 'routed',
};

/**
 * The forced visits, all anchored on **today** and repeating every 28 days from it.
 *
 * A hand-picked date is the one thing that cannot work here. The cases have to be in
 * the week the reviewer lands on, and that week is the one containing today — the
 * same argument `GROUP_ROUND_ANCHOR` makes for a cadence over a date, taken one step
 * further, because a 28-day round is only in *some* weeks and these cases have to be
 * in *this* one. Today is in the current month too, so the month view draws the pair
 * as two chips on one day without any further arrangement.
 *
 * 28 days is a whole number of weeks, so the repeats keep their weekday when a
 * planner pages a month back or forward, and the whole thing costs the book three
 * extra visits a month — a week still holds 8-12 visits, which is the density this
 * mock is built around.
 *
 * One list, one anchor and one lookup for all three deliberately: a second way to pin
 * a visit to a date is a second thing to keep in step with `isSiteDueOn`,
 * `visitRecipeFor` and the four surfaces that read them.
 *
 * `new Date()` is read here the way `routedVisitStatus` already reads it. Nothing is
 * random: within a session every fetch of a given week returns the same visits with
 * the same ids, because `visitIdFor` derives identity from site and date. The book
 * does shift by a day when the day shifts, which is already true of every status
 * in it.
 */
const FORCED_VISITS = [...SAME_DAY_PAIR, TODAY_IN_PROGRESS];

const FORCED_VISIT_INTERVAL_DAYS = 28;

const FORCED_VISIT_BY_SITE_NAME = new Map(FORCED_VISITS.map((entry) => [entry.siteName, entry]));

/** The forced entry for this site on this day, or `null` when it is an ordinary visit. */
const forcedVisitFor = (site = {}, dayIndex) => {
  const entry = FORCED_VISIT_BY_SITE_NAME.get(site.name);
  if (!entry) return null;

  const offset = dayIndex - todayIndex();
  return offset % FORCED_VISIT_INTERVAL_DAYS === 0 ? entry : null;
};

/** True when `site` is due on the given absolute day index. */
const isSiteDueOn = (site, dayIndex) => {
  // A forced visit is due on its own anchor *as well as* on its cadence, so the
  // sites' own rhythm — and the interval their rows report — is untouched.
  if (forcedVisitFor(site, dayIndex)) return true;
  if (!site.intervalDays) return false;
  const offset = dayIndex - site.anchor;
  return offset % site.intervalDays === 0;
};

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The weekday a site wants to be serviced on.
 *
 * Read off the site's cadence anchor rather than invented, so the field is
 * *consistent with the schedule it constrains*: a site on a 14- or 21-day interval
 * lands on its anchor's weekday every cycle and is therefore always on its
 * preferred day, while a 30-, 45- or 90-day interval drifts across the week and
 * regularly is not. That mix is the point — a preferred day nothing ever violates
 * is a field the planner never has to look at.
 *
 * A site with no recurring schedule has no preferred day: there is no cadence for
 * one to be derived from, and inventing one would assert a customer preference the
 * demo has no basis for.
 *
 * UTC is safe here: visit windows start between 13:00 and 22:00 UTC, which is
 * 08:00–17:00 US Central on the same date, so the weekday does not shift.
 */
const preferredDayFor = (site = {}) =>
  site.intervalDays ? WEEKDAY_SHORT[dayIndexToDate(site.anchor).getUTCDay()] : null;

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
    const { plan, statusIndex } = visitRecipeFor(site, dayIndex);
    /* **Cancelled is not counted.** The aggregate month is a tally per day — no
       per-visit records at all, not even an id — so it is the one surface a client
       cannot correct after the fact: every other view drops cancelled cards on
       arrival (`scheduleResponseAdapter.dropCancelledEvents`), and a count has
       nothing to drop. A called-off visit counted here made the month cell claim
       work that will not happen, with no card anywhere to trace it to.

       Asked through `resolveVisitStatus` rather than by testing `plan` directly,
       which is this file's rule for anything that needs to know a visit's status —
       the pill and the grid disagreeing about `missed` is what established it. */
    if (resolveVisitStatus(plan, dayIndex, statusIndex) === 'cancelled') return;
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

/**
 * Everything about a visit that is decided by *which* visit it is: its plan, the
 * window it sits in, and the index its routed status is read off.
 *
 * One function, because four surfaces used to derive these three values
 * independently from the same seed — the week grid, the month aggregate's counts, the
 * missed-visits list and the company matrix — and `FORCED_VISITS` overrides all
 * three. A surface still deriving them from the bare seed would draw a forced visit
 * in a different state, or in a different window, than the card the reviewer clicked.
 */
const visitRecipeFor = (site, dayIndex) => {
  const seed = Math.abs(site.id * 31 + dayIndex);
  const forced = forcedVisitFor(site, dayIndex);

  return {
    seed,
    plan: forced ? forced.plan : planVisitState(seed),
    windowIndex: forced ? forced.windowIndex : seed,
    statusIndex: forced ? forced.statusIndex : seed,
  };
};

/**
 * The status a visit resolves to, from its plan and the day it falls on.
 *
 * Lifted out of `makeVisit` because that was the only place a visit's status was
 * ever decided, while the missed-visits pill counted a hand-written list of three
 * that had nothing to do with the book. So the pill read 3 in a week whose grid
 * drew 2 missed visits, and 3 again in a month whose grid drew 4 — three numbers
 * for one fact. Anything that needs to know whether a visit was missed now asks
 * the same function the grid asked.
 */
const resolveVisitStatus = (plan, dayIndex, statusIndex) => {
  /* Cancelled is the one plan that is genuinely date-free: a visit can be called
     off months ahead, and the record still says cancelled once its date has gone. */
  if (plan === 'cancelled') return 'cancelled';

  /* **Missed is a past state**, and the plan alone cannot assert it. `planVisitState`
     picks the plan off a seed with no idea what date it lands on, so an unqualified
     `return 'missed'` here marked visits missed *up to eleven months into the
     future* — the Companies year matrix drew rows reading `Sep notStarted · Nov
     missed`, which is not a service history any book can produce. The plan still
     decides *that* this occurrence demonstrates the missed treatment; the date
     decides whether it is allowed to yet, and a plan whose date has not come falls
     through to the ordinary routed reading (`notStarted`, or in progress today). */
  if (plan === 'missed') {
    if (dayIndex < todayIndex()) return 'missed';
    return routedVisitStatus(dayIndex, statusIndex);
  }

  /* Blocked visits have no tour, so nothing has ever picked them up; the two
     unrouted plans are the two rows of the pinned band.

     Deliberately not date-gated, and **not** folded into `missed` once the date has
     passed — that is D11 in `docs/visits-feature/06-visits-scheduler-edge-cases.md`.
     A past visit that was never on a route failed earlier and differently from a
     route that was planned and not run, and it belongs in the band that counts
     unrouted demand. `resolveVisitState` client-side makes the same call, so a
     record honest about being unrouted keeps reading that way on every surface. */
  if (plan === 'unassigned' || plan === 'blockedNoTour') return 'unassigned';

  /* An insert mid-route only exists while a route is running, so it is a *today*
     state. Forcing `inProgress` on any day the plan happened to land on put routes
     "in progress" three weeks out and three weeks back. */
  if (plan === 'insertedAfterStart' && dayIndex === todayIndex()) return 'inProgress';

  return routedVisitStatus(dayIndex, statusIndex);
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

/**
 * How many filters this site has, and therefore how long a visit takes.
 *
 * Derived from the site so it is the same number on every surface and in every
 * week — the card, the drawer, the route plan and the AI's estimate all have to
 * agree, and a hash of the id is the only way to promise that without a store.
 * One to eight: a single-unit shop through to a small industrial site.
 */
const filterCountFor = (site) => 1 + (((site.id * 7 + 3) % 8) | 0);

/**
 * The sub-location within the site a visit is scoped to.
 *
 * A site is a building; a location is a named area inside it — the product's
 * own Sites > Locations feature (`sites/detail/components/locations`) is
 * where these are managed, and a checkpoint's `location.locationName` is the
 * same idea at checkpoint granularity. This is that same concept at the
 * visit's granularity: which part of the site the visit is for, the way "a
 * Walmart has a parking lot" is a location inside the Walmart site. Hashed
 * from the site id for the same reason `filterCountFor` is — one answer per
 * site, not a reshuffle on every fetch.
 */
const SITE_LOCATION_NAMES = [
  'Parking Lot',
  'Main Entrance',
  'Loading Dock',
  'Rooftop Unit',
  'Mechanical Room',
  'Rear Access',
];
const siteLocationFor = (site = {}) =>
  SITE_LOCATION_NAMES[(site.id * 3 + 1) % SITE_LOCATION_NAMES.length];

const makeVisit = ({
  site,
  dayIndex,
  windowIndex,
  officer,
  statusIndex,
  sequence,
  plan: forcedPlan,
}) => {
  const win = VISIT_WINDOWS[windowIndex % VISIT_WINDOWS.length];
  const id = visitIdFor(site, dayIndex);
  // `plan` is passed in by every caller that went through `visitRecipeFor`; the
  // fallback keeps a caller that only has a sequence (the shift-side builders) working.
  const plan = forcedPlan || planVisitState(sequence);
  const filterCount = filterCountFor(site);

  const assigned = plan !== 'unassigned' && plan !== 'blockedNoTour';
  const insertedNow = plan === 'insertedAfterStart' && dayIndex === todayIndex();

  const status = resolveVisitStatus(plan, dayIndex, statusIndex);

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
    /* Carried on every visit, not just the month's, so one field answers "whose
       building is this" wherever a visit is drawn — see the note on
       `COMPANY_NAME_BY_SITE_NAME`. */
    companyName: companyNameForSite(site),
    /* The weekday the customer wants this site serviced on. A *constraint*, not a
       description — which is why the card carries it and not the window-derived
       "Morning visit": the card already sits in a day column, so the useful fact is
       whether that column is the one the site asked for. */
    preferredDay: preferredDayFor(site),
    officer: assigned ? officer : null,
    reassignedOfficer: null,
    runsheetName: assigned ? routeForSite(site).name : null,
    runsheetId: assigned ? routeForSite(site).id : null,
    isUnassigned: !assigned,
    requiresAttention: !assigned,
    // Explicit, because the grid must not infer "no tour" from a missing field —
    // see `isBlockedWithoutTour` in helper/visitState.js.
    hasTour: plan !== 'blockedNoTour',
    /* The work template, which the card names on its own line the same way a hit
       card does on the site schedule. `null` rather than absent for the blocked
       plan: that is the explicit denial `isBlockedWithoutTour` asks for, and it
       is what makes the card's tour line read `Unassigned`. */
    tour: plan === 'blockedNoTour' ? null : { id: 300 + site.id, title: 'Tour Template 1' },
    /* What the visit is, in the only unit that decides how long it takes. The
       planner never sees `serviceMinutes` without the count beside it — the
       estimate is filters × 20, and a number you cannot decompose is a number
       nobody argues with when it is wrong. */
    filterCount,
    serviceMinutes: serviceMinutesForFilters(filterCount),
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
const buildVisitsSection = (base, { days = 7, groupBy = 'site', siteIds } = {}) => {
  const startDayIndex = toDayIndex(base);
  const endDayIndex = startDayIndex + days - 1;

  /* The toolbar's Sites dropdown (and the Company dropdown behind it, which only
     narrows Sites' own options — see `scheduleCalendarFilters`) reaches the grid
     through this one filter. Rows stay put either way — a company/site with
     nothing left after filtering goes quiet, the same convention `siteRows`
     already uses for a company with no visits this week — so filtering here
     means narrowing each row's `shifts`, never dropping the row itself. */
  const siteIdFilter =
    Array.isArray(siteIds) && siteIds.length ? new Set(siteIds.map(String)) : null;

  const unassigned = [];
  const bySite = new Map(VISIT_SITES.map((site) => [site.id, []]));

  VISIT_SITES.forEach((site) => {
    for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
      if (!isSiteDueOn(site, dayIndex)) continue;

      // Seeded from site + date so a visit keeps the same state and technician
      // however you reach it — week, day, month or the drawer.
      const { seed, plan, windowIndex, statusIndex } = visitRecipeFor(site, dayIndex);
      const visit = makeVisit({
        site,
        dayIndex,
        windowIndex,
        officer: OFFICERS[seed % OFFICERS.length],
        statusIndex,
        sequence: seed,
        plan,
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

  /**
   * Grouped by the customer instead of by the site.
   *
   * There is deliberately **no unassigned band here**. The band exists on the site
   * grouping because an unrouted visit has no row of its own to sit in — its site
   * row is about the site, and demand nobody has picked up is the thing that has to
   * be seen first. A company row is not a plan, it is a customer, and an unrouted
   * visit belongs to its customer exactly as much as a routed one does. Pulling it
   * out would say the opposite, and the card already says `Unassigned` on its route
   * line, in red, which is where that fact belongs on this grouping.
   */
  const companyRows = () => {
    const byCustomer = new Map();

    VISIT_COMPANY_BOOK.forEach(([customerId, name, siteNames], index) => {
      const sites = siteNames
        .map((siteName) => VISIT_SITE_BY_NAME.get(siteName))
        .filter(Boolean)
        .filter((site) => !siteIdFilter || siteIdFilter.has(String(site.id)));
      const shifts = sites.flatMap((site) => [
        ...bySite.get(site.id),
        ...unassigned.filter((visit) => visit.site.id === site.id),
      ]);
      const nextDues = sites
        .map((site) => nextDueDayIndex(site, endDayIndex + 1))
        .filter((dayIndex) => dayIndex != null);

      byCustomer.set(customerId, {
        id: `visits-company-${customerId}`,
        key: `company-${customerId}`,
        title: name,
        sortOrder: index,
        meta: {
          customerId,
          isCompanyRow: true,
          siteCount: sites.length,
          visitCount: shifts.length,
          // The earliest next-due across the customer's locations, so a quiet
          // company row answers the same question a quiet site row does.
          nextVisitAt: nextDues.length
            ? isoAtDayIndex(Math.min(...nextDues), VISIT_WINDOWS[0].startHour)
            : null,
        },
        shifts,
      });
    });

    return [...byCustomer.values()];
  };

  const isCompanyGrouping = groupBy === 'company';

  // Same narrowing as `companyRows`, for the site grouping's own two shapes:
  // the per-site rows built above, and the unassigned band that sits ahead of
  // them (see its own comment for why unassigned demand gets a row of its own
  // here but not on the company grouping).
  const visibleSiteRows = siteIdFilter
    ? siteRows.filter((row) => siteIdFilter.has(String(row.meta.locationId)))
    : siteRows;
  const visibleUnassigned = siteIdFilter
    ? unassigned.filter((visit) => siteIdFilter.has(String(visit.site?.id)))
    : unassigned;

  const rows = isCompanyGrouping
    ? companyRows()
    : [
        {
          id: 'visits-unassigned',
          key: 'unassigned',
          title: 'Unassigned',
          subtitle: `${visibleUnassigned.length} awaiting a route`,
          sortOrder: -1,
          meta: { isUnassignedDemand: true, visitCount: visibleUnassigned.length },
          shifts: visibleUnassigned,
        },
        ...visibleSiteRows,
      ];

  const allVisits = rows.flatMap((row) => row.shifts);
  const servicedSiteCount = visibleSiteRows.filter((row) => row.shifts.length > 0).length;
  const count = (status) => allVisits.filter((visit) => visit.status === status).length;
  // Derived from `allVisits` rather than the outer `unassigned` array: that array
  // is the whole window's unassigned demand, unfiltered, and once a Sites filter
  // narrows the rows above it stops matching what is actually on screen.
  const visibleUnassignedCount = allVisits.filter((visit) => visit.isUnassigned).length;

  const legend = {
    dedicated: 0,
    patrol: allVisits.length - visibleUnassignedCount,
    extraJob: 0,
    extraRunsheet: visibleUnassignedCount,
    dispatch: 0,
    completed: count('completed'),
    inProgress: count('inProgress'),
    notStarted: count('notStarted'),
    unassigned: visibleUnassignedCount,
    missed: count('missed'),
    cancelled: count('cancelled'),
    split: 0,
    // Density, as a number: how much of the site list this week actually touches.
    sitesServiced: servicedSiteCount,
    sitesTotal: visibleSiteRows.length,
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
    unassignedCount: visibleUnassignedCount,
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
const buildVisitsDayView = (base, { groupBy = 'site', siteIds } = {}) => {
  const grid = buildVisitsSection(base, { days: 1, groupBy, siteIds });
  const dayKey = toDateKey(base);
  const forToday = (grid.shifts || []).filter((visit) => visit.startsAt.slice(0, 10) === dayKey);

  // Same toolbar Sites filter `buildVisitsSection` narrows the week grid with,
  // applied once here so neither branch below has to know about it separately.
  const siteIdFilter =
    Array.isArray(siteIds) && siteIds.length ? new Set(siteIds.map(String)) : null;
  const scopedToday = siteIdFilter
    ? forToday.filter((visit) => siteIdFilter.has(String(visit.site?.id)))
    : forToday;

  /* Company grouping keeps its own shape: the groups are the customers being
     visited today, and an unrouted visit stays inside its customer's group for
     the same reason it does on the week grid. */
  if (groupBy === 'company') {
    const shiftsByCompany = {};
    const groups = [];

    VISIT_COMPANY_BOOK.forEach(([customerId, name, siteNames]) => {
      const companySiteIds = new Set(
        siteNames.map((siteName) => VISIT_SITE_BY_NAME.get(siteName)?.id).filter(Boolean),
      );
      const visits = scopedToday.filter((visit) => companySiteIds.has(visit.site.id));
      if (!visits.length) return;

      shiftsByCompany[name] = visits;
      groups.push({ id: customerId, title: name, name });
    });

    return { ...grid, shifts: shiftsByCompany, locations: groups };
  }

  const unassigned = scopedToday.filter((visit) => visit.isUnassigned);
  const shiftsByLocation = {};

  if (unassigned.length) shiftsByLocation[UNASSIGNED_DAY_GROUP] = unassigned;

  /* Unlike the week grid, the day view lists **only** the sites being serviced
     today. A quiet row earns its place on a planning surface — it says "this site
     exists and is next due on the 12th". On an execution surface it says nothing
     the week grid did not already say, and twenty empty sections would bury the
     three that matter. */
  const servicedSites = VISIT_SITES.filter((site) =>
    scopedToday.some((visit) => !visit.isUnassigned && visit.site.id === site.id),
  );

  servicedSites.forEach((site) => {
    shiftsByLocation[site.name] = scopedToday.filter(
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

/**
 * How many days the caller asked for, from the window it asked for.
 *
 * The week grid is seven days and used to be the only caller, so the length was
 * hard-coded. The main view's company grouping also draws a **month** of visits
 * as individual cards, and a month asked for with a seven-day generator returns a
 * week of visits in a five-week grid — which reads as four empty weeks rather
 * than as a bug. Clamped at six weeks, the most a month grid can show.
 *
 * The gap between the two ends is measured **inclusively**, because `windowEnd` is
 * the last visible date and not the instant after it. Subtracting the raw
 * timestamps stopped one day short of that; it agreed with the week grid only
 * because the client was handing over an exclusive end, and two off-by-ones that
 * cancel are not the same as being right.
 */
const windowDays = (query = {}) => {
  if (!query.windowStart) return 7;

  const end = parseWindowEnd(query);
  if (!end) return 7;

  return inclusiveDayCount(parseWindowStart(query), end);
};

export const buildScheduleSummary = (query = {}) => {
  const base = parseWindowStart(query);
  const isDayView = query.isDayView === true || query.isDayView === 'true';

  if (query.view === 'visits') {
    const groupBy = query.groupBy === 'company' ? 'company' : 'site';
    // `query.siteId` arrives as an array once selected (see the `getQueryParams`
    // fix for `arrayFormat: 'bracket'` params) or a single value with just one
    // site chosen; either way, normalize to an array here so both visit builders
    // can treat it the same way.
    const siteIds = [].concat(query.siteId ?? []).filter((id) => id !== '');

    return isDayView
      ? buildVisitsDayView(base, { groupBy, siteIds })
      : filterGridByStatus(
          buildVisitsSection(base, { days: windowDays(query), groupBy, siteIds }),
          query.shiftStatus,
        );
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

/**
 * The route a `runsheetId` names, and the sites it actually serves.
 *
 * `routeForSite` mints ids as `700 + index into ROUTE_NAMES`, so a route id is
 * reversible — and it has to be, because the visits grid now opens a **route** from
 * a visit card. Without this the detail endpoint fell back to `siteForRunsheet`,
 * which reduces the id modulo three demo sites: clicking Brookfield's visit opened
 * "Night Shift Patrols - Downtown Plaza". The grid and its drawer have to name the
 * same object (§7.4), and here the id already carries what is needed.
 *
 * Stops are every site whose round this is, which is also how the card's route line
 * is derived — so the stop list contains the visit that was clicked.
 */
const ROUTE_ID_BASE = 700;

const routeById = (runsheetId) => {
  const numeric = Number(String(runsheetId).replace(/\D/g, ''));
  const index = Number.isFinite(numeric) ? numeric - ROUTE_ID_BASE : -1;
  if (index < 0 || index >= ROUTE_NAMES.length) return null;

  return {
    id: ROUTE_ID_BASE + index,
    name: ROUTE_NAMES[index],
    sites: VISIT_SITES.filter((site) => routeForSite(site).id === ROUTE_ID_BASE + index),
  };
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
    /* Duration follows the one service-time model, so the drawer's "Service Time"
       and the route's estimate for the same visit are the same number. It was a
       flat 45 minutes, which agreed with nothing. */
    filterCount: filterCountFor(site),
    duration: serviceMinutesForFilters(filterCountFor(site)),
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
  const route = routeById(runsheetId);
  const site = known?.site || route?.sites?.[0] || siteForRunsheet(runsheetId);
  const officer =
    known?.officer ?? OFFICERS[Number(String(runsheetId).replace(/\D/g, '')) % OFFICERS.length];

  /* The round's own sites when the id names a route, capped at four so the drawer
     stays readable; the three demo sites otherwise. The first stop is already
     served either way — that is what exercises the ordered list, the
     visited/unvisited split and the "N of M done" roll-up. */
  const stopSites = (route?.sites?.length ? route.sites : SITES).slice(0, 4);

  const hits = stopSites.map((stopSite, index) =>
    buildVisitRow({
      site: stopSite,
      base,
      dayOffset: 0,
      windowIndex: index,
      index,
      isVisited: index === 0,
    }),
  );

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
      runsheetName: route?.name || routeForSite(site).name,
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
      /* One leg per stop, derived rather than listed: the stop count is the route's
         now, so three hard-coded legs would read `undefined` for a two-stop round
         and drop the last leg of a four-stop one. */
      ...hits.map((hit, index) => ({
        hitId: hit.hitId,
        distance: { value: 12400 + index * 1400 },
        duration: { value: 55 + index * 8 },
        mapPath: '',
      })),
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

  const decodedPlan = decoded ? visitRecipeFor(decoded.site, decoded.dayIndex).plan : null;
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
    companyName: companyNameForSite(site),
    location: siteLocationFor(site),
    address: SITE_ADDRESSES[site.id],
    startsAt: known?.startsAt || query.startsAt || isoAt(base, 0, 9),
    endsAt: known?.endsAt || query.endsAt || isoAt(base, 0, 11),
    windowStart: known?.startsAt || query.startsAt || isoAt(base, 0, 9),
    windowEnd: known?.endsAt || query.endsAt || isoAt(base, 0, 11),
    /* Same model as the grid and the route planner — filters × 20 minutes. */
    filterCount: filterCountFor(site),
    duration: serviceMinutesForFilters(filterCountFor(site)),
    visitType: 'Filter replacement',
    scheduleStatus: status,
    hitStatus: status,
    isVisited: status === 'completed',
    isUnassigned: !isAssigned,
    runsheetId: isAssigned ? query.runsheetId || routeForSite(site).id : null,
    runsheetName: isAssigned ? routeForSite(site).name : null,
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
  const end = parseWindowEnd(query);
  const shifts = [];
  let unassignedTotal = 0;

  /* The window that was asked for, rather than 35 days from its start.
     `windowEnd` was never read here, so the aggregate answered a different window
     than the one the grid drew: on the August grid it reported a visit on
     4 September, a day the per-visit path — which does honour the window — draws
     as empty. One visit generator, two readings of the same month.

     The 5x7 grid survives as the **fallback** for a caller that names no end at
     all, since a caller with no window is almost certainly a month view. It is no
     longer what every caller gets. */
  const dayCount = end ? inclusiveDayCount(base, end) : 35;

  // A tenant that does not sell a service should never see it on the month
  // view — Filter Go sells filter replacement only.
  const includePatrol = services.patrol !== false;
  const includeDedicated = services.dedicated === true;

  for (let i = 0; i < dayCount; i++) {
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

/**
 * The missed visits in a window — read off the visits book, not kept beside it.
 *
 * This used to be a hand-written list of three, placed at fixed offsets from
 * whatever window was asked for, and the count endpoint returned its length
 * without reading the window at all. So the pill said 3 in a week whose grid drew
 * 2 missed visits and in a month whose grid drew 4, and the drawer it opened
 * listed three sites that were not any of them. The pill, the grid and the drawer
 * were three independent answers to one question.
 *
 * There is now one answer: a missed visit is a visit the grid draws as missed. The
 * seed is the same `site.id * 31 + dayIndex` the grid generates from, so this walk
 * reproduces the grid's own visits without building them.
 */
const missedVisitsBetween = (startDayIndex, endDayIndex) => {
  const missed = [];

  // Day-major, so the list arrives in the order the drawer reads it.
  for (let dayIndex = startDayIndex; dayIndex <= endDayIndex; dayIndex++) {
    VISIT_SITES.forEach((site) => {
      if (!isSiteDueOn(site, dayIndex)) return;

      const { plan, windowIndex, statusIndex } = visitRecipeFor(site, dayIndex);
      if (resolveVisitStatus(plan, dayIndex, statusIndex) !== 'missed') return;

      missed.push({ site, dayIndex, windowIndex });
    });
  }

  return missed;
};

/**
 * The window a missed-visits request names, in whole days and `endsAt` inclusive.
 *
 * A request with no end at all falls back to a week, which is what the pill's own
 * default view spans — never to "everything", because an unbounded count is the
 * one number that can never be checked against a grid.
 */
const missedHitsWindow = (query = {}) => {
  const start = toDayIndex(parseWindowStart(query));
  const end = parseWindowEnd(query);

  return { start, end: end ? toDayIndex(end) : start + 6 };
};

export const buildMissedHits = (query = {}) => {
  const { start, end } = missedHitsWindow(query);

  return missedVisitsBetween(start, end).map(({ site, dayIndex, windowIndex }) => {
    const win = VISIT_WINDOWS[windowIndex % VISIT_WINDOWS.length];

    return {
      /* The visit's real id, so a missed visit opened from the drawer resolves to
         the same record the grid's card opens — `visitIdFor` encodes the site and
         the date, and `buildVisitDetail` decodes them. The old synthetic `9100 + i`
         decoded to nothing. */
      hitId: visitIdFor(site, dayIndex),
      hitName: `${win.label} visit`,
      siteId: site.id,
      siteName: site.name,
      runsheetName: routeForSite(site).name,
      startsAt: isoAtDayIndex(dayIndex, win.startHour),
      endsAt: isoAtDayIndex(dayIndex, win.endHour),
      status: 'missed',
    };
  });
};

/** The count is the length of the list it opens, by construction rather than by luck. */
export const buildMissedHitsCount = (query = {}) => {
  const { start, end } = missedHitsWindow(query);

  return { missedHitsCount: missedVisitsBetween(start, end).length };
};

/* ------------------------------------------------------------------------- *
 * Companies — the parent a site belongs to, and a year of its visits.
 *
 * The visits book is 46 effectively standalone sites, which would demo a
 * company view as 46 companies with one site each — the layout without the
 * point. This groups them the way a real book is shaped: a handful of parents
 * holding four or five sites, several holding two, one holding a single site,
 * and one holding a site with no recurring schedule at all.
 *
 * Names are the ones billing already uses (`sites.mock.js` carries `company`
 * and `customerId`, `invoice.mock.js` carries `client`) so a company reached
 * from here is the same company reached from an invoice.
 * ------------------------------------------------------------------------- */
const VISIT_COMPANY_BOOK = [
  [
    'CUST-1002',
    'Downtown Holdings',
    ['Downtown Plaza', 'Fairmont Office Tower', 'Fenchurch Chambers', 'Verity House'],
  ],
  [
    'CUST-1003',
    'Harborview Logistics',
    [
      'Harborview Logistics Hub',
      'Northgate Cold Storage',
      'Granby Cold Chain',
      'Inverness Freight Terminal',
    ],
  ],
  [
    'CUST-1010',
    'Alderwood Group',
    ['Alderwood Business Park', 'Kingsway Retail Centre', 'Holloway Retail Park'],
  ],
  [
    'CUST-1004',
    'Meridian Health Group',
    [
      'Meridian Hotel',
      'Riverside Medical Centre',
      'Pinecrest Assisted Living',
      'Netherby Care Home',
    ],
  ],
  ['CUST-1023', 'Brookfield Technologies', ['Brookfield Data Centre', 'Vantage Point Labs']],
  [
    'CUST-1011',
    'Sable Ridge Ltd',
    ['Sable Ridge Warehouse', 'Harlow Distribution Depot', 'Quarrywood Depot'],
  ],
  [
    'CUST-1012',
    'Oakhurst Leisure',
    ['Oakhurst Leisure Club', 'Clearwater Aquatics', 'Jubilee Sports Complex'],
  ],
  [
    'CUST-1021',
    'Ironside Industrial',
    [
      'Ironside Manufacturing',
      'Prescott Bottling Plant',
      'Redhill Chemical Works',
      'Thornbury Foundry',
    ],
  ],
  [
    'CUST-1014',
    'Cedar Mill Estates',
    ['Cedar Mill Campus', 'Upton Grange Estate', 'Ashcombe Mill'],
  ],
  [
    'CUST-1015',
    'Southgate Civic Trust',
    ['Southgate Civic Hall', 'Marchmont Library', 'Stanmore Exhibition Hall'],
  ],
  ['CUST-1016', 'Tanner Street Studios', ['Tanner Street Studios', 'Ravenswood Print Works']],
  [
    'CUST-1017',
    'Beaumont Group',
    ['Beaumont Conference Centre', 'Dunmore Trade Park', 'Ormesby Business Village'],
  ],
  [
    'CUST-1018',
    'Elmsworth Trust',
    ['Elmsworth Academy', 'Kelvin Court Offices', 'Langford Textiles', 'Bellmont Annexe'],
  ],
  ['CUST-1024', 'Wexford Agri', ['Wexford Grain Store', 'Yarrow Cannery', 'Zetland Dockside']],
  ['CUST-4265', 'EDGE Sync', ['EDGE Sync Test Site']],
];

const VISIT_SITE_BY_NAME = new Map(VISIT_SITES.map((site) => [site.name, site]));

/**
 * Which customer owns a building — the one fact a visit could not state about
 * itself.
 *
 * The week grid never needed it: there the customer *is* the row, so a card
 * carrying the name would repeat its own row header. The month grid has no rows,
 * and the company grouping's whole subject therefore appeared nowhere on it — a
 * planner looking at "visits by company" could not name a single company. It goes
 * on the visit at build time rather than being joined on the client, because the
 * month path reads the flat `shifts` array and never walks the `sections[].rows[]`
 * the customer would otherwise live in.
 */
const COMPANY_NAME_BY_SITE_NAME = new Map(
  VISIT_COMPANY_BOOK.flatMap(([, companyName, siteNames]) =>
    siteNames.map((siteName) => [siteName, companyName]),
  ),
);

const companyNameForSite = (site = {}) => COMPANY_NAME_BY_SITE_NAME.get(site.name) || '';

/**
 * Filter installation runs on a **monthly** cycle — every 2nd, 3rd or 4th month.
 *
 * That is the business rule, so the company view steps in calendar months rather
 * than in days: stepping 60/90/120 days drifts off the month it started in and
 * makes "every 3 months" land four times some years and five others. Derived
 * from the site id so a location keeps its frequency on every fetch.
 *
 * Note this is a *different* cadence model from `VISIT_SITE_BOOK`'s day
 * intervals, which the week grid still runs on. Reconciling the two is a backend
 * question — the interval has to be one stored field, not two conventions.
 */
const installIntervalMonths = (site = {}) => [2, 3, 4][Math.abs(site.id * 5 + 1) % 3];

/** The interval in the words a customer would use. */
const cadenceLabelFor = (intervalMonths) =>
  intervalMonths ? `Every ${intervalMonths} months` : null;

/** The day of the month a location is serviced on — stable per site. */
const installDayOfMonth = (site = {}) => 1 + (Math.abs(site.id * 7 + 3) % 27);

/**
 * Companies, their locations, and every visit in the window.
 *
 * **There is no projection here any more.** This used to split the window at a
 * 120-day "scheduled horizon": dates before it were records with a status and a
 * route, dates after it were cadence arithmetic drawn as inert `Projected`
 * placeholders. The distinction is not one this product makes — a visit on the
 * books is a visit — and on a twelve-month view it meant two thirds of the screen
 * was greyed-out furniture that could not be clicked, filtered or acted on. Every
 * due date is now a full visit, seeded exactly like the ones the week grid draws,
 * so the same date reads the same on both surfaces.
 */
export const buildCompanyVisitMatrix = (query = {}) => {
  const today = new Date();

  /* `from` / `to` is the Companies tab's date range, and it wins when present:
     the months on show are the ones the range spans, and dates outside it are
     dropped even when their month is partly in range. `months` / `monthOffset`
     remain for a caller that just wants a rolling window. */
  const from = typeof query.from === 'string' ? query.from.slice(0, 10) : null;
  const to = typeof query.to === 'string' ? query.to.slice(0, 10) : null;
  const hasRange = Boolean(from && to && from <= to);

  const months = [];

  if (hasRange) {
    const [fromYear, fromMonth] = from.split('-').map(Number);
    const [toYear, toMonth] = to.split('-').map(Number);
    const spanned = toYear * 12 + (toMonth - 1) - (fromYear * 12 + (fromMonth - 1)) + 1;

    for (let i = 0; i < Math.min(Math.max(spanned, 1), 36); i++) {
      const first = new Date(Date.UTC(fromYear, fromMonth - 1 + i, 1));
      months.push({ year: first.getUTCFullYear(), month: first.getUTCMonth() });
    }
  } else {
    const monthCount = Number(query.months) || 12;
    /* Which twelve months are on show. 0 is the window starting this month; the
       view steps it a year at a time. The cadence itself is anchored to a fixed
       epoch, so a location's dates do not move when the window does. */
    const monthOffset = Number(query.monthOffset) || 0;
    for (let i = 0; i < monthCount; i++) {
      const first = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset + i, 1),
      );
      months.push({ year: first.getUTCFullYear(), month: first.getUTCMonth() });
    }
  }

  const isInRange = (dateKey) => !hasRange || (dateKey >= from && dateKey <= to);

  /* Narrowed server-side. The rail's filters are scope, not presentation: a
     customer with four locations filtered to one or two should not ship the
     others to the client for it to hide.

     Both filters are multi-select, so `query.customerIds`/`query.siteIds` arrive
     as arrays under normal serialization (`arrayFormat: 'bracket'` repeats the key
     once per value, even for a single-item array — see `getQueryParams`). `[].concat`
     also accepts a bare scalar defensively, in case some caller's query-string
     config ever collapses a one-item array to a plain value. Empty or absent
     either way means "no filter": everything is shown, matching the old
     single-select behaviour for "nothing chosen". */
  const toFilterIds = (value) =>
    []
      .concat(value ?? [])
      .map(String)
      .filter(Boolean);
  const customerFilter = toFilterIds(query.customerIds);
  const siteFilter = toFilterIds(query.siteIds);

  /* Absolute month number, so "every 3 months" is counted in months and never
     accumulates a day-level drift across a year boundary. */
  const absMonth = (year, month) => year * 12 + month;
  const firstAbsMonth = absMonth(months[0].year, months[0].month);

  const companies = VISIT_COMPANY_BOOK.filter(
    ([customerId]) => !customerFilter.length || customerFilter.includes(String(customerId)),
  )
    .map(([customerId, name, siteNames]) => {
      const sites = siteNames
        .map((siteName) => VISIT_SITE_BY_NAME.get(siteName))
        .filter(Boolean)
        .filter((site) => !siteFilter.length || siteFilter.includes(String(site.id)))
        .map((site) => {
          const hasSchedule = Boolean(site.intervalDays);
          const intervalMonths = hasSchedule ? installIntervalMonths(site) : null;
          const dayOfMonth = installDayOfMonth(site);
          const phase = hasSchedule ? Math.abs(site.id * 3) % intervalMonths : 0;

          const byMonth = months.map(() => []);
          let total = 0;

          if (hasSchedule) {
            months.forEach((m, index) => {
              const offset = absMonth(m.year, m.month) - firstAbsMonth;
              if ((offset - phase) % intervalMonths !== 0) return;

              const lastDay = new Date(Date.UTC(m.year, m.month + 1, 0)).getUTCDate();
              const day = Math.min(dayOfMonth, lastDay);
              const dateKey = `${m.year}-${pad(m.month + 1)}-${pad(day)}`;
              // The first and last months of a range are usually partial.
              if (!isInRange(dateKey)) return;

              const dayIndex = toDayIndex(new Date(Date.UTC(m.year, m.month, day)));

              /* One seed, one visit — the same derivation the week grid uses, so a
                 visit reached from either surface carries the same status,
                 technician and window. */
              const { seed, plan, windowIndex, statusIndex } = visitRecipeFor(site, dayIndex);
              const assigned = plan !== 'unassigned' && plan !== 'blockedNoTour';
              const win = VISIT_WINDOWS[windowIndex % VISIT_WINDOWS.length];

              byMonth[index].push({
                id: visitIdFor(site, dayIndex),
                date: dateKey,
                day,
                // The grid's own derivation, so a visit reached from the company
                // matrix cannot report a different status than the card does.
                status: resolveVisitStatus(plan, dayIndex, statusIndex),
                runsheetName: assigned ? routeForSite(site).name : null,
                officer: assigned ? OFFICERS[seed % OFFICERS.length] : null,
                startsAt: isoAtDayIndex(dayIndex, win.startHour),
                endsAt: isoAtDayIndex(dayIndex, win.endHour),
              });
              total += 1;
            });
          }

          /* The one piece of history this surface carries. A forward list that
           cannot say when you were last there is missing the question customers
           actually open with. */
          let lastVisitAt = null;
          if (hasSchedule) {
            for (let back = 1; back <= intervalMonths + 1; back++) {
              const m = new Date(Date.UTC(months[0].year, months[0].month - back, 1));
              const offset = absMonth(m.getUTCFullYear(), m.getUTCMonth()) - firstAbsMonth;
              if ((((offset - phase) % intervalMonths) + intervalMonths) % intervalMonths !== 0)
                continue;
              const lastDay = new Date(
                Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0),
              ).getUTCDate();
              const day = Math.min(dayOfMonth, lastDay);
              lastVisitAt = `${m.getUTCFullYear()}-${pad(m.getUTCMonth() + 1)}-${pad(day)}`;
              break;
            }
          }

          return {
            id: site.id,
            name: site.name,
            intervalMonths,
            cadenceLabel: cadenceLabelFor(intervalMonths),
            filterCount: filterCountFor(site),
            lastVisitAt,
            months: byMonth,
            totalVisits: total,
          };
        });

      return {
        customerId,
        name,
        siteCount: sites.length,
        totalVisits: sites.reduce((sum, site) => sum + site.totalVisits, 0),
        unscheduledSiteCount: sites.filter((site) => !site.intervalMonths).length,
        sites,
      };
      // A location filter can empty a company out. An empty group is a row that
      // says nothing, so it does not travel.
    })
    .filter((company) => company.sites.length > 0);

  /* Every company and location in the book, whatever the filters narrowed the
     payload to — the filter controls have to keep offering the option that would
     widen the scope again, and they cannot do that from a filtered list. */
  const filterOptions = {
    companies: VISIT_COMPANY_BOOK.map(([customerId, name, siteNames]) => ({
      customerId,
      name,
      sites: siteNames
        .map((siteName) => VISIT_SITE_BY_NAME.get(siteName))
        .filter(Boolean)
        .map((site) => ({ id: site.id, name: site.name })),
    })),
  };

  return {
    months,
    from,
    to,
    companies,
    filterOptions,
    totals: {
      companyCount: companies.length,
      siteCount: companies.reduce((sum, co) => sum + co.siteCount, 0),
      visitCount: companies.reduce((sum, co) => sum + co.totalVisits, 0),
    },
  };
};
