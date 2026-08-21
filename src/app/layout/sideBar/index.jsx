import {
  Badge,
  Box,
  Button,
  List,
  ListItem,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ReactComponent as ReleaseIcon } from 'assets/svg/release.svg?react';
// import Tab from '@mui/material/Tab';
// import Tabs from '@mui/material/Tabs';
import { ReactComponent as MinimizeDrawerIcon } from 'assetsComponents/images/minimizeSideBar.svg?react';
// import { ReactComponent as SignalLogo } from 'assetsComponents/images/signalLogoShort.svg';
// import { ReactComponent as SignalLogoWithText } from 'assetsComponents/images/signlaLogoFull.svg';
import classNames from 'classnames';
// import ToggleModule from 'commonComponents/ToggleModule';
import userHasPermissionSideBar from 'globalUtils/auth/userHasPermissionSideBar';
import PropTypes from 'prop-types';
import React, { Children, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import * as HOMODULE from 'routerComponent/constant/HOMODULE';
import * as OBXMODULE from 'routerComponent/constant/OBXMODULE';
import * as ROUTE from 'routerComponent/constant/ROUTE';
import * as SALESMODULE from 'routerComponent/constant/SALESMODULE';
import {
  DEMO_TENANT_OPTIONS,
  isLocalDemo,
  mainDomain,
  setDemoTenant,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { dashboardOptions } from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';
import { getReleaseNotificationAllowedUserIds } from 'src/utils/releaseNotificationAllowedUsers';

import {
  Analytics,
  AttendanceIcon,
  CompanyIcon,
  ContactIcon,
  DashboardIcon,
  DealsIcon,
  Dispatch,
  FranchiseIcon,
  IndustryVerticalsIcon,
  Invoices,
  LeaderBoardIcon,
  LocationIconSideBar,
  LucidUsertIcon,
  MapIcon,
  NotificationIcon,
  PayrollIcon,
  Report,
  Runsheet,
  Schedules,
  ScoutingIcon,
  SettingIcon,
  Sites,
  VehiclesIcon,
  Zones,
} from '../../../assets/svg/index';
import { setDashboardActive } from '../../../redux/store/slices/auth';
import { rolesEnumWithName } from '../../../utils/constants/index';
import { useStyles } from './sideBar';
import { useSidebarInset } from './sidebarChrome';

// const SALES_TOGGLE = process.env.REACT_APP_SALES_TOGGLE;

const Sidebar = ({
  toggleSidebar,
  isCollapsed,
  isSidebarTransformed,
  // transformSidebar,
  className,
}) => {
  const classes = useStyles();
  /* The sidebar states its own width, live, for the full-screen surfaces that have to
     begin where it ends. See `sidebarChrome`. */
  const sidebarRef = useRef(null);
  useSidebarInset(sidebarRef);
  const isMobile = useMediaQuery('(max-width:786px)');
  const { t } = useTranslation();
  const ActiveDashboard = useSelector((state) => state.auth.dashboardActive);
  const userRole = useSelector((state) => state.auth.userRole);
  const franchiseId = useSelector((state) => state?.auth?.franchiseId);
  const userInfo = useSelector((state) => state?.user?.info);
  const dispatch = useDispatch();
  const history = useHistory();
  const { pathname } = useLocation();
  const [value, setValue] = useState(ActiveDashboard === dashboardOptions.ops ? 0 : 1);

  const tenantInfo = useSelector((state) => state.auth?.tenantInfo);
  const tenantBranding = MULTI_TENANT_AUTH[mainDomain()];
  const activeDemoTenant = mainDomain();
  const { getLabel } = useTenantLabel();

  // On mobile, when sidebar is visible (isCollapsed = true), it should be expanded
  // On desktop, isCollapsed controls expanded/compressed state
  const shouldShowExpanded = isCollapsed;
  const tenantLogo = shouldShowExpanded
    ? tenantBranding?.images?.logo1 ||
      tenantBranding?.logo ||
      tenantInfo?.images?.logo1 ||
      tenantInfo?.logo
    : tenantBranding?.images?.logoShort ||
      tenantBranding?.logoShort ||
      tenantBranding?.logo ||
      tenantInfo?.images?.logoShort ||
      tenantInfo?.logoShort ||
      tenantInfo?.images?.logo1 ||
      tenantInfo?.logo;
  const _handleChange = (_event, _newValue) => {
    const valueChange = value == 0 ? 1 : 0;

    const setDashValue =
      ActiveDashboard === dashboardOptions.ops ? dashboardOptions.ops : dashboardOptions.ops;
    if (dashboardOptions.ops != setDashValue) {
      history.push(ROUTE.SALES_DASHBOARD);
    } else {
      history.push(ROUTE.HO_FRANCHISE_LISTING);
    }
    dispatch(setDashboardActive(setDashValue));
    setValue(valueChange);
  };
  const sidebarItems = [
    // Home Office Sales Routes
    {
      title: `${t('sideNavBar.linkText.hoDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.HO_DASHBOARD,
      permission: HOMODULE.MODULE_HO_DASHBOARD,
      activeModule: [dashboardOptions.ops],
      aclPermission: HOMODULE.ACL_HO_DASHBOARD_VIEW,
    },

    // franchises
    {
      title: `${t('sideNavBar.linkText.franchises')}`,
      icon: <FranchiseIcon />,
      iconActive: <FranchiseIcon />,
      iconActiveCollapsed: <FranchiseIcon />,
      path: ROUTE.HO_FRANCHISE_LISTING,
      permission: HOMODULE.MODULE_HO_FRANCHISE_LISTING,
      activeModule: [dashboardOptions.ops],
      hideIfHasFranchiseId: true,
      aclPermission: HOMODULE.ACL_HO_FRANCHISE_LISTING_VIEW,
    },

    // Dashboard OBX Routes
    {
      title: `${t('sideNavBar.linkText.obxDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.OBX_DASHBOARD,
      permission: OBXMODULE.MODULE_OBX_DASHBOARD,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_DASHBOARD_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.franchiseMap')}`,
      icon: <MapIcon color="#ACACAE" />,
      iconActive: <MapIcon color="#64CC64" />,
      iconActiveCollapsed: <MapIcon color="#64CC64" />,
      path: ROUTE.HO_VIEW_SIGNAL_MAP,
      permission: HOMODULE.MODULE_HO_VIEW_FRANCHISE_MAP,
      activeModule: ['OPS'],
      hideIfHasFranchiseId: true,
      aclPermission: HOMODULE.ACL_HO_FRANCHISE_MAP_VIEW,
    },
    // zones Routes
    {
      title: `${t('sideNavBar.linkText.zones')}`,
      icon: <Zones />,
      iconActive: <Zones />,
      iconActiveCollapsed: <Zones />,
      path: ROUTE.OBX_ZONES,
      permission: OBXMODULE.MODULE_OBX_ZONES,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_ZONES_VIEW,
      showIfHasFranchiseId: true,
    },

    // sites Routes
    {
      title: `${t('sideNavBar.linkText.sites')}`,
      icon: <Sites />,
      iconActive: <Sites />,
      iconActiveCollapsed: <Sites />,
      path: ROUTE.OBX_SITES,
      permission: OBXMODULE.MODULE_OBX_SITES,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SITES_VIEW,
      showIfHasFranchiseId: true,
    },

    // Location Tracker Route
    {
      title: `${t('sideNavBar.linkText.franchiseMap')}`,
      icon: <MapIcon />,
      iconActive: <MapIcon />,
      iconActiveCollapsed: <MapIcon />,
      path: ROUTE.OBX_FRANCHISE_MAP,
      permission: OBXMODULE.MODULE_OBX_FRANCHISE_MAP,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_FRANCHISE_MAP_VIEW,
      showIfHasFranchiseId: true,
    },

    // schedules Routes
    {
      title: `${t('sideNavBar.linkText.schedules')}`,
      icon: <Schedules />,
      iconActive: <Schedules />,
      iconActiveCollapsed: <Schedules />,
      path: ROUTE.OBX_SCHEDULES,
      permission: OBXMODULE.MODULE_OBX_SCHEDULE,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SCHEDULES_VIEW,
      showIfHasFranchiseId: true,
    },
    // runSheets Routes
    {
      title: getLabel('terms', 'runsheets', t),
      icon: <Runsheet />,
      iconActive: <Runsheet />,
      iconActiveCollapsed: <Runsheet />,
      path: ROUTE.OBX_RUNSHEET,
      permission: OBXMODULE.MODULE_OBX_RUNSHEET,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_RUNSHEET_VIEW,
      showIfHasFranchiseId: true,
    },

    // Dispatch Routes
    {
      title: getLabel('terms', 'dispatch', t),
      icon: <Dispatch />,
      iconActive: <Dispatch />,
      iconActiveCollapsed: <Dispatch />,
      path: ROUTE.OBX_DISPATCH,
      permission: OBXMODULE.MODULE_OBX_DISPATCH,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_DISPATCH_VIEW,
    },

    // reports Routes
    {
      title: `${t('sideNavBar.linkText.reports')}`,
      icon: <Report />,
      iconActive: <Report />,
      iconActiveCollapsed: <Report />,
      path: ROUTE.OBX_REPORTS,
      permission: OBXMODULE.MODULE_OBX_REPORTS,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SHIFT_REPORTS_VIEW,
      showIfHasFranchiseId: true,
    },
    // users Routes //added with ternary below
    // {
    //   title: `${t('sideNavBar.linkText.users')}`,
    //   icon: <LucidUsertIcon />,
    //   iconActive: <LucidUsertIcon />,
    //   iconActiveCollapsed: <LucidUsertIcon />,
    //   path: ROUTE.OBX_USER,
    //   permission: OBXMODULE.MODULE_OBX_USERS,
    //   activeModule: [dashboardOptions.ops],
    //   aclPermission: OBXMODULE.ACL_OBX_USERS_VIEW,
    // },

    // attendance Routes
    {
      title: `${t('sideNavBar.linkText.leaveRequest')}`,
      icon: <AttendanceIcon />,
      iconActive: <AttendanceIcon />,
      iconActiveCollapsed: <AttendanceIcon />,
      path: ROUTE.OBX_ATTENDANCE,
      permission: OBXMODULE.MODULE_OBX_ATTENDANCE,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_LEAVE_REQUEST_VIEW,
      showIfHasFranchiseId: true,
    },
    // OBX Payroll
    {
      title: `${t('sideNavBar.linkText.payroll')}`,
      icon: <PayrollIcon />,
      iconActive: <PayrollIcon />,
      iconActiveCollapsed: <PayrollIcon />,
      path: ROUTE.OBX_PAYROLL,
      permission: OBXMODULE.MODULE_OBX_PAYROLL,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_PAYROLL_VIEW,
      showIfHasFranchiseId: true,
    },
    // invoices Routes
    {
      title: `${t('sideNavBar.linkText.invoices')}`,
      icon: <Invoices />,
      iconActive: <Invoices />,
      iconActiveCollapsed: <Invoices />,
      path: ROUTE.OBX_INVOICES,
      permission: OBXMODULE.MODULE_OBX_INVOICES,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_INVOICES_VIEW,
      showIfHasFranchiseId: true,
    },
    // ho users Routes
    {
      title: `${t('sideNavBar.linkText.users')}`,
      icon: <LucidUsertIcon />,
      iconActive: <LucidUsertIcon />,
      iconActiveCollapsed: <LucidUsertIcon />,
      path:
        userRole?.slug === rolesEnumWithName.home_officer.slug ? ROUTE?.HO_USER : ROUTE.OBX_USER,

      permission:
        userRole?.slug === rolesEnumWithName.home_officer.slug
          ? HOMODULE.MODULE_HO_USERS
          : OBXMODULE.MODULE_OBX_USERS,
      activeModule:
        userRole?.slug === rolesEnumWithName.home_officer.slug
          ? [dashboardOptions.ops]
          : [dashboardOptions.ops],
      aclPermission:
        userRole?.slug === rolesEnumWithName.home_officer.slug
          ? HOMODULE.ACL_HO_USERS_VIEW
          : OBXMODULE.ACL_OBX_USERS_VIEW,
    },
    // analytics Routes
    {
      title: `${t('sideNavBar.linkText.analytics')}`,
      icon: <Analytics />,
      iconActive: <Analytics />,
      iconActiveCollapsed: <Analytics />,
      path: ROUTE.OBX_ANALYTICS,
      permission: OBXMODULE.MODULE_OBX_ANALYTICS,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_ANALYTICS_VIEW,
      showIfHasFranchiseId: true,
    },
    // leaderBoard Routes
    {
      title: `${t('sideNavBar.linkText.leaderBoard')}`,
      icon: <LeaderBoardIcon />,
      iconActive: <LeaderBoardIcon />,
      iconActiveCollapsed: <LeaderBoardIcon />,
      path: ROUTE.OBX_LEADERBOARD,
      permission: OBXMODULE.MODULE_OBX_LEADERBOARD,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_LEADERBOARD_VIEW,
      showIfHasFranchiseId: true,
    },
    // // devices Routes
    // {
    //   title: `${t('sideNavBar.linkText.devices')}`,
    //   icon: <Devices />,
    //   iconActive: <Devices />,
    //   iconActiveCollapsed: <Devices />,
    //   path: ROUTE.OBX_DEVICES,
    //   permission: OBXMODULE.MODULE_OBX_DEVICES,
    //   activeModule: [dashboardOptions.ops],
    //   aclPermission: OBXMODULE.ACL_OBX_DEVICES_VIEW,
    // },
    // vehicles Routes
    {
      title: `${t('sideNavBar.linkText.vehicles')}`,
      icon: <VehiclesIcon />,
      iconActive: <VehiclesIcon />,
      iconActiveCollapsed: <VehiclesIcon />,
      path: ROUTE.OBX_VEHICLES,
      permission: OBXMODULE.MODULE_OBX_VEHICLES,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_VEHICLES_VIEW,
      showIfHasFranchiseId: true,
    },
    {
      title: 'Release Notification',
      icon: <NotificationIcon />,
      iconActive: <NotificationIcon />,
      iconActiveCollapsed: <NotificationIcon />,
      path: ROUTE.RELEASE_NOTIFICATIONS,
      permission: OBXMODULE.MODULE_OBX_settings,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_VIEW,
      releaseNotificationAllowedUserIdsOnly: true,
    },
    // OBX setting Routes
    {
      title: `${t('sideNavBar.linkText.obxSetting')}`,
      icon: <SettingIcon />,
      iconActive: <SettingIcon />,
      iconActiveCollapsed: <SettingIcon />,
      path: ROUTE.COMMON_SETTING_PREFERENCES,
      permission: OBXMODULE.MODULE_OBX_settings,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.designSystem')}`,
      icon: <SettingIcon />,
      iconActive: <SettingIcon />,
      iconActiveCollapsed: <SettingIcon />,
      path: ROUTE.DESIGN_SYSTEM,
      permission: OBXMODULE.MODULE_OBX_settings,
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_VIEW,
    },

    // Ho setting Routes
    // {
    //   title: `${t('sideNavBar.linkText.hoSetting')}`,
    //   icon: <SettingIcon />,
    //   iconActive: <SettingIcon />,
    //   iconActiveCollapsed: <SettingIcon />,
    //   path: ROUTE.HO_SETTINGS,
    //   permission: HOMODULE.MODULE_HO_SETTINGS,
    //   activeModule: [dashboardOptions.ops],
    // },

    // SALES Routes Dashboard
    {
      title: `${t('sideNavBar.linkText.obxDashboard')}`,
      icon: <DashboardIcon />,
      iconActive: <DashboardIcon />,
      iconActiveCollapsed: <DashboardIcon />,
      path: ROUTE.SALES_DASHBOARD,
      permission: SALESMODULE.MODULE_SALES_DASHBOARD,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_DASHBOARD_VIEW,
    },

    // SALES Company
    {
      title: `${t('sideNavBar.linkText.companies')}`,
      icon: <CompanyIcon />,
      iconActive: <CompanyIcon />,
      iconActiveCollapsed: <CompanyIcon />,
      path: ROUTE.SALES_COMPANIES,
      permission: SALESMODULE.MODULE_COMPANIES_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_COMPANIES_VIEW,
    },

    // SALES Location
    {
      title: `${t('sideNavBar.linkText.locations')}`,
      icon: <LocationIconSideBar />,
      iconActive: <LocationIconSideBar />,
      iconActiveCollapsed: <LocationIconSideBar />,
      path: ROUTE.SALES_LOCATIONS,
      permission: SALESMODULE.MODULE_LOCATIONS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_LOCATIONS_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.deals')}`,
      icon: <DealsIcon />,
      iconActive: <DealsIcon />,
      iconActiveCollapsed: <DealsIcon />,
      path: ROUTE.SALES_DEALS,
      permission: SALESMODULE.MODULE_DEALS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_DEALS_VIEW,
    },

    // SALES Contacts
    {
      title: `${t('sideNavBar.linkText.contacts')}`,
      icon: <ContactIcon />,
      iconActive: <ContactIcon />,
      iconActiveCollapsed: <ContactIcon />,
      path: ROUTE.SALES_CONTACTS,
      permission: SALESMODULE.MODULE_CONTACTS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_CONTACTS_VIEW,
    },
    {
      title: `${t('sideNavBar.linkText.leadsMap')}`,
      icon: <MapIcon />,
      iconActive: <MapIcon />,
      iconActiveCollapsed: <MapIcon />,
      path: ROUTE.SALES_LEADS_MAP,
      permission: SALESMODULE.MODULE_LEADS_MAP,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_LEADS_MAP_VIEW,
    },

    // Sales Industry Verticals
    {
      title: `${t('sideNavBar.linkText.industryVerticals')}`,
      icon: <IndustryVerticalsIcon />,
      iconActive: <IndustryVerticalsIcon />,
      iconActiveCollapsed: <IndustryVerticalsIcon />,
      path: ROUTE.SALES_INDUSTRY_VERTICALS,
      permission: SALESMODULE.MODULE_INDUSTRY_VERTICALS_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_INDUSTRY_VERTICALS,
    },
    // SALES Scouting
    {
      title: `${t('sideNavBar.linkText.scoutingRoutes')}`,
      icon: <ScoutingIcon />,
      iconActive: <ScoutingIcon />,
      iconActiveCollapsed: <ScoutingIcon />,
      path: ROUTE.SALES_SCOUTING,
      permission: SALESMODULE.MODULE_SCOUTING_LISTING,
      activeModule: [dashboardOptions.sale],
      aclPermission: SALESMODULE.ACL_SALES_SCOUTING_VIEW,
    },

    // SALES Settings
    // {
    //   title: `${t('sideNavBar.linkText.settings')}`,
    //   icon: <SettingIcon />,
    //   iconActive: <SettingIcon />,
    //   iconActiveCollapsed: <SettingIcon />,
    //   path: ROUTE.COMMON_SETTING_MAPPING_PREFERENCE,
    //   permission: SALESMODULE.MODULE_SALES_SETTINGS,
    //   activeModule: [dashboardOptions.sale],
    //   aclPermission: SALESMODULE.ACL_SALES_SETTINGS_VIEW,
    // }, // franchiseMap Routes
    // Sales Users
    // {
    //   title: `${t('sideNavBar.linkText.users')}`,
    //   icon: <LucidUsertIcon />,
    //   iconActive: <LucidUsertIcon />,
    //   iconActiveCollapsed: <LucidUsertIcon />,
    //   path: ROUTE.SALES_USERS,
    //   permission: SALESMODULE.MODULE_USERS_LISTING,
    //   activeModule: [dashboardOptions.sale],
    //   aclPermission: SALESMODULE.ACL_SALES_USERS_VIEW,
    // },
  ];

  // Modify this check accordingly when operation's dashboard is being added
  const _getDashboardLink = (role) => {
    if (role === rolesEnumWithName.home_officer.slug) {
      return ROUTE.SALES_DASHBOARD;
    }
    return ROUTE.OBX_DASHBOARD;
  };

  return (
    <>
      {isMobile && isCollapsed && (
        <Box className={classes.backdropOverlay} onClick={toggleSidebar}></Box>
      )}
      <Box
        ref={sidebarRef}
        className={classNames(
          classes.sidebarOverlay,
          className,
          !isCollapsed && classes.compressBar,
          isMobile && isCollapsed && classes.sidebarOverlayMobileOpen,
        )}
      >
        {/* this is to close the Sidebar */}
        <Box
          className={classNames(
            classes.toggleSidebarButton,
            isCollapsed && classes.toggleBtnRotated,
          )}
          onClick={toggleSidebar}
        >
          <MinimizeDrawerIcon />
        </Box>
        <Box
          className={`${classes.sidebarWrapper} ${shouldShowExpanded && classes.sidebarWapperCollapsed} ${
            isSidebarTransformed ? 'transformed' : ''
          }`}
        >
          <Box
            className={classNames(
              !isCollapsed && classes.signalLogoShortIconWrapper,
              isCollapsed && classes.signalLogoWithTextIconWrapper,
            )}
          >
            {shouldShowExpanded ? (
              <img src={tenantLogo} alt="Tenant logo" className={classes.signalLogoWithTextIcon} />
            ) : (
              <img src={tenantLogo} alt="Tenant logo" className={classes.signalLogoShortIcon} />
            )}
          </Box>

          {/* also hide if SALES_TOGGLE is true */}
          {/*{userRole?.slug === rolesEnumWithName.home_officer.slug && SALES_TOGGLE == 'true' ? (*/}
          {/*  <>*/}
          {/*    {!isCollapsed ? (*/}
          {/*      <Box className={classes.toggleBtnMain} onClick={handleChange}>*/}
          {/*        <ToggleModule moduleName={ActiveDashboard} />*/}
          {/*      </Box>*/}
          {/*    ) : (*/}
          {/*      <Tabs*/}
          {/*        value={value}*/}
          {/*        onChange={handleChange}*/}
          {/*        aria-label=""*/}
          {/*        className={classes.tabsSidebar}*/}
          {/*      >*/}
          {/*        <Tab*/}
          {/*          label={t('sideNavBar.linkText.operations')}*/}
          {/*          className={classes.tabStandAlone}*/}
          {/*          sx={{*/}
          {/*            borderRadius: '6px 0px 0px 6px',*/}
          {/*          }}*/}
          {/*        />*/}
          {/*        <Tab*/}
          {/*          label={t('sideNavBar.linkText.sales')}*/}
          {/*          className={classes.tabStandAlone}*/}
          {/*          sx={{*/}
          {/*            borderRadius: '0px 6px 6px 0px',*/}
          {/*          }}*/}
          {/*        />*/}
          {/*      </Tabs>*/}
          {/*    )}*/}
          {/*  </>*/}
          {/*) : null}*/}

          <Box
            className={classNames(
              !shouldShowExpanded && classes.linksWrapperCollapsed,
              shouldShowExpanded && classes.linksWrapperExpended,
            )}
          >
            <List
              className={classNames(
                !shouldShowExpanded && classes.linksListCompressed,
                shouldShowExpanded && classes.linksListExpended,
              )}
            >
              {Children.toArray(
                sidebarItems
                  // filter links for which user has permission to access
                  .filter((link) => {
                    if (!('aclPermission' in link)) return false;
                    if (link?.hideIfHasFranchiseId && franchiseId) return false;
                    const hasAcl = link?.showIfHasFranchiseId
                      ? franchiseId
                        ? userHasPermissionSideBar(
                            link.permission,
                            link.activeModule,
                            link?.aclPermission,
                          )
                        : false
                      : userHasPermissionSideBar(
                          link.permission,
                          link.activeModule,
                          link?.aclPermission,
                        );
                    if (!hasAcl) return false;
                    if (link.releaseNotificationAllowedUserIdsOnly) {
                      const uid = userInfo?.id?.toString();
                      if (!uid || !getReleaseNotificationAllowedUserIds().includes(uid)) {
                        return false;
                      }
                    }
                    return true;
                  })
                  .map((item) => {
                    let navIcon = item.icon;
                    if (pathname.startsWith(item.path)) {
                      navIcon = item.iconActive;
                    }
                    if (shouldShowExpanded && pathname.startsWith(item.path)) {
                      navIcon = item.iconActiveCollapsed;
                    }

                    return !shouldShowExpanded ? (
                      <Tooltip
                        classes={classes.customTooltip}
                        title={item.title}
                        placement="right"
                        arrow
                      >
                        <ListItem
                          className={classNames(classes.linkListItemCollapsed, {
                            active: pathname.startsWith(item.path),
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMobile) {
                              toggleSidebar();
                            }
                          }}
                        >
                          <Link to={item.path} className={classes.listLinkCollapsed}>
                            {navIcon}
                          </Link>
                        </ListItem>
                      </Tooltip>
                    ) : (
                      <ListItem
                        className={classNames(classes.linkListItemExpended, {
                          active: pathname.startsWith(item.path),
                        })}
                        onClick={() => {
                          if (isMobile) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <Link to={item.path} underline="none" className={classes.listLinkExpanded}>
                          {navIcon}
                          <Typography className={classes.linkText} component="span">
                            {item.title}
                          </Typography>
                        </Link>
                      </ListItem>
                    );
                  }),
              )}
            </List>
          </Box>

          <Box
            className={classNames(
              classes.sidebarFooter,
              isCollapsed && classes.sidebarFooterExpanded,
              classes.sidebarFooterRelease,
              !isCollapsed && classes.sidebarFooterCompressed,
              isLocalDemo() && classes.sidebarFooterSticky,
            )}
          >
            {isLocalDemo() && (
              <Box
                className={classNames(
                  classes.demoTenantSwitcher,
                  !shouldShowExpanded && classes.demoTenantSwitcherCompact,
                )}
              >
                {DEMO_TENANT_OPTIONS.map((option) => (
                  <Tooltip
                    key={option.value}
                    title={shouldShowExpanded ? '' : `Switch to ${option.label}`}
                    placement="right"
                  >
                    <Button
                      size="small"
                      variant={activeDemoTenant === option.value ? 'contained' : 'outlined'}
                      onClick={() => {
                        if (activeDemoTenant !== option.value) {
                          setDemoTenant(option.value);
                        }
                      }}
                    >
                      {shouldShowExpanded ? option.label : option.shortLabel}
                    </Button>
                  </Tooltip>
                ))}
              </Box>
            )}
            <Badge badgeContent="New" color="secondary" className={classes.badge}>
              <Button variant="primary" color="primary" component={Link} to={ROUTE.OBX_RELEASE}>
                <ReleaseIcon />
              </Button>
            </Badge>
          </Box>
        </Box>
      </Box>
    </>
  );
};

Sidebar.propTypes = {
  toggleSidebar: PropTypes.func,
  isCollapsed: PropTypes.bool,
  isSidebarTransformed: PropTypes.bool,
  transformSidebar: PropTypes.func,
  className: PropTypes.string, // Adjust the type accordingly based on your use case
};

export default Sidebar;
