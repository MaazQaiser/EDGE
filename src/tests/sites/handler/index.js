import { rest } from 'msw';
import { Clients } from 'src/app/components/homeOfficeComponents/graph/stubbedData';
import { Employees } from 'src/app/obx/pages/sites/listing/component/graph/stubbbedData';
import { validateParamForMockApi } from 'src/helper/utilityFunctions';
import {
  salesEndpoint,
  sitesServiceEndPoint,
  sitesServiceNodeEndPoint,
  visitorsEndpoint,
} from 'src/services/sites.services';
import { contactData } from 'src/stubbedData/mocks/contact.mock';

import stubbedData from '../../../stubbedData';

// // eslint-disable-next-line no-undef
// const sitesServiceEndPoint = process.env.REACT_APP_FRANCHISE;
// const sitesServiceNodeEndPoint = process.env.REACT_APP_SCHEDULING;

export const fetchAllSites = rest.get(
  `${sitesServiceEndPoint}/sites/list`,
  async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(stubbedData.sites.list.success));
  },
);

export const fetchAllSitesError = rest.get(
  `${sitesServiceEndPoint}/sites/list`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.sites.list.failure.statusCode),
      ctx.json({
        statusCode: stubbedData.sites.list.failure.statusCode,
        message: stubbedData.sites.list.failure.message,
      }),
    );
  },
);

export const fetchAllSitesDevice = rest.get(
  `${sitesServiceEndPoint}/sites/:id/devices`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.sites.siteDevices.success.statusCode),
      ctx.json(stubbedData.sites.siteDevices.success),
    );
  },
);

export const fetchAllSitesDeviceError = rest.get(
  `${sitesServiceEndPoint}/sites/:id/devices`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.sites.siteDevices.failure.statusCode),
      ctx.json(stubbedData.sites.siteDevices.failure),
    );
  },
);

export const fetchAttendance = rest.get(
  `${sitesServiceNodeEndPoint}/shift/listCheckinLogs`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.sites.siteAttendance.success.statusCode),
      ctx.json(stubbedData.sites.siteAttendance.success),
    );
  },
);

export const fetchAttendanceError = rest.get(
  `${sitesServiceNodeEndPoint}/shift/listCheckinLogs`,
  async (req, res, ctx) => {
    return res(
      ctx.status(stubbedData.sites.siteAttendance.failure.statusCode),
      ctx.json(stubbedData.sites.siteAttendance.failure),
    );
  },
);

export const fetchAllCheckpoints = rest.get(
  `${sitesServiceEndPoint}/sites/:id/checkpoints`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.list.success.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.list.success),
    );
  },
);

export const fetchAllCheckpointsError = rest.get(
  `${sitesServiceEndPoint}/sites/:id/checkpoints`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.list.failure.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.list.failure),
    );
  },
);

export const createSiteCheckPointMSW = rest.post(
  `${sitesServiceEndPoint}/sites/:id/checkpoints`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteCheckpoints;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }

    return res(
      ctx.status(stubData.create.success.statusCode),
      ctx.json({
        statusCode: stubData.create.success.statusCode,
        message: stubData.create.success.message,
      }),
    );
  },
);

