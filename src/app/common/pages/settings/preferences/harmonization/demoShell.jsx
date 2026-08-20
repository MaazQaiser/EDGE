/**
 * The app shell around the Harmonization preview — left rail, header, and the settings
 * panel between them.
 *
 * It is drawn rather than mounted. `layout/appMain` wants a signed-in user, a franchise
 * list and a tenant: the real sidebar filters every item through the ACL in the store
 * and renders nothing without one, the real franchise picker fetches its list on mount,
 * and the account menu reads a user that does not exist here. What that shell is worth
 * to this preview is the frame it puts around a settings screen, and a frame can be
 * drawn honestly.
 *
 * What is borrowed rather than reinvented: the nav icons and the Filter Go wordmark are
 * the app's own assets, and the geometry is lifted from `sideBar.js` and `navBar.jsx`
 * (see `demoShell.styles.js`). Nothing in the rail navigates — every destination needs
 * the session this page does not have — so it carries tooltips instead of links.
 *
 * Delete with `demo.jsx` and its route once the ACL payload is fixed.
 */
import { Avatar, Box, Chip, Tooltip, Typography } from '@mui/material';
import { ReactComponent as ChevronDownIcon } from 'assets/svg/chevron-down.svg?react';
import { ReactComponent as NotificationsIcon } from 'assets/svg/notifications.svg?react';
import { ReactComponent as MinimizeRailIcon } from 'assetsComponents/images/minimizeSideBar.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Invoices,
  LucidUsertIcon,
  MapIcon,
  Report,
  Runsheet,
  Schedules,
  SettingIcon,
  Sites,
  VehiclesIcon,
  Zones,
} from 'src/assets/svg';
import { FILTER_GO_TENANT } from 'src/theme';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import { useStyles } from './demoShell.styles';

/* The tenant's own registered wordmark, read the way the real sidebar reads it, rather
   than a second import of the same file that could be pointed somewhere else later. */
const filterGoLogo = MULTI_TENANT_AUTH[FILTER_GO_TENANT]?.images?.logo1;

/**
 * What a Filter Go franchise owner actually sees, in the order the real sidebar builds
 * it. "Routes" rather than "Runsheets" because that is the tenant's own word for it
 * (`tenantConfigs.labels.terms`), which this page cannot look up without a session.
 */
const NAV_ITEMS = [
  { key: 'zones', label: 'Zones', icon: <Zones /> },
  { key: 'sites', label: 'Sites', icon: <Sites /> },
  { key: 'map', label: 'Location Tracker', icon: <MapIcon /> },
  { key: 'schedule', label: 'Schedule', icon: <Schedules /> },
  { key: 'routes', label: 'Routes', icon: <Runsheet /> },
  { key: 'reports', label: 'Shift Reports', icon: <Report /> },
  { key: 'invoices', label: 'Invoices', icon: <Invoices /> },
  { key: 'users', label: 'Users', icon: <LucidUsertIcon /> },
  { key: 'vehicles', label: 'Vehicles', icon: <VehiclesIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingIcon />, active: true },
];

const DemoShell = ({ franchiseId, franchiseName, userName, userRole, children }) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

  return (
    <Box className={classes.shell}>
      <Box className={classNames(classes.rail, expanded && classes.railExpanded)}>
        <button
          type="button"
          className={classNames(classes.railToggle, expanded && classes.railToggleFlipped)}
          onClick={() => setExpanded((previous) => !previous)}
          aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
        >
          <MinimizeRailIcon />
        </button>

        <Box className={classes.railBody}>
          <Box className={classNames(classes.logoBox, expanded && classes.logoBoxExpanded)}>
            <img
              src={filterGoLogo}
              alt="Filter Go"
              className={expanded ? classes.logoExpanded : classes.logo}
            />
          </Box>

          <Box className={classNames(classes.navList, !expanded && classes.navListCollapsed)}>
            {NAV_ITEMS.map((item) => {
              const row = (
                <Box
                  key={item.key}
                  className={classNames(
                    classes.navItem,
                    expanded ? classes.navItemExpanded : classes.navItemCollapsed,
                    item.active && classes.navItemActive,
                  )}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.icon}
                  {expanded && (
                    <Typography className={classes.navLabel} component="span">
                      {item.label}
                    </Typography>
                  )}
                </Box>
              );

              /* A tooltip on a labelled row would only repeat the label beside it. */
              return expanded ? (
                row
              ) : (
                <Tooltip key={item.key} title={item.label} placement="right" arrow>
                  {row}
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box className={classes.main}>
        <Box className={classes.header}>
          <Box className={classes.crumb}>
            <Box className={classes.crumbIcon}>
              <SettingIcon />
            </Box>
            <Typography variant="body2" className={classes.crumbText}>
              Settings
            </Typography>
          </Box>

          <Box className={classes.headerActions}>
            <Chip label={`ID: ${franchiseId}`} size="small" color="primary" />

            <Box className={classes.franchise}>
              <Typography variant="body2" className={classes.franchiseText}>
                {franchiseName}
              </Typography>
              <Box className={classes.chevron}>
                <ChevronDownIcon />
              </Box>
            </Box>

            <Box className={classes.bell}>
              <NotificationsIcon />
            </Box>

            <Box className={classes.account}>
              <Avatar className={classes.avatar}>{initials}</Avatar>
              <Box>
                <Typography variant="body2" className={classes.accountName}>
                  {userName}
                </Typography>
                <Typography variant="body2" className={classes.accountRole} component="p">
                  {userRole}
                </Typography>
              </Box>
              <Box className={classes.chevron}>
                <ChevronDownIcon />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className={classes.content}>{children}</Box>
      </Box>
    </Box>
  );
};

DemoShell.propTypes = {
  franchiseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  franchiseName: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default DemoShell;
