import { reorderToSlot } from './stopOrder';

/**
 * The drag's arithmetic, case by case.
 *
 * These are here because the bug they pin was invisible on screen: every position the old
 * `moveTo(from, index)` produced was a *plausible* position, so a drop landing one place
 * high read as an imprecise gesture rather than as wrong code. A table settles it.
 */
describe('reorderToSlot', () => {
  const order = ['a', 'b', 'c', 'd'];

  it('moves a row up, into the slot above its target', () => {
    expect(reorderToSlot(order, 'c', 1)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('moves a row down, into the slot below its target', () => {
    /* Slot 3 is the gap between `c` and `d` in pre-move coordinates. Lifting `a` out shifts
       it to index 2, which is the compensation the caller must not have to think about. */
    expect(reorderToSlot(order, 'a', 3)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('reaches the last position, which an index-based move could not name', () => {
    expect(reorderToSlot(order, 'a', 4)).toEqual(['b', 'c', 'd', 'a']);
  });

  it('reaches the first position', () => {
    expect(reorderToSlot(order, 'd', 0)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('names every gap exactly once, so no two slots are the same move', () => {
    /* `n` rows have `n + 1` gaps and every one of them has to be reachable and distinct —
       that is the whole reason slots replaced indices. Moving one row through all five slots
       of a four-row route must produce four different sequences plus one no-op. */
    const results = [0, 1, 2, 3, 4].map((slot) => reorderToSlot(order, 'b', slot).join(','));
    expect(new Set(results).size).toBe(4);
    expect(results).toEqual(['b,a,c,d', 'a,b,c,d', 'a,b,c,d', 'a,c,b,d', 'a,c,d,b']);
  });

  describe('a move that changes nothing returns the original array', () => {
    /* Identity is the contract, not just equality: the caller skips the re-solve on it, so a
       drag that ends where it began must not flip the route into hand-ordered mode. */
    it('for the slot above itself', () => {
      expect(reorderToSlot(order, 'b', 1)).toBe(order);
    });

    it('for the slot below itself', () => {
      expect(reorderToSlot(order, 'b', 2)).toBe(order);
    });

    it('for an unknown site', () => {
      expect(reorderToSlot(order, 'zzz', 0)).toBe(order);
    });
  });

  it('clamps a slot past either end rather than dropping the row', () => {
    /* The slot arrives from a pointer position and from a keyboard handler, neither of which
       is obliged to have checked the ends. Losing a stop off the end of a route because a
       drag finished two pixels below the last row is not a survivable failure. */
    expect(reorderToSlot(order, 'b', 99)).toEqual(['a', 'c', 'd', 'b']);
    expect(reorderToSlot(order, 'c', -5)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('keeps every stop, whatever the slot', () => {
    for (let slot = -2; slot <= order.length + 2; slot += 1) {
      order.forEach((id) => {
        expect([...reorderToSlot(order, id, slot)].sort()).toEqual([...order].sort());
      });
    }
  });

  it('handles a single-stop route as a no-op at either end', () => {
    const single = ['a'];
    expect(reorderToSlot(single, 'a', 0)).toBe(single);
    expect(reorderToSlot(single, 'a', 1)).toBe(single);
  });

  it('handles an empty route', () => {
    expect(reorderToSlot([], 'a', 0)).toEqual([]);
  });
});
