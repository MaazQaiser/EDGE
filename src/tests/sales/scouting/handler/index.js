import { rest } from 'msw';
import { scoutingEndpointNode, scoutingEndpointSales } from 'services/scout.service';
import { validateParamForMockApi } from 'src/helper/utilityFunctions';

export const getScoutListing = rest.get(
  `${scoutingEndpointSales}/web/users/routes`,
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          routes: [
            {
              id: 777,
              name: 'Hamza Rizwan',
              image: null,
              userType: 'Sales Person',
              sitesVisited: 7,
              decisionMakerMeetings: 3,
              routeId: '65dc4d73653716fdaa26ce0d',
              routeCreatedDate: '02-26-2024',
            },
          ],
        },
        pagination: {
          currentPage: 1,
          nextPage: null,
          prevPage: null,
          totalPages: 1,
          totalCount: 1,
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const getRouteVisitedLocations = rest.get(
  `${scoutingEndpointNode}/route/visits/:id`,
  (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      return res(
        ctx.status(404),
        ctx.json({
          statusCode: 404,
          message: 'Route Not Found',
        }),
      );
    }
    return res(
      ctx.status(200),
      ctx.json({
        message: 'success',
        statusCode: 200,
        data: {
          visits: [
            {
              siteId: 1138,
              siteName: 'testing 100',
              address: '1734 Virginia Street\n Northbrook, Illinois 60062',
              coordinates: {
                lat: 31.516296,
                lng: 74.318296,
              },
              windowStart: '2024-02-26T08:35:00.000Z',
              visitedAt: '2024-02-26T18:02:00.000Z',
              addressStopType: 'MEETUP',
              visitStatus: 'LATE',
            },
          ],
        },
      }),
    );
  },
);

export const scoutingAPIHandlers = [getScoutListing, getRouteVisitedLocations];
