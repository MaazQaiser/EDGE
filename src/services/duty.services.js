import queryString from 'query-string';
import {
  deleteHttpRequest,
  getHttpRequest,
  patchHttpRequest,
  postHttpRequest,
  putHttpRequest,
} from 'src/helper/axios';

import { isObjectEmpty } from '../helper/utilityFunctions';
import { TEMPLATE_TYPES } from '../utils/constants';
import { throwAPIError } from '../utils/throwAPIError';

// eslint-disable-next-line no-undef
export const dutyServiceEndPoint = process.env.REACT_APP_SCHEDULING;
export const templateServiceEndPoint = process.env.REACT_APP_TEMPLATE;
const franchiseServiceEndPoint = process.env.REACT_APP_FRANCHISE;
export const SCHEDULING_SERVICE = process.env.REACT_APP_SCHEDULING;
export const getInvoiceData = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${dutyServiceEndPoint}/invoices?${query}`, config);
  } catch (e) {
    throwAPIError(e.message);
  }
};
// Get All Duties API
export const allDutyData = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${dutyServiceEndPoint}/shiftActivityLog/summary?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 * Companies tab: companies, their sites, and a rolling year of visits per site.
 *
 * Server-side on purpose — twelve months of cadence across a whole book is
 * arithmetic a database does well and a browser does badly, and projecting on
 * the client would also put the scheduled/projected boundary in the wrong place.
 */
export const getCompanyVisitSchedule = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/companies/schedule?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

/** Overview coverage + top-row KPIs (unfiltered week scope). */
export const getDutySummaryStats = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/schedule/stats?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get All Duties for List View
export const allListDutyData = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${dutyServiceEndPoint}/shift/summaryList?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

// Get All Duties of Month API
export const allMonthDutyData = async (queryParams, config = {}) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/aggregate?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function getActiveAndInActiveOfficers({ shiftId, queryParams, config = {} }) {
  const query = queryString.stringify(queryParams, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/availableOfficers/dedicated/${shiftId}?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}
export async function getReportTemplatesList(siteId) {
  try {
    return await getHttpRequest(
      `${templateServiceEndPoint}/templates?templateable_type=${TEMPLATE_TYPES['Tour Reports']}&siteId=${siteId}&level=site`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export const createExtraDuty = async (postData) => {
  try {
    if (isObjectEmpty(postData)) {
      throw new Error();
    }

    return await postHttpRequest(`${dutyServiceEndPoint}/job/extra`, postData);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteExtraJob = async (shiftId) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    return await deleteHttpRequest(`${dutyServiceEndPoint}/job/delete/${shiftId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteShiftById = async ({ shiftId, start, end }) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    return await deleteHttpRequest(
      `${dutyServiceEndPoint}/shift/${shiftId}?windowStart=${start}&windowEnd=${end}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

/* params- shiftId */
export const getDutyDataById = async ({ jobId, shiftId }) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    return await getHttpRequest(`${dutyServiceEndPoint}/job/${jobId}/shift/${shiftId}`);
  } catch (error) {
    return throwAPIError(error);
  }
};

/* params- siteId */
export const fetchCheckpointsBySiteId = async (siteId) => {
  try {
    if (!siteId) {
      throw new Error();
    }
    return await getHttpRequest(
      `${franchiseServiceEndPoint}/mobile/sites/${siteId}/checkpoints?page=1&perPage=1000`,
    );
    // return await getHttpRequest(
    //   `${franchiseServiceEndPoint}/sites/${siteId}/checkpoints/checkpoint_options`,
    // );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const assignDedicatedDuties = async ({ payload, shiftId }) => {
  try {
    return await postHttpRequest(`${dutyServiceEndPoint}/shift/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const editDedicatedDuty = async ({ payload, shiftId }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/update/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const editExtraDuty = async ({ payload, shiftId }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/updateExtra/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

/* params- shiftId */
export const fetchShiftDetail = async (shiftId) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    // Fetch data from API
  } catch (error) {
    throw new Error();
  }
};

/* params- shiftId */
export const fetchShiftDetailActivities = async (shiftId) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    // Fetch data from API
  } catch (error) {
    throw new Error();
  }
};

