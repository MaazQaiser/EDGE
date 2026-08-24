import { Box } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThinkingOrb } from 'thinking-orbs';

import { holdMsForLine } from '../useHarmonizeFlow';

/** How long a line spends leaving. Shorter than its hold, so the slot is never crowded. */
const EXIT_MS = 420;

/**
 * ② — the optimizer, thinking.
 *
 * The orb, **one line at a time**, and a tick per line so "is this stuck?" has an answer
 * without anyone reading the words. It replaced a six-row stepper: a list that lengthens
 * while you read it is a list you stop reading, and it made a four-second wait look like
 * a process with six stages to audit.
 *
 * ## Why two lines are rendered
 *
 * The outgoing line is kept mounted for its exit. With one element the swap can only cut
 * — old words gone on the frame the new ones appear — and with a shimmer running through
 * them a cut reads as *typing*, which is the wrong metaphor: nothing is being composed
 * character by character, a thought is being replaced by the next one. So both lines are
 * on screen during the handover and both travel **upward**: the old one rising away, the
 * new one rising into its place from below.
 *
 * `exiting` holds the previous line for `EXIT_MS` and then drops it, so the slot returns
 * to a single node between beats and a fast run cannot stack three lines on top of each
 * other. The timer is cleared on every change and on unmount.
 *
 * Honesty note: the orb shows *occupancy*, not progress. The solve is synchronous and
 * finishes long before the narration does; the lines report the work and the ticks report
 * how much of the telling is left.
 */
const ComputingState = ({ classes, line, lineIndex, lineCount, holdMs }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const [exiting, setExiting] = useState(null);
  const previous = useRef({ line: null, index: -1 });

  useEffect(() => {
    const last = previous.current;
    previous.current = { line, index: lineIndex };
    if (last.line == null || last.index === lineIndex) return undefined;

    setExiting({ line: last.line, index: last.index });
    const id = setTimeout(() => setExiting(null), EXIT_MS);
    return () => clearTimeout(id);
  }, [line, lineIndex]);

  return (
    <Box className={classes.thinkingStage}>
      {/* **The wash is not here.** It used to be four layers inside this box, and this box
          is inside the drawer's scrolling body — so the aurora, anchored above its own top
          edge to fall inward from it, was cut off flat by the *heading's* bottom edge. The
          glow ended in a hard horizontal line a third of the way down the drawer, which
          read as a rendering fault rather than as light.

          It cannot be fixed from inside a box that starts below the head: no negative
          margin reaches a sibling's space, and the body clips its own overflow because it
          scrolls. So the layers moved up to the shell, where they span the whole paper and
          the title sits *in* the light instead of on its edge. See `HarmonizeDrawer`. */}
      <Box className={classes.stageContent} aria-busy="true">
        <Box className={classes.orbTint}>
          <Box className={classes.orbHalo} aria-hidden="true" />
          <ThinkingOrb state="listening" size={64} aria-label={tt('thinkingAria')} />
        </Box>

        <Box className={classes.thinkingLineSlot}>
          {exiting ? (
            <Box
              key={`out-${exiting.index}`}
              className={classNames(classes.thinkingLineBase, classes.thinkingLineOut)}
              /* The exiting line's *own* hold, not the incoming line's — it mounts fresh
                 (a new key, so its shimmer restarts at 0%) and only survives EXIT_MS, but
                 the sweep is still keyed to the sentence it is playing across. Handed the
                 next line's (usually longer, per D-something) duration instead, the sweep
                 covered less of the box in the same 420ms than the line it was written for. */
              style={{ animationDuration: `${EXIT_MS}ms, ${holdMsForLine(exiting.line)}ms` }}
              aria-hidden="true"
            >
              {exiting.line}
            </Box>
          ) : null}

          {/* Only the arriving line is announced — a live region that also read the
              departing one would say every step twice. */}
          <Box
            key={`in-${lineIndex}`}
            /* Two durations, for two animations: the rise, capped well under the hold so the
               line has settled long before it is replaced, and then the shimmer — **one
               sweep per line**. It was a fixed 2200ms against an 850ms hold, which meant
               every line was replaced a third of the way through its own sweep, and (see
               `thinkingShimmer`) that first third is the part where the gradient has not
               reached the text yet. */
            className={classNames(classes.thinkingLineBase, classes.thinkingLineIn)}
            style={{ animationDuration: `${Math.min(holdMs, 520)}ms, ${holdMs}ms` }}
            aria-live="polite"
          >
            {line}
          </Box>
        </Box>

        {lineCount > 1 ? (
          <Box className={classes.thinkingTicks}>
            {Array.from({ length: lineCount }, (unused, index) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={index <= lineIndex ? classes.thinkingTickDone : classes.thinkingTick}
              />
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

ComputingState.propTypes = {
  classes: PropTypes.object.isRequired,
  line: PropTypes.string,
  lineIndex: PropTypes.number,
  lineCount: PropTypes.number,
  /** The reveal's own line duration; the entrance is capped well under it. */
  holdMs: PropTypes.number,
};

export default ComputingState;
