import queryString from 'query-string';
import { deleteHttpRequest, getHttpRequest, patchHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

// eslint-disable-next-line no-undef
const attendanceServiceEndPoint = process.env.REACT_APP_SCHEDULING;

const userEndPoint = process.env.REACT_APP_USER;
export const userTypeGraphData = async () => {
  try {
    return await getHttpRequest(`${attendanceServiceEndPoint}/shift/franchiseAttendanceStats`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const leavesGraphData = async () => {
  try {
    return await getHttpRequest(`${attendanceServiceEndPoint}/shift/franchiseLeaveStats`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const leavesRequestOverTheYearGraphData = async () => {
  try {
    return await getHttpRequest(
      `${attendanceServiceEndPoint}/shift/franchiseLeavesOverTheYearStats`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};
// Get Attendances API
export async function getAttendances(queryParams, config) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${attendanceServiceEndPoint}/shiftassignment/leaveRequests?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getAttendance(id) {
  try {
    return await getHttpRequest(`${userEndPoint}/users/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getPendingAttendanceRequests(id, queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${attendanceServiceEndPoint}/shift/leaveRequests/${id}?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getAttendanceLogs(queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${attendanceServiceEndPoint}/shift/attendanceLogs?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function changeAttendanceRequest(payload) {
  try {
    return await patchHttpRequest(
      `${attendanceServiceEndPoint}/shiftassignment/bulkUpdateLeaveStatus`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function deleteLeaveRequest(id) {
  try {
    return await deleteHttpRequest(`${attendanceServiceEndPoint}/attendance/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function patchApplyLeave(payload) {
  try {
    return await patchHttpRequest(
      `${attendanceServiceEndPoint}/shiftassignment/applyForLeave`,
      payload,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}
