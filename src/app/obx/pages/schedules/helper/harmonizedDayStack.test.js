import dayjs from 'dayjs';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { collapseRoutesToStackDays, harmonizedStackDays } from './harmonizedDayStack';

/**
 * The three-day stack, pinned.
 *
 * This module exists because the applied week did not *look* applied — the plans the three
 * shells produce spread across as many days as they have worked days, and a shell whose
 * fixture no longer matches the book contributes nothing at all. So what is worth testing is
 * not the arithmetic but the two promises the walkthrough is presented on: **three days**,
 * and **every movable visit on one of them**, whatever the plan happened to say.
 *
 * The window is a fixed future week so the "never a day that has already been" rule cannot
 * make these fail on a Thursday.
 */
const WEEK = (() => {
  /* A whole future week, opening on its own Monday. `.day(1)` would read dayjs's global
     locale, which another module mutates — the offset arithmetic cannot. */
  const today = dayjs().startOf('day');
  const monday = today.add(((1 - today.day() + 7) % 7) + 14, 'day');
  return { monday, from: monday.toISOString(), to: monday.add(7, 'day').toISOString() };
})();

const visit = (id, day) => ({
  id,
  shiftType: SCHEDULE_DUTIES.HIT,
  start: WEEK.monday.add(day, 'day').format('YYYY-MM-DD'),
  startsAt: WEEK.monday.add(day, 'day').hour(9).toISOString(),
});

const dayKeys = (routes) => routes.map((route) => route.dayKey);
const allVisitIds = (routes) => routes.flatMap((route) => route.visitIds);

describe('harmonizedStackDays', () => {
  it('is the window week’s Monday, Tuesday and Wednesday', () => {
    const days = harmonizedStackDays(WEEK.from, WEEK.to).map((day) => day.format('YYYY-MM-DD'));

    expect(days).toEqual([
      WEEK.monday.format('YYYY-MM-DD'),
      WEEK.monday.add(1, 'day').format('YYYY-MM-DD'),
      WEEK.monday.add(2, 'day').format('YYYY-MM-DD'),
    ]);
  });

  /**
   * The Monday it finds is the one **inside** the window.
   *
   * This grid's week starts on Sunday, so the calendar week a Sunday window belongs to has
   * its Monday six days *behind* the window — in the past, where every visit is read-only
   * (D4) and the scatter puts nothing. Searching forward from the window's first day is what
   * makes the current week stack onto the Monday the planner can actually see.
   */
  it('finds the Monday inside the window, not the one behind it', () => {
    const today = dayjs().startOf('day');
    const sunday = today.add((7 - today.day()) % 7, 'day');
    const days = harmonizedStackDays(sunday.toISOString(), sunday.add(7, 'day').toISOString());

    expect(days).toHaveLength(3);
    expect(days[0].format('YYYY-MM-DD')).toBe(sunday.add(1, 'day').format('YYYY-MM-DD'));
    days.forEach((day) => expect(day.isBefore(today, 'day')).toBe(false));
  });

  /**
   * A past day is never a target.
   *
   * A visit dated backwards is read-only, so a Monday that has gone would be a column of
   * cards the grid will not let the planner touch. The count is made back up from the days
   * after Wednesday.
   */
  it('drops days that have already been', () => {
    const today = dayjs().startOf('day');
    const lastWeek = today.subtract(9, 'day');
    const days = harmonizedStackDays(lastWeek.toISOString(), lastWeek.add(14, 'day').toISOString());

    days.forEach((day) => expect(day.isBefore(today, 'day')).toBe(false));
  });

  it('has nothing to offer for an unusable window', () => {
    expect(harmonizedStackDays(undefined, undefined)).toEqual([]);
    expect(harmonizedStackDays(WEEK.to, WEEK.from)).toEqual([]);
  });
});

