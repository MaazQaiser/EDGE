import {
  clampNeedBy,
  clampRadiusMiles,
  clampShiftHours,
  DEFAULT_SETTINGS,
  MILES_TO_KM,
  NEED_BY_DEFAULT,
  NEED_BY_MAX,
  NEED_BY_MIN,
  normaliseSettings,
  RADIUS_DEFAULT_MILES,
  RADIUS_MAX_MILES,
  RADIUS_MIN_MILES,
  radiusKmFromSettings,
  readHarmonizationSettings,
  saveHarmonizationSettings,
  SHIFT_HOURS_DEFAULT,
  SHIFT_HOURS_MAX,
  SHIFT_HOURS_MIN,
  shiftMinutesFor,
  smallestSafeNeedBy,
  unreachableWeekdays,
  weekdaysFromSettings,
} from './harmonizationSettings';

/** ISO weekday numbers, which is what these functions speak. */
const MON = 1;
const TUE = 2;
const WED = 3;
const THU = 4;
const FRI = 5;
const SAT = 6;
const SUN = 7;

/* Plain ISO weekday numbers, which is the stored shape now that the radius is one
   value for the whole rule rather than a column beside each day. */
const days = (...weekdays) => weekdays;

describe('unreachableWeekdays', () => {
  /**
   * The table in `docs/harmonization-settings.md` §6, pinned.
   *
   *     (route − due + needBy) mod 7  <  2 × needBy + 1
   *
   * The served-by interval is `2 × needBy + 1` days long and contains a
   * weekly-recurring route day only if it is long enough to reach it. This is the
   * screen's whole payload: a planner who narrows the window from 3 to 2 has just
   * made two days a week unschedulable, and no other surface in the product would
   * ever tell them.
   */
  describe('the §6 table — route days {Mon}', () => {
    it('leaves nothing unreachable at the default ± 3', () => {
      /* At ± 3 the interval is exactly seven days, so every due date reaches every
         route day. That is what makes ± 3 the right default — it is safe by
         arithmetic, not by luck, and the warning can only fire once somebody
         narrows it. */
      expect(unreachableWeekdays({ routeDays: days(MON), needByDays: 3 })).toEqual([]);
    });

    it('darkens Thursday and Friday at ± 2, and nothing else', () => {
      /* The five-day interval reaches Sat Sun Mon Tue Wed. This is the row that
         produces the screen's copy: "Visits due Thursday or Friday can't be done
         on Monday." */
      expect(unreachableWeekdays({ routeDays: days(MON), needByDays: 2 })).toEqual([THU, FRI]);
    });

    it.each([
      [3, []],
      [2, [THU, FRI]],
      [1, [WED, THU, FRI, SAT]],
      [0, [TUE, WED, THU, FRI, SAT, SUN]],
    ])('at ± %s days, %j cannot reach Monday', (needByDays, expected) => {
      expect(unreachableWeekdays({ routeDays: days(MON), needByDays })).toEqual(expected);
    });
  });

  /* E2 in §9: need-by 0 is the total-failure case and gets its own copy on the
     screen, because a visit can then only be done on its exact due date. */
  it('leaves six of seven weekdays dark when the window is zero', () => {
    const dark = unreachableWeekdays({ routeDays: days(MON), needByDays: 0 });

    expect(dark).toHaveLength(6);
    expect(dark).not.toContain(MON);
  });

  it('is empty at need-by zero only when every weekday is a route day', () => {
    expect(unreachableWeekdays({ routeDays: days(1, 2, 3, 4, 5, 6, 7), needByDays: 0 })).toEqual(
      [],
    );
  });

  /* H1 / E1: an empty list is the off state, not a broken rule. The screen shows a
     grey hint there, and a warning would read as an error over a default. */
  it('says nothing when no route day is set at all', () => {
    expect(unreachableWeekdays({ routeDays: [], needByDays: 0 })).toEqual([]);
    expect(unreachableWeekdays({})).toEqual([]);
  });

  it('takes the union of what the route days can reach, not the intersection', () => {
    /* Mon at ± 1 reaches Sun Mon Tue; Thu reaches Wed Thu Fri. Only Saturday is
       left, and a per-day answer would have wrongly darkened five weekdays. */
    expect(unreachableWeekdays({ routeDays: days(MON, THU), needByDays: 1 })).toEqual([SAT]);
  });

  it('returns weekdays in ascending order', () => {
    const dark = unreachableWeekdays({ routeDays: days(WED), needByDays: 1 });

    expect(dark).toEqual([...dark].sort((a, b) => a - b));
  });

  it('defaults the window to ± 3 when none is passed', () => {
    expect(unreachableWeekdays({ routeDays: days(MON) })).toEqual([]);
  });

  /* Reachability is a calendar question and the radius is a geometry one. That was
     worth pinning while a radius sat in this list and could be read by mistake; the
     list holds weekday numbers now, so what is worth pinning is that the legacy
     records are still *understood* rather than counted as zero route days. */
  it('reads the legacy per-day records as the weekdays they name', () => {
    const legacy = [
      { weekday: MON, radius: 10 },
      { weekday: THU, radius: 25 },
    ];

    expect(unreachableWeekdays({ routeDays: legacy, needByDays: 1 })).toEqual(
      unreachableWeekdays({ routeDays: days(MON, THU), needByDays: 1 }),
    );
  });
});

