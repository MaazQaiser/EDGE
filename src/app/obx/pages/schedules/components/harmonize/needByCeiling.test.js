import {
  NEED_BY_MAX,
  NEED_BY_MIN,
} from 'src/app/common/pages/settings/preferences/harmonization/harmonizationSettings';
import { clampNeedBy } from 'src/app/obx/pages/schedules/components/harmonize/useHarmonizeRun';

/**
 * The need-by window's one guard, and the ceiling the Harmonize window puts on it.
 *
 * **This replaces tests for two snapping functions that no longer exist.** `snapNeedBy` rounded
 * a wanted window *up* onto one of four pills and `snapNeedByDown` rounded a ceiling *down*
 * onto one, and picking the wrong direction at a call site produced a screen where every
 * number looked plausible: a remedy that lit a segment and still left the visits out, or a
 * window quietly planning work the range on screen did not cover. The stepper reopened the
 * set, so there is one clamp and no direction to get wrong — which is most of why the pills
 * were worth losing.
 *
 * What still needs pinning is the policy: the run never plans against a window wider than the
 * range it is planning, and the planner's own choice is clamped on *read* rather than
 * overwritten, so widening the range gives them their number back.
 */
describe('clampNeedBy', () => {
  it('keeps a legal window untouched', () => {
    expect(clampNeedBy(3)).toBe(3);
    expect(clampNeedBy(7)).toBe(7);
    expect(clampNeedBy(14)).toBe(14);
    /* The set is open again — 8 was unsayable while the control drew four pills. */
    expect(clampNeedBy(8)).toBe(8);
  });

  it('holds the settings policy at both ends', () => {
    /* `NEED_BY_MIN`/`NEED_BY_MAX` are the settings screen's bounds, read rather than restated:
       that screen sets the policy this run works inside, and a second opinion about what a
       legal window is would be a second policy. */
    expect(clampNeedBy(0)).toBe(NEED_BY_MIN);
    expect(clampNeedBy(1)).toBe(NEED_BY_MIN);
    expect(clampNeedBy(-9)).toBe(NEED_BY_MIN);
    expect(clampNeedBy(40)).toBe(NEED_BY_MAX);
  });

  it('survives what a control can actually hand it', () => {
    /* A stepper only ever sends `value ± 1`, but the remedy links send computed figures and the
       seed comes from saved settings, which may hold anything. */
    expect(clampNeedBy(undefined)).toBe(NEED_BY_MIN);
    expect(clampNeedBy(null)).toBe(NEED_BY_MIN);
    expect(clampNeedBy('9')).toBe(9);
    expect(clampNeedBy(6.4)).toBe(6);
    expect(clampNeedBy(6.6)).toBe(7);
    expect(clampNeedBy(NaN)).toBe(NEED_BY_MIN);
  });

  describe('the ceiling the Harmonize window imposes', () => {
    it('clamps a wide choice down to the window', () => {
      /* A run cannot reach further than the range it is planning: a 5-day window admits ± 5,
         whatever the planner last pressed. */
      expect(clampNeedBy(14, 5)).toBe(5);
      expect(clampNeedBy(14, 7)).toBe(7);
      expect(clampNeedBy(9, 4)).toBe(4);
    });

    it('leaves a choice the window already allows alone', () => {
      expect(clampNeedBy(3, 28)).toBe(3);
      expect(clampNeedBy(7, 14)).toBe(7);
    });

    it('cannot be used to raise the policy maximum', () => {
      /* The ceiling is itself clamped into the policy range before it is applied, so a caller
         handing over a 28-day window does not buy a 28-day need-by. */
      expect(clampNeedBy(28, 28)).toBe(NEED_BY_MAX);
      expect(clampNeedBy(99, 999)).toBe(NEED_BY_MAX);
    });

    it('keeps a window in force on a one-day range', () => {
      /* A single-day Harmonize window is a legitimate thing to draw, and the run still has to
         be planned against something — the floor wins over the ceiling. */
      expect(clampNeedBy(7, 1)).toBe(NEED_BY_MIN);
      expect(clampNeedBy(7, 0)).toBe(NEED_BY_MIN);
    });

    it('never returns a window wider than the range, once the range is wider than the floor', () => {
      for (let windowDays = NEED_BY_MIN; windowDays <= 28; windowDays += 1) {
        for (let picked = 0; picked <= 20; picked += 1) {
          expect(clampNeedBy(picked, windowDays)).toBeLessThanOrEqual(windowDays);
        }
      }
    });

    it('restores the planner’s choice when the range widens again', () => {
      /* The clamp is applied on read and the pick is stored untouched, so this is a property of
         where the clamp lives rather than of any reset: narrow, then widen, and ± 14 is back
         without the planner pressing anything. */
      const picked = 14;
      expect(clampNeedBy(picked, 5)).toBe(5);
      expect(clampNeedBy(picked, 28)).toBe(14);
    });
  });
});