export const getAllSitesByOfficerId = async (officerId) => {
  try {
    return await getHttpRequest(`${dutyServiceEndPoint}/shiftassignment/officerSites/${officerId}`);
  } catch (e) {
    throwAPIError(e);
  }
};

export const fetchDefaultHourlyRateOfFranchise = async () => {
  try {
    return await getHttpRequest(`${franchiseServiceEndPoint}/preferences/extra_job`);
  } catch (e) {
    throwAPIError(e);
  }
};

export const fetchJobsAndShiftsListBySiteId = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${dutyServiceEndPoint}/job/getJobsAndJobShifts?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const createTourTemplate = async ({ payload, siteId }) => {
  try {
    return await postHttpRequest(
      `${franchiseServiceEndPoint}/sites/${siteId}/tour_templates`,
      payload,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchTourTemplatesBySiteId = async (siteId, jobType) => {
  try {
    return await getHttpRequest(
      `${franchiseServiceEndPoint}/sites/${siteId}/tour_templates/list?jobType=${jobType}`,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchTourTemplatesById = async (tourId) => {
  try {
    return await getHttpRequest(`${franchiseServiceEndPoint}/tour_templates/${tourId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const assignShift = async ({ payload, shiftId }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/assign/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const reassignShift = async ({ payload, shiftId }) => {
  try {
    return await putHttpRequest(`${dutyServiceEndPoint}/shift/reassign/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const splitShift = async ({ payload, shiftId }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/split/${shiftId}`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const deleteTourTemplate = async (tourId) => {
  try {
    return await deleteHttpRequest(`${franchiseServiceEndPoint}/tour_templates/${tourId}`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchShiftDetailForAssignmentById = async ({ shiftId, shiftDate }) => {
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shift/details/${shiftId}?shiftDate=${shiftDate}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchShiftDetailForSplittingById = async (shiftId) => {
  try {
    return await getHttpRequest(`${dutyServiceEndPoint}/shift/split/${shiftId}`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchShiftDetailById = async ({ shiftId, shiftDate }) => {
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/${shiftId}?shiftDate=${shiftDate}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};
export const fetchShiftActivitiesById = async ({ shiftId, shiftDate, siteId }) => {
  try {
    const query = queryString.stringify(
      { shiftDate, siteId },
      {
        arrayFormat: 'bracket',
        skipEmptyString: true,
        skipNull: true,
      },
    );
    console.log({ query });
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/activities/${shiftId}?${query}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchShiftActivityReportPdf = async ({ body }, config = {}) => {
  try {
    const query = queryString.stringify(body, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${dutyServiceEndPoint}/pdf/?${query}`, config);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchShiftLogsById = async ({ logId, shiftDate }) => {
  try {
    if (!logId) {
      throw new Error();
    }

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/logs/${logId}?shiftDate=${shiftDate}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const addNotesToShift = async ({ payload, shiftActivityLogId }) => {
  try {
    if (!shiftActivityLogId) {
      throw new Error();
    }

    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/note/${shiftActivityLogId}`,
      payload,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};
export const addNotesToShiftWithoutLogId = async ({ payload, runsheetId }) => {
  try {
    if (!runsheetId) {
      throw new Error();
    }

    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/additionalNote/${runsheetId}`,
      payload,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};
export const editNotesOfShift = async ({ payload, shiftActivityLogId, noteId }) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/note/${shiftActivityLogId}/${noteId}`,
      payload,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const deleteNotesOfShift = async ({ shiftActivityLogId, noteId }) => {
  try {
    return await deleteHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/note/${shiftActivityLogId}/${noteId}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const fetchNotesById = async ({ shiftActivityLogId, params }) => {
  try {
    if (!shiftActivityLogId) {
      return;
    }
    const query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/logs/${shiftActivityLogId}?type=note&${query}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};
export const editPatrolHit = async ({ hitId, payload }) => {
  try {
    if (!hitId) {
      throw new Error();
    }

    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/editHit/${hitId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const addTourToHit = async ({ hitId, payload }) => {
  try {
    if (!hitId) {
      throw new Error();
    }

    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/tour/${hitId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};
export const deleteTourOfHit = async ({ hitId }) => {
  try {
    if (!hitId) {
      throw new Error();
    }

    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/tour/delete/${hitId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteHitById = async ({ hitId, start, end }) => {
  try {
    const payload = {
      windowStart: start,
      windowEnd: end,
    };

    if (!hitId) {
      throw new Error();
    }

    return await patchHttpRequest(`${dutyServiceEndPoint}/shift/hit/cancel/${hitId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchRunsheetsByHitAndDay = async ({ hitId, day }) => {
  try {
    if (!hitId || isNaN(day)) {
      throw new Error();
    }

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/patrol/findRunsheet/${hitId}/${day}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const addHitToRunsheet = async ({ payload }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shiftassignment/patrol/addHit`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getRunsheetShiftDetail = async ({ runsheetId, params }) => {
  const query = queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });

  try {
    if (!runsheetId) {
      throw new Error();
    }

    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/runsheet/${runsheetId}?${query}`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

export const assignmentToRunsheet = async ({ runsheetId, payload }) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/patrol/assign/${runsheetId}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const assignmentToSplittedRunsheet = async ({ shiftActivityLogId, payload }) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/split/assign/${shiftActivityLogId}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export async function getActiveAndInActivePatrolOfficers({ runsheetId, queryParams, config = {} }) {
  const query = queryString.stringify(queryParams, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/availableOfficers/patrol/${runsheetId}?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getActiveAndInActivePatrolVehicles({ runsheetId, queryParams, config = {} }) {
  const query = queryString.stringify(queryParams, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });
  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/availableVehicles/${runsheetId}?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export const getHitShiftDetail = async ({ hitId, params }) => {
  const query = queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });
  try {
    return await getHttpRequest(`${dutyServiceEndPoint}/shift/patrol/hit/${hitId}?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const cancelPastHitOfRunsheet = async ({ logId, payload }) => {
  try {
    if (!logId) {
      throw new Error();
    }

    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/cancel/hit/${logId}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const fetchRunsheetList = async ({ params, config = {} }) => {
  const query = queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });

  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/runsheets/list?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const addMissedHitToRunsheet = async ({ runsheetId, payload }) => {
  try {
    if (!runsheetId) {
      throw new Error();
    }

    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftassignment/addMissedHit/runsheet/${runsheetId}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const reassignHitsToRunsheet = async (payload) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/patrol/reassignHit`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getMissedHits = async ({ startsAt, endsAt, config = {} }) => {
  const params = { startsAt, endsAt };
  const query = queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });

  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/runsheet/missedHits?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getMissedHitsCount = async ({ startsAt, endsAt, config = {} }) => {
  const params = { startsAt, endsAt };
  const query = queryString.stringify(params, {
    arrayFormat: 'bracket',
    skipEmptyString: true,
    skipNull: true,
  });

  try {
    return await getHttpRequest(
      `${dutyServiceEndPoint}/shiftactivityLog/runsheet/missedHits/count?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

// Update Shift Time
export const updateShiftTime = async ({ shiftId, payload }) => {
  try {
    if (!shiftId) {
      throw new Error();
    }

    return await patchHttpRequest(`${dutyServiceEndPoint}/job/updateJobTime/${shiftId}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateAllowClockBackIn = async (activityLogId) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/restart/${activityLogId}`,
      {},
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const dedicatedSplitShiftDuty = async ({ payload }) => {
  try {
    return await patchHttpRequest(`${dutyServiceEndPoint}/shiftActivityLog/edit/time`, payload);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const updateShiftTimeDedicated = async ({ payload }) => {
  try {
    return await patchHttpRequest(`${SCHEDULING_SERVICE}/shiftActivityLog/edit/time`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const cancelShift = async ({ payload }) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/dedicated/cancelShift`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const restoreShift = async ({ activityLogId, payload }) => {
  try {
    return await patchHttpRequest(
      `${dutyServiceEndPoint}/shiftActivityLog/restore/${activityLogId}`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
