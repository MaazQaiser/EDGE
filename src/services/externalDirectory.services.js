import queryString from 'query-string';
import { getHttpRequest } from 'src/helper/axios';

import { throwAPIError } from '../utils/throwAPIError';

// eslint-disable-next-line no-undef
export const directoryServiceEndPoint = process.env.REACT_APP_FRANCHISE;

/**
 * Clients owned by the external application (CRM). Used to populate the client
 * picker on the site information edit form.
 */
export const getExternalClients = async (search = '') => {
  try {
    const query = queryString.stringify({ search }, { skipEmptyString: true, skipNull: true });
    return await getHttpRequest(`${directoryServiceEndPoint}/directory/clients?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 * Contacts owned by the external application. When a client is linked, results
 * are scoped to that client (plus shared escalation/dispatch contacts).
 */
export const getExternalContacts = async (clientId = null) => {
  try {
    const query = queryString.stringify({ clientId }, { skipEmptyString: true, skipNull: true });
    return await getHttpRequest(`${directoryServiceEndPoint}/directory/contacts?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
