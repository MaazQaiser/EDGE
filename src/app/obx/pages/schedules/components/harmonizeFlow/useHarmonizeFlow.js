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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { onSiteMinsFor } from './model/durations';
import { CANONICAL_RANGE, DEFAULT_RUN_DAYS, VISITS } from './model/fixtures';
import { planRange, priceMove } from './model/planner';

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
  COMMIT: 'commit',
};

/**
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

/** The tray is a peer of the day tabs, so it is a value `openDay` can hold (B3, N3). */
export const TRAY = 'tray';

/**
 * How long each narration line is held in ②.
 *
 * The same value the workspace's reveal uses, and the fade in `thinkingLine` is driven
 * from it so a line can never be cut off mid-word.
 *
 * Deliberately not derived from the plan's own execution: `planRange` computes in well
 * under a millisecond, so there is nothing to narrate, and instrumenting a pure function
 * with timing hooks to serve a loading screen would be the wrong trade. The lines are
 * honest about *what* is being done and make no claim about *when* — see the note in
 * `ComputingState`.
 */
const LINE_MS = 850;

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
   * What each raised day used to be, so X3 can offer "Back to 4h" by name.
   *
   * Keyed by date and written only on the first raise, so raising twice still offers
   * the original figure rather than the intermediate one. An operator who went 4 → 6 → 8
   * wants their settings value back, not the number they passed through.
   */
  const [raisedFrom, setRaisedFrom] = useState({});

  /** A drag in flight: `{ visitId, overDate }`. `overDate` is null between tabs. */
  const [drag, setDrag] = useState(null);

  const plan = useMemo(
    () => planRange({ days, visits: VISITS, setAside, pinned }),
    [days, setAside, pinned],
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
    const zonesWorked = new Set(workedDays.map((d) => d.zoneId).filter(Boolean));
    return {
      unplacedCount: dry.unplaced.length,
      unplacedMins: dry.unplaced.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0),
      unplacedZones: [...new Set(dry.unplaced.map((u) => u.site?.zoneId).filter(Boolean))],
      zonesWorked,
      workMins: VISITS.reduce((sum, v) => sum + onSiteMinsFor(v.filterCount), 0),
      filterCount: VISITS.reduce((sum, v) => sum + v.filterCount, 0),
      visitCount: VISITS.length,
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
    if (plan.unplaced.length) {
      lines.push(tLine('foundUnplaced', { visits: tCount('visit', plan.unplaced.length) }));
    }
    return lines;
  }, [plan, workedDays, tLine, tCount]);

  /* ── ② the wait ─────────────────────────────────────────────────────────────
     One line at a time, then ③. `lineRef` keeps the interval from closing over a stale
     index, and the timer is cleared on unmount and on cancel. */
  const lineRef = useRef(0);
  useEffect(() => {
    if (state !== FLOW_STATE.COMPUTING) return undefined;
    lineRef.current = 0;
    setStep(0);
    const id = setInterval(() => {
      lineRef.current += 1;
      setStep(lineRef.current);
      if (lineRef.current >= revealLines.length) {
        clearInterval(id);
        setState(FLOW_STATE.PROPOSAL);
      }
    }, LINE_MS);
    return () => clearInterval(id);
  }, [state, revealLines.length]);

  /**
   * Open the first worked day when the proposal arrives — never nothing.
   *
   * A drawer that lands on ③ with no pane open makes the operator click before they
   * can read anything, and the same lesson is already recorded next door: an
   * "expanded route" state that could be empty was a bug rather than a feature. The
   * tray is not the default even when the first day is empty; the proposal is the
   * answer and the tray is the exception to it.
   */
  useEffect(() => {
    if (state === FLOW_STATE.PROPOSAL && openDay === null && workedDays.length) {
      setOpenDay(workedDays[0].date);
    }
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
      setOpenDay(null);
      setDrag(null);
    }
  }, [open]);

  /**
   * Move the range a week at a time, and carry the worked-day pattern with it.
   *
   * The days are Config A's answer to *which weekdays do we work*, so shifting the range
   * has to re-date them rather than drop them — a planner looking at next week should see
   * next week's Monday, still North, still four hours. Shifting by whole weeks is what
   * makes that a re-dating rather than a re-interpretation: the weekday of every day in
   * the set is preserved by construction.
   */
  const shiftRange = useCallback((deltaDays) => {
    setRange((prev) => ({
      from: dayjs(prev.from).add(deltaDays, 'day').format('YYYY-MM-DD'),
      to: dayjs(prev.to).add(deltaDays, 'day').format('YYYY-MM-DD'),
    }));
    setDays((prev) =>
      prev.map((d) => ({ ...d, date: dayjs(d.date).add(deltaDays, 'day').format('YYYY-MM-DD') })),
    );
    /* A shifted range is a different question, so any answer to the old one goes with
       it — pins and set-asides name visits by day, and carrying them forward would
       silently apply last week's hand edits to next week's plan. */
    setPinned({});
    setSetAside([]);
    setAccepted([]);
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
      setOpenDay(targetDate);
    },
    [drag, plan, days],
  );

  return {
    state,
    setState,
    step,
    days,
    workedDays,
    range,
    revealLines,
    lineMs: LINE_MS,
    plan,
    forecast,
    openDay,
    setOpenDay,
    accepted,
    raisedFrom,
    setAside,
    drag,
    setDrag,
    dragQuote,
    quotesForDrag,
    actions: {
      patchDay,
      toggleWorked,
      raiseHours,
      restoreHours,
      acceptOverrun,
      unacceptOverrun,
      setAsideVisit,
      restoreVisit,
      commitDrag,
      run: () => setState(FLOW_STATE.COMPUTING),
      cancel: () => setState(FLOW_STATE.SCOPE),
      review: () => setState(FLOW_STATE.COMMIT),
      backToProposal: () => setState(FLOW_STATE.PROPOSAL),
      shiftRange,
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
