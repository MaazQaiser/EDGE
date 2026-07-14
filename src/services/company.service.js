import { deleteHttpRequest, getHttpRequest, postHttpRequest, putHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_BASE_URL = process.env.REACT_APP_SALES;

export const getCompanies = async (page, rowsPerPage, params, config = {}) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    query = query ? `&${query}` : '';
    return await getHttpRequest(
      `${REACT_APP_BASE_URL}/web/companies?rowsPerPage=${rowsPerPage}&details=true&pageNo=${page}${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getIndustryTypes = async () => {
  try {
    // return companiesData.industryVerticals;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/shared/config/industry_verticals`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getStates = async () => {
  try {
    // return locationsData.states;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/shared/config/states`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCities = async (params) => {
  try {
    // return locationsData.cities;
    const REACT_APP_CITIES = `${REACT_APP_BASE_URL}/shared/config/cities`;
    let query = queryString.stringify(
      { stateIds: params },
      { arrayFormat: 'bracket', skipEmptyString: true, skipNull: true },
    );
    return await getHttpRequest(`${REACT_APP_CITIES}?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCompany = async (id) => {
  try {
    // return companiesData.companyDetail;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/companies/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getYearlyStats = async () => {
  try {
    // return companiesData.yearlyData;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/companies/yearly_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCumulativeStats = async () => {
  try {
    // return cumulativeStats;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/companies/cumulative_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCompanyActivities = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.activities;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/company/${id}/activities`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCompanyNotes = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.companyNotes;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/notes/Company/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteCompanyNote = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    // return companiesData.deleteCompanyNote;
    return await deleteHttpRequest(`${REACT_APP_BASE_URL}/web/notes/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createCompanyNote = async (companyId, data) => {
  try {
    if (!companyId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/notes/Company/${companyId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateCompanyNote = async (noteId, data) => {
  try {
    if (!noteId) {
      throw new Error();
    }
    // return companiesData.createCompanyNote;
    return await putHttpRequest(`${REACT_APP_BASE_URL}/web/notes/${noteId}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const exportCompanies = async (data) => {
  try {
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_BASE_URL}/web/export_requests`, data);
  } catch (e) {
    throw new Error(e);
  }
};

export const createCompany = async (data) => {
  try {
    // return companiesData.createCompanyNote;
    return await postHttpRequest(`${REACT_APP_BASE_URL}/shared/companies`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};
