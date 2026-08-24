/**
 * What the fitting layer must keep being true.
 *
 * `planner.test.js` pins the engine's contract — **capacity is advisory, everything legal
 * is placed, Monday overruns by construction**. Those tests are untouched and they are the
 * premise of every test here: this suite pins the *other* half, which is what a planner is
 * shown once that overrun has been turned into a decision they can act on.
 *
 * The two halves have to be tested separately because they answer different questions and
 * a single suite would let one drift into the other. `planRange` answers *what is legal this
 * week*; `splitOverspill` answers *what will be driven, and what is waiting for hours*. The
 * seam between them is the interesting part, so most of what follows is about conservation:
 * nothing may be invented, nothing may be lost, and every visit must be in exactly one of
 * the three places the drawer can draw it.
 */

import { onSiteMinsFor } from './durations';
import { DEFAULT_RUN_DAYS, VISITS } from './fixtures';
import { splitOverspill } from './overspill';
import { planRange } from './planner';

const raw = () => planRange({ days: DEFAULT_RUN_DAYS, visits: VISITS });
const fit = (options = {}) => splitOverspill({ plan: raw(), days: DEFAULT_RUN_DAYS, ...options });
const sheet = (p, date) => p.runsheets.find((r) => r.date === date);

describe('fitting the canonical week to its hours', () => {
  /**
   * The whole reason this layer exists. Monday is 240 minutes of on-site work against a
   * 240-minute shift, so every mile driven is overrun — and a runsheet nobody can drive is
   * not a proposal. After fitting, no day is over.
   */
  it('leaves no day over its shift when nothing has been forced', () => {
    const p = fit();
    expect(p.runsheets.every((r) => r.overrunMins === 0)).toBe(true);
    expect(p.totals.overrunDays).toBe(0);
  });

  it('spills off Monday and leaves Tuesday and Wednesday alone', () => {
    const p = fit();
    expect(p.spilled.map((u) => u.date)).toEqual(['2026-08-17']);
    expect(sheet(p, '2026-08-18').stops).toHaveLength(4);
    expect(sheet(p, '2026-08-19').stops).toHaveLength(5);
  });

  /**
   * **One lift, and it is Kelvin Court.** The fixture's deliberate outlier: 90 minutes on
   * site at the far end of a long leg, in a zone worked exactly once so it has no second
   * legal day. It is the stop X1 narrates and the stop the tray was drawn around.
   *
   * This is the test that rejected the first rule. Lifting from the *end* of the sequence
   * cascaded — Monday cannot hold its own on-site time before the van moves, and every lift
   * re-sequences the day — and took it from four stops to one, spilling three visits. One
   * expensive decision is the right answer, not three cheap ones.
   */
  it('lifts one stop, and it is the outlier', () => {
    const p = fit();
    expect(p.spilled).toHaveLength(1);
    expect(p.spilled[0].site.name).toBe('Kelvin Court Offices');
    expect(p.spilled[0].legalDays).toHaveLength(1);
  });

  /**
   * **12 minutes spare, and the number is not incidental.** §13.7's X4 board states it —
   * "Monday now has 12m spare it cannot legally use" — as the whole point of that state: the
   * remaining trio is 228 minutes against a 240-minute shift, and the twelve minutes are
   * unusable because the only work left for that zone is the visit that just came off it.
   *
   * Asserted exactly rather than as `> 0`, because a fitter that left Monday comfortable by
   * some other margin has broken the agreement between this arithmetic and the boards.
   */
  it("leaves Monday's trio at 228 against its 240 — the X4 board's 12m spare", () => {
    const monday = sheet(fit(), '2026-08-17');
    expect(monday.stops).toHaveLength(3);
    expect(monday.durationMins).toBe(228);
    expect(monday.shiftMins - monday.durationMins).toBe(12);
  });

  it('re-sequences the day it lifted from rather than keeping the old figures', () => {
    const before = sheet(raw(), '2026-08-17');
    const after = sheet(fit(), '2026-08-17');

    expect(after.stops).toHaveLength(before.stops.length - 1);
    /* The elapsed chain has to close on the shorter tour: the last stop's departure plus
       the drive home is the day, or the card's own arithmetic stops adding up. */
    expect(after.durationMins).toBe(
      after.stops[after.stops.length - 1].departMins + after.returnMins,
    );
    expect(after.travelMins).toBeLessThan(before.travelMins);
    /* And the stop numbers close up rather than keeping a gap where the lifted one was. */
    expect(after.stops.map((s) => s.index)).toEqual([1, 2, 3]);
  });
});

