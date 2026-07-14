import queryString from 'query-string';

import { getHttpRequest } from '../helper/axios';

export const SALES_SERVICE_URL = process.env.REACT_APP_SALES;
import { throwAPIError } from 'src/utils/throwAPIError';

export const getIndustryVericals = async (params, config = {}) => {
  try {
    const queryParam = {
      ...params,
      pageNo: params?.page,
      page: undefined,
    };
    const query = queryString.stringify(queryParam, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return getHttpRequest(`${SALES_SERVICE_URL}/web/industries?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getProposalWonSales = async (page, rowsPerPage, params, config = {}) => {
  try {
    const queryParam = {
      ...params,
      pageNo: params?.page,
      page: undefined,
    };
    const query = queryString.stringify(queryParam, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return getHttpRequest(
      `${SALES_SERVICE_URL}/web/dashboard/proposal_won_stats?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getProposalLostSales = async (page, rowsPerPage, params, config = {}) => {
  try {
    const queryParam = {
      ...params,
      pageNo: params?.page,
      page: undefined,
    };
    const query = queryString.stringify(queryParam, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    // return companiesData.dashboardProposalLost;
    return getHttpRequest(
      `${SALES_SERVICE_URL}/web/dashboard/proposal_lost_stats?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
