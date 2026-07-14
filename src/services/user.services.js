import queryString from 'query-string';
import { sitesServiceNodeEndPoint } from 'services/sites.services';
import { deleteHttpRequest, getHttpRequest, putHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

// eslint-disable-next-line no-undef
export const usersServiceEndPoint = process.env.REACT_APP_USER;
export const franchiseServiceEndPoint = process.env.REACT_APP_FRANCHISE;

export const usersServiceSalesEndPoint = process.env.REACT_APP_SALES;

export const schedulingServiceEndPoint = process.env.REACT_APP_SCHEDULING;

export const getSupervisors = async () => {
  try {
    // if (!id) {
    //   throw new Error();
    // }

    const data = await getHttpRequest(`${usersServiceEndPoint}/users/supervisor/options`);
    return data?.data?.supervisors;
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUsersWithDesiredType = async (queryParams) => {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${usersServiceEndPoint}/users/options?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const userTypeGraphData = async () => {
  try {
    return await getHttpRequest(`${usersServiceEndPoint}/users/user_type_graph`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const missedJobsGraphData = async () => {
  try {
    return await getHttpRequest(`${schedulingServiceEndPoint}/shiftActivityLog/graph/missedJob`);
  } catch (error) {
    return throwAPIError(error);
  }
};

export const jobsPerformedOverTheYearGraphData = async () => {
  try {
    return await getHttpRequest(
      `${schedulingServiceEndPoint}/shiftActivityLog/graph/yearlyPerformedJob`,
    );
  } catch (error) {
    return throwAPIError(error);
  }
};

// Get franchise API
export async function getUsers(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${usersServiceEndPoint}/users/role_user_list?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getUsersById(id) {
  try {
    return await getHttpRequest(`${usersServiceEndPoint}/users/${id}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getUsersAttendance(id, queryParams, config) {
  try {
    queryParams.officerId = id;
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(
      `${sitesServiceNodeEndPoint}/shiftActivityLog/attendanceLogs?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getUsersAvailability(id) {
  try {
    return await getHttpRequest(`${usersServiceEndPoint}/users/${id}/availability`);
  } catch (e) {
    // return throwAPIError(e);
  }
}

export async function updateUsersAvailability(id, payload) {
  try {
    return await putHttpRequest(`${usersServiceEndPoint}/users/${id}/update_availability`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function updateUsersInfo(id, payload) {
  try {
    return await putHttpRequest(`${usersServiceEndPoint}/users/${id}/update_user_data`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getHomeOfficeUsers(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${usersServiceEndPoint}/home_office/users?${query}`, config);
  } catch (e) {
    return throwAPIError(e);
  }
}

export async function getSalesUsers(queryParams, config = {}) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(
      `${usersServiceEndPoint}/home_office/users/interns_and_sales_persons?${query}`,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
}

export const getSalesUserDetail = async (userId) => {
  try {
    return await getHttpRequest(`${usersServiceSalesEndPoint}/web/users/${userId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const deleteOfficer = async (userId) => {
  try {
    return await deleteHttpRequest(`${usersServiceEndPoint}/authorized_sites/${userId}`);
  } catch (e) {
    // throw error
    return throwAPIError(e);
  }
};

export const getRunsheetSupervisorsOptions = async () => {
  try {
    return await getHttpRequest(`${usersServiceEndPoint}/users/runsheet_supervisor/options`);
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

export const getUserPermission = async (userId) => {
  try {
    return await getHttpRequest(`${usersServiceSalesEndPoint}/web/users/${userId}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const updateUsersPermissions = async (payload, id) => {
  try {
    return await putHttpRequest(`${usersServiceEndPoint}/users/${id}/update_privileges`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getEmploymentHistory = async (id, config) => {
  try {
    return await getHttpRequest(`${usersServiceEndPoint}/users/${id}/employement_history`, config);
  } catch (e) {
    throw new Error(e);
  }
};

export async function terminateUser(id, payload) {
  try {
    return await putHttpRequest(`${usersServiceEndPoint}/users/${id}/terminate_user`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}

// Get OBX data form of user
export async function getObxDataFormOfUser(queryParams) {
  try {
    const query = queryString.stringify(queryParams, {
      arrayFormat: 'index',
      skipEmptyString: true,
      skipNull: true,
    });
    return await getHttpRequest(`${usersServiceEndPoint}/obx_forms?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
}

// Submit OBX data form of user
export async function submitObxDataFormOfUser(id, payload) {
  try {
    return await putHttpRequest(`${usersServiceEndPoint}/obx_forms/${id}`, payload);
  } catch (e) {
    return throwAPIError(e);
  }
}
