import dayjs from 'dayjs';
import { SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import { reDateShift } from './applyHarmonizedRoutes';
import { getVisitActionRules } from './visitState';

/**
 * Scatter the week's visits across its days, for the walkthrough.
 *
 * **What this is for, stated plainly: presenting Harmonize.** The feature's whole argument
 * is a week of work strewn across five or six days collapsing onto one or two trips, and
 * that argument needs a mess to start from. Apply leaves the grid tidy — deliberately, it
 * is the payoff — so the second run of the demo has nothing to fix, and the third has less.
 * Asked for directly: *"every time I load or come to the scheduler screen, the visits should
 * be randomly scattered so I can fully walk through the walkthrough."*
 *
 * **It moves nothing on the server, and it is not a fixture.** Same scope as
 * `applyHarmonizedRoutes` next door: the visits that arrived in this window are re-dated on
 * their way to the grid's own state, nothing is written, and a refetch re-scatters rather
 * than persisting anything. The payload is still the tenant's real work — the same visits,
 * the same sites, the same durations and clock times — held on a different day of the same
 * week. Nothing is invented, which is the line between a demo aid and a fake screen.
 *
 * ## The seed, and why the scatter is stable while you present
 *
 * A fresh `Math.random()` per visit per fetch would re-throw every card each time the status
 * filter moved, which is unusable to present from — the planner would be arguing with a grid
 * that reshuffles under them. So the randomness is a **hash of the seed and the visit id**:
 * one seed per mount of the scheduler, and a visit that lands on Thursday stays on Thursday
 * for every refetch of that window until the screen is left and come back to. Which is
 * exactly what was asked for — a new scatter per *visit to the screen*, not per render.
 *
 * ## What is left alone
 *
 * - **Anything that is not a visit.** Patrol and dedicated shifts are a route's own roster,
 *   and moving one would be a claim about somebody's working day rather than about demand.
 * - **Anything the optimizer would not touch either.** Completed and cancelled visits are
 *   read-only (D4) and Harmonize skips them, so a demo that scattered them would be
 *   scattering what the feature cannot then gather. The test of that is
 *   `getVisitActionRules`, not a status list here, which is what keeps the two sets the
 *   same one — and note where that lands a *past* visit: it resolves to **missed**, missed
 *   survives its own date (D5), Harmonize plans it, so this moves it too.
 * - **The past half of a straddling window.** A visit thrown backwards onto Monday of the
 *   current week becomes read-only on arrival and drops out of the plan. So when the window
 *   contains today, today and after are the only targets; a window entirely in the past
 *   (a planner reviewing a finished week) scatters across all of it, since there is nothing
 *   there to protect.
 */

/** Enough of a window to scatter across; below this there is nowhere to move a card to. */
const MIN_SCATTER_DAYS = 2;

/**
 * A month, whatever the window says.
 *
 * The month grid asks for a window this could run over thirty-one days of. Left uncapped a
 * quarter-wide window would fling a fortnight's work across ninety days, which is not the
 * shape of a busy book — it is a shape nothing can be planned from.
 */
const MAX_SCATTER_DAYS = 31;

/**
 * FNV-1a over `${seed}:${visitId}`, finalised, normalised to `[0, 1)`.
 *
 * A hash rather than a PRNG sequence because the input is a *set*, not a stream: the same
 * visit has to land on the same day whatever order the payload arrives in, and however many
 * visits arrive with it. A seeded generator read in array order would re-roll the whole grid
 * whenever a filter added or dropped one card.
 *
 * **The finaliser is not optional, and leaving it out fails silently in the worst way.**
 * Plain FNV-1a over inputs this short and this similar — `seed:v-1`, `seed:v-2` — barely
 * moves its *high* bits, which are exactly the bits a divide by 2³² keeps. The first cut of
 * this function put 24 visits onto **three** days out of fourteen and looked, in code, like
 * a perfectly ordinary hash. For a function whose entire job is to spread things out, a
 * clumping hash is not a rough edge; it is the feature not working while appearing to. The
 * murmur3 avalanche below costs five operations and takes the same 24 visits to eleven or
 * twelve days.
 */
const hashUnitInterval = (input) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash ^= hash >>> 15;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 3266489909);
  hash ^= hash >>> 16;

  return (hash >>> 0) / 4294967296;
};

/** The days a visit may be thrown onto — see the doc above for what is excluded. */
const scatterTargets = (from, to) => {
  const start = dayjs(from);
  const end = dayjs(to);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];

  const days = [];
  let cursor = start.startOf('day');
  const last = end.startOf('day');
  while (!cursor.isAfter(last, 'day') && days.length < MAX_SCATTER_DAYS) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }

  const today = dayjs().startOf('day');
  const fromToday = days.filter((day) => !day.isBefore(today, 'day'));
  return fromToday.length >= MIN_SCATTER_DAYS ? fromToday : days;
};

/**
 * @param {Array} shifts The window's shifts, visits and all, as the grid received them.
 * @param {object} params
 * @param {string|number} params.seed One value per visit to the scheduler screen.
 * @param {string} params.from Window start — the fetch's own `windowStart`.
 * @param {string} params.to Window end — the fetch's own `windowEnd`.
 * @returns {Array} The same list, with the actionable visits re-dated. The input is never
 *                  mutated: the grid holds this array and the caller's, and a shared object
 *                  edited in place would move a card the other collection still thinks is
 *                  where it was.
 */
export const scatterVisitsForDemo = (shifts, { seed, from, to } = {}) => {
  if (!Array.isArray(shifts) || !shifts.length) return shifts;

  const days = scatterTargets(from, to);
  if (days.length < MIN_SCATTER_DAYS) return shifts;

  return shifts.map((shift) => {
    if (shift?.shiftType !== SCHEDULE_DUTIES.HIT) return shift;
    if (getVisitActionRules(shift).isReadOnly) return shift;

    const id = shift?.id;
    if (id == null) return shift;

    const roll = hashUnitInterval(`${seed}:${id}`);
    const target = days[Math.min(days.length - 1, Math.floor(roll * days.length))];

    /* Already there. Returning the original rather than a re-dated copy keeps the array's
       identities stable for the cards that did not move, which is what lets the grid's own
       memoisation skip them. */
    if (dayjs(shift.start || shift.startsAt).isSame(target, 'day')) return shift;

    return reDateShift(shift, target);
  });
};
