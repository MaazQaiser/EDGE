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
 * The four-point sparkle — the same mark `Harmonize this week` already wears on the
 * schedule page's own toolbar, reused here rather than invented again for the same idea:
 * *this is the AI's own work, shown*. Sits on the reasoning toggle in ③.
 */
export const SparkleIcon = (props) => (
  <Svg {...props}>
    <path d="M10 3l1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7L10 3z" {...stroke} />
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

/**
 * `settings` — a gear, six teeth. Sits on the `Configuration` link so the way out of a
 * read-only table is recognisable before the label is even read; the same mark Settings
 * itself uses everywhere else in the product for the same idea.
 */
export const GearIcon = (props) => (
  <Svg {...props}>
    <path
      d="M8.4 3.2h3.2l.5 2a4.9 4.9 0 011.35.78l1.94-.72 1.6 2.77-1.55 1.24a4.9 4.9 0 010 1.56l1.55 1.24-1.6 2.77-1.94-.72a4.9 4.9 0 01-1.35.78l-.5 2H8.4l-.5-2a4.9 4.9 0 01-1.35-.78l-1.94.72-1.6-2.77 1.55-1.24a4.9 4.9 0 010-1.56L2.51 8.05l1.6-2.77 1.94.72A4.9 4.9 0 017.9 5.2z"
      {...stroke}
    />
    <circle cx="10" cy="10" r="2.3" {...stroke} />
  </Svg>
);

/**
 * `move` — send this visit to another day.
 *
 * Two opposed arrows on one axis, which is the *choice* this opens rather than a
 * direction: pressing it does not move anything, it puts the visit in hand and turns every
 * day tab into a priced target. Deliberately not a chevron (that is the row's disclosure,
 * six pixels away) and not the drag handle (which is the same gesture by pointer — this is
 * the one that works without one).
 */
export const MoveIcon = (props) => (
  <Svg {...props}>
    <path d="M7 5.5L4 8.5l3 3M13 8.5H4M13 14.5l3-3-3-3M7 11.5h9" {...stroke} />
  </Svg>
);

/** A plain cross — the ghost tab that adds a route, and nothing else in this drawer. */
export const PlusIcon = (props) => (
  <Svg {...props}>
    <path d="M10 4v12M4 10h12" {...stroke} />
  </Svg>
);

/**
 * A route with nobody on it yet — **and deliberately not `assets/svg/unassigned-officer.svg`.**
 *
 * That asset is the grid's mark for an unassigned *shift*, and it is a white figure on a
 * solid red disc, because on the grid an unassigned shift is a problem somebody has to
 * fix before the day runs. Here it is the opposite: D14 means **every** route this drawer
 * proposes starts with nobody on it, so red would put an error badge on the normal state
 * of every card in the flow. A quiet dashed outline says *this can take someone* without
 * claiming anything is wrong — the same argument `StopPinIcon`'s plain-circle fallback
 * makes for a pin with no ordinal.
 */
export const AddPersonIcon = (props) => (
  <Svg {...props}>
    <circle cx="10" cy="10" r="7.6" {...stroke} strokeDasharray="2.4 2.2" />
    <circle cx="10" cy="8.4" r="2.1" {...stroke} />
    <path d="M6.4 14.4a3.9 3.9 0 017.2 0" {...stroke} />
  </Svg>
);

/**
 * `delete` — a bin, for the one control in this drawer that removes something outright
 * rather than setting it aside or refusing it. Deliberately not the amber/refusal
 * vocabulary the rest of the drawer uses: this is not a decision about a visit, it is
 * deleting a route the planner made by hand a moment ago.
 */
export const TrashIcon = (props) => (
  <Svg {...props}>
    <path d="M4.5 6h11M8 6V4.5h4V6M6 6l.6 10a1 1 0 001 .9h4.8a1 1 0 001-.9L14 6" {...stroke} />
  </Svg>
);
