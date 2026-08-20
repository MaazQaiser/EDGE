import PropTypes from 'prop-types';
import React from 'react';

import { STOP_TONES } from '../harmonize.styles';

/**
 * The marks on the map, from the supplied artwork.
 *
 * **Why paths rather than the `.svg` files themselves.** `assets/svg/harmonize/stopPin.svg`
 * has the numeral `1` drawn into it as outlines, so importing it would give every stop on
 * the route the number one. The geometry is what is reusable, so that is what is lifted:
 * the teardrop's outline, at the size and proportions it was drawn at, with the number set
 * as live text inside it. `startPin.svg` is the same story with a badge instead of a
 * teardrop.
 *
 * **Both are anchored where they point.** A teardrop's tip is the coordinate and its body
 * hangs above it; a badge is centred on the coordinate. Every mark below is drawn in local
 * coordinates about its own anchor, so the caller places it with one `translate` to the
 * projected point and nothing has to know which shape it is placing. Getting this wrong is
 * how a pin ends up a pin's height north of the site it names — at a 10km zoom that is a
 * street or two.
 *
 * Shared by both renderers, so the keyless tile map and the Google map cannot end up
 * drawing the same place two ways.
 */

/**
 * The teardrop, lifted from `stopPin.svg`, in its own 20×20 box with the tip at (10, 20).
 *
 * Kept as the artwork's own coordinates rather than re-centred on the anchor: this string
 * is meant to be diffable against the file it came from, and the 10/20 offset is applied
 * once by the group that wraps it.
 */
export const STOP_PIN_PATH =
  'M9.99893 0C11.6374 0 13.2391 0.48621 14.6015 1.39648C15.9638 2.30677 17.0262 3.60051 ' +
  '17.6532 5.11426C18.2801 6.62791 18.4435 8.29352 18.1239 9.90039C17.8043 11.5074 ' +
  '17.0159 12.984 15.8573 14.1426L9.99893 20L4.1415 14.1426C2.98294 12.984 2.19357 ' +
  '11.5074 1.87393 9.90039C1.55432 8.2935 1.71867 6.62793 2.34561 5.11426C2.97256 ' +
  '3.60066 4.03424 2.30675 5.39639 1.39648C6.75864 0.486259 8.36056 6.18235e-05 9.99893 0Z';

/** The mini pin inside the start badge, from `startPin.svg`, in its own 24×24 box. */
const START_GLYPH_PATH =
  'M12.0004 6.20587C12.9495 6.20596 13.8773 6.48727 14.6665 7.01447C15.4558 7.54189 ' +
  '16.0717 8.2917 16.435 9.16876C16.7983 10.0458 16.8927 11.0111 16.7075 11.9422C16.5223 ' +
  '12.8733 16.0653 13.7289 15.394 14.4002L12.0004 17.7938L8.60592 14.4002C7.93463 13.7289 ' +
  '7.47764 12.8733 7.29244 11.9422C7.10724 11.0111 7.2016 10.0458 7.5649 9.16876C7.9282 ' +
  '8.29169 8.5441 7.54189 9.33345 7.01447C10.1227 6.48716 11.0512 6.20587 12.0004 ' +
  '6.20587ZM12.0004 9.93927C11.7175 9.93927 11.4456 10.0517 11.2456 10.2518C11.0457 ' +
  '10.4518 10.9331 10.7229 10.9331 11.0057C10.9331 11.2886 11.0455 11.5605 11.2456 ' +
  '11.7606C11.4456 11.9605 11.7176 12.0721 12.0004 12.0721C12.2831 12.072 12.5544 ' +
  '11.9604 12.7544 11.7606C12.9544 11.5605 13.0669 11.2886 13.0669 11.0057C13.0668 ' +
  '10.7229 12.9543 10.4518 12.7544 10.2518C12.5544 10.0518 12.2832 9.93939 12.0004 9.93927Z';

/**
 * The pin's colours, from the tone system rather than restated here.
 *
 * `STOP_TONES` already owns "what a stop's colour means" for the whole feature — green for
 * work already done, blue for work this route will do, grey for a stop that is on the list
 * but not in this day — and `planned` is precisely the blue the supplied artwork is drawn
 * in. Writing the hexes again here would have been two copies of one decision: the pin in
 * the stop list and the pin on the map are the same mark, and they must not be able to
 * disagree.
 *
 * Note this is deliberately *not* `surfaceBrand`. The artwork's lighter blue with a
 * saturated rim is what makes a 20px teardrop legible against grey street detail — the rim
 * does the work a white halo does elsewhere — and the brand green dissolves into the tiles
 * at the zoom this map actually uses.
 *
 * **Exported, because the legend has to say the same thing the map does.** A legend swatch
 * drawn from the palette beside a pin drawn from the artwork is a key that does not match
 * its own map, which is worse than no key: it silently teaches the wrong colour.
 */
