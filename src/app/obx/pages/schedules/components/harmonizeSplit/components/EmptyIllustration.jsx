import PropTypes from 'prop-types';
import React, { useId } from 'react';

/**
 * The empty state's illustration — **a city grid with the route running up it.**
 *
 * A blocky street plan in the app's greys, fading out into the page, with one dim route
 * running straight up it under a bold arrow. Asked for across two passes: first *"a random
 * blocky map, imitating real map/streets, with a path going straight up with an arrow
 * leading the path — don't make it too detailed, go with the grayish direction"*, then
 * *"add a radial fog round the illustration so it doesn't look sharp on the edges; for the
 * arrow, design an arrow something like in the image, bold and with proper shape; and dim
 * the path"* — against a turn-by-turn navigation reference whose marker is a heavy rounded
 * triangle sitting on a receding road.
 *
 * ## The grid
 *
 * Inverted from the reference, which is a dark widget: there the ground is dark and the
 * blocks lighter, here the blocks are a near-white grey on the page's own white, so the
 * **streets are the gaps** — ground showing through — as they are on a real map tile. Twenty
 * blocks in six columns of six different widths; the variety is in their sizes, never their
 * tones, because a second block tone turns a plan into texture.
 *
 * **It is deliberately faint, over three passes of being told it was too dark.** It began as
 * `borderSubtle2` blocks on a `surfaceGreySubtle` plate; the plate was carrying most of the
 * weight, so it was deleted rather than tinted — tinting alone would have collapsed the
 * block-to-street step and turned the plan into texture. Then the blocks went from
 * `borderSubtle2` to `borderSubtle1`, and now to **`#f0f0f2`**, which is 15 levels off white.
 *
 * That last value is **not a palette token**, and the reason is arithmetic rather than
 * carelessness. The next token down is `surfaceGreySubtle` `#F5F5F6`, ten levels off white —
 * and ten levels does not survive this drawing's own fog, which multiplies the block against
 * the page everywhere but the middle third. At the rim it would be two or three levels, which
 * is not faint, it is absent. `#f0f0f2` is the lightest value that still has a grid in it once
 * the mask has had its way. If it needs to go lighter again, the fog has to come back first.
 *
 * Two cross-streets run the **full width**, because a real grid has continuous cross-streets
 * and a plan without them reads as unrelated stripes. Everything else is deliberately out of
 * step: column A splits mid-block in the top band, E in the middle one, D at the bottom, and
 * two narrow columns merge into one wide block at the lower left. Structure from the
 * cross-streets, irregularity from the divisions inside them.
 *
 * The 12px avenue the route runs up is the one measurement worth not breaking. An earlier
 * build placed the columns either side of it independently and left a 26px channel, so the
 * route did not run *up a street* — it floated in a gap wide enough to split the plate in
 * two. The blocks meet it exactly, at x 78 and x 90.
 *
 * ## The fog
 *
 * The grid used to sit on a rounded rectangle, which gave it four hard corners and a visible
 * edge — a map that *stops*. The whole map group is now masked by a radial gradient instead,
 * so it has no boundary at all: it fades, and the block field runs off into the fade rather
 * than ending in a margin. The rounded corners went with it — there is no shape left to
 * round.
 *
 * **`r: 72%`, opaque to 44%.** Widened from `60%`/`52%`: a fade that begins late and ends at
 * the rim only ever eats the four corners, which leaves the silhouette a rounded *square*.
 * Starting it earlier and carrying it further past the edges rounds the whole outline, so the
 * drawing reads as a soft disc of city rather than as a tile with its corners knocked off.
 *
 * The mask id comes from `useId` with colons stripped, so it is safe inside `url(#…)`. A
 * hardcoded id would collide the moment two of these render on one page, and the symptom of
 * that collision is one of them silently vanishing.
 *
 * **The route is not masked.** It is the figure, not the ground, and it is inset far enough
 * from the rim that it never reaches the part of the fade that would eat it.
 *
 * ## The route, and why the arrow outweighs it
 *
 * The arrow is a heavy rounded triangle — filled *and* stroked in the same colour with a
 * round join, which is what rounds its corners and gives it bulk without hand-authoring the
 * curves. It sits over the grid rather than inside the avenue, because at this size a marker
 * wide enough to read as an arrow is wider than any street; the reference does the same, and
 * a marker overlapping the plan is what says *on top of the map*.
 *
 * **It sits at the vertical centre**, not at the top — and the geometry is set from its
 * *stroked* bounds, not its path bounds. The 6px round-join stroke adds 3px all round, so a
 * path centred on y 66 renders 3px high; the path is at 57–75 and the ink lands on 54–78,
 * whose centre is the viewBox's own 66. Centred, it lands on the drawing's optical middle
 * and directly above the centred caption, and the composition finally has its
 * heaviest mark where the eye already goes. It also makes the geometry mean something the
 * top position could not: the dim line below is the route travelled, and the empty avenue
 * continuing above the arrow is the road still ahead.
 *
 * The line beneath it is **dimmed to 40%**, which is the point of the pairing: the arrow is
 * where the route is going and the line is only how it got there, so they must not carry
 * equal weight. Undimmed, the eye read the line first and the arrow second — the reverse of
 * the reference, where the marker is the brightest thing on screen and the road behind it
 * recedes.
 *
 * Every colour is a literal rather than a `theme.palette` read, because this is a drawing: the two values are
 * chosen against each other for a legible block-against-street step, and moving one
 * independently would flatten it rather than recolour it.
 *
 * No animation — a moving empty state reads as a load that never finishes.
 */
