/**
 * Which shell the Harmonize button opens.
 *
 * This is a **comparison switch, not a product setting** — the same reasoning, and the
 * same shape, as `schedulerLayout.js` beside it. Two shells for the same feature exist
 * at once so the choice between them can be made by using both on real data:
 *
 *   **Workspace** — the shipped full-screen three-column surface
 *   (`components/harmonize/`): one route day, a radius from where the van starts,
 *   crews per day, a live map.
 *
 *   **Drawer** — the 470px side drawer built to `HARMONIZE-CONTEXT.md`
 *   (`components/harmonizeFlow/`): a range of worked days, one zone each, no radius,
 *   no installers, over a schedule grid that stays readable.
 *
 *   **Split** — full screen in two columns (`components/harmonizeSplit/`): the
 *   drawer's flow down the left, a map of every zone down the right.
 *
 * **They are not three drawings of one feature.** The shells differ, and so do the
 * domain models underneath them — zone versus radius, a range of days versus one day,
 * installer-blind versus crewed. That is why this is worth comparing rather than
 * simply skinning, and it is also why none can be expressed as a prop on another.
 *
 * **Split is the drawer's model, not a third one.** It mounts `useHarmonizeFlow` and
 * the drawer's own ②/③ components unchanged, so what it varies is the *shell* and one
 * added component — the map. That makes the Drawer↔Split comparison a clean question
 * about whether seeing the geography is worth half the screen, uncontaminated by a
 * change of engine. Workspace↔either remains the question about the model.
 *
 * Expect this module to be deleted once the choice is made; nothing else should grow a
 * dependency on it.
 */
export const HARMONIZE_SHELL = {
  WORKSPACE: 'workspace',
  DRAWER: 'drawer',
  SPLIT: 'split',
};

/**
 * Named for what they are rather than "Var 1 / Var 2".
 *
 * `VisitVariantSwitch` argues for V1/V2 when a control names two *drawings of the same
 * card* and the conversation about them already uses those words. This is the case
 * `CompaniesViewSwitch` made the opposite call for: the options are structurally
 * different surfaces, and "Workspace", "Drawer" and "Split" tell a reviewer which is
 * which before they have opened any of them. The tooltips carry the rest.
 *
 * **"Split" names the geometry, like the two beside it, rather than the map.** "Zones"
 * and "Map" were the alternatives and both name the *contents*, which reads as a
 * different kind of answer from its neighbours — and "Map" is wrong twice over, since
 * the Workspace has one too. What is actually new here is that the screen is cut in two.
 */
export const HARMONIZE_SHELL_LABELS = {
  [HARMONIZE_SHELL.WORKSPACE]: 'Workspace',
  [HARMONIZE_SHELL.DRAWER]: 'Drawer',
  [HARMONIZE_SHELL.SPLIT]: 'Split',
};

export const HARMONIZE_SHELL_HINTS = {
  [HARMONIZE_SHELL.WORKSPACE]: 'Shipped: full-screen, one route day, radius from the start point',
  [HARMONIZE_SHELL.DRAWER]: 'New: 470px drawer, a range of worked days, one zone each',
  [HARMONIZE_SHELL.SPLIT]: "New: two columns — the drawer's flow beside a map of every zone",
};

/**
 * **The incumbent leads** — the same rule `schedulerLayout.js` states and for the same
 * reason. The workspace is what Harmonize opens today, so it is what the button keeps
 * doing and the drawer is the thing a reviewer opts *into*. A stale or hand-edited
 * stored value lands here too, which is what keeps a bad key from swapping a shipped
 * feature out from under a tenant.
 */
export const DEFAULT_HARMONIZE_SHELL = HARMONIZE_SHELL.WORKSPACE;

export const HARMONIZE_SHELL_STORAGE_KEY = 'schedules.harmonizeShell';

/* Validate on the way in and refuse to persist anything the reader would reject, so
   the two halves cannot disagree about what a valid value is. Storage throws in private
   mode and under a policy that disables it; remembering a review toggle is not worth
   failing a render over. */
export const readHarmonizeShell = () => {
  try {
    const stored = window.localStorage.getItem(HARMONIZE_SHELL_STORAGE_KEY);
    return Object.values(HARMONIZE_SHELL).includes(stored) ? stored : DEFAULT_HARMONIZE_SHELL;
  } catch {
    return DEFAULT_HARMONIZE_SHELL;
  }
};

export const writeHarmonizeShell = (shell) => {
  if (!Object.values(HARMONIZE_SHELL).includes(shell)) return;
  try {
    window.localStorage.setItem(HARMONIZE_SHELL_STORAGE_KEY, shell);
  } catch {
    // See above: a lost preference is a lost convenience, not a broken switch.
  }
};
