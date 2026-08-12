import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { SCHEDULE_STATS_FOOTER_VARIANTS } from '../components/scheduleStatsFooter';
import { dayjsWithStandardOffset } from '../helper';

const GRID_SHIFT_TYPES = {
  dedicated: SCHEDULE_DUTIES.DEDICATED,
  patrol: SCHEDULE_DUTIES.PATROL,
  runsheet: SCHEDULE_DUTIES.PATROL,
  extra: SCHEDULE_DUTIES.EXTRA,
  extraJob: SCHEDULE_DUTIES.EXTRA,
  extraRunsheet: SCHEDULE_DUTIES.HIT,
  hit: SCHEDULE_DUTIES.HIT,
  dispatch: SCHEDULE_DUTIES.DISPATCH,
};

const getSectionRows = (section = {}) => section.rows || [];
const getRowShifts = (row = {}) => row.shifts || [];
const getShiftType = (shift = {}) =>
  GRID_SHIFT_TYPES[shift.legendType] || GRID_SHIFT_TYPES[shift.shiftType] || shift.shiftType;

const normalizeOfficer = (officer) =>
  officer
    ? {
        ...officer,
        imageUrl: officer.imageUrl || officer.image,
      }
    : officer;

const mapShiftToCalendarEvent = (shift = {}, row = {}, resourceId) => {
  const event = { ...shift };
  delete event.end;
  delete event.resourceID;
  delete event.resourceIds;

  return {
    ...event,
    id: event.id || event.shiftActivityLogId,
    title: event.title || event.name || row.title,
    name: event.name || event.title || row.title,
    shiftType: getShiftType(event),
    apiShiftType: event.shiftType,
    resourceId,
    startsAt: event.startsAt || shift.start,
    endsAt: event.endsAt || shift.end,
    // Same day placement as pre-revamp week view (ignore API dayKey).
    start: dayjsWithStandardOffset(shift.start || shift.startsAt).format('YYYY-MM-DD'),
    officer: normalizeOfficer(event.officer),
    reassignedOfficer: normalizeOfficer(event.reassignedOfficer),
    runsheetName: event.runsheetName || event.runsheet?.name || row.title || event.name,
  };
};

const isUnassignedRow = (row = {}) =>
  row.key === 'unassigned' ||
  row.key === 'unassigned-location' ||
  row.meta?.locationId === null ||
  `${row.title || ''}`.toLowerCase().includes('unassigned');

const compareTitles = (left = {}, right = {}) =>
  `${left.title || left.name || ''}`.localeCompare(
    `${right.title || right.name || ''}`,
    undefined,
    {
      sensitivity: 'base',
    },
  );

/**
 * When this site is next due, as a sortable number.
 *
 * A row with visits in the visible range is keyed on its earliest one. A quiet row
 * is keyed on `nextVisitAt` — the next visit beyond the range — which is what puts
 * it in the same ordering rather than in a separate alphabetical block. A site with
 * no future visit at all has no place on a timeline, so it sorts last.
 */
const getRowChronologyKey = (row = {}) => {
  const shifts = getRowShifts(row);

  if (shifts.length) {
    return Math.min(
      ...shifts.map((shift) => dayjsWithStandardOffset(shift.startsAt || shift.start).valueOf()),
    );
  }

  const nextVisitAt = row.meta?.nextVisitAt;
  if (nextVisitAt) return dayjsWithStandardOffset(nextVisitAt).valueOf();

  return Number.POSITIVE_INFINITY;
};

/**
 * Chronological: the grid reads top to bottom as the order things happen.
 *
 * This replaced "sites with visits first, then alphabetical". Alphabetical put
 * Alderwood above Downtown whether Alderwood was serviced on Monday or Friday,
 * which is no use to someone planning a week — and it made the eye scan for a name
 * it already knew instead of reading the sequence of work.
 *
 * Sites with visits still land above quiet ones, but now as a *consequence* rather
 * than a rule: a visit inside the range is always earlier than one beyond it.
 * Ties fall back to the name so the order is stable between fetches.
 */
const compareChronologically = (left = {}, right = {}) => {
  const leftKey = getRowChronologyKey(left);
  const rightKey = getRowChronologyKey(right);

  if (leftKey !== rightKey) return leftKey - rightKey;
  return compareTitles(left, right);
};

/**
 * Unassigned rows sink to the bottom by default — on a runsheet grid they are a
 * remainder. On the visits grid they are the point of the screen, so that view
 * pins them to the top instead.
 */
