import queryString from 'query-string';
import { getHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const DASHBOARD_SERVICE = process.env.REACT_APP_FRANCHISE;
const DASHBOARD_SERVICE_SCHEDULE = process.env.REACT_APP_SCHEDULING;

export const getContractRevenue = async ({ startDate, endDate }) => {
  try {
    return await getHttpRequest(
      `${DASHBOARD_SERVICE}/dashboards/contracts_stats?date[gteq]=${startDate}&date[lteq]=${endDate}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getTopSitesByRevenue = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${DASHBOARD_SERVICE}/dashboards/top_sites_by_revenue?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getIndustryVerticalStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE}/dashboards/industry_verticals_stats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getKeyMetricsStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/keyMetrics?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchiseKeyMetrics = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${DASHBOARD_SERVICE}/dashboards/key_metrics?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getEfficiencyStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/getEfficiencyStats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getLiveOperationStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/liveOperations?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getJobWeekStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/getJobWeekStats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getJobNotStarted = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/jobsNotStarted?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAdditionalServicesStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${DASHBOARD_SERVICE_SCHEDULE}/shiftActivityLog/foDashboard/getAdditionalServiceStats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getNonFunctionalSitesServicesStats = async () => {
  try {
    return await getHttpRequest(`${DASHBOARD_SERVICE}/dashboards/live_operations_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};
