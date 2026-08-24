import { Avatar, Box, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { installerById, INSTALLERS } from '../model/fixtures';
import { AddPersonIcon } from './Glyphs';

/**
 * Who is driving this route — an avatar on the card, and a menu to change it.
 *
 * ## Why this exists at all, given D14
 *
 * D14 makes this model installer-blind and the **engine still is** — see the note on
 * `INSTALLERS` in `model/fixtures.js`. What this replaces is the footer sentence that used
 * to say *"runsheets are created unassigned — choose an installer for each afterwards"*: a
 * fact about the output, stated once at the bottom of the drawer, that a planner could do
 * nothing about until after they had pressed Apply. Naming someone here is a label on the
 * runsheet this run will create, applied where the runsheet is, before it is created.
 *
 * ## The trigger is the state
 *
 * Unassigned draws `AddPersonIcon`, a quiet dashed outline — **not** the grid's own
 * `unassigned-officer.svg`, which is a white figure on a solid red disc because on the
 * grid an unassigned shift is a problem. Here nobody-yet is the *normal* state of every
 * route (D14), so red would badge the whole flow as broken; see the note on the glyph
 * itself. Assigned draws the person's face. Either way it is the same 22px circle in the
 * same place, so the card's layout does not move when a name lands on it, and either way
 * it is the button that opens the menu: there is no separate "change" affordance to find.
 *
 * ## `Menu`, not the grid's own popover
 *
 * `CalendarOfficerAssignPopover` next door is the richer control — search, roles,
 * disabled reasons, a live fetch — and it is built against real officer records from
 * `duty.services`. This drawer runs on a six-person fixture with no roles and no
 * conflicts to report, so the search field would filter six rows and the role line would
 * be blank. A plain `Menu` is the honest size of the choice; if this feature ever gets
 * real installers, that popover is what it should grow into rather than a bigger version
 * of this.
 */
const RouteAvatar = ({ classes, installerId, onAssign }) => {
  const { t } = useTranslation();
  const tt = (key, options) => t(`obx.runsheet.harmonizeFlow.${key}`, options);

  const [anchor, setAnchor] = useState(null);
  const installer = installerId ? installerById(installerId) : null;

  return (
    <>
      <Tooltip
        arrow
        title={installer ? tt('installerChange', { name: installer.name }) : tt('installerAssign')}
      >
        <Box
          component="button"
          type="button"
          className={classes.routeAvatarButton}
          aria-label={
            installer ? tt('installerChange', { name: installer.name }) : tt('installerAssign')
          }
          aria-haspopup="menu"
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          {installer ? (
            <Avatar className={classes.routeAvatar} src={installer.imageUrl} alt="" />
          ) : (
            <AddPersonIcon size={22} className={classes.routeAvatarEmpty} />
          )}
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {/* `Unassign` only once there is something to unassign — an inert row saying
            "nobody" on a route that already has nobody on it is a choice with no effect. */}
        {installer ? (
          <MenuItem
            className={classes.installerItem}
            onClick={() => {
              onAssign(null);
              setAnchor(null);
            }}
          >
            <AddPersonIcon size={22} className={classes.routeAvatarEmpty} />
            <Typography className={classes.installerName}>{tt('installerUnassign')}</Typography>
          </MenuItem>
        ) : null}

        {INSTALLERS.map((person) => (
          <MenuItem
            key={person.id}
            className={classes.installerItem}
            selected={person.id === installerId}
            onClick={() => {
              onAssign(person.id);
              setAnchor(null);
            }}
          >
            <Avatar className={classes.routeAvatar} src={person.imageUrl} alt="" />
            <Typography className={classes.installerName}>{person.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

RouteAvatar.propTypes = {
  classes: PropTypes.object.isRequired,
  /** The assigned installer's id, or empty for a route nobody is on yet. */
  installerId: PropTypes.string,
  /** Called with an installer id, or `null` to clear the assignment. */
  onAssign: PropTypes.func.isRequired,
};

export default RouteAvatar;
