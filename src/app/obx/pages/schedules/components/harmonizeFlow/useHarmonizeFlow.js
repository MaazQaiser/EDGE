/**
 * One run of the flow: the config, the plan it produces, and where the planner is in it.
 *
 * All six states read this hook and none of them holds state of its own, for the same
 * reason `useHarmonizeRun` exists next door: the capacity strip, the open day pane, the
 * exit panel and the commit summary are four views of a single proposal, and any figure
 * one of them computed for itself would be a figure that could disagree with the others.
 * The plan is derived — `planRange` is pure, so `useMemo` over the config is the whole
 * of the caching story and there is no invalidation to get wrong.
 *
 * **What is state here is exactly what a planner has decided**, and nothing else:
 * the run config (Config B), the visits they set aside, the days they dragged things
 * onto, and the overruns they accepted. Everything else is a function of those.
 */

import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { onSiteMinsFor } from './model/durations';
import { CANONICAL_RANGE, DEFAULT_RUN_DAYS, VISITS } from './model/fixtures';
import { splitOverspill } from './model/overspill';
import { planRange, priceMove } from './model/planner';
import { runDaysForRange } from './model/runDays';

/**
 * The five surfaces. **④ Adjust is not one of them** — it is ③ with a drag in
 * progress, which is what §13.7 describes and what the strip being the drop target
 * requires: the proposal has to stay on screen and keep re-pricing while the pointer
 * moves. Making it a sixth state would mean rendering the same pane twice and keeping
 * two copies in step.
 */
export const FLOW_STATE = {
  SCOPE: 'scope',
  COMPUTING: 'computing',
  PROPOSAL: 'proposal',
};

/**
 * **There is no `COMMIT` state either, and that went the same way.**
 *
 * ⑤ was a review screen between the proposal and Apply: seven rows of consequence — what
 * moves, what gets a new time, what stays broken, what stays empty — and it was accurate.
 * What it was not was *new*. Every figure on it was already on ③ a click earlier: the tabs
 * carry the counts, the not-placed tab carries the failures with their reasons, the tray
 * carries the spill with its hours. So it asked a planner who had just finished reading the
 * plan to read a summary of the plan, and made Apply two clicks deep for it.
 *
 * The two facts it stated that ③ genuinely did not — **the runsheets arrive unassigned**
 * (D14) and **the old arrival times are discarded** (D1) — are one sentence, not a screen,
 * and they now sit above the Apply button where the decision is actually made.
 *
 * **There is no `APPLIED` state, and that is the design.**
 *
 * There used to be: a tick, a headline, a list of the four runsheets, each reading *no
 * installer*. It was accurate and it was the wrong last thing to look at — a summary of a
 * change, shown *instead of* the change, on top of the very grid the change was made to.
 *
 * Apply now closes the drawer and hands the plan to the calendar, which settles every
 * visit card and lands the moved ones on their new days (`useApplyMotion`). The one thing
 * this feature exists to demonstrate — scattered work collapsing onto two or three trips
 * — is the thing the planner watches happen. **The calendar is the success state**, which
 * is also why there is no toast: a sentence claiming the week changed, over a week
 * visibly changing, is the same fact twice.
 */

/**
 * **`TRAY` is gone — `openDay` only ever holds a date now.**
 *
 * It used to be a third kind of value `openDay` could hold, alongside a runsheet's date,
 * so the tab row could switch the body over to the not-placed pane the same way it
 * switched between days. That content is folded into `SpillTray`'s own floating
 * accordion now rather than a tab's content (see its own note), so there is no longer a
 * "tray tab" for a sentinel value to select, and a piece of state that can no longer be
 * reached is one worth removing rather than leaving to be found unused later.
 */

/**
 * How long each narration line is held in ② — **a function of the line, not one number
 * for all of them.**
 *
 * It was a flat 620ms regardless of what the line said, and that is a reading-speed bug a
 * fixed duration always has: *"Checking every day against its shift"* (6 words) and
 * *"Reading 15 visits and their need-by windows"* (7 words, plus two numbers a reader
 * actually stops on) cannot take the same 620ms to read and both be comfortable — one
 * line was idling, the next was being pulled away mid-read.
 *
 * `holdMsForLine` prices each line by its own word count instead: a base for the "swap and
 * orient" cost every line pays, plus a per-word reading allowance, clamped so a one-word
 * line cannot flash by in under half a second and a long one cannot stall the sequence.
 * Deliberately not derived from the plan's own execution: `planRange` computes in well
 * under a millisecond, so there is nothing to narrate, and instrumenting a pure function
 * with timing hooks to serve a loading screen would be the wrong trade. The lines are
 * honest about *what* is being done and make no claim about *when* — see the note in
 * `ComputingState`.
 *
 * The shimmer sweep is driven from the same figure this returns, so a line's sweep and its
 * hold can never fall out of step with each other.
 */
