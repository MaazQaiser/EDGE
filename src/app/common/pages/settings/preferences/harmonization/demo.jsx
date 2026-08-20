/**
 * DEMO — Harmonization shown in its home: the Filter Go app shell, the Settings tab
 * strip, the vertical list that holds it, and the screen itself in the panel.
 *
 * It exists because a session whose ACL grants `settings.view` but none of the tab-level
 * children (`settings.preferences.view`, `settings.mappingPreference.rolesPermissions.view`)
 * renders Settings with no tabs at all. That is a permissions payload problem, not a UI
 * one, so this stands in until it is sorted.
 *
 * Real, so neither the navigation nor the screen can drift from production: the tab
 * chrome is `CustomTabsWithPermissions` and the panel is `Harmonization`. Drawn, because
 * it needs a session it does not have: the app shell around them — see `demoShell.jsx`.
 *
 * Also not real is the Roles & Permissions panel. That component fetches its roles on
 * mount and, with no session, falls into its loading state and renders `LoaderComponent`,
 * whose Lottie animation throws `Cannot add property completed, object is not extensible`
 * against a frozen JSON import. There is no error boundary above it, so that one
 * component blanks the entire page. A placeholder stands in its place rather than a crash.
 *
 * Delete this file, `demoShell.*` and the route in `base.route.jsx` once the ACL is fixed.
 */
import { ThemeProvider } from '@mui/material';
import React, { Suspense, useMemo } from 'react';
import CustomTabsWithPermissions from 'src/app/components/common/customTabsWithPermissions';
import { createTenantTheme, FILTER_GO_TENANT } from 'src/theme';

import DemoShell from './demoShell';
import Harmonization from './index';
import ReportTemplatesPreview from './reportTemplatesPreview';
import RolesPermissionsPreview from './rolesPermissionsPreview';

/** The path this preview lives on, so the tab strip navigates within it. */
const DEMO_PATH = '/harmonization';

/**
 * The same shape `settings/index.jsx` registers, so the strip reads the way it will in
 * Settings — Harmonization is a tab of its own, not a vertical item nested under Roles &
 * Permissions. `permission` / `aclPermission` are omitted deliberately: `bypassPermissions`
 * skips the filter entirely, and carrying dead gate values here would only invite someone
 * to keep them in step with the real registration.
 */
const demoTabs = [
  {
    title: 'Report Templates',
    tabValue: 'reportTemplates',
    component: <ReportTemplatesPreview />,
  },
  {
    title: 'Roles & Permissions',
    tabValue: 'rolesAndPermissions',
    component: <RolesPermissionsPreview />,
  },
  {
    title: 'Harmonization',
    tabValue: 'harmonization',
    component: (
      <Suspense fallback={null}>
        <Harmonization />
      </Suspense>
    ),
  },
];

const HarmonizationDemo = () => {
  /* Pinned to Filter Go rather than left to `mainDomain()`. The demo tenant is a
     localStorage value the app's own switcher writes, so a browser that has never
     touched it renders this green-branded screen in Signal blue — which is the one
     thing about the preview nobody would think to doubt. */
  const theme = useMemo(() => createTenantTheme(FILTER_GO_TENANT), []);

  return (
    <ThemeProvider theme={theme}>
      <DemoShell
        franchiseId={329}
        franchiseName="2005181 QA FilterGo"
        userName="Muhammad Nabil"
        userRole="Franchise Owner"
      >
        <CustomTabsWithPermissions
          data={demoTabs}
          defaultTab={2}
          basePath={DEMO_PATH}
          bypassPermissions
        />
      </DemoShell>
    </ThemeProvider>
  );
};

export default HarmonizationDemo;
