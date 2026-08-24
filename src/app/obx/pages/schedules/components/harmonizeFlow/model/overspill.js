/**
 * Fitting the plan to the hours — the layer that makes the overspill tray possible.
 *
 * ## Why this is not in `planner.js`
 *
 * The engine's contract is D3/S0 and it is deliberate: **capacity is advisory, and a full
 * day never refuses a visit.** `planRange` places everything that is legal and reports each
 * day's overrun as a fact about the day. That is the honest answer to *"what is legal this
 * week"*, it is pinned by its own suite, and it stays exactly as it was.
 *
 * What it is not is an answer to *"what will actually be driven on Monday"*. Four North
 * visits at 240 minutes of on-site work against a 240-minute shift is not a Monday — it is
 * a Monday and a bit, and the bit has to go somewhere a planner can see it and act on it.
 * So this module reads a finished plan and splits each day at its shift line: what fits
 * stays on the runsheet, what does not becomes **spill** — work with a legal day and no
 * hours on it.
 *
 * Keeping the two apart buys three things worth the extra file:
 *
 * 1. **The engine keeps saying what is legal.** Nothing here can make a visit unplaceable;
 *    spill is always work that *could* be driven, which is what makes putting it back a
 *    decision rather than an override.
 * 2. **The overrun stays reachable.** A day only runs past its shift when the planner put
 *    it there — see `forced` — so amber on a bar now means *somebody did this*, not *the
 *    optimizer shrugged*. That is the whole reason the yellow is legible.
 * 3. **One direction of travel.** `planRange` → `splitOverspill` is a pipeline; neither
 *    half has to know about the other's edge cases, and the plan the drawer renders is the
 *    same shape either way.
 *
 * ## Which stop comes off
 *
 * **The one whose removal buys the most time** — its own on-site hours *plus* the detour it
 * forces on everything else — and then again, until the day fits.
 *
 * The obvious rule is "the last stop, then the next-last": it is the stop the shift expires
 * after, the flow already calls it the tipping stop, and it keeps the surviving sequence
 * intact. It was the first rule here and **measuring it on the canonical week is what
 * rejected it.** Monday is 240 minutes of on-site work against a 240-minute shift, so it
 * cannot hold its own stops before the van has moved; lifting from the end cascades, because
 * every lift re-sequences the day and hands "last" to a different visit. It took Monday from
 * four stops to **one**, spilling three visits — two of them cheap ones near base, and one
 * of them not the problem at all.
 *
 * Marginal cost lifts **Kelvin Court**, once. Kelvin is the fixture's deliberate outlier: 90
 * minutes on site at the far end of a long leg, in a zone worked exactly once. Take it off
 * and Monday's tight trio comes to 228 minutes against its 240 — **12 minutes spare**, which
 * is the figure §13.7's own X4 board quotes for exactly this state ("Monday now has 12m spare
 * it cannot legally use"). One decision in the tray instead of three, and the one the design
 * was drawn around.
 *
 * That generalises past the fixture: a planner would rather answer *one* expensive question
 * than three cheap ones, and the expensive stop is also the one most worth moving to another
 * day. So savings dominate, and the tie-breaks run: **more legal days first** — spilling work
 * that can be re-homed beats spilling work that has nowhere else to go — then later in the
 * sequence, then the id, so the result is deterministic.
 *
 * The day is **re-sequenced for every candidate and after every lift**, because removing a
 * stop changes the tour: a 2-opt round without the far outlier is a genuinely different
 * route, and this rule is *defined* in terms of that difference. Scoring a candidate by its
 * own on-site time alone would have picked Kelvin here too and for the wrong reason — it
 * would miss that the detour is most of what Kelvin costs. Cheap at these sizes: at most a
 * handful of 2-opt rounds over at most a handful of stops, inside a `useMemo` rather than on
 * the pointer path.
 */

import { onSiteMinsFor } from './durations';
import { buildRunsheet, legalDaysFor, totalsFor } from './planner';

/**
 * Guard on the lift loop.
 *
 * A day cannot spill more stops than it has, so the loop is already bounded by
 * construction — this is here for the case that makes the bound a lie: a `buildRunsheet`
 * that returned a duration unrelated to its stops would leave `overrunMins` positive
 * forever while the stop list emptied. This runs on every render of ③, so the failure mode
 * to design against is a hung drawer, not a wrong number.
 */
const MAX_LIFTS_PER_DAY = 64;