describe('smallestSafeNeedBy', () => {
  /* The remedy has to name a number, not a direction — "widen the window" leaves
     the planner guessing how far, at a compliance setting. */
  it('names ± 3 for a single route day', () => {
    expect(smallestSafeNeedBy({ routeDays: days(MON) })).toBe(3);
  });

  it('names a smaller number when two route days share the week', () => {
    /* Mon and Thu at ± 2 already cover all seven due dates, so demanding 3 would
       tighten the rule further than the problem requires. */
    expect(smallestSafeNeedBy({ routeDays: days(MON, THU) })).toBe(2);
  });

  it('names zero when every weekday is a route day', () => {
    expect(smallestSafeNeedBy({ routeDays: days(1, 2, 3, 4, 5, 6, 7) })).toBe(0);
  });

  it('is null when there is no rule to fix', () => {
    expect(smallestSafeNeedBy({ routeDays: [] })).toBeNull();
    expect(smallestSafeNeedBy({})).toBeNull();
  });

  /* The two functions have to agree, or the screen names a number that does not
     work. Checked against the arithmetic rather than against a second table. */
  it('always names a value that actually leaves nothing unreachable', () => {
    const shapes = [days(MON), days(MON, THU), days(SAT), days(MON, TUE, WED), days(FRI, SUN)];

    shapes.forEach((routeDays) => {
      const safe = smallestSafeNeedBy({ routeDays });

      expect(safe).not.toBeNull();
      expect(unreachableWeekdays({ routeDays, needByDays: safe })).toEqual([]);
      /* And it is the *smallest* such value: one less must fail, unless it is 0. */
      if (safe > 0) {
        expect(unreachableWeekdays({ routeDays, needByDays: safe - 1 })).not.toEqual([]);
      }
    });
  });

  it('never names a value the settings screen would refuse', () => {
    const safe = smallestSafeNeedBy({ routeDays: days(MON) });

    expect(safe).toBeGreaterThanOrEqual(0);
    expect(safe).toBeLessThanOrEqual(NEED_BY_MAX);
    expect(clampNeedBy(safe)).toBe(safe);
  });
});

/**
 * E4 in §9: the screen clamps on blur rather than refusing keystrokes, because
 * refusing the third digit of `250` silently left `25` in the field. Both the
 * field and the stored value go through these, so the two cannot end up
 * disagreeing about where the edges are.
 */
