/**
 * The zone palette — four hues, keyed by zone id, shared by every surface that draws a zone.
 *
 * ## Why this file exists above both features
 *
 * These four values were **validated, not chosen.** They cleared an all-pairs separation gate —
 * every zone is on screen at once on the Harmonize map, so each hue has to be distinguishable
 * from all three others, not merely from the basemap.
 *
 * ## ⚠ The validator is missing, so "re-run it" is not an instruction anyone can follow
 *
 * This header used to say the check lives in `harmonizeSplit/validate_palette.js` and to re-run
 * it before changing a value. **That file does not exist** — searched the repo, the design
 * folder and the home directory; the only files mentioning it are the ones citing it. It was a
 * scratch script in an earlier session and was never committed. The figures recorded below are
 * real measurements; the tooling that produced them is gone.
 *
 * So changing a hue means **re-deriving** the check rather than re-running it. What it has to
 * establish, recorded here so it can be rebuilt rather than guessed:
 *
 * 1. **All-pairs separation.** Every hue against every *other* hue, not just adjacent ones —
 *    all four are on screen simultaneously and any two can end up neighbours on the ground. The
 *    figures that passed: worst colour-vision-deficient separation **ΔE 9.2** (aqua↔orange,
 *    deutan) against a target of 8; worst normal-vision **ΔE 16.3** (violet↔blue) against a
 *    floor of 15.
 * 2. **Contrast against the basemap's land tone**, per WCAG 1.4.11's 3:1 for a non-text
 *    component. This is the gate that **fails today** — see the debt section below.
 *
 * A hue set that clears gate 2 unaided is the one change that discharges the debt on all three
 * surfaces at once.
 *
 * That validation is the whole reason this is one table rather than a copy per feature. A
 * forked palette is not a cosmetic inconsistency; it is an accessibility regression that
 * arrives silently, because whichever copy is edited still looks fine on its own screen.
 *
 * It was born in `harmonizeSplit/zoneGeography.js` and moved here the moment a second feature
 * needed it. The move was not tidiness. **`harmonizeSplit/` is one of three comparison shells,
 * and `schedules/index.jsx` states the plan to delete the config module "and the losing shell
 * together — once that decision lands."** So the table's original home is a file that is
 * scheduled for possible deletion, and Settings' zone editor — a shipped screen — had been
 * about to take a hard dependency on it. Neither side could see that from its own end: the
 * Split engineer knew the shell was a candidate, and Settings knew it needed one table. Above
 * both features, the palette outlives whichever shell wins.
 *
 * ## The contract
 *
 * **Keyed by zone id, never by index.** Colour follows the entity, so a range that happens to
 * work only two zones leaves the other two the colours they always had, and North is the same
 * blue in the Harmonize map and in the Settings zone editor. Indexing into a filtered list is
 * exactly how a planner comes to believe a zone changed colour when only the filter did.
 *
 * Consumers should call `zoneColor(zoneId)` rather than reading `ZONE_COLORS` directly, so the
 * fallback cannot be forgotten at one call site.
 *
 * ## The outstanding debt on these values, so nobody reads this as settled
 *
 * Measured against the raster basemap's land tone, **orange is 2.92:1 and aqua 2.57:1 — both
 * under the 3:1 that WCAG 1.4.11 wants of a non-text component.** (Recorded figures; see the
 * missing-validator note above before trusting them as reproducible.) The palette's relief rule
 * was discharged by a zone name drawn permanently on every territory, which made the caption
 * load-bearing rather than decorative.
 *
 * That discharge now holds on only some surfaces: the Harmonize Split map moved its captions
 * to hover-only, which is not relief for a touch user, a keyboard user, or anyone who is not
 * hovering. The Settings zone editor keeps its always-on labels — a planner drawing a boundary
 * has a busy pointer and needs to know which shape is which without hunting — so it discharges
 * its own.
 *
 * The consequence worth knowing before anyone "fixes" one screen: these hues are load-bearing
 * on **three** surfaces now (the Split map, the zone editor's active shape, and the editor's
 * locked context shapes), so every per-surface remedy — a permanent label, a pattern fill — is
 * built three times, while **a palette that clears 3:1 unaided is built once and discharges all
 * three.** No renderer reads a specific value; they all read this table. A palette swap is
 * therefore cheap whenever it is wanted, which is the reason it is honest to defer rather than
 * rush.
 */

export const ZONE_COLORS = {
  north: '#2a78d6',
  east: '#eb6834',
  south: '#1baf7a',
  west: '#4a3aa7',
};

/**
 * The colour for a zone that is not one of the four.
 *
 * Grey rather than a fifth hue. A zone the palette has no slot for is a zone this module has
 * not been told about, and inventing a colour for it would make an unhandled case look
 * handled. It stays legible and it stays obviously unassigned.
 */
export const ZONE_COLOR_FALLBACK = '#6A6A70';

export const zoneColor = (zoneId) => ZONE_COLORS[zoneId] || ZONE_COLOR_FALLBACK;