const sortRows = (rows = [], { pinUnassignedFirst = false, chronological = false } = {}) => {
  const comparator = chronological ? compareChronologically : compareTitles;
  const assigned = rows.filter((row) => !isUnassignedRow(row)).sort(comparator);
  const unassigned = rows.filter(isUnassignedRow);

  /**
   * Mark where the worked rows stop and the quiet ones begin. Without a boundary
   * the eye cannot tell "this week's work" from "the rest of the book" — and with
   * a sparse cadence the rest of the book is most of the screen.
   */
  if (chronological) {
    const firstQuietIndex = assigned.findIndex((row) => getRowShifts(row).length === 0);
    if (firstQuietIndex > 0) {
      assigned[firstQuietIndex] = { ...assigned[firstQuietIndex], isFirstQuietRow: true };
    }
  }

  return pinUnassignedFirst ? [...unassigned, ...assigned] : [...assigned, ...unassigned];
};

const sortShifts = (shifts = []) =>
  [...shifts].sort((left, right) =>
    dayjsWithStandardOffset(left.startsAt || left.start).diff(
      dayjsWithStandardOffset(right.startsAt || right.start),
    ),
  );

const getUnassignedLocationShiftCount = (section = {}) =>
  getSectionRows(section)
    .filter(isUnassignedRow)
    .reduce((sum, row) => sum + getRowShifts(row).length, 0);

const getSiteBandSubtitle = (section = {}) => {
  // Below site name: count of shifts with unassigned location (not location rows).
  const count =
    section.meta?.unassignedLocationShiftCount ?? getUnassignedLocationShiftCount(section);
  return `${count} Unassigned Location${count === 1 ? '' : 's'}`;
};

const mapSectionsToGrid = (
  sections = [],
  { showSectionBands = false, pinUnassignedFirst = false, chronological = false } = {},
) => {
  const rows = [];
  const shifts = [];
  const sortedSections = [...sections].sort(compareTitles);

  sortedSections.forEach((section, sectionIndex) => {
    const sectionId = String(section.id || section.key || `section-${sectionIndex}`);
    const sectionRows = sortRows(getSectionRows(section), {
      pinUnassignedFirst,
      chronological,
    });

    if (showSectionBands) {
      rows.push({
        id: sectionId,
        key: section.key,
        title: section.title || '',
        subtitle: getSiteBandSubtitle(section),
        meta: section.meta,
        isDedicatedSiteBand: true,
        sortOrder: sectionIndex * 10000,
      });
    }

    sectionRows.forEach((row, rowIndex) => {
      const rowId = String(row.id || row.key || `${sectionId}-row-${rowIndex}`);
      const rowShifts = sortShifts(getRowShifts(row));
      const shiftCount = rowShifts.length;
      const subtitle =
        row.subtitle || `${shiftCount} Shift${shiftCount === 1 ? '' : 's'} this week`;

      rows.push({
        id: rowId,
        key: row.key,
        title: row.title || '',
        subtitle,
        meta: row.meta,
        avatar:
          row.avatar ||
          row.imageUrl ||
          row.image ||
          row.officer?.imageUrl ||
          row.officer?.image ||
          row.meta?.imageUrl ||
          row.meta?.avatar ||
          null,
        sectionId,
        sectionKey: section.key,
        sectionTitle: section.title,
        sortOrder: sectionIndex * 10000 + rowIndex + 1,
        isUnassignedLocation: isUnassignedRow(row),
        isFirstQuietRow: Boolean(row.isFirstQuietRow),
      });

      rowShifts.forEach((shift) => {
        shifts.push(mapShiftToCalendarEvent(shift, row, rowId));
      });
    });
  });

  return { rows, shifts };
};

/**
 * The main schedule route has a stable grid-v2 contract. Only convert its
 * section/row shape into the flat resource/event shape required by FullCalendar.
 */
export const mapGridV2WeekData = (data = {}) => {
  const isVisits = data.view === 'visits';

  return mapSectionsToGrid(data.sections || [], {
    showSectionBands: data.view === 'dedicated',
    pinUnassignedFirst: isVisits,
    // The visits grid reads top to bottom as the order the work happens.
    chronological: isVisits,
  });
};

/**
 * Drops rows with nothing scheduled in the visible range — the quick filter.
 *
 * Applied to already-mapped resources rather than at fetch time, so toggling it is
 * instant and costs no request. Events on a dropped row cannot be orphaned: a row
 * is only dropped when it has no visits to begin with. The unassigned band always
 * survives — it is demand, not a site, and hiding it would hide the work that most
 * needs doing.
 */
