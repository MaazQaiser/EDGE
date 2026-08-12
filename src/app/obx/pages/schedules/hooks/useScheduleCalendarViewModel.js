import { useMemo } from 'react';
import { dayjsWithTimezone } from 'src/app/obx/pages/schedules/helper';
import { filterResourcesToScheduled } from 'src/app/obx/pages/schedules/helper/scheduleResponseAdapter';
import { DAY_GRID } from 'src/utils/constants/schedules';

const normalizeResourceId = (value) => {
  if (value === undefined || value === null) return null;
  return String(value);
};

const getOverviewEventStart = (eventStart) => {
  if (!eventStart) return eventStart;
  if (/^\d{4}-\d{2}-\d{2}$/.test(eventStart)) return eventStart;

  return dayjsWithTimezone(eventStart).format('YYYY-MM-DD');
};

const normalizeOverviewEvent = (shift = {}, resourceId, fallbackId) => {
  const event = { ...shift };
  delete event.resourceID;
  delete event.resourceIds;

  const eventId = event.id || event.shiftActivityLogId || fallbackId;
  const eventEnd = event.endsAt || event.end;
  const eventStart = event.start || event.startsAt;
  delete event.end;

  return {
    ...event,
    id: eventId,
    title: event.name,
    resourceId,
    start: getOverviewEventStart(eventStart),
    startsAt: event.startsAt || event.start,
    endsAt: eventEnd,
  };
};

const isOverviewSiteBandRow = (row = {}) =>
  Boolean(row.isDedicatedSiteBand || row.extendedProps?.isDedicatedSiteBand);

const overviewSectionHasScheduleContent = (rows = []) =>
  rows.some((row) => {
    if (isOverviewSiteBandRow(row)) return false;
    return (row.shifts || []).length > 0;
  });

const buildOverviewResources = ({ sections = [], expandedSections }) => {
  // With a single section the accordion header only repeats the tab label, so
  // the rows are shown directly and the band is dropped.
  const hideSectionBands = sections.length <= 1;

  return sections.flatMap((section, sectionIndex) => {
    const sectionResource = {
      id: section.id,
      title: section.title,
      isOverviewSection: true,
      overviewSection: section.id,
      sortOrder: sectionIndex * 10000,
    };

    if (hideSectionBands) {
      const rows = section.rows || [];
      if (!overviewSectionHasScheduleContent(rows)) {
        return [
          {
            id: `${section.id}-empty`,
            title: ' ',
            isOverviewEmptyState: true,
            overviewSection: section.id,
            sortOrder: sectionIndex * 10000 + 1,
          },
        ];
      }

      return rows.map((row, index) => ({
        ...row,
        id: normalizeResourceId(row.id) || `${section.id}-row-${index}`,
        title: row.title || row.label || row.name,
        overviewSection: section.id,
        sortOrder: sectionIndex * 10000 + index + 1,
      }));
    }

    if (!expandedSections[section.id]) {
      return [sectionResource];
    }

    const rows = section.rows || [];
    if (!overviewSectionHasScheduleContent(rows)) {
      return [
        sectionResource,
        {
          id: `${section.id}-empty`,
          title: ' ',
          isOverviewEmptyState: true,
          overviewSection: section.id,
          sortOrder: sectionIndex * 10000 + 1,
        },
      ];
    }

    const rowResources = rows.map((row, index) => ({
      ...row,
      id: normalizeResourceId(row.id) || `${section.id}-row-${index}`,
      title: row.title || row.label || row.name,
      overviewSection: section.id,
      sortOrder: sectionIndex * 10000 + index + 1,
    }));

    return [sectionResource, ...rowResources];
  });
};

const buildOverviewEvents = ({ sections = [], expandedSections }) =>
  sections.flatMap((section) => {
    // Single-section overviews have no collapsible band, so their rows are
    // always rendered and their events must always be emitted.
    if (sections.length > 1 && !expandedSections[section.id]) return [];

    return (section.rows || []).flatMap((row, rowIndex) => {
      const rowId = normalizeResourceId(row.id) || `${section.id}-row-${rowIndex}`;

      return (row.shifts || []).map((shift, shiftIndex) =>
        normalizeOverviewEvent(shift, rowId, `${rowId}-shift-${shiftIndex}`),
      );
    });
  });

const EMPTY_STATE_TAB_IDS = new Set(['overview', 'dedicated', 'patrol', 'embedded', 'visits']);

const hasWeekLocationResources = (locations = []) =>
  locations.some((row) => !row?.extendedProps?.isDedicatedSiteBand);

/**
 * Builds calendar resources/events for schedule tabs from already-fetched data.
 * Tab-specific shapes stay here; the common Calendar only receives the result.
 */