export const updateSiteCheckPointMSW = rest.put(
  `${sitesServiceEndPoint}/checkpoints/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteCheckpoints?.update;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.failure.statusCode),
        ctx.json({
          statusCode: stubData.failure.statusCode,
          message: stubData.failure.message,
        }),
      );
    }

    return res(
      ctx.status(stubData.success.statusCode),
      ctx.json({
        statusCode: stubData.success.statusCode,
        message: stubData.success.message,
      }),
    );
  },
);

export const getCheckpointDetail = rest.get(
  `${sitesServiceEndPoint}/checkpoints/:id`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.getOne.success.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.getOne.success),
    );
  },
);

export const getCheckpointDetailError = rest.get(
  `${sitesServiceEndPoint}/checkpoints/:id`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.getOne.failure.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.getOne.failure),
    );
  },
);

export const deleteCheckpoint = rest.get(
  `${sitesServiceEndPoint}/checkpoints/:id`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.delete.success.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.delete.success),
    );
  },
);

export const deleteCheckpointError = rest.get(
  `${sitesServiceEndPoint}/checkpoints/:id`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteCheckpoints.delete.failure.statusCode),
      ctx.json(stubbedData.sites.siteCheckpoints.delete.failure),
    );
  },
);

export const fetchLocations = rest.get(
  `${sitesServiceEndPoint}/sites/:id/locations`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteLocations.success.statusCode),
      ctx.json(stubbedData.sites.siteLocations.success),
    );
  },
);

export const fetchLocationsError = rest.get(
  `${sitesServiceEndPoint}/sites/:id/locations`,
  async (req, res, ctx) => {
    if (!req?.params || validateParamForMockApi(req)) {
      const stubData = stubbedData?.sites?.siteCheckpoints;
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteLocations.failure.statusCode),
      ctx.json(stubbedData.sites.siteLocations.failure),
    );
  },
);

export const createSiteInstructionsExceptionMSW = rest.post(
  `${sitesServiceEndPoint}/instructions/:id/exceptions`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteExceptionInstructions;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }

    return res(
      ctx.status(stubData.create.success.statusCode),
      ctx.json({
        statusCode: stubData.create.success.statusCode,
        message: stubData.create.success.message,
      }),
    );
  },
);

export const updateSiteInstructionsExceptionMSW = rest.put(
  `${sitesServiceEndPoint}/instructions/:id/exceptions`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteExceptionInstructions;
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

export const createSiteInstructionsMSW = rest.post(
  `${sitesServiceEndPoint}/instructions/site/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteInstructions;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubData.create.success.statusCode),
      ctx.json({
        statusCode: stubData.create.success.statusCode,
        message: stubData.create.success.message,
      }),
    );
  },
);

