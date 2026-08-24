import { Box, Collapse, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronDown } from './Glyphs';

/**
 * ②'s narration, kept — a disclosure in ③ rather than a screen that vanishes with it.
 *
 * ## Where this lives, and where it does not
 *
 * `revealLines` is the same array `ComputingState` reads a line at a time while the run
 * is being sequenced (`useHarmonizeFlow`'s own `revealLines` memo) — nothing new is
 * computed here, the sentences are just given somewhere to still be *after* ② hands off
 * to ③, when the only trace of them used to be memory. It sits in the drawer's head, under
 * the subtitle and above the day tabs — not a third floating accordion over the footer,
 * beside `SpillTray`'s own one: a planner reads this once, out of curiosity or to check a
 * number, not as a recurring queue of decisions the way the spill/not-placed rows are. A
 * lighter control earns that.
 *
 * ## Shut by default, for the reason every other disclosure in this drawer is
 *
 * The proposal is the answer; this is where the answer came from, read on request.
 *
 * ## No icon on the toggle
 *
 * It carried a sparkle, the conventional mark for *the machine did this*. Removed: the
 * whole region it sits in is the machine's work — the routes, the tray, the narration it
 * discloses — so a badge on one disclosure inside it marks nothing the reader did not
 * already know, and it made a quiet text control look like a feature announcement. The
 * word is the whole label.
 *
 * ## Numbered, not bulleted
 *
 * These are steps in the order the engine actually took them — reading visits, matching
 * zones, sequencing each day, checking shifts — and a bullet list would flatten a
 * sequence into a set. The number is the same fact the ticks in ② stood for, kept once the
 * ticks themselves are gone.
 */
const ReasoningTrail = ({ classes, lines, open, onToggle }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  if (!lines.length) return null;

  return (
    <Box className={classes.reasoningTrail}>
      <Box
        component="button"
        type="button"
        className={classes.reasoningToggle}
        aria-expanded={open}
        aria-controls="harmonize-reasoning"
        onClick={onToggle}
      >
        <Typography component="span" className={classes.reasoningToggleLabel}>
          {tt('reasoningToggle')}
        </Typography>
        <Box
          className={classNames(classes.spillBarChevron, open && classes.spillBarChevronOpen)}
          aria-hidden="true"
        >
          <ChevronDown size={14} />
        </Box>
      </Box>

      <Collapse in={open} timeout={180} unmountOnExit>
        <Box className={classes.reasoningBody} id="harmonize-reasoning" role="list">
          {lines.map((line, index) => (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={classes.reasoningRow}
              role="listitem"
            >
              <Typography className={classes.reasoningIndex}>{index + 1}</Typography>
              <Typography className={classes.reasoningLine}>{line}</Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

ReasoningTrail.propTypes = {
  classes: PropTypes.object.isRequired,
  /** The same sentences ② narrated, in the order the engine produced them. */
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  open: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

export default ReasoningTrail;
