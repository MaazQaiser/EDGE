import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * The two marks the route cards region was drawing with characters.
 *
 * The fourteenth pass replaced a `⠿` braille glyph with a drawn drag handle and stated
 * the reason: *"it rendered at whatever size and weight the body font felt like and sat
 * a couple of pixels off the row's centre line"*. That argument was never applied to
 * the rest of the region, which still typed `⌄` for four different disclosure chevrons
 * and `⚠` for the spill ribbon.
 *
 * `⌄` (U+02C7's neighbourhood — a *modifier letter*, not a symbol) has no defined
 * weight relationship to the surrounding text and no consistent optical centre; it
 * needed a `line-height: 1` and still sat high. `⚠` is worse, because U+26A0 has an
 * emoji presentation and Chrome on macOS resolves it to the colour glyph often enough
 * to matter — an amber ribbon whose icon is a full-colour emoji triangle is not the
 * hairline-and-ink treatment the spill family is written in.
 *
 * Both are paths in `currentColor`, so hover and focus states still reach them and the
 * spill's `SPILL_INK` still colours the triangle.
 */
export const ChevronDown = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 12 12"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M1.8 4.2 6 8.4l4.2-4.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Box>
);

ChevronDown.propTypes = { className: PropTypes.string };

/**
 * The spill's mark. Rounded corners and a rounded bar so it reads as the same family as
 * the hairline it sits on rather than as a hazard placard.
 */
export const WarningTriangle = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 14 14"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M7 1.9 12.7 11.6H1.3L7 1.9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M7 5.6v2.7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="7" cy="10" r="0.75" fill="currentColor" />
  </Box>
);

WarningTriangle.propTypes = { className: PropTypes.string };

/**
 * The exclusions panel's mark: **a filled disc with the bar knocked out of it.**
 *
 * The panel wore `WarningTriangle` — the spill ribbon's outline mark — at 12px, and the
 * supplied design draws a solid orange disc instead. The difference is not decoration. The
 * ribbon says *this route overran its day*, on a white card, one line among several; the
 * panel says *this work has no route at all*, at the head of its own coloured ground, and it
 * is the loudest thing this column has to say. An outline triangle at 12px on a peach wash is
 * the quietest available way to say it: same stroke weight as the chevrons, same hairline
 * family as everything it is trying to stand out from.
 *
 * `currentColor` on the disc and the ground's own peach knocked out of it, rather than white:
 * a white bar and dot on an orange disc sitting on a `#FEF1E8` card is white against
 * near-white, which at 16px reads as a smudge. Punching the fill in the card's own colour
 * makes the mark *part of* the surface it sits on. That does tie the glyph to one ground —
 * hence the note, and hence `#FEF1E8` appearing here as well as in `notIncluded`.
 *
 * Not `ErrorOutline`/`Warning` from MUI: this region has twice had to fight
 * `.MuiSvgIcon-root { font-size: 1.5rem }` for control of an icon's box (§7.28, `columnIcon`),
 * and a 16px mark that has to agree with a 20px line of type is exactly the case that loses.
 */
export const WarningDisc = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path d="M8 4v5" fill="none" stroke="#FEF1E8" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="8" cy="11.6" r="1" fill="#FEF1E8" />
  </Box>
);

WarningDisc.propTypes = { className: PropTypes.string };

/**
 * The three column headers' marks — sliders, a route, a pin — added so each third of
 * the screen is named by a picture as well as a word once the hairline under the
 * heading came out. Same family as the two above: stroke-only, `currentColor`,
 * rounded joins, no fill a screen reader would have to be told to ignore twice.
 */
export const SlidersIcon = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M2 4.5h7M11.5 4.5H14M2 8h3M6.5 8H14M2 11.5h9.5M14 11.5h-.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="9" cy="4.5" r="1.5" fill="currentColor" />
    <circle cx="5" cy="8" r="1.5" fill="currentColor" />
    <circle cx="11.5" cy="11.5" r="1.5" fill="currentColor" />
  </Box>
);

SlidersIcon.propTypes = { className: PropTypes.string };

/* The hand-drawn route mark that used to live here — a wavy line between two dots —
   read as a rendering glitch at 15px rather than as a route. `RouteOutlined` from
   `@mui/icons-material` is what the "Proposed routes" header uses instead now. */

/**
 * The radius stepper's two ends.
 *
 * **Drawn, for the reason this whole file exists.** `−` is one of at least four dashes a
 * font may resolve — hyphen, minus, en dash, figure dash — with no defined weight
 * relationship to the surrounding text and no reliable optical centre, and it was going to
 * sit 1px off centre in a 38×42 cell next to a `+` that had the same problem. MUI's
 * `Add`/`Remove` icons would also do, at the cost of two more imports from a package whose
 * `.MuiSvgIcon-root { font-size: 1.5rem }` this region has already had to fight twice
 * (§7.28). Two paths at `currentColor` inherit the button's hover and disabled colours for
 * free.
 *
 * `strokeLinecap: round` on a 1.6px stroke: at 12px the caps are what stop the marks
 * reading as hairlines against a 16px semibold figure between them.
 */
const stepperStroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
};

export const MinusIcon = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 12 12"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <line x1="2" y1="6" x2="10" y2="6" {...stepperStroke} />
  </Box>
);

MinusIcon.propTypes = { className: PropTypes.string };

export const PlusIcon = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 12 12"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <line x1="2" y1="6" x2="10" y2="6" {...stepperStroke} />
    <line x1="6" y1="2" x2="6" y2="10" {...stepperStroke} />
  </Box>
);

PlusIcon.propTypes = { className: PropTypes.string };

export const MapPinOutlineIcon = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 16 16"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M8 14.2S13 9.9 13 6.4a5 5 0 1 0-10 0c0 3.5 5 7.8 5 7.8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="6.3" r="1.7" fill="currentColor" />
  </Box>
);

MapPinOutlineIcon.propTypes = { className: PropTypes.string };
