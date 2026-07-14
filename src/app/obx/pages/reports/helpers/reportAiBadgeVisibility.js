/** @typedef {Record<string, unknown>} ReportRow */

export const hasHasAiSuggestionsKey = (row) =>
  row != null && Object.hasOwn(row || {}, 'hasAiSuggestions');

export const hasIsAIModifiedKey = (row) => row != null && Object.hasOwn(row || {}, 'isAIModified');

/**
 * Which pill to show on report / shift rows (listing, drawer, Activities).
 *
 * - No `hasAiSuggestions` key, or not `true` → no pill.
 * - `hasAiSuggestions === true` and `isAIModified` key **absent** → **Needs review**.
 * - `hasAiSuggestions === true` and `isAIModified === true` → **AI Refined**.
 * - `hasAiSuggestions === true` and `isAIModified === false` (key present) → no pill.
 *
 * @param {ReportRow | null | undefined} row
 * @returns {'refined' | 'needsReview' | null}
 */
export const getReportAiBadgeVariant = (row) => {
  if (row == null) return null;
  if (!hasHasAiSuggestionsKey(row)) return null;
  if (row.hasAiSuggestions !== true) return null;
  if (!hasIsAIModifiedKey(row)) return 'needsReview';
  if (row.isAIModified === true) return 'refined';
  return null;
};

/**
 * @param {ReportRow | null | undefined} row
 * @returns {boolean}
 */
export const shouldShowReportAiBadge = (row) => getReportAiBadgeVariant(row) != null;

/**
 * @param {ReportRow | null | undefined} row
 * @returns {boolean}
 */
export const shouldShowReportAiBadgeInDrawer = (row) => shouldShowReportAiBadge(row);
