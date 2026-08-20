import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThinkingOrb } from 'thinking-orbs';

import { useStyles as useWorkspaceStyles } from '../harmonizeWorkspace.styles';

/**
 * The optimizer, thinking, in the column its answer will appear in.
 *
 * **Why here and not over the map.** The narration used to be captioned on the map, on the
 * argument that the map was illustrating each line. It still is — pins grey out on the line
 * that rules them out, the ring arrives on the line that names the radius — but the *thing
 * being made* is the list of routes, and this is the column that will hold it. So the orb
 * stands where the routes will stand: the planner watches one region think and then fill,
 * rather than reading a caption on the left and discovering the result on the right.
 *
 * **One line, replaced, not a log that grows.** Each line fades up, holds, and fades back
 * out as the next arrives — a stack that lengthens while you read it is a stack you stop
 * reading, and it would also push the orb off centre as it went. The fade is timed to the
 * reveal's own `LINE_MS` so a line is never cut off mid-word.
 *
 * **The shimmer is not decoration, it is the tense.** Grey-green-grey travelling left to
 * right says *still working* about a sentence that is written in the present tense, and it
 * stops when the thinking stops. Nothing here is animated that is not actually in progress.
 */
const ThinkingStage = ({ line, lineIndex, lineCount, holdMs, onCancel }) => {
  const workspace = useWorkspaceStyles();
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonize.${key}`, options);

  return (
    <Box className={workspace.thinkingStage}>
      {/* The wrapper is what makes it the brand colour: the package paints greyscale and
          takes no colour prop, so it is blended rather than filtered — see `orbTint`, which
          explains why the obvious approaches do not work. 64 is one of the package's two
          tuned sizes; they are separate designs rather than a scale factor, so this is a
          choice between two values and not a free number. */}
      <Box className={workspace.orbTint}>
        <ThinkingOrb state="listening" size={64} aria-label={tt('thinkingAria')} />
      </Box>

      <Box className={workspace.thinkingLineSlot}>
        {/**
         * **Keyed on the line, which is what makes it fade at all.**
         *
         * A CSS animation runs once per mount. Swapping only the text content would leave
         * the same element on screen with new words in it — no fade, just a jump cut — so
         * the key remounts the node and the animation replays for each line. It is also why
         * the slot above has a fixed height: remounting an auto-height element makes the orb
         * hop by however tall the last line was.
         */}
        <Box
          key={lineIndex}
          className={workspace.thinkingLine}
          style={{ animationDuration: `${holdMs}ms, 2200ms` }}
        >
          {line}
        </Box>
      </Box>

      {/* How far through it is. Six lines is about five seconds, which is long enough that
          "is this stuck?" is a fair question — the ticks answer it without asking anyone to
          read them. */}
      {lineCount > 1 ? (
        <Box className={workspace.thinkingTicks}>
          {Array.from({ length: lineCount }, (unused, index) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={index <= lineIndex ? workspace.thinkingTickDone : workspace.thinkingTick}
            />
          ))}
        </Box>
      ) : null}

      {/**
       * A way out of it — **Cancel**, where this was **Skip**.
       *
       * Skip was defensible on its own terms: the run is solved before the first line is
       * spoken, so the narration explains an answer that already exists and anyone who has
       * watched it once is waiting on nothing. What it got wrong is *which* impatience a
       * planner has here. Someone who wants the answer faster will have it in four seconds
       * whatever they press. Someone who has just watched the second line go by and realised
       * the wrong days are ticked wants to stop and fix it — and the only control on screen
       * offered to hurry the wrong answer along instead.
       *
       * So it abandons the run: the snapshot is dropped, the region returns to the map and
       * the coverage readout, and the setup column is exactly as they left it. Nothing is
       * lost, because nothing had been written — the plan was a proposal and the question is
       * still on screen.
       *
       * **The fast-forward is genuinely gone, not moved.** Nothing here now shortens the
       * narration for a planner who has seen it and trusts it, which is a real cost and the
       * reason to write it down: if that impatience shows up, the honest fix is a preference
       * that skips the reveal for good, not a second button beside this one.
       */}
      {onCancel ? (
        <Button
          disableRipple
          variant="secondaryGrey"
          className={workspace.skipButton}
          onClick={onCancel}
          aria-label={tt('cancelRevealAria')}
        >
          {tt('cancelReveal')}
        </Button>
      ) : null}
    </Box>
  );
};

ThinkingStage.propTypes = {
  /** The line being spoken right now. */
  line: PropTypes.string,
  lineIndex: PropTypes.number,
  lineCount: PropTypes.number,
  /** How long each line is held — the reveal's `LINE_MS`, so the fade cannot outlast it. */
  holdMs: PropTypes.number,
  /** Abandons the run and hands the planner their configuration back. */
  onCancel: PropTypes.func,
};

export default ThinkingStage;
