import dayjs from 'dayjs';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { visitCardClassFor } from './visitCardClass';

/**
 * Yellow is spent on one day only.
 *
 * Dates are built relative to `dayjs()` rather than hardcoded, because the rule is
 * "is this the viewer's today" — a fixed date would pass today and fail tomorrow,
 * which is the one way this test could be worse than no test.
 */
const today = dayjs().format('YYYY-MM-DD');
const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
const nextYear = dayjs().add(11, 'month').format('YYYY-MM-DD');
const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

const notStarted = (date) => ({ date, status: calendarShiftStatusEnum.NOT_STARTED });

describe('visitCardClassFor — not started', () => {
  it('is yellow on the day the visit is due', () => {
    expect(visitCardClassFor(notStarted(today))).toBe('visitCardScheduled');
  });

  it('is the quiet unfilled chip on every other day', () => {
    expect(visitCardClassFor(notStarted(tomorrow))).toBe('visitCardUpcoming');
    expect(visitCardClassFor(notStarted(nextYear))).toBe('visitCardUpcoming');
  });

  it('does not claim a stale past record is today', () => {
    /* A past unserviced visit should have resolved to missed before it got here
       (D11 for the routed case), so this is the defensive branch — it must not
       borrow the colour that means "due now". */
    expect(visitCardClassFor(notStarted(yesterday))).toBe('visitCardUpcoming');
  });
});

describe('visitCardClassFor — every other state is date-blind', () => {
  const cases = [
    [calendarShiftStatusEnum.COMPLETED, 'visitCardCompleted'],
    [calendarShiftStatusEnum.IN_PROGRESS, 'visitCardLive'],
    [calendarShiftStatusEnum.SHIFT_STARTED, 'visitCardLive'],
    [calendarShiftStatusEnum.MISSED, 'visitCardMissed'],
    [calendarShiftStatusEnum.CANCELLED, 'visitCardCancelled'],
    [calendarShiftStatusEnum.UNASSIGNED, 'visitCardUnassigned'],
  ];

  it.each(cases)('%s resolves to %s whatever the date', (status, expected) => {
    expect(visitCardClassFor({ date: today, status })).toBe(expected);
    expect(visitCardClassFor({ date: nextYear, status })).toBe(expected);
  });

  it('falls back to the quiet chip rather than to yellow', () => {
    /* The old lookup defaulted to `visitCardScheduled`, so an unrecognised status
       arrived wearing the colour that now means "due today". */
    expect(visitCardClassFor({ date: nextYear, status: 'somethingNew' })).toBe('visitCardUpcoming');
    expect(visitCardClassFor({})).toBe('visitCardUpcoming');
    expect(visitCardClassFor()).toBe('visitCardUpcoming');
  });
});
