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
  it('refuses a wrong-zone day and says the window was not the problem', () => {
    const p = plan();
    const verdict = priceMove({
      plan: p,
      days: DEFAULT_RUN_DAYS,
      visitId: 'v1',
      targetDate: '2026-08-19',
    });
    expect(verdict.legal).toBe(false);
    expect(verdict.reason).toBe('wrongZone');
    /* The distinction the refusal sentence is built on: the date was fine. */
    expect(verdict.windowAllows).toBe(true);
    expect(verdict.zoneAllows).toBe(false);
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
   * A pin outranks the engine's preference but not the hard constraints. If the days
   * change under a pinned visit so that its day is no longer legal, the pin is dropped
   * rather than honoured — H4 and H7 are not negotiable and a stranded stop in the
   * wrong zone is a worse outcome than a move quietly undone.
   */
  it('drops a pin that has become illegal rather than stranding the visit', () => {
    const days = DEFAULT_RUN_DAYS.map((d) =>
      d.date === '2026-08-18' ? { ...d, zoneId: 'south' } : d,
    );
    const p = planRange({ days, visits: VISITS, pinned: { v1: '2026-08-18' } });
    /* v1 is a North site; Tuesday is now South, so the pin cannot stand. */
    expect(sheet(p, '2026-08-18').stops.some((s) => s.visit.id === 'v1')).toBe(false);
    expect(sheet(p, '2026-08-17').stops.some((s) => s.visit.id === 'v1')).toBe(true);
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
