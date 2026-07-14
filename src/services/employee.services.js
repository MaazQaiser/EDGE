import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest } from '../helper/axios';

// eslint-disable-next-line no-undef
const EMPLOYEE_SERVICE = process.env.REACT_APP_USER;

// Get franchise API
export async function getEmployees(id, queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${EMPLOYEE_SERVICE}/home_office/franchises/${id}/employees?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}
