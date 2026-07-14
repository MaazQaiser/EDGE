/* eslint-disable no-undef */
import Axios from 'axios';
import { Clients } from 'src/app/components/homeOfficeComponents/graph/stubbedData';
import { Employees } from 'src/app/obx/pages/sites/listing/component/graph/stubbbedData';
import { contactData } from 'src/stubbedData/mocks/contact.mock';

import stubbedData from '../../../stubbedData';
import { mswServer } from '../../../tests/server';
import {
  createExceptionInstructions,
  deleteException,
  deleteSiteLocation,
  getAllCheckPoints,
  getCheckpointType,
  getSiteClientsGraphData,
  getSiteGraphData,
  getSiteLoadTypes,
  getSiteLoadVisits,
  getSiteLoadVisitsDetails,
  getSiteLocationById,
  getSiteLocations,
  getSitesAllDevices,
  getSitesAllLocations,
  getSitesContracts,
  getSitesInstructions,
  getSitesReportTemplates,
  getYearlyStats,
  updateExceptionInstructions,
} from '../handler';
export const salesEndpoint = process.env.REACT_APP_SALES;
const sitesServiceEndPoint = process.env.REACT_APP_FRANCHISE;
export const visitorsEndpoint = process.env.REACT_APP_VISITORS;
export const sitesServiceNodeEndPoint = process.env.REACT_APP_SCHEDULING;

describe('getSitesContracts', () => {
  test('Fetch All Sites Contracts', async () => {
    const siteId = 12;
    const response = await Axios.get(`${sitesServiceEndPoint}/sites/${siteId}/contracts`);
    expect(response.status).toBe(stubbedData?.sites?.siteContracts?.list?.success?.statusCode);
    expect(stubbedData?.sites?.siteContracts?.list?.success?.data?.contracts).toBe(
      stubbedData?.sites?.siteContracts?.list?.success?.data.contracts,
    );
  });

  test('Fetch All Sites error', async () => {
    try {
      mswServer.use(getSitesContracts);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteContracts?.list?.failure?.statusCode,
      );
    }
  });
});

describe('getSitesReportTemplate', () => {
  test('Fetch Site Report Templates', async () => {
    const siteId = 12;
    const response = await Axios.get(`${sitesServiceNodeEndPoint}/shift/templates/${siteId}`);
    expect(response.data.templates).toStrictEqual(
      stubbedData?.sites?.siteReportTemplates?.list?.success.data.templates,
    );
  });

  test('Fetch Site Report Templates', async () => {
    try {
      mswServer.use(getSitesReportTemplates);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteReportTemplates?.list?.failure.status,
      );
    }
  });
});

describe('getSiteInstructions', () => {
  test('Fetch Site Instructions', async () => {
    const siteId = 12;
    const response = await Axios.get(`${sitesServiceEndPoint}/site/${siteId}/instruction`);
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteInstructions?.getOne?.success?.instructions,
    );
  });

  test('Fetch Site Instructions failure', async () => {
    try {
      mswServer.use(getSitesInstructions);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteInstructions?.getOne?.failure.statusCode,
      );
    }
  });
});

describe('createSiteException', () => {
  test('Create Site  Exceptions', async () => {
    const siteId = 12;
    const response = await Axios.post(`${sitesServiceEndPoint}/instructions/${siteId}/exceptions`);
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteExceptionInstructions?.create?.success.message,
    );
  });

  test('Create Site  Exception failure', async () => {
    try {
      mswServer.use(createExceptionInstructions);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message,
      );
    }
  });
});

describe('getSiteExceptions', () => {
  test('Fetch Site Exceptions', async () => {
    const siteId = 12;
    const response = await Axios.get(
      `${sitesServiceEndPoint}/instructions/${siteId}/instruction_details`,
    );
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteExceptionInstructions?.create?.success.message,
    );
  });

  test('Fetch Site Exception failure', async () => {
    try {
      mswServer.use(deleteException);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message,
      );
    }
  });
});

