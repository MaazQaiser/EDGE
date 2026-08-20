/**
 * Durations in this screen's own voice: `2 hr 30 min`, not `2h 30m`.
 *
 * **A second formatter, deliberately, rather than changing the shared one.**
 * `formatMinutesAsDuration` in `buildRoute/helper.js` prints the compact `2h 30m`
 * and is read by the run sheet tables, the capacity meters and the visit cards —
 * places where a duration sits in a dense column and every character costs a pixel.
 * The proposed-route column is the opposite case: a handful of figures, each one a
 * number the planner is being asked to accept, at the size and spacing of prose. `hr`
 * and `min` read as words there where `h` and `m` read as a unit code.
 *
 * Changing the shared formatter to suit this screen would have re-spelled every
 * duration in the product to fix the typography of one column, which is the tail
 * wagging the dog. So: two formatters, one sentence each explaining which is which,
 * and no caller left guessing.
 */

/** `0` is `0 min`, not the empty string — a zero duration is still an answer. */
export const formatMinutesLong = (minutes = 0) => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;

  if (!hours) return `${mins} min`;
  if (!mins) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

/**
 * Whole miles, from kilometres.
 *
 * Rounded rather than fixed to a decimal: `18 mi` is the figure a planner checks a
 * route against, and `18.4 mi` implies the straight-line estimate underneath it is
 * accurate to a tenth of a mile, which it is not.
 */
export const formatMiles = (km = 0) => `${Math.round(Math.max(0, km) * 0.621371)} mi`;

/**
 * The days a run covers, as the header says them: `Mon`, `Mon & Tue`, `Mon, Wed & Fri`.
 *
 * Serial comma deliberately absent before the ampersand — this is a label, not a
 * sentence, and `Mon, Wed, & Fri` reads as a list that lost its last item.
 */
export const formatDayList = (labels = []) => {
  const clean = labels.filter(Boolean);
  if (!clean.length) return '';
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(', ')} & ${clean[clean.length - 1]}`;
};
