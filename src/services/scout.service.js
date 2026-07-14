import queryString from 'query-string';
import { getHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const scoutingEndpointSales = process.env.REACT_APP_SALES;

export const scoutingEndpointNode = process.env.REACT_APP_ROUTING;
export const authServiceEndPoint = process.env.REACT_APP_USER;

export const scheduleEndPoint = process.env.REACT_APP_SCHEDULING;
export const getScoutListings = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${scoutingEndpointSales}/web/users/routes?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getMapRoutes = async (routeId) => {
  try {
    return await getHttpRequest(`${scoutingEndpointNode}/route/visits/${routeId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {*} siteId
 * @param {*} franchiseId
 * @param {*} jobType
 * @param {*} shiftId
 * @param {*} supervisorId
 * @returns
 */
export const getLiveTrackingVisitors = async (params, config = {}) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${authServiceEndPoint}/live_trackings/current_location?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {*} franchiseId
 * @param {*} shiftId
 * @returns
 */
export const getLiveTrackingRunSheetData = async (franchiseId, shiftId) => {
  try {
    return await getHttpRequest(
      `${authServiceEndPoint}/live_trackings/route_coordinates?franchiseId=${franchiseId}&shiftId=${shiftId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {*} shiftId
 * @returns
 */
export const getOfficerShiftDetailsAPI = async (shiftId, config = {}) => {
  try {
    return await getHttpRequest(`${scheduleEndPoint}/shiftActivityLog/${shiftId}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 *
 * @param {*} shiftId
 * @returns
 */
export const getPatrolOfficerLiveTrackingData = async (shiftId, config = {}) => {
  try {
    return await getHttpRequest(
      `${scheduleEndPoint}/shiftActivityLog/runsheet/mapData/${shiftId}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
