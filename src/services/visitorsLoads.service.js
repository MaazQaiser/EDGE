import queryString from 'query-string';
import { getHttpRequest, postHttpRequest, putHttpRequest } from 'src/helper/axios';

import { throwAPIError } from '../utils/throwAPIError';

// eslint-disable-next-line no-undef

export const usersEndpoint = process.env.REACT_APP_USER;
export const templateEndpoint = process.env.REACT_APP_TEMPLATE;
export const franchiseEndpoint = process.env.REACT_APP_FRANCHISE;

export const getVisitorsLoadsOfficers = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${usersEndpoint}/authorized_sites/officers?${query}`, {});
  } catch (error) {
    return throwAPIError(error);
  }
};

export const getVisitorsLoadsLogs = async (type, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${franchiseEndpoint}/visitor_load_events/${type}?${query}`, {});
  } catch (error) {
    return throwAPIError(error);
  }
};

export const getVisitorsLoadsTemplates = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${templateEndpoint}/templates?${query}`, {});
  } catch (error) {
    return throwAPIError(error);
  }
};

export const getVisitorsLoadsOfficersOptions = async () => {
  try {
    return await getHttpRequest(`${usersEndpoint}/users/officer/options`, {});
  } catch (error) {
    return throwAPIError(error);
  }
};

export const saveAssignOfficer = async (siteId, payload) => {
  try {
    const queryParams = {
      siteId: siteId || '',
    };

    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await postHttpRequest(`${usersEndpoint}/authorized_sites/add_officer?${query}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function getManagementTypeOptions(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${templateEndpoint}/templates/templates_list?${query}`, config);

    // return createStubbedData(queryParams.page, queryParams.newPerPage);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getVisitorLoadInfo(id) {
  try {
    if (!id) return;
    return await getHttpRequest(`${franchiseEndpoint}/visitor_load_events/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getBanVisitorLoadInfo(id) {
  try {
    if (!id) return;
    return await getHttpRequest(`${franchiseEndpoint}/bans/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getVisitorLoadProfiles(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${franchiseEndpoint}/visitor_load_profiles/?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function exportPDF(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await postHttpRequest(
      `${franchiseEndpoint}/visitor_load_events/export_events?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function udpateVistsProfileData(id, payload) {
  try {
    return await putHttpRequest(`${franchiseEndpoint}/visitor_load_profiles/${id}`, payload);
    // return createStubbedData(queryParams.page, queryParams.newPerPage);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getVisitProfileById(id, config = {}) {
  try {
    return await getHttpRequest(`${franchiseEndpoint}/visitor_load_profiles/${id}`, config);

    // return createStubbedData(queryParams.page, queryParams.newPerPage);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function downloadProfile(profileId, config = {}) {
  try {
    return await postHttpRequest(
      `${franchiseEndpoint}/visitor_load_events/${profileId}/export_event_detail`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}
