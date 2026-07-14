import queryString from 'query-string';

import { getHttpRequest, patchHttpRequest } from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const REPORT_SERVICE = process.env.REACT_APP_SCHEDULING;
export const USER_SERVICE = process.env.REACT_APP_USER;
export const INVOICE_SERVICE = process.env.REACT_APP_FRANCHISE;
//Listing
export async function getFranchiseReports(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REPORT_SERVICE}/shift/reports/list?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

//Detail
export async function getReportDetails(reportId) {
  try {
    const data = await getHttpRequest(`${REPORT_SERVICE}/shiftReport/${reportId}`);
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getPendingReports(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const data = await getHttpRequest(
      `${REPORT_SERVICE}/shiftReport/submittedReportCount?${query}`,
    );
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

//Update
export async function updateReportStatus({ report, reportId }) {
  try {
    const data = await patchHttpRequest(
      `${REPORT_SERVICE}/shiftReport/updateStatus/${reportId}`,
      report,
    );

    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getOfficersDropDown() {
  try {
    return await getHttpRequest(`${USER_SERVICE}/users/options`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getCSVData(params) {
  try {
    // return stubbedData.downloadCSV;
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REPORT_SERVICE}/shiftActivityLog/payrollCSV?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export const getPDFViewOfShiftReport = async (
  reportId = null,
  type,
  shiftId,
  siteId,
  isRunsheet = null,
  reportDate = null,
  config = {},
) => {
  try {
    const query = queryString.stringify(
      {
        reportId,
        type,
        shiftId,
        siteId,
        isRunsheet,
        ...(reportDate ? { reportDate } : {}),
      },
      {
        arrayFormat: 'index',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    return await getHttpRequest(`${REPORT_SERVICE}/pdf/?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
};

export async function getIncidentReport(params) {
  try {
    // return stubbedData.downloadCSV;
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REPORT_SERVICE}/shiftReport/site/incident?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getTourReportListing(reportId) {
  try {
    const data = await getHttpRequest(`${REPORT_SERVICE}/shiftReport/tourReport/${reportId}`);
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function updateReport(shiftId, body, params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const data = await patchHttpRequest(
      `${REPORT_SERVICE}/shiftActivityLog/submitReport/${shiftId}?${query}`,
      body,
    );
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function updateReportDispatch(id, body, config) {
  try {
    const data = await patchHttpRequest(
      `${REPORT_SERVICE}/shiftActivityLog/dispatch/${id}`,
      body,
      config,
    );
    return data;
  } catch (e) {
    throw throwAPIError(e);
  }
}

export const downloadPdfFromUrl = async (url, config = {}) => {
  try {
    return await getHttpRequest(`${url}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
};

export const downloadEUInvoicePDF = async (id, config = {}) => {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices/${id}/eu_invoice`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
};

export async function getRunsheetReports(params, config) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${REPORT_SERVICE}/shiftactivitylog/reports/runsheets?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getAllRunsheets() {
  try {
    return await getHttpRequest(`${REPORT_SERVICE}/shiftactivitylog/runsheets/filters`);
  } catch (e) {
    throwAPIError(e);
  }
}

// Locking Payrun
export async function exportReports(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/site_summary_reports/export?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getSiteSummaryReports(params, config) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/site_summary_reports?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}
export async function exportDispatchReports(params, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/dispatch_requests/export?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}
