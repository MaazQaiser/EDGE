import { accessControlList } from 'src/utils/constants';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import { mainDomain } from '../utilityFunctions';
import { getTenantMockData } from './tenantMockData';

const FRANCHISE_ID = 1;

function buildFullPermissions() {
  return Object.entries(accessControlList).reduce((acc, [key, value]) => {
    acc[key] = {
      ...value,
      create: true,
      view: true,
      update: true,
      delete: true,
    };
    return acc;
  }, {});
}

const fullPermissions = buildFullPermissions();

export const MOCK_FRANCHISE_ID = FRANCHISE_ID;

export function getMockUserDataResponse() {
  const tenantMocks = getTenantMockData(mainDomain());
  const profile = tenantMocks.user;

  return {
    statusCode: 200,
    message: 'User data fetched successfully',
    data: {
      language: { code: 'en', name: 'English' },
      country: { id: 1, name: 'United States', code: 'US' },
      user: {
        id: 101,
        name: profile.name,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: '+1 (555) 123-4567',
        image: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.svg',
        assignedRoles: ['franchise_owner'],
        franchiseId: FRANCHISE_ID,
        tenantId: profile.tenantId,
        roleableType: 'Franchise',
        type: 'Franchise Owner',
        runsheetAccess: true,
        franchiseTimezone: 'America/New_York',
        defaultCountryConfiguration: {
          id: 1,
          name: 'United States',
          code: 'US',
          // `useDateTime` reads `countryConfiguration.dateFormat` and falls back
          // to YYYY-MM-DD, which is why every date picker in the demo showed ISO
          // dates while its own placeholder said MM/DD/YYYY. `shortCode` is what
          // the invoicing module tests for the German franchise variant.
          shortCode: 'US',
          dateFormat: 'MM/DD/YYYY',
          country: {
            id: 1,
            name: 'United States',
            shortCode: 'US',
          },
        },
        franchises: [
          {
            id: FRANCHISE_ID,
            name: profile.franchiseName,
            format: '12hrs',
            status: 'active',
          },
        ],
        accessControlList: {
          [FRANCHISE_ID]: fullPermissions,
        },
        tenantConfiguration: {
          // Sourced from the tenant definition so the demo login can't hand back
          // services the tenant doesn't actually sell — Filter Go is patrol only.
          services: MULTI_TENANT_AUTH[mainDomain()]?.services || {},
          permissions: {
            edge: {
              login: {
                redirectToSitesScreen: false,
              },
              permissionsList: {
                obxDashboard: true,
              },
              // Gates every payment affordance in the invoicing module — the Pay
              // Now action is rendered only for QuickBooks franchises
              // (`obx/pages/invoices/index.jsx`). Left on 'sage' the demo has no
              // way to record a payment at all, which makes the paid/unpaid work
              // impossible to show. Whether payment capture *should* be tied to
              // the accounting integration is an open product question.
              invoicingMethod: 'quickbooks',
              runsheets: {
                /* Gates the scheduler's **Forecasting** button
                   (`isSupplierForecasting` in `schedules/calendar/index.jsx`). Off,
                   the header row ends at the assignment message and the button — which
                   is part of the design being reviewed — cannot be seen at all.
                   Enabled *here*, in the demo payload, rather than by relaxing the
                   gate: it is a tenant feature flag, and a tenant that has not bought
                   supplies forecasting still must not be shown it. */
                suppliesForecasting: true,
              },
            },
          },
          properties: {
            edge: {
              billFrom: {
                companyName: profile.billFromCompany,
                address: '123 Demo Street',
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Stands in for the tenant labels API. Vocabulary is per-tenant — Filter Go calls
 * patrol "Filter Replacement" and hits "Visits" — so the terms live
 * alongside the rest of that tenant's mock data.
 */
export function getMockTenantLabels() {
  const { terms } = getTenantMockData();

  return {
    labels: {
      terms,
      /**
       * `roles` is a separate label category from `terms`, and several call
       * sites read it — `getLabel('roles', 'officer', t)` in the runsheet
       * drawer, for one. Supplying only `terms` made those resolve to an empty
       * string, and because the i18n value is bare interpolation ("{{officer}}")
       * the label rendered as nothing at all. Derive roles from terms so the
       * person vocabulary stays in one place per tenant.
       */
      roles: {
        officer: terms.officer,
        officers: terms.officers,
        supervisor: terms.supervisor,
      },
    },
  };
}
