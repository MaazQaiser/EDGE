import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';

import { throwAPIError } from '../utils/throwAPIError';

// eslint-disable-next-line no-undef
export const sitesServiceEndPoint = process.env.REACT_APP_FRANCHISE;
export const sitesServiceNodeEndPoint = process.env.REACT_APP_SCHEDULING;

export const visitorsEndpoint = process.env.REACT_APP_VISITORS;

export const salesEndpoint = process.env.REACT_APP_SALES;

export const templateServiceEndpoint = process.env.REACT_APP_TEMPLATE;

export const getSiteGraphData = async () => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/sites_graph`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteClientsGraphData = async () => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/clients_graph`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteClientsOverTheYearGraphData = async (id) => {
  try {
    return await getHttpRequest(
      `${salesEndpoint}/web/external_stats/franchise_contracts_yearly_stats?franchiseId=${id}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteDetails = async (siteId) => {
  try {
    if (!siteId) {
      throw new Error();
    }

    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${siteId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAllSites = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: false,
      skipNull: false,
    });

    return await getHttpRequest(`${sitesServiceEndPoint}/sites/list?${query}`, config);
  } catch (e) {
    throwAPIError(e);
  }
};

export const getAllTypeOfSites = async () => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/functional_non_functionals`);
  } catch (e) {
    throwAPIError(e.message);
  }
};

// Get Type API
export const getSites = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${sitesServiceEndPoint}/sites?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSingleSite = async (id) => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAddendumContractsList = async (id, config = {}) => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/addendum_contracts`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAddendumHistory = async (id, config = {}) => {
  try {
    return await getHttpRequest(`${sitesServiceEndPoint}/contracts/${id}/differences`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const acknowledgeAddendumContract = async (id, payload, config) => {
  try {
    return await putHttpRequest(
      `${sitesServiceEndPoint}/contracts/${id}/acknowledge_addendum`,
      payload,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteVisitors = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${visitorsEndpoint}/visitors?${query}`, config);
  } catch (e) {
    throw new Error(e);
  }
};

