import { accessControlList } from 'src/utils/constants';

import { getTenantMockData } from './tenantMockData';
import { mainDomain } from '../utilityFunctions';

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
          permissions: {
            edge: {
              login: {
                redirectToSitesScreen: false,
              },
              permissionsList: {
                obxDashboard: true,
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

export function getMockTenantLabels() {
  return {
    labels: {
      terms: {
        dedicated: 'Dedicated',
        patrol: 'Patrol',
        dispatch: 'Dispatch',
        runsheets: 'Runsheets',
        hits: 'Hits',
        officers: 'Officers',
        officer: 'Officer',
        supervisor: 'Supervisor',
        extra: 'Extra',
        sites: 'Sites',
        zones: 'Zones',
        users: 'Users',
        vehicles: 'Vehicles',
        dashboard: 'Dashboard',
      },
    },
  };
}
