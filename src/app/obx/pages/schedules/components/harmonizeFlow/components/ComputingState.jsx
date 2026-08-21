import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThinkingOrb } from 'thinking-orbs';

/**
 * ② — the optimizer, thinking, in the same voice the workspace uses.
 *
 * This is the workspace's `ThinkingStage`, reproduced: the orb, **one line at a time**
 * rather than a checklist that grows, and a tick per line so "is this stuck?" has an
 * answer without anyone reading the words.
 *
 * It replaced a six-row stepper with tick marks and a running count. The stepper was more
 * *informative* and worse: a list that lengthens while you read it is a list you stop
 * reading, and it made a four-second wait look like a process with six stages to audit.
 * One sentence, replaced as the work moves, says the same thing and lets the planner
 * watch rather than read.
 *
 * **The shimmer is the tense, not decoration** — grey-brand-grey travelling left to right
 * under a sentence written in the present tense, and it stops when the thinking stops.
 * Nothing here animates that is not actually in progress.
 *
 * Honesty note, inherited and still true: the orb shows *occupancy*, not progress. The
 * solve is synchronous and finishes long before the narration does; the lines are what
 * report the work, and the ticks are what report how much of the telling is left.
 */
const ComputingState = ({ classes, line, lineIndex, lineCount, holdMs }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  return (
    <Box className={classes.thinkingStage}>
      {/* Blended rather than filtered: the package paints greyscale and takes no colour
          prop. 64 is one of its two tuned sizes — separate designs, not a scale factor. */}
      <Box className={classes.orbTint}>
        <ThinkingOrb state="listening" size={64} aria-label={tt('thinkingAria')} />
      </Box>

      <Box className={classes.thinkingLineSlot} aria-live="polite">
        {/* Keyed on the line, which is what makes it fade at all: a CSS animation runs
            once per mount, so swapping the text alone would be a jump cut. */}
        <Box
          key={lineIndex}
          className={classes.thinkingLine}
          style={{ animationDuration: `${holdMs}ms, 2200ms` }}
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
  );
};

ComputingState.propTypes = {
  classes: PropTypes.object.isRequired,
  line: PropTypes.string,
  lineIndex: PropTypes.number,
  lineCount: PropTypes.number,
  /** The reveal's own line duration, so the fade cannot outlast the line. */
  holdMs: PropTypes.number,
};

export default ComputingState;
