import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { STOP_TONES } from '../harmonize.styles';
import { STOP_PIN_PATH } from './MapPins';

/**
 * The numbered teardrop, as an element in the DOM rather than as a mark on a projection.
 *
 * **Lifted out of `StopList` because a second surface draws it now.** A collapsed route
 * card shows its own pins as a strip, so every route's shape is legible at once instead of
 * only the open one's — and the alternative was twenty lines of SVG copied into
 * `RouteCard`, which is the exact fault the `STOP_PIN_PATH` import below already exists to
 * prevent, committed one level up. The strip, the list and the map are **one mark seen
 * three times**, and the number inside it is how a planner cross-references them; a shape
 * that can drift in three places will, and the cross-reference is what breaks first.
 *
 * **`StopPinIcon`, not `StopPin`, and the name difference carries the distinction.**
 * `MapPins` already exports a `StopPin`: a bare `<g>` in projected coordinates, anchored on
 * its tip, scaled by state and animated as the route line reaches it. This one is a
 * self-contained `<svg>` box, sized by CSS, laid out in normal flow, with no anchor offset
 * because nothing is being pointed at. Two exports called `StopPin` in one folder is a
 * coin-flip at every import site, which costs more than the four extra characters.
 */

/**
 * The teardrop, from `MapPins` — the same path the map draws.
 *
 * It used to be a second copy of the string, with a note explaining that hand-approximating
 * it had been close and not right. That note is still true and it is now an argument for
 * importing rather than restating: **a stop's pin in this list and the same stop's pin on
 * the map are one mark seen twice**, and the number in the list is how a planner
 * cross-references the two. Two copies of the outline is a shape that can drift, and the
 * moment it drifts the cross-reference is what breaks.
 */
/**
 * The stop's marker: the supplied teardrop, re-coloured and numbered.
 *
 * **The rim is drawn inside the shape, not centred on its edge.** The spec says
 * `border: 1px solid` with `box-sizing: border-box`, and the asset achieves that
 * with a mask — a 2px stroke clipped to the fill, so only the inner half survives.
 * Reproduced here rather than simplified to a centred 1px stroke, because a centred
 * stroke grows the silhouette by half a pixel on every side and the pin has to agree
 * with the map's own marker at the same size.
 *
 * The digit is `<text>`, where the asset has it as an outlined glyph. An outline can
 * only ever be a `1`; a route has stops 2 through 12. Same family, weight and size
 * as the spec, and the 1.5px lift is the spec's own optical centring — a numeral's
 * visual centre sits above the teardrop's geometric one because the shape tapers.
 *
 * Colour carries state and nothing else: green for work already done, blue for work
 * this route will do, grey for a stop whose day cannot be promised.
 *
 * `maskId` is per-instance. A single hard-coded id would collide across the twelve
 * pins in a list, and every one of them would resolve to whichever mask the document
 * happened to define last. **Now that two surfaces render pins, uniqueness has to hold
 * across both** — three collapsed cards are on screen together, so a caller keying the id
 * on the stop alone is no longer safe on its own and each one prefixes it with something
 * that identifies the surface as well as the stop.
 *
 * Sizing is the caller's `className` and always has been, which is what lets a 20px list
 * pin and a 16px strip pin be one component: the geometry is a `viewBox`, so the only thing
 * that changes between them is the box CSS puts it in.
 */
export const StopPinIcon = ({ number, tone, className, maskId }) => (
  <Box
    component="svg"
    viewBox="0 0 20 20"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <mask id={maskId} fill="white">
      <path d={STOP_PIN_PATH} />
    </mask>
    <path d={STOP_PIN_PATH} fill={tone.fill} />
    <path
      d={STOP_PIN_PATH}
      fill="none"
      stroke={tone.rim}
      strokeWidth="2"
      mask={`url(#${maskId})`}
    />
    <text
      x="10"
      y="8.2"
      textAnchor="middle"
      dominantBaseline="central"
      fill="#FFFFFF"
      fontSize="9"
      fontWeight="600"
    >
      {number}
    </text>
  </Box>
);

StopPinIcon.propTypes = {
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tone: PropTypes.object.isRequired,
  className: PropTypes.string,
  maskId: PropTypes.string.isRequired,
};

/**
 * Green for done, blue for planned, grey for a stop with an unverifiable access
 * window — it is on the route but the day cannot be promised, which is the same
 * "on the list, not in this day" the grey tone means elsewhere.
 *
 * **Here rather than inside either caller, because two surfaces now colour the same stop.**
 * The shut card's pin strip and the open card's stop list draw the same pins from the same
 * `plan.stops`, and a stop that is blue in one and grey in the other is not a discrepancy a
 * planner can resolve by looking — they would have to pick a surface to trust. One rule,
 * living next to the shape it colours.
 *
 * **`isNew` is deliberately absent from this rule**, though it is tempting: it is the one
 * flag the two kinds of stop in a merged route differ by. It drives a *badge* in the stop
 * list, not a tone, and for good reason in both directions — a stop that was already on
 * somebody's runsheet is as much *in* this day as ours is, so grey would say the opposite
 * of what grey means everywhere else here, and a fourth colour would introduce a
 * distinction on a collapsed card that has no room to explain it. The badge is legible
 * where it can be captioned.
 */
/**
 * A stop's colour.
 *
 * **`windowRisk` no longer greys a stop out.** It used to resolve to `idle`, so a visit whose
 * access window this run has not checked rendered in the same grey as the start and end anchors —
 * one pin in the middle of a numbered blue sequence, drawn as though it were not part of it. On a
 * screen that only plans the happy path that is a warning about an edge case nobody is being asked
 * to act on, dressed as a change of kind. The stop is in the route, so it is coloured like one.
 *
 * The condition itself is not gone from the model: `accessWindow` is still a real caveat and the
 * risk is still on the stop. It simply no longer changes how the row is drawn.
 */
export const stopTone = (stop) => (stop.completed ? STOP_TONES.done : STOP_TONES.planned);