export const updateSiteInstructionsMSW = rest.put(
  `${sitesServiceEndPoint}/instructions/site/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteInstructions;
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

export const createSiteLocationsMSW = rest.post(
  `${sitesServiceEndPoint}/sites/:id/locations`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteLocations;
    if (!req?.body || validateParamForMockApi(req)) {
      return res(
        ctx.status(stubData.create.failure.statusCode),
        ctx.json({
          statusCode: stubData.create.failure.statusCode,
          message: stubData.create.failure.message,
        }),
      );
    }
    return res(
      ctx.status(stubData.create.success.statusCode),
      ctx.json({
        statusCode: stubData.create.success.statusCode,
        message: stubData.create.success.message,
      }),
    );
  },
);

export const updateSiteLocationsMSW = rest.put(
  `${sitesServiceEndPoint}/locations/:id`,
  (req, res, ctx) => {
    const stubData = stubbedData?.sites?.siteLocations;
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

export const fetchVisitorsAndLoads = rest.get(
  `${visitorsEndpoint}/visitors`,
  async (req, res, ctx) => {
    const url = new URL(req.url);

    // Read the "id" URL query parameter using the "URLSearchParams" API.
    // Given "/url?category=truckLoad", "productId" will equal "1".
    const category = url.searchParams.get('category');
    if (category === 'truckLoad') {
      return res(
        ctx.status(stubbedData.sites.siteLoads.success.statusCode),
        ctx.json(stubbedData.sites.siteLoads.success),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteVisitors.success.statusCode),
      ctx.json(stubbedData.sites.siteVisitors.success),
    );
  },
);

export const fetchVisitorsAndLoadsError = rest.get(
  `${visitorsEndpoint}/visitors`,
  async (req, res, ctx) => {
    if (category === 'truckLoad') {
      return res(
        ctx.status(stubbedData.sites.siteLoads.success.statusCode),
        ctx.json(stubbedData.sites.siteLoads.success),
      );
    }
    return res(
      ctx.status(stubbedData.sites.siteVisitors.failure.statusCode),
      ctx.json(stubbedData.sites.siteVisitors.failure),
    );
  },
);

export const getSitesContracts = rest.get(
  `${sitesServiceEndPoint}/sites/:id/contracts`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteContracts?.list?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteContracts?.list?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteContracts?.list?.success?.data),
    );
  },
);

export const getSitesReportTemplates = rest.get(
  `${sitesServiceNodeEndPoint}/shift/templates/:id`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteReportTemplates?.list?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteReportTemplates?.list?.success.statusCode),
      ctx.json(stubbedData?.sites?.siteReportTemplates?.list?.success.data),
    );
  },
);

export const getSitesInstructions = rest.get(
  `${sitesServiceEndPoint}/site/:id/instruction`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteInstructions?.getOne?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteInstructions?.getOne?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteInstructions?.getOne?.success.instructions),
    );
  },
);

export const deleteException = rest.get(
  `${sitesServiceEndPoint}/instructions/:id/instruction_details`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteExceptionInstructions?.create?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.success.message),
    );
  },
);

export const createExceptionInstructions = rest.post(
  `${sitesServiceEndPoint}/instructions/:id/exceptions`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteExceptionInstructions?.create?.success.statusCode),
      ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.success.message),
    );
  },
);

export const updateExceptionInstructions = rest.put(
  `${sitesServiceEndPoint}/exceptions/:id`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteExceptionInstructions?.create?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteExceptionInstructions?.create?.success.message),
    );
  },
);

export const deleteSiteLocation = rest.delete(
  `${sitesServiceEndPoint}/locations/:id`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteLocations?.delete?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteLocations?.delete?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteLocations?.delete?.success.message),
    );
  },
);

export const getSiteLocationById = rest.get(
  `${sitesServiceEndPoint}/locations/:id`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(
        ctx.status(500),
        ctx.json(stubbedData?.sites?.siteLocations?.getOne?.failure?.message),
      );
    }
    return res(
      ctx.status(stubbedData?.sites?.siteLocations?.getOne?.success?.statusCode),
      ctx.json(stubbedData?.sites?.siteLocations?.getOne?.success?.message),
    );
  },
);

export const getSiteLocations = rest.get(
  `${sitesServiceEndPoint}/sites/:id/locations`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id || !req.url.searchParams.get('perPage') || !req.url.searchParams.get('page')) {
      return res(ctx.status(500), ctx.json(stubbedData['sites']?.siteLocations?.failure?.message));
    }
    return res(
      ctx.status(stubbedData['sites']?.siteLocations?.success?.statusCode),
      ctx.json(stubbedData['sites']?.siteLocations?.success.data),
    );
  },
);

export const getAllCheckPoints = rest.get(
  `${sitesServiceEndPoint}/sites/:id/checkpoints`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id || !req.url.searchParams.get('perPage') || !req.url.searchParams.get('page')) {
      return res(ctx.status(500), ctx.json('Request failed with status code 500'));
    }
    return res(
      ctx.status(stubbedData['sites']?.siteCheckpoints?.list?.success?.statusCode),
      ctx.json(stubbedData['sites']?.siteCheckpoints?.list?.success?.data),
    );
  },
);
export const getSitesAllLocations = rest.get(
  `${sitesServiceEndPoint}/sites/:id/locations/options`,
  async (req, res, ctx) => {
    const { id } = req.params;
    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData['sites']?.siteLocations?.failure?.message));
    }
    return res(
      ctx.status(stubbedData['sites']?.siteLocations?.success.statusCode),
      ctx.json(stubbedData['sites']?.siteLocations?.success?.data),
    );
  },
);

export const getSitesAllDevices = rest.get(
  `${sitesServiceEndPoint}/sites/:id/devices/device_options`,
  async (req, res, ctx) => {
    const { id } = req.params;

    if (!id || !req.url.searchParams.get('type')) {
      return res(ctx.status(500), ctx.json(stubbedData['sites']?.siteDevices?.failure?.message));
    }
    return res(
      ctx.status(stubbedData['sites']?.siteDevices?.success.statusCode),
      ctx.json(stubbedData['sites']?.siteDevices?.success?.data),
    );
  },
);
export const getCheckpointType = rest.get(
  `${sitesServiceEndPoint}/sites/:id/checkpoints/checkpoint_types`,
  async (req, res, ctx) => {
    const { id } = req.params;

    if (!id) {
      return res(ctx.status(500), ctx.json(stubbedData?.sites?.siteCheckpointTypes?.failure));
    }
    return res(
      ctx.status(stubbedData?.sites?.siteCheckpointTypes?.success.statusCode),
      ctx.json(stubbedData?.sites?.siteCheckpointTypes?.success.data),
    );
  },
);

export const updateSite = rest.post(`${sitesServiceEndPoint}/sites/:id`, async (req, res, ctx) => {
  const { id } = req.params;

  if (!id) {
    return res(ctx.status(500), ctx.json(stubbedData?.updateSite.failure.status));
  }
  return res(
    ctx.status(stubbedData?.updateSite.success.status),
    ctx.json(stubbedData?.updateSite.success.message),
  );
});

export const getSiteLoadVisits = rest.get(
  `${visitorsEndpoint}/visitors/:id/visits`,
  async (req, res, ctx) => {
    const { id } = req.params;

    if (!id || !req.url.searchParams.get('perPage') || !req.url.searchParams.get('page')) {
      return res(ctx.status(500), ctx.json(stubbedData['sites'].siteLoadVisits.failure.message));
    }
    return res(
      ctx.status(stubbedData['sites'].siteLoadVisits.success.statusCode),
      ctx.json(stubbedData['sites'].siteLoadVisits.success.data),
    );
  },
);
export const getSiteLoadDetails = rest.get(
  `${visitorsEndpoint}/visitors/:vehicleId`,
  async (req, res, ctx) => {
    const { vehicleId } = req.params;

    if (!vehicleId || !req.url.searchParams.get('visitorTypeId')) {
      return res(ctx.status(500), ctx.json(stubbedData['sites'].siteLoadDetails.failure.message));
    }
    return res(
      ctx.status(stubbedData['sites'].siteLoadDetails.success.statusCode),
      ctx.json(stubbedData['sites'].siteLoadDetails.success.data),
    );
  },
);

export const getSiteLoadTypes = rest.get(
  `${visitorsEndpoint}/visitors/visitor_types`,
  async (req, res, ctx) => {
    if (
      !req.url.searchParams.get('siteId') ||
      !req.url.searchParams.get('visitorId') ||
      !req.url.searchParams.get('category')
    ) {
      return res(ctx.status(500), ctx.json(stubbedData['sites'].siteLoadTypes.failure.message));
    }
    return res(
      ctx.status(stubbedData['sites'].siteLoadTypes.success.statusCode),
      ctx.json(stubbedData['sites'].siteLoadTypes.success.data),
    );
  },
);

export const getSiteVisitors = rest.get(
  `${visitorsEndpoint}/visitors/:visitorId/visits`,
  async (req, res, ctx) => {
    if (!req.url.searchParams.get('page') || !req.url.searchParams.get('pagePer') || !visitorId) {
      return res(ctx.status(500), ctx.json(stubbedData['sites'].siteVisitorVisits.failure.message));
    }
    return res(
      ctx.status(stubbedData['sites'].siteVisitorVisits.success.statusCode),
      ctx.json(stubbedData['sites'].siteVisitorVisits.success.data),
    );
  },
);

export const getYearlyStats = rest.get(
  `${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats`,
  async (req, res, ctx) => {
    if (!req.url.searchParams.get('franchiseId')) {
      return res(ctx.status(500), ctx.json('No Data Found.'));
    }
    return res(ctx.status(200), ctx.json(contactData.yearlyStats.data));
  },
);

export const getSiteClientsGraphData = rest.get(
  `${sitesServiceEndPoint}/sites/clients_graph`,
  async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(Clients));
  },
);

export const getSiteGraphData = rest.get(
  `${sitesServiceEndPoint}/sites/sites_graph`,
  async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(Employees));
  },
);

export const fetchSiteGraphData = rest.get(
  `${sitesServiceEndPoint}/sites/sites_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          sitesGraphData: {
            data: [
              {
                name: 'Requires Attention',
                value: 15,
              },
              {
                name: 'Non Functional',
                value: 4,
              },
              {
                name: 'Functional',
                value: 7,
              },
            ],
            colors: ['#FECDCA', '#E6E6E7', '#146DFF'],
            stats: {
              total: 26,
            },
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully!',
      }),
    );
  },
);

