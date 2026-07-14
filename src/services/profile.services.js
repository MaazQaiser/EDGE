import { getHttpRequest, postHttpRequest, putHttpRequest } from 'src/helper/axios';
import { throwAPIError } from 'src/utils/throwAPIError';

const profileServiceEndPoint = process.env.REACT_APP_USER;

// will fetch users profile data.
export const getProfile = async () => {
  try {
    const data = await getHttpRequest(`${profileServiceEndPoint}/users/show_profile`);

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

// will update users profile data if provided right payload
export const updateProfile = async (payLoad) => {
  try {
    if (!payLoad) {
      throw new Error();
    }

    const data = await putHttpRequest(`${profileServiceEndPoint}/users/update_profile`, payLoad);

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

// will fetch users profile data.
export const getLanguages = async () => {
  try {
    const data = await getHttpRequest(`${profileServiceEndPoint}/languages`);

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};

/**
 * @description update language
 * @param {*} payLoad
 * @returns
 */
export const updateLanguage = async (payLoad) => {
  try {
    const data = await postHttpRequest(`${profileServiceEndPoint}/users/update_language`, payLoad);

    return data;
  } catch (e) {
    return throwAPIError(e);
  }
};