describe('clampRadiusMiles', () => {
  it.each([
    ['inside the range', 25, 25],
    ['at the bottom edge', RADIUS_MIN_MILES, RADIUS_MIN_MILES],
    ['at the top edge', RADIUS_MAX_MILES, RADIUS_MAX_MILES],
    ['above the range', 250, RADIUS_MAX_MILES],
    ['zero', 0, RADIUS_MIN_MILES],
    ['negative', -5, RADIUS_MIN_MILES],
    ['a numeric string', '30', 30],
    ['a decimal', 12.7, 12],
  ])('clamps a value %s', (_label, input, expected) => {
    expect(clampRadiusMiles(input)).toBe(expected);
  });

  it('falls back to the default for anything unreadable', () => {
    /* E3: an empty field is a legal transient state while the planner retypes,
       and it must land on the default rather than on NaN. */
    expect(clampRadiusMiles('')).toBe(RADIUS_DEFAULT_MILES);
    expect(clampRadiusMiles(null)).toBe(RADIUS_DEFAULT_MILES);
    expect(clampRadiusMiles(undefined)).toBe(RADIUS_DEFAULT_MILES);
    expect(clampRadiusMiles('mi')).toBe(RADIUS_DEFAULT_MILES);
  });
});

describe('clampNeedBy', () => {
  it.each([
    ['inside the range', 5, 5],
    ['at the bottom edge', NEED_BY_MIN, NEED_BY_MIN],
    ['at the top edge', NEED_BY_MAX, NEED_BY_MAX],
    ['above the range', 30, NEED_BY_MAX],
    ['negative', -1, NEED_BY_MIN],
    ['a numeric string below the floor', '2', NEED_BY_MIN],
  ])('clamps a value %s', (_label, input, expected) => {
    expect(clampNeedBy(input)).toBe(expected);
  });

  /* Zero used to be a legal setting, and these assertions used to require that it
     survive untouched — E2 existed precisely because a planner could choose it. The
     window is now a closed ± 3 to ± 7, so zero is below the floor and gets clamped up
     like any other out-of-range value. That is the point of the new floor rather than a
     regression against E2: at ± 0 a visit can only ever be done on its exact due date,
     which makes six of seven due weekdays unschedulable against a single route day. */
  it('clamps a zero up to the floor', () => {
    expect(clampNeedBy(0)).toBe(NEED_BY_MIN);
    expect(clampNeedBy('0')).toBe(NEED_BY_MIN);
  });

  it('falls back to the default for anything unreadable', () => {
    expect(clampNeedBy('')).toBe(NEED_BY_DEFAULT);
    expect(clampNeedBy(null)).toBe(NEED_BY_DEFAULT);
    expect(clampNeedBy('days')).toBe(NEED_BY_DEFAULT);
  });
});

/**
 * The unit seam. Miles are what the screen shows and stores; kilometres are what the
 * solver compares against, and `distanceKm` is haversine so there is no choice about
 * which one the geometry speaks. One conversion, one direction, tested at both ends.
 */