describe('conservation — every visit is in exactly one place', () => {
  it('accounts for all fifteen across placed, spilled and unplaced', () => {
    const p = fit();
    expect(p.totals.placedCount + p.spilled.length + p.unplaced.length).toBe(p.totals.visitCount);
  });

  it('never lists a visit as both spilled and unplaced', () => {
    const p = fit();
    const spilled = new Set(p.spilled.map((u) => u.visit.id));
    expect(p.unplaced.some((u) => spilled.has(u.visit.id))).toBe(false);
  });

  it('never leaves a spilled visit on a runsheet as well', () => {
    const p = fit();
    const placed = new Set(p.runsheets.flatMap((r) => r.stops).map((s) => s.visit.id));
    expect(p.spilled.some((u) => placed.has(u.visit.id))).toBe(false);
  });

  /* Spill is *not* a failure, and the drawer's two trays say different things. A spilled
     visit always has somewhere it could legally have gone — that is what makes putting it
     back a decision rather than an override. */
  it('only spills work that had a legal day', () => {
    const p = fit();
    expect(p.spilled.length).toBeGreaterThan(0);
    expect(p.spilled.every((u) => u.legalDays.length > 0)).toBe(true);
  });

  it('reports the spilled hours in the unit the tray leads with', () => {
    const p = fit();
    expect(p.totals.spilledCount).toBe(p.spilled.length);
    expect(p.totals.spilledMins).toBe(
      p.spilled.reduce((sum, u) => sum + onSiteMinsFor(u.visit.filterCount), 0),
    );
  });
});

describe('forcing — the one thing that puts a day over its shift', () => {
  const kelvin = () =>
    raw()
      .runsheets.flatMap((r) => r.stops)
      .find((s) => s.site.id === 'kelvin');

  it('keeps a forced visit on its day, and the day runs over', () => {
    const forced = [kelvin().visit.id];
    const p = splitOverspill({ plan: raw(), days: DEFAULT_RUN_DAYS, forced });

    expect(p.spilled).toHaveLength(0);
    expect(sheet(p, '2026-08-17').overrunMins).toBeGreaterThan(0);
    expect(p.totals.overrunDays).toBe(1);
  });

  /**
   * **The regression this rule exists for.** Exempting only the forced visit made the fitter
   * lift *Fenchurch and Verity* to make room for a forced Kelvin — the planner dropped one
   * visit onto Monday and two unrelated ones silently left. Every stop that was on the day
   * stays on it, and the overrun is the answer.
   */
  it('never evicts a third party to make room for forced work', () => {
    const before = sheet(raw(), '2026-08-17');
    const p = splitOverspill({
      plan: raw(),
      days: DEFAULT_RUN_DAYS,
      forced: [kelvin().visit.id],
    });

    expect(
      sheet(p, '2026-08-17')
        .stops.map((s) => s.visit.id)
        .sort(),
    ).toEqual(before.stops.map((s) => s.visit.id).sort());
    expect(p.spilled).toHaveLength(0);
  });

  /* Other days are untouched by a force on one of them — the day is the unit that leaves the
     fitter's hands, not the run. */
  it('still fits the days the planner has not edited', () => {
    const p = splitOverspill({
      plan: raw(),
      days: DEFAULT_RUN_DAYS,
      forced: [kelvin().visit.id],
    });
    expect(sheet(p, '2026-08-18').overrunMins).toBe(0);
    expect(sheet(p, '2026-08-19').overrunMins).toBe(0);
  });

  /**
   * Forcing every stop on Monday is the same state by a longer route, and the right answer is
   * still the overrun rather than an empty day or an infinite loop.
   */
  it('reports the overrun rather than emptying a day where everything is forced', () => {
    const forced = sheet(raw(), '2026-08-17').stops.map((s) => s.visit.id);
    const p = splitOverspill({ plan: raw(), days: DEFAULT_RUN_DAYS, forced });

    expect(sheet(p, '2026-08-17').stops).toHaveLength(4);
    expect(sheet(p, '2026-08-17').overrunMins).toBe(101);
    expect(p.spilled).toHaveLength(0);
  });

  it('ignores a forced id that is not on any runsheet', () => {
    const p = splitOverspill({ plan: raw(), days: DEFAULT_RUN_DAYS, forced: ['not-a-visit'] });
    expect(p.spilled.map((u) => u.site.name)).toEqual(['Kelvin Court Offices']);
  });
});

describe('X3 — raising the hours is what stops the spill', () => {
  it('keeps Monday whole once its shift covers the driving', () => {
    const days = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-17' ? { ...d, shiftMins: 360 } : d,
    );
    const p = splitOverspill({ plan: planRange({ days, visits: VISITS }), days });

    expect(p.spilled).toHaveLength(0);
    expect(sheet(p, '2026-08-17').stops).toHaveLength(4);
    expect(sheet(p, '2026-08-17').overrunMins).toBe(0);
  });
});

describe('determinism — a proposal nobody can review twice is not a proposal', () => {
  it('gives byte-identical results across runs', () => {
    expect(JSON.stringify(fit())).toBe(JSON.stringify(fit()));
  });
});