const EmptyIllustration = ({ className }) => {
  /* Colons are legal in an id but not in a `url(#…)` reference, so they come out. */
  const uid = `hsIllo${useId().replace(/:/g, '')}`;
  const fogId = `${uid}Fog`;
  const maskId = `${uid}Mask`;
  const glassId = `${uid}Glass`;

  return (
    <svg
      className={className}
      viewBox="0 0 168 132"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/**
         * The fog. `objectBoundingBox` units by default, so the gradient is elliptical in a
         * non-square box — which keeps the fade an even distance from all four sides rather
         * than reaching the short edges first.
         *
         * **`r: 64%` is the number that makes the silhouette round, and it is smaller than
         * it looks.** The corner of the box sits 0.707 bounding-box units from the centre and
         * the edge midpoints sit 0.5, so a radius above ~0.71 finishes its ramp *outside* the
         * box: the corners fade but the four edge midpoints never do, and what is left is a
         * rectangle with its corners knocked off. That is exactly what the previous 72%
         * produced. At 64% the corner lands past the end of the ramp (110%) and gone, while
         * the edge midpoints land at 78% and drop to about a third — so all four sides
         * dissolve, not just the corners, and the outline reads as a disc.
         *
         * Full opacity only to 34%, so the fade owns two thirds of the radius. A short ramp
         * reads as a vignette drawn *onto* the map; a long one reads as the map running out.
         */}
        <radialGradient id={fogId} cx="50%" cy="50%" r="64%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="34%" stopColor="#fff" stopOpacity="1" />
          <stop offset="48%" stopColor="#fff" stopOpacity="0.94" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="72%" stopColor="#fff" stopOpacity="0.58" />
          <stop offset="84%" stopColor="#fff" stopOpacity="0.32" />
          <stop offset="93%" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="168" height="132" fill={`url(#${fogId})`} />
        </mask>

        {/**
         * The marker's glass. Light grey at the apex falling to near-black-grey at the base:
         * a single flat fill reads as a paper cut-out at any size, and the top-to-bottom
         * ramp is the cheapest thing that reads as a solid with light passing into it.
         */}
        <linearGradient id={glassId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A9AA0" />
          <stop offset="100%" stopColor="#55555B" />
        </linearGradient>
      </defs>

      {/* Everything that is *map* fades. The route on top of it does not. */}
      <g mask={`url(#${maskId})`}>
        {/* **There is no plate.** It used to be a `surfaceGreySubtle` slab bleeding past the
            viewBox, with the blocks a step darker on top of it. That slab was most of the
            drawing's weight, so removing it is what actually lightens the map — tinting the
            blocks alone would have flattened the grid instead of quietening it. The streets
            are now the page's own white, which is what a light map tile looks like anyway. */}
        <g fill="#f3f3f5">
          {/* Band 1 — column A takes a mid-block street its neighbours do not have. */}
          <rect x="6" y="6" width="24" height="16" rx="1" />
          <rect x="6" y="26" width="24" height="18" rx="1" />
          <rect x="36" y="6" width="16" height="38" rx="1" />
          <rect x="57" y="6" width="21" height="38" rx="1" />
          <rect x="90" y="6" width="18" height="38" rx="1" />
          <rect x="113" y="6" width="18" height="38" rx="1" />
          <rect x="136" y="6" width="26" height="38" rx="1" />

          {/* Band 2, the deepest — this time column E divides, on the far side of the
              avenue, so the two mid-block breaks never sit on one line. */}
          <rect x="6" y="50" width="24" height="34" rx="1" />
          <rect x="36" y="50" width="16" height="34" rx="1" />
          <rect x="57" y="50" width="21" height="34" rx="1" />
          <rect x="90" y="50" width="18" height="34" rx="1" />
          <rect x="113" y="50" width="18" height="14" rx="1" />
          <rect x="113" y="68" width="18" height="16" rx="1" />
          <rect x="136" y="50" width="26" height="34" rx="1" />

          {/* Band 3 — B and C merge into one wide block, and D divides. The merge is what
              stops the six columns reading as six continuous stripes down the whole plate. */}
          <rect x="6" y="90" width="24" height="36" rx="1" />
          <rect x="36" y="90" width="42" height="36" rx="1" />
          <rect x="90" y="90" width="18" height="16" rx="1" />
          <rect x="90" y="110" width="18" height="16" rx="1" />
          <rect x="113" y="90" width="18" height="36" rx="1" />
          <rect x="136" y="90" width="26" height="36" rx="1" />
        </g>

        {/* The diagonal avenue, in the plate's own colour so it cuts the grid rather than
            sitting on it. Kept short and to the lower left: run further it scooped out a
            wedge of empty plate big enough to unbalance the corner, and run across the
            middle it would have put a gap in the one line the drawing is about. */}
        <path d="M4 126 L62 68" stroke="#ffffff" strokeWidth="8" />
      </g>

      {/**
       * The route travelled so far, dimmed — it runs up to the arrow and stops there.
       *
       * `textPlaceholder` at 42% rather than the brand: the drawing is greyscale now, and a
       * translucent grey line over a near-white map is itself the glass idea at line weight.
       *
       * **No origin dot.** There was a filled 4px circle at the tail, marking where the route
       * started. Removed on instruction, and it reads better without: the dot was a second
       * terminal mark on a drawing whose whole point is that the *arrow* is the terminal mark,
       * and at this size two competing ends flattened the direction the line exists to carry.
       * The line now simply begins, which is what a road does.
       *
       * **The tail extends to y 118**, six units further than it reached with the dot in
       * place. With a round cap on a 4px stroke the ink ends at 120 — exactly where the dot's
       * lower edge used to be — so the route still meets the same point on the plan. Dropping
       * the dot without lengthening the line would have left it floating short.
       *
       * **4px, up from 3.** With no dot anchoring the lower end the line has to hold that end
       * on its own, and at 3px against a 19px arrow it read as a thread hanging off a heavy
       * head rather than as the road the head is travelling. A group is no longer needed for
       * one element, so the dimming moved onto the path itself.
       */}
      <path d="M84 118V79" stroke="#6A6A70" strokeWidth="4" strokeLinecap="round" opacity="0.42" />

      {/**
       * The arrow — **grey glass, not brand green.**
       *
       * Three things carry the glass, and none of them is a filter: the vertical gradient,
       * a whole-mark opacity of 0.9 so the map reads faintly through it, and one white sheen
       * stroke inside the upper-left edge. A blur filter would have been the obvious fourth
       * and is deliberately absent — at 20px of ink it turns a crisp silhouette to mush, and
       * it is the one thing here that would cost a raster pass on every paint.
       *
       * Fill *and* a same-colour round-joined stroke, as before: the stroke is what gives the
       * triangle its bulk and rounded corners in one declaration. The gradient is applied to
       * both so the two halves of the shape cannot part company.
       */}
      <g opacity="0.9">
        <path
          d="M84 57 L94 75 L74 75 Z"
          fill={`url(#${glassId})`}
          stroke={`url(#${glassId})`}
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* The sheen. Inside the upper-left edge, short and off-centre — a highlight that
            traced the whole edge would read as an outline, and one down the middle would
            read as a crease. */}
        <path
          d="M82.5 61.5 L78 70"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.5"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

EmptyIllustration.propTypes = { className: PropTypes.string };
EmptyIllustration.defaultProps = { className: undefined };

export default EmptyIllustration;
