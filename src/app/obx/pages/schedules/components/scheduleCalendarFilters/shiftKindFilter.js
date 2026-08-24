import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

/**
 * The **Shift** filter: what kind of work a card is, as opposed to whose it is.
 *
 * Every other dropdown in this row narrows by an *entity* — a company, a building, a
 * technician, a status. This one narrows by the nature of the shift itself, which is the
 * question a planner asks when they are looking at cost rather than at coverage: *show me
 * only the overtime*.
 *
 * ## Where the answer comes from
 *
 * There is no shift-kind field on the payload and no query parameter for one. What there is
 * is `overTime`, a boolean the visit card already reads and prints a marker for. So the two
 * kinds are derived from it, and the derivation is stated here rather than inline at the
 * filter so that the card and the filter cannot disagree about what "overtime" means:
 *
 * - **Overtime** — the shift is flagged `overTime`.
 * - **Filter replacement shift** — a visit that is not. On this tenant a visit *is* a filter
 *   replacement; that is the whole book. Naming it in the filter rather than calling it
 *   "regular" is the tenant's own word for the work, and it is the word the planner uses.
 *
 * Because the derivation is client-side, this filter narrows **what is drawn**, not what is
 * fetched — it does not go near the request. That is also why it needs no loading state and
 * why switching it is instant.
 */
export const SHIFT_KIND = {
  ALL: '',
  FILTER_REPLACEMENT: 'filterReplacement',
  OVERTIME: 'overtime',
};

/** All, then the two kinds — the same shape the duty and status dropdowns hand over. */
export const shiftKindOptions = (t) => [
  { value: SHIFT_KIND.ALL, label: t('obx.schedules.filters.shift.all') },
  {
    value: SHIFT_KIND.FILTER_REPLACEMENT,
    label: t('obx.schedules.filters.shift.filterReplacement'),
  },
  { value: SHIFT_KIND.OVERTIME, label: t('obx.schedules.filters.shift.overtime') },
];

const isOvertime = (shift) => Boolean(shift?.overTime ?? shift?.isOvertime);

/**
 * Narrow a list of shifts to one kind.
 *
 * Unknown and empty values return the list **unchanged and by reference**, which matters:
 * this runs inside the memo that feeds the grid its events, and a new array on every render
 * would re-key every card on the calendar for a filter nobody has set.
 */
export const narrowByShiftKind = (duties, kind) => {
  if (!Array.isArray(duties) || !duties.length) return duties;

  if (kind === SHIFT_KIND.OVERTIME) return duties.filter(isOvertime);

  if (kind === SHIFT_KIND.FILTER_REPLACEMENT) {
    return duties.filter((shift) => shift?.shiftType === SCHEDULE_DUTIES.HIT && !isOvertime(shift));
  }

  return duties;
};
