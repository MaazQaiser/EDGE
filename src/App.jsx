import './global.scss';

import { ClickAnalyticsPlugin } from '@microsoft/applicationinsights-clickanalytics-js';
import {
  AppInsightsErrorBoundary,
  ReactPlugin,
  withAITracking,
} from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import React, { Suspense, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { PersistGate } from 'redux-persist/integration/react';
import { fetchTenantLabelsCall, getUserData } from 'services/auth.services';
import TenantThemeProvider from 'src/app/components/common/tenantThemeProvider';
import history from 'src/app/router/utils/history';
import { generateAzureStorageBlobToken, isAzureTokenExpired } from 'src/helper/utilityFunctions';
import { setSaasToken, setTenantPermissions } from 'src/redux/store/slices/auth';
import { setTenantLabels, TENANT_LABELS_VERSION } from 'src/redux/store/slices/tenantConfigs';
import { appInsightUserAgent, enumUserRolesTokenApi } from 'src/utils/constants';

import NoServer from './app/public/pages/noServer';
import getRouteConfigs from './app/router/config/base.route';
import generateRoutesFromConfig from './app/router/utils/generateRoutesFromConfig';
import {
  isLocalDemo,
  isObjectEmpty,
  mainDomain,
  mergeTenantBranding,
} from './helper/utilityFunctions';
import store, { persistor } from './redux/store/index';
import { setTenantInfo } from './redux/store/slices/auth';

const browserHistory = createBrowserHistory({ basename: window.location.origin });

let clickPluginInstance = new ClickAnalyticsPlugin();
let clickPluginConfig = {
  autoCapture: true,
};

const reactPlugin = new ReactPlugin();
const appInsightsKey = process.env.REACT_APP_INSIGHTS;
const hasAppInsights = Boolean(appInsightsKey && appInsightsKey.trim());

if (hasAppInsights) {
  const appInsights = new ApplicationInsights({
    config: {
      connectionString: `instrumentationKey=${appInsightsKey}`,
      enableAutoRouteTracking: true,
      disableAjaxTracking: false,
      autoTrackPageVisitTime: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      correlationHeaderExcludedDomains: [
        '*.auth0.com',
        '*.googleapis.com',
        '*.blob.core.windows.net',
      ],
      extensions: [reactPlugin, clickPluginInstance],

      [clickPluginInstance.identifier]: clickPluginConfig,
      maxBatchInterval: 300000, // 5 minutes (in milliseconds)
      extensionConfig: {
        [reactPlugin.identifier]: { history: browserHistory },
      },
    },
  });

  appInsights.loadAppInsights();

  appInsights.addTelemetryInitializer((envelope) => {
    if (!envelope.data) envelope.data = {};
    if (!envelope.data.baseData) envelope.data.baseData = {};
    if (!envelope.data.baseData.properties) envelope.data.baseData.properties = {};

    envelope.data.baseData.properties.user_agent = appInsightUserAgent;
  });
}

const Main = () => {
  const { i18n } = useTranslation();

  const currentLanguage = useSelector((state) => state.auth.currentLanguage);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const franchiseId = useSelector((state) => state.auth.franchiseId);
  const userRole = useSelector((state) => state.auth.userRole);
  const sassToken = useSelector((state) => state.auth.saasToken);

  const dispatch = useDispatch();
  const tenantInfo = useSelector((state) => state.auth.tenantInfo);
  const tenantLabels = useSelector((state) => state.tenantConfigs?.labels);
  const tenantLabelsTenant = useSelector((state) => state.tenantConfigs?.tenant);
  const tenantLabelsVersion = useSelector((state) => state.tenantConfigs?.version);

  useEffect(() => {
    i18n.changeLanguage(currentLanguage?.code);

    if (isLocalDemo()) {
      dispatch(setTenantInfo(mergeTenantBranding(tenantInfo || {})));
    } else if (isObjectEmpty(tenantInfo)) {
      dispatch(setTenantInfo(mergeTenantBranding()));
    } else if (!tenantInfo?.logo && !tenantInfo?.images?.logo1) {
      dispatch(setTenantInfo(mergeTenantBranding(tenantInfo)));
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    // Labels are persisted, so also refetch when the cached copy belongs to a
    // different tenant than the active one, or predates the current payload
    // shape. Without the first the demo tenant switch kept the previous
    // tenant's vocabulary; without the second a cache written before a category
    // was added keeps rendering that category as an empty string.
    const activeTenant = mainDomain();
    const isStale =
      Boolean(tenantLabels) &&
      (tenantLabelsTenant !== activeTenant || tenantLabelsVersion !== TENANT_LABELS_VERSION);
    if (tenantLabels && !isStale) return;

    (async () => {
      const labels = await fetchTenantLabelsCall();
      if (labels?.labels && Object.keys(labels.labels).length > 0) {
        dispatch(setTenantLabels({ ...labels, tenant: activeTenant }));
      }
    })();
  }, [accessToken, tenantLabels, tenantLabelsTenant, tenantLabelsVersion, dispatch]);

  useEffect(() => {
    i18n.changeLanguage(currentLanguage?.code);
  }, []);

  /**
   * Refresh the **tenant feature flags** on every boot with a token.
   *
   * `tenantPermissions` was written once at login and then frozen: the store is
   * persisted, so a session kept alive across reloads never saw a flag change again.
   * A tenant feature turned on server-side stayed invisible, and — the direction that
   * actually matters — one *revoked* server-side stayed clickable until the user
   * happened to log out. It is also why enabling `runsheets.suppliesForecasting` for
   * the demo tenant did not make the scheduler's Forecasting button appear for anyone
   * already signed in.
   *
   * **Only the tenant flags.** There was a `_getPermission` helper here that nothing
   * ever called, which also dispatched `setAccessControlPermissions(accessControlList)`
   * — and reviving that part breaks routing. Login does not use that field: it derives
   * the module access list from the user's *role* (`setUserAccessList`) and builds
   * `permissionsList` alongside it, so overwriting the store with the raw payload field
   * collapses module access and every route redirects to the profile page. That is why
   * the helper is not simply being called; only the half this needs is kept.
   *
   * Failures are swallowed deliberately: this refreshes state that is already hydrated
   * from persistence, so a dropped request means the user keeps working with what they
   * had rather than losing a working session.
   */
  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        const response = await getUserData();
        if (response?.statusCode != 200) return;

        const edgePermissions = response?.data?.user?.tenantConfiguration?.permissions?.edge;
        // Guarded, so a payload that omits the block cannot blank out working
        // permissions — absent and "none" are different answers.
        if (edgePermissions) dispatch(setTenantPermissions(edgePermissions));
      } catch {
        // See above.
      }
    })();
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (
      (accessToken && franchiseId && userRole) ||
      (userRole && accessToken && enumUserRolesTokenApi.includes(userRole?.slug))
    ) {
      (async () => {
        if (!sassToken || isAzureTokenExpired(sassToken)) {
          const saasToken = await generateAzureStorageBlobToken({
            permissions: ['w', 'r', 'd'],
          });

          dispatch(setSaasToken(saasToken));
        }
      })();
    }
  }, [franchiseId, accessToken, userRole, sassToken]);

  const configs = useMemo(getRouteConfigs, []);

  // Generate and return routes from configs
  return useMemo(() => generateRoutesFromConfig(configs), [configs]);
};

function App() {
  const appContent = (
    <Suspense fallback={null}>
      <Main />
    </Suspense>
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <TenantThemeProvider>
          <Router history={history}>
            {hasAppInsights ? (
              <AppInsightsErrorBoundary onError={NoServer} appInsights={reactPlugin}>
                {appContent}
              </AppInsightsErrorBoundary>
            ) : (
              appContent
            )}
          </Router>
          <ToastContainer />
        </TenantThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default hasAppInsights ? withAITracking(reactPlugin, App) : App;