export const fetchSiteGraphDataError = rest.get(
  `${sitesServiceEndPoint}/sites/sites_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching site graph data',
      }),
    );
  },
);

export const fetchSiteClientsGraphData = rest.get(
  `${sitesServiceEndPoint}/sites/clients_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          clientsGraphData: {
            colors: ['#146DFF', '#FFEED4', '#DEF1DE', '#A9DEFF', '#E6E6E7'],
            data: [
              {
                name: 'industry',
                value: 25,
              },
              {
                name: 'commercial',
                value: 1,
              },
            ],
            stats: {
              total: 2,
            },
          },
        },
        statusCode: 200,
        message: 'The record has been fetched successfully!',
      }),
    );
  },
);

export const fetchSiteClientsGraphDataError = rest.get(
  `${sitesServiceEndPoint}/sites/clients_graph`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching site clients graph data',
      }),
    );
  },
);

export const fetchSiteClientsOverTheYearGraphData = rest.get(
  `${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats`,
  async (req, res, ctx) => {
    const franchiseId = req.url.searchParams.get('franchiseId');

    if (!franchiseId) {
      return res(
        ctx.status(400),
        ctx.json({
          statusCode: 400,
          message: 'Franchise ID is required',
        }),
      );
    }

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
              clients: [0, 0, 0, 0, 0, 0, 0, 0, 901, 0, 0, 0],
              contracts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            },
            colors: {
              clients: ['#146DFF', '#A6C3F0'],
              contracts: ['#86868B', '#E0ECFF'],
            },
          },
        },
        statusCode: 200,
        message: 'success',
      }),
    );
  },
);

