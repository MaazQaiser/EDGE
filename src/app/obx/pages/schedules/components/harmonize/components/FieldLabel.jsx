import { Box, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { ReactComponent as InfoIcon } from 'src/assets/svg/greyInfoIcon.svg?react';

import { useStyles } from '../harmonize.styles';

/**
 * A field's name, and the explanation of it on hover rather than under it.
 *
 * **Why this exists.** Every control in this drawer had a helper line beneath it, and
 * four controls with four helper lines is four sentences of prose in the first 300px of
 * a panel whose actual job is to show a plan. Read together they were also repetitive:
 * three of them explained where a value came from and one explained what a window is.
 *
 * The rule now is: **the label says what it is, the tip says how it works.** A tip holds
 * the mechanism, the provenance, and any caveat that only matters once — the things a
 * planner reads on their first run and never again. What stays visible underneath a
 * field is only ever a *fact about this run* (Monday is your route day; there are two
 * route days in this window), never an explanation.
 *
 * The `ⓘ` is a real button, not an icon on a `<span>`: a tip reachable only by mouse is
 * a tip half the people who need it cannot open. MUI's `Tooltip` shows on focus as well
 * as hover, so tabbing to it is enough, and `describeChild` hands the tip to the label
 * itself for a screen reader rather than announcing an anonymous button.
 */
const FieldLabel = ({ text, tip, className, id }) => {
  const classes = useStyles();

  if (!tip) {
    return (
      <Typography id={id} className={className || classes.fieldLabel}>
        {text}
      </Typography>
    );
  }

  return (
    <Box className={classes.labelRow}>
      <Typography id={id} className={className || classes.fieldLabel}>
        {text}
      </Typography>
      {/* **No `describeChild`.** It makes MUI clone `title` onto the child as well, so the
          browser's own tooltip appears a second later, in a different place, saying the
          same thing — two tooltips for one tip. `aria-label` already gives a screen reader
          the text, which is what `describeChild` was reached for. */}
      <Tooltip title={tip} arrow placement="top" enterTouchDelay={0}>
        {/* `type="button"` matters: this sits inside the drawer's form controls and a
            default submit button would take the whole panel somewhere. The glyph itself
            is `greyInfoIcon.svg` — the same info mark the harmonization settings screen
            already uses for its own field tooltips, rather than a hand-drawn "i". */}
        <button type="button" className={classes.labelTip} aria-label={tip}>
          <InfoIcon aria-hidden="true" />
        </button>
      </Tooltip>
    </Box>
  );
};

FieldLabel.propTypes = {
  text: PropTypes.string.isRequired,
  /** The mechanism, the provenance, the caveat. Omit and no `ⓘ` is drawn. */
  tip: PropTypes.string,
  /** Defaults to the drawer's own field-label style. */
  className: PropTypes.string,
  id: PropTypes.string,
};

export default FieldLabel;
