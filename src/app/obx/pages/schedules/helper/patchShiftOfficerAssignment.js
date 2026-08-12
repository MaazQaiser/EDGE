/**
 * Update a single calendar shift's officer fields by calendar event id.
 * Returns null if no shift matched.
 */
export const updateCalendarShiftOfficerById = (collections, shiftId, officer) => {
  if (shiftId == null || shiftId === '') return null;

  const id = String(shiftId);
  const isMatch = (shift) =>
    shift &&
    (String(shift.id) === id ||
      String(shift.shiftActivityLogId) === id ||
      String(shift.cardId) === id);

  const apply = (shift) =>
    isMatch(shift)
      ? {
          ...shift,
          officer,
          requiresAttention: !officer,
        }
      : shift;

  let matched = false;
  const mapList = (list) => {
    if (!Array.isArray(list)) return list;
    return list.map((shift) => {
      if (!isMatch(shift)) return shift;
      matched = true;
      return apply(shift);
    });
  };

  const allDuties = mapList(collections.allDuties);

  let overviewSections = collections.overviewSections;
  if (Array.isArray(overviewSections)) {
    overviewSections = overviewSections.map((section) => {
      if (!section?.rows) return section;
      return {
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          shifts: mapList(row.shifts),
        })),
      };
    });
  }

  let dayViewDuties = collections.dayViewDuties;
  if (dayViewDuties && typeof dayViewDuties === 'object') {
    dayViewDuties = Object.fromEntries(
      Object.entries(dayViewDuties).map(([key, shifts]) => [key, mapList(shifts)]),
    );
  }

  let listDuties = collections.listDuties;
  if (listDuties && typeof listDuties === 'object') {
    listDuties = Object.fromEntries(
      Object.entries(listDuties).map(([key, shifts]) => [key, mapList(shifts)]),
    );
  }

  if (!matched) return null;

  return { allDuties, overviewSections, dayViewDuties, listDuties };
};

export const buildOfficerFromAssignResult = (assignment, selectedOfficer) => {
  if (!selectedOfficer) return null;
  const id = assignment?.officer?.id ?? selectedOfficer.id;
  if (id == null || id === '') return null;
  return {
    id,
    name: selectedOfficer.name || selectedOfficer.label || null,
    imageUrl: selectedOfficer.imageUrl || selectedOfficer.image || null,
  };
};
