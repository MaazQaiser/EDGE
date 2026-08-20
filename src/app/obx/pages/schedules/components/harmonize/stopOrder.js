/**
 * Re-ordering a route by hand: the arithmetic, on its own.
 *
 * **Extracted because it was wrong, in a way that read as the list refusing the drop.**
 * The version this replaces took a destination *index* — `moveTo(fromSiteId, toIndex)` —
 * and a list of `n` rows has `n + 1` places a row can go, so an index could only ever name
 * `n` of them. Two consequences, both met on a planner's first drag: the last position in a
 * route was unreachable with the mouse (nothing sits below the final row to be *above* of),
 * and a release in the lower half of any row landed one place higher than they aimed.
 *
 * So the unit is a **slot** — the gap between two rows, counted in the order *before* the
 * move, from `0` (before the first row) to `order.length` (after the last). Every gesture
 * can name its destination: drop above row `i` is slot `i`, drop below it is slot `i + 1`,
 * and "to the end" is a number that exists.
 *
 * Pure, and here rather than inside `StopList`, for one reason: the compensation for having
 * lifted the row out from earlier in the list is the step that goes wrong, it goes wrong
 * silently — every position in the result is a plausible position — and it is the kind of
 * thing that is proved by a table of cases rather than by looking at a screen.
 */

/**
 * `order` with `fromId` moved to `slot`, or the original array when nothing moves.
 *
 * Returns the **same array reference** for a no-op so a caller can skip the re-solve: a
 * drag that ends where it began is the commonest drag there is, and putting a route into
 * hand-ordered mode because someone picked a row up and put it back down is a state change
 * nobody asked for.
 *
 * @param {string[]} order  Site ids, in their current sequence.
 * @param {string}   fromId The site being moved.
 * @param {number}   slot   Destination gap, in pre-move coordinates. Clamped.
 */
export const reorderToSlot = (order = [], fromId, slot) => {
  const from = order.indexOf(fromId);
  if (from === -1) return order;

  const next = [...order];
  const [moved] = next.splice(from, 1);

  /* Removing the row shifts every slot after it down by one, so a slot named in pre-move
     coordinates has to be adjusted before it is used as a post-removal index. Clamped after
     the adjustment rather than before it: `slot` arrives from a pointer position and a
     keyboard handler, and neither is obliged to have checked the ends. */
  const landing = Math.max(0, Math.min(next.length, slot > from ? slot - 1 : slot));
  if (landing === from) return order;

  next.splice(landing, 0, moved);
  return next;
};
