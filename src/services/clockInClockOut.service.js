import { getHttpRequest, patchHttpRequest, postHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

export const clockInClockServiceEndpoint = process.env.REACT_APP_SCHEDULING;
export const getUserClockInDetails = async (config = {}) => {
  try {
    return await getHttpRequest(`${clockInClockServiceEndpoint}/attendance/latestClockin`, config);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const singInUser = async (payload = {}, config = {}) => {
  try {
    return await postHttpRequest(
      `${clockInClockServiceEndpoint}/attendance/supervisorClockIn`,
      payload,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};

export const singOutUser = async (payload = {}, config = {}) => {
  try {
    return await patchHttpRequest(
      `${clockInClockServiceEndpoint}/attendance/supervisorClockOut`,
      payload,
      config,
    );
  } catch (e) {
    return throwAPIError(e);
  }
};
