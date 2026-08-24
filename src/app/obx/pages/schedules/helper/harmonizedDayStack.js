import dayjs from 'dayjs';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { getVisitActionRules } from './visitState';

/**
 * Collapse an applied plan onto **three days**, for the walkthrough.
 *
 * ## What this fixes
 *
 * The scatter (`scatterVisitsForDemo`) throws the week's visits across every day it can
 * reach, which is the mess Harmonize exists to clean up. Apply then moved each visit onto
 * whatever day its route carried — and the plans the three shells produce are *not* three
 * days. The workspace plans a route per worked day, the drawer and split plan one runsheet
 * per worked day against their own fixture, and a fixture day that no longer matches a real
 * visit contributes nothing at all. So the grid went from scattered to slightly-less
 * scattered, and the one claim the whole feature makes — *this week's work is actually two
 * or three trips* — was the one thing the screen did not show. Asked for directly: stack
 * them into Monday, Tuesday and Wednesday, because the prototype was not communicating the
 * change.
 *
 * ## What it does, and what it is honest about
 *
 * It rewrites the **routes**, not the visits: three routes, three days, every harmonizable
 * visit in the window dealt into them in the plan's own order. The relocation underneath
 * (`relocateVisitsForRoutes`) is untouched and still does the actual moving, so there is one
 * implementation of "put this visit on that day" rather than two.
 *
 * Three things this deliberately overrides, all of them for the demo and none of them things
 * a real Apply should do:
 *
 * - **The plan's days.** Whatever days the shell chose, the result lands on three.
 * - **The plan's coverage.** A visit the plan never mentioned is swept in — including every
 *   visit a name-matching shell failed to resolve, which is why Apply now visibly collapses
 *   the week even when the fixture and the book have drifted apart.
 * - **The plan's balance.** The visits are dealt into three near-equal contiguous blocks, so
 *   three columns fill rather than one column and two empty ones. Route mates stay adjacent
 *   because the blocks are contiguous over the plan's own ordering.
 *
 * When the endpoints in HARMONIZE-CONTEXT §5 are real, this module is deleted and the plan's
 * own days are honoured again. It is one call in `calendar/index.jsx`, on the two paths that
 * have to agree with each other, and nothing else imports it.
 */

/** Monday, Tuesday, Wednesday — the days the walkthrough stacks onto. */
const STACK_DAYS = 3;

/** Monday is 1 in `dayjs().day()`, where Sunday is 0. */
const MONDAY = 1;

/**
 * The three days to stack onto: the visible week's Monday, Tuesday and Wednesday.
 *
 * **Never a day that has already been.** A visit dated into the past is read-only (D4), so
 * stacking Monday's trip onto a Monday that has gone would hand the planner a column of
 * cards their own grid will not let them touch — and the scatter would not have put anything
 * there either, for the same reason. So a past target is dropped and the days after
 * Wednesday are drawn on to make the count back up. Present the current week from Sunday or
 * Monday, which is the case this is written for, and the answer is Mon/Tue/Wed exactly.
 */
export const harmonizedStackDays = (from, to) => {
  /* `dayjs(undefined)` is *now* rather than invalid, so a missing window has to be caught
     before it is parsed — otherwise a company surface with no `selectedView` would silently
     stack onto today. */
  if (!from || !to) return [];

  const start = dayjs(from);
  const end = dayjs(to);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];

  /**
   * The first Monday **on or after** the window opens — not the Monday of the calendar week
   * the window's first day belongs to.
   *
   * The two are the same thing for a grid whose week starts on Monday and different for
   * every other. This one starts on Sunday (`GRID_FIRST_DAY`), so a window opening Sunday
   * the 23rd belongs to a calendar week whose Monday was the 17th — six days *before* the
   * window, and in the past. Searching forward instead lands on the 24th, which is the
   * Monday the planner is actually looking at.
   */
  const offset = (MONDAY - start.day() + 7) % 7;
  const monday = start.startOf('day').add(offset, 'day');

  const today = dayjs().startOf('day');
  const days = [];

  /* Mon/Tue/Wed first, then Thu onward as filler — never past the end of the window, and
     never before today. */
  for (let index = 0; days.length < STACK_DAYS && index < 7; index += 1) {
    const day = monday.add(index, 'day');
    if (day.isBefore(today, 'day')) continue;
    if (day.isBefore(start, 'day') || day.isAfter(end, 'day')) continue;
    days.push(day);
  }

  return days;
};

