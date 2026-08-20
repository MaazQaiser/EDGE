/**
 * DEMO — a still of the Roles & Permissions screen, for the Settings preview route.
 *
 * The real screen (`common/pages/settings/rolesAndPermissions`) builds its rail and its whole
 * grid from `getRolesForSettings()`, so on a route with no session it has nothing to draw and
 * sits in the loading state instead. This reproduces what it looks like with a role selected
 * and its privileges filled in, so the tab shows the screen rather than a note explaining
 * which screen the reviewer is not being shown.
 *
 * The chrome is the real screen's own: `RolesAndPermission.style.js` for the rail, the heading
 * and the scroll frame, and `permissionStyle.js` for the grid — the header band, the cell
 * borders, the row tint and the 27px indent that makes a child row read as nested. Only three
 * things are written here: the brand fill on a checked box, the inert cursor, and the row data
 * itself. Anything else drifting from production would be a bug in the styles, not in this file.
 *
 * Every colour is a brand token, so it follows the tenant the way the real screen does — green
 * on Filter Go — rather than the blue in the reference captures, which came from a session
 * whose theme had resolved to Signal. `checkbox-checked.svg` is the one place that blue is not
 * the theme's fault: the asset bakes it into the rect's `fill` attribute, and the real grid's
 * `& svg { fill }` cannot reach it, because a presentation attribute on the rect beats a fill
 * inherited from the svg above it. So a checked box here is repainted from `surfaceBrand` at
 * the rect. It is left checked rather than disabled: `Mui-disabled` greys the box out, which
 * would read as "this permission cannot be granted" instead of "this permission is granted".
 *
 * Labels are literals, not `t()` keys, because one of these rows has no fixed English name:
 * `runsheets` translates to a tenant label that `useTenantLabel` reads out of the store, so
 * without a session it would print an empty word. "Routes" is what Filter Go calls them.
 *
 * It is a still, deliberately: no role switching, no toggling. Half-working permissions are
 * worse than none, because the reviewer cannot tell which half is the preview's fault.
 *
 * Delete with the rest of the preview scaffolding once the ACL is fixed.
 */
import { Box, Button, Checkbox, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { useStyles as usePermissionStyles } from 'src/app/common/pages/settings/rolesAndPermissions/components/permissionGrid/permissionStyle';
import { useStyles as useRolesStyles } from 'src/app/common/pages/settings/rolesAndPermissions/RolesAndPermission.style';
import { ReactComponent as ACLCalendar } from 'src/assets/svg/ACLCalendar.svg?react';
import { ReactComponent as ACLFranchises } from 'src/assets/svg/ACLFranchises.svg?react';
import { ReactComponent as ACLFull } from 'src/assets/svg/ACLFull.svg?react';
import { ReactComponent as ACLInvoice } from 'src/assets/svg/ACLInvoice.svg?react';
import { ReactComponent as ACLMobile } from 'src/assets/svg/ACLMobile.svg?react';
import { ReactComponent as ACLRunsheet } from 'src/assets/svg/ACLRunsheet.svg?react';
import { ReactComponent as ACLSetting } from 'src/assets/svg/ACLSetting.svg?react';
import { ReactComponent as AClShipfReport } from 'src/assets/svg/AClShipfReport.svg?react';
import { ReactComponent as CheckboxUnchecked } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckboxChecked } from 'src/assets/svg/checkbox-checked.svg?react';

const useStyles = makeStyles((theme) => ({
  /* Repaints the checked box from the tenant's brand token — see the note at the top of the
     file for why the asset's own fill wins without this. `pointerEvents` is what makes the
     grid a still: `readOnly` alone still gives a ripple and a focus ring on click, which is
     an invitation to keep clicking. */
  staticCheckbox: {
    '& .custom-checkbox': {
      pointerEvents: 'none',
      '&.Mui-checked svg rect': {
        fill: theme.palette.surfaceBrand,
      },
    },
  },
  /* Same reasoning for the rail: a role that lights up on hover but never becomes the
     selected one reads as a broken screen rather than a still of a working one. */
  inertButton: {
    '&.MuiButtonBase-root': {
      pointerEvents: 'none',
    },
  },
}));

const ACTIONS = ['View', 'Create', 'Update', 'Delete'];

/** A cell with no control in it, for an action the module does not have. */
const NOT_APPLICABLE = null;

const ROLES = ['Supervisor', 'Franchise Owner', 'Installer'];

/* Icons are the ones the real grid maps each module key to, so the preview shares its icon
   vocabulary rather than inventing a second one. Child rows carry none there either. */
