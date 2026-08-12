import { Contracts } from 'src/app/obx/pages/sites/listing/component/graph/stubbbedData';
import { dealsData } from 'src/stubbedData/mocks/deals.mock';
import { dispatchListMock } from 'src/stubbedData/mocks/dispatch.mock';
import { duties, dutiesMonth, shiftDetailMock } from 'src/stubbedData/mocks/dutyList.mock';
import { locationsData } from 'src/stubbedData/mocks/locations.mock';
import { payrollListMock } from 'src/stubbedData/mocks/payroll.mock';
import { runsheetDetail, runsheets } from 'src/stubbedData/mocks/runsheetList.mock';
import {
  buildMissedHits,
  buildMissedHitsCount,
  buildRunsheetShiftDetail,
  buildScheduleAggregate,
  buildScheduleStats,
  buildScheduleSummary,
  buildVisitDetail,
} from 'src/stubbedData/mocks/schedule.mock';
import { MULTI_TENANT_AUTH } from 'src/utils/constants/multiTanentAuthInfo';

import { mainDomain } from '../utilityFunctions';
import { getExternalClients, getExternalContacts } from './externalDirectoryMock';
import {
  extractPath,
  extractPathParams,
  getQueryParams,
  mockMutationSuccess,
  mockPaginate,
  mockResponse,
  mockSuccess,
} from './mockHelpers';
import { addToStore, findInStore, getStore, removeFromStore, updateInStore } from './mockStores';
import { getMockTenantLabels, getMockUserDataResponse } from './mockUserData';
import { buildSiteGeoLocationResponse, getAddressConfigsMock } from './siteGeoMock';
import { getTenantMockData } from './tenantMockData';

const invoiceList = [
  { id: 123, name: 'Bilal Malik', amount: 12312, companyName: 'ABC Company', dueDate: '1-24-2024' },
];

function listResponse(key, rows, queryParams = {}) {
  const { items, pagination } = mockPaginate(rows, queryParams);
  return mockResponse({ [key]: items, pagination }, 'The record has been fetched successfully!');
}

function graphResponse(key, payload) {
  return mockResponse({ [key]: payload }, 'The record has been fetched successfully!');
}

function matchPath(path, pattern) {
  return extractPathParams(path.split('?')[0], pattern);
}

function isPlainObject(value) {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof FormData)
  );
}

