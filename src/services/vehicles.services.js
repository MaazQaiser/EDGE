import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

// eslint-disable-next-line no-undef
const vehiclesServiceEndPoint = process.env.REACT_APP_FRANCHISE;

/**
 * TODO: Send franchise id to backend to get the vehicles of that franchise
 * franchise-id: 1
 */
// Get franchise API
export async function getVehicles(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${vehiclesServiceEndPoint}/vehicles?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function createVehicle(postData) {
  try {
    if (!postData) {
      throw new Error();
    }
    return await postHttpRequest(`${vehiclesServiceEndPoint}/vehicles`, postData);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateVehicle(id, postData) {
  try {
    if (!id) {
      throw new Error();
    }
    return await putHttpRequest(`${vehiclesServiceEndPoint}/vehicles/${id}`, postData);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getVehicle(id) {
  try {
    if (!id) {
      throw new Error();
    }
    return await getHttpRequest(`${vehiclesServiceEndPoint}/vehicles/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export const deleteVehicle = async (id) => {
  try {
    if (!id) {
      throw new Error();
    }
    return await deleteHttpRequest(`${vehiclesServiceEndPoint}/vehicles/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
};
