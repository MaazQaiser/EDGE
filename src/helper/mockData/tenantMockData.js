import { mainDomain } from 'src/helper/utilityFunctions';
import { FILTER_GO_TENANT } from 'src/theme/tenantBranding';

export function isFilterGoTenant(tenant = mainDomain()) {
  return tenant === FILTER_GO_TENANT;
}

export function isSignalTenant(tenant = mainDomain()) {
  return !isFilterGoTenant(tenant);
}

const filterGoMocks = {
  user: {
    name: 'Filter Go Demo Owner',
    firstName: 'Filter',
    lastName: 'Owner',
    email: 'demo.owner@filtergo.com',
    tenantId: 'filtergo-demo',
    franchiseName: 'Filter Go Demo Franchise',
    billFromCompany: 'Filter Go Demo',
  },
  dashboard: {
    keyMetricsStats: {
      dedicatedShifts: { name: 'Dedicated Shifts', value: 42 },
      patrolShifts: { name: 'Patrol Shifts', value: 28 },
    },
    franchiseKeyMetrics: {
      functionalSites: { name: 'Functional Sites', value: 8 },
      dispatchRequests: { name: 'Dispatch Requests', value: 5 },
    },
    efficiencyStats: {
      patrol: { percentage: 91 },
      dedicated: { percentage: 82 },
    },
    liveOperations: {
      unassingedJobs: {
        name: 'Unassigned Jobs',
        textColour: '#5B5B5F',
        value: 2,
        valueColour: '#F4780B',
      },
      timeOffRequest: {
        name: 'Time Off Requests',
        textColour: '#5B5B5F',
        value: 1,
        valueColour: '#2DA551',
      },
      officerOnTimeOff: {
        name: 'Officers On Time Off',
        textColour: '#5B5B5F',
        value: 1,
        valueColour: '#B42318',
      },
      absentOfficer: {
        name: 'Absent Officers',
        textColour: '#5B5B5F',
        value: 0,
        valueColour: '#B42318',
      },
      missedHits: { name: 'Missed Hits', textColour: '#5B5B5F', value: 3, valueColour: '#F4780B' },
      dispatchNewAlarms: {
        name: 'New Dispatch Alarms',
        textColour: '#5B5B5F',
        value: 1,
        valueColour: '#B42318',
      },
    },
    nonFunctionalSites: 1,
    additionalServicesStats: [12, 4],
    jobWeekStats: {
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      completedJobs: [8, 9, 10, 11, 9, 7, 10],
      missedJobs: [0, 1, 0, 1, 0, 0, 1],
    },
    jobsNotStarted: [
      {
        id: 1,
        shiftType: 'dedicated',
        startsAt: '2026-07-01T08:00:00.000Z',
        endsAt: '2026-07-01T16:00:00.000Z',
        officer: { name: 'Alex Green', imageUrl: 'https://i.pravatar.cc/80?img=32' },
        site: { name: 'Filter Go HQ', imageUrl: 'https://picsum.photos/80?random=31' },
      },
    ],
    sitesGraph: {
      data: [
        { name: 'Requires Attention', value: 8 },
        { name: 'Non Functional', value: 2 },
        { name: 'Functional', value: 14 },
      ],
      colors: ['#FECDCA', '#E6E6E7', '#2DA551'],
      stats: { total: 24 },
    },
    industryVerticals: {
      data: [
        { name: 'HVAC / Filtration', value: 60 },
        { name: 'Commercial', value: 40 },
      ],
      stats: { total: 100 },
    },
    dashboardStats: { totalSites: 8, activeOfficers: 16 },
  },
  /**
   * On-screen vocabulary. Filter Go runs filter replacement on the patrol model,
   * so the API still says "patrol" while the interface never does. A visit is the
   * unit of work — what Signal calls a hit.
   */
  terms: {
    patrol: 'Filter Replacement Service',
    /* A runsheet is a **Route** here. The word the planner uses for an ordered
       day of driving is "route", and every screen that talks about one — the
       schedule, the optimizer, the visit drawer — reads this term rather than
       hard-coding either word. Signal keeps "Runsheet"; the API says runsheet on
       both. Bump `TENANT_LABELS_VERSION` when this changes or existing sessions
       keep the cached vocabulary (§7.2). */
    runsheets: 'Routes',
    runsheet: 'Route',
    hits: 'Visits',
    hit: 'Visit',
    // The work template attached to a visit — the on-site checklist that produces
    // the submitted report. Signal calls it a tour (a patrol route of
    // checkpoints); for filter replacement it is a service checklist.
    tour: 'Service Checklist',
    tours: 'Service Checklists',
    officers: 'Technicians',
    officer: 'Technician',
    supervisor: 'Supervisor',
    sites: 'Sites',
    zones: 'Zones',
    users: 'Users',
    vehicles: 'Vehicles',
    dashboard: 'Dashboard',
  },
};