describe('radiusKmFromSettings', () => {
  it('converts the stored miles to kilometres', () => {
    expect(radiusKmFromSettings({ radiusMiles: 10 })).toBeCloseTo(16.09344, 5);
    expect(radiusKmFromSettings({ radiusMiles: 1 })).toBeCloseTo(MILES_TO_KM, 6);
  });

  it('clamps before converting, so the engine never sees a refused radius', () => {
    expect(radiusKmFromSettings({ radiusMiles: 9999 })).toBeCloseTo(
      RADIUS_MAX_MILES * MILES_TO_KM,
      6,
    );
    expect(radiusKmFromSettings({ radiusMiles: 0 })).toBeCloseTo(RADIUS_MIN_MILES * MILES_TO_KM, 6);
  });

  it('falls back to the default reach when nothing states one', () => {
    expect(radiusKmFromSettings({})).toBeCloseTo(RADIUS_DEFAULT_MILES * MILES_TO_KM, 6);
    expect(radiusKmFromSettings()).toBeCloseTo(RADIUS_DEFAULT_MILES * MILES_TO_KM, 6);
  });

  /* The widest day, not the first and not the mean: collapsing seven answers into one
     has to keep every day reaching at least as far as it did, or a migration quietly
     shrinks somebody's territory on their behalf. */
  it('takes the widest of the legacy per-day kilometre radii', () => {
    const legacy = {
      routeDays: [
        { weekday: 1, radius: 10 },
        { weekday: 4, radius: 25 },
        { weekday: 5, radius: 15 },
      ],
    };

    expect(radiusKmFromSettings(legacy)).toBe(25);
  });

  it('prefers an explicit miles value over the legacy records beside it', () => {
    const both = { radiusMiles: 5, routeDays: [{ weekday: 1, radius: 90 }] };

    expect(radiusKmFromSettings(both)).toBeCloseTo(5 * MILES_TO_KM, 6);
  });
});

describe('weekdaysFromSettings', () => {
  it('reads both the current and the legacy shape', () => {
    expect(weekdaysFromSettings({ routeDays: [1, 4] })).toEqual([1, 4]);
    expect(
      weekdaysFromSettings({
        routeDays: [{ weekday: 1, radius: 10 }, { weekday: 4 }],
      }),
    ).toEqual([1, 4]);
  });

  it('drops anything that is not an ISO weekday', () => {
    expect(weekdaysFromSettings({ routeDays: [0, 8, -1, 'monday', null, 3] })).toEqual([3]);
    expect(weekdaysFromSettings({ routeDays: 'monday' })).toEqual([]);
    expect(weekdaysFromSettings({})).toEqual([]);
  });
});

/**
 * Read and save, through the storage they actually use.
 *
 * `sanitise` is deliberately not exported — it is the guarantee these two make, not a
 * function anyone should be able to call around them — so it is tested the way it runs.
 */
describe('readHarmonizationSettings', () => {
  const STORAGE_KEY = 'filtergo.harmonization';
  const seed = (value) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

  beforeEach(() => window.localStorage.clear());

  it('returns the defaults for an empty, broken or foreign store', () => {
    expect(readHarmonizationSettings()).toEqual(DEFAULT_SETTINGS);

    window.localStorage.setItem(STORAGE_KEY, 'not json');
    expect(readHarmonizationSettings()).toEqual(DEFAULT_SETTINGS);

    seed(['an', 'array']);
    expect(readHarmonizationSettings().routeDays).toEqual([]);
  });

  /* The migration a tenant who saved a rule last week actually hits. Every day they
     picked has to survive it: opening this screen to find the week blank would read as
     the setting having been lost, and they would have no way to know it had not. */
  it('migrates the legacy per-day shape, keeping the days and the widest radius', () => {
    seed({
      routeDays: [
        { weekday: 4, radius: 40 },
        { weekday: 1, radius: 16 },
      ],
      needByDays: 5,
      planWindowDays: 14,
    });

    const settings = readHarmonizationSettings();

    /* The days survive and each gains the default shift, which is the point of migrating
       rather than resetting: the weekdays are the expensive part of this setting. */
    expect(settings.routeDays).toEqual([
      { weekday: 1, shiftHours: SHIFT_HOURS_DEFAULT, officers: [] },
      { weekday: 4, shiftHours: SHIFT_HOURS_DEFAULT, officers: [] },
    ]);
    /* 40km is 24.85 miles, rounded to 25. */
    expect(settings.radiusMiles).toBe(25);
    expect(settings.needByDays).toBe(5);
    expect(settings.planWindowDays).toBe(14);
  });

  it('de-duplicates and orders the days however they were stored', () => {
    seed({ routeDays: [4, 1, 4, 1, 7] });

    expect(readHarmonizationSettings().routeDays.map((day) => day.weekday)).toEqual([1, 4, 7]);
  });

  it('keeps a location that has usable coordinates', () => {
    seed({ startLocation: { address: '1 High St', lat: 28.1, lng: -82.4 } });

    expect(readHarmonizationSettings().startLocation).toEqual({
      address: '1 High St',
      lat: 28.1,
      lng: -82.4,
    });
  });

  /* A record with no usable pair is not a partial location, it is no location: the
     solver needs the point and would otherwise plan a run from `NaN, NaN`. */
  it.each([
    ['no coordinates', { address: 'somewhere' }],
    ['an unparseable pair', { lat: 'north', lng: 'west' }],
    ['a latitude off the globe', { lat: 91, lng: 0 }],
    ['a longitude off the globe', { lat: 0, lng: 181 }],
    ['nothing at all', null],
  ])('drops a location with %s', (_label, startLocation) => {
    seed({ startLocation });

    expect(readHarmonizationSettings().startLocation).toBeNull();
  });

  it('round-trips a saved rule through storage unchanged', () => {
    const rule = {
      routeDays: [
        { weekday: 1, shiftHours: 8, officers: [{ id: '7', name: 'Alex Rivera' }] },
        { weekday: 4, shiftHours: 6, officers: [] },
      ],
      radiusMiles: 25,
      startLocation: { address: 'Depot', lat: 28.0, lng: -82.5 },
      planWindowDays: 21,
      needByDays: 5,
    };

    const { settings, persisted } = saveHarmonizationSettings(rule);

    expect(persisted).toBe(true);
    expect(settings).toEqual(rule);
    expect(readHarmonizationSettings()).toEqual(rule);
  });
});

