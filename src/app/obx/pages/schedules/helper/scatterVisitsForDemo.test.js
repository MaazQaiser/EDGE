import dayjs from 'dayjs';
import { calendarShiftStatusEnum, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { scatterVisitsForDemo } from './scatterVisitsForDemo';

/**
 * The walkthrough's scatter.
 *
 * Two properties carry the feature and neither is about which day anything lands on: the
 * scatter must be **stable for one seed** — a planner presenting cannot have the grid
 * reshuffle when the status filter moves — and it must be **different for the next**, which
 * is the whole reason it exists. Asserting a particular Thursday would pin the hash function
 * instead, and the hash is an implementation detail that is allowed to change.
 *
 * Dates are written relative to today. A fixture week would start failing the moment it fell
 * behind the clock, because half the rules here are about what is still in the future.
 */

const day = (offset) => dayjs().startOf('day').add(offset, 'day');
const iso = (offset, hour = 9) => day(offset).hour(hour).minute(0).second(0).toISOString();

const visit = (id, offset, extra = {}) => ({
  id,
  shiftType: SCHEDULE_DUTIES.HIT,
  start: day(offset).format('YYYY-MM-DD'),
  startsAt: iso(offset, 9),
  end: day(offset).format('YYYY-MM-DD'),
  endsAt: iso(offset, 11),
  ...extra,
});

/** A fortnight forward, so every target day is in the future and nothing is read-only. */
const WINDOW = { from: day(0).toISOString(), to: day(13).toISOString() };

const VISITS = Array.from({ length: 24 }, (_, index) => visit(`v-${index}`, 1 + (index % 3)));

const dayOf = (shift) => dayjs(shift.start).format('YYYY-MM-DD');
const spread = (shifts) => new Set(shifts.map(dayOf)).size;

describe('the walkthrough scatter', () => {
  it('throws the visits across the window rather than leaving them clumped', () => {
    expect(spread(VISITS)).toBe(3);

    const scattered = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-a' });

    /* Not "all fourteen days": a hash over two dozen visits will collide, and demanding a
       perfect spread would be asserting luck. Nine of fourteen is the mess the walkthrough
       needs, is far outside what the three-day input could produce, and is the assertion
       that would have caught the unmixed hash that clumped 24 visits onto three days. */
    expect(spread(scattered)).toBeGreaterThan(8);
  });

  it('keeps every visit inside the window', () => {
    const scattered = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-a' });

    scattered.forEach((shift) => {
      const landed = dayjs(shift.start);
      expect(landed.isBefore(day(0), 'day')).toBe(false);
      expect(landed.isAfter(day(13), 'day')).toBe(false);
    });
  });

  it('lands the same visit on the same day for one seed, and elsewhere for the next', () => {
    const first = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-a' });
    const again = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-a' });
    const other = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-b' });

    expect(first.map(dayOf)).toEqual(again.map(dayOf));
    expect(other.map(dayOf)).not.toEqual(first.map(dayOf));
  });

  /**
   * The property that makes it usable to present from: a refetch mid-demo re-runs this over
   * whatever the filter left behind, and the cards that survived the filter must not move.
   */
  it('does not move the survivors when the payload is narrowed', () => {
    const full = scatterVisitsForDemo(VISITS, { ...WINDOW, seed: 'seed-a' });
    const narrowed = scatterVisitsForDemo(VISITS.slice(6), { ...WINDOW, seed: 'seed-a' });

    const byId = new Map(full.map((shift) => [shift.id, dayOf(shift)]));
    narrowed.forEach((shift) => expect(dayOf(shift)).toBe(byId.get(shift.id)));
  });

  it('keeps the clock time and the duration, and never mutates the input', () => {
    const source = [visit('v-clock', 2)];
    const before = JSON.parse(JSON.stringify(source));

    const [moved] = scatterVisitsForDemo(source, { ...WINDOW, seed: 'seed-c' });

    expect(source).toEqual(before);
    expect(dayjs(moved.startsAt).hour()).toBe(dayjs(source[0].startsAt).hour());
    expect(dayjs(moved.endsAt).diff(moved.startsAt, 'minute')).toBe(120);
    /* Date-only fields stay date-only — the grid positions cards from `start`. */
    expect(moved.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  /**
   * Read-only is `getVisitActionRules`' word, not this module's, which is what keeps the
   * scatter and the optimizer looking at the same set. Note what is *absent* from this list:
   * a past visit resolves to **missed**, and missed is the one state that survives its own
   * date (D5) — Harmonize gathers it, so the walkthrough is allowed to scatter it.
   */
  it('leaves alone everything Harmonize could not gather', () => {
    const shifts = [
      { ...visit('v-shift', 3), shiftType: SCHEDULE_DUTIES.PATROL },
      visit('v-done', 3, { scheduleStatus: calendarShiftStatusEnum.COMPLETED }),
      visit('v-cancelled', 3, { scheduleStatus: calendarShiftStatusEnum.CANCELLED }),
    ];

    const scattered = scatterVisitsForDemo(shifts, { ...WINDOW, seed: 'seed-a' });

    scattered.forEach((shift, index) => expect(shift).toBe(shifts[index]));
  });

  it('returns the payload untouched when there is nowhere to scatter to', () => {
    const oneDay = { from: day(1).toISOString(), to: day(1).toISOString() };

    expect(scatterVisitsForDemo(VISITS, { ...oneDay, seed: 'seed-a' })).toBe(VISITS);
    expect(scatterVisitsForDemo([], { ...WINDOW, seed: 'seed-a' })).toEqual([]);
    expect(scatterVisitsForDemo(undefined, { ...WINDOW, seed: 'seed-a' })).toBeUndefined();
  });

  /**
   * A window that straddles today scatters forward only. A visit thrown onto Monday of the
   * current week arrives read-only, drops out of the plan, and takes the demo's own subject
   * off the board.
   */
  it('never throws a visit into the past half of a straddling window', () => {
    const straddling = { from: day(-3).toISOString(), to: day(3).toISOString() };

    const scattered = scatterVisitsForDemo(VISITS, { ...straddling, seed: 'seed-a' });

    scattered.forEach((shift) => expect(dayjs(shift.start).isBefore(day(0), 'day')).toBe(false));
  });
});
