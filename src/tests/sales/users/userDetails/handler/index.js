import { rest } from 'msw';
import { usersServiceEndPoint, usersServiceSalesEndPoint } from 'services/user.services';
import { validateParamForMockApi } from 'src/helper/utilityFunctions';

export const getUserBasicData = rest.get(`${usersServiceEndPoint}/users/:id`, (req, res, ctx) => {
  if (!req?.params || validateParamForMockApi(req)) {
    return res(
      ctx.status(404),
      ctx.json({
        statusCode: 404,
        message: '',
      }),
    );
  }

  return res(
    ctx.status(200),
    ctx.json({
      data: {
        user: {
          id: 2883,
          name: 'usama',
          zones: null,
          email: 'usama.akram+001@tkxel.io',
          role: 'SalesPerson',
          slug: 'sales_person',
          status: 'active',
          dutyType: null,
          joinedDate: null,
          firstName: 'usama',
          lastName: null,
          phoneNumber: null,
          image: 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png',
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
});

export const getUserSalesData = rest.get(
  `${usersServiceSalesEndPoint}/web/users/:id`,
  (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: '',
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: {
          id: 2883,
          locations: {
            assigned: 0,
            visited: 0,
            unvisited: 0,
          },
          dealsStats: {
            won: 0,
            lost: 0,
            total: 0,
          },
          deals: [],
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const getSalesUserLocations = rest.get(
  `${usersServiceSalesEndPoint}/web/users/:id/locations`,
  (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: '',
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: {
          locations: [],
        },
        pagination: {
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          totalPages: 1,
          totalCount: 0,
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const getSalesUserDeals = rest.get(
  `${usersServiceSalesEndPoint}/web/users/:id/deals`,
  (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: '',
        }),
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        data: {
          deals: [],
        },
        pagination: {
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          totalPages: 1,
          totalCount: 0,
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const salesUserDetailHandlers = [
  getUserBasicData,
  getUserSalesData,
  getSalesUserLocations,
  getSalesUserDeals,
];