const signalMocks = {
  user: {
    name: 'Signal Demo Owner',
    firstName: 'Signal',
    lastName: 'Owner',
    email: 'demo.owner@teamsignal.com',
    tenantId: 'signal-demo',
    franchiseName: 'Signal Demo Franchise',
    billFromCompany: 'Signal Demo',
  },
  dashboard: {
    keyMetricsStats: {
      dedicatedShifts: { name: 'Dedicated Shifts', value: 84 },
      patrolShifts: { name: 'Patrol Shifts', value: 39 },
    },
    franchiseKeyMetrics: {
      functionalSites: { name: 'Functional Sites', value: 12 },
      dispatchRequests: { name: 'Dispatch Requests', value: 17 },
    },
    efficiencyStats: {
      patrol: { percentage: 87 },
      dedicated: { percentage: 74 },
    },
    liveOperations: {
      unassingedJobs: {
        name: 'Unassigned Jobs',
        textColour: '#5B5B5F',
        value: 4,
        valueColour: '#F4780B',
      },
      timeOffRequest: {
        name: 'Time Off Requests',
        textColour: '#5B5B5F',
        value: 3,
        valueColour: '#146DFF',
      },
      officerOnTimeOff: {
        name: 'Officers On Time Off',
        textColour: '#5B5B5F',
        value: 2,
        valueColour: '#B42318',
      },
      absentOfficer: {
        name: 'Absent Officers',
        textColour: '#5B5B5F',
        value: 1,
        valueColour: '#B42318',
      },
      missedHits: { name: 'Missed Hits', textColour: '#5B5B5F', value: 6, valueColour: '#F4780B' },
      dispatchNewAlarms: {
        name: 'New Dispatch Alarms',
        textColour: '#5B5B5F',
        value: 2,
        valueColour: '#B42318',
      },
    },
    nonFunctionalSites: 3,
    additionalServicesStats: [8, 3],
    jobWeekStats: {
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      completedJobs: [10, 12, 11, 14, 9, 8, 13],
      missedJobs: [1, 0, 2, 1, 0, 1, 0],
    },
    jobsNotStarted: [
      {
        id: 1,
        shiftType: 'dedicated',
        startsAt: '2026-07-01T08:00:00.000Z',
        endsAt: '2026-07-01T16:00:00.000Z',
        officer: { name: 'Mike Ross', imageUrl: 'https://i.pravatar.cc/80?img=12' },
        site: { name: 'Signal Tower Plaza', imageUrl: 'https://picsum.photos/80?random=11' },
      },
      {
        id: 2,
        shiftType: 'patrol',
        startsAt: '2026-07-01T09:30:00.000Z',
        endsAt: '2026-07-01T17:30:00.000Z',
        officer: { name: 'Sarah Connor', imageUrl: 'https://i.pravatar.cc/80?img=47' },
        vehicle: { name: 'Patrol Unit 7', images: [{ url: 'https://picsum.photos/80?random=22' }] },
      },
    ],
    sitesGraph: {
      data: [
        { name: 'Requires Attention', value: 15 },
        { name: 'Non Functional', value: 4 },
        { name: 'Functional', value: 7 },
      ],
      colors: ['#FECDCA', '#E6E6E7', '#146DFF'],
      stats: { total: 26 },
    },
    industryVerticals: {
      data: [
        { name: 'Commercial', value: 55 },
        { name: 'Industrial', value: 45 },
      ],
      stats: { total: 100 },
    },
    dashboardStats: { totalSites: 12, activeOfficers: 24 },
  },
  terms: {
    dedicated: 'Dedicated',
    patrol: 'Patrol',
    dispatch: 'Dispatch',
    runsheets: 'Runsheets',
    runsheet: 'Runsheet',
    hits: 'Hits',
    hit: 'Hit',
    tour: 'Tour',
    tours: 'Tours',
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
};

export function getTenantMockData(tenant = mainDomain()) {
  return isFilterGoTenant(tenant) ? filterGoMocks : signalMocks;
}
