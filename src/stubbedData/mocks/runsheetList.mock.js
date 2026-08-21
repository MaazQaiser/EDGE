import { ROUTE_NAMES } from 'src/stubbedData/mocks/schedule.mock';

const ASSIGNEES = [
  'Mike Ross',
  'Sarah Connor',
  'David Nguyen',
  'Priya Shah',
  'James Okoro',
  'Elena Ruiz',
];

/**
 * The franchise's routes, named from the same list the schedule grid draws from
 * (`ROUTE_NAMES`). The visit drawer's "move to route" dropdown reads this
 * endpoint, so a route a planner sees on a card has to be selectable here — with
 * one hard-coded "Runsheet 1" it never was.
 *
 * Ids match `routeForSite`'s scheme (700 + index) so the drawer can recognise the
 * route a visit is already on rather than prepending a duplicate.
 */
export const runsheets = {
  runsheets: ROUTE_NAMES.map((name, index) => ({
    id: 700 + index,
    name,
    assignedTo: ASSIGNEES[index % ASSIGNEES.length],
    hits: 4 + (index % 5),
  })),
  pagination: {
    page: 1,
    perPage: 10,
    totalCount: ROUTE_NAMES.length,
    search: '',
  },
};

export const runsheetDetail = {
  id: '652e5df4248a0607e08e8dc3',
  routeId: '9FC94F1834D9141A0782FB74ADD8F922',
  name: 'floridaZone',
  noOfSites: 2,
  recurring: 6,
  hits: 8,
  assignedTo: '', //will be officer name
  estimatedTime: 96.57, //total time for runsheet in minutes
  isSystemGenerated: true,
  sites: [
    {
      siteId: 1,
      address: '8123 N Nebraska Ave Tampa, FL 33604',
      name: 'Fields Corner 1',
      lat: 28.021584,
      lng: -82.451175,
      stopType: null,
      waitTime: 0,
      windowStart: '2023-10-17T13:00:00.000Z',
      windowEnd: '2023-10-17T13:00:00.000Z',
      estimatedTime: 0,
    },
  ],
};