export const filterResourcesToScheduled = (resources = []) =>
  resources.filter((resource) => {
    if (resource.extendedProps?.isUnassignedLocation) return true;
    if (resource.extendedProps?.isDedicatedSiteBand) return true;
    return (Number(resource.extendedProps?.meta?.visitCount) || 0) > 0;
  });

export const mapWeekRowsToCalendarResources = (rows = []) =>
  rows.map((row) => ({
    id: String(row.id),
    title: row.title || '',
    sortOrder: row.sortOrder ?? 0,
    extendedProps: {
      key: row.key,
      subtitle: row.subtitle,
      meta: row.meta,
      avatar: row.avatar,
      sectionId: row.sectionId,
      sectionKey: row.sectionKey,
      sectionTitle: row.sectionTitle,
      isDedicatedSiteBand: Boolean(row.isDedicatedSiteBand),
      isUnassignedLocation: Boolean(row.isUnassignedLocation),
      isFirstQuietRow: Boolean(row.isFirstQuietRow),
    },
  }));

const buildOverviewSection = (template, apiSection, grid) => {
  const resolvedTemplate = template || {
    id: `overview-${apiSection.key || apiSection.id}`,
    title: apiSection.title,
  };
  const shiftsByResourceId = grid.shifts.reduce((result, shift) => {
    result[shift.resourceId] = [...(result[shift.resourceId] || []), shift];
    return result;
  }, {});

  return {
    ...resolvedTemplate,
    // Prefer tenant-aware template title over API English defaults (e.g. "Patrol Shifts").
    title: resolvedTemplate.title || apiSection.title,
    rows: grid.rows.map((row) => ({
      ...row,
      id: `${resolvedTemplate.id}:${row.id}`,
      shifts: shiftsByResourceId[row.id] || [],
    })),
  };
};

/** Maps a single Overview accordion section from a patrol or dedicated grid-v2 response. */
export const mapGridV2OverviewSection = (data = {}, template) => {
  if (!template) return { id: '', title: '', rows: [] };

  const isDedicated = template.id.includes('dedicated');
  const sections = data.sections || [];
  if (!sections.length) return { ...template, rows: [] };

  const grid = mapSectionsToGrid(sections, { showSectionBands: isDedicated });
  return buildOverviewSection(template, { title: template.title }, grid);
};

/**
 * Builds Overview accordion sections from separate patrol + dedicated grid-v2
 * responses (same shapes as the Patrol / Dedicated tabs).
 */
export const mapGridV2OverviewSections = ({ patrol = {}, dedicated = {} } = {}, templates = []) =>
  templates.map((template) => {
    const isDedicated = template.id.includes('dedicated');
    return mapGridV2OverviewSection(isDedicated ? dedicated : patrol, template);
  });

const LEGEND_SUM_KEYS = [
  'dedicated',
  'patrol',
  'extraJob',
  'extraRunsheet',
  'dispatch',
  'completed',
  'inProgress',
  'notStarted',
  'unassigned',
  'split',
];

/** Sums legend / status counts from dedicated + patrol footerStats responses. */
export const sumScheduleFooterLegends = (...footerStatsList) => {
  const legend = Object.fromEntries(LEGEND_SUM_KEYS.map((key) => [key, 0]));

  footerStatsList.filter(Boolean).forEach((footerStats) => {
    LEGEND_SUM_KEYS.forEach((key) => {
      const fromLegend = Number(footerStats.legend?.[key]);
      const fromStatuses = Number(footerStats.statuses?.[key]);
      const value = Number.isFinite(fromLegend)
        ? fromLegend
        : Number.isFinite(fromStatuses)
          ? fromStatuses
          : 0;
      legend[key] += value;
    });
  });

  return legend;
};

/**
 * Combines unfiltered summary/stats KPIs (coverage + top row) with summed
 * dedicated/patrol legends (bottom row).
 */
export const buildOverviewFooterStats = (kpiStats = {}, ...footerStatsList) => {
  const legend = sumScheduleFooterLegends(...footerStatsList);

  return {
    overview: kpiStats,
    coverage: kpiStats.coverage,
    legend,
    statuses: {
      completed: legend.completed,
      inProgress: legend.inProgress,
      notStarted: legend.notStarted,
      unassigned: legend.unassigned,
      split: legend.split,
    },
  };
};

