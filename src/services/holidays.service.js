import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;

export const getGoogleHolidays = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups/holidays_dropdown?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createHolidayGroup = async (data) => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateHolidayGroup = async (id, data) => {
  try {
    if (!id) return;
    return await putHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHolidayGroups = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHolidayGroupById = async (id) => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteHolidayGroupById = async (id) => {
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/holiday_groups/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
