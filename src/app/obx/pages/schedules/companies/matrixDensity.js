/**
 * Expanded or collapsed — how much room the year matrix gives a month.
 *
 * The Year view is a twelve-column grid, one column per month, and the columns are
 * what make it readable: a card lands under the heading for the month it happens
 * in, so "when is this building due" is answered by *position* before anything is
 * read. That is worth 148px a month when the book is dense.
 *
 * It is not worth it when the book is sparse, which is the common case: a location
 * serviced quarterly fills three columns in twelve and rules whitespace through the
 * other nine, and a planner scanning forty locations for the next due date spends
 * that scan on empty cells. Collapsed answers the same question the other way —
 * drop the month axis entirely and pack the visits together in date order, so a row
 * is as long as the work on it and no longer.
 *
 * So this is a **reading of one view**, not a second view: same rows, same cards,
 * same payload, same everything the `scope` decides. That is the line between this
 * and `COMPANIES_VIEW` next door — a grain change moves the window and refetches,
 * this changes nothing but how wide a month is allowed to be. Two controls sit in
 * the toolbar because they answer two different questions.
 */
export const MATRIX_DENSITY = {
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
};

/**
 * **Expanded leads.** The month axis is the thing this view has that no other
 * surface in the app does, and a planner arriving on it should see what it is
 * before being offered the compression of it.
 *
 * A stored value that no longer parses lands here too, so a stale key opens on the
 * intended default rather than on whatever string happened to be in storage.
 */
export const DEFAULT_MATRIX_DENSITY = MATRIX_DENSITY.EXPANDED;

/** Where the choice is remembered between sessions. */
export const MATRIX_DENSITY_STORAGE_KEY = 'schedules.companies.yearDensity';

/**
 * Read/write pair modelled on `config/visitViewVariant.js` and on
 * `CompaniesPane`'s own `readStoredView`: validate against the enum on the way in,
 * so a stale or hand-edited value degrades to the default instead of reaching a
 * component with no branch for it, and swallow storage errors on both sides —
 * private mode and policy-disabled storage both throw here, and remembering a
 * toolbar toggle is not worth failing a render over.
 *
 * Persisted rather than held in component state alone because the pane is remounted
 * on every scheduler tab round-trip: without this, a planner who collapsed the
 * matrix and glanced at the week grid would come back to twelve columns again.
 */
export const readMatrixDensity = () => {
  try {
    const stored = window.localStorage.getItem(MATRIX_DENSITY_STORAGE_KEY);
    return Object.values(MATRIX_DENSITY).includes(stored) ? stored : DEFAULT_MATRIX_DENSITY;
  } catch {
    return DEFAULT_MATRIX_DENSITY;
  }
};

export const writeMatrixDensity = (density) => {
  // Refuse to persist anything the reader would reject, so the two halves cannot
  // disagree about what a valid value is.
  if (!Object.values(MATRIX_DENSITY).includes(density)) return;
  try {
    window.localStorage.setItem(MATRIX_DENSITY_STORAGE_KEY, density);
  } catch {
    // See above: a lost preference is a lost convenience, not a broken switch.
  }
};

export const isCollapsed = (density) => density === MATRIX_DENSITY.COLLAPSED;