/**
 * Split a plan at each day's shift line.
 *
 * `forced` is the set of visit ids the planner has put back by hand (④ — dragged out of the
 * tray onto a day). **A day holding forced work is not fitted at all.** It keeps every stop,
 * it runs past its shift, and the route card's gauge turns amber to say so.
 *
 * ## Why the whole day and not just the forced visit
 *
 * Exempting only the forced visit was the first version, and a test is what rejected it:
 * forcing Kelvin Court back onto Monday made the fitter lift **Fenchurch and Verity** to
 * make room for it. Every line of that is defensible in isolation — the day still has to
 * fit, the forced visit is protected, the fitter took the cheapest remaining stops — and the
 * result is indefensible. The planner dropped one visit onto Monday and two unrelated ones
 * silently left.
 *
 * Two arguments say the whole day:
 *
 * - **What the gesture means.** Dragging work onto a day is a statement that *this day
 *   should do this work*, and the answer to it is the overrun with the hours it costs — not
 *   a re-shuffle that keeps the day tidy by evicting somebody else. Amber on a bar is the
 *   honest price; a quietly emptied stop is a bill sent to a third party.
 * - **D5.** "Manual edits never trigger re-harmonization — only a configuration change
 *   does." A fitter that re-solves the day the planner just edited is exactly the
 *   re-optimization that rule forbids. So the edit takes the day out of the fitter's hands,
 *   and the day stays as the planner left it until they change the *configuration* — which
 *   is what X3's `Raise to 6h` is, and why that is the exit offered first.
 *
 * Returns a plan of the same shape as `planRange`'s, so every consumer downstream reads
 * `plan.runsheets` and gets the fitted days without knowing this ran.
 */
export const splitOverspill = ({ plan, days, forced = [] }) => {
  const forcedSet = new Set(forced);
  const runsheets = [];
  const spilled = [];

  plan.runsheets.forEach((sheet) => {
    const day = days.find((d) => d.date === sheet.date);
    /* A day whose config has gone missing is not a day this can fit anything into; pass it
       through untouched rather than rebuilding it against `undefined`. */
    if (!day) {
      runsheets.push(sheet);
      return;
    }

    /* The planner has edited this day, so it is theirs — see the note above. Passed through
       whole, overrun and all, and the decision box under it offers the hours. */
    if (sheet.stops.some((s) => forcedSet.has(s.visit.id))) {
      runsheets.push(sheet);
      return;
    }

    let built = sheet;
    let lifts = 0;

    while (built.overrunMins > 0 && lifts < MAX_LIFTS_PER_DAY) {
      /* Price every stop by rebuilding the day without it, and take the one that buys the
         most time. */
      let best = null;

      built.stops.forEach((candidate, index) => {
        const without = buildRunsheet(
          day,
          built.stops.filter((s) => s.visit.id !== candidate.visit.id).map((s) => s.visit),
        );
        const legalDays = legalDaysFor(candidate.visit, candidate.site || {}, days);

        const better =
          !best ||
          without.durationMins < best.without.durationMins ||
          (without.durationMins === best.without.durationMins &&
            (legalDays.length > best.legalDays.length ||
              (legalDays.length === best.legalDays.length &&
                (index > best.index ||
                  (index === best.index &&
                    candidate.visit.id.localeCompare(best.candidate.visit.id) < 0)))));

        if (better) best = { candidate, index, without, legalDays };
      });

      if (!best) break;

      spilled.push({
        visit: best.candidate.visit,
        site: best.candidate.site,
        /** The day it came off — the tray states it, and it is the drop target it suggests. */
        date: sheet.date,
        /* Carried from the pricing pass rather than recomputed: a spilled visit's card draws
           a window strip, and the strip's legal cells are the whole explanation for whether
           it has anywhere else to go. */
        legalDays: best.legalDays,
      });

      built = best.without;
      lifts += 1;
    }

    runsheets.push(built);
  });

  /**
   * Heaviest first inside each day.
   *
   * The tray is a queue of decisions and the useful one is at the top: the visit that will
   * cost the most to put back is the one whose day needs the most hours added, and it is
   * also the one most likely to be worth moving to another day instead. Date first so the
   * tray reads in the week's own order, and the id last so two equal visits cannot swap
   * places between renders — the same determinism argument the assigner makes.
   */
  spilled.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      onSiteMinsFor(b.visit.filterCount) - onSiteMinsFor(a.visit.filterCount) ||
      a.visit.id.localeCompare(b.visit.id),
  );

  return {
    ...plan,
    runsheets,
    spilled,
    totals: {
      ...totalsFor({
        runsheets,
        days,
        unplaced: plan.unplaced,
        visitCount: plan.totals.visitCount,
      }),
      /* The tray's own headline, in the unit §14.4 settled on. `spilledCount` is kept
         beside it because the accordion's shut bar needs a count to be a count. */
      spilledMins: spilled.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0),
      spilledCount: spilled.length,
    },
  };
};
