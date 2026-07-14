import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest, postHttpRequest, putHttpRequest } from '../helper/axios';
import { config } from '../stubbedData/mocks/settings.mock';

// eslint-disable-next-line no-undef
export const settings = process.env.REACT_APP_FRANCHISE;

const LEADS_SERVICE = process.env.REACT_APP_SALES;
const USERS_SERVICE = process.env.REACT_APP_USER;
export const visitor_service = process.env.REACT_APP_VISITORS;
// Get Type API
export async function getTypes(franchiseId, queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/?${query}`,
      config,
    );
    // return createStubbedData(page, perPage);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function createType(franchiseId, postData) {
  try {
    return await postHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types`,
      postData,
    );
    // return stubbedData['typesStubbedData'].create.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateType(franchiseId, id, postData) {
  try {
    return await putHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/${id}`,
      postData,
    );
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getTypeById(franchiseId, id) {
  try {
    return await getHttpRequest(`${visitor_service}/franchises/${franchiseId}/visitor_types/${id}`);
    // return stubbedData['typesStubbedData'].getOne.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getSettingsAttributesList(franchiseId, type) {
  try {
    const query = queryString.stringify(type, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${visitor_service}/franchises/${franchiseId}/visitor_types/default_settings?${query}`,
    );
    // return stubbedData['formSettingsListByType'].list.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

/**
 * @returns {Object}
 */
export const fetchConfigList = async () => {
  try {
    const data = await getHttpRequest(`${settings}/configs`);

    // return new Promise((res, rej) => {
    //   setTimeout(() => {
    //     res(config?.success?.data);
    //   }, 1500);
    // });
    return data?.data;
  } catch (e) {
    throw new Error(config?.failure?.message);
  }
};

export const getTimezoneOptions = async () => {
  try {
    return await getHttpRequest(`${LEADS_SERVICE}/shared/config/timezones`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchSettingsPreferences = async () => {
  try {
    return await getHttpRequest(`${settings}/preferences`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchSettingsPreferencesConfig = async () => {
  try {
    return await getHttpRequest(`${settings}/preferences/preferences_config`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function updateSettings(postData) {
  try {
    return await putHttpRequest(`${settings}/preferences/update`, postData);
    // return stubbedData['typesStubbedData'].update.success;
  } catch (e) {
    return throwAPIError(e);
  }
}

export const createNewRole = async (payload) => {
  try {
    return await postHttpRequest(`${USERS_SERVICE}/roles`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRolesForSettings = async () => {
  try {
    return await getHttpRequest(`${USERS_SERVICE}/roles`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updatePermissions = async (payload, id) => {
  try {
    return await putHttpRequest(`${USERS_SERVICE}/roles/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserGroups = async () => {
  try {
    return await getHttpRequest(`${USERS_SERVICE}/groups`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const resetPrivileges = async (id) => {
  try {
    return await putHttpRequest(`${USERS_SERVICE}/roles/${id}/reset_privileges`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUsersOfGroups = async (input) => {
  try {
    const query = queryString.stringify(input, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${USERS_SERVICE}/users/users_by_role?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createUserGroupPost = async (payload, id) => {
  try {
    let url = `${USERS_SERVICE}/groups`;
    if (id) {
      url = `${USERS_SERVICE}/groups/${id}`;
      return await putHttpRequest(url, payload);
    }

    return await postHttpRequest(url, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserGroupDetails = async (payload) => {
  try {
    let url = `${USERS_SERVICE}/groups/${payload?.groupId}`;
    return await getHttpRequest(url);
  } catch (e) {
    return throwAPIError(e);
  }
};
