import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

export const REACT_APP_LOCATIONS_URL = process.env.REACT_APP_SALES;
export const REACT_APP_FRANCHISE_BASE_URL = process.env.REACT_APP_FRANCHISE;

export const REACT_APP_USERS_BASE_URL = process.env.REACT_APP_USER;

export const createDeal = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDeal = async (id, data) => {
  try {
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealDetails = async (id) => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealOwnerOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/owners`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCompanyLeadOptions = async (companyId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/companies/${companyId}/lead_options`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getPipelineOptions = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/config/pipelines`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const convertDealIntoStage = async (locationId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/leads/${locationId}/convert`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealStageOptions = async (stageName, pipelineId) => {
  try {
    if (!stageName || !pipelineId) {
      throw new Error();
    }

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/config/deal_stage_options?stageName=${stageName}&pipelineId=${pipelineId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDeals = async (page, rowsPerPage, params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    query = query ? `&${query}` : '';

    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals?rowsPerPage=${rowsPerPage}&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const bulkDealAssignMent = async (data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/bulk_assignment`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealsCumulativeStats = async (pipelineId) => {
  try {
    // return dealsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/cumulative_stats?pipelineId=${pipelineId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
export const getInternsSalesPersonsGraph = async () => {
  try {
    // return dealsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_USERS_BASE_URL}/home_office/users/interns_sales_persons_graph`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getTeamsDataGraph = async () => {
  try {
    // return dealsData.cumulativeStats;
    return await getHttpRequest(
      `${REACT_APP_USERS_BASE_URL}/home_office/users/interns_sales_persons_over_last_tweleve_months_graph`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealsYearlyStats = async (pipelineId) => {
  try {
    // return dealsData.yearlyStats;
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/yearly_stats?pipelineId=${pipelineId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deal/${id}/activities`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Deal/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createDealNote = async (dealId, data) => {
  try {
    if (!dealId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/Deal/${dealId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDealNote = async (dealId, data) => {
  try {
    if (!dealId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await putHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/notes/${dealId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDealQuestions = async (id) => {
  try {
    // return dealsData.questions;
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/shared/leads/${id}/questions`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractDetails = async (dealId) => {
  try {
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContractPDF = async (dealId, config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/preview`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSignedContractPDF = async (dealId, config = {}) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/signed_contract`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const publishContract = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/publish`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const terminateContract = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/terminate`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createContract = async (dealId, data) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateContract = async (dealId, data) => {
  try {
    return await patchHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteContract = async (dealId) => {
  try {
    return await postHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getFranchisePreferences = async (franchiseId) => {
  try {
    return await getHttpRequest(
      `${REACT_APP_FRANCHISE_BASE_URL}/preferences?franchise-id=${franchiseId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateDealQuestions = async (dealId, data) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/shared/leads/${dealId}/questions`,
      data,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUserDeals = async (userId, queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_LOCATIONS_URL}/web/users/${userId}/deals?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const uploadDealBannerAttachment = async (dealId, payload) => {
  try {
    return await postHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/upload_banner`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteDealBannerAttachment = async (dealId) => {
  try {
    return await deleteHttpRequest(
      `${REACT_APP_LOCATIONS_URL}/web/deals/${dealId}/contracts/delete_banner`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
