import dayjs from 'dayjs';

/**
 * Move the harmonized visits onto the days their routes landed on.
 *
 * **Why the calendar does this at all.** Apply used to close the drawer and fire a
 * toast, which meant the payoff of the whole feature — a week of scattered visits
 * becoming one or two trips — was described in a sentence that disappeared after
 * four seconds, over a calendar that still showed the old week. The planner had to
 * take it on faith. Now the grid shows it.
 *
 * **Each route stacks on its own day.** Not all of them on one: a run of three
 * routes across three days is three columns filling up, because that is what was
 * planned and collapsing it to a single day would be a different plan. The pairing
 * of visit to day comes from the drawer's payload rather than being re-derived
 * here — the drawer is the only thing that knows which route absorbed which visit.
 *
 * **For the walkthrough, the plan reaching this function has already been re-dealt onto
 * three days** — see `harmonizedDayStack`, which the page runs the routes through on their
 * way here. That is a demo override sitting *above* this module rather than a change to it:
 * this one still honours whatever days it is handed, which is what lets the override be
 * deleted in one line when the real endpoints land.
 *
 * **Time of day is preserved, the date is not.** A visit at 09:30 on Monday moved
 * to Thursday becomes 09:30 on Thursday, and its duration is carried across
 * verbatim. The optimizer *does* compute arrival times, but they belong to a route
 * that has not been written yet — stamping them onto the calendar would show
 * scheduled times no runsheet is backing.
 *
 * **Scope, stated plainly: this patches `allDuties` only, and it does not
 * survive.** That is the collection the visits week and month grids read
 * (`useScheduleCalendarViewModel` passes `events` straight through for the visits
 * tab), so it is what makes the move visible. The day and list views keep their own
 * keyed collections, and any change of view, tab, filter or date window refetches
 * from the server — at which point the move is gone, because nothing was written.
 * Re-keying those two maps to fake persistence would be worse than not doing it:
 * the calendar would be asserting a schedule the server does not have.
 */
/** `YYYY-MM-DD`, which the visits week view uses for day placement. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Re-date one value onto `target`, keeping whatever shape it already had.
 *
 * **This is the whole bug that made the first version do nothing visible.** A
 * calendar event here carries *two* dates: `startsAt`, the payload timestamp, and
 * `start`, which is what FullCalendar actually positions the card from —
 * `mapShiftToCalendarEvent` writes it as a bare `YYYY-MM-DD` and its own comment
 * says why ("same day placement as pre-revamp week view"). Rewriting `startsAt`
 * alone moved the data and not the card, so the apply sequence played its shimmer
 * and its landing animation over nine cards that had not gone anywhere.
 *
 * Hence preserving shape rather than normalising: a date-only field stays
 * date-only, a timestamp keeps its clock time. Normalising `start` to an ISO
 * timestamp would be a second, quieter version of the same class of bug.
 */
const reDate = (value, target) => {
  if (!value) return value;
  if (DATE_ONLY.test(value)) return target.format('YYYY-MM-DD');

  const current = dayjs(value);
  if (!current.isValid()) return value;
  return current
    .set('year', target.year())
    .set('month', target.month())
    .set('date', target.date())
    .toISOString();
};

/**
 * One visit, same clock time, a different day.
 *
 * Re-dating by `.set()` on year/month/date rather than by adding a day difference, so a move
 * across a DST boundary does not slide the visit by an hour.
 *
 * **All four fields**, because the grid and the payload read different ones and a card that
 * moved in one and not the other is a card that has not moved. That was the first version's
 * whole bug (see `reDate`), which is also why this is exported rather than re-implemented by
 * the second thing that needs it: `scatterVisitsForDemo` moves visits for the walkthrough and
 * has to move them exactly as an apply does, or the two would disagree about what "moved"
 * means on the same grid.
 */
export const reDateShift = (shift, target) => {
  const next = { ...shift };
  ['start', 'startsAt', 'end', 'endsAt'].forEach((field) => {
    if (next[field]) next[field] = reDate(next[field], target);
  });
  return next;
};

export const relocateVisitsForRoutes = (duties, routes = []) => {
  if (!Array.isArray(duties) || !duties.length) return { duties, moves: new Map() };

  /* One entry per visit, holding the day it is going to, the route that took it,
     and its position in that route's stack — the position is what the landing
     stagger reads, so the cards arrive in route order rather than all at once. */
  const moves = new Map();

  routes.forEach((route) => {
    if (!route?.dayKey) return;
    (route.visitIds || []).forEach((visitId, index) => {
      if (visitId == null) return;
      moves.set(String(visitId), {
        dayKey: route.dayKey,
        routeName: route.name || null,
        worker: route.worker || null,
        order: index,
      });
    });
  });

  if (!moves.size) return { duties, moves };

  const relocated = duties.map((shift) => {
    const move = moves.get(String(shift?.id));
    if (!move) return shift;

    const target = dayjs(move.dayKey);
    if (!target.isValid()) return shift;

    const next = reDateShift(shift, target);

    /* The card names the route it now belongs to. Without this the visit changes
       day and still reads as whatever it was on before, which is the sort of
       half-applied state that makes a planner distrust the whole screen. */
    if (move.routeName) next.runsheetName = move.routeName;

    return next;
  });

  return { duties: relocated, moves };
};
