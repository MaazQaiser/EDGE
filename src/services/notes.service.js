import { deleteHttpRequest, getHttpRequest, putHttpRequest } from '../helper/axios';
import { throwAPIError } from '../utils/throwAPIError';

export const FRANCHISE_SERVICE = process.env.REACT_APP_FRANCHISE;

//Listing
export async function getNote(id, config = {}) {
  try {
    return await getHttpRequest(`${FRANCHISE_SERVICE}/notes?${id}`, config);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function updateNote(id, payload) {
  try {
    return await putHttpRequest(`${FRANCHISE_SERVICE}/notes/${id}`, payload);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export async function deleteNote(id) {
  try {
    return await deleteHttpRequest(`${FRANCHISE_SERVICE}/notes/${id}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}