describe('updateSiteExceptionInstruction', () => {
  test('update Site exception instruction', async () => {
    const siteId = 12;
    const response = await Axios.put(`${sitesServiceEndPoint}/exceptions/${siteId}`);
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteExceptionInstructions?.create?.success.message,
    );
  });

  test('update site exception instruction failure', async () => {
    try {
      mswServer.use(updateExceptionInstructions);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteExceptionInstructions?.create?.failure?.message,
      );
    }
  });
});

describe('deleteSiteLocation', () => {
  test('Delete Site location', async () => {
    const siteId = 12;
    const response = await Axios.delete(`${sitesServiceEndPoint}/locations/${siteId}`);
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteLocations?.delete?.success?.message,
    );
  });

  test('delete site location failure', async () => {
    try {
      mswServer.use(deleteSiteLocation);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteLocations?.delete?.failure?.statusCode,
      );
    }
  });
});

describe('getSiteLocationbyId', () => {
  test('Get Site location By Id', async () => {
    const siteId = 12;
    const response = await Axios.get(`${sitesServiceEndPoint}/locations/${siteId}`);
    expect(response.data).toStrictEqual(
      stubbedData?.sites?.siteLocations?.getOne?.success?.message,
    );
  });

  test('delete site location by id failure', async () => {
    try {
      mswServer.use(getSiteLocationById);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteLocations?.getOne?.success?.statusCode,
      );
    }
  });
});

describe('getSiteLocations', () => {
  test('Get Site locations', async () => {
    const siteId = 12;
    const query = { page: 12, perPage: 12 };
    const response = await Axios.get(`${sitesServiceEndPoint}/sites/${siteId}/locations?${query}`);
    expect(response.data.data).toStrictEqual(stubbedData['sites']?.siteLocations?.success?.data);
  });

  test('delete site locations failure', async () => {
    try {
      mswServer.use(getSiteLocations);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites']?.siteLocations?.failure?.statusCode,
      );
    }
  });
});

