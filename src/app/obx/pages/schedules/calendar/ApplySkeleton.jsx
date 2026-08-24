import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { APPLY_PHASE } from './useApplyMotion';

/**
 * The status of an apply in flight — **a caption, and nothing else.**
 *
 * ## What this used to be, and why it changed
 *
 * It was an opaque overlay at `inset: 0` over the whole grid stage, drawing an invented
 * skeleton of the week: a header row of bars, then eight rows from a hand-set `ROWS`
 * pattern, shimmering diagonally. It argued — reasonably — that a skeleton is a *shape*
 * rather than a preview, and that deriving the bars from the incoming routes would be a
 * second rendering of an answer nothing had accepted yet.
 *
 * The problem was not the invention, it was the **coverage**. Hiding the grid hid the day
 * columns, the company column and every row heading along with the cards, so applying looked
 * like the whole scheduler was being replaced. It also meant the planner lost their place:
 * the thing they were looking at vanished and a different-shaped grey grid stood in for it.
 *
 * Removed on instruction. The skeleton now happens **on the real visit cards** — see the
 * `[data-applying]` rules in `scheduleCalendar.styles.js`. The grid keeps its structure, its
 * scroll position and its headings; only the cards go grey and shimmer, and the relocation
 * still happens underneath at the turn between the beats, where it cannot be seen.
 *
 * ## Why the caption survived the cut
 *
 * It is the one thing the cards cannot say. A grid of shimmering placeholders means *waiting*;
 * it does not name what is being waited for, and "3 routes are being written to the
 * scheduling system" is the sentence that makes a two-and-a-half second pause legible rather
 * than suspicious. So it stays — as a pill, pinned low and centred over the stage, out of the
 * grid's own header and inert to the pointer.
 *
 * It is deliberately *not* pinned to the top: that is where the grid's own day headings are,
 * and those are exactly what this change exists to keep visible.
 */
const useStyles = makeStyles((theme) => ({
  /**
   * A pill over the stage, not a cover for it.
   *
   * `pointer-events: none` because it reports rather than blocks. Blocking is not this
   * component's job any more either — `[data-applying]` disables the cards themselves, which
   * is the honest scope: the toolbar and the tabs stay live, because nothing about them is
   * being reloaded.
   */
  root: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    maxWidth: 'calc(100% - 48px)',
    padding: '10px 16px',
    borderRadius: 999,
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0 6px 20px rgba(16, 24, 40, 0.12)',
    pointerEvents: 'none',
    animation: '$riseIn 200ms ease both',
  },
  '@keyframes riseIn': {
    from: { opacity: 0, transform: 'translateX(-50%) translateY(6px)' },
    to: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
  },

  statusText: {
    '&.MuiTypography-root': {
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  /**
   * The spinner, as a ring rather than a shimmer.
   *
   * The cards shimmer, and two different idling motions saying the same thing read as two
   * things happening. A rotating arc is the house sign for *a request is in flight*, which is
   * exactly and only what this beat is.
   */
  spinner: {
    width: 16,
    height: 16,
    flex: '0 0 auto',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.borderSubtle2}`,
    borderTopColor: theme.palette.surfaceBrand,
    animation: '$spin 700ms linear infinite',
  },
  '@keyframes spin': {
    to: { transform: 'rotate(360deg)' },
  },

  /* `useApplyMotion` returns before either beat under reduced motion, so this is never
     mounted for those readers. Kept as the belt to that braces. */
  '@media (prefers-reduced-motion: reduce)': {
    root: { animation: 'none' },
    spinner: { animation: 'none' },
  },
}));

const ApplySkeleton = ({ phase, routeCount }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.schedules.apply.${key}`, options);

  if (phase === APPLY_PHASE.IDLE) return null;

  return (
    <Box className={classes.root} role="status" aria-live="polite">
      <Box className={classes.spinner} aria-hidden="true" />
      <Typography className={classes.statusText}>
        {phase === APPLY_PHASE.SAVING ? tt('saving', { count: routeCount }) : tt('loading')}
      </Typography>
    </Box>
  );
};

ApplySkeleton.propTypes = {
  phase: PropTypes.oneOf(Object.values(APPLY_PHASE)),
  /** How many routes are being written — the saving caption names the number. */
  routeCount: PropTypes.number,
};

ApplySkeleton.defaultProps = { routeCount: 0 };

export default ApplySkeleton;
