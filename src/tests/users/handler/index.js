import { rest } from 'msw';
import { REACT_APP_FRANCHISE_BASE_URL, REACT_APP_LOCATIONS_URL } from 'services/deal.service';
import { schedulingServiceEndPoint, usersServiceEndPoint } from 'services/user.services';
import { UserOverYear, Users } from 'src/app/homeOffice/pages/users/components/graph/stubbedData';
import { validateParamForMockApi } from 'src/helper/utilityFunctions';
import stubbedData from 'src/stubbedData';

export const updateUsersAvailabilityMsw = rest.put(
  `${usersServiceEndPoint}/users/:id/update_availability`,
  (req, res, ctx) => {
    const stubData = stubbedData?.usersAvailability;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.update.failure.statusCode),
        ctx.json({
          statusCode: stubData.update.failure.statusCode,
          message: stubData.update.failure.message,
        }),
      );
    }

    return res(
      ctx.status(stubData.update.success.statusCode),
      ctx.json({
        statusCode: stubData.update.success.statusCode,
        message: stubData.update.success.message,
      }),
    );
  },
);

export const fetchUserTypeGraphData = rest.get(
  `${usersServiceEndPoint}/users/user_type_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          userTypeGraphData: {
            colors: ['#146DFF', '#A9DEFF', '#F7DDDC', '#FFD9A8'],
            data: [
              {
                name: 'dedicated',
                value: 15,
              },
              {
                name: 'patrol',
                value: 0,
              },
              {
                name: 'supervisors',
                value: 6,
              },
            ],
            stats: {
              total: 21,
            },
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully!',
      }),
    );
  },
);

export const fetchUserTypeGraphDataError = rest.get(
  `${usersServiceEndPoint}/users/user_type_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching user type graph data',
      }),
    );
  },
);

export const fetchMissedJobsGraphData = rest.get(
  `${schedulingServiceEndPoint}/shift/graph/missedJob`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          missRateGraphData: {
            colors: ['#146DFF', '#A9DEFF', '#F7DDDC', '#FFD9A8'],
            data: [
              {
                name: 'Dedicated',
                value: 237,
              },
              {
                name: 'Patrol',
                value: 0,
              },
              {
                name: 'Extra',
                value: 31,
              },
            ],
            stats: {
              total: 268,
            },
          },
        },
      }),
    );
  },
);

export const fetchMissedJobsGraphDataError = rest.get(
  `${schedulingServiceEndPoint}/shift/graph/missedJob`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching missed jobs graph data',
      }),
    );
  },
);

export const fetchJobsPerformedOverTheYearGraphData = rest.get(
  `${schedulingServiceEndPoint}/shift/graph/yearlyPerformedJob`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          dutiesPerformedOverTheYearGraphData: {
            dataLabels: [
              "Feb'23",
              "Mar'23",
              "Apr'23",
              "May'23",
              "Jun'23",
              "Jul'23",
              "Aug'23",
              "Sep'23",
              "Oct'23",
              "Nov'23",
              "Dec'23",
              "Jan'24",
            ],
            data: {
              Dedicated: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
              Patrol: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
            stats: {
              Dedicated: 3,
              Patrol: 0,
            },
            colors: {
              Patrol: ['#146DFF', '#A6C3F0'],
              Dedicated: ['#86868B', '#E0ECFF'],
            },
          },
        },
      }),
    );
  },
);

export const fetchJobsPerformedOverTheYearGraphDataError = rest.get(
  `${schedulingServiceEndPoint}/shift/graph/yearlyPerformedJob`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching jobs performed over the year graph data',
      }),
    );
  },
);

export const fetchAllUsers = rest.get(
  `${usersServiceEndPoint}/users/officers_and_supervisors`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          officersAndSupervisors: [
            {
              id: 143,
              name: 'Kendall Leannon',
              email: 'lionel@rippin.example',
              phone: '1-232-825-6075 x620',
              userType: 'Officer',
              franchiseId: 1,
              title: null,
              perHourRate: null,
              joinedDate: '2023-10-24T09:47:24.150Z',
              zone: null,
              level: 1,
              overtime: null,
              lastPayment: null,
              lastScannedDevice: null,
              currentDutyProgress: null,
              sitesCount: null,
            },
          ],
          pagination: {
            currentPage: 1,
            nextPage: null,
            prevPage: null,
            totalPages: 1,
            totalCount: 1,
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully!',
      }),
    );
  },
);

export const fetchAllUsersError = rest.get(
  `${usersServiceEndPoint}/users/officers_and_supervisors`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: 'Error fetching users',
      }),
    );
  },
);

export const fetchUserDetails = rest.get(
  `${usersServiceEndPoint}/users/:id`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          user: {
            id: 143,
            name: 'Kendall Leannon',
            zones: [],
            email: 'lionel@rippin.example',
            role: 'Officer',
            slug: 'officer',
            status: 'inactive',
            dutyType: null,
            joinedDate: null,
            firstName: 'Kendall',
            lastName: 'Leannon',
            phoneNumber: '1-232-825-6075 x620',
            image: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.svg',
            level: 1,
            site: 'N/A',
            skill: 'N/A',
            dob: 'N/A',
            designation: 'N/A',
            department: 'N/A',
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully!',
      }),
    );
  },
);

export const fetchUserDetailsError = rest.get(
  `${usersServiceEndPoint}/users/:id`,
  async (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        statusCode: 400,
        message: 'Error fetching user detail',
      }),
    );
  },
);

export const fetchSalesUsersGraphData = rest.get(
  `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          usersGraphData: Users,
        },
      }),
    );
  },
);

export const fetchSalesUsersGraphDataError = rest.get(
  `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching missed users graph data',
      }),
    );
  },
);

export const fetchSalesDealsGraphData = rest.get(
  `${REACT_APP_LOCATIONS_URL}/web/deals/cumulative_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          byOpenDeals: Users,
        },
      }),
    );
  },
);

export const fetchSalesDealsGraphDataError = rest.get(
  `${REACT_APP_LOCATIONS_URL}/web/deals/cumulative_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching missed users deals data',
      }),
    );
  },
);

export const fetchUsersRegisteredForSalesOverTheYearGraphData = rest.get(
  `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_over_last_tweleve_months_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          clientsOverTheYear: UserOverYear,
        },
      }),
    );
  },
);

export const fetchUsersRegisteredForSalesOverTheYearGraphDataError = rest.get(
  `${REACT_APP_FRANCHISE_BASE_URL}/home_office/users/interns_sales_persons_over_last_tweleve_months_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching users registered over the year graph data',
      }),
    );
  },
);

export const userHandlers = [
  updateUsersAvailabilityMsw,
  fetchAllUsers,
  fetchAllUsersError,
  fetchUserDetails,
  fetchUserDetailsError,
  fetchUserTypeGraphData,
  fetchUserTypeGraphDataError,
  fetchMissedJobsGraphData,
  fetchMissedJobsGraphDataError,
  fetchJobsPerformedOverTheYearGraphData,
  fetchJobsPerformedOverTheYearGraphDataError,
  fetchUsersRegisteredForSalesOverTheYearGraphData,
  fetchSalesDealsGraphData,
  fetchSalesUsersGraphData,
  fetchSalesUsersGraphDataError,
  fetchSalesDealsGraphDataError,
  fetchUsersRegisteredForSalesOverTheYearGraphDataError,
];
