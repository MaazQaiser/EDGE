import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

import {
  HARMONIZE_SHELL,
  HARMONIZE_SHELL_HINTS,
  HARMONIZE_SHELL_LABELS,
} from '../config/harmonizeShell';

/**
 * Which shell the Harmonize button opens — a reviewer's control, not a tenant's.
 *
 * Geometry copied by value from `VisitVariantSwitch`, which copied it from
 * `CompaniesViewSwitch`, which copied it from `calendarHeaderToolbarToggle`: the
 * segmented pill every text-labelled toggle in this app shares. By value rather than
 * by import for the reason that chain already gives — this control is temporary, and a
 * shared class it could edit would be a way for an experiment to change the toolbar it
 * sits in.
 *
 * Labels are literal English. The control exists to be deleted once the shell decision
 * lands, and adding locale keys for a comparison nobody outside the team sees would
 * leave them behind when it goes.
 */
const useStyles = makeStyles((theme) => ({
  group: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      height: '32px',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
      padding: 0,
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      flex: '0 0 auto',
    },
  },
  button: {
    '&.MuiToggleButton-root': {
      height: 'auto',
      alignSelf: 'stretch',
      padding: '4px 12px',
      border: '1px solid transparent',
      borderRadius: '7px !important',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: 'normal',
      textTransform: 'none',
      whiteSpace: 'nowrap',
      color: theme.palette.textPlaceholder,
      '&:hover': { backgroundColor: theme.palette.borderSubtle2 },
      '&&.Mui-selected': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.10)',
        '&:hover': { backgroundColor: theme.palette.surfaceWhite },
      },
    },
  },
}));

const HarmonizeShellSwitch = ({ value, onChange }) => {
  const classes = useStyles();

  return (
    <ToggleButtonGroup
      className={classes.group}
      exclusive
      size="small"
      value={value}
      /* The null guard matters here as much as on the card switch: clicking the active
         segment must be a no-op, or the Harmonize button would open neither shell. */
      onChange={(_event, next) => next && onChange(next)}
      aria-label="Harmonize shell"
    >
      {Object.values(HARMONIZE_SHELL).map((shell) => (
        <Tooltip key={shell} title={HARMONIZE_SHELL_HINTS[shell]} placement="top" arrow>
          <ToggleButton className={classes.button} value={shell} disableRipple>
            {HARMONIZE_SHELL_LABELS[shell]}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

HarmonizeShellSwitch.propTypes = {
  value: PropTypes.oneOf(Object.values(HARMONIZE_SHELL)).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default HarmonizeShellSwitch;