const MODULES = [
  {
    label: 'Has full access to all modules',
    icon: <ACLFull />,
    actions: [false, false, false, false],
  },
  {
    label: 'Location Tracker',
    icon: <ACLFranchises />,
    actions: [true, true, true, true],
  },
  {
    label: 'Franchises',
    icon: <ACLFranchises />,
    actions: [false, NOT_APPLICABLE, false, NOT_APPLICABLE],
  },
  {
    label: 'Invoices',
    icon: <ACLInvoice />,
    actions: [false, false, false, false],
  },
  {
    label: 'Mobile Experience',
    icon: <ACLMobile />,
    actions: [true, NOT_APPLICABLE, NOT_APPLICABLE, NOT_APPLICABLE],
    children: [
      { label: 'Job Execution', actions: [true, NOT_APPLICABLE, NOT_APPLICABLE, NOT_APPLICABLE] },
      { label: 'Supervision', actions: [true, NOT_APPLICABLE, NOT_APPLICABLE, NOT_APPLICABLE] },
    ],
  },
  {
    label: 'Routes',
    icon: <ACLRunsheet />,
    actions: [true, true, true, false],
  },
  {
    label: 'Schedule',
    icon: <ACLCalendar />,
    actions: [true, true, true, true],
  },
  {
    label: 'Settings',
    icon: <ACLSetting />,
    actions: [false, false, false, false],
    children: [
      { label: 'Report Templates', actions: [false, false, false, false] },
      { label: 'Roles And Permissions', actions: [false, false, false, false] },
      { label: 'User Groups', actions: [false, false, false, false] },
    ],
  },
  {
    label: 'Shift Reports',
    icon: <AClShipfReport />,
    actions: [false, false, false, false],
  },
];

/**
 * One action cell: the module's checkbox in its granted or ungranted state, or a dash where the
 * action does not exist for it. The real grid draws both from `cell`, in parent and child rows
 * alike, and lets `subPermissions` strip the horizontal borders back off inside a child.
 */
const ActionCell = ({ action }) => {
  const permissionClasses = usePermissionStyles();
  const classes = useStyles();

  if (action === NOT_APPLICABLE) {
    return <Box className={`${permissionClasses.cell} checkboxCell`}>-</Box>;
  }

  return (
    <Box className={`${permissionClasses.cell} ${classes.staticCheckbox} checkboxCell`}>
      <Checkbox
        icon={<CheckboxUnchecked />}
        checkedIcon={<CheckboxChecked />}
        checked={action}
        readOnly
        disableRipple
        inputProps={{ tabIndex: -1 }}
        className="custom-checkbox"
      />
    </Box>
  );
};

ActionCell.propTypes = {
  action: PropTypes.bool,
};

/** A module and, beneath it, its sub-modules — the shape the real grid recurses into. */
const ModuleRow = ({ module }) => {
  const permissionClasses = usePermissionStyles();

  return (
    <Box>
      <Box className={`${permissionClasses.gridContainer} ${permissionClasses.subHeaderGrid}`}>
        <Box className={`${permissionClasses.cell} subModuleCell ${permissionClasses.parentCol}`}>
          {module.icon}
          <Typography variant="subtitle2" className={permissionClasses.moduleName}>
            {module.label}
          </Typography>
        </Box>
        {ACTIONS.map((label, index) => (
          <ActionCell key={label} action={module.actions[index]} />
        ))}
      </Box>

      {module.children?.map((child) => (
        <Box
          key={child.label}
          className={`${permissionClasses.gridContainer} ${permissionClasses.subPermissions}`}
        >
          <Box className={`${permissionClasses.subPermissionsCell} subModuleCell`}>
            <Typography variant="subtitle2" className={permissionClasses.moduleName}>
              {child.label}
            </Typography>
          </Box>
          {ACTIONS.map((label, index) => (
            <ActionCell key={label} action={child.actions[index]} />
          ))}
        </Box>
      ))}
    </Box>
  );
};

ModuleRow.propTypes = {
  module: PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    actions: PropTypes.array.isRequired,
    children: PropTypes.array,
  }).isRequired,
};

const RolesPermissionsPreview = () => {
  const classes = useRolesStyles();
  const permissionClasses = usePermissionStyles();
  const previewClasses = useStyles();

  return (
    <Box className={classes.rolesTopWrapper}>
      <Box className={classes.rolesMian}>
        <Box className={classes.rolesLeftBar}>
          {/* The same two variants the real rail asks for. `secondary` is not a variant the
              button overrides define, which is how an unselected role ends up as plain text
              beside the selected one's filled brand pill — the real screen's own doing, so it
              is repeated rather than corrected here. */}
          {ROLES.map((role, index) => (
            <Button
              key={role}
              variant={index === 0 ? 'primary' : 'secondary'}
              className={`${classes.rolesButton} ${previewClasses.inertButton}`}
            >
              {role}
            </Button>
          ))}
        </Box>

        <Box className={classes.rolesRightBar}>
          <Box className={classes.rolesButtonsBar}>
            <Box>
              <Typography variant="h4" className={classes.zoneCustomText}>
                Roles &amp; Permissions
              </Typography>
              <Typography variant="body2" className={classes.zoneDetailText}>
                Specify permissions to the specific roles
              </Typography>
            </Box>
          </Box>

          <Box className={classes.moudlesRoles}>
            <Box className={permissionClasses.moduleWrapper}>
              <Box className={`${permissionClasses.gridContainer} ${permissionClasses.headerGrid}`}>
                <Typography variant="subtitle2" className={permissionClasses.moduleCell}>
                  Modules
                </Typography>
                {ACTIONS.map((action) => (
                  <Typography
                    key={action}
                    variant="subtitle2"
                    className={permissionClasses.headerCell}
                  >
                    {action}
                  </Typography>
                ))}
              </Box>

              {/* One wrapper around every row, the way the real grid's section does, so the
                  16px gap on `moduleWrapper` falls under the header band only and the rows
                  themselves stay flush against each other. */}
              <Box>
                {MODULES.map((module) => (
                  <ModuleRow key={module.label} module={module} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RolesPermissionsPreview;
