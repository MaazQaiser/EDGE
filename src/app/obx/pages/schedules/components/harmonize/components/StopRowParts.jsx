import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { ChevronDown } from './Glyphs';

/**
 * The three pieces a stop row is made of, in one place because two lists draw them.
 *
 * `StopList` draws the planned day and `AiPanel` draws what the plan left out, and the
 * supplied CSS gives both surfaces **the same row** — grip, pin, name, distance, dot,
 * duration, chevron, and the same two-column disclosure underneath. The two files had
 * grown their own copies of it: the drag handle was declared twice verbatim (`AiPanel`'s
 * copy carried a docstring apologising for itself), and the figure and the label/value
 * pairs were about to be a third and fourth duplication once the disclosure gained its
 * columns and its ghost chevrons. A mark drawn in two places is a mark that can drift,
 * and these rows sit one above the other in the same column, so any drift shows in a
 * single glance.
 *
 * **Here rather than in `Glyphs`, which is where the handle belongs.** `Glyphs` is the
 * region's stroke-only icon set — a chevron, a triangle, a pin outline — and two of the
 * three exports below are not icons at all but small layout components that take
 * `classes` from the shared sheet. Putting a component that reaches into `useStyles`
 * beside four pure paths would make `Glyphs` two things. The handle rides along here
 * because it is only ever drawn as part of one of these rows.
 *
 * **`classes` is a prop rather than a `useStyles()` call in each component.** The sheet
 * is one JSS sheet and calling the hook again per row would re-resolve it once per stop
 * on every render; the callers already hold it.
 */

/**
 * `drag_indicator`, at the spec's proportions.
 *
 * Six dots in a 20 × 20 box, the cluster spanning 29.16%–70.84% across and
 * 16.67%–83.33% down — which is what fixes r at 1.25 and the centres at 7.083 /
 * 12.917 and 4.583 / 10 / 15.417. Inline rather than one of the two drag SVGs already
 * in `assets`: `DragIcon.svg` is 28 × 28 and carries its own grey rounded-rect
 * background, `draggable.svg` is 7 × 10, and both hard-code a fill. This one is
 * `currentColor`, so the handle can darken on hover and focus without a second asset.
 *
 * It replaced a `⠿` braille glyph, which rendered at whatever size and weight the body
 * font felt like and sat a couple of pixels off the row's centre line.
 */
export const DragHandle = ({ className }) => (
  <Box
    component="svg"
    viewBox="0 0 20 20"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {[4.583, 10, 15.417].map((cy) =>
      [7.083, 12.917].map((cx) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.25" fill="currentColor" />
      )),
    )}
  </Box>
);

DragHandle.propTypes = { className: PropTypes.string };

/**
 * The row's right-hand figure: how far, how long, and the mark that opens the working.
 *
 * **A fragment, not a box.** The supplied CSS puts the distance, the 2px dot, the
 * duration and the chevron directly in the row's content flex line at `gap: 6` — there
 * is no wrapper around them, and adding one would put a second flex context inside the
 * first and stop the row's own gap from spacing these four against the site name. So
 * this returns the four children loose and the caller's content row is their flex
 * parent.
 *
 * **Either half may be missing and the dot goes with them.** A stop's distance is null
 * on the first leg of a route (there is no measurable origin) and an excluded visit's is
 * null when nothing was measured from; the duration is absent while road times are in
 * flight. A separator with nothing on one side of it is punctuation pointing at an empty
 * space, so the dot is conditional on both halves rather than on the row.
 *
 * The chevron is unconditional, because there is always something behind it — even a row
 * whose figure has narrowed to a single number has its arithmetic to show.
 */
export const StopFigure = ({ classes, distance, duration, open, onToggle, toggleLabel }) => (
  <>
    {distance ? <Typography className={classes.stopFigure}>{distance}</Typography> : null}
    {distance && duration ? <Box className={classes.stopMetaDot} /> : null}
    {duration ? <Typography className={classes.stopFigure}>{duration}</Typography> : null}
    <button
      type="button"
      className={classNames(classes.stopChevron, open && classes.stopChevronOpen)}
      aria-expanded={open}
      aria-label={toggleLabel}
      onClick={onToggle}
    >
      <ChevronDown className={classes.stopChevronIcon} />
    </button>
  </>
);

StopFigure.propTypes = {
  classes: PropTypes.object.isRequired,
  /** `12 mi`, or empty when there is no origin to measure from. */
  distance: PropTypes.string,
  /** `1 hr 29 min`, or empty while the road times are still in flight. */
  duration: PropTypes.string,
  open: PropTypes.bool,
  onToggle: PropTypes.func,
  toggleLabel: PropTypes.string,
};

