import dayjs from 'dayjs';

import { DEFAULT_RUN_DAYS } from './fixtures';

/**
 * The worked days a range contains, derived from Config A's weekday pattern.
 *
 * ① used to move the range a week at a time with two chevrons, so the day set could be
 * re-dated by a fixed offset and every weekday survived by construction. A real date
 * picker can land on any two dates — three days, a fortnight, a month — so the days have
 * to be **derived** from the range instead of shifted with it.
 *
 * Config A is keyed by weekday, which is what makes this a lookup rather than a guess:
 * take the weekdays the franchise works, and emit one day per matching date the range
 * contains. A four-week range legitimately produces four Mondays, each its own runsheet.
 *
 * Extracted from the hook so the derivation can be tested without mounting a drawer —
 * it is the one piece of ① that can silently produce a wrong week.
 */
export const runDaysForRange = (from, to, template = DEFAULT_RUN_DAYS) => {
  const start = dayjs(from);
  const end = dayjs(to);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];

  /* One entry per weekday the franchise works. `dayjs().day()` is 0–6 from Sunday. */
  const worked = new Map(template.filter((d) => d.worked).map((d) => [dayjs(d.date).day(), d]));

  const days = [];
  for (let cursor = start; !cursor.isAfter(end, 'day'); cursor = cursor.add(1, 'day')) {
    const match = worked.get(cursor.day());
    days.push(
      match
        ? { ...match, date: cursor.format('YYYY-MM-DD') }
        : { date: cursor.format('YYYY-MM-DD'), worked: false, shiftMins: 0, zoneId: null },
    );
  }
  return days;
};
