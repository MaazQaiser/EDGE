import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * The **client-side** narrowing the Companies scope needs: the status filter, the
 * search box's free text, and the trim from the fetched month envelope down to the
 * days actually on show.
 *
 * They live here rather than in either view because both views have to narrow the
 * identical payload the identical way — a visit hidden on one and shown on the
 * other is the same bug the shared fetch was introduced to kill. The endpoint takes
 * the date range, the company and the location; status and text are applied on
 * arrival because they are read-as-you-type controls and a round trip per keystroke
 * is not worth a payload that is already in memory.
 *
 * The **window** is the newer of the three and is the odd one, because the endpoint
 * does take a date range. It is applied here as well because the request asks for
 * whole calendar months (`companiesViewRange.fetchWindowFor`, and see the note
 * there): a Day view fetches all of August and has to show one day of it, so the
 * last cut is this one. On the Year view the two windows are identical by
 * construction and this trim is a no-op — which is what keeps that view's output
 * unchanged by any of it.
 */

/** No status chosen. Empty rather than null so `CustomDropDown` can select it. */
export const STATUS_FILTER_ALL = '';

/**
 * One option can cover more than one status, because the *card* does.
 *
 * `shiftStarted` and `inProgress` are drawn identically on both views — a visit
 * whose route has started — so offering them as two filter rows would ask the
 * planner to distinguish something the screen never distinguishes. `upcoming` and
 * `incomplete` are absent for the opposite reason: neither view has a treatment
 * for them, so filtering to one would empty the screen with no explanation.
 */
const STATUS_FILTER_MATCHES = {
  [calendarShiftStatusEnum.NOT_STARTED]: [calendarShiftStatusEnum.NOT_STARTED],
  [calendarShiftStatusEnum.IN_PROGRESS]: [
    calendarShiftStatusEnum.IN_PROGRESS,
    calendarShiftStatusEnum.SHIFT_STARTED,
  ],
  [calendarShiftStatusEnum.COMPLETED]: [calendarShiftStatusEnum.COMPLETED],
  [calendarShiftStatusEnum.MISSED]: [calendarShiftStatusEnum.MISSED],
  [calendarShiftStatusEnum.CANCELLED]: [calendarShiftStatusEnum.CANCELLED],
  [calendarShiftStatusEnum.UNASSIGNED]: [calendarShiftStatusEnum.UNASSIGNED],
};

/**
 * The filter row's options, in the order a visit moves through them.
 *
 * Labels come from the scheduler's own filter vocabulary so the two tabs name a
 * status the same way. `missed` is the one exception — `filters.status` has no
 * entry for it, because the week grid's shifts cannot be missed and these visits
 * can, so it borrows the calendar's status label instead of inventing a second
 * word for something already spelled on the legend below.
 */
export const statusFilterOptions = (t) => [
  { value: STATUS_FILTER_ALL, label: t('obx.schedules.filters.status.all') },
  {
    value: calendarShiftStatusEnum.NOT_STARTED,
    label: t('obx.schedules.filters.status.notStarted'),
  },
  {
    value: calendarShiftStatusEnum.IN_PROGRESS,
    label: t('obx.schedules.filters.status.inProgress'),
  },
  { value: calendarShiftStatusEnum.COMPLETED, label: t('obx.schedules.filters.status.completed') },
  {
    value: calendarShiftStatusEnum.MISSED,
    label: t('obx.schedules.calendar.scheduleStatus.missed'),
  },
  { value: calendarShiftStatusEnum.CANCELLED, label: t('obx.schedules.filters.status.cancelled') },
  {
    value: calendarShiftStatusEnum.UNASSIGNED,
    label: t('obx.schedules.filters.status.unassigned'),
  },
];

const matchesText = (value, needle) => `${value ?? ''}`.toLowerCase().includes(needle);

/**
 * A–Z, by the name on screen — companies and the locations under each of them.
 *
 * The payload arrives in the book's own order, which is neither alphabetical nor
 * anything a planner can predict, so both views drew customers in an order that
 * looked arbitrary because it was. Sorting here rather than in either view is the
 * point: the two must not disagree about where a row is.
 *
 * `sensitivity: 'base'` so "ÉDGE" files with "EDGE" and case never decides an
 * order, and `numeric` so "Site 2" precedes "Site 10".
 */
