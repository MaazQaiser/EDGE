import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';

import { throwAPIError } from '../utils/throwAPIError';

// eslint-disable-next-line no-undef
export const zonesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

// Get Zones API
export async function getZones(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${zonesServiceEndPoint}/zones?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getZonesListing() {
  try {
    return await getHttpRequest(`${zonesServiceEndPoint}/zones/options`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export const getZoneDetails = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await getHttpRequest(`${zonesServiceEndPoint}/zones/${id}`);
  } catch (e) {
    // const error = e?.response?.data ? e?.response?.data : e;
    // throw error;
    return throwAPIError(e);
  }
};

export const getZoneDetailsForSites = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return await getHttpRequest(`${zonesServiceEndPoint}/zones/${id}`);
    return;
  } catch (e) {
    // const error = e?.response?.data ? e?.response?.data : e;
    // throw error;
    return throwAPIError(e);
  }
};

export const deleteZone = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await deleteHttpRequest(`${zonesServiceEndPoint}/zones/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateZone = async (id, payload) => {
  try {
    if (!id || !payload) {
      throw new Error();
    }
    return await putHttpRequest(`${zonesServiceEndPoint}/zones/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createZone = async (data) => {
  try {
    if (!data) {
      throw new Error();
    }
    return await postHttpRequest(`${zonesServiceEndPoint}/zones`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const changeSitesZone = async (siteId, body) => {
  try {
    if (!siteId) {
      throw new Error();
    }

    return await putHttpRequest(`${zonesServiceEndPoint}/sites/${siteId}/change_zone`, body);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const removeSiteFromZone = async (siteId) => {
  try {
    if (!siteId) {
      throw new Error();
    }

    return await putHttpRequest(`${zonesServiceEndPoint}/sites/${siteId}/unassign_zone`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Delete Zone
export const deleteZoneById = async (zoneId) => {
  try {
    if (!zoneId) {
      throw new Error();
    }

    const response = await deleteHttpRequest(`${zonesServiceEndPoint}/zones/${zoneId}`);

    return response;
  } catch (e) {
    throw throwAPIError(e);
  }
};