/**
 * Shift hours belong to the **day**, which is why the weekday table came back.
 *
 * The default is 8 on purpose: it is what `MAN_DAY_MINUTES` already assumes, so a tenant who
 * never touches this screen plans exactly the routes they plan today. These tests pin that,
 * because a default of anything else would silently re-plan every route on the platform.
 */
describe('clampShiftHours', () => {
  it.each([
    ['inside the range', 6, 6],
    ['at the bottom edge', SHIFT_HOURS_MIN, SHIFT_HOURS_MIN],
    ['at the top edge', SHIFT_HOURS_MAX, SHIFT_HOURS_MAX],
    ['above the range', 30, SHIFT_HOURS_MAX],
    ['zero', 0, SHIFT_HOURS_MIN],
    ['negative', -4, SHIFT_HOURS_MIN],
    ['a numeric string', '10', 10],
    ['a decimal', 7.9, 7],
  ])('clamps a value %s', (_label, input, expected) => {
    expect(clampShiftHours(input)).toBe(expected);
  });

  it('falls back to the eight-hour default for anything unreadable', () => {
    expect(clampShiftHours('')).toBe(SHIFT_HOURS_DEFAULT);
    expect(clampShiftHours(null)).toBe(SHIFT_HOURS_DEFAULT);
    expect(clampShiftHours(undefined)).toBe(SHIFT_HOURS_DEFAULT);
    expect(clampShiftHours('hours')).toBe(SHIFT_HOURS_DEFAULT);
  });

  it('matches the solver default, so an untouched tenant plans what it plans today', () => {
    expect(SHIFT_HOURS_DEFAULT * 60).toBe(8 * 60);
  });
});

