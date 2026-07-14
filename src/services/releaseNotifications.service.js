import { throwAPIError } from 'src/utils/throwAPIError';

import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
} from '../helper/axios';
export const USER_URL = process.env.REACT_APP_USER;
import queryString from 'query-string';

// get release notifications API
export async function getReleaseNotifications(params = {}, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const queryStringParam = query ? `?${query}` : '';
    return await getHttpRequest(`${USER_URL}/system_notifications${queryStringParam}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

// get release notification by id
export async function getReleaseNotificationById(id) {
  try {
    return await getHttpRequest(`${USER_URL}/system_notifications/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// update roadmap Quarter
export async function updateReleaseNotificationById(id, data) {
  try {
    return await patchHttpRequest(`${USER_URL}/system_notifications/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}
// create roadmap
export async function createRoadmap(data) {
  try {
    return await postHttpRequest(`${USER_URL}/deliverable/roadmaps`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}

// create Notification
export async function createReleaseNotification(data) {
  try {
    return await postHttpRequest(`${USER_URL}/system_notifications`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}

// trigger notification send now (changes scheduled/draft to sent)
export async function triggerNotificationNow(id) {
  try {
    return await postHttpRequest(`${USER_URL}/system_notifications/${id}/trigger`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// update notification
export async function updateReleaseNotes(id, data) {
  try {
    return await patchHttpRequest(`${USER_URL}/deliverable/releases/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}

// delete notification
export async function deleteNotificationById(id) {
  try {
    return await deleteHttpRequest(`${USER_URL}/system_notifications/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}
