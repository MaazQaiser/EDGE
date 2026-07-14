import { rest } from 'msw';
import stubbedData, {
  getFranchiseData,
  getFranchiseDetails,
  getGeoLocationData,
} from 'src/stubbedData';

import { FRANCHISE_SERVICE, SALES_SERVICE } from '../../../services/franchise.services';

const franchiseUpdate = rest.get(
  `${FRANCHISE_SERVICE}/home_office/franchises/:id/edit`,
  (req, res, ctx) => {
    const { id } = req.params;
    // Handle the request and return mock data
    if (!id) {
      return res(ctx.status(500), ctx.json(getFranchiseData?.failure));
    }
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(getFranchiseData?.success?.data));
  },
);
const makeFranchiseFunctional = rest.get(
  `${FRANCHISE_SERVICE}/home_office/franchises/:id/mark_functional`,
  (req, res, ctx) => {
    const { id } = req.params;
    // Handle the request and return mock data
    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData.makeFranchiseFunctional?.failure));
    }
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(stubbedData.makeFranchiseFunctional.success));
  },
);

export const syncHubSpotData = rest.get(
  `${FRANCHISE_SERVICE}/home_office/franchises/sync_hubspot_data`,
  (req, res, ctx) => {
    // You can customize the response based on your needs
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Synced Successfully!.',
      }),
    );
  },
);

export const getFranchiseGeoLocationData = rest.post(
  `${FRANCHISE_SERVICE}/geolocations`,
  (req, res, ctx) => {
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(getGeoLocationData?.success));
  },
);

export const sendFranchiseInvite = rest.post(
  `${FRANCHISE_SERVICE}/home_office/franchises/:id/reinvite_owner`,
  (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData['inviteFranchise'].failure));
    }
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(stubbedData['inviteFranchise'].success));
  },
);

export const getFranchiseDetail = rest.get(
  `${FRANCHISE_SERVICE}/franchises/zone_details`,
  (req, res, ctx) => {
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(getFranchiseDetails?.success));
  },
);

export const changeFO = rest.put(
  `${FRANCHISE_SERVICE}/home_office/franchises/:id/change_owner`,
  (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData['changeFranchiseOwner'].failure));
    }
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(stubbedData['changeFranchiseOwner'].success));
  },
);

export const deActivateFranchise = rest.put(
  `${FRANCHISE_SERVICE}/home_office/franchises/:id/mark_non_functional`,
  (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData['deleteFranchise'].failure));
    }
    // You can customize the response based on your needs
    return res(ctx.status(200), ctx.json(stubbedData['deleteFranchise'].success));
  },
);

export const getActiveFranchises = rest.get(
  `${FRANCHISE_SERVICE}/franchises/options`,
  (req, res, ctx) => {
    // You can customize the response based on your needs
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          activeFranchises: [
            {
              id: 23,
              name: 'Rehman',
            },
            {
              id: 9,
              name: 'Rehman 2',
            },
            {
              id: 8,
              name: 'Rehman 3',
            },
            {
              id: 4,
              name: 'Rehman 4',
            },
            {
              id: 1,
              name: 'Rehman',
            },
          ],
        },
      }),
    );
  },
);

export const fetchOfficerGraphData = rest.get(
  `${FRANCHISE_SERVICE}/users/officers_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        statusCode: 200,
        message: 'The record has been fetched successfully!',
        data: {
          employeesGraphData: {
            colors: ['#146DFF', '#A9DEFF'],
            data: [
              {
                value: 0,
                name: 'Patrol Officers',
              },
              {
                value: 9,
                name: 'Dedicated Officers',
              },
            ],
            stats: {
              total: 9,
            },
          },
        },
      }),
    );
  },
);

export const fetchOfficerGraphDataError = rest.get(
  `${FRANCHISE_SERVICE}/users/officers_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching officer graph data',
      }),
    );
  },
);

export const fetchClientGraphData = rest.get(
  `${SALES_SERVICE}/web/external_stats/ho_clients_vertical_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          clientsGraphData: {
            colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
            data: [
              {
                name: 'Chemicals',
                value: 2,
              },
              {
                name: 'Libraries',
                value: 2,
              },
              {
                name: 'Consumer Electronics',
                value: 2,
              },
              {
                name: 'Higher Education',
                value: 2,
              },
              {
                name: 'Others',
                value: 92,
              },
            ],
            stats: {
              total: 904,
            },
          },
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const fetchClientGraphDataError = rest.get(
  `${SALES_SERVICE}/web/external_stats/ho_clients_vertical_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching client graph data',
      }),
    );
  },
);

export const fetchClientsOverTheYearGraphData = rest.get(
  `${SALES_SERVICE}/web/external_stats/ho_clients_yearly_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          clientsOverTheYear: {
            dataLabels: [
              "Feb' 23",
              "Mar' 23",
              "Apr' 23",
              "May' 23",
              "Jun' 23",
              "Jul' 23",
              "Aug' 23",
              "Sep' 23",
              "Oct' 23",
              "Nov' 23",
              "Dec' 23",
              "Jan' 24",
            ],
            data: {
              clients: [0, 0, 0, 0, 0, 0, 0, 0, 903, 0, 1, 0],
            },
            colors: {
              clients: ['#146DFF', '#A6C3F0'],
            },
          },
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const fetchClientsOverTheYearGraphDataError = rest.get(
  `${SALES_SERVICE}/web/external_stats/ho_clients_yearly_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching clients over the year graph data',
      }),
    );
  },
);

export const handlers = [
  franchiseUpdate,
  makeFranchiseFunctional,
  deActivateFranchise,
  getFranchiseDetail,
  sendFranchiseInvite,
  syncHubSpotData,
  getActiveFranchises,
  getFranchiseGeoLocationData,
  changeFO,
  fetchOfficerGraphData,
  fetchOfficerGraphDataError,
  fetchClientGraphData,
  fetchClientGraphDataError,
  fetchClientsOverTheYearGraphData,
  fetchClientsOverTheYearGraphDataError,
];
