import { DEFAULT_RUN_DAYS } from './fixtures';
import { runDaysForRange } from './runDays';

const workedIn = (days) => days.filter((d) => d.worked);

describe('the worked days a range contains', () => {
  it('reproduces the canonical week exactly', () => {
    const days = runDaysForRange('2026-08-15', '2026-08-21');
    expect(days).toHaveLength(7);
    expect(workedIn(days).map((d) => [d.date, d.zoneId, d.shiftMins])).toEqual([
      ['2026-08-17', 'north', 240],
      ['2026-08-18', 'east', 600],
      ['2026-08-19', 'south', 600],
    ]);
  });

  /**
   * The reason this exists. A picker can select a fortnight, and Config A's answer is
   * *which weekdays*, not *which dates* — so a two-week range works Monday twice, and
   * each one is its own runsheet with its own zone and shift.
   */
  it('repeats the weekday pattern across a fortnight', () => {
    const days = runDaysForRange('2026-08-15', '2026-08-28');
    expect(days).toHaveLength(14);
    expect(workedIn(days).map((d) => d.date)).toEqual([
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-24',
      '2026-08-25',
      '2026-08-26',
    ]);
    /* The second Monday is a Monday: same zone, same shift, new date. */
    const mondays = workedIn(days).filter((d) => d.zoneId === 'north');
    expect(mondays).toHaveLength(2);
    expect(mondays.every((d) => d.shiftMins === 240)).toBe(true);
  });

  it('yields no worked days when the range misses every working weekday', () => {
    /* Sat 22 – Sun 23: the franchise works Mon, Tue, Wed. */
    const days = runDaysForRange('2026-08-22', '2026-08-23');
    expect(days).toHaveLength(2);
    expect(workedIn(days)).toHaveLength(0);
  });

  it('handles a single day', () => {
    expect(runDaysForRange('2026-08-17', '2026-08-17')).toEqual([
      { ...DEFAULT_RUN_DAYS.find((d) => d.date === '2026-08-17') },
    ]);
  });

  it('refuses a reversed or invalid range rather than looping', () => {
    expect(runDaysForRange('2026-08-21', '2026-08-15')).toEqual([]);
    expect(runDaysForRange('not-a-date', '2026-08-15')).toEqual([]);
  });
});
