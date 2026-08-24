/**
 * What the planner must keep being true.
 *
 * These pin the **canonical week** — Sat 15 – Fri 21 Aug 2026, three worked days, one
 * zone each — because that week is not a test scenario, it is the design. Every board
 * in `HARMONIZE-CONTEXT.md` §13.7 quotes its figures, the four E1 exits are four
 * things that happen *to Monday*, and §14's two blockers are arithmetic about this
 * exact range. A change that moves these numbers has moved the thing the screens were
 * designed against, and should have to say so here first.
 *
 * They are written as the *derived* figures rather than the wireframe's. The boards
 * were drawn by hand and land within three minutes of these on every line, which is
 * the agreement worth having; copying the hand-drawn numbers into a fixture until the
 * engine reproduced them would have been fitting the model to the picture.
 */

import { capacityDelta, onSiteMinsFor } from './durations';
import { DEFAULT_RUN_DAYS, SITES, VISITS } from './fixtures';
import { legalDaysFor, planRange, priceMove } from './planner';
import { UNPLACED_REASON } from './reasons';

const plan = () => planRange({ days: DEFAULT_RUN_DAYS, visits: VISITS });
const sheet = (p, date) => p.runsheets.find((r) => r.date === date);

describe('the canonical week', () => {
  it('produces one runsheet per worked day and nothing for the rest', () => {
    const p = plan();
    expect(p.runsheets.map((r) => r.date)).toEqual(['2026-08-17', '2026-08-18', '2026-08-19']);
    expect(p.runsheets.map((r) => r.zoneId)).toEqual(['north', 'east', 'south']);
  });

  it('places 13 of 15 visits', () => {
    const p = plan();
    expect(p.totals.placedCount).toBe(13);
    expect(p.totals.visitCount).toBe(15);
  });

  it.each([
    ['2026-08-17', 4, 10, 341, 240],
    ['2026-08-18', 4, 15, 442, 600],
    ['2026-08-19', 5, 19, 547, 600],
  ])(
    '%s carries %i stops, %i filters, %i mins against a %i min shift',
    (date, stops, filters, duration, shift) => {
      const r = sheet(plan(), date);
      expect(r.stops).toHaveLength(stops);
      expect(r.filterCount).toBe(filters);
      expect(r.durationMins).toBe(duration);
      expect(r.shiftMins).toBe(shift);
    },
  );

  /**
   * The overrun is structural, not tuned. Monday's four visits are 10 filters, so
   * `4 × 10 + 10 × 20` is 240 minutes of on-site against a 240-minute shift — the day
   * is full before the van moves, and every mile driven is overrun. Asserted as the
   * arithmetic rather than as `341` so that moving a site cannot quietly turn the
   * feature's central example into a comfortable day.
   */
  it('overruns Monday before any driving, by construction', () => {
    const r = sheet(plan(), '2026-08-17');
    expect(r.onSiteMins).toBe(r.shiftMins);
    expect(r.overrunMins).toBe(r.travelMins);
    expect(r.overrunMins).toBeGreaterThan(0);
  });

  it('leaves Tuesday and Wednesday inside their shifts', () => {
    const p = plan();
    expect(sheet(p, '2026-08-18').overrunMins).toBe(0);
    expect(sheet(p, '2026-08-19').overrunMins).toBe(0);
    expect(p.totals.overrunDays).toBe(1);
  });
});

describe('elapsed time (D16)', () => {
  it('starts the clock at the first leg, not at zero and not at an hour', () => {
    const first = sheet(plan(), '2026-08-17').stops[0];
    expect(first.arriveMins).toBe(first.travelFromPrev);
    expect(first.arriveMins).toBeGreaterThan(0);
  });

  it('closes: every stop chains, and the day ends at the return leg', () => {
    plan().runsheets.forEach((r) => {
      r.stops.forEach((s, i) => {
        expect(s.departMins).toBe(s.arriveMins + s.onSiteMins);
        expect(s.onSiteMins).toBe(onSiteMinsFor(s.visit.filterCount));
        if (i > 0) expect(s.arriveMins).toBe(r.stops[i - 1].departMins + s.travelFromPrev);
      });
      expect(r.durationMins).toBe(r.stops[r.stops.length - 1].departMins + r.returnMins);
      expect(r.durationMins).toBe(r.travelMins + r.onSiteMins);
    });
  });
});

