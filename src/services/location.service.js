import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;
const REACT_APP_FRANCHISE_BASE_URL = process.env.REACT_APP_FRANCHISE;
const REACT_APP_USER_BASE_URL = process.env.REACT_APP_USER;

export const getLocations = async (page, rowsPerPage, params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    query = query ? `&${query}` : '';

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/leads?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCompaniesOption = async (page, search, config) => {
  try {
    const query = queryString.stringify(
      { pageNo: page, search: search },
      {
        arrayFormat: 'bracket',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    // return companiesData.companiesOption;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/paginated_companies?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getStatesOptions = async () => {
  try {
    /**
     * use this for stubbed data
     */
    // return locationsData.states;
    /**
     * use this for real API call from backend
     */
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/states`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCitiesOptions = async (params) => {
  try {
    /**
     * use this for stubbed data
     */
    // return locationsData.cities;
    /**
     * use this for real API call from backend
     */
    let query = queryString.stringify({ stateIds: params }, { arrayFormat: 'bracket' });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/cities?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchisesOptions = async (data) => {
  try {
    let query = queryString.stringify(data, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_FRANCHISE_BASE_URL}/home_office/franchises/list?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationsCumulativeStats = async () => {
  try {
    // return locationsData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/leads/cumulative_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationsYearlyStats = async () => {
  try {
    // return dealsData.yearlyStats;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/leads/yearly_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSalesPersonOptions = async () => {
  try {
    /**
     * use this for stubbed data
     */
    // return locationsData.salesPersons;
    /**
     * use this for real API call from backend
     */
    return await getHttpRequest(`${REACT_APP_USER_BASE_URL}/home_office/users/sales_persons/list`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getInternsOptions = async () => {
  try {
    /**
     * use this for stubbed data
     */
    // return locationsData.cities;
    /**
     * use this for real API call from backend
     */
    return await getHttpRequest(`${REACT_APP_USER_BASE_URL}/home_office/users/interns/list`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createLocation = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/leads`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const updateLocation = async (id, data) => {
  try {
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/leads/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const bulkAssignMentLocation = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/leads/bulk_assignment`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getInternsAndSalesPersons = async () => {
  try {
    /**
     * use this for real API call from backend
     */
    return await getHttpRequest(
      `${REACT_APP_USER_BASE_URL}/home_office/users/interns_and_sales_persons/list`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationDetail = async (id) => {
  try {
    // return locationsData.detail;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/leads/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchiseDetail = async (id) => {
  try {
    // return companiesData.companyDetail;
    return await getHttpRequest(`${REACT_APP_FRANCHISE_BASE_URL}/home_office/franchises/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/lead/${id}/activities`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLocationNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Lead/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createLocationNote = async (leadId, data) => {
  try {
    if (!leadId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Lead/${leadId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteLocation = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.deleteCompanyNote;
    return await deleteHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/leads/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLevelAndScoreOptions = async () => {
  try {
    // return franchiseData.listing;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/levels_and_scores`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateLocationDetail = async (leadId, data) => {
  try {
    if (!leadId) {
      throw new Error();
    }

    const response = await patchHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/leads/${leadId}`,
      data,
    );

    return response;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLeadStageOptions = async (stageName) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/stage_options?stageName=${stageName}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getGoogleLocation = async (url) => {
  try {
    return axios.get(url);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserLocations = async (userId, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/users/${userId}/locations?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateFollowUp = async (leadId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Lead/${leadId}/visits/${followUpId}`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const markFollowUpDone = async (prefix, leadId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/${prefix}/${leadId}/visits/${followUpId}/mark_done`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createFollowUp = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Deal/${dealId}/follow_ups`,
      data,
    );
    // return { statusCode: 200, message: 'done', payload: { dealId, data } };
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDealFollowUp = async (dealId, followUpId, data) => {
  try {
    return await putHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/Deal/${dealId}/visits/${followUpId}`,
      data,
    );
    // return { statusCode: 200, message: 'done', payload: { dealId, data, followUpId } };
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLeadsData = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/leads/signal_map`);
    // return stubbedData.getLeadsMapData.success;
  } catch (e) {
    return throwAPIError(e);
  }
};
