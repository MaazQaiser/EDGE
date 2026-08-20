/**
 * Which of the two candidate scheduler layouts the page draws.
 *
 * This is a *comparison* switch, not a product setting: Var 1 keeps Companies as a
 * schedule tab with its own day/week/month/year views, Var 2 retires that tab and
 * folds the company timeline into the grid's grouping toggle beside Routes and
 * Visits. The pair exists so the choice between them can be made by looking at both
 * on real data. Expect this module to be deleted once the choice is made — nothing
 * else should grow a dependency on it.
 */
export const SCHEDULER_LAYOUT = {
  TABBED_COMPANIES: 'tabbedCompanies',
  UNIFIED_TOGGLE: 'unifiedToggle',
};

/**
 * Labelled "Var 1" / "Var 2" — the words the choice is being discussed in, and the
 * same reasoning as `VISIT_VIEW_VARIANT`'s V1/V2: a descriptive name here would
 * leave the switch and the conversation about it using different words for the same
 * two layouts. The tooltips carry the description the labels don't.
 */
export const SCHEDULER_LAYOUT_LABELS = {
  [SCHEDULER_LAYOUT.TABBED_COMPANIES]: 'Var 1',
  [SCHEDULER_LAYOUT.UNIFIED_TOGGLE]: 'Var 2',
};

/**
 * **The incumbent leads.** Companies is a tab today, so that is what the page opens
 * on and Var 2 is the thing you opt *into* — the reverse of the card-variant switch,
 * which inverts the rule deliberately because a card is judged by living with it.
 * A layout decides where whole surfaces live, and defaulting to the shape the rest
 * of the app already assumes is what keeps a stale stored key from hiding a tab.
 *
 * A stored value that no longer parses also lands here.
 */
export const DEFAULT_SCHEDULER_LAYOUT = SCHEDULER_LAYOUT.TABBED_COMPANIES;

/** Where the choice is remembered between sessions. */
export const SCHEDULER_LAYOUT_STORAGE_KEY = 'schedules.layoutVariation';

/**
 * Read/write pair modelled on `config/visitViewVariant.js`: validate against the
 * enum on the way in so a stale or hand-edited value degrades to the default instead
 * of being handed straight to a component that has no branch for it, and swallow
 * storage errors on both sides — private mode and policy-disabled storage both throw
 * here, and remembering a comparison toggle is not worth failing a render over.
 */
export const readSchedulerLayout = () => {
  try {
    const stored = window.localStorage.getItem(SCHEDULER_LAYOUT_STORAGE_KEY);
    return Object.values(SCHEDULER_LAYOUT).includes(stored) ? stored : DEFAULT_SCHEDULER_LAYOUT;
  } catch {
    return DEFAULT_SCHEDULER_LAYOUT;
  }
};

export const writeSchedulerLayout = (layout) => {
  // Refuse to persist anything the reader would reject, so the two halves cannot
  // disagree about what a valid value is.
  if (!Object.values(SCHEDULER_LAYOUT).includes(layout)) return;
  try {
    window.localStorage.setItem(SCHEDULER_LAYOUT_STORAGE_KEY, layout);
  } catch {
    // See above: a lost preference is a lost convenience, not a broken switch.
  }
};
