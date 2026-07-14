import queryString from 'query-string';

import { getHttpRequest, patchHttpRequest, postHttpRequest, putHttpRequest } from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

const SCHEDULING_SERVICE = process.env.REACT_APP_SCHEDULING;
const DISPATCH_SERVICE = `${process.env.REACT_APP_FRANCHISE}/dispatch_requests`;
const TEMPLATE_SERVICE = process.env.REACT_APP_TEMPLATE;
const USER_SERVICE = process.env.REACT_APP_USER;

//Listing
export async function getDispatches(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${DISPATCH_SERVICE}?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatch(dispatchId) {
  try {
    return await getHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchStats() {
  try {
    return await getHttpRequest(`${DISPATCH_SERVICE}/stats`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function closeDispatch(dispatchId, payload) {
  try {
    return await putHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}/close`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchLogs(dispatchId) {
  try {
    return await getHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}/logs`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchTypes() {
  try {
    return await getHttpRequest(`${DISPATCH_SERVICE}/dispatch_types`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchTemplates(queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${TEMPLATE_SERVICE}/templates/dispatch_template?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchNotes(dispatchId, queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}/notes?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function createDispatchNote(dispatchId, payload) {
  try {
    return await postHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}/notes`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getShiftAssignmentJobs(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${SCHEDULING_SERVICE}/shiftassignment/jobs/dispatch?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getShiftAssignmentJobsFilters(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${SCHEDULING_SERVICE}/shiftassignment/jobs/dispatchFilters?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function assignDispatch(payload, config) {
  try {
    return await patchHttpRequest(
      `${SCHEDULING_SERVICE}/shiftassignment/dispatch/assign`,
      payload,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function assignDispatchSupervisor(payload, config) {
  try {
    return await patchHttpRequest(
      `${SCHEDULING_SERVICE}/shiftassignment/dispatch/assign/supervisor`,
      payload,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getDispatchShiftReport(dispatchId, queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const path = `${SCHEDULING_SERVICE}/shiftReport/dispatch/${dispatchId}`;
    const url = query ? `${path}?${query}` : path;
    return await getHttpRequest(url, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getActivityLogs(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${USER_SERVICE}/audit_logs?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Create Dispatch
export async function createDispatch(payload) {
  try {
    return await postHttpRequest(DISPATCH_SERVICE, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Update Dispatch
export async function updateDispatch(dispatchId, payload) {
  try {
    return await patchHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Download Dispatch Caller Details
export async function downloadDispatchCallerDetails(dispatchId, config) {
  try {
    if (!dispatchId) return;
    return await getHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}/dispatch_details_pdf`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Update Dispatch Address
export async function updateDispatchAddress(dispatchId, payload) {
  try {
    return await patchHttpRequest(`${DISPATCH_SERVICE}/${dispatchId}`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}