describe('the stop that tips the day — X1 narrates this, so it must be derivable', () => {
  it('is Kelvin Court: it arrives inside the shift and leaves outside it', () => {
    const r = sheet(plan(), '2026-08-17');
    const tipping = r.stops.find((s) => s.departMins > r.shiftMins);
    expect(tipping.site.name).toBe('Kelvin Court Offices');
    expect(tipping.arriveMins).toBeLessThan(r.shiftMins);
  });

  it('has no second legal day, which is why Move day must refuse', () => {
    const kelvin = VISITS.find((v) => v.siteId === 'kelvin');
    const site = SITES.find((s) => s.id === 'kelvin');
    expect(legalDaysFor(kelvin, site, DEFAULT_RUN_DAYS)).toEqual(['2026-08-17']);
  });
});

describe('unplaced visits carry a reason, never a boolean (§5)', () => {
  it('reports Zone West as not worked rather than as no legal day', () => {
    const p = plan();
    expect(p.unplaced).toHaveLength(2);
    p.unplaced.forEach((u) => {
      expect(u.reason).toBe(UNPLACED_REASON.ZONE_NOT_WORKED);
      expect(u.site.zoneId).toBe('west');
    });
  });

  /**
   * The two halves of E6 are different failures with different fixes. Working West on
   * a day *outside* every West visit's window must stop saying "zone not worked" and
   * start saying "no legal day" — otherwise ①'s remedy link offers to add a day that
   * changes nothing.
   */
  it('switches to no-legal-day once the zone is worked but out of window', () => {
    const days = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-15' ? { ...d, worked: true, shiftMins: 480, zoneId: 'west' } : d,
    );
    const p = planRange({ days, visits: VISITS });
    const brookfield = p.unplaced.find((u) => u.site.id === 'brookfield');
    /* Window opens 15 Aug, so Saturday is legal — Brookfield places. */
    expect(brookfield).toBeUndefined();

    const sable = p.unplaced.find((u) => u.site.id === 'sableridge');
    /* Sable Ridge's window opens 16 Aug, so the Saturday it now has cannot take it. */
    expect(sable.reason).toBe(UNPLACED_REASON.NO_LEGAL_DAY);
  });

  it('keeps a set-aside visit in the run, with its own reason', () => {
    const p = planRange({ days: DEFAULT_RUN_DAYS, visits: VISITS, setAside: ['v4'] });
    expect(p.unplaced.find((u) => u.visit.id === 'v4').reason).toBe(UNPLACED_REASON.SET_ASIDE);
    expect(p.totals.visitCount).toBe(15);
    expect(p.totals.placedCount).toBe(12);
  });

  /** X4: setting Kelvin aside brings Monday back under its shift. */
  it('setting Kelvin aside clears the overrun', () => {
    const p = planRange({ days: DEFAULT_RUN_DAYS, visits: VISITS, setAside: ['v4'] });
    const mon = sheet(p, '2026-08-17');
    expect(mon.overrunMins).toBe(0);
    expect(capacityDelta(mon.durationMins, mon.shiftMins).direction).toBe('spare');
  });
});

describe('capacity is advisory — it never rejects a visit (S0 / D3)', () => {
  it('places everything legal even when every shift is one minute long', () => {
    const days = DEFAULT_RUN_DAYS.map((d) => (d.worked ? { ...d, shiftMins: 1 } : d));
    const p = planRange({ days, visits: VISITS });
    expect(p.totals.placedCount).toBe(13);
    expect(p.totals.overrunDays).toBe(3);
  });
});

describe('X3 — raising the hours is the exit that re-runs the engine (D5)', () => {
  it('clears Monday when the shift is raised to six hours', () => {
    const days = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-17' ? { ...d, shiftMins: 360 } : d,
    );
    const mon = sheet(planRange({ days, visits: VISITS }), '2026-08-17');
    expect(mon.overrunMins).toBe(0);
    expect(capacityDelta(mon.durationMins, mon.shiftMins).magnitude).toBe(19);
  });
});