describe('shiftMinutesFor', () => {
  const rule = {
    routeDays: [
      { weekday: 1, shiftHours: 10 },
      { weekday: 6, shiftHours: 4 },
    ],
  };

  it('answers in minutes, because that is what the solver budgets in', () => {
    expect(shiftMinutesFor(rule, 1)).toBe(600);
    expect(shiftMinutesFor(rule, 6)).toBe(240);
  });

  /* A weekday the rule does not name has to come back as today's behaviour, not as zero:
     zero minutes is an empty route, and the caller asking is not necessarily wrong to ask. */
  it('falls back to the default for a weekday it has no rule for', () => {
    expect(shiftMinutesFor(rule, 3)).toBe(SHIFT_HOURS_DEFAULT * 60);
    expect(shiftMinutesFor({}, 1)).toBe(SHIFT_HOURS_DEFAULT * 60);
    expect(shiftMinutesFor()).toBe(SHIFT_HOURS_DEFAULT * 60);
  });

  it('reads the older shapes without shift hours as the default', () => {
    expect(shiftMinutesFor({ routeDays: [1, 4] }, 1)).toBe(SHIFT_HOURS_DEFAULT * 60);
    expect(shiftMinutesFor({ routeDays: [{ weekday: 1, radius: 25 }] }, 1)).toBe(
      SHIFT_HOURS_DEFAULT * 60,
    );
  });
});

describe('one location, not two', () => {
  const STORAGE_KEY = 'filtergo.harmonization';

  beforeEach(() => window.localStorage.clear());

  /* `endLocation` was stored for a while and never consumed by anything that plans a route.
     The route is a round trip, so the start is the whole answer, and a rule that still
     carries an end has to lose it rather than have it linger as a value nothing reads. */
  it('drops a stored endLocation and keeps the start', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        startLocation: { address: 'Depot', lat: 28.0, lng: -82.5 },
        endLocation: { address: 'Home', lat: 28.2, lng: -82.6 },
      }),
    );

    const settings = readHarmonizationSettings();

    expect(settings.startLocation).toEqual({ address: 'Depot', lat: 28.0, lng: -82.5 });
    expect(settings).not.toHaveProperty('endLocation');
  });

  it('has no endLocation in the defaults', () => {
    expect(DEFAULT_SETTINGS).not.toHaveProperty('endLocation');
    expect(DEFAULT_SETTINGS.startLocation).toBeNull();
  });
});

/**
 * The form must not open dirty.
 *
 * This pins a bug that shipped: `sanitise` had two construction paths — an early return of
 * `{ ...DEFAULT_SETTINGS }` for a non-object, and the literal at the end — and they produced
 * the same values in a different key order. `isDirty` compares `JSON.stringify` of the
 * normalised form against the saved rule, and that is order-sensitive, so a browser with
 * nothing stored opened the screen already claiming "Unsaved changes" with Save enabled.
 *
 * Asserting on the serialised string rather than with `toEqual` is the whole point: `toEqual`
 * ignores key order and would have passed throughout.
 */
describe('a freshly read rule is not dirty against itself', () => {
  const STORAGE_KEY = 'filtergo.harmonization';

  beforeEach(() => window.localStorage.clear());

  it('serialises identically through read and through normalise, on an empty store', () => {
    const saved = readHarmonizationSettings();

    expect(JSON.stringify(normaliseSettings(saved))).toBe(JSON.stringify(saved));
  });

  it.each([
    ['nothing stored', null],
    ['a legacy per-day rule', { routeDays: [{ weekday: 1, radius: 16 }] }],
    ['a bare weekday list', { routeDays: [2, 5] }],
    ['a current rule', { routeDays: [{ weekday: 3, shiftHours: 6 }], radiusMiles: 30 }],
    ['a rule with a stale endLocation', { endLocation: { lat: 1, lng: 2 } }],
    ['junk', 'not an object'],
  ])('holds for %s', (_label, stored) => {
    if (stored !== null) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const saved = readHarmonizationSettings();

    expect(JSON.stringify(normaliseSettings(saved))).toBe(JSON.stringify(saved));
  });
});

/**
 * The officer selection lives **on the day**, and stores the name beside the id.
 *
 * Per day because the two people who work Saturdays are not the four who work Tuesdays. And
 * the name travels with the id because an id alone makes the setting undisplayable the moment
 * the roster cannot be read — a chip or an avatar that cannot say who it refers to cannot be
 * checked. Same reasoning that puts `address` beside `lat`/`lng` on the location.
 */
