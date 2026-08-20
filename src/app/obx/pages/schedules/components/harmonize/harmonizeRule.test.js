import dayjs from 'dayjs';
import {
  MILES_TO_KM,
  NEED_BY_DEFAULT,
  NEED_BY_MAX,
  RADIUS_DEFAULT,
  RADIUS_MAX_MILES,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';

import {
  assessVisit,
  assessVisitAcrossDays,
  canServeOn,
  dayKeyOf,
  EXCLUDED,
  hasContractWindow,
  isoWeekdayOf,
  needByOf,
  resolveHarmonizeRule,
  routeDaysInWindow,
  smallestRadiusToInclude,
  smallestWindowToInclude,
  triageVisits,
  windowDaysOf,
} from './harmonizeRule';

/**
 * Every date in here is fixed. The rule is dateless by design — `routeDaysInWindow`
 * is the one function that takes a `today`, and it takes it as an argument — so a
 * test that fell back to the wall clock would be a test that passed until Monday.
 */
const MONDAY = '2026-08-17';
const TUESDAY = '2026-08-18';
const THURSDAY = '2026-08-20';

const START = { lat: 28.0, lng: -82.5 };

/**
 * `distanceKm` is haversine, so at this latitude a degree of *latitude* is
 * 111.195 km and nothing else moves. Offsetting only `lat` makes every distance
 * below arithmetic rather than a guess: 0.05° is 5.56 km, 0.1° is 11.12 km.
 */
const KM_PER_DEGREE = 111.1949;

const visitAt = ({ id = 'v', latOffset = 0, ...rest } = {}) => ({
  id,
  siteId: id,
  lat: 28.0 + latOffset,
  lng: -82.5,
  scheduledFor: dayjs(MONDAY),
  ...rest,
});

const rule = (overrides = {}) => resolveHarmonizeRule(overrides);

describe('resolveHarmonizeRule', () => {
  it('reads the saved route days and reports that it did', () => {
    const resolved = rule({ routeDays: [{ weekday: 4, radius: 25 }] });

    expect(resolved.fromSettings).toBe(true);
    expect(resolved.preferredWeekdays).toEqual([4]);
    expect(resolved.radiusFor(4)).toBe(25);
  });

  it('sorts route days by weekday so the run order is not the save order', () => {
    const resolved = rule({
      routeDays: [
        { weekday: 4, radius: 25 },
        { weekday: 1, radius: 10 },
      ],
    });

    expect(resolved.preferredWeekdays).toEqual([1, 4]);
  });

  /* The first of the two deliberate divergences from `docs/harmonization-settings.md`
     (§11). H1 says `routeDays: []` means "unset"; the drawer still needs a day to
     plan onto, so it assumes Monday at the default radius and says so. Pinned
     because it looks like a bug against the design record and is not. */
  it('assumes Monday at the default radius when Settings names no route day', () => {
    const resolved = rule({});

    expect(resolved.fromSettings).toBe(false);
    expect(resolved.preferredWeekdays).toEqual([1]);
    expect(resolved.radiusFor(1)).toBe(RADIUS_DEFAULT);
  });

  /* This used to pin the *opposite* behaviour: the radius belonged to the route day, so
     asking for a weekday the rule did not name fell back to the default. There is one
     radius now, and the invariant worth pinning is that it applies to every weekday --
     a run re-dated from Monday to Thursday reaches exactly as far as it did. */
  it('applies its one radius to every weekday, named by the rule or not', () => {
    const resolved = rule({ radiusMiles: 20, routeDays: [1] });

    expect(resolved.radiusFor(1)).toBeCloseTo(20 * MILES_TO_KM, 6);
    expect(resolved.radiusFor(4)).toBe(resolved.radiusFor(1));
    expect(resolved.radiusKm).toBe(resolved.radiusFor(1));
  });

  it('reads the radius in miles and hands the engine kilometres', () => {
    expect(rule({ radiusMiles: 10 }).radiusKm).toBeCloseTo(16.09344, 5);
    /* Out of range in, clamped value out: the engine never sees a radius the settings
       screen would have refused. */
    expect(rule({ radiusMiles: 999 }).radiusKm).toBeCloseTo(RADIUS_MAX_MILES * MILES_TO_KM, 6);
  });

  /* The legacy shape, still read, because a rule saved before the radius moved out of
     the table sits in a browser somewhere and the resolver meets it before the settings
     screen has had a chance to migrate it. The widest day wins -- see `sanitise`. */
  it('reads the legacy per-day shape, taking the widest radius', () => {
    const resolved = rule({
      routeDays: [
        { weekday: 4, radius: 25 },
        { weekday: 1, radius: 10 },
      ],
    });

    expect(resolved.preferredWeekdays).toEqual([1, 4]);
    expect(resolved.radiusKm).toBe(25);
  });

  it('takes the need-by window from Settings, and the default when it is absent', () => {
    expect(rule({ needByDays: 1 }).needByDays).toBe(1);
    expect(rule({}).needByDays).toBe(NEED_BY_DEFAULT);
    /* Zero is a real setting (E2), not a missing one. */
    expect(rule({ needByDays: 0 }).needByDays).toBe(0);
  });

  it('ignores a routeDays value that is not a list', () => {
    expect(rule({ routeDays: null }).fromSettings).toBe(false);
    expect(rule({ routeDays: 'monday' }).fromSettings).toBe(false);
  });
});

describe('isoWeekdayOf', () => {
  /* `dayjs().day()` is 0 = Sunday and this is 1 = Monday, which is the numbering
     every route day in Settings is stored in. */
  it('numbers Monday 1 and Sunday 7', () => {
    expect(isoWeekdayOf(dayjs('2026-08-17'))).toBe(1);
    expect(isoWeekdayOf(dayjs('2026-08-23'))).toBe(7);
  });
});

describe('dayKeyOf', () => {
  it('formats a valid day and gives an empty key for anything else', () => {
    expect(dayKeyOf(dayjs(MONDAY))).toBe(MONDAY);
    expect(dayKeyOf(dayjs('not a date'))).toBe('');
    expect(dayKeyOf(null)).toBe('');
  });
});

describe('needByOf', () => {
  it('prefers the stated due date over the day the visit happens to sit on', () => {
    const visit = visitAt({ needByDate: THURSDAY, scheduledFor: dayjs(MONDAY) });

    expect(needByOf(visit).format('YYYY-MM-DD')).toBe(THURSDAY);
  });

  it('falls back to the scheduled day when no due date is stated', () => {
    expect(needByOf(visitAt({})).format('YYYY-MM-DD')).toBe(MONDAY);
  });

  it('ignores an unparseable due date rather than propagating it', () => {
    const visit = visitAt({ needByDate: 'whenever' });

    expect(needByOf(visit).format('YYYY-MM-DD')).toBe(MONDAY);
  });

  it('is null when the visit is dated in neither way', () => {
    expect(needByOf({ id: 'v' })).toBeNull();
  });
});

describe('windowDaysOf', () => {
  const run = rule({ needByDays: 3 });

  /**
   * **This is the truth table the `Number(null)` bug walked straight through.**
   * `Number.isFinite(Number(null))` is `true` because `Number(null)` is `0`, so
   * every visit with no contract window was read as having a zero-day one: only
   * visits due exactly on the route day qualified, and the panel reported eleven
   * of fourteen visits as contract-bound. Absence has to be tested for absence,
   * and an explicit `0` still has to mean zero — which is the pair of rows that
   * no single assertion can cover.
   */
  it.each([
    ['absent', undefined, 3],
    ['null', null, 3],
    ['empty string', '', 3],
    ['an explicit zero', 0, 0],
    ['a tighter contract', 1, 1],
    ['a looser contract', 5, 3],
    ['an equal contract', 3, 3],
    ['a numeric string', '2', 2],
    ['a negative contract', -1, 0],
    ['unparseable', 'flexible', 3],
  ])('with a contract window %s, allows %s days → %s', (_label, needByWindowDays, expected) => {
    expect(windowDaysOf(visitAt({ needByWindowDays }), run)).toBe(expected);
  });

  it('takes the tighter of the run and the contract in both directions', () => {
    const tightRun = rule({ needByDays: 1 });

    /* A contract allowing five days does not license a run capped at one. */
    expect(windowDaysOf(visitAt({ needByWindowDays: 5 }), tightRun)).toBe(1);
    /* And a run set to three cannot stretch a contract allowing one. */
    expect(windowDaysOf(visitAt({ needByWindowDays: 1 }), run)).toBe(1);
  });

  it('falls back to the default window when the rule states none', () => {
    expect(windowDaysOf(visitAt({}), {})).toBe(NEED_BY_DEFAULT);
    expect(windowDaysOf(visitAt({}), undefined)).toBe(NEED_BY_DEFAULT);
  });
});

describe('hasContractWindow', () => {
  it('is false for absence and true for a stated window, including zero', () => {
    expect(hasContractWindow(visitAt({}))).toBe(false);
    expect(hasContractWindow(visitAt({ needByWindowDays: null }))).toBe(false);
    expect(hasContractWindow(visitAt({ needByWindowDays: '' }))).toBe(false);
    expect(hasContractWindow(visitAt({ needByWindowDays: 0 }))).toBe(true);
    expect(hasContractWindow(visitAt({ needByWindowDays: 2 }))).toBe(true);
  });
});

describe('assessVisit', () => {
  const run = rule({ needByDays: 3 });
  const assess = (visit, overrides = {}) =>
    assessVisit({
      visit,
      dayKey: MONDAY,
      rule: run,
      startPoint: START,
      radiusKm: 10,
      ...overrides,
    });

  it('reads slack the way the planner says it: negative early, positive late', () => {
    /* Due Thursday, planned onto Monday — three days early. */
    const early = assess(visitAt({ needByDate: THURSDAY }));
    expect(early.slackDays).toBe(-3);

    /* Due the Thursday before, planned onto the Monday after — four days late. */
    const late = assess(visitAt({ needByDate: '2026-08-13' }));
    expect(late.slackDays).toBe(4);
  });

  it('includes a visit sitting exactly on the edge of its window', () => {
    const assessment = assess(visitAt({ needByDate: THURSDAY }));

    expect(assessment.slackDays).toBe(-3);
    expect(assessment.daysOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
    expect(assessment.reason).toBeNull();
  });

  it('excludes a visit one day past the edge, and says by how much', () => {
    const assessment = assess(visitAt({ needByDate: '2026-08-21' }));

    expect(assessment.slackDays).toBe(-4);
    expect(assessment.daysOutside).toBe(1);
    expect(assessment.reason).toBe(EXCLUDED.NEED_BY);
  });

  it('measures the window symmetrically', () => {
    const early = assess(visitAt({ needByDate: '2026-08-22' })); // 5 days after Monday
    const late = assess(visitAt({ needByDate: '2026-08-12' })); // 5 days before

    expect(early.daysOutside).toBe(2);
    expect(late.daysOutside).toBe(2);
  });

  it('honours a contract window tighter than the run', () => {
    const visit = visitAt({ needByDate: TUESDAY, needByWindowDays: 0 });
    const assessment = assess(visit);

    expect(assessment.windowDays).toBe(0);
    expect(assessment.daysOutside).toBe(1);
    expect(assessment.reason).toBe(EXCLUDED.NEED_BY);
  });

  it('does not invent a contract window out of a missing one', () => {
    /* The bug's signature on this function: due Tuesday, planned onto Monday, no
       contract. A zero-day window would exclude it; the run's three-day one does
       not. `null` rather than an absent key on purpose — that is the shape the
       visits actually arrive in (`Number(shift.needByWindowDays) || … : null`),
       and `Number(null)` is the `0` the whole bug was made of. */
    const assessment = assess(visitAt({ needByDate: TUESDAY, needByWindowDays: null }));

    expect(assessment.windowDays).toBe(3);
    expect(assessment.eligible).toBe(true);
  });

  it('reports the measured distance and the amount outside the radius', () => {
    const assessment = assess(visitAt({ latOffset: 0.2 }));

    expect(assessment.distanceKm).toBeCloseTo(0.2 * KM_PER_DEGREE, 2);
    expect(assessment.kmOutside).toBeCloseTo(0.2 * KM_PER_DEGREE - 10, 2);
    expect(assessment.reason).toBe(EXCLUDED.RADIUS);
  });

  it('reports the distance even when the visit is comfortably inside', () => {
    /* The remedy arithmetic needs the amount, not just the verdict. */
    const assessment = assess(visitAt({ latOffset: 0.05 }));

    expect(assessment.distanceKm).toBeCloseTo(0.05 * KM_PER_DEGREE, 2);
    expect(assessment.kmOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
  });

  /* Widening a radius does nothing for a visit that cannot legally be done that
     day, so reporting it as a distance problem would send the planner to the
     wrong knob. */
  it('blames the need-by window before the radius when both are broken', () => {
    const assessment = assess(visitAt({ latOffset: 0.2, needByDate: '2026-08-30' }));

    expect(assessment.daysOutside).toBeGreaterThan(0);
    expect(assessment.kmOutside).toBeGreaterThan(0);
    expect(assessment.reason).toBe(EXCLUDED.NEED_BY);
  });

  it('treats every visit as in-radius when there is no start point', () => {
    /* No origin, no circle. The drawer blocks on a missing start point with its
       own message; a second, wrong diagnosis here would be one fault reported
       twice. */
    const assessment = assess(visitAt({ latOffset: 3 }), { startPoint: null });

    expect(assessment.distanceKm).toBeNull();
    expect(assessment.kmOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
  });

  it('falls back to the rule radius when none is passed for the day', () => {
    const assessment = assess(visitAt({ latOffset: 0.2 }), {
      radiusKm: undefined,
      rule: { ...run, radiusKm: 30 },
    });

    expect(assessment.kmOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
  });

  /* The `rule: {}` is the point of this one and it used to be implicit. A *resolved*
     rule always states a radius now, so passing `radiusKm: undefined` no longer reaches
     the unbounded path -- it falls through to the rule's own reach, which is what the
     next test pins. The unbounded path is still there for a bare rule object, and worth
     keeping: it is what stops a caller that has not resolved anything yet from silently
     filtering every visit out on a radius nobody set. */
  it('does not exclude on distance when neither the call nor the rule states a radius', () => {
    const assessment = assess(visitAt({ latOffset: 3 }), { radiusKm: undefined, rule: {} });

    expect(assessment.kmOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
  });

  it('falls back to the resolved rule radius when the call states none', () => {
    const assessment = assess(visitAt({ latOffset: 3 }), { radiusKm: undefined });

    /* 3 degrees of latitude is ~334km, and the rule's default reach is ten miles. */
    expect(assessment.kmOutside).toBeGreaterThan(0);
    expect(assessment.reason).toBe(EXCLUDED.RADIUS);
    expect(assessment.eligible).toBe(false);
  });

  it('treats an undated visit as having no need-by opinion', () => {
    const assessment = assess({ id: 'v', lat: 28.0, lng: -82.5 });

    expect(assessment.needBy).toBeNull();
    expect(assessment.slackDays).toBe(0);
    expect(assessment.daysOutside).toBe(0);
    expect(assessment.eligible).toBe(true);
  });

  it('makes no need-by judgement without a day to judge against', () => {
    const assessment = assess(visitAt({ needByDate: '2026-12-25' }), { dayKey: '' });

    expect(assessment.slackDays).toBe(0);
    expect(assessment.daysOutside).toBe(0);
  });
});

describe('triageVisits', () => {
  const run = rule({ needByDays: 3 });

  /* One of each, so every count has something to be wrong about: `keep` is
     eligible, `far` is inside the window but outside the circle, `late` is
     outside the window (and also far, to prove the funnel counts it once). */
  const visits = [
    visitAt({ id: 'keep', latOffset: 0.05 }),
    visitAt({ id: 'far', latOffset: 0.2 }),
    visitAt({ id: 'late', latOffset: 0.2, needByDate: '2026-08-30' }),
  ];

  const triage = triageVisits({
    visits,
    dayKey: MONDAY,
    rule: run,
    startPoint: START,
    radiusKm: 10,
  });

  it('sorts each visit into exactly one list', () => {
    expect(triage.eligible.map((visit) => visit.id)).toEqual(['keep']);
    expect(triage.excluded.map((visit) => visit.id)).toEqual(['far', 'late']);
    expect(triage.eligible.length + triage.excluded.length).toBe(visits.length);
  });

  /**
   * The counts are the drawer's copy under the two knobs, so they are part of the
   * answer rather than something the caller re-derives — a count computed twice
   * is a count that will disagree with itself. `inNeedByWindow` is deliberately
   * *not* the eligible count: a visit excluded on distance is still inside its
   * need-by window, and the funnel has to show the two knobs separately for the
   * planner to know which one to move.
   */
  it('counts the funnel: total, through the window, then through the circle', () => {
    expect(triage.counts).toEqual({ total: 3, inNeedByWindow: 2, inRadius: 1 });
  });

  it('carries the assessment onto each visit without losing its own fields', () => {
    const [keep] = triage.eligible;

    expect(keep.siteId).toBe('keep');
    expect(keep.windowDays).toBe(3);
    expect(keep.reason).toBeNull();
  });

  it('counts nothing, rather than crashing, on an empty selection', () => {
    const empty = triageVisits({ dayKey: MONDAY, rule: run, startPoint: START, radiusKm: 10 });

    expect(empty.eligible).toEqual([]);
    expect(empty.counts).toEqual({ total: 0, inNeedByWindow: 0, inRadius: 0 });
  });

  it('reports the whole selection as through the window when the radius is the only problem', () => {
    const allFar = triageVisits({
      visits: [visitAt({ id: 'a', latOffset: 0.2 }), visitAt({ id: 'b', latOffset: 0.25 })],
      dayKey: MONDAY,
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    expect(allFar.counts).toEqual({ total: 2, inNeedByWindow: 2, inRadius: 0 });
  });
});

/**
 * The multi-day question, which is the one a run of install days actually asks.
 *
 * A single-day assessment was correct for a run that collapsed work onto one date.
 * Once the planner ticks a *set* of weekdays, "can this visit be done" stops being a
 * question about one day — and if it is still answered as one, ticking a second
 * weekday admits nothing and the field looks broken.
 */
describe('assessVisitAcrossDays', () => {
  const run = rule({ needByDays: 1 });

  /* Due Thursday, with a ±1 window: Monday is three days early and unreachable,
     Thursday is exactly on it. */
  const dueThursday = visitAt({ id: 'thu', latOffset: 0.01, needByDate: THURSDAY });

  it('admits a visit that only a later day can serve', () => {
    const mondayOnly = assessVisitAcrossDays({
      visit: dueThursday,
      dayKeys: [MONDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });
    const bothDays = assessVisitAcrossDays({
      visit: dueThursday,
      dayKeys: [MONDAY, THURSDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    expect(mondayOnly.eligible).toBe(false);
    expect(mondayOnly.reason).toBe(EXCLUDED.NEED_BY);
    /* Adding the day the work is due has to be what lets it in — otherwise the
       install-day field is decoration. */
    expect(bothDays.eligible).toBe(true);
    expect(bothDays.servedOn).toBe(THURSDAY);
  });

  it('reports the miss against the nearest day, not the first one', () => {
    const assessment = assessVisitAcrossDays({
      visit: visitAt({ id: 'far-out', latOffset: 0.01, needByDate: '2026-08-30' }),
      dayKeys: [MONDAY, THURSDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    /* Thursday is closer to the 30th than Monday is, so the remedy arithmetic
       downstream must be measured from Thursday — a window widened far enough to
       reach the 30th *from Monday* would be wider than the run needs. */
    expect(assessment.servedOn).toBe(THURSDAY);
    expect(assessment.daysOutside).toBe(
      assessVisit({
        visit: visitAt({ id: 'far-out', latOffset: 0.01, needByDate: '2026-08-30' }),
        dayKey: THURSDAY,
        rule: run,
        startPoint: START,
        radiusKm: 10,
      }).daysOutside,
    );
  });

  it('keeps the earliest day when two would serve equally well', () => {
    /* The run fills its days in order, so a visit with a free choice belongs on the
       first day that will take it. */
    const assessment = assessVisitAcrossDays({
      visit: visitAt({ id: 'any', latOffset: 0.01, needByDate: TUESDAY }),
      dayKeys: [MONDAY, TUESDAY],
      rule: rule({ needByDays: 7 }),
      startPoint: START,
      radiusKm: 10,
    });

    expect(assessment.servedOn).toBe(MONDAY);
  });

  it('still answers on the radius alone when there are no days to measure against', () => {
    const assessment = assessVisitAcrossDays({
      visit: visitAt({ id: 'far', latOffset: 0.2 }),
      dayKeys: [],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    /* No date means no need-by verdict to reach, which is what `assessVisit` already
       does with a null day — this must not become an accidental "everything is out". */
    expect(assessment.reason).toBe(EXCLUDED.RADIUS);
    expect(assessment.servedOn).toBe('');
  });

  it('does not let a further day rescue a visit the radius refuses', () => {
    /* Distance does not care which day it is. A remedy that offered another install
       day for a site 22km outside a 10km circle would be the wrong knob. */
    const assessment = assessVisitAcrossDays({
      visit: visitAt({ id: 'far', latOffset: 0.2 }),
      dayKeys: [MONDAY, THURSDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    expect(assessment.eligible).toBe(false);
    expect(assessment.reason).toBe(EXCLUDED.RADIUS);
  });
});

describe('triageVisits across a day set', () => {
  const run = rule({ needByDays: 1 });
  const visits = [
    visitAt({ id: 'mon', latOffset: 0.01, needByDate: MONDAY }),
    visitAt({ id: 'thu', latOffset: 0.01, needByDate: THURSDAY }),
  ];

  it('counts a visit as in when any install day can take it', () => {
    const oneDay = triageVisits({
      visits,
      dayKeys: [MONDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });
    const twoDays = triageVisits({
      visits,
      dayKeys: [MONDAY, THURSDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    expect(oneDay.counts.inRadius).toBe(1);
    expect(twoDays.counts.inRadius).toBe(2);
    expect(twoDays.excluded).toHaveLength(0);
  });

  it('falls back to the single day form when given no set', () => {
    /* Every existing caller passes `dayKey`, and this is the assertion that says so —
       `dayKeys` is additive, not a replacement. */
    const viaKey = triageVisits({
      visits,
      dayKey: MONDAY,
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });
    const viaSet = triageVisits({
      visits,
      dayKeys: [MONDAY],
      rule: run,
      startPoint: START,
      radiusKm: 10,
    });

    expect(viaKey.counts).toEqual(viaSet.counts);
  });
});

describe('smallestWindowToInclude', () => {
  const run = rule({ needByDays: 3 });
  const excludedFor = (visits) =>
    triageVisits({ visits, dayKey: MONDAY, rule: run, startPoint: START, radiusKm: 10 }).excluded;

  it('names the number rather than a direction', () => {
    /* Due five days out, so the knob has to reach five — "widen the window" would
       leave the planner guessing, at a compliance setting. */
    const excluded = excludedFor([visitAt({ id: 'a', needByDate: '2026-08-22' })]);

    expect(smallestWindowToInclude(excluded)).toBe(5);
  });

  it('reaches the furthest of several, not the nearest', () => {
    const excluded = excludedFor([
      visitAt({ id: 'a', needByDate: '2026-08-22' }), // 5 days
      visitAt({ id: 'b', needByDate: '2026-08-24' }), // 7 days
    ]);

    expect(smallestWindowToInclude(excluded)).toBe(7);
  });

  it('measures early exclusions by the same absolute distance', () => {
    const excluded = excludedFor([visitAt({ id: 'a', needByDate: '2026-08-11' })]);

    expect(smallestWindowToInclude(excluded)).toBe(6);
  });

  it('is null when nothing was excluded on the window', () => {
    expect(smallestWindowToInclude(excludedFor([visitAt({ id: 'a', latOffset: 0.2 })]))).toBeNull();
    expect(smallestWindowToInclude([])).toBeNull();
  });

  /**
   * **A contract window is not the planner's to widen**, so a remedy computed to
   * reach one would set the knob to a value that still does not include the visit
   * — advice that is worse than no advice, because the planner would move a
   * compliance setting and watch nothing change.
   */
  it('ignores contract-bound visits, since no value of the knob reaches them', () => {
    const excluded = excludedFor([
      visitAt({ id: 'bound', needByDate: TUESDAY, needByWindowDays: 0 }),
    ]);

    expect(excluded.map((visit) => visit.reason)).toEqual([EXCLUDED.NEED_BY]);
    expect(smallestWindowToInclude(excluded)).toBeNull();
  });

  it('answers for the reachable visits and ignores the bound ones beside them', () => {
    const excluded = excludedFor([
      visitAt({ id: 'bound', needByDate: '2026-08-30', needByWindowDays: 1 }),
      visitAt({ id: 'reachable', needByDate: '2026-08-22' }),
    ]);

    /* 5 for the reachable visit — not the 13 the bound one would demand. */
    expect(smallestWindowToInclude(excluded)).toBe(5);
  });

  it('is null when the number it would name is above the legal maximum', () => {
    /* One day past whatever the ceiling currently is, which is the only interesting case
       here — the exact figure is Settings' business and it has already moved once. */
    const excluded = excludedFor([
      visitAt({ id: 'a', needByDate: dayjs(MONDAY).add(NEED_BY_MAX + 1, 'day') }),
    ]);

    expect(smallestWindowToInclude(excluded)).toBeNull();
  });

  /**
   * **Derived from the constant, not restated.** This asserted a literal 14 against a
   * `NEED_BY_MAX` that has since been tightened to 7, so the suite failed on a test whose
   * subject — *the boundary is inclusive* — was never wrong. A test about a boundary should
   * read the boundary.
   */
  it('offers the maximum itself when that is exactly what is needed', () => {
    const excluded = excludedFor([
      visitAt({ id: 'a', needByDate: dayjs(MONDAY).add(NEED_BY_MAX, 'day') }),
    ]);

    expect(smallestWindowToInclude(excluded)).toBe(NEED_BY_MAX);
  });
});

describe('smallestRadiusToInclude', () => {
  const run = rule({ needByDays: 3 });
  const excludedFor = (visits, radiusKm = 10) =>
    triageVisits({ visits, dayKey: MONDAY, rule: run, startPoint: START, radiusKm }).excluded;

  it('rounds up to a whole kilometre, so the answer actually reaches', () => {
    /* 11.119 km out — a radius of 11 would still miss it. */
    const excluded = excludedFor([visitAt({ id: 'a', latOffset: 0.1 })]);

    expect(smallestRadiusToInclude(excluded)).toBe(12);
  });

  it('reaches the furthest of several', () => {
    const excluded = excludedFor([
      visitAt({ id: 'near', latOffset: 0.1 }), // 11.12 km
      visitAt({ id: 'far', latOffset: 0.2 }), // 22.24 km
    ]);

    expect(smallestRadiusToInclude(excluded)).toBe(23);
  });

  it('is null when nothing was excluded on distance', () => {
    const excluded = excludedFor([visitAt({ id: 'a', needByDate: '2026-08-30' })]);

    expect(smallestRadiusToInclude(excluded)).toBeNull();
    expect(smallestRadiusToInclude([])).toBeNull();
  });

  /* Same reasoning as the window remedy: a visit the knob cannot reach must not
     set the number the knob is offered. A need-by exclusion stays a need-by
     exclusion however far away the site is. */
  it('ignores visits excluded on the window, however far out they sit', () => {
    const excluded = excludedFor([
      visitAt({ id: 'late', latOffset: 3, needByDate: '2026-08-30' }),
      visitAt({ id: 'far', latOffset: 0.1 }),
    ]);

    expect(smallestRadiusToInclude(excluded)).toBe(12);
  });

  it('is null when the radius it would name is above the legal maximum', () => {
    /* RADIUS_MAX is 200 km, and 3° of latitude is 333.6. */
    const excluded = excludedFor([visitAt({ id: 'a', latOffset: 3 })]);

    expect(smallestRadiusToInclude(excluded)).toBeNull();
  });

  it('never proposes a radius below the legal minimum', () => {
    /* Hand-built rather than triaged: `Math.ceil` of any real positive distance
       is already 1 or more, so the floor is only reachable by a zero-distance
       exclusion. Pinned because the clamp is what guarantees the number offered
       is one the settings screen would accept. */
    expect(smallestRadiusToInclude([{ reason: EXCLUDED.RADIUS, distanceKm: 0 }])).toBe(1);
  });

  it('skips exclusions whose distance was never measured', () => {
    expect(
      smallestRadiusToInclude([
        { reason: EXCLUDED.RADIUS, distanceKm: null },
        { reason: EXCLUDED.RADIUS, distanceKm: 4.2 },
      ]),
    ).toBe(5);
  });
});

describe('routeDaysInWindow', () => {
  const monday = rule({ routeDays: [{ weekday: 1, radius: 10 }] });
  const mondayAndThursday = rule({
    routeDays: [
      { weekday: 1, radius: 10 },
      { weekday: 4, radius: 25 },
    ],
  });

  it('returns only the configured weekdays, in order', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs(MONDAY),
      to: dayjs('2026-08-26'),
      today: dayjs(MONDAY),
    });

    expect(days).toEqual(['2026-08-17', '2026-08-24']);
  });

  it('includes both route days of a week when two are set', () => {
    const days = routeDaysInWindow({
      rule: mondayAndThursday,
      from: dayjs(MONDAY),
      to: dayjs('2026-08-23'),
      today: dayjs(MONDAY),
    });

    expect(days).toEqual(['2026-08-17', '2026-08-20']);
  });

  it('counts today itself as available', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs(MONDAY),
      to: dayjs('2026-08-19'),
      today: dayjs(MONDAY),
    });

    expect(days).toEqual([MONDAY]);
  });

  /* Work cannot be scheduled into last Monday. The window is the planner's date
     range and may well start behind today; the run has to begin at today. */
  it('never proposes a day that has already passed', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs('2026-08-03'),
      to: dayjs('2026-08-26'),
      today: dayjs(TUESDAY),
    });

    expect(days).toEqual(['2026-08-24']);
  });

  it('caps the list, so a long window cannot propose a run without end', () => {
    const days = routeDaysInWindow({
      rule: mondayAndThursday,
      from: dayjs(MONDAY),
      to: dayjs('2026-09-14'),
      today: dayjs(MONDAY),
    });

    expect(days).toHaveLength(4);
    expect(days).toEqual(['2026-08-17', '2026-08-20', '2026-08-24', '2026-08-27']);
  });

  it('honours a caller-supplied cap', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs(MONDAY),
      to: dayjs('2026-09-14'),
      today: dayjs(MONDAY),
      max: 2,
    });

    expect(days).toEqual(['2026-08-17', '2026-08-24']);
  });

  it('is empty when the whole window is behind today', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs('2026-08-01'),
      to: dayjs('2026-08-10'),
      today: dayjs(MONDAY),
    });

    expect(days).toEqual([]);
  });

  it('is empty when the window contains no route day at all', () => {
    const days = routeDaysInWindow({
      rule: monday,
      from: dayjs(TUESDAY),
      to: dayjs('2026-08-21'),
      today: dayjs(TUESDAY),
    });

    expect(days).toEqual([]);
  });

  it('is empty rather than throwing on a half-built range', () => {
    expect(routeDaysInWindow({ rule: monday, from: null, to: dayjs(MONDAY) })).toEqual([]);
    expect(routeDaysInWindow({ rule: monday, from: dayjs(MONDAY), to: undefined })).toEqual([]);
    expect(routeDaysInWindow({ rule: monday, from: dayjs(MONDAY), to: dayjs('nonsense') })).toEqual(
      [],
    );
  });

  /* With no route days saved the rule assumes Monday, so the window still yields
     Mondays rather than nothing — the drawer must have a day to plan onto. */
  it('yields the assumed weekday when Settings named none', () => {
    const days = routeDaysInWindow({
      rule: rule({}),
      from: dayjs(MONDAY),
      to: dayjs('2026-08-26'),
      today: dayjs(MONDAY),
    });

    expect(days).toEqual(['2026-08-17', '2026-08-24']);
  });
});

describe('canServeOn', () => {
  const run = rule({ needByDays: 3 });

  /* This is what `planRun`'s `servesOn` hook is wired to: whether work that
     spilled off one route day may legally land on a later one. */
  it('allows a later day still inside the need-by window', () => {
    const visit = visitAt({ needByDate: MONDAY });

    expect(canServeOn({ visit, dayKey: '2026-08-20', rule: run })).toBe(true);
  });

  it('refuses a later day the window cannot reach', () => {
    const visit = visitAt({ needByDate: MONDAY });

    expect(canServeOn({ visit, dayKey: '2026-08-24', rule: run })).toBe(false);
  });

  it('refuses on a tight contract window even when the run would allow it', () => {
    const visit = visitAt({ needByDate: MONDAY, needByWindowDays: 0 });

    expect(canServeOn({ visit, dayKey: TUESDAY, rule: run })).toBe(false);
  });

  /* Distance is a separate question and a separate remedy — this hook answers
     the legality one only, and must not refuse a day because the site is far. */
  it('does not refuse a day on distance', () => {
    const visit = visitAt({ latOffset: 3, needByDate: MONDAY });

    expect(canServeOn({ visit, dayKey: MONDAY, rule: run })).toBe(true);
  });
});
