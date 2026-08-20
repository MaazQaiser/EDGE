import { Box } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from '../harmonize.styles';

/**
 * The optimizer, as a thing that is visibly doing something.
 *
 * A static glyph next to changing text reads as a *label* for the text, not as
 * the author of it — the panel looked like a list that happened to have a
 * decoration. So the avatar carries the work:
 *
 *   **working** — the ring sweeps (one continuous rotation, not a stepped
 *                 spinner), the core breathes, and three satellites orbit at
 *                 different radii and speeds. Nothing about it is periodic
 *                 enough to read as a progress bar, because it is not measuring
 *                 progress — it is saying "occupied".
 *   **done**    — the ring completes and stops, the satellites fold into the
 *                 core, and what is left is a solid mark with a soft halo. The
 *                 transition is the signal: motion stopping is what tells the
 *                 planner the number above it is final.
 *
 * Built from an inline SVG and CSS keyframes rather than a Lottie file, for two
 * reasons: the login screen's Lottie animation is the one thing in this app that
 * reliably crashes it (§7.50), and a 40px mark does not need 200KB of JSON.
 *
 * Honesty note: the sweep is not tied to real progress, because the solve is
 * synchronous and there is no progress to report. It shows *occupancy* only — and
 * the steps beside it, which are real, are what actually reports the work.
 */
const AiAvatar = ({ working = false, size = 34 }) => {
  const classes = useStyles();

  return (
    <Box
      className={classNames(classes.aiAvatar, working && classes.aiAvatarWorking)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Box component="svg" viewBox="0 0 40 40" className={classes.aiAvatarSvg}>
        <defs>
          {/* The sweep: opaque at its head, transparent at its tail, so a plain
              rotation reads as a direction of travel rather than as a spinning
              ring. */}
          <linearGradient id="harmonizeSweep" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* The track the sweep runs on — visible at rest, so the mark does not
            change shape when it stops, only stops moving. */}
        <circle className={classes.aiAvatarTrack} cx="20" cy="20" r="16" />

        <circle
          className={classes.aiAvatarSweep}
          cx="20"
          cy="20"
          r="16"
          stroke="url(#harmonizeSweep)"
        />

        {/* Satellites. Three, at three radii, on three durations — a set of orbits
            that never quite line up, which is what keeps it from looking like a
            loading spinner. */}
        <g className={classes.aiAvatarOrbits}>
          <circle className={classes.aiAvatarSatelliteA} cx="20" cy="6" r="1.9" />
          <circle className={classes.aiAvatarSatelliteB} cx="32" cy="20" r="1.5" />
          <circle className={classes.aiAvatarSatelliteC} cx="20" cy="31" r="1.2" />
        </g>

        {/* The core: a four-point star, the same mark the panel used before, now
            with something happening around it. */}
        <path
          className={classes.aiAvatarCore}
          d="M20 11.4l1.9 5.1a2 2 0 001.2 1.2l5.1 1.9-5.1 1.9a2 2 0 00-1.2 1.2L20 28.6l-1.9-5.1a2 2 0 00-1.2-1.2L11.8 20.4l5.1-1.9a2 2 0 001.2-1.2L20 11.4z"
        />
      </Box>
    </Box>
  );
};

AiAvatar.propTypes = {
  working: PropTypes.bool,
  size: PropTypes.number,
};

export default AiAvatar;