export const useScheduleCalendarViewModel = ({
  scheduleTabConfig,
  selectedViewType,
  overviewSections,
  weekViewLocations,
  events,
  overviewExpandedSections,
  dayViewDuties,
  showOnlyScheduledSites = false,
}) => {
  const isOverviewWeekView = scheduleTabConfig?.isOverviewTab && selectedViewType === DAY_GRID.WEEK;
  const isDedicatedWeekView =
    scheduleTabConfig?.id === 'dedicated' && selectedViewType === DAY_GRID.WEEK;
  const isOfficerWeekView =
    scheduleTabConfig?.id === 'officer' && selectedViewType === DAY_GRID.WEEK;
  const isPatrolWeekView = scheduleTabConfig?.id === 'patrol' && selectedViewType === DAY_GRID.WEEK;
  const isVisitsWeekView = scheduleTabConfig?.id === 'visits' && selectedViewType === DAY_GRID.WEEK;
  const isEmbeddedWeekView =
    Boolean(scheduleTabConfig?.isLegacyEmbeddedView) && selectedViewType === DAY_GRID.WEEK;
  const hasCustomResourceLabels =
    isOverviewWeekView ||
    isDedicatedWeekView ||
    isOfficerWeekView ||
    isPatrolWeekView ||
    isVisitsWeekView;

  const resolvedOverviewSections = isOverviewWeekView ? overviewSections : [];

  const calendarResources = useMemo(() => {
    if (isOverviewWeekView) {
      return buildOverviewResources({
        sections: resolvedOverviewSections,
        expandedSections: overviewExpandedSections,
      });
    }

    const resources = weekViewLocations || [];

    // The quick filter is presentational — it drops rows the client already holds,
    // so it applies here rather than at fetch time and toggles instantly.
    if (isVisitsWeekView && showOnlyScheduledSites) {
      return filterResourcesToScheduled(resources);
    }

    return resources;
  }, [
    isOverviewWeekView,
    resolvedOverviewSections,
    overviewExpandedSections,
    weekViewLocations,
    isVisitsWeekView,
    showOnlyScheduledSites,
  ]);

  const calendarEvents = useMemo(() => {
    if (isOverviewWeekView) {
      return buildOverviewEvents({
        sections: resolvedOverviewSections,
        expandedSections: overviewExpandedSections,
      });
    }

    return events;
  }, [isOverviewWeekView, resolvedOverviewSections, overviewExpandedSections, events]);

  const hasNoScheduleData = useMemo(() => {
    if (!EMPTY_STATE_TAB_IDS.has(scheduleTabConfig?.id)) return false;

    // Overview week keeps accordion sections and uses per-section empty rows.
    if (isOverviewWeekView) {
      return false;
    }

    if (isDedicatedWeekView || isPatrolWeekView || isVisitsWeekView) {
      return !hasWeekLocationResources(weekViewLocations);
    }

    // Site/user embedded week: show no-shift UI when there are no shifts.
    if (isEmbeddedWeekView) {
      return !Array.isArray(events) || events.length === 0;
    }

    if (selectedViewType === DAY_GRID.DAY) {
      return !Object.values(dayViewDuties || {}).some((shifts) => (shifts || []).length > 0);
    }

    // Month (main + site/user): show no-shift UI when there are no shifts.
    if (selectedViewType === DAY_GRID.MONTH) {
      return !Array.isArray(events) || events.length === 0;
    }

    return false;
  }, [
    scheduleTabConfig?.id,
    isOverviewWeekView,
    isDedicatedWeekView,
    isPatrolWeekView,
    isVisitsWeekView,
    isEmbeddedWeekView,
    weekViewLocations,
    selectedViewType,
    dayViewDuties,
    events,
  ]);

  const isDayView = selectedViewType === DAY_GRID.DAY;
  const isMonthView = selectedViewType === DAY_GRID.MONTH;
  const skeletonVariant = isDayView
    ? 'day'
    : isMonthView
      ? 'month'
      : isOverviewWeekView
        ? 'overview'
        : isDedicatedWeekView
          ? 'dedicated'
          : isPatrolWeekView || isVisitsWeekView
            ? 'patrol'
            : isOfficerWeekView
              ? 'officer'
              : 'default';

  // A single-section overview renders its rows directly, with no accordion band
  // to explain what they are — so the resource column needs a header, which the
  // multi-section overview does not.
  const isSingleSectionOverview = isOverviewWeekView && resolvedOverviewSections.length === 1;
  const resourceAreaHeaderKey =
    scheduleTabConfig?.resourceAreaHeaderKey || (isSingleSectionOverview ? 'runsheets' : null);

  return {
    calendarResources,
    calendarEvents,
    resourceAreaHeaderKey,
    isOverviewWeekView,
    isDedicatedWeekView,
    isOfficerWeekView,
    isPatrolWeekView,
    isVisitsWeekView,
    hasCustomResourceLabels,
    hasNoScheduleData,
    skeletonVariant,
  };
};

export const buildSortedDayViewData = (dayViewDuties = {}, dayViewLocations = []) => {
  // The response already lists locations in the order they should appear — the
  // visits day view puts unassigned demand first, matching the week grid.
  // Re-sorting by id here pushed it to the bottom, which buried the one group
  // the view exists to surface.
  const sortedLocations = [...dayViewLocations];

  const locationOrderMap = sortedLocations.reduce((acc, location, index) => {
    acc[location?.title] = index;
    return acc;
  }, {});

  const sortedEvents = Object.entries(dayViewDuties || {}).sort(
    ([locationNameA], [locationNameB]) => {
      const orderA = locationOrderMap[locationNameA] ?? 999;
      const orderB = locationOrderMap[locationNameB] ?? 999;
      return orderA - orderB;
    },
  );

  return { sortedLocations, sortedEvents };
};