describe('officers on a day', () => {
  const STORAGE_KEY = 'filtergo.harmonization';
  const seed = (value) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  const dayOne = () => readHarmonizationSettings().routeDays[0];

  beforeEach(() => window.localStorage.clear());

  it('defaults to nobody on a day that names none', () => {
    seed({ routeDays: [{ weekday: 1, shiftHours: 8 }] });

    expect(dayOne().officers).toEqual([]);
  });

  it('keeps id and name, and coerces a numeric id to a string', () => {
    seed({
      routeDays: [
        { weekday: 1, shiftHours: 8, officers: [{ id: 7, name: 'Alex Rivera', role: 'Officer' }] },
      ],
    });

    /* `role` is dropped: it is roster metadata, not part of the rule, and storing it would park
       a stale copy of somebody's job title in a settings blob. */
    expect(dayOne().officers).toEqual([{ id: '7', name: 'Alex Rivera' }]);
  });

  it('de-duplicates on the id, keeping the first', () => {
    seed({
      routeDays: [
        {
          weekday: 1,
          officers: [
            { id: '7', name: 'Alex Rivera' },
            { id: '7', name: 'Alex R.' },
            { id: '9', name: 'Dana Whitfield' },
          ],
        },
      ],
    });

    expect(dayOne().officers).toEqual([
      { id: '7', name: 'Alex Rivera' },
      { id: '9', name: 'Dana Whitfield' },
    ]);
  });

  /* A record that cannot be identified or cannot be displayed is not a partial selection, it is
     not a selection: an id with no name renders as an avatar nobody can place, and a name with
     no id cannot be matched back to a person. */
  it.each([
    ['no id', [{ name: 'Nameless Id' }]],
    ['an empty id', [{ id: '', name: 'Alex' }]],
    ['a null id', [{ id: null, name: 'Alex' }]],
    ['no name', [{ id: '7' }]],
    ['a blank name', [{ id: '7', name: '   ' }]],
    ['not an array', 'alex'],
    ['nothing', undefined],
  ])('drops %s', (_label, officers) => {
    seed({ routeDays: [{ weekday: 1, officers }] });

    expect(dayOne().officers).toEqual([]);
  });

  it("keeps each day's officers separate", () => {
    seed({
      routeDays: [
        { weekday: 1, shiftHours: 8, officers: [{ id: '7', name: 'Alex Rivera' }] },
        { weekday: 6, shiftHours: 4, officers: [{ id: '9', name: 'Dana Whitfield' }] },
      ],
    });

    const days = readHarmonizationSettings().routeDays;

    expect(days[0].officers).toEqual([{ id: '7', name: 'Alex Rivera' }]);
    expect(days[1].officers).toEqual([{ id: '9', name: 'Dana Whitfield' }]);
  });

  /* The standalone list existed for one revision and nothing consumed it. A rule that still
     carries it loses it rather than having it linger as a value nothing reads. */
  it('drops a stored top-level installers list', () => {
    seed({ installers: [{ id: '7', name: 'Alex Rivera' }], routeDays: [{ weekday: 1 }] });

    expect(readHarmonizationSettings()).not.toHaveProperty('installers');
  });

  it('survives a save and read round trip', () => {
    const officers = [
      { id: '7', name: 'Alex Rivera' },
      { id: '9', name: 'Dana Whitfield' },
    ];

    const { settings, persisted } = saveHarmonizationSettings({
      ...DEFAULT_SETTINGS,
      routeDays: [{ weekday: 1, shiftHours: 8, officers }],
    });

    expect(persisted).toBe(true);
    expect(settings.routeDays[0].officers).toEqual(officers);
    expect(readHarmonizationSettings().routeDays[0].officers).toEqual(officers);
  });
});
