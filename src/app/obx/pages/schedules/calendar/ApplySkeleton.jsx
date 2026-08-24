import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { APPLY_PHASE } from './useApplyMotion';

/**
 * The schedule, while it is being written to the system that owns it and read back.
 *
 * ## Why a skeleton rather than an animation of the change
 *
 * See `useApplyMotion` for the full argument. Briefly: applying does not rearrange this
 * week locally, it sends routes to the scheduling system and re-reads them — so the honest
 * picture is the one every other loading surface in this product shows, and the previous
 * flight choreography was dramatising a local move that does not happen.
 *
 * ## It covers the grid rather than replacing it
 *
 * An overlay, absolutely positioned over the stage the grid already sits in. Two reasons.
 * The grid keeps its scroll position and its own state — swapping the tree out and back
 * would reset both, and the planner would return to the top of a list they had scrolled.
 * And the relocation happens underneath at the turn between the beats: it has to be able to
 * re-render without being seen, which needs it mounted and covered rather than unmounted.
 *
 * ## The bars do not correspond to anything
 *
 * A skeleton is a *shape*, not a preview. These are a fixed, hand-set pattern — see
 * `ROWS` — chosen to look like a week of work rather than computed from the plan. Deriving
 * them from the incoming routes would be a second rendering of the answer, in grey, which
 * is both more code and a claim the skeleton has no business making: at the saving beat
 * nothing has been accepted yet.
 *
 * They are deliberately *not* random either. A pattern reshuffling every render flickers,
 * and one reshuffling per mount makes two applies of the same plan look like two different
 * schedules.
 */

/**
 * The pattern, as columns each row fills.
 *
 * Seven columns, the week. Uneven on purpose: a skeleton where every row is full reads as a
 * loading bar rather than as a schedule, and the real grid is mostly gaps. Weekends light
 * once across the whole set for the same reason.
 */
const ROWS = [[0, 3, 5], [0, 5], [4, 6], [0, 2], [1, 4], [4], [3, 4, 6], [1, 6]];

const DAYS = 7;

const useStyles = makeStyles((theme) => ({
  /**
   * Over the stage, not over the page.
   *
   * `inset: 0` against `[data-apply-stage]`, which is the box the grid is already inside —
   * so the skeleton covers exactly the grid and leaves the page's own toolbar, tabs and
   * footer alone. Those are chrome; they are not being reloaded and hiding them would say
   * they were.
   */
  root: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    /* Opaque. A translucent scrim would leave the old arrangement legible underneath, and
       the old arrangement is about to stop being true. */
    background: theme.palette.surfaceWhite,
    /* Nothing behind it is clickable while a write is in flight. */
    pointerEvents: 'all',
    animation: '$fadeIn 160ms ease both',
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },

  /* ── The caption ──────────────────────────────────────────────────────────
     A row rather than a centred dialog. This is a status, not a decision: it needs no
     acknowledgement and offers no choice, and a modal card in the middle of the screen
     would ask to be dismissed. It sits at the top, where the grid's own header is, so
     the eye finds it without hunting. */
  status: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  statusText: {
    '&.MuiTypography-root': {
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
    },
  },

  /**
   * The spinner, as a ring rather than a shimmer.
   *
   * The bars below already shimmer, and two different idling motions in one view read as
   * two different things happening. A rotating arc is the house sign for *a request is in
   * flight*, which is exactly and only what this beat is.
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

  /* ── The grid of bars ─────────────────────────────────────────────────── */
  grid: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    padding: '0 20px 20px',
  },
  headRow: {
    display: 'grid',
    gridTemplateColumns: `160px repeat(${DAYS}, 1fr)`,
    gap: 12,
    padding: '14px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: `160px repeat(${DAYS}, 1fr)`,
    gap: 12,
    padding: '12px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  /**
   * One bar.
   *
   * The shimmer is a gradient sweeping `background-position`, not an opacity pulse: a pulse
   * makes the whole set breathe in unison, which reads as one object flashing rather than
   * as many placeholders waiting. Each bar carries its own delay (set inline) so the sweep
   * crosses the grid.
   */
  bar: {
    height: 10,
    borderRadius: 5,
    background: `linear-gradient(
      90deg,
      ${theme.palette.surfaceGreySubtle} 0%,
      ${theme.palette.borderSubtle1} 50%,
      ${theme.palette.surfaceGreySubtle} 100%
    )`,
    backgroundSize: '220% 100%',
    animation: '$shimmer 1400ms ease-in-out infinite',
  },
  /* A card-shaped block, for the cells that stand in for visits. */
  card: {
    height: 38,
    borderRadius: 6,
  },
  headBar: {
    height: 8,
    width: '60%',
  },
  labelBar: {
    height: 10,
    width: '78%',
    alignSelf: 'center',
  },
  '@keyframes shimmer': {
    from: { backgroundPosition: '120% 0' },
    to: { backgroundPosition: '-120% 0' },
  },

  /**
   * Reduced motion: the shape without the sweep.
   *
   * `useApplyMotion` returns before either beat for these readers, so this overlay is never
   * mounted for them at all. Kept as the belt to that braces — if a future change mounts it
   * unconditionally, it should still not be a grid of forty animating gradients.
   */
  '@media (prefers-reduced-motion: reduce)': {
    root: { animation: 'none' },
    bar: { animation: 'none', background: theme.palette.surfaceGreySubtle },
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
      <Box className={classes.status}>
        <Box className={classes.spinner} aria-hidden="true" />
        <Typography className={classes.statusText}>
          {phase === APPLY_PHASE.SAVING ? tt('saving', { count: routeCount }) : tt('loading')}
        </Typography>
      </Box>

      <Box className={classes.grid} aria-hidden="true">
        <Box className={classes.headRow}>
          <Box />
          {Array.from({ length: DAYS }, (unused, day) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={day}
              className={`${classes.bar} ${classes.headBar}`}
              style={{ animationDelay: `${day * 60}ms` }}
            />
          ))}
        </Box>

        {ROWS.map((filled, row) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box className={classes.row} key={row}>
            <Box
              className={`${classes.bar} ${classes.labelBar}`}
              style={{ animationDelay: `${row * 70}ms` }}
            />
            {Array.from({ length: DAYS }, (unused, day) => (
              // eslint-disable-next-line react/no-array-index-key
              <Box key={day}>
                {filled.includes(day) ? (
                  <Box
                    className={`${classes.bar} ${classes.card}`}
                    /* Delayed by column *and* row, so the sweep travels diagonally across
                       the week rather than lighting each row as a unit. */
                    style={{ animationDelay: `${day * 60 + row * 70}ms` }}
                  />
                ) : null}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
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
