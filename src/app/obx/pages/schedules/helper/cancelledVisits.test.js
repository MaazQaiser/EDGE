import {
  dropCancelledEvents,
  dropCancelledGroups,
  isCancelledRecord,
  isCancelledStatusFilter,
} from './scheduleResponseAdapter';

/**
 * Cancelled is hidden on every scheduler view unless the status filter asks for it.
 *
 * The interesting half of this is **which field says so**. The payload names that
 * fact four different ways depending on which endpoint produced the record, and two
 * separate painters already read two different pairs of them — so a filter that
 * checks one field passes silently and leaves a cancelled card on screen. Each field
 * gets its own case here for that reason, not for completeness' sake.
 */

const scheduled = { id: 1, status: 'notStarted' };

describe('isCancelledRecord', () => {
  it('reads every field the payload names it in', () => {
    expect(isCancelledRecord({ status: 'cancelled' })).toBe(true);
    expect(isCancelledRecord({ scheduleStatus: 'cancelled' })).toBe(true);
    expect(isCancelledRecord({ shiftStatus: 'cancelled' })).toBe(true);
    expect(isCancelledRecord({ isCancelled: true })).toBe(true);
    /* The grid tests for this string explicitly, so something upstream produces it. */
    expect(isCancelledRecord({ scheduleStatus: 'canceled' })).toBe(true);
    /* Some payloads stringify their booleans. */
    expect(isCancelledRecord({ isCancelled: 'true' })).toBe(true);
  });

  it('leaves everything else alone', () => {
    expect(isCancelledRecord(scheduled)).toBe(false);
    expect(isCancelledRecord({ status: 'missed' })).toBe(false);
    expect(isCancelledRecord({ isCancelled: false })).toBe(false);
    expect(isCancelledRecord({})).toBe(false);
    expect(isCancelledRecord()).toBe(false);
  });
});

describe('isCancelledStatusFilter', () => {
  it('recognises the one filter value that should let them through', () => {
    expect(isCancelledStatusFilter('cancelled')).toBe(true);
    expect(isCancelledStatusFilter('canceled')).toBe(true);
    expect(isCancelledStatusFilter('Cancelled')).toBe(true);
  });

  it('treats every other value, and no value at all, as hide them', () => {
    expect(isCancelledStatusFilter('completed')).toBe(false);
    expect(isCancelledStatusFilter('')).toBe(false);
    expect(isCancelledStatusFilter(undefined)).toBe(false);
    expect(isCancelledStatusFilter(null)).toBe(false);
  });
});

describe('dropCancelledEvents', () => {
  const events = [
    scheduled,
    { id: 2, scheduleStatus: 'cancelled' },
    { id: 3, status: 'completed' },
  ];

  it('drops them by default', () => {
    expect(dropCancelledEvents(events).map((event) => event.id)).toEqual([1, 3]);
  });

  it('keeps the list intact when cancelled is what was asked for', () => {
    /* Not "shows only cancelled" — that narrowing is the endpoint's job, since
       `shiftStatus` went out with the request. This only stops undoing it. */
    expect(dropCancelledEvents(events, true)).toBe(events);
  });

  it('passes through anything that is not a list', () => {
    expect(dropCancelledEvents(undefined)).toBeUndefined();
    expect(dropCancelledEvents(null)).toBeNull();
  });
});

describe('dropCancelledGroups', () => {
  const groups = {
    'Harborview Depot': [scheduled, { id: 2, shiftStatus: 'cancelled' }],
    'Riverside Tower': [{ id: 3, isCancelled: true }],
    'Westgate Annex': [],
  };

  it('cuts inside each group', () => {
    const cut = dropCancelledGroups(groups);
    expect(cut['Harborview Depot'].map((event) => event.id)).toEqual([1]);
    expect(cut['Riverside Tower']).toEqual([]);
  });

  it('keeps every key, including the ones it just emptied', () => {
    /* The day view gives every site a lane so an empty one reads as "nothing
       booked". Dropping the key takes the lane away instead. */
    expect(Object.keys(dropCancelledGroups(groups))).toEqual([
      'Harborview Depot',
      'Riverside Tower',
      'Westgate Annex',
    ]);
  });

  it('is a no-op when cancelled was asked for, or when there is nothing to cut', () => {
    expect(dropCancelledGroups(groups, true)).toBe(groups);
    expect(dropCancelledGroups(undefined)).toBeUndefined();
  });
});
