import { getHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;

export const getVisitStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    // return locationsData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/visits_stats?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSalesPersonInsight = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    // return locationsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/sales_persons_insights?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDecisionMakerMeetings = async (params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    // return locationsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/decision_meetings_stats?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractRevenueStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    // return locationsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/contract_revenue_stats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSalesFunnelStats = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    // return locationsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/sales_funnel_stats?${query}`,
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
    // return locationsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/dashboard/key_metrics_stats?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getMembers = async () => {
  try {
    // return locationsData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/members`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDashboardFiltersData = async () => {
  try {
    // return locationsData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/filters_data`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const exportDashboardGraphs = async (params) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/dashboard/export?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