/** The visits this feature may move: the same test the scatter uses, so the two agree. */
const isHarmonizable = (shift) =>
  shift?.shiftType === SCHEDULE_DUTIES.HIT && !getVisitActionRules(shift).isReadOnly;

/**
 * Split `count` items into `parts` contiguous blocks, largest blocks first.
 *
 * Eight visits over three days is 3/3/2 rather than 3/3/2-with-a-remainder-day, which is
 * what a naive `Math.ceil` chunker produces — and an empty third column is exactly the
 * reading this module exists to prevent.
 */
const blockSizes = (count, parts) => {
  const base = Math.floor(count / parts);
  const extra = count % parts;
  return Array.from({ length: parts }, (_, index) => base + (index < extra ? 1 : 0));
};

/**
 * @param {Array} routes  The shell's applied routes: `{ dayKey, name, visitIds }`.
 * @param {object} params
 * @param {string} params.from      Window start — the fetch's own `windowStart`.
 * @param {string} params.to        Window end — the fetch's own `windowEnd`.
 * @param {Array}  params.visits    The window's shifts as the grid holds them (`allDuties`),
 *                                  which is where the swept-in visits come from.
 * @param {string} params.routeTerm The tenant's word for a runsheet, for the day names.
 * @returns {Array} Up to three routes, one per day. The input is never mutated.
 */
export const collapseRoutesToStackDays = (
  routes = [],
  { from, to, visits = [], routeTerm = 'Route' } = {},
) => {
  const days = harmonizedStackDays(from, to);
  if (!days.length) return routes;

  /* The plan's own order is the order the cards will stack in, so it is preserved exactly:
     route by route, visit by visit, deduplicated in case two routes claim the same visit. */
  const ordered = [];
  const seen = new Set();
  const nameFor = new Map();

  routes.forEach((route) => {
    (route?.visitIds || []).forEach((visitId) => {
      if (visitId == null) return;
      const key = String(visitId);
      if (seen.has(key)) return;
      seen.add(key);
      ordered.push(key);
      if (route?.name) nameFor.set(key, route.name);
    });
  });

  /* Everything else the optimizer could have taken, in the order the grid holds it. Without
     this the week collapses only as far as the plan reached, which on a shell matching its
     fixture by site name can be nowhere at all. */
  (visits || []).forEach((shift) => {
    if (!isHarmonizable(shift) || shift?.id == null) return;
    const key = String(shift.id);
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(key);
  });

  if (!ordered.length) return routes;

  const sizes = blockSizes(ordered.length, Math.min(days.length, STACK_DAYS));
  const stacked = [];
  let cursor = 0;

  days.slice(0, sizes.length).forEach((day, index) => {
    const visitIds = ordered.slice(cursor, cursor + sizes[index]);
    cursor += sizes[index];
    if (!visitIds.length) return;

    /* Named after whichever of the plan's routes contributed this block's first visit, so a
       day the plan really did plan keeps the words the planner just read in the drawer. The
       fallback names the day, which is the only other thing distinguishing one of these
       stacks from another. */
    const planned = visitIds.map((visitId) => nameFor.get(visitId)).find(Boolean);

    stacked.push({
      dayKey: day.format('YYYY-MM-DD'),
      name: planned || `${routeTerm} · ${day.format('ddd D MMM')}`,
      visitIds,
    });
  });

  return stacked;
};
