import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest } from '../helper/axios';

// eslint-disable-next-line no-undef
const DEVICE_SERVICE = process.env.REACT_APP_FRANCHISE;

// Get franchise API
export const getDevices = async (id, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${DEVICE_SERVICE}/home_office/franchises/${id}/devices?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get franchise API
export const getAllSites = async (id) => {
  try {
    return await getHttpRequest(
      `${DEVICE_SERVICE}/home_office/franchises/${id}/sites/dropdown_options`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
