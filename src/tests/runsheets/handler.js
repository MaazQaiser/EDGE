import { rest } from 'msw';

import { routingServiceEndpoint, runsheetServiceEndPoint } from '../../services/runsheet.services';
import stubbedData from '../../stubbedData';
export const runsheets = `${runsheetServiceEndPoint}/runsheets`;

export const fetchAllOfficers = rest.get(runsheets, async (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({
      data: {
        officers: [
          {
            id: 1,
            name: 'Jane Smith',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 2,
            name: 'John Smith',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 3,
            name: 'Jane Doe',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
          {
            id: 4,
            name: 'John Doe',
            image:
              'https://as1.ftcdn.net/v2/jpg/02/43/51/48/1000_F_243514868_XDIMJHNNJYKLRST05XnnTj0MBpC4hdT5.jpg',
          },
        ],
        pagination: {
          currentPage: 1,
          nextPage: 2,
          prevPage: null,
          totalPages: 5,
          totalCount: 44,
        },
      },
      statusCode: 200,
    }),
  );
});

export const fetchAllOfficersError = rest.get(runsheets, (req, res, ctx) => {
  return res(
    ctx.status(500),
    ctx.json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'An error occurred while fetching officers.',
    }),
  );
});

export const fetchRunshetsByZoneIdMsw = rest.get(`${runsheets}/:zoneId`, (req, res, ctx) => {
  return res(
    ctx.status(stubbedData.runsheetStubbedData.success.status),
    ctx.json({
      statusCode: stubbedData.runsheetStubbedData.success.status,
      message: stubbedData.runsheetStubbedData.success.message,
      data: stubbedData.runsheetStubbedData.success.data,
    }),
  );
});
export const fetchRunshetsByZoneIdErrorMsw = rest.get(`${runsheets}/:zoneId`, (req, res, ctx) => {
  if (!req?.params?.zoneId) {
    return res(
      ctx.status(stubbedData.runsheetStubbedData.error.status),
      ctx.json({
        statusCode: stubbedData.runsheetStubbedData.error.status,
        message: stubbedData.runsheetStubbedData.error.message,
      }),
    );
  }

  return res(
    ctx.status(stubbedData.runsheetStubbedData.error.status),
    ctx.json({
      statusCode: stubbedData.runsheetStubbedData.error.status,
      message: stubbedData.runsheetStubbedData.error.message,
    }),
  );
});

export const fetchRunshetByIdMsw = rest.get(`${runsheetServiceEndPoint}/:id`, (req, res, ctx) => {
  return res(
    ctx.status(stubbedData.runsheetDetailStubbedData.success.status),
    ctx.json({
      statusCode: stubbedData.runsheetDetailStubbedData.success.status,
      message: stubbedData.runsheetDetailStubbedData.success.message,
      data: stubbedData.runsheetDetailStubbedData.success.data,
    }),
  );
});
export const fetchRunshetByIdErrorMsw = rest.get(
  `${runsheetServiceEndPoint}/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found!',
        }),
      );
    }

    return res(
      ctx.status(stubbedData.runsheetDetailStubbedData.error.status),
      ctx.json({
        statusCode: stubbedData.runsheetDetailStubbedData.error.status,
        message: stubbedData.runsheetDetailStubbedData.error.message,
      }),
    );
  },
);

export const deleteSiteOfRunsheetMsw = rest.patch(
  `${runsheetServiceEndPoint}/remove/:id`,
  (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.deleteSiteOfRunsheetStubbedData.success.status),
      ctx.json({
        statusCode: stubbedData.deleteSiteOfRunsheetStubbedData.success.status,
        message: stubbedData.deleteSiteOfRunsheetStubbedData.success.message,
      }),
    );
  },
);
export const deleteSiteOfRunsheetErrorMsw = rest.patch(
  `${runsheetServiceEndPoint}/remove/:id`,
  (req, res, ctx) => {
    if (!req?.params?.id) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Not Found!',
        }),
      );
    }

    return res(
      ctx.status(stubbedData.deleteSiteOfRunsheetStubbedData.error.status),
      ctx.json({
        statusCode: stubbedData.deleteSiteOfRunsheetStubbedData.error.status,
        message: stubbedData.deleteSiteOfRunsheetStubbedData.error.message,
      }),
    );
  },
);

export const getOfficersRunSheets = rest.get(
  `${routingServiceEndpoint}/route/runsheets`,
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          routes: [
            {
              date: '2024-01-25T07:00:00.000Z',
              title: 'Route - 25 January',
              totalSites: 4,
              visitsCompleted: 0,
              completionRate: '0%',
              summary: '0 out of 4 allocated sites were visited.',
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
      }),
    );
  },
);

export const runsheetHandler = [
  fetchAllOfficers,
  fetchAllOfficersError,
  fetchRunshetsByZoneIdMsw,
  fetchRunshetsByZoneIdErrorMsw,
  fetchRunshetByIdMsw,
  fetchRunshetByIdErrorMsw,
  deleteSiteOfRunsheetMsw,
  deleteSiteOfRunsheetErrorMsw,
  getOfficersRunSheets,
];
