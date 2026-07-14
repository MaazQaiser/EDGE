import { throwAPIError } from 'src/utils/throwAPIError';

import { getHttpRequest, patchHttpRequest, postHttpRequest } from '../helper/axios';
export const USER_URL = process.env.REACT_APP_USER;
import queryString from 'query-string';

// get roadmaps API
export async function getRoadmaps(params = {}, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const queryStringParam = query ? `?${query}` : '';
    return await getHttpRequest(`${USER_URL}/deliverable/roadmaps${queryStringParam}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

// get roadmap by quarter id
export async function getRoadmapByQuarterId(roadmapId, id) {
  try {
    console.log('JJHIBHJBBHJU', { roadmapId, id });
    return await getHttpRequest(`${USER_URL}/deliverable/roadmaps/${roadmapId}/quarters/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// update roadmap Quarter
export async function updateQuarterById(roadmapId, id, data) {
  try {
    return await patchHttpRequest(
      `${USER_URL}/deliverable/roadmaps/${roadmapId}/quarters/${id}`,
      data,
    );
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

// create quarter
export async function createQuarter(roadmapId, data) {
  try {
    return await postHttpRequest(`${USER_URL}/deliverable/roadmaps/${roadmapId}/quarters`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}

// release notes
export async function getReleaseNotes(params = {}, config = {}) {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    const queryStringParam = query ? `?${query}` : '';
    return await getHttpRequest(`${USER_URL}/deliverable/releases${queryStringParam}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

// create release notes
export async function createRelease(data) {
  try {
    return await postHttpRequest(`${USER_URL}/deliverable/releases`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}
// get release notes by id
export async function getReleaseNotesById(id) {
  try {
    return await getHttpRequest(`${USER_URL}/deliverable/releases/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// update release notes
export async function updateReleaseNotes(id, data) {
  try {
    return await patchHttpRequest(`${USER_URL}/deliverable/releases/${id}`, data);
  } catch (e) {
    return throwAPIError(e);
  }
}
