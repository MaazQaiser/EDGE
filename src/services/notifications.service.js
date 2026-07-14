import { getHttpRequest, putHttpRequest } from 'helper/axios';
import queryString from 'query-string';
import { throwAPIError } from 'src/utils/throwAPIError';

const REACT_APP_NOTIFICATIONS_URL = process.env.REACT_APP_NOTIFICATIONS;

export const getNotifications = async (params) => {
  try {
    let query = queryString.stringify(params, {
      arrayFormat: 'bracket',
      skipEmptyString: true,
      skipNull: true,
    });

    return await getHttpRequest(`${REACT_APP_NOTIFICATIONS_URL}/notifications/retrieve?${query}`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const markNotificationsRead = async () => {
  try {
    return await putHttpRequest(`${REACT_APP_NOTIFICATIONS_URL}/notifications/mark_read`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getNotificationsCount = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_NOTIFICATIONS_URL}/notifications/unread`);
  } catch (e) {
    return throwAPIError(e);
  }
};

export const getUsersNotificationUrl = async () => {
  try {
    return await getHttpRequest(`${REACT_APP_NOTIFICATIONS_URL}/notifications/subscription_url`);
  } catch (e) {
    return throwAPIError(e);
  }
};
