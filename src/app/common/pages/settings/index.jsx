import CustomTabsWithPermissions from 'commonComponents/customTabsWithPermissions';
import React, { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import * as HOMODULE from 'src/app/router/constant/HOMODULE';
import * as OBXMODULE from 'src/app/router/constant/OBXMODULE';
import * as SALES from 'src/app/router/constant/SALESMODULE';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { dashboardOptions } from 'src/utils/constants';

const BreakRules = lazy(() => import('./preferences/breakRules'));
const HolidayGroups = lazy(() => import('./preferences/holidayGroups'));
const Notifications = lazy(() => import('./preferences/Notifications'));
const RolesAndPermissions = lazy(() => import('./rolesAndPermissions'));
const Runsheet = lazy(() => import('src/app/common/pages/settings/preferences/runsheet'));
const ServiceRates = lazy(() => import('src/app/common/pages/settings/preferences/serviceRates'));
const SystemDefaults = lazy(
  () => import('src/app/common/pages/settings/preferences/systemDefaults'),
);
const ThresholdValues = lazy(
  () => import('src/app/common/pages/settings/preferences/thresholdValues'),
);
const Locations = lazy(() => import('src/app/common/pages/settings/sales/locations'));
const Deals = lazy(() => import('./sales/deals'));
const CountryForm = lazy(
  () => import('src/app/homeOffice/pages/settings/countryConfigurations/components/countryForm'),
);
const Templates = lazy(() => import('src/app/homeOffice/pages/settings/templates'));

// import UserGroups from './userGroups';

const settingsTabs = (t, getLabel) => {
  const { franchiseId } = useSelector((state) => state.auth);

  return [
    {
      title: `${t('obx.settings.preferences.title')}`,
      permission: OBXMODULE.MODULE_OBX_SETTINGS_PREFERENCES,
      tabValue: 'preferences',
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
      components: [
        {
          title: `${t('obx.settings.preferences.thresholdValues.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <ThresholdValues />
            </Suspense>
          ),
          permission: OBXMODULE.MODULE_OBX_SETTINGS_THRESHOLD_VALUES,
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
          activeModule: [dashboardOptions.ops],
        },
        {
          title: `${t('obx.settings.preferences.notifications.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <Notifications />
            </Suspense>
          ),
          permission: OBXMODULE.MODULE_OBX_SETTINGS_NOTIFICATIONS,
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
          activeModule: [dashboardOptions.ops],
        },
        ...(franchiseId
          ? [
              {
                title: `${t('obx.settings.preferences.breakRules.settingTitle')}`,
                component: (
                  <Suspense fallback={null}>
                    <BreakRules />
                  </Suspense>
                ),
                permission: OBXMODULE.MODULE_OBX_SETTINGS_BREAK_RULES,
                activeModule: [dashboardOptions.ops],
                aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
              },
            ]
          : []),
        {
          title: `${t('obx.settings.preferences.systemDefault.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <SystemDefaults />
            </Suspense>
          ),
          permission: OBXMODULE.MODULE_OBX_SETTINGS_SYSTEM_DEFAULT,
          activeModule: [dashboardOptions.ops],
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
        },
        {
          title: `${t('obx.settings.preferences.extraServicesCharges.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <ServiceRates />
            </Suspense>
          ),
          permission: OBXMODULE.MODULE_OBX_SETTINGS_EXTRA_SERVICES_CHARGES,
          activeModule: [dashboardOptions.ops],
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
        },
        {
          title: `${t('obx.settings.preferences.runsheetSettings.settingTitle', { runsheet: getLabel('terms', 'runsheet', t) })}`,
          component: (
            <Suspense fallback={null}>
              <Runsheet />
            </Suspense>
          ),
          permission: OBXMODULE.MODULE_OBX_SETTINGS_RUNSHEET,
          activeModule: [dashboardOptions.ops],
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
        },
        ...(franchiseId
          ? [
              {
                title: `${t('obx.settings.preferences.holidayGroups.title')}`,
                component: (
                  <Suspense fallback={null}>
                    <HolidayGroups />
                  </Suspense>
                ),
                permission: OBXMODULE.MODULE_OBX_HOLYDAY_GROUPS,
                activeModule: [dashboardOptions.ops],
                aclPermission: OBXMODULE.ACL_OBX_SETTINGS_PREFERENCES_VIEW,
              },
            ]
          : []),
      ],
    },
    {
      title: `${t('obx.settings.reportTemplates.title')}`,
      permission: OBXMODULE.MODULE_OBX_SETTINGS_REPORT_TEMPLATES,
      tabValue: 'reportTemplates',
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_REPORT_TEMPLATES_VIEW,
      component: (
        <Suspense fallback={null}>
          <Templates />
        </Suspense>
      ),
    },

    // {
    //   title: `${t('obx.settings.userGroups.title')}`,
    //   permission: OBXMODULE.MODULE_OBX_SETTINGS_USER_GROUPS,
    //   tabValue: 'userGroups',
    //   aclPermission: OBXMODULE.ACL_OBX_SETTINGS_MAPPING_PREFERENCE_USER_GROUPS_VIEW,
    //   activeModule: [dashboardOptions.ops],
    //   component: <UserGroups />,
    // },
    {
      title: `${t('obx.settings.rolesPermissions.title')}`,
      permission: OBXMODULE.MODULE_OBX_SETTINGS_ROLES_AND_PERMISSIONS,
      tabValue: 'rolesAndPermissions',
      activeModule: [dashboardOptions.ops],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_MAPPING_PREFERENCE_ROLES_PERMISSIONS_VIEW,
      component: (
        <Suspense fallback={null}>
          <RolesAndPermissions />
        </Suspense>
      ),
    },

    // Country form HO
    {
      title: `${t('obx.settings.country.title')}`,
      tabValue: 'countryForm',
      permission: HOMODULE.MODULE_HO_COUNTRY_FORM,
      activeModule: [dashboardOptions.ops],
      component: (
        <Suspense fallback={null}>
          <CountryForm />
        </Suspense>
      ),
      forOnlyHO: !franchiseId,
    },

    {
      title: `${t('obx.settings.preferences.mappingPreferences.title')}`,
      permission: SALES.MODULE_SALES_SETTINGS,
      tabValue: 'mappingPreference',
      activeModule: [dashboardOptions.sale],
      aclPermission: OBXMODULE.ACL_OBX_SETTINGS_MAPPING_PREFERENCE_VIEW,
      components: [
        {
          title: `${t('obx.settings.preferences.mappingPreferences.locationsData.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <Locations />
            </Suspense>
          ),
          permission: SALES.MODULE_SALES_SETTINGS,
          activeModule: [dashboardOptions.sale],
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_MAPPING_PREFERENCE_LOCATIONS_DATA_VIEW,
        },
        {
          title: `${t('obx.settings.preferences.mappingPreferences.deals.settingTitle')}`,
          component: (
            <Suspense fallback={null}>
              <Deals />
            </Suspense>
          ),
          permission: SALES.MODULE_SALES_SETTINGS,
          activeModule: [dashboardOptions.sale],
          aclPermission: OBXMODULE.ACL_OBX_SETTINGS_MAPPING_PREFERENCE_DEALS_VIEW,
        },
      ],
    },
    // {
    //   title: `${t('obx.settings.activityLog.title')}`,
    //   permission: OBXMODULE.MODULE_OBX_SETTINGS_REPORT_TEMPLATES,
    //   component: <VisitorTypes />,
    // },
    // {
    //   title: `${t('obx.settings.stateRules.title')}`,
    //   permission: OBXMODULE.MODULE_OBX_SETTINGS_REPORT_TEMPLATES,
    //   component: <VisitorTypes />,
    // },
    // {
    //   title: `${t('obx.settings.skillsDesignations.title')}`,
    //   permission: OBXMODULE.MODULE_OBX_SETTINGS_REPORT_TEMPLATES,
    //   component: <VisitorTypes />,
    // },
  ];
};

const ObxSettings = () => {
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const userRole = useSelector((state) => state.auth.userRole);

  const tabs = settingsTabs(t, getLabel)?.filter((tab) => {
    if (
      !['franchise_owner', 'home_officer'].includes(userRole?.slug) &&
      tab?.tabValue === 'reportTemplates'
    ) {
      return false;
    }
    return true;
  });
  return <CustomTabsWithPermissions data={tabs} defaultTab={0} />;
};

export default ObxSettings;
