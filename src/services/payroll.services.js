import queryString from 'query-string';

import { getHttpRequest, patchHttpRequest, postHttpRequest } from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const PAYROLL_SERVICE = process.env.REACT_APP_SCHEDULING;

// https://dev-signal-obx-scheduling-service.azurewebsites.net/api/v1/shiftActivityLog/getPayrolls?windowStart=2024-05-01T00%3A00%3A00Z&windowEnd=2024-06-27T00%3A00%3A00Z&page=1&perPage=10&officerId[0]=396&siteId[0]=1
//Listing
export async function getPayrolls(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${PAYROLL_SERVICE}/shiftActivityLog/getPayrolls?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function getSupervisorPayrolls(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/getSupervisorPayrolls?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function getPayruns(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${PAYROLL_SERVICE}/payrun?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getPayrun(payrunId) {
  try {
    return await getHttpRequest(`${PAYROLL_SERVICE}/payrun/${payrunId}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Locking Payrun
export async function lockPayrun(payload) {
  try {
    return await postHttpRequest(`${PAYROLL_SERVICE}/shiftActivityLog/lockPayroll`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

//Update
export async function updatePayrolls(payload) {
  try {
    const data = await patchHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/updateAprrovedHours`,
      payload,
    );
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Downloading CSV
export async function getCSV(payrunId) {
  try {
    return await getHttpRequest(`${PAYROLL_SERVICE}/payrun/${payrunId}/download`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Locking Payrun
export async function exportPayRun(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${PAYROLL_SERVICE}/shiftActivityLog/payrollCSV?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Patrol Listing
export async function getPatrolPayroll(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/getPatrolPayrolls?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function getSupervisorLockedPayrolls(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/getSupervisorPayrolls?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}
// Patrol Payroll Filters
export async function getPatrolPayrollFilters() {
  try {
    return await getHttpRequest(`${PAYROLL_SERVICE}/shiftActivityLog/getPatrolPayrolFilters`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Worklogs
export async function getWorkLogs(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/getOfficersWorkLogs?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Export Reconcilation Worklog CSV
export async function exportReconcilationReport(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${PAYROLL_SERVICE}/shiftActivityLog/officerWorklogsCSV?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function updatePayrollBreakStatus(id, payload) {
  try {
    return await postHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/approvedJobIntervals/${id}`,
      payload,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

//Export Officer worklog CSV
export async function exportOfficerWorklogCSV(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${PAYROLL_SERVICE}/shiftActivityLog/ho/officerWorkLogsCSV?${query}`,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function updateSupervisorJobIntervals(id, payload) {
  try {
    return await postHttpRequest(
      `${PAYROLL_SERVICE}/attendance/supervisorJobIntervals/${id}`,
      payload,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}
