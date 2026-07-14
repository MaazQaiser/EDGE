import queryString from 'query-string';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest, postHttpRequest, putHttpRequest } from '../helper/axios';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;
export const UPDATE_FRANCHISE = `${FRANCHISE_SERVICE}/home_office/franchises`;
export const GET_FRANCHISE_AREA = `${FRANCHISE_SERVICE}area/`;
export const FRANCHISE_SUPERVISORS = `${FRANCHISE_SERVICE}supervisors`;
export const USER_URL = process.env.REACT_APP_USER;

export const SALES_SERVICE = process.env.REACT_APP_SALES;

// UPDATE API
export const updateFranchise = async (postData, id) => {
  try {
    if (!postData) {
      throw new Error();
    }
    return await putHttpRequest(`${UPDATE_FRANCHISE}/${id}`, postData);
  } catch (e) {
    // const error = e?.response?.data ? e?.response?.data : e;
    // throw error;
    return throwAPIError(e);
  }
};

// Get Franchise API ON ID
export async function getSingleFranchise(id) {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/franchises/${id}`);
  } catch (e) {
    // const error = e?.response?.data ? e?.response?.data : e;
    // throw error;
    return throwAPIError(e);
  }
}

export async function searchFranchises() {
  try {
    // const data = await getHttpRequest(`${FRANCHISE_SERVICE}/franchise`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export const officerGraphData = async () => {
  try {
    return await getHttpRequest(`${USER_URL}/users/officers_graph`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const clientGraphData = async () => {
  try {
    return await getHttpRequest(`${SALES_SERVICE}/web/external_stats/ho_clients_vertical_stats`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const clientsOverTheYearGraphData = async () => {
  try {
    return await getHttpRequest(`${SALES_SERVICE}/web/external_stats/ho_clients_yearly_stats`);
  } catch (error) {
    return throwAPIError(error);
  }
};

// Get franchise API
export async function getFranchises(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/franchises?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

// Get franchise API
export async function sendFranchiseInvite(id) {
  try {
    if (!id) {
      throw new Error();
    }
    return await postHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/reinvite_owner`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

// Get franchise API
export async function deActivateFranchise(id) {
  try {
    return await putHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/mark_non_functional`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function changeFranchiseOwner(id, formData) {
  try {
    if (!id) {
      throw new Error();
    }
    return await putHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/change_owner`,
      formData,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}
/**
 * @description This should get the franchise along with its zones
 * @returns [object, array]
 */
export const getFranchiseDetails = async () => {
  try {
    const data = await getHttpRequest(`${FRANCHISE_SERVICE}/franchises/zone_details`);
    return data?.data;
  } catch (e) {
    // const error = e?.response?.data ? e?.response?.data : e;
    // throw error;
    return throwAPIError(e);
  }
};

/**
 * @description Get franchise details for franchise update
 * @param {Number} id
 * @returns
 */
export const getFranchise = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    let data = await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/franchises/${id}/edit`);

    return data?.data?.franchise;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const makeThisFranchiseFunctional = async (id) => {
  try {
    return await putHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/mark_functional`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const refreshFranchiseListingData = async () => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/home_office/franchises/sync_hubspot_data`);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getGeoLocation = async (data) => {
  try {
    if (isObjectEmpty(data)) {
      throw Error('no data found');
    }
    return await postHttpRequest(`${FRANCHISE_SERVICE}/geolocations`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchiseMap = async () => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/home_office/franchise_maps`);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getFranchiseMapFO = async () => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/franchise_maps`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getActiveFranchises = async () => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/franchises/options`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHOActiveFranchises = async () => {
  try {
    return await getHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/dropdown_options?status=functional`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get franchise list
export async function getFranchisesList(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/list?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

// Get franchise sites
export async function getFranchiseSitesbyId(id, queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${FRANCHISE_SERVICE}/home_office/franchises/${id}/sites/dropdown_options?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getAssignedFranchises(payload) {
  let status = '';
  try {
    if (payload) {
      status = payload;
    }
    return await getHttpRequest(`${FRANCHISE_SERVICE}/franchises?status=${status}`);
  } catch (e) {
    return throwAPIError(e);
  }
}
