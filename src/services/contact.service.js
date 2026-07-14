import { getHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_BASE_URL = process.env.REACT_APP_SALES;

export const getContacts = async (params, config = {}) => {
  try {
    // return contactData.listing;
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getYearlyStats = async () => {
  try {
    // return contactData.yearlyStats;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/yearly_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getCumulativeStats = async () => {
  try {
    // return contactData.cumulativeStats;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/web/contacts/cumulative_stats`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getPaymentTermOptions = async () => {
  try {
    // return contactData.paymentTermsOptions;
    return await getHttpRequest(`${REACT_APP_BASE_URL}/shared/config/payment_terms_options`);
  } catch (e) {
    return throwAPIError(e);
  }
};