describe('move pricing (④)', () => {
  /**
   * **This used to assert the opposite**, and the reversal is deliberate: it read
   * *"refuses a wrong-zone day and says the window was not the problem"*. Dropping is
   * unrestricted now — see `droppableDatesFor` — so a wrong-zone day takes the visit and
   * the two flags survive only as description.
   */
  it('accepts a wrong-zone day, and still reports that the zone did not match', () => {
    const p = plan();
    const verdict = priceMove({
      plan: p,
      days: DEFAULT_RUN_DAYS,
      visitId: 'v1',
      targetDate: '2026-08-19',
    });
    expect(verdict.legal).toBe(true);
    /* Still computed, so a caller can warn even though nothing refuses: v1 is a North
       site and Wednesday works South, but the date is inside its window. */
    expect(verdict.windowAllows).toBe(true);
    expect(verdict.zoneAllows).toBe(false);
    /* And it is a real quote, not a rubber stamp — the target day gets heavier. */
    expect(verdict.target.deltaMins).toBeGreaterThan(0);
  });

  it('honours a pin onto a wrong-zone day, so the drop and the plan agree', () => {
    /* The bug this guards: `priceMove` accepting a drop the pin pass then discards, which
       lands the visit on the engine's own day while the tab you dropped on stays empty. */
    const p = planRange({
      days: DEFAULT_RUN_DAYS,
      visits: VISITS,
      pinned: { v1: '2026-08-19' },
    });
    expect(sheet(p, '2026-08-19').stops.some((s) => s.visit.id === 'v1')).toBe(true);
    expect(sheet(p, '2026-08-17').stops.some((s) => s.visit.id === 'v1')).toBe(false);
  });

  /**
   * The one that matters. §13.7 makes live pricing a design decision — the cost of a
   * move is visible before it is made — and a quote that only approximately matches
   * the outcome is trial and error with a number on top. So: price it, then actually
   * make the move by pinning, then assert the two agree to the minute on **both** days.
   */
  it('prices a legal move on both days, and the quote is exactly what the move delivers', () => {
    const days = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-20' ? { ...d, worked: true, shiftMins: 480, zoneId: 'north' } : d,
    );
    const before = planRange({ days, visits: VISITS });
    const quote = priceMove({ plan: before, days, visitId: 'v1', targetDate: '2026-08-20' });
    expect(quote.legal).toBe(true);
    expect(quote.source.date).toBe('2026-08-17');

    const after = planRange({ days, visits: VISITS, pinned: { v1: '2026-08-20' } });
    expect(sheet(after, '2026-08-20').durationMins).toBe(quote.target.after.durationMins);
    expect(sheet(after, '2026-08-17').durationMins).toBe(quote.source.after.durationMins);
    /* And the move is real: Monday is lighter, Thursday heavier. */
    expect(quote.source.deltaMins).toBeLessThan(0);
    expect(quote.target.deltaMins).toBeGreaterThan(0);
  });

  /**
   * **Narrowed, not deleted.** This used to assert that a pin was dropped when its day's
   * *zone* changed under it, on the rule that H4/H7 outrank a pin. A planner may now
   * overrule the zone deliberately, so a zone change no longer invalidates a pin — the
   * only thing that still does is the day ceasing to be worked, which is the one case
   * where honouring the pin would build a runsheet for a day with no shift.
   */
  it('keeps a pin when the zone changes under it, and drops it when the day stops being worked', () => {
    const rezoned = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-18' ? { ...d, zoneId: 'south' } : d,
    );
    const kept = planRange({ days: rezoned, visits: VISITS, pinned: { v1: '2026-08-18' } });
    /* v1 is a North site and Tuesday is now South — the pin stands anyway. */
    expect(sheet(kept, '2026-08-18').stops.some((s) => s.visit.id === 'v1')).toBe(true);

    const closed = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-18' ? { ...d, worked: false } : d,
    );
    const dropped = planRange({ days: closed, visits: VISITS, pinned: { v1: '2026-08-18' } });
    expect(sheet(dropped, '2026-08-17').stops.some((s) => s.visit.id === 'v1')).toBe(true);
  });

  it('refuses a day that is not worked at all', () => {
    const p = plan();
    expect(
      priceMove({ plan: p, days: DEFAULT_RUN_DAYS, visitId: 'v1', targetDate: '2026-08-16' }),
    ).toMatchObject({ legal: false, reason: 'notWorked' });
  });
});

describe('the headline is hours, not visits (§14.4)', () => {
  it('reports placed and available minutes, and the two West visits as 4h40m', () => {
    const t = plan().totals;
    expect(t.availableMins).toBe(240 + 600 + 600);
    expect(t.placedMins).toBe(1330);
    /* 2 stops × 10 + 13 filters × 20 = 280 minutes. Reported as "2" it looks like a
       rounding error; reported as 4h40m it is a fifth of the week. */
    expect(t.unplacedMins).toBe(280);
  });
});