describe('collapseRoutesToStackDays', () => {
  const visits = [visit('v1', 0), visit('v2', 2), visit('v3', 3), visit('v4', 4), visit('v5', 5)];

  it('lands a five-day plan on three days', () => {
    const routes = [
      { dayKey: WEEK.monday.format('YYYY-MM-DD'), name: 'Runsheet · North', visitIds: ['v1'] },
      {
        dayKey: WEEK.monday.add(3, 'day').format('YYYY-MM-DD'),
        name: 'Runsheet · South',
        visitIds: ['v3', 'v4'],
      },
      {
        dayKey: WEEK.monday.add(5, 'day').format('YYYY-MM-DD'),
        name: 'Runsheet · East',
        visitIds: ['v5'],
      },
    ];

    const stacked = collapseRoutesToStackDays(routes, { ...WEEK, visits });

    expect(dayKeys(stacked)).toEqual([
      WEEK.monday.format('YYYY-MM-DD'),
      WEEK.monday.add(1, 'day').format('YYYY-MM-DD'),
      WEEK.monday.add(2, 'day').format('YYYY-MM-DD'),
    ]);
  });

  /**
   * The promise the walkthrough is presented on.
   *
   * Every movable visit in the window ends up on one of the three days — including `v2`,
   * which no route mentioned. This is the case that matters most: the drawer and split
   * shells match their own fixture to this page's visits by site name, and one renamed site
   * is enough to leave a visit unrouted and the week looking untouched.
   */
  it('sweeps in visits the plan never mentioned', () => {
    const routes = [
      { dayKey: WEEK.monday.format('YYYY-MM-DD'), name: 'Runsheet · North', visitIds: ['v1'] },
    ];

    const stacked = collapseRoutesToStackDays(routes, { ...WEEK, visits });

    expect(allVisitIds(stacked).sort()).toEqual(['v1', 'v2', 'v3', 'v4', 'v5']);
  });

  it('fills all three days rather than one, and keeps the plan’s order', () => {
    const routes = [
      {
        dayKey: WEEK.monday.format('YYYY-MM-DD'),
        name: 'Runsheet · North',
        visitIds: ['v5', 'v4', 'v3', 'v2', 'v1'],
      },
    ];

    const stacked = collapseRoutesToStackDays(routes, { ...WEEK, visits });

    expect(stacked.map((route) => route.visitIds)).toEqual([['v5', 'v4'], ['v3', 'v2'], ['v1']]);
  });

  it('names a day after the plan’s route when it has one, and after the day when it does not', () => {
    const routes = [
      { dayKey: WEEK.monday.format('YYYY-MM-DD'), name: 'Runsheet · North', visitIds: ['v1'] },
    ];

    const stacked = collapseRoutesToStackDays(routes, {
      ...WEEK,
      visits: [visits[0], visits[1]],
      routeTerm: 'Run',
    });

    expect(stacked[0].name).toBe('Runsheet · North');
    expect(stacked[1].name).toBe(`Run · ${WEEK.monday.add(1, 'day').format('ddd D MMM')}`);
  });

  /** Read-only and non-visit shifts are the optimizer's business, and it does not want them. */
  it('leaves alone what Harmonize itself would not move', () => {
    const patrol = { id: 'p1', shiftType: SCHEDULE_DUTIES.PATROL, start: visits[0].start };
    const done = { ...visit('v9', 1), status: 'COMPLETED', shiftStatus: 'COMPLETED' };

    const stacked = collapseRoutesToStackDays([], { ...WEEK, visits: [...visits, patrol, done] });

    expect(allVisitIds(stacked)).not.toContain('p1');
    expect(allVisitIds(stacked)).not.toContain('v9');
  });

  it('hands back the plan untouched when the window is unusable', () => {
    const routes = [{ dayKey: '2026-08-24', name: 'Runsheet', visitIds: ['v1'] }];

    expect(collapseRoutesToStackDays(routes, { visits })).toBe(routes);
  });
});
