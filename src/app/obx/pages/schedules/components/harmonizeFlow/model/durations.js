/**
 * Time, in the three voices this flow speaks it.
 *
 * The drawer states the same quantity three ways and each one is load-bearing:
 *
 *   **Compact** — `5h 38m`. A day's duration against its shift, a leg of driving, an
 *   overrun. These sit in the capacity strip at 62–74px a tab and in the head's stat
 *   row, where `5 hr 38 min` would wrap and `5.63h` would need decoding.
 *
 *   **Elapsed** — `3:38`. A stop's arrival, measured from the moment the van leaves
 *   base. **Not a clock time** (D16): the runsheet has no start hour, so `3:38` means
 *   *three hours thirty-eight into the day* and nothing else. Colon-separated on
 *   purpose — it is the one notation a reader will not mistake for a duration, which
 *   is exactly the distinction D16 needs them to hold.
 *
 *   **Words** — `1h 38m over`, `2h 30m spare`. The compact figure plus one word of
 *   direction. §13.6's N4 finding: over and comfortable share a silhouette, so the
 *   bar cannot carry the warning alone and the word underneath is not decoration.
 *
 * Deliberately not reusing `harmonize/durations.js`. That file prints `2 hr 30 min`
 * and argues for it — the proposed-route column is prose-spaced and a handful of
 * figures. This drawer is the opposite: three capacity tabs sharing 444px, every one
 * carrying a duration, a capacity and a delta. Two features, two densities, and a
 * shared formatter would have to lose one of the two arguments.
 */

/** `10 min` of overhead per stop, `20 min` per filter (D10). Provisional but usable. */
export const STOP_OVERHEAD_MINS = 10;
export const FILTER_MINS = 20;

/**
 * On-site time for a visit: `10 + (filters × 20)` (D10).
 *
 * A visit with no filters still costs the overhead — arriving somewhere is the cost
 * D10 is naming, and a zero-filter visit is a data fault rather than a free stop.
 */
export const onSiteMinsFor = (filterCount = 0) =>
  STOP_OVERHEAD_MINS + Math.max(0, filterCount) * FILTER_MINS;

/**
 * `5h 38m`, `38m`, `6h`.
 *
 * Zero renders as `0m` rather than empty, for the same reason the sibling formatter
 * spells out `0 min`: a day with no driving is an answer, and a blank where a figure
 * belongs reads as a bug.
 *
 * **The space between the two units was added on instruction** (`5h38m` → `5h 38m`). It is
 * a thin space's worth of legibility on a figure this drawer prints in six places, and the
 * density argument at the top of this file survives it — the point of *compact* was never
 * to close that gap, it was to avoid `5 hr 38 min`, which is more than twice as wide.
 *
 * The single-unit forms deliberately keep no space: `6h` and `38m` are one token each and
 * there is nothing to separate. It also means the string only ever grows when both units
 * are present, which is the case the tabs and the tray were measured against.
 */
export const formatCompact = (minutes = 0) => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (!hours) return `${mins}m`;
  if (!mins) return `${hours}h`;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

/**
 * `3:38` — elapsed since leaving base, zero-padded on the minutes only.
 *
 * The hour is *not* padded: `0:20` is right and `00:20` looks like a clock, which is
 * the one reading D16 spent a decision removing. Past ten hours it simply grows a
 * digit; a runsheet that long has a bigger problem than its notation.
 */
export const formatElapsed = (minutes = 0) => {
  const safe = Math.max(0, Math.round(minutes));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
};

/**
 * The signed capacity line: `1h38m over` / `2h30m spare` / `exactly full`.
 *
 * Returned as `{ magnitude, direction, isOver }` rather than a finished string so the
 * caller can colour the two halves differently and so the words come from the locale
 * file rather than from here. `exactly full` gets its own direction because
 * `0m spare` is a sentence that makes a reader stop and check.
 */
export const capacityDelta = (durationMins = 0, shiftMins = 0) => {
  const diff = Math.round(durationMins) - Math.round(shiftMins);
  if (diff === 0) return { magnitude: 0, direction: 'exact', isOver: false };
  if (diff > 0) return { magnitude: diff, direction: 'over', isOver: true };
  return { magnitude: -diff, direction: 'spare', isOver: false };
};

/**
 * What share of a day is driving, as a whole percent — the `29%` beside `drive 1h38m`.
 *
 * Rounded hard rather than shown to a decimal. §14.8 logs that travel time comes from
 * an unspecified source (Q25), so a tenth of a percent on top of an estimate is
 * precision the number has not earned.
 */
export const drivePercent = (travelMins = 0, durationMins = 0) =>
  durationMins > 0 ? Math.round((travelMins / durationMins) * 100) : 0;