export const PIN_FILL = STOP_TONES.planned.fill;
export const PIN_RIM = STOP_TONES.planned.rim;
/* The start badge's disc, from `startPin.svg`. No tone entry, because the origin is not a
   stop and has no state: pale enough that the glyph inside it carries the colour and the
   start never competes with a numbered stop. */
export const START_BADGE = '#A9DEFF';

/** The artwork's own dimensions, so a scale factor means the same thing in both maps. */
export const STOP_PIN_SIZE = 20;
export const START_PIN_SIZE = 24;

/**
 * A stop, drawn about its tip.
 *
 * `scale` is the third channel after colour and the number: a sequenced stop is full size,
 * a candidate the run has not claimed yet is smaller, and one that has been ruled out is
 * smaller still — so the state survives a greyscale screenshot and a projector.
 */
export const StopPin = ({
  fill,
  stroke,
  scale = 1,
  number,
  numberColor,
  className,
  stateClassName,
  pinRef,
}) => (
  /**
   * **Two nested groups, and the reason is animation.**
   *
   * `scale` is *state* — this stop is sequenced, or a candidate, or ruled out — and it is a
   * CSS transform that persists. The swell a pin performs when the route line reaches it is
   * *motion*, and it is a Web Animations `animate()` call on `pinRef`. Put both on one
   * element and they fight: an animation with `fill: 'both'` ending at `scale(1)` overwrites
   * the inline `scale(1.3)` and every claimed pin quietly shrinks as it is claimed. On two
   * elements they compose, which is what a transform hierarchy is for.
   */
  <g ref={pinRef} className={className}>
    <g className={stateClassName} style={{ transform: `scale(${scale})` }}>
      {/* Local coordinates, about the anchor. The `-10, -20` is what puts the tip on the
          point the caller translated to; the artwork itself is left as it was drawn. */}
      <g transform={`translate(${-STOP_PIN_SIZE / 2} ${-STOP_PIN_SIZE})`}>
        <path
          d={STOP_PIN_PATH}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          /* The rim is inside the shape in the artwork, so the join has to be mitred or the
           teardrop's point rounds off into a blob. */
          strokeLinejoin="miter"
        />
        {/* Always rendered, so the number can *fade in* when the sequence claims this stop.
          Mounting it with the order would give it nothing to transition from, and the pin
          would blink. */}
        <text
          x={STOP_PIN_SIZE / 2}
          y={12.4}
          textAnchor="middle"
          fontSize={9}
          fontWeight={600}
          fill={numberColor}
          opacity={number != null ? 1 : 0}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {number ?? ''}
        </text>
      </g>
    </g>
  </g>
);

StopPin.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
  scale: PropTypes.number,
  /** The stop's place in the sequence, or nothing while it is still a candidate. */
  number: PropTypes.number,
  numberColor: PropTypes.string,
  /** The animated wrapper — the swell as the route line reaches this stop. */
  className: PropTypes.string,
  /** The wrapper carrying the state scale, transitioned rather than snapped. */
  stateClassName: PropTypes.string,
  pinRef: PropTypes.func,
};

/**
 * Where the day starts and ends, drawn about its centre.
 *
 * A badge rather than a teardrop, and that distinction is the point: the origin is not a
 * stop on the route, it is the place the route is measured from — the radius is centred
 * here and the drive home is charged against the eight hours from here. One shape for
 * "work" and another for "home" is why the map needs no legend entry to be read.
 */
export const StartPin = ({ badge, glyph }) => (
  <g transform={`translate(${-START_PIN_SIZE / 2} ${-START_PIN_SIZE / 2})`}>
    <circle cx={12} cy={12} r={12} fill={badge} />
    <path d={START_GLYPH_PATH} fill={glyph} />
  </g>
);

StartPin.propTypes = {
  /** The disc behind the glyph. */
  badge: PropTypes.string,
  glyph: PropTypes.string,
};