describe('determinism — a proposal nobody can review twice is not a proposal', () => {
  it('gives byte-identical results across runs', () => {
    expect(JSON.stringify(plan())).toBe(JSON.stringify(plan()));
  });
});

/**
 * A route the planner added by hand (`useHarmonizeFlow`'s `addRoute`): a worked day with
 * **no zone** and `custom: true`, standing in for a date Config A does not work.
 *
 * The whole contract is a split — the engine must never place onto it, and a planner must
 * be able to put anything on it whose window reaches the date. Both halves are load-bearing
 * and each one has been broken once: filling it automatically defeats the feature, and
 * refusing pins onto it made a drop land silently on the engine's day instead.
 */
describe('a manual route', () => {
  const CUSTOM_DATE = '2026-08-15';
  const withCustom = DEFAULT_RUN_DAYS.map((d) =>
    d.date === CUSTOM_DATE ? { ...d, worked: true, shiftMins: 480, zoneId: null, custom: true } : d,
  );

  it('arrives empty — the engine places nothing on it', () => {
    const p = planRange({ days: withCustom, visits: VISITS });
    expect(sheet(p, CUSTOM_DATE).stops).toHaveLength(0);
  });

  it('leaves every other day exactly as it was', () => {
    const before = plan();
    const after = planRange({ days: withCustom, visits: VISITS });
    ['2026-08-17', '2026-08-18', '2026-08-19'].forEach((date) => {
      expect(sheet(after, date).stops.map((s) => s.visit.id)).toEqual(
        sheet(before, date).stops.map((s) => s.visit.id),
      );
    });
  });

  it('accepts a drop from any zone, so long as the window reaches it', () => {
    const p = planRange({ days: withCustom, visits: VISITS });
    /* v4 (Kelvin Court, North) — its window is 14–20 Aug, so Sat 15 is inside it. */
    expect(
      priceMove({ plan: p, days: withCustom, visitId: 'v4', targetDate: CUSTOM_DATE }),
    ).toMatchObject({ legal: true });
  });

  it('now accepts a visit whose need-by window does not reach it, and flags the window', () => {
    const p = planRange({ days: withCustom, visits: VISITS });
    /* v15 (Sable Ridge) cannot be needed before 16 Aug, and the route is dated the 15th.
       The window used to be the one rule this drawer would not break; a planner may now
       break it deliberately, so the drop is accepted and `windowAllows` is what says the
       promise to the customer is the thing being overruled. */
    expect(
      priceMove({ plan: p, days: withCustom, visitId: 'v15', targetDate: CUSTOM_DATE }),
    ).toMatchObject({ legal: true, windowAllows: false });
  });

  it('honours a pin onto it — the bug that made a drop land on the wrong day', () => {
    const p = planRange({ days: withCustom, visits: VISITS, pinned: { v4: CUSTOM_DATE } });
    expect(sheet(p, CUSTOM_DATE).stops.map((s) => s.visit.id)).toEqual(['v4']);
    expect(sheet(p, '2026-08-17').stops.some((s) => s.visit.id === 'v4')).toBe(false);
  });

  it('never reports a pinned visit as unplaced as well as placed', () => {
    /* v14 is Zone West — unworked, so a manual route is its only legal day anywhere. */
    const p = planRange({ days: withCustom, visits: VISITS, pinned: { v14: CUSTOM_DATE } });
    expect(sheet(p, CUSTOM_DATE).stops.map((s) => s.visit.id)).toEqual(['v14']);
    expect(p.unplaced.some((u) => u.visit.id === 'v14')).toBe(false);
  });

  it('keeps an unpinned West visit unplaced, but records the route as a legal day for it', () => {
    const p = planRange({ days: withCustom, visits: VISITS });
    const stranded = p.unplaced.find((u) => u.visit.id === 'v14');
    expect(stranded).toBeDefined();
    expect(stranded.legalDays).toContain(CUSTOM_DATE);
  });

  it('is not a legal day for the engine, even via legalDaysFor', () => {
    const site = SITES.find((s) => s.id === 'kelvin');
    const visit = VISITS.find((v) => v.id === 'v4');
    /* Legal for a drop/pin... */
    expect(legalDaysFor(visit, site, withCustom)).toContain(CUSTOM_DATE);
    /* ...but the plan above proves the engine still did not use it. */
    expect(
      planRange({ days: withCustom, visits: VISITS }).runsheets.find((r) => r.date === CUSTOM_DATE)
        .stops,
    ).toHaveLength(0);
  });
});
