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
 * **They are not two drawings of one feature.** The shells differ, and so do the
 * domain models underneath them — zone versus radius, a range of days versus one day,
 * installer-blind versus crewed. That is why this is worth comparing rather than
 * simply skinning, and it is also why neither can be expressed as a prop on the other.
 *
 * Expect this module to be deleted once the choice is made; nothing else should grow a
 * dependency on it.
 */
export const HARMONIZE_SHELL = {
  WORKSPACE: 'workspace',
  DRAWER: 'drawer',
};

/**
 * Named for what they are rather than "Var 1 / Var 2".
 *
 * `VisitVariantSwitch` argues for V1/V2 when a control names two *drawings of the same
 * card* and the conversation about them already uses those words. This is the case
 * `CompaniesViewSwitch` made the opposite call for: the two options are structurally
 * different surfaces, and "Workspace" and "Drawer" tell a reviewer which is which
 * before they have opened either. The tooltips carry the rest.
 */
export const HARMONIZE_SHELL_LABELS = {
  [HARMONIZE_SHELL.WORKSPACE]: 'Workspace',
  [HARMONIZE_SHELL.DRAWER]: 'Drawer',
};

export const HARMONIZE_SHELL_HINTS = {
  [HARMONIZE_SHELL.WORKSPACE]: 'Shipped: full-screen, one route day, radius from the start point',
  [HARMONIZE_SHELL.DRAWER]: 'New: 470px drawer, a range of worked days, one zone each',
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
