import { Box, Menu, MenuItem, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './harmonization.styles';
import { ZONE_SHAPE } from './harmonizationSettings';
import { BoundaryIcon, CheckIcon, ChevronIcon, RadiusIcon } from './ZoneGlyphs';

/**
 * The two zone methods, picked from one floating trigger rather than a row of segmented
 * buttons — the shape the scheduler's own `ReviewOptionsMenu` settled on.
 *
 * **It stays a menu at two options, having briefly held three.** A zip-code method was
 * built and removed, and the obvious tidy would be to go back to a segmented pair now that
 * two fit. Not done: the trigger's whole value here is that it names the live choice in the
 * corner of a map without also parking the choice it *isn't* there, and that is as true at
 * two as at three. Reverting would also mean this control changes shape every time the list
 * of methods does.
 *
 * Deliberately **not** the scheduler's menu itself — that one is reviewer-only chrome tied
 * to config modules that retire independently of each other and of this screen. This is the
 * same interaction shape (a pill that opens a small upward menu) applied to a real, saved,
 * tenant-facing setting, so it owns its own list rather than borrowing `OPTION_GROUPS`.
 *
 * Used in two places with two different meanings attached to the same value: on the map,
 * inside `ZoneEditorPanel`, it picks how *this* zone's shape is authored; at the top of the
 * Zones section, it picks which solution the list is showing. Both read and write a plain
 * `ZONE_SHAPE` value, so one component serves both call sites — only the positioning wrapper
 * around it differs.
 */

/* Radius first, and it is the default the section opens on: it is the method a franchise
   reaches for most, and the one that needs no drawing to produce a usable zone. */
const useOptions = (tt) => [
  { value: ZONE_SHAPE.RADIUS, Icon: RadiusIcon, label: tt('zoneMethodRadius') },
  { value: ZONE_SHAPE.BOUNDARY, Icon: BoundaryIcon, label: tt('zoneMethodBoundary') },
];

const ZoneMethodMenu = ({ value, onChange, ariaLabel = undefined }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const tt = (key, options) =>
    t(`obx.settings.preferences.harmonization.${key}`, {
      ...options,
      interpolation: { escapeValue: false },
    });

  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const options = useOptions(tt);
  const active = options.find((option) => option.value === value) || options[0];

  return (
    <>
      <Box
        component="button"
        type="button"
        className={`${classes.zoneMethodTrigger} ${open ? classes.zoneMethodTriggerOpen : ''}`}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <active.Icon />
        <Typography component="span" className={classes.zoneMethodTriggerLabel}>
          {active.label}
        </Typography>
        {/* Up while closed — this menu opens upward — and down once the panel is showing,
            so the arrow always points at where the next press moves things. Same convention
            `ReviewOptionsMenu`'s own caret uses, for the same reason. */}
        <Box className={`${classes.zoneMethodCaret} ${open ? classes.zoneMethodCaretOpen : ''}`}>
          <ChevronIcon />
        </Box>
      </Box>

      <Menu
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { className: classes.zoneMethodMenuPaper } }}
        MenuListProps={{
          className: classes.zoneMethodMenuList,
          dense: true,
          'aria-label': ariaLabel,
        }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <MenuItem
              key={option.value}
              className={classes.zoneMethodMenuItem}
              role="menuitemradio"
              aria-checked={selected}
              selected={selected}
              disableRipple
              onClick={() => {
                /* Choosing the live option again is a no-op rather than a write — the
                   same guard the retired segmented pills carried. */
                if (!selected) onChange(option.value);
                setAnchor(null);
              }}
            >
              <option.Icon />
              <Typography
                component="span"
                className={`${classes.zoneMethodMenuItemLabel} ${
                  selected ? classes.zoneMethodMenuItemLabelOn : ''
                }`}
              >
                {option.label}
              </Typography>
              <Box className={classes.zoneMethodMenuCheck} aria-hidden="true">
                {selected ? <CheckIcon /> : null}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

ZoneMethodMenu.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};

export default ZoneMethodMenu;
