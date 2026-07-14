import { throwAPIError } from 'src/utils/throwAPIError';

import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from '../helper/axios';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;

// Get Billing Details on Site ID
export async function getBillingDetail(id) {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/sites/${id}/billing_detail`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// Update Billing Details
export const updateBillingDetails = async (id, data) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await patchHttpRequest(`${FRANCHISE_SERVICE}/billing_details/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getContactsDetails = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await getHttpRequest(`${FRANCHISE_SERVICE}/sage_contacts/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createSageContact = async (payload) => {
  try {
    return await postHttpRequest(`${FRANCHISE_SERVICE}/sage_contacts`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateSageContact = async (id, payload) => {
  try {
    return await putHttpRequest(`${FRANCHISE_SERVICE}/sage_contacts/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSageContactDetails = async (id) => {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/sage_contacts/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteSageContact = async (id) => {
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/sage_contacts/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function getSageContactsDropDown(id) {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/sites/${id}/sage_contacts_dropdown`);
  } catch (e) {
    return throwAPIError(e);
  }
}
