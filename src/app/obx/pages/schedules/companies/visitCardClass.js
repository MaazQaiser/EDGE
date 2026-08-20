import dayjs from 'dayjs';
import { calendarShiftStatusEnum } from 'src/utils/constants/schedules';

/**
 * Which treatment a visit card takes, on both Companies views.
 *
 * Lived as a `STATUS_CARD_CLASS` object in each of the two views, identical in both —
 * the copy this feature's own notes keep warning about, and the copy that had to go
 * the moment the answer stopped being a plain status lookup. It is now a *function*
 * of the status **and the date**, which is one more reason it belongs in one place:
 * a rule about today cannot be maintained twice.
 *
 * The class names are the same in both stylesheets (`companies.styles.js` and
 * `timeline/companiesTimeline.styles.js`, both built from `visitCardFills`), so one
 * resolver can name a class for either caller.
 */
const STATUS_CARD_CLASS = {
  [calendarShiftStatusEnum.COMPLETED]: 'visitCardCompleted',
  [calendarShiftStatusEnum.IN_PROGRESS]: 'visitCardLive',
  [calendarShiftStatusEnum.SHIFT_STARTED]: 'visitCardLive',
  [calendarShiftStatusEnum.MISSED]: 'visitCardMissed',
  [calendarShiftStatusEnum.CANCELLED]: 'visitCardCancelled',
  [calendarShiftStatusEnum.UNASSIGNED]: 'visitCardUnassigned',
  [calendarShiftStatusEnum.NOT_STARTED]: 'visitCardScheduled',
};

/**
 * Is this visit on the viewer's own today?
 *
 * `dayjs()` in **browser-local** time, deliberately, against the `YYYY-MM-DD` key the
 * payload carries. The rest of this view resolves *clock times* through
 * `dayjsWithStandardOffset` so an hour reads the same as it does on the week grid —
 * but this is not a clock question, it is "is this the day I am living in", and the
 * answer a planner expects is their own calendar day, not the franchise's. The two
 * differ only for a viewer in another timezone within a few hours of midnight, and in
 * that window the local answer is the one that matches the date on their wall.
 */
const isToday = (date) => `${date ?? ''}` === dayjs().format('YYYY-MM-DD');

/**
 * **Yellow means "not started, today", and nothing else.**
 *
 * `NOT_STARTED` used to take the yellow wash on every date it appeared, which on a
 * twelve-month view meant nearly every card was yellow: a year of ordinary future
 * work, all wearing the colour that is supposed to mean *this is live now*. The wash
 * stopped distinguishing anything, which is the same failure as a legend that names
 * more colours than the grid draws — a colour that marks everything marks nothing.
 *
 * So the yellow is spent only where it earns its place, on the day the visit is due,
 * and every other scheduled visit takes `visitCardUpcoming` — a quiet, unfilled chip.
 * That is the honest treatment for it: the wash marks a *state worth noticing*, and
 * "due in five months, nothing wrong with it" is precisely the absence of one.
 *
 * A past `NOT_STARTED` should not exist — a past visit that was never serviced is
 * missed (D11 for the routed case), and the payload no longer emits one — but if a
 * stale record ever arrives it falls to `visitCardUpcoming` rather than claiming to be
 * today's work.
 *
 * **Not folded into `visitCardFills`.** That map is keyed on status alone and is
 * shared with the week grid, where a day *is* a column and the grid answers "which
 * day" by position; a date-dependent fill there would be a second, competing answer.
 * The Companies views are the surfaces with no day axis, so the card is the only place
 * the distinction can live.
 */
export const visitCardClassFor = (visit = {}) => {
  if (visit.status === calendarShiftStatusEnum.NOT_STARTED) {
    return isToday(visit.date) ? 'visitCardScheduled' : 'visitCardUpcoming';
  }

  return STATUS_CARD_CLASS[visit.status] || 'visitCardUpcoming';
};

export default visitCardClassFor;