const BASE_HOLD_MS = 380;
const PER_WORD_MS = 70;
const MIN_HOLD_MS = 480;
const MAX_HOLD_MS = 1000;

export const holdMsForLine = (line = '') => {
  const words = line.trim().split(/\s+/).filter(Boolean).length;
  const raw = BASE_HOLD_MS + words * PER_WORD_MS;
  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, raw));
};

export const useHarmonizeFlow = ({ open, onApplied }) => {
  const { t } = useTranslation();
  /* Memoised: `revealLines` depends on it, and a fresh function each render would
     rebuild every line on every keystroke elsewhere in the drawer. */
  const tLine = useCallback(
    (key, options) => t(`obx.runsheet.harmonizeFlow.line.${key}`, options),
    [t],
  );
  /* "1 visits" is the bug this exists to prevent — the countable nouns live in one place
     and every sentence composes them. */
  const tCount = useCallback(
    (noun, count) => t(`obx.runsheet.harmonizeFlow.count.${noun}`, { count }),
    [t],
  );

  const [state, setState] = useState(FLOW_STATE.SCOPE);
  const [days, setDays] = useState(DEFAULT_RUN_DAYS);
  const [range, setRange] = useState(CANONICAL_RANGE);
  const [setAside, setSetAside] = useState([]);
  const [pinned, setPinned] = useState({});
  const [accepted, setAccepted] = useState([]);
  const [openDay, setOpenDay] = useState(null);
  const [step, setStep] = useState(0);

  /**
   * Visits the planner has put back by hand, out of the overspill tray onto a day.
   *
   * **The one piece of state that can make a day run past its shift.** `splitOverspill`
   * lifts trailing stops off a day until it fits, and a forced visit is exempt — so the
   * amber on a route card's gauge always has an author. Keyed as a list of visit ids
   * rather than a `{visitId: date}` map because the *date* is already `pinned`'s business
   * and two records of one placement is two records that can disagree; this one answers
   * only "may the fitter lift this".
   */
  const [forced, setForced] = useState([]);

  /**
   * What each raised day used to be, so X3 can offer "Back to 4h" by name.
   *
   * Keyed by date and written only on the first raise, so raising twice still offers
   * the original figure rather than the intermediate one. An operator who went 4 → 6 → 8
   * wants their settings value back, not the number they passed through.
   */
  const [raisedFrom, setRaisedFrom] = useState({});

  /** A drag in flight: `{ visitId, overDate }`. `overDate` is null between tabs. */
  const [drag, setDrag] = useState(null);

  /**
   * A custom name for a day's route, keyed by date.
   *
   * Config B, like `pinned` and `setAside` beside it: written by hand, cleared with the
   * rest of the run when the range changes or the drawer closes, and never sent back to
   * Config A — a name typed on one run says nothing about the next one, which may not
   * even cover the same date. Absent for a day the planner has not renamed, which is what
   * lets the card fall back to `Route for {day}` rather than every entry needing a value.
   */
  const [routeNames, setRouteNames] = useState({});

  /**
   * Who is on each day's route, keyed by date — **Config B, exactly like `routeNames`.**
   *
   * Written by hand, cleared with the rest of the run, never sent back to Config A. It is
   * also **read by nothing in the engine**: `planRange` never sees it, so assigning
   * somebody cannot change a sequence, a duration or a placement. That is what keeps D14
   * true where it matters — see the note on `INSTALLERS` in `model/fixtures.js`.
   */
  const [installers, setInstallers] = useState({});

  /**
   * The engine's answer: everything legal, placed, with each day's overrun reported.
   *
   * Kept separate from `plan` below because the two say different true things. This one is
   * *what is legal this week* — the D3/S0 contract, where capacity never refuses a visit.
   */
  const rawPlan = useMemo(
    () => planRange({ days, visits: VISITS, setAside, pinned }),
    [days, setAside, pinned],
  );

  /**
   * The plan as it will be driven: each day cut at its shift line, the rest in the tray.
   *
   * Same shape as `rawPlan`, so every state below reads `plan.runsheets` and gets the
   * fitted days. See `model/overspill.js` for why the fitting is a layer rather than a
   * change to the engine.
   */
  const plan = useMemo(
    () => splitOverspill({ plan: rawPlan, days, forced }),
    [rawPlan, days, forced],
  );

  const workedDays = useMemo(() => days.filter((d) => d.worked), [days]);

  /**
   * ①'s prediction, computed before the engine runs (§14.5).
   *
   * Everything needed is static: a site's zone and a visit's window are both known
   * without sequencing anything. So ① can say *"Zone West is not worked — 2 visits
   * will have no legal day"* rather than only *"3 of 4 zones covered"*, and discovery
   * moves from ③ to ①, which is the cheapest place it can happen.
   *
   * It runs the real planner rather than a lookalike check. A second implementation of
   * "can this visit go anywhere" is a second implementation that can disagree with the
   * first, and the disagreement would surface as ① promising a placement that ③ then
   * refuses — the exact failure the prediction exists to prevent.
   */
  const forecast = useMemo(() => {
    const dry = planRange({ days, visits: VISITS });
    /**
     * The same fitting ③ will do, run here so ① can name the day that runs short.
     *
     * The prediction §14.5 asks for has two halves and this is the second one. *No legal
     * day* was always predictable from a zone and a window; *no hours* was not, because it
     * depends on the sequence — which day a visit lands on, and how far the van drives to
     * reach it. Now that the fitting is a pure function of the plan there is nothing
     * stopping ① from running it, so the tray a planner is about to meet in ③ is named
     * before they press the button rather than discovered after it.
     */
    const fitted = splitOverspill({ plan: dry, days });
    const zonesWorked = new Set(workedDays.map((d) => d.zoneId).filter(Boolean));
    return {
      unplacedCount: dry.unplaced.length,
      unplacedMins: dry.unplaced.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0),
      unplacedZones: [...new Set(dry.unplaced.map((u) => u.site?.zoneId).filter(Boolean))],
      zonesWorked,
      workMins: VISITS.reduce((sum, v) => sum + onSiteMinsFor(v.filterCount), 0),
      filterCount: VISITS.reduce((sum, v) => sum + v.filterCount, 0),
      visitCount: VISITS.length,
      /** The denominator `Est. work` never had — the hours the range actually offers. */
      availableMins: dry.totals.availableMins,
      /**
       * Per worked date: the minutes the engine *wants* to put there, before fitting.
       *
       * Taken from `dry` rather than `fitted` on purpose. The fitted day is by definition
       * inside its shift, so a table built from it could never mark the day that is short —
       * which is the one thing this column exists to do.
       */
      loadByDate: Object.fromEntries(dry.runsheets.map((r) => [r.date, r.durationMins])),
      spillCount: fitted.spilled.length,
      spillMins: fitted.totals.spilledMins,
      spillDates: [...new Set(fitted.spilled.map((u) => u.date))],
    };
  }, [days, workedDays]);

  /**
   * The narration lines ② speaks, in the order `planRange` actually does the work.
   *
   * Written from the finished plan, so every one of them is *true about this run* rather
   * than a generic script: the zone line names the zones, the sequencing line names the
   * days, and the last line names what could not be placed. When the endpoints in §5
   * land, the lines do not change — only what drives their timing does.
   */
  const revealLines = useMemo(() => {
    const zones = [...new Set(workedDays.map((d) => d.zoneId).filter(Boolean))];
    const lines = [
      tLine('readVisits', { visits: tCount('visit', VISITS.length) }),
      tLine('matchZones', { zones: tCount('zone', zones.length) }),
      tLine('findLegalDays'),
      ...plan.runsheets.map((r) =>
        tLine('sequencing', {
          day: dayjs(r.date).format('ddd D'),
          stops: tCount('stop', r.stops.length),
        }),
      ),
      tLine('checkShifts'),
    ];
    /* The fitting step, named — it is the one thing ② does that ③ then leads with, and a
       reveal that never mentioned it would make the tray arrive unannounced.

       **`count` is passed as well as the phrase**, and both of these needed it: the phrase
       is already pluralised ("1 visit"), but the *verb* after it is not, so a single spilled
       visit read "1 visit **have** a day but no hours on it". i18next needs the number
       itself to pick the form; handing it only the finished noun phrase leaves the rest of
       the sentence stuck in the plural. */
    if (plan.spilled.length) {
      lines.push(
        tLine('foundSpill', {
          count: plan.spilled.length,
          visits: tCount('visit', plan.spilled.length),
        }),
      );
    }
    if (plan.unplaced.length) {
      lines.push(
        tLine('foundUnplaced', {
          count: plan.unplaced.length,
          visits: tCount('visit', plan.unplaced.length),
        }),
      );
    }
    return lines;
  }, [plan, workedDays, tLine, tCount]);

  /* ── ② the wait ─────────────────────────────────────────────────────────────
     One line at a time, then ③. `setTimeout` rather than `setInterval`, because each
     line now holds for its **own** duration (`holdMsForLine`) rather than one shared
     tick — a chain of timeouts is what lets line 3 be on screen longer than line 1
     without the others drifting to match it. Cleared on unmount and on cancel. */
  useEffect(() => {
    if (state !== FLOW_STATE.COMPUTING) return undefined;
    setStep(0);
    let index = 0;
    let timer;
    const advance = () => {
      timer = window.setTimeout(() => {
        index += 1;
        if (index >= revealLines.length) {
          setState(FLOW_STATE.PROPOSAL);
          return;
        }
        setStep(index);
        advance();
      }, holdMsForLine(revealLines[index]));
    };
    advance();
    return () => clearTimeout(timer);
  }, [state, revealLines]);

  /**
   * Open the first worked day when the proposal arrives — never nothing.
   *
   * A drawer that lands on ③ with no pane open makes the operator click before they
   * can read anything, and the same lesson is already recorded next door: an
   * "expanded route" state that could be empty was a bug rather than a feature. The
   * tray is not the default even when the first day is empty; the proposal is the
   * answer and the tray is the exception to it.
   *
   * **`openDay` can also be *stale*, not just null, and that was a real blank pane.**
   * `removeRoute` deletes the day a planner is looking at, so after it `openDay` names a
   * date that no longer exists — not `null`, so the guard above did not fire, and
   * `plan.runsheets.find(...)` came back undefined, so ③ rendered its tabs and its footer
   * around an empty body. Checking membership rather than nullness covers both: the day
   * was never set, or the day it named has gone.
   */
  useEffect(() => {
    if (state !== FLOW_STATE.PROPOSAL || !workedDays.length) return;
    if (!workedDays.some((d) => d.date === openDay)) setOpenDay(workedDays[0].date);
  }, [state, openDay, workedDays]);

  /* Reopening the drawer starts a fresh run. A proposal left over from last time is
     stale the moment anything on the grid behind it changes (E20), and resuming one
     silently is worse than discarding it. */
  useEffect(() => {
    if (!open) {
      setState(FLOW_STATE.SCOPE);
      setDays(DEFAULT_RUN_DAYS);
      setRange(CANONICAL_RANGE);
      setSetAside([]);
      setPinned({});
      setAccepted([]);
      setRaisedFrom({});
      setForced([]);
      setRouteNames({});
      setInstallers({});
      setOpenDay(null);
      setDrag(null);
    }
  }, [open]);

  /**
   * Set the range, and rebuild the worked days inside it.
   *
   * The chevrons this replaced moved a whole week at a time, so the day set could simply
   * be re-dated by the same offset and every weekday survived by construction. A picker
   * can land on any two dates — a fortnight, a month, three days — so the days have to be
   * *derived* from the new range instead: take the weekdays Settings works, and emit one
   * day per matching date the range contains. A four-week range legitimately produces
   * four Mondays.
   *
   * Config A is keyed by weekday, which is what makes this a lookup rather than a guess.
   */
  const setRangeDates = useCallback((from, to) => {
    const start = dayjs(from);
    const end = dayjs(to);
    if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return;

    setRange({ from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') });
    setDays(runDaysForRange(start, end));

    /* A different range is a different question, so any answer to the old one goes with
       it — pins and set-asides name visits by day, and carrying them forward would apply
       last week's hand edits to a week that never saw them. */
    setPinned({});
    setSetAside([]);
    setAccepted([]);
    setForced([]);
    setRouteNames({});
    setInstallers({});
    setOpenDay(null);
  }, []);

  /* ── Config B edits ──────────────────────────────────────────────────────────
     Every one of these is "a configuration change", which is the only thing D5 lets
     re-run the engine. Because the plan is derived, that happens by itself — there
     is no `rerun()` to forget to call, and no way for a config edit to leave a stale
     proposal on screen. */
  const patchDay = useCallback((date, patch) => {
    setDays((prev) => prev.map((d) => (d.date === date ? { ...d, ...patch } : d)));
  }, []);

  const toggleWorked = useCallback(
    (date) =>
      setDays((prev) =>
        prev.map((d) =>
          d.date === date
            ? { ...d, worked: !d.worked, shiftMins: !d.worked && !d.shiftMins ? 480 : d.shiftMins }
            : d,
        ),
      ),
    [],
  );

  /**
   * A route a planner added by hand — **on instruction, and outside Config A entirely.**
   *
   * D15 makes one zone per worked day a hard constraint the *franchise* answers in
   * Settings; this is a different question, asked and answered inside one run, the same
   * standing a pin or a set-aside has. So it is a plain `days` entry like any other —
   * `worked: true`, a zone, a shift — with one extra field, `custom: true`, that exists
   * for exactly one purpose: telling `removeRoute` which entries it is allowed to touch.
   * Nothing downstream needs to know a day is custom. `planRange` reads `worked`/`zoneId`/
   * `shiftMins` off every entry the same way; a hand-added day and a Config A day are the
   * same shape once they are in the array.
   *
   * **The date is the next free one after the run's own days**, not a picker — this button
   * is "add a route", not "configure one", and the day tabs already sort by date, so
   * a fresh route reliably lands at the end of the row where the button that made it sits.
   * **The zone is the first one this run has not already worked**, so a planner adding a
   * second route is usually reaching for a zone the run does not yet cover rather than a
   * duplicate of one already open — West, in the canonical week. Both are Config B: typed
   * over from `DayPane`'s own inline-editable title and, for the zone, changeable no other
   * way today, which is a real limit of a first pass at this rather than a design decision
   * — see the note on `HarmonizeDrawer`.
   */
  const addRoute = useCallback(() => {
    /**
     * **A date the range already contains, and an unworked one.**
     *
     * The first pass appended the day *after* the run's last date, which put every drop
     * onto it outside somebody's need-by window — including the spilled visit this route
     * exists to rescue (Kelvin Court's window ends the day before). A need-by window is a
     * promise to a customer (H7) and not something a hand-made route gets to ignore, so
     * the route has to land on a date the windows can actually reach: a day inside the
     * range that Config A simply does not work. In the canonical week that is Sat 15.
     *
     * Appending past the range is kept only as the fallback for a range with no spare day
     * in it, where there is no honest alternative.
     */
    const spare = days.find((d) => !d.worked);
    const date = spare
      ? spare.date
      : dayjs(days.reduce((max, d) => (d.date > max ? d.date : max), range.to))
          .add(1, 'day')
          .format('YYYY-MM-DD');

    /**
     * **`zoneId: null`, and that is what makes the route arrive empty.**
     *
     * `legalDaysFor` requires `d.zoneId === site.zoneId`, so a zoned day would have the
     * engine fill this route the moment it appeared — and the whole point of it is to be
     * an empty page a planner fills by hand. A null zone is legal for nothing, so `assign`
     * places nothing, and the only work that ever lands here is work somebody dropped.
     *
     * The drop side is where the zone rule is relaxed instead: `priceMove` lets a `custom`
     * day take any zone (see its own note). That split is the design — **the engine keeps
     * D15's one-zone discipline, the planner is allowed to overrule it by hand** — and it
     * is why this needed no change to `assign`, `planRange` or their tests.
     */
    setDays((prev) => {
      const next = { date, worked: true, shiftMins: 480, zoneId: null, custom: true };
      return prev.some((d) => d.date === date)
        ? prev.map((d) => (d.date === date ? { ...d, ...next } : d))
        : [...prev, next];
    });

    /* Straight to it. A tab that appears somewhere in a row sorted by date — Sat 15 lands
       *first*, not next to the button that made it — is a tab nobody finds; and the route
       is empty, so there is nothing to read anywhere else. */
    setOpenDay(date);
  }, [days, range.to]);

  /**
   * Undo `addRoute` — **and only `addRoute`.**
   *
   * Filtered on `custom` as well as on the date so this can never be the back door that
   * un-works a Config A day; the UI only ever offers the control on a route `custom`
   * itself marks, but the action guards the same rule rather than trusting the caller to.
   * Nothing else needs cleaning up: `planRange` re-derives every legal day and placement
   * from `days` on the next render, and a pin aimed at a date that has stopped existing
   * is already handled — see the note in `planner.js`, `assign`/pin fallback.
   */
  const removeRoute = useCallback((date) => {
    /* Back to unworked rather than spliced out — most custom routes *are* a range day
       Config A does not work (see `addRoute`), so removing the entry would drop a date the
       range genuinely contains. An unworked day is inert everywhere: it builds no runsheet,
       and `ScopeState` lists only worked ones. It also becomes the spare `addRoute` finds
       next time, which is the behaviour you want from an add/remove pair. */
    setDays((prev) =>
      prev.map((d) =>
        d.date === date && d.custom
          ? { ...d, worked: false, shiftMins: 0, zoneId: null, custom: false }
          : d,
      ),
    );
    /* The label and the assignment were about a route that no longer exists. Left behind,
       they would silently reattach to the next custom route on the same date. */
    setRouteNames((prev) => {
      if (!(date in prev)) return prev;
      const next = { ...prev };
      delete next[date];
      return next;
    });
    setInstallers((prev) => {
      if (!(date in prev)) return prev;
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, []);

  /**
   * X3 — the one exit that legitimately re-runs the engine (D5).
   *
   * Remembers the previous shift so the panel can offer the original figure back, and
   * clears any acceptance of that day's overrun: an overrun that has been engineered
   * away is not an overrun somebody accepted, and leaving the acceptance behind would
   * let a later re-raise silently inherit a decision made about different numbers.
   */
  const raiseHours = useCallback(
    (date, shiftMins) => {
      setRaisedFrom((prev) =>
        prev[date] === undefined
          ? { ...prev, [date]: DEFAULT_RUN_DAYS.find((d) => d.date === date)?.shiftMins ?? 0 }
          : prev,
      );
      setAccepted((prev) => prev.filter((d) => d !== date));
      patchDay(date, { shiftMins });
    },
    [patchDay],
  );

  const restoreHours = useCallback(
    (date) => {
      const original = raisedFrom[date];
      if (original === undefined) return;
      setRaisedFrom((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      patchDay(date, { shiftMins: original });
    },
    [patchDay, raisedFrom],
  );

  /**
   * X2 — accept the overrun, and **change state rather than dismiss** (§13.6 N4).
   *
   * The numbers do not move; the volume does. An accepted overrun stops being an open
   * alarm and becomes a settled decision that is still visible in the tab and still
   * itemised in ⑤. That distinction is the finding, and it is why this is a list of
   * dates rather than a `dismissed` boolean — ⑤ has to be able to say *"you accepted
   * this"* about a specific day.
   */
  const acceptOverrun = useCallback(
    (date) => setAccepted((prev) => (prev.includes(date) ? prev : [...prev, date])),
    [],
  );
  const unacceptOverrun = useCallback(
    (date) => setAccepted((prev) => prev.filter((d) => d !== date)),
    [],
  );

  const setAsideVisit = useCallback(
    (visitId) => setSetAside((prev) => (prev.includes(visitId) ? prev : [...prev, visitId])),
    [],
  );
  const restoreVisit = useCallback(
    (visitId) => setSetAside((prev) => prev.filter((v) => v !== visitId)),
    [],
  );

  /**
   * ④'s quote, for the tab currently under the pointer.
   *
   * Recomputed on every `overDate` change and thrown away when the drag ends. It is
   * cheap — `priceMove` re-sequences at most two days of a handful of stops — and
   * memoising it against a moving pointer would cache a value whose whole purpose is
   * to be current.
   */
  const dragQuote = useMemo(() => {
    if (!drag?.visitId || !drag?.overDate) return null;
    return priceMove({ plan, days, visitId: drag.visitId, targetDate: drag.overDate });
  }, [drag, plan, days]);

  /** Price every tab at once, so ④ can label them all the moment a drag begins. */
  const quotesForDrag = useMemo(() => {
    if (!drag?.visitId) return {};
    return Object.fromEntries(
      workedDays.map((d) => [
        d.date,
        priceMove({ plan, days, visitId: drag.visitId, targetDate: d.date }),
      ]),
    );
  }, [drag, plan, days, workedDays]);

  /**
   * Commit the drag. Pinning is what makes the move final (D5) — see `planner.js`.
   * A visit dropped out of the tray also stops being set aside, which is the only way
   * X4 is reversible by dragging rather than only by the panel's own "Put it back".
   */
  const commitDrag = useCallback(
    (targetDate) => {
      const visitId = drag?.visitId;
      setDrag(null);
      if (!visitId) return;
      const verdict = priceMove({ plan, days, visitId, targetDate });
      if (!verdict.legal) return;
      setSetAside((prev) => prev.filter((v) => v !== visitId));
      setPinned((prev) => ({ ...prev, [visitId]: targetDate }));
      /**
       * **Every committed drop is a force, and it has to be.**
       *
       * A pin says *which day*; it says nothing about hours, so on its own a visit dropped
       * onto a day the fitter considers full would be lifted straight back into the tray on
       * the next render — the drag would appear to do nothing. Forcing is what makes the
       * drop stick, and the day going amber is the honest price of it.
       *
       * Set for a stop moved between days too, not only for one coming out of the tray:
       * the planner chose that day for that visit either way, and a move that survives
       * until the target happens to be full is a move with a hidden condition on it.
       */
      setForced((prev) => (prev.includes(visitId) ? prev : [...prev, visitId]));
      setOpenDay(targetDate);
    },
    [drag, plan, days],
  );

  /**
   * Undo a force — the work goes back to the tray and the day comes back inside its shift.
   *
   * The pin goes with it. A pin on a visit the fitter is free to lift is a pin that only
   * takes effect on the runs where the day happens to have room, which is a placement that
   * appears and disappears without anyone touching it.
   */
  const returnToTray = useCallback((visitId) => {
    setForced((prev) => prev.filter((v) => v !== visitId));
    setPinned((prev) => {
      const next = { ...prev };
      delete next[visitId];
      return next;
    });
  }, []);

  /**
   * Name a day's route, or clear a name back to the default.
   *
   * An empty string deletes the entry rather than storing `''`: the card's fallback is
   * `Route for {day}`, and a stored empty string would print as a blank title instead of
   * that fallback the moment the input is cleared.
   */
  const setRouteName = useCallback((date, name) => {
    setRouteNames((prev) => {
      if (!name) {
        if (!(date in prev)) return prev;
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: name };
    });
  }, []);

  /**
   * Put somebody on a day's route, or take them off it.
   *
   * `null` deletes the entry rather than storing it, the same shape `setRouteName` uses
   * above and for the same reason — the card's unassigned state is "no entry for this
   * date", so a stored `null` would be a second way to spell the same thing.
   */
  const setInstaller = useCallback((date, installerId) => {
    setInstallers((prev) => {
      if (!installerId) {
        if (!(date in prev)) return prev;
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: installerId };
    });
  }, []);

  return {
    state,
    setState,
    step,
    days,
    workedDays,
    range,
    revealLines,
    plan,
    forecast,
    openDay,
    setOpenDay,
    accepted,
    raisedFrom,
    setAside,
    forced,
    routeNames,
    installers,
    drag,
    setDrag,
    dragQuote,
    quotesForDrag,
    actions: {
      patchDay,
      toggleWorked,
      addRoute,
      removeRoute,
      raiseHours,
      restoreHours,
      acceptOverrun,
      unacceptOverrun,
      setAsideVisit,
      restoreVisit,
      commitDrag,
      returnToTray,
      setRouteName,
      setInstaller,
      run: () => setState(FLOW_STATE.COMPUTING),
      cancel: () => setState(FLOW_STATE.SCOPE),
      setRangeDates,
      /**
       * Hand the plan over and get out of the way.
       *
       * No terminal screen: the caller closes the drawer and animates the calendar (see
       * the note on `FLOW_STATE`). Everything the calendar needs to do that is in `plan`
       * — the runsheets, their dates and their stops in order — so the handover is one
       * object and this hook keeps no "applied" state to reset afterwards.
       */
      apply: () => onApplied?.(plan),
    },
  };
};
