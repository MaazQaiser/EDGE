import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * The flow's icon set — stroke-only, `currentColor`, 1.6px.
 *
 * Inline rather than from `src/assets`, for the reason the sibling feature's `Glyphs`
 * gives: the assets there hard-code a fill, so an icon cannot take the colour of the
 * state it is in — and in this drawer almost every icon does exactly that. The close
 * button darkens on hover, the step marks go from grey to brand as they complete, and
 * the tick inside a filled circle has to be white. One shared `currentColor` set is
 * what makes those three the same component instead of three assets.
 */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ children, size = 16, className, viewBox = '0 0 20 20' }) => (
  <Box
    component="svg"
    viewBox={viewBox}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </Box>
);

Svg.propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
  className: PropTypes.string,
  viewBox: PropTypes.string,
};

export const CloseIcon = (props) => (
  <Svg {...props}>
    <path d="M5 5l10 10M15 5L5 15" {...stroke} />
  </Svg>
);

export const CheckIcon = (props) => (
  <Svg {...props}>
    <path d="M4.5 10.5l3.5 3.5 7.5-8" {...stroke} />
  </Svg>
);

export const ChevronLeft = (props) => (
  <Svg {...props}>
    <path d="M12 4l-6 6 6 6" {...stroke} />
  </Svg>
);

export const ChevronRight = (props) => (
  <Svg {...props}>
    <path d="M8 4l6 6-6 6" {...stroke} />
  </Svg>
);

/** The van leg between two stops. A chevron would read as a disclosure; this reads as travel. */
export const DriveIcon = (props) => (
  <Svg size={12} {...props}>
    <path d="M10 3v14M10 17l-3.5-3.5M10 17l3.5-3.5" {...stroke} />
  </Svg>
);

export const WarningIcon = (props) => (
  <Svg {...props}>
    <path d="M10 3.5L2.5 16.5h15L10 3.5z" {...stroke} />
    <path d="M10 8.5v3.2M10 14.2v.1" {...stroke} />
  </Svg>
);

/**
 * `drag_indicator`, at the same proportions the workspace's rows use.
 *
 * Six dots in a 20 × 20 box. Inline and `currentColor` rather than one of the two drag
 * SVGs in `assets`: those hard-code a fill and one carries its own grey rounded-rect
 * background, so neither can fade in on hover the way this row needs.
 */
export const DragHandle = (props) => (
  <Svg {...props}>
    {[4.583, 10, 15.417].map((cy) =>
      [7.083, 12.917].map((cx) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.25" fill="currentColor" />
      )),
    )}
  </Svg>
);

export const ChevronDown = (props) => (
  <Svg {...props}>
    <path d="M5 8l5 5 5-5" {...stroke} />
  </Svg>
);