export const getScheduleLocationFilterOptions = (data = {}) => {
  const uniqueLocations = new Map();

  const addLocation = (location) => {
    if (!location || typeof location !== 'object') return;

    const id = location.id ?? location.locationId ?? location.value;
    if (id == null || id === '' || Number(id) < 0) return;

    const name = location.name ?? location.title ?? location.label;
    if (!name) return;

    const key = String(id);
    if (!uniqueLocations.has(key)) {
      uniqueLocations.set(key, { id, name });
    }
  };

  const collectFromSections = (sections = []) => {
    sections.forEach((section) => {
      // Prefer site-level locations[] (full site locations), not meta or shift rows.
      if (Array.isArray(section?.locations) && section.locations.length) {
        section.locations.forEach(addLocation);
      }

      if (Array.isArray(section?.sections) && section.sections.length) {
        collectFromSections(section.sections);
      }
    });
  };

  collectFromSections(data.sections || []);

  return [...uniqueLocations.values()]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(({ id, name }) => ({ label: name, value: String(id) }));
};

const value = (metric) => `${metric ?? 0}`;
const metricPair = (metric = {}) => {
  const current = metric.completed ?? metric.scheduled ?? metric.done ?? metric.assigned ?? 0;
  const total = metric.total ?? metric.scheduled;

  return {
    value: value(current),
    suffix: total == null ? '' : `/${total}`,
  };
};

const mapStatusStats = (footerStats = {}) => {
  const { legend = {}, statuses = {} } = footerStats;

  return [
    { id: 'completed', value: value(statuses.completed ?? legend.completed) },
    { id: 'inProgress', value: value(statuses.inProgress ?? legend.inProgress) },
    { id: 'notStarted', value: value(statuses.notStarted ?? legend.notStarted) },
    { id: 'unassigned', value: value(statuses.unassigned ?? legend.unassigned) },
    { id: 'split', value: value(statuses.split ?? legend.split) },
  ];
};

export const mapFooterStatsToScheduleStatsFooter = (
  footerStats,
  variant = SCHEDULE_STATS_FOOTER_VARIANTS.OVERVIEW,
) => {
  if (!footerStats) return null;

  const { legend = {}, overview = {} } = footerStats;
  const statusStats = mapStatusStats(footerStats);

  if (variant === SCHEDULE_STATS_FOOTER_VARIANTS.PATROL) {
    return {
      dutyStats: [
        { id: 'patrol', value: value(legend.patrol) },
        { id: 'extraRunsheet', value: value(legend.extraRunsheet) },
        { id: 'dispatch', value: value(legend.dispatch) },
      ],
      statusStats,
    };
  }

  if (variant === SCHEDULE_STATS_FOOTER_VARIANTS.VISITS) {
    const { statuses = {} } = footerStats;
    return {
      dutyStats: [
        { id: 'patrol', value: value(legend.patrol) },
        { id: 'extraRunsheet', value: value(legend.extraRunsheet) },
        {
          id: 'sitesServiced',
          value: value(legend.sitesServiced),
          suffix: legend.sitesTotal == null ? '' : `/${legend.sitesTotal}`,
        },
      ],
      // Visits swap `split` (a shift concept) for the two terminal states the
      // grid draws, so the footer totals match what is on screen.
      statusStats: [
        ...statusStats.filter((stat) => stat.id !== 'split'),
        { id: 'missed', value: value(statuses.missed ?? legend.missed) },
        { id: 'cancelled', value: value(statuses.cancelled ?? legend.cancelled) },
      ],
    };
  }

  if (variant === SCHEDULE_STATS_FOOTER_VARIANTS.DEDICATED) {
    return {
      dutyStats: [
        { id: 'dedicated', value: value(legend.dedicated) },
        { id: 'extra', value: value(legend.extraJob) },
        { id: 'dispatch', value: value(legend.dispatch) },
      ],
      statusStats,
    };
  }

  return {
    coverage: overview.coverage?.percentage ?? footerStats.coverage?.percentage ?? 0,
    metrics: [
      { id: 'scheduledOfficers', ...metricPair(overview.scheduledOfficers) },
      { id: 'hoursCompleted', ...metricPair(overview.hoursCompleted) },
      { id: 'overtime', value: value(overview.overtimeHours) },
      { id: 'runsheetsCompleted', ...metricPair(overview.runsheetsCompleted) },
      { id: 'patrolVisitsCompleted', ...metricPair(overview.patrolVisitsCompleted) },
      { id: 'dispatchCompleted', ...metricPair(overview.dispatchCompleted) },
    ],
    dutyStats: [
      { id: 'dedicated', value: value(legend.dedicated) },
      { id: 'patrol', value: value(legend.patrol) },
      { id: 'extra', value: value(legend.extraJob ?? legend.extra) },
      { id: 'dispatch', value: value(legend.dispatch) },
    ],
    statusStats,
  };
};
