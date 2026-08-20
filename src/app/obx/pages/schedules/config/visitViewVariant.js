/**
 * Which of the two candidate visit cards the week and day grids draw.
 *
 * This is a *comparison* switch, not a product setting: V1 is the card the grid
 * ships today (`VisitCardContent`), V2 is the site scheduler's hit card cloned
 * beside it (`VisitCardContentV2`), and the pair exists so the choice between them
 * can be made by looking at both on real data. Expect this module to be deleted
 * once the choice is made — nothing else should grow a dependency on it.
 */
export const VISIT_VIEW_VARIANT = {
  V1: 'v1',
  V2: 'v2',
};

/**
 * **V2 leads.** Asked for directly once both were on screen.
 *
 * This inverts the usual default-to-the-incumbent rule, deliberately: the point of
 * the pair is to pick one, and the candidate under consideration is the one worth
 * living with day to day while that judgement is being formed. V1 stays one click
 * away rather than being the thing you have to opt out of.
 *
 * A stored value that no longer parses also lands here, so a stale key shows the
 * intended default rather than the retired card.
 */
export const DEFAULT_VISIT_VIEW_VARIANT = VISIT_VIEW_VARIANT.V2;

/** Where the choice is remembered between sessions. */
export const VISIT_VIEW_VARIANT_STORAGE_KEY = 'schedules.visitsView.cardVariant';

/**
 * Read/write pair modelled on `schedules.mainView.grouping` in
 * `calendar/index.jsx`: validate against the enum on the way in so a stale or
 * hand-edited value degrades to the default instead of being handed straight to a
 * component that has no branch for it, and swallow storage errors on both sides —
 * private mode and policy-disabled storage both throw here, and remembering a
 * comparison toggle is not worth failing a render over.
 */
export const readVisitViewVariant = () => {
  try {
    const stored = window.localStorage.getItem(VISIT_VIEW_VARIANT_STORAGE_KEY);
    return Object.values(VISIT_VIEW_VARIANT).includes(stored) ? stored : DEFAULT_VISIT_VIEW_VARIANT;
  } catch {
    return DEFAULT_VISIT_VIEW_VARIANT;
  }
};

export const writeVisitViewVariant = (variant) => {
  // Refuse to persist anything the reader would reject, so the two halves cannot
  // disagree about what a valid value is.
  if (!Object.values(VISIT_VIEW_VARIANT).includes(variant)) return;
  try {
    window.localStorage.setItem(VISIT_VIEW_VARIANT_STORAGE_KEY, variant);
  } catch {
    // See above: a lost preference is a lost convenience, not a broken switch.
  }
};