const byName = (left, right) =>
  `${left?.name ?? ''}`.localeCompare(`${right?.name ?? ''}`, undefined, {
    sensitivity: 'base',
    numeric: true,
  });

const sortByName = (companies = []) =>
  [...companies]
    .sort(byName)
    .map((company) => ({ ...company, sites: [...(company.sites || [])].sort(byName) }));

const countVisits = (site) =>
  (site.months || []).reduce((total, bucket) => total + (bucket || []).length, 0);

/**
 * One pass over a location's month buckets, dropping the visits that fail `keep`.
 *
 * Status and window are two predicates over the same nested shape, and running
 * them as one map rather than as two chained ones is what keeps the bucket array
 * aligned to the payload's month columns — the matrix view indexes into it
 * positionally, so buckets can be emptied but never removed or reordered.
 */
const filterVisits = (site, keep) => ({
  ...site,
  months: (site.months || []).map((bucket) => (bucket || []).filter(keep)),
});

/**
 * The payload, narrowed by the status filter, the search text and the visible
 * window.
 *
 * **A site that keeps no visits keeps its row — except on an execution grain.**
 * Dropping the empty row reshuffles the list under the planner every time they
 * touch the status dropdown, and the whole value of a row per location is that the
 * location stays where they last saw it. An empty row states "nothing of that kind
 * here", which is an answer; a vanished row states nothing at all.
 *
 * That reasoning is about a *planning* surface, and it stops holding on Day and
 * Week, where forty locations reading "—" bury the three being serviced. So
 * `dropQuiet` — set by those two grains and by nothing else, see
 * `companiesViewRange.isExecutionGrain` — removes the silent rows and then the
 * companies left holding none. It is off for Month and Year, so neither of those
 * changes behaviour at all.
 *
 * A *company* is otherwise dropped only when the text matches neither it nor any of
 * its locations — that is the search doing its job. Matching a location never
 * hides the company holding it, and matching a company brings all of its
 * locations, so "walmart" lists the ten stores rather than only the ones with the
 * word in the building name.
 */
export const narrowCompanies = (companies = [], { status, query, from, to, dropQuiet } = {}) => {
  const needle = `${query ?? ''}`.trim().toLowerCase();
  const statuses = STATUS_FILTER_MATCHES[status] || null;
  /* `visit.date` is a `YYYY-MM-DD` key and so are these, so the comparison is a
     plain string one — no parsing, no timezone, and the same test the endpoint
     itself applies to the range it is given. */
  const visible = from && to ? { from, to } : null;
  if (!needle && !statuses && !visible) return sortByName(companies);

  const keepVisit = (visit) => {
    if (statuses && !statuses.includes(visit.status)) return false;
    if (visible && (visit.date < visible.from || visit.date > visible.to)) return false;
    return true;
  };

  const narrowed = [];

  companies.forEach((company) => {
    const sites = company.sites || [];
    const companyMatches = !needle || matchesText(company.name, needle);
    const kept = companyMatches ? sites : sites.filter((site) => matchesText(site.name, needle));
    if (!kept.length) return;

    let narrowedSites =
      statuses || visible ? kept.map((site) => filterVisits(site, keepVisit)) : kept;

    if (dropQuiet) narrowedSites = narrowedSites.filter((site) => countVisits(site) > 0);
    if (dropQuiet && !narrowedSites.length) return;

    narrowed.push({
      ...company,
      sites: narrowedSites,
      /* Recounted, not carried over: `totalVisits` describes the payload, and the
         group header that prints it sits above the rows this narrowing produced. */
      totalVisits: narrowedSites.reduce((total, site) => total + countVisits(site), 0),
    });
  });

  return sortByName(narrowed);
};

/** True when anything beyond the date window is narrowing what is on screen. */
export const isScopeNarrowed = (scope = {}) =>
  Boolean(
    (scope.customerIds || []).length ||
    (scope.siteIds || []).length ||
    scope.status ||
    `${scope.query ?? ''}`.trim(),
  );
