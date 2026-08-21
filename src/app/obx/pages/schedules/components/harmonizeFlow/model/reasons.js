/**
 * Why a visit is not on a runsheet — as a code, never as a boolean.
 *
 * §5 of the context document makes this a hard requirement of the backend contract
 * and it is worth restating why, because "unplaced: true" is the cheap version and it
 * is what a first implementation reaches for. State ③'s tray is the screen where the
 * flow either explains itself or looks broken, and every one of these codes produces
 * a *different sentence with a different remedy*:
 *
 *   `zone not worked`      → offer to work that zone on a spare day
 *   `no legal day`         → offer to widen the need-by window, or work the zone again
 *   `site in no zone`      → send them to the site record; no scheduling fix exists
 *   `site not geocodable`  → same, and the run is not at fault
 *   `set aside`            → the planner did this on purpose; offer to put it back
 *
 * Collapse those into one boolean and the tray can only say "2 visits didn't fit",
 * which is the sentence that makes an operator distrust the whole proposal.
 *
 * The codes carry no copy. Every string lives in `obx.json` under
 * `runsheet.harmonizeFlow.reason.*`, keyed by the code, so a reason gained on the
 * wire renders as a missing key rather than as a blank row.
 */
export const UNPLACED_REASON = {
  /** The site's zone is not worked on any day in this range. The commonest case (E6). */
  ZONE_NOT_WORKED: 'zoneNotWorked',
  /** The zone is worked, but not on a date this visit's need-by window reaches (H7). */
  NO_LEGAL_DAY: 'noLegalDay',
  /** The site belongs to no zone at all — a data fault, not a scheduling one. */
  SITE_NO_ZONE: 'siteNoZone',
  /** The site has no usable position, so it cannot be sequenced (H1 needs a geometry). */
  SITE_NOT_LOCATED: 'siteNotLocated',
  /** The planner removed it by hand — X4. Distinct from every failure above. */
  SET_ASIDE: 'setAside',
};

/**
 * Whether a reason describes something the planner can fix from inside this drawer.
 *
 * Drives whether the tray row offers a remedy link or just states the fact. A site
 * with no zone cannot be fixed by any control in this flow, and offering a button
 * that opens the site record mid-proposal is a worse answer than saying so plainly.
 */
export const isFixableInFlow = (reason) =>
  reason === UNPLACED_REASON.ZONE_NOT_WORKED ||
  reason === UNPLACED_REASON.NO_LEGAL_DAY ||
  reason === UNPLACED_REASON.SET_ASIDE;
