import { duties, dutiesMonth, shiftDetailMock } from 'src/stubbedData/mocks/dutyList.mock';
import { runsheetDetail, runsheets } from 'src/stubbedData/mocks/runsheetList.mock';
import { dealsData } from 'src/stubbedData/mocks/deals.mock';
import { locationsData } from 'src/stubbedData/mocks/locations.mock';
import { dispatchListMock } from 'src/stubbedData/mocks/dispatch.mock';
import { payrollListMock } from 'src/stubbedData/mocks/payroll.mock';

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
import { getTenantMockData } from './tenantMockData';
import { mainDomain } from '../utilityFunctions';

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
  if (pathOnly.includes('/auth/logout')) return mockMutationSuccess('Logged out successfully');
  if (pathOnly.includes('/auth/forgot_password') || pathOnly.includes('/auth/reset_password'))
    return mockMutationSuccess('Email sent successfully');
  if (pathOnly.includes('/auth/change_password'))
    return mockMutationSuccess('Password updated successfully');

  if (pathOnly.includes('/sites/list')) {
    const { items, pagination } = mockPaginate(getStore('sites'), query);
    return mockResponse({ sites: items, pagination }, 'Success Message');
  }

  if (matchPath(pathOnly, '/sites/:id')) {
    const params = matchPath(pathOnly, '/sites/:id');
    const site = findInStore('sites', params.id) || getStore('sites')[0];
    return mockSuccess('Site fetched successfully', { site });
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

  if (
    (pathOnly.includes('/shiftActivityLog/summary') || pathOnly.includes('/shift/list')) &&
    !pathOnly.includes('/foDashboard/')
  )
    return mockSuccess('Duties fetched', { duties });
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
        { id: 1, name: 'Lorem Site', revenue: 12000 },
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
    if (pathOnly.includes('/sites') && upperMethod === 'POST') {
      const site = addToStore('sites', body?.site || body || { name: 'New Demo Site' });
      return mockMutationSuccess('Site created successfully', { site });
    }
    if (pathOnly.includes('/sites') && (upperMethod === 'PUT' || upperMethod === 'PATCH')) {
      const id = pathOnly.split('/').pop();
      updateInStore('sites', id, body?.site || body || {});
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