describe('getAllCheckpoints', () => {
  test('Get All Check Points', async () => {
    const siteId = 12;
    const response = await Axios.get(
      `${sitesServiceEndPoint}/sites/${siteId}/checkpoints?page=12&perPage=2`,
    );
    expect(response.data).toStrictEqual(stubbedData['sites']?.siteCheckpoints?.list?.success?.data);
  });
  test('Get All Check Points get error on no query params', async () => {
    try {
      const siteId = 12;
      await Axios.get(`${sitesServiceEndPoint}/sites/${siteId}/checkpoints`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('get all check points failure', async () => {
    try {
      mswServer.use(getAllCheckPoints);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites']?.siteCheckpoints?.list?.failure?.statusCode,
      );
    }
  });
});

describe('getSitesAllLocations', () => {
  test('Get all site locations', async () => {
    const siteId = 12;
    const response = await Axios.get(`${sitesServiceEndPoint}/sites/${siteId}/locations/options`);
    expect(response.data).toStrictEqual(stubbedData['sites']?.siteLocations?.success.data);
  });

  test('get all site locations failure', async () => {
    try {
      mswServer.use(getSitesAllLocations);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites']?.siteLocations?.failure.statusCode,
      );
    }
  });
});

describe('getSiteAllDevices', () => {
  test('Get all site devices', async () => {
    const siteId = 12;
    const response = await Axios.get(
      `${sitesServiceEndPoint}/sites/${siteId}/devices/device_options?type="N"`,
    );
    expect(response.data).toStrictEqual(stubbedData['sites']?.siteDevices?.success.data);
  });

  test('Get all site devices error  no params', async () => {
    try {
      const siteId = 12;
      await Axios.get(`${sitesServiceEndPoint}/sites/${siteId}/devices/device_options`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('get all site devices failure', async () => {
    try {
      mswServer.use(getSitesAllDevices);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites']?.siteDevices?.failure.statusCode,
      );
    }
  });
});

describe('getCheckPointType', () => {
  test('Get checkpoint type', async () => {
    const siteId = 12;
    const response = await Axios.get(
      `${sitesServiceEndPoint}/sites/${siteId}/checkpoints/checkpoint_types`,
    );
    expect(response.data).toStrictEqual(stubbedData?.sites?.siteCheckpointTypes?.success.data);
  });

  test('get checkpoint type failure', async () => {
    try {
      mswServer.use(getCheckpointType);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData?.sites?.siteCheckpointTypes?.failure.status,
      );
    }
  });
});

describe('updateSite', () => {
  test('update site', async () => {
    const siteId = 12;
    const response = await Axios.post(`${sitesServiceEndPoint}/sites/${siteId}`);
    expect(response.data).toStrictEqual(stubbedData?.updateSite.success.message);
  });

  test('update site failure', async () => {
    try {
      mswServer.use(getCheckpointType);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(stubbedData?.updateSite.failure.status);
    }
  });
});

describe('getSiteLoadVisits', () => {
  test('getSiteLoadVisits', async () => {
    const siteId = 12;
    const response = await Axios.get(
      `${visitorsEndpoint}/visitors/${siteId}/visits?perPage=1&page=2`,
    );
    expect(response.data).toStrictEqual(stubbedData['sites'].siteLoadVisits.success.data);
  });

  test('Get all site laod and visits error  no params', async () => {
    try {
      const siteId = 12;
      await Axios.get(`${visitorsEndpoint}/visitors/${siteId}/visits`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('getSiteLoadVisits failure', async () => {
    try {
      mswServer.use(getSiteLoadVisits);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites'].siteLoadVisits.failure.status,
      );
    }
  });
});

describe('getSiteLoadVisitsDetails', () => {
  test('getSiteLoadVisitsDetails', async () => {
    const siteId = 12;
    const response = await Axios.get(`${visitorsEndpoint}/visitors/${siteId}?visitorTypeId=2`);
    expect(response.data).toStrictEqual(stubbedData['sites'].siteLoadDetails.success.data);
  });

  test('Get all site laod and visits details error  no params', async () => {
    try {
      const siteId = 12;
      Axios.get(`${visitorsEndpoint}/visitors/${siteId}?visitorTypeId=2`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('getSiteLoadVisitsDetails failure', async () => {
    try {
      mswServer.use(getSiteLoadVisitsDetails);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites'].siteLoadDetails.failure.status,
      );
    }
  });
});

describe('getSiteLoadVisitsDetailsTypes', () => {
  test('Get all site laod and visits details error  no params', async () => {
    try {
      await Axios.get(`${visitorsEndpoint}/visitors/visitor_types`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('getSiteLoadVisitsDetailsTypes failure', async () => {
    try {
      mswServer.use(getSiteLoadTypes);
    } catch (error) {
      expect(error.response.data.statusCode).toBe(
        stubbedData['sites'].siteLoadDetails.failure.status,
      );
    }
  });
});

describe('getYearlyStats', () => {
  test('getYearlyStats for test ', async () => {
    const response = await Axios.get(
      `${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats?franchiseId=12`,
    );
    expect(response.data).toStrictEqual(contactData.yearlyStats.data);
  });

  test('Get all site laod and visits details error  no params', async () => {
    try {
      await Axios.get(`${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats`);
    } catch (e) {
      expect(e.message).toBe('Request failed with status code 500');
    }
  });

  test('getYearlyStats failure', async () => {
    try {
      mswServer.use(getYearlyStats);
    } catch (error) {
      expect(error.message).toBe('No Data Found.');
    }
  });
});

describe('getClientsGraphData', () => {
  test('getCientsGraphData success ', async () => {
    const response = await Axios.get(`${sitesServiceEndPoint}/sites/clients_graph`);
    expect(response.data).toStrictEqual(Clients);
  });

  test('getClientsGraphData failure', async () => {
    try {
      mswServer.use(getSiteClientsGraphData);
    } catch (error) {
      expect(error.message).toBe('No Data Found.');
    }
  });
});

describe('getSiteGraphData', () => {
  test('getSiteGraphData success ', async () => {
    const response = await Axios.get(`${sitesServiceEndPoint}/sites/sites_graph`);
    expect(response.data).toStrictEqual(Employees);
  });

  test('getSiteGraphData failure', async () => {
    try {
      mswServer.use(getSiteGraphData);
    } catch (error) {
      expect(error.message).toBe('No Data Found.');
    }
  });
});
