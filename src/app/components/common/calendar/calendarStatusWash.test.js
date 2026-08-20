import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

import { EVENT_BG_COLOR_CLASSES, visitWashClassFor } from './calendarStatusWash';

/**
 * Yellow is spent on one day only — the visit-card half of the rule that
 * `schedules/companies/visitCardClass.js` already applies on the Companies views.
 *
 * `isToday` is a boolean here on purpose: the grid owns that comparison, because its
 * day columns are placed with the franchise offset and a card in the highlighted
 * today column must not be told otherwise by a second clock.
 */
describe('visitWashClassFor', () => {
  it('gives not-started the yellow wash on today', () => {
    expect(visitWashClassFor(calendarShiftStatusEnum.NOT_STARTED, true)).toBe(
      EVENT_BG_COLOR_CLASSES[calendarShiftStatusEnum.NOT_STARTED],
    );
  });

  it('gives it no wash on any other day', () => {
    /* Undefined rather than a new grey: only three statuses take a wash, so
       missed/unassigned/cancelled already fall through to the shell's plain grey.
       Not-started-elsewhere joins them rather than inventing a treatment. */
    expect(visitWashClassFor(calendarShiftStatusEnum.NOT_STARTED, false)).toBeUndefined();
  });

  it('leaves every other status date-blind', () => {
    [calendarShiftStatusEnum.IN_PROGRESS, calendarShiftStatusEnum.COMPLETED].forEach((status) => {
      expect(visitWashClassFor(status, true)).toBe(EVENT_BG_COLOR_CLASSES[status]);
      expect(visitWashClassFor(status, false)).toBe(EVENT_BG_COLOR_CLASSES[status]);
    });
  });

  it('washes nothing for the statuses that never had one', () => {
    expect(visitWashClassFor(calendarShiftStatusEnum.MISSED, true)).toBeUndefined();
    expect(visitWashClassFor(calendarShiftStatusEnum.UNASSIGNED, true)).toBeUndefined();
  });
});