/**
 * The stop, as the supplied design lays it out: **one row, four columns, and the dashed track
 * inside it.**
 *
 * **This is a structural correction, not a restyle.** The previous build drew a stop as three
 * stacked siblings — a fixed-height row (grip · pin · name · figure), then a connector box, and
 * then, when open, a *second* connector box with the breakdown beside it. The design draws one
 * row whose columns run its full height: the grip, then a 16px column holding the pin above a
 * dashed line that grows to fill whatever the row's height turns out to be, then the label
 * stack, then the value stack. Opening a stop lengthens the label and value stacks, the row
 * grows, and the dashed line grows with it — which is why the design needs no separate
 * connector at all and why the old build had to draw two.
 *
 * Three faults fall out of the old shape and all three are what the reader was seeing:
 *
 * 1. **The disclosure was a different object from the row.** It restated the grip column's
 *    width and the connector's offsets to line its own columns up, so the breakdown's labels
 *    landed at the site name's x only because two separate boxes agreed about a number.
 * 2. **The dashed rule broke at every gap.** Row, then connector, then disclosure, then
 *    connector again — four boxes, each with its own vertical padding, so the track had a seam
 *    wherever two met and changed colour halfway down an open stop.
 * 3. **The row could not grow.** `height: 36` was measured for a closed row, so an open one
 *    put its breakdown *below* the thing it was a breakdown of rather than beside the figures
 *    it adds up to.
 *
 * The label and value stacks are still built from **one array**, mapped twice — entry *n* is
 * the same object on both sides, so no arithmetic, index offset or equal-length assumption
 * stands between a label and its value. The alternative is two arrays built by two `if`
 * chains, which is the version that goes wrong: every row of it reads as plausible while
 * `Travel time:` quietly sits beside the filter minutes.
 *
 * **Each value is followed by a chevron that is drawn and hidden.** The first value row ends
 * with a real 7×3.5 chevron and the rest would otherwise sit that much further right than the
 * figure they explain. The design does the same thing — `Vector 436` at `opacity: 0` on rows
 * two and three.
 */
export const StopRow = ({
  classes,
  /** The grip, the pin and the badge: whatever the caller wants in the row's first columns. */
  grip,
  pin,
  /** The row's own top line — the site name, and any badge riding with it. */
  title,
  /** `{ key, label, value }` per breakdown line, in reading order. Empty when shut. */
  details = [],
  /** The `18 mi · 2 hr 12 min ⌃` cluster, as a node. */
  figure,
  /** The dashed track's colour: violet between stops, grey to an anchor, amber in the panel. */
  lineColor,
  /** Value-less lines and actions, appended under the labels. */
  children,
  /** An override on the row's own frame — the last row in a list takes no connector gap. */
  rowClassName,
}) => (
  <Box className={classNames(classes.stopLine, rowClassName)}>
    {grip}

    {/* The 16px column: the pin, then the track. `flex: 1` on the line is the whole mechanism
        by which an open stop's dashed rule reaches the bottom of the taller row — there is no
        height to compute and nothing to keep in step. */}
    <Box className={classes.stopTrackColumn}>
      {pin}
      <Box className={classes.stopTrackLine} style={{ color: lineColor }} />
    </Box>

    {/* Labels down the left. `justifyContent: center` matches the design, which centres the
        68px label stack in the 88px row rather than hanging it from the top — so a closed
        stop's name sits on the pin's own centre line. */}
    <Box className={classes.stopLabels}>
      {title}
      {details.map((detail) => (
        <Typography key={detail.key} className={classes.stopDetailLabel}>
          {detail.label}
        </Typography>
      ))}
      {children}
    </Box>

    {/* Values down the right, top-aligned: the figure has to sit on the *name's* line, and the
        breakdown hangs beneath it. Centring this stack too would drift the figure off the name
        by half the difference between the two stacks' heights. */}
    <Box className={classes.stopValues}>
      {figure}
      {details.map((detail) => (
        <Box key={detail.key} className={classes.stopDetailRow}>
          <Typography className={classes.stopDetailValue}>{detail.value}</Typography>
          <ChevronDown className={classNames(classes.stopChevronIcon, classes.stopChevronGhost)} />
        </Box>
      ))}
    </Box>
  </Box>
);

StopRow.propTypes = {
  classes: PropTypes.object.isRequired,
  rowClassName: PropTypes.string,
  grip: PropTypes.node,
  pin: PropTypes.node,
  title: PropTypes.node,
  details: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node,
      value: PropTypes.node,
    }),
  ),
  figure: PropTypes.node,
  lineColor: PropTypes.string,
  children: PropTypes.node,
};
