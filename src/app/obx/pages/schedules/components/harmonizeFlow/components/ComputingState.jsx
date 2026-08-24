import { Box } from '@mui/material';
import classNames from 'classnames';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prefersReducedMotion } from 'src/app/obx/pages/schedules/components/harmonize/routeMotion';
import { mainDomain } from 'src/helper/utilityFunctions';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import { holdMsForLine } from '../useHarmonizeFlow';

/**
 * How long a line spends leaving. Shorter than its hold, so the slot is never crowded.
 *
 * Raised 420 → 560 with the reveal's own retiming: the handover itself was called too quick
 * to follow, and the hold and the handover are two halves of the same complaint. Still
 * comfortably under `MIN_HOLD_MS` (1100), which is the constraint — an exit longer than a
 * hold would put three lines in a two-line slot.
 */
const EXIT_MS = 560;

/** The mascot's box. See `MASCOT_SIZE`'s note in the component below. */
const MASCOT_SIZE = 128;

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
 * Honesty note: the mascot shows *occupancy*, not progress. The solve is synchronous and
 * finishes long before the narration does; the lines report the work and the ticks report
 * how much of the telling is left.
 *
 * ## The mascot, not an orb
 *
 * This used to be `ThinkingOrb` from `thinking-orbs` — a greyscale generative canvas,
 * borrowed from the workspace's own thinking stage. It is now the **tenant's own loading
 * animation**, the one the application plays on its very first paint (`common/loader`
 * pulls the same `MULTI_TENANT_AUTH[...].loader` Lottie), on Abdullah's direction.
 *
 * The argument for it is recognition rather than novelty: a planner has already watched
 * this exact animation while the app booted, so it arrives pre-labelled as *this product
 * is working*. The orb had to teach that from scratch, and it was borrowed from a shell
 * this one is being compared against, which made "the drawer feels different" partly a
 * statement about a shared component.
 *
 * Three things this needs that the orb did not:
 *
 * - **The animation data has to be DEEP cloned.** `lottie-react` writes bookkeeping onto
 *   the data it is handed (`completed`, among others), and these loaders are module-level
 *   exported constants that reach us **deep-frozen** — measured in the browser:
 *   `Object.isFrozen(loader)` is `true` and so is `Object.isExtensible(loader.layers[0])`.
 *   The first write throws `Cannot add property completed, object is not extensible` and
 *   takes the whole React tree down with it. That is not hypothetical: it is live on the
 *   login screen today, where it blanks the page.
 *
 *   **A shallow spread does not fix this** — it was tried here first and crashed exactly
 *   the same way, because `{ ...loader }` thaws the top level and leaves every nested
 *   layer frozen, which is where lottie actually writes. `structuredClone` is the whole
 *   fix; the data is plain JSON so there is nothing in it the algorithm refuses. Memoised
 *   because it is ~250KB and must not be rebuilt on every render of a state that
 *   re-renders once per narration line.
 * - **Reduced motion has to be honoured explicitly.** The orb was a canvas that simply ran;
 *   a Lottie is a timeline, so `autoplay` is a real choice. Off, it holds frame one — the
 *   mascot is still there, still labelled, just not moving.
 * - **A tenant may have no loader.** `MULTI_TENANT_AUTH` is keyed by domain and the lookup
 *   is optional everywhere else it is used, so this renders nothing rather than crashing on
 *   an unknown host. The lines and the ticks carry the state on their own; the animation is
 *   the part that can be missing.
 *
 * `MASCOT_SIZE` is 128 against the orb's 64. The orb was an abstract mark that read at any
 * size; this is a character with a van in it, and at 64px in a 523px drawer it reads as a
 * smudge. 128 is a quarter of the drawer's width — big enough to be the thing you are
 * looking at, short of the 300px the full-screen boot loader draws it at.
 */
const ComputingState = ({ classes, line, lineIndex, lineCount, holdMs }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  /* Deep-cloned, not passed through and not spread — see the note above. Keyed on the
     loader itself so a tenant switch rebuilds it and nothing else does. */
  const loader = MULTI_TENANT_AUTH[mainDomain()]?.loader;
  const mascot = useMemo(() => (loader ? structuredClone(loader) : null), [loader]);

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
        {mascot ? (
          <Box className={classes.mascotStage} role="img" aria-label={tt('thinkingAria')}>
            <Box className={classes.mascotHalo} aria-hidden="true" />
            <Lottie
              animationData={mascot}
              loop
              autoplay={!prefersReducedMotion()}
              style={{ width: MASCOT_SIZE, height: MASCOT_SIZE }}
            />
          </Box>
        ) : null}

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
            /* The entrance cap went 520 → 660 with `EXIT_MS`, for the same reason and under
               the same constraint: it has to finish well inside the hold so the line is
               settled and readable rather than still arriving when it is replaced. */
            style={{ animationDuration: `${Math.min(holdMs, 660)}ms, ${holdMs}ms` }}
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