export const banExistingSiteVisitor = async (siteId, visitorId, payload) => {
  try {
    return await postHttpRequest(
      `${visitorsEndpoint}/sites/${siteId}/visitors/${visitorId}/bans`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const unbanExistingSiteVisitor = async (banId, payload) => {
  try {
    return await putHttpRequest(`${visitorsEndpoint}/bans/${banId}`, payload);
    // return createdSitesVisitorsData(queryParams.page, queryParams.perPage);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const banNewSiteVisitor = async (siteId, payload) => {
  try {
    return await postHttpRequest(
      `${visitorsEndpoint}/sites/${siteId}/ban_new_visitor?source=web`,
      payload,
    );
    // return createdSitesVisitorsData(queryParams.page, queryParams.perPage);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const checkIfNewVisitorIsBannedAlready = async (
  siteId,
  primaryId,
  category,
  config = {},
) => {
  try {
    let payload = {
      siteId,
      primaryId,
      category,
    };
    return await postHttpRequest(
      `${visitorsEndpoint}/visitors/find_visitor_by_site`,
      payload,
      config,
    );
    // return createdSitesVisitorsData(queryParams.page, queryParams.perPage);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteVisitorDetail = async (siteId, visitorId, visitorTypeId) => {
  try {
    const query = queryString.stringify(
      {
        siteId,
        visitorTypeId,
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${visitorsEndpoint}/visitors/${visitorId}?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const getSiteVisitorVisits = async ({ visitorId, ...rest }) => {
  try {
    const query = queryString.stringify(rest, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${visitorsEndpoint}/visitors/${visitorId}/visits?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const getSiteVisitorVisitsTypes = async (siteId, category, visitorId = null) => {
  try {
    const query = queryString.stringify(
      {
        siteId,
        visitorId,
        category,
        source: 'web',
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${visitorsEndpoint}/visitors/visitor_types?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const getSiteLoads = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${visitorsEndpoint}/visitors?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteLoadTypes = async (siteId, category, visitorId = null) => {
  try {
    const query = queryString.stringify(
      {
        siteId,
        visitorId,
        category,
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${visitorsEndpoint}/visitors/visitor_types?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const getSiteLoadDetails = async (siteId, vehicleId, visitorTypeId) => {
  try {
    const query = queryString.stringify(
      {
        siteId,
        visitorTypeId,
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${visitorsEndpoint}/visitors/${vehicleId}?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const getSiteLoadVisits = async ({ vehicleId, ...rest }) => {
  try {
    const query = queryString.stringify(rest, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${visitorsEndpoint}/visitors/${vehicleId}/visits?${query}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const updateSite = async (id, payload) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await putHttpRequest(`${sitesServiceEndPoint}/sites/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteAttendance = async (id, queryParam, config = {}) => {
  try {
    if (!id) {
      throw new Error(e);
    }

    const query = queryString.stringify(queryParam, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${sitesServiceNodeEndPoint}/shiftActivityLog/attendanceLogs?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteDevices = async (id, queryParams) => {
  try {
    if (!id) {
      return;
    }
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/devices?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCheckpointType = async (id) => {
  try {
    if (!id) {
      return;
    }
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/checkpoints/checkpoint_types`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSitesAllDevices = async (id, slug) => {
  try {
    if (!id) {
      return;
    }
    return await getHttpRequest(
      `${sitesServiceEndPoint}/sites/${id}/devices/device_options?type=${slug}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSitesAllLocations = async (id) => {
  try {
    if (!id) {
      return;
    }
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/locations/options`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteCheckpoints = async (id, queryParams) => {
  try {
    if (!id) {
      return;
    }
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/checkpoints?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteCheckpointById = async (id) => {
  try {
    if (!id) {
      return;
    }
    return await getHttpRequest(`${sitesServiceEndPoint}/checkpoints/${id}`);
  } catch (e) {
    throw new Error(e);
  }
};

export const createSiteCheckpoint = async (siteId, payload) => {
  try {
    if (isObjectEmpty(payload) || !siteId) {
      return;
    }
    return await postHttpRequest(`${sitesServiceEndPoint}/sites/${siteId}/checkpoints`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateSiteCheckpoint = async (id, payload) => {
  try {
    return await putHttpRequest(`${sitesServiceEndPoint}/checkpoints/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const deleteSiteCheckpoint = async (id) => {
  try {
    return await deleteHttpRequest(`${sitesServiceEndPoint}/checkpoints/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteLocations = async (id, queryParams) => {
  try {
    if (!id) {
      return;
    }
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${id}/locations?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createSiteLocations = async (siteId, payload) => {
  try {
    if (isObjectEmpty(payload) || !siteId) {
      return;
    }
    return await postHttpRequest(`${sitesServiceEndPoint}/sites/${siteId}/locations`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createSite = async (payload) => {
  try {
    if (isObjectEmpty(payload)) {
      throw new Error(stubbedData?.sites);
    }
    return await postHttpRequest(`${sitesServiceEndPoint}/sites`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createContract = async (payload) => {
  try {
    return await postHttpRequest(`${sitesServiceEndPoint}/contracts`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateSiteLocations = async (siteId, locationId, payload) => {
  try {
    if (isObjectEmpty(payload) || !locationId) {
      return;
    }
    return await putHttpRequest(`${sitesServiceEndPoint}/locations/${locationId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSiteLocationById = async (id) => {
  try {
    if (!id) {
      return;
    }

    return await getHttpRequest(`${sitesServiceEndPoint}/locations/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteSiteLocation = async (id) => {
  try {
    if (!id) {
      return;
    }

    return await deleteHttpRequest(`${sitesServiceEndPoint}/locations/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateSiteInstructions = async (id, payload) => {
  try {
    if (!id) {
      return;
    }

    return await putHttpRequest(`${sitesServiceEndPoint}/instructions/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createSiteInstructions = async (siteId, payload) => {
  try {
    if (!payload) {
      return;
    }

    return await postHttpRequest(`${sitesServiceEndPoint}/instructions/site/${siteId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSitesInstructionById = async (id) => {
  try {
    if (!id) {
      return;
    }
    return await getHttpRequest(`${sitesServiceEndPoint}/instructions/${id}/instruction_details`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateExceptionInstructions = async (id, payload) => {
  try {
    if (!id) {
      return;
    }

    return await putHttpRequest(`${sitesServiceEndPoint}/exceptions/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getExceptionInstructionById = async (id) => {
  try {
    if (!id) {
      return;
    }

    return await getHttpRequest(`${sitesServiceEndPoint}/instructions/${id}/instruction_details`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createExceptionInstructions = async (id, payload) => {
  try {
    if (!payload || !id) {
      return;
    }

    return await postHttpRequest(`${sitesServiceEndPoint}/instructions/${id}/exceptions`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteException = async (id) => {
  try {
    if (!id) {
      return;
    }

    return await deleteHttpRequest(`${sitesServiceEndPoint}/exceptions/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSitesInstructions = async (siteId, queryParams) => {
  try {
    if (!siteId) return;
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${sitesServiceEndPoint}/site/${siteId}/instruction?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getInstructionsExceptions = async (siteId) => {
  try {
    if (!siteId) {
      return;
    }

    return;
  } catch (e) {
    throw new Error(e);
  }
};

export const getSitesReportTemplates = async (siteId, templateableType) => {
  try {
    if (!siteId) {
      return;
    }

    const query = queryString.stringify(
      { siteId, templateableType },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${templateServiceEndpoint}/templates?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSitesContracts = async (siteId) => {
  try {
    if (!siteId) {
      return;
    }
    return await getHttpRequest(`${sitesServiceEndPoint}/sites/${siteId}/contracts`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteSitesContract = async (contractId) => {
  try {
    return await deleteHttpRequest(`${sitesServiceEndPoint}/contracts/${contractId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHolidayGroups = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: false,
      skipNull: false,
    });

    return await getHttpRequest(
      `${sitesServiceEndPoint}/holiday_groups/holiday_groups_dropdown?${query}`,
      config,
    );
  } catch (e) {
    throwAPIError(e.message);
  }
};
