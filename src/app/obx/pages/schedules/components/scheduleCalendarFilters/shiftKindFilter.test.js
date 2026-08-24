import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { narrowByShiftKind, SHIFT_KIND, shiftKindOptions } from './shiftKindFilter';

/**
 * The Shift filter's two answers, pinned.
 *
 * The derivation is the part worth testing: there is no shift-kind field on the payload, so
 * both kinds are read off `overTime`, and a filter that quietly disagrees with the card's own
 * overtime marker would be worse than no filter. The identity check matters as much — this
 * runs inside the memo that feeds the grid, and a new array for an unset filter re-keys every
 * card on the calendar.
 */
const visit = (id, overTime = false) => ({ id, shiftType: SCHEDULE_DUTIES.HIT, overTime });
const patrol = { id: 'p1', shiftType: SCHEDULE_DUTIES.PATROL };

const DUTIES = [visit('v1'), visit('v2', true), visit('v3'), patrol];

describe('the shift filter', () => {
  it('offers All, then the two kinds', () => {
    const options = shiftKindOptions((key) => key);

    expect(options.map((option) => option.value)).toEqual([
      SHIFT_KIND.ALL,
      SHIFT_KIND.FILTER_REPLACEMENT,
      SHIFT_KIND.OVERTIME,
    ]);
  });

  it('hands back the same array when nothing is picked', () => {
    expect(narrowByShiftKind(DUTIES, SHIFT_KIND.ALL)).toBe(DUTIES);
    expect(narrowByShiftKind(DUTIES, undefined)).toBe(DUTIES);
  });

  it('keeps only the flagged shifts for Overtime', () => {
    expect(narrowByShiftKind(DUTIES, SHIFT_KIND.OVERTIME).map((s) => s.id)).toEqual(['v2']);
  });

  /** A filter replacement is a visit that is *not* overtime — and never a roster shift. */
  it('keeps the ordinary visits for Filter Replacement', () => {
    expect(narrowByShiftKind(DUTIES, SHIFT_KIND.FILTER_REPLACEMENT).map((s) => s.id)).toEqual([
      'v1',
      'v3',
    ]);
  });

  it('reads the alternative spelling of the flag', () => {
    const list = [{ id: 'x', shiftType: SCHEDULE_DUTIES.HIT, isOvertime: true }];

    expect(narrowByShiftKind(list, SHIFT_KIND.OVERTIME).map((s) => s.id)).toEqual(['x']);
  });

  it('survives an empty or absent list', () => {
    expect(narrowByShiftKind([], SHIFT_KIND.OVERTIME)).toEqual([]);
    expect(narrowByShiftKind(undefined, SHIFT_KIND.OVERTIME)).toBeUndefined();
  });
});
