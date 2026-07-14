import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;
export const SCHEDULING_SERVICE = process.env.REACT_APP_SCHEDULING;

export const getBreakTypes = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/break_types?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createBreakType = async (data) => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/break_types`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteBreakTypeById = async (id) => {
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/break_types/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateBreakTypeById = async (id, data) => {
  try {
    if (!id) return;
    return await putHttpRequest(`${FRANCHISE_SERVICE}/break_types/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunsheets = async () => {
  try {
    return await getHttpRequest(`${SCHEDULING_SERVICE}/shiftassignment/breakRule/templates`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getDedicatedJobs = async () => {
  try {
    return await getHttpRequest(`${SCHEDULING_SERVICE}/job/breakRule`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getBreakRules = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${FRANCHISE_SERVICE}/break_rules?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getBreakRuleById = async (id) => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/break_rules/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createBreakRule = async (data) => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/break_rules`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteBreakRuleById = async (id) => {
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/break_rules/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateBreakRuleById = async (id, data) => {
  try {
    if (!id) return;
    return await putHttpRequest(`${FRANCHISE_SERVICE}/break_rules/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getAssociatedRunsheetsAndDedicatedJobs = async (id) => {
  try {
    return await getHttpRequest(`${SCHEDULING_SERVICE}/job/breakRule/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const addJobsAndRunsheetToBreakRule = async (data) => {
  try {
    return await patchHttpRequest(`${SCHEDULING_SERVICE}/job/addBreakRule`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getBreakRulesDropdownListing = async () => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/break_rules/list`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getBreakRuleIdByPayrollRow = async (id) => {
  try {
    return await getHttpRequest(`${SCHEDULING_SERVICE}/shiftActivityLog/getShiftBreakRule/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