export function resolveMockResponse(method, url, body = null) {
  const path = extractPath(url);
  const pathOnly = path.split('?')[0];
  const query = getQueryParams(path);
  const upperMethod = String(method || 'GET').toUpperCase();
  const tenantMocks = getTenantMockData(mainDomain());
  const dashboard = tenantMocks.dashboard;

  if (pathOnly.includes('/configs/user_data')) return getMockUserDataResponse();
  if (pathOnly.includes('/configs/tenant_labels'))
    return mockSuccess('Tenant labels fetched', getMockTenantLabels());
  // Address dropdowns for site create/update (fetchConfigList → `/configs`)
  if (pathOnly === '/configs' || /\/configs$/.test(pathOnly))
    return mockSuccess('Configs fetched', getAddressConfigsMock());
  // External application directory (clients + contacts) consumed by the site
  // information edit form. These records are "owned" by another app; the form
  // only links to them.
  if (pathOnly.includes('/directory/clients'))
    return mockSuccess('Clients fetched', { clients: getExternalClients(query?.search) });
  if (pathOnly.includes('/directory/contacts'))
    return mockSuccess('Contacts fetched', { contacts: getExternalContacts(query?.clientId) });

  if (pathOnly.includes('/auth/logout')) return mockMutationSuccess('Logged out successfully');
  if (pathOnly.includes('/auth/forgot_password') || pathOnly.includes('/auth/reset_password'))
    return mockMutationSuccess('Email sent successfully');
  if (pathOnly.includes('/auth/change_password'))
    return mockMutationSuccess('Password updated successfully');

  // NOTE: these literal `/sites/*` routes must be checked before the generic
  // `/sites/:id` matcher below - otherwise segments like "sites_graph" or
  // "clients_graph" get swallowed as the `:id` param and return the wrong
  // (site-detail) response shape instead of the graph data the callers expect.
  if (pathOnly.includes('/sites/list')) {
    const { items, pagination } = mockPaginate(getStore('sites'), query);
    return mockResponse({ sites: items, pagination }, 'Success Message');
  }

  if (pathOnly.includes('/sites/sites_graph')) {
    return graphResponse('sitesGraphData', dashboard.sitesGraph);
  }

  if (pathOnly.includes('/sites/clients_graph')) {
    return graphResponse('clientsGraphData', {
      data: [
        { name: 'industry', value: 25 },
        { name: 'commercial', value: 1 },
      ],
      colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
      stats: { total: 2 },
    });
  }

  if (pathOnly.includes('/franchise_contracts_yearly_stats')) {
    return graphResponse('clientsOverTheYear', Contracts);
  }

  if (pathOnly === '/sites') {
    const { items, pagination } = mockPaginate(getStore('sites'), query);
    return mockResponse({ sites: items, pagination }, 'Success Message');
  }

  if (matchPath(pathOnly, '/sites/:id')) {
    const params = matchPath(pathOnly, '/sites/:id');
    const site = findInStore('sites', params.id) || getStore('sites')[0];
    return mockSuccess('Site fetched successfully', { site });
  }

  // NOTE: these dropdown endpoints must be matched with their full, specific
  // path before any broader `/sage_items` or `/holiday_groups` matcher is
  // added, for the same reason as the `/sites/*` routes above.
  if (pathOnly.includes('/sage_items/sage_items_dropdown'))
    return mockSuccess('Sage items fetched', getStore('sageItems'));
  if (pathOnly.includes('/holiday_groups/holiday_groups_dropdown'))
    return mockSuccess('Holiday groups fetched', getStore('holidayGroups'));

  if (pathOnly.includes('/zones/options'))
    return mockSuccess('Zones fetched', { zones: getStore('zones') });
  if (pathOnly.includes('/zones/list') || pathOnly.endsWith('/zones'))
    return listResponse('zones', getStore('zones'), query);
  if (matchPath(pathOnly, '/zones/:id'))
    return mockSuccess('Zone fetched successfully', {
      zone: findInStore('zones', matchPath(pathOnly, '/zones/:id').id) || getStore('zones')[0],
    });

  if (pathOnly.includes('/users/supervisor/options'))
    return mockSuccess('Supervisors fetched', { supervisors: [{ id: 1, name: 'Mike Ross' }] });
  if (pathOnly.includes('/users/options') || pathOnly.includes('/users/officers_and_supervisors')) {
    const { items, pagination } = mockPaginate(getStore('users'), query);
    return mockSuccess('Users fetched', {
      users: items,
      officersAndSupervisors: items,
      pagination,
    });
  }
  if (matchPath(pathOnly, '/users/:id'))
    return mockSuccess('User fetched', {
      user: findInStore('users', matchPath(pathOnly, '/users/:id').id) || getStore('users')[0],
    });

  if (pathOnly.includes('/users/user_type_graph')) {
    return graphResponse('userTypeGraphData', {
      colors: ['#146DFF', '#A9DEFF', '#F7DDDC', '#FFD9A8'],
      data: [
        { name: 'dedicated', value: 15 },
        { name: 'patrol', value: 0 },
        { name: 'supervisors', value: 6 },
      ],
      stats: { total: 21 },
    });
  }

  if (pathOnly.includes('/vehicles/list') || pathOnly.includes('/vehicles'))
    return listResponse('vehicles', getStore('vehicles'), query);

  // Revamped (grid-v2) schedule calendar endpoints — match the specific paths
  // before the generic /shiftActivityLog handlers below.
  if (pathOnly.includes('/shiftActivityLog/schedule/stats'))
    return mockSuccess('Schedule stats fetched', buildScheduleStats(query));
  if (pathOnly.includes('/shiftActivityLog/aggregate'))
    return mockSuccess(
      'Monthly schedule fetched',
      buildScheduleAggregate(query, {
        services: MULTI_TENANT_AUTH[mainDomain()]?.services || {},
      }),
    );
  if (pathOnly.toLowerCase().includes('/missedhits/count'))
    return mockSuccess('Missed hits count fetched', buildMissedHitsCount());
  // Must stay ahead of the generic /shiftActivityLog handler below, which would
  // otherwise answer with an object the drawer cannot iterate.
  if (pathOnly.toLowerCase().includes('/missedhits'))
    return mockSuccess('Missed hits fetched', buildMissedHits(query));
  // Side-drawer detail. Both must precede the generic /shift/ and /runsheet
  // handlers further down, which answered with list shapes the drawers cannot
  // read — leaving them with no title, no stops and "Undefined" totals.
  if (matchPath(pathOnly, '/shift/patrol/hit/:hitId'))
    return mockSuccess(
      'Visit fetched',
      buildVisitDetail(matchPath(pathOnly, '/shift/patrol/hit/:hitId').hitId, query),
    );
  if (matchPath(pathOnly, '/shiftassignment/runsheet/:runsheetId'))
    return mockSuccess(
      'Runsheet shift fetched',
      buildRunsheetShiftDetail(
        matchPath(pathOnly, '/shiftassignment/runsheet/:runsheetId').runsheetId,
        query,
      ),
    );

  if (
    (pathOnly.includes('/shiftActivityLog/summary') || pathOnly.includes('/shift/list')) &&
    !pathOnly.includes('/foDashboard/')
  )
    return mockSuccess('Duties fetched', buildScheduleSummary(query));
  if (pathOnly.includes('/shiftActivityLog/monthly') || pathOnly.includes('/shift/month'))
    return mockSuccess('Monthly duties fetched', { duties: dutiesMonth });
  if (
    (pathOnly.includes('/shiftActivityLog') || pathOnly.includes('/shift/')) &&
    !pathOnly.includes('/foDashboard/')
  )
    return mockSuccess('Shift data fetched', { shift: shiftDetailMock, duties });

  if (pathOnly.includes('/runsheets') || pathOnly.includes('/runsheet')) {
    if (matchPath(pathOnly, '/runsheets/:id') || matchPath(pathOnly, '/runsheet/:id'))
      return mockSuccess('Runsheet fetched', { runsheet: runsheetDetail });
    return mockSuccess('Runsheets fetched', runsheets);
  }

  if (pathOnly.includes('/dispatch_requests/stats')) {
    return mockSuccess('Dispatch stats fetched', { stats: { newAlarms: 2 } });
  }
  if (pathOnly.includes('/dispatch')) return listResponse('dispatches', dispatchListMock, query);
  if (pathOnly.includes('/payroll')) return listResponse('payrolls', payrollListMock, query);

  if (pathOnly.includes('/invoices')) {
    const { items, pagination } = mockPaginate(invoiceList, query);
    return { statusCode: 200, message: 'invoices fetched successfully', data: items, pagination };
  }

  // Geo-fencing boundaries used by the sites detail / edit map (getGeoLocation,
  // a POST). This matcher is method-agnostic, so it must return the same shape
  // `findParentAndSiblingsPolygon` expects — franchises carrying a `coordinates`
  // polygon (the update/detail map gates on `parent.coordinates`). Delegating to
  // buildSiteGeoLocationResponse keeps franchise/zone/site polygons in sync with
  // the mock store.
  if (pathOnly.includes('/geolocations')) {
    return mockSuccess(
      'Geolocations fetched',
      buildSiteGeoLocationResponse(body, getStore('sites'), getStore('zones')),
    );
  }

  if (pathOnly.includes('/franchises'))
    return mockSuccess('Franchises fetched', {
      franchises: [{ id: 1, name: 'Filter Go Demo Franchise' }],
    });
  if (pathOnly.includes('/dashboards/contracts_stats')) {
    return mockSuccess('Contract revenue fetched', {
      contractRevenueStats: {
        data: [
          { name: 'active', value: 70 },
          { name: 'terminated', value: 20 },
          { name: 'expired', value: 10 },
        ],
        colors: ['#146DFF', '#F4780B', '#B42318'],
        stats: { contractsCount: 24 },
      },
    });
  }
  if (pathOnly.includes('/dashboards/top_sites_by_revenue')) {
    return mockSuccess('Top sites fetched', {
      sites: [
        { id: 1, name: 'Northgate Corporate Center', revenue: 12000 },
        { id: 2, name: 'Downtown Plaza', revenue: 9800 },
      ],
    });
  }
  if (pathOnly.includes('/dashboards/industry_verticals_stats')) {
    return mockSuccess('Industry verticals fetched', {
      industryVerticalsStats: dashboard.industryVerticals,
    });
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/keyMetrics')) {
    return mockSuccess('Key metrics fetched', {
      keyMetricsStats: dashboard.keyMetricsStats,
    });
  }
  if (pathOnly.includes('/dashboards/key_metrics')) {
    return mockSuccess('Franchise key metrics fetched', {
      keyMetricsStats: dashboard.franchiseKeyMetrics,
    });
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/liveOperations')) {
    return mockSuccess('Live operations fetched', {
      liveOperations: dashboard.liveOperations,
    });
  }
  if (pathOnly.includes('/dashboards/live_operations_stats')) {
    return mockSuccess('Live operation stats fetched', {
      liveOperationsStats: {
        nonFunctionalSites: dashboard.nonFunctionalSites,
      },
    });
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/getJobWeekStats')) {
    return mockSuccess('Job week stats fetched', dashboard.jobWeekStats);
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/jobsNotStarted')) {
    return mockSuccess('Jobs not started fetched', {
      shifts: dashboard.jobsNotStarted,
    });
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/getEfficiencyStats')) {
    return mockSuccess('Efficiency stats fetched', {
      efficiencyStats: dashboard.efficiencyStats,
    });
  }
  if (pathOnly.includes('/shiftActivityLog/foDashboard/getAdditionalServiceStats')) {
    return mockSuccess('Additional services fetched', {
      additionalServicesStats: dashboard.additionalServicesStats,
    });
  }
  if (pathOnly.includes('/attendance'))
    return mockSuccess('Attendance fetched', { attendance: [] });
  if (pathOnly.includes('/reports')) return mockSuccess('Reports fetched', { reports: [] });
  if (pathOnly.includes('/templates')) return mockSuccess('Templates fetched', { templates: [] });
  if (pathOnly.includes('/deals'))
    return mockSuccess('Deals fetched', { deals: dealsData?.listing?.data?.locations || [] });
  if (pathOnly.includes('/locations') || pathOnly.includes('/leads'))
    return mockSuccess('Locations fetched', { locations: locationsData || [] });
  if (pathOnly.includes('/companies')) return mockSuccess('Companies fetched', { companies: [] });
  if (pathOnly.includes('/visitors')) return mockSuccess('Visitors fetched', { visitors: [] });
  if (pathOnly.includes('/notifications'))
    return mockSuccess('Notifications fetched', { notifications: [] });
  if (pathOnly.includes('/dashboard'))
    return mockSuccess('Dashboard fetched', { stats: dashboard.dashboardStats });
  if (pathOnly.includes('/profile'))
    return mockSuccess('Profile fetched', { profile: getStore('users')[0] });
  if (pathOnly.includes('/devices')) return mockSuccess('Devices fetched', { devices: [] });
  if (pathOnly.includes('/checkpoints'))
    return mockSuccess('Checkpoints fetched', { checkpoints: [] });
  if (pathOnly.includes('/preferences')) return mockSuccess('Preferences fetched', {});
  if (pathOnly.includes('/upload') || pathOnly.includes('/attachments'))
    return mockSuccess('Upload complete', { url: 'https://via.placeholder.com/300' });

  if (upperMethod !== 'GET') {
    // Site detail + update form both call POST /geolocations for franchise/zone polygons
    if (pathOnly.includes('/geolocations')) {
      return mockSuccess(
        'GeoLocation fetched successfully!',
        buildSiteGeoLocationResponse(body, getStore('sites'), getStore('zones')),
      );
    }

    if (pathOnly.includes('/sites') && upperMethod === 'POST') {
      const site = addToStore(
        'sites',
        body?.site ||
          (isPlainObject(body) ? body : null) || {
            name: 'New Demo Site',
          },
      );
      return mockMutationSuccess('Site created successfully', { site });
    }
    if (pathOnly.includes('/sites') && (upperMethod === 'PUT' || upperMethod === 'PATCH')) {
      const id = pathOnly.split('/').pop();
      // Update form submits multipart FormData — skip merging opaque FormData into the store
      if (isPlainObject(body) || body?.site) {
        updateInStore('sites', id, body?.site || body || {});
      }
      return mockMutationSuccess('Site updated successfully');
    }
    if (pathOnly.includes('/sites') && upperMethod === 'DELETE') {
      removeFromStore('sites', pathOnly.split('/').pop());
      return mockMutationSuccess('Site deleted successfully');
    }
    return mockMutationSuccess('The record has been saved successfully!');
  }

  return mockSuccess('Mock data loaded', {});
}