export const fetchSiteClientsOverTheYearGraphDataError = rest.get(
  `${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats`,
  async (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        statusCode: 500,
        message: 'Error fetching site clients over the year graph data',
      }),
    );
  },
);

export const sitesHandlers = [
  fetchAllSites,
  getSiteGraphData,
  updateSite,
  getSiteLoadDetails,
  fetchAllSitesError,
  fetchAllSitesDevice,
  updateExceptionInstructions,
  getSiteLoadVisits,
  getSiteLocationById,
  deleteException,
  getYearlyStats,
  getSiteClientsGraphData,
  fetchAllSitesDeviceError,
  fetchAttendance,
  fetchAttendanceError,
  getAllCheckPoints,
  createExceptionInstructions,
  fetchAttendance,
  fetchAttendanceError,
  fetchAllCheckpoints,
  fetchAllCheckpointsError,
  getSiteLoadTypes,
  getSitesAllDevices,
  getSitesContracts,
  getSitesInstructions,
  createSiteCheckPointMSW,
  getSitesAllLocations,
  getCheckpointType,
  updateSiteCheckPointMSW,
  getCheckpointDetail,
  getSitesReportTemplates,
  createSiteCheckPointMSW,
  fetchAllSites,
  fetchAllSitesError,
  fetchAllSitesDevice,
  fetchAllSitesDeviceError,
  fetchAttendance,
  fetchAttendanceError,
  updateSiteCheckPointMSW,
  getCheckpointDetail,
  getCheckpointDetailError,
  deleteCheckpoint,
  deleteCheckpointError,
  fetchLocations,
  fetchLocationsError,
  createSiteInstructionsMSW,
  updateSiteInstructionsMSW,
  createSiteInstructionsExceptionMSW,
  updateSiteInstructionsExceptionMSW,
  createSiteLocationsMSW,
  updateSiteLocationsMSW,
  fetchVisitorsAndLoads,
  deleteSiteLocation,
  fetchVisitorsAndLoadsError,
  fetchSiteGraphData,
  fetchSiteGraphDataError,
  fetchSiteClientsGraphData,
  fetchSiteClientsGraphDataError,
  fetchSiteClientsOverTheYearGraphData,
  fetchSiteClientsOverTheYearGraphDataError,
];
