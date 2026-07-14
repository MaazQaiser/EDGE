import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest } from '../helper/axios';

// eslint-disable-next-line no-undef
const CLIENT_SERVICE = process.env.REACT_APP_FRANCHISE;

// Get franchise API
export const getClients = async () => {
  try {
    // const data = await getHttpRequest(`${CLIENT_SERVICE}/clients`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSites = async (id, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${CLIENT_SERVICE}/home_office/franchises/${id}/sites?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAllZones = async (id) => {
  try {
    return await getHttpRequest(
      `${CLIENT_SERVICE}/home_office/franchises/${id}/zones/dropdown_options`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
