import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
} from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { throwAPIError } from 'src/utils/throwAPIError';

// eslint-disable-next-line no-undef
export const runsheetServiceEndPoint = process.env.REACT_APP_RUNSHEET_SERVICE_END_POINT;
export const userServiceEndpoint = process.env.REACT_APP_USER;

export const routingServiceEndpoint = process.env.REACT_APP_ROUTING;

export const schedulingServiceEndPoint = process.env.REACT_APP_SCHEDULING;

export const getHitsForRunSheet = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return (await getHttpRequest(`${schedulingServiceEndPoint}/shift/hits?${query}`))?.data?.hits;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunSheetsByDaysListing = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/runsheetlist?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createRunSheet = async (payload) => {
  try {
    return await postHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/template`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const duplicateRunSheet = async (payload, id) => {
  try {
    return await postHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/duplicate/${id}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const splitRunSheet = async (payload, time) => {
  try {
    const query = queryString.stringify(time, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await patchHttpRequest(
      `${schedulingServiceEndPoint}/shiftActivityLog/runsheet/split/${payload?.runSheetId}?${query}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getHitsDetailDataForRunSheet = async (payload, config = {}) => {
  try {
    return await getHttpRequest(`${schedulingServiceEndPoint}/shift/patrol/hit/${payload}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunsheetDetails = async (runsheetTemplateId) => {
  try {
    return await getHttpRequest(`${schedulingServiceEndPoint}/shift/patrol/${runsheetTemplateId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getSplitRunsheetDetails = async (runsheetTemplateId, payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/runsheet/${runsheetTemplateId}?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get All Runsheets of a Zone
export const getRunshetsByZoneId = async (queryParams, zoneId) => {
  try {
    if (!zoneId) {
      throw new Error();
    }

    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    const response = await getHttpRequest(
      `${runsheetServiceEndPoint}/runsheets/${zoneId}?${query}`,
    );

    return response;
  } catch (e) {
    throw new Error();
  }
};

export const getRunsheetById = async (runsheetId) => {
  try {
    if (!runsheetId) {
      throw new Error();
    }

    const response = await getHttpRequest(`${runsheetServiceEndPoint}/${runsheetId}`);

    return response;
  } catch (e) {
    throw new Error();
  }
};

export const deleteSiteOfRunsheet = async (runsheetId, siteId) => {
  try {
    if (!runsheetId || !siteId) {
      throw new Error();
    }

    const response = await patchHttpRequest(`${runsheetServiceEndPoint}/remove/${runsheetId}`, {
      siteId,
    });

    return response;
  } catch (e) {
    throw new Error();
  }
};

export async function getUnassignedCount() {
  try {
    return await getHttpRequest(`${schedulingServiceEndPoint}/shift/patrol/unassignedCount`);
  } catch (e) {
    throw throwAPIError(e);
  }
}
// Get All Supervisors List
export async function getSupervisorsList() {
  try {
    return await getHttpRequest(`${userServiceEndpoint}/runsheet_supervisors`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export const getActivityLogsByPatrolId = async (patrolTemplateId) => {
  try {
    if (!patrolTemplateId) {
      throw new Error();
    }

    const response = await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/logs/${patrolTemplateId}`,
    );

    return response;
  } catch (e) {
    throw throwAPIError(e);
  }
};

export const deleteRunsheetById = async (patrolTemplateId) => {
  try {
    if (!patrolTemplateId) {
      throw new Error();
    }

    const response = await patchHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/delete/${patrolTemplateId}`,
    );

    return response;
  } catch (e) {
    throw throwAPIError(e);
  }
};

export const updateRunsheet = async (runsheetId, body) => {
  try {
    if (!runsheetId) {
      throw new Error();
    }

    const response = await patchHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/edit/${runsheetId}`,
      body,
    );

    return response;
  } catch (e) {
    throw throwAPIError(e);
  }
};
// Get All Supervisors Dropdown
export const addSupervisor = async (data) => {
  try {
    return await postHttpRequest(`${userServiceEndpoint}/runsheet_supervisors`, data);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const deleteSupervisor = async (userId) => {
  try {
    return await deleteHttpRequest(`${userServiceEndpoint}/runsheet_supervisors/${userId}`);
  } catch (e) {
    // throw error
    return throwAPIError(e);
  }
};

export const getVehicles = async () => {
  return;
};

export const getOfficers = async () => {
  return;
};

export const updateRunsheetAssignment = async () => {
  return;
};

export const getOfficerRunSheet = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${routingServiceEndpoint}/route/runsheets?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const addHit = async (body) => {
  try {
    if (isObjectEmpty(body)) {
      throw new Error();
    }

    return await patchHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/addHit`,
      body,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function getUnassignedHitsByDaysListing(day) {
  try {
    return await getHttpRequest(`${schedulingServiceEndPoint}/shift/patrol/unassigned/hits/${day}`);
  } catch (e) {
    throw throwAPIError(e);
  }
}

export const getRunsheetsDropdown = async (hitId, day, config = {}) => {
  try {
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/findRunsheet/${hitId}/${day}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunsheetsPath = async (payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/patrol/paths?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Toggle Auto Shift Schedule
export const toggleAutoCheckoutStatus = async (shiftId, payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await patchHttpRequest(
      `${schedulingServiceEndPoint}/shiftActivityLog/toggleShiftAutoClockout/${shiftId}?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getEditedTimeRunsheetHits = async (id, payload) => {
  try {
    const query = queryString.stringify(payload, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/editPatrolTime/${id}?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunsheetReassignedHits = async (runsheetId, params) => {
  try {
    const query = queryString.stringify(params, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftassignment/runsheet/reassignHits/${runsheetId}?${query}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateOngoingPatrolShiftTime = async ({ runsheetId, activityLogId, payload }) => {
  try {
    const body = {
      shiftType: 'patrol',
      shiftId: runsheetId,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      timeDetails: [
        {
          newStartsAt: payload.newStartsAt,
          newEndsAt: payload.newEndsAt,
        },
      ],
      ...(activityLogId && { activityLogId: activityLogId }),
    };

    return await patchHttpRequest(`${schedulingServiceEndPoint}/shiftActivityLog/edit/time`, body);
  } catch (e) {
    return throwAPIError(e);
  }
};
