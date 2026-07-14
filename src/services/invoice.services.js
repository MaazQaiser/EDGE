import queryString from 'query-string';

import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const INVOICE_SERVICE = process.env.REACT_APP_FRANCHISE;
export const dutyServiceEndPoint = process.env.REACT_APP_SCHEDULING;

export async function refreshInvoice(id) {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices/${id}/refresh`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getInvoices(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function exportInvoices(params, config) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices/export?${query}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getSageItems() {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/sage_items`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getGlGroupDropdown() {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/sage_items/gl_group_dropdown`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getSageItemsDropdown() {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/sage_items/sage_items_dropdown`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function getSageItemsWitParamsDropdown(id, params, config) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${INVOICE_SERVICE}/invoices/${id}/fetch_line_items?${query}`,
      config,
    );
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Creating new Line Item in Settings
export const createNewLineItem = async (data) => {
  try {
    return await postHttpRequest(`${INVOICE_SERVICE}/sage_items`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

// Updating new Line Item in Settings
export const updateLineItem = async (id, data) => {
  try {
    return await putHttpRequest(`${INVOICE_SERVICE}/sage_items/${id}`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export async function getSites(params) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/sites/sites_dropdown?${query}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

// Get Sites in creating new invoice
export const getFranchiseSiteContracts = async (siteId) => {
  try {
    return await getHttpRequest(`${INVOICE_SERVICE}/sites/${siteId}/site_contracts`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getShiftLocations = async (params) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${dutyServiceEndPoint}/shiftActivityLog/getAdhocPayroll?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getShiftAvailableOfficers = async (shiftId) => {
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/pastOfficerAvailability/${shiftId}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createAddHockInvoice = async (shiftId, body) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/createAdhocPayroll/${shiftId}`,
      body,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Creating new invoice
export const createNewInvoice = async (data) => {
  try {
    return await postHttpRequest(`${INVOICE_SERVICE}/invoices`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const pushedToSage = async (payload) => {
  try {
    return await postHttpRequest(`${INVOICE_SERVICE}/invoices/bulk_update_status`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get Sites in creating new invoice
export const getFranchiseSites = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: false,
      skipNull: false,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/sites/sites_dropdown?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get Invoice
export const getInvoice = async (invoiceNumber) => {
  try {
    if (!invoiceNumber) {
      throw new Error();
    }
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices/${invoiceNumber}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get PDF of invoice
export const getInvoicePDF = async (invoiceNumber, config = {}) => {
  try {
    if (!invoiceNumber) {
      throw new Error();
    }
    return await getHttpRequest(`${INVOICE_SERVICE}/invoices/${invoiceNumber}/invoice_pdf`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Updated existing invoice
export const updateInvoice = async (invoiceNumber, data) => {
  try {
    if (!invoiceNumber) {
      throw new Error();
    }
    return await putHttpRequest(`${INVOICE_SERVICE}/invoices/${invoiceNumber}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new Error();
    }
    return await deleteHttpRequest(`${INVOICE_SERVICE}/invoices/${invoiceId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const markInvoiceAsPaid = async (invoiceId, data) => {
  try {
    if (!invoiceId) {
      throw new Error();
    }
    return await patchHttpRequest(`${INVOICE_SERVICE}/invoices/${invoiceId}/mark_as_paid`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get contracts set for merge invoices
export const getContractSets = async (siteId) => {
  try {
    if (!siteId) {
      throw new Error();
    }
    return await getHttpRequest(`${INVOICE_SERVICE}/sites/${siteId}/merged_contracts`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get mergerable contracts set for merge invoices
export const getMergeableContractSets = async (siteId) => {
  try {
    if (!siteId) {
      throw new Error();
    }
    return await getHttpRequest(`${INVOICE_SERVICE}/sites/${siteId}/mergeable_contract_sets`);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Posting Merge Invoices
export const mergeInvoices = async (data) => {
  try {
    return await postHttpRequest(`${INVOICE_SERVICE}/contract_sets`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const getBillingContacts = async (params) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: false,
      skipNull: false,
    });
    return await getHttpRequest(`${INVOICE_SERVICE}/sage_contacts?${query}`);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const deleteMergeInvoice = async (mergeInvoiceId) => {
  try {
    if (!mergeInvoiceId) {
      throw new Error();
    }
    return await deleteHttpRequest(`${INVOICE_SERVICE}/contract_sets/${mergeInvoiceId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
