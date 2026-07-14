import * as actionTypes from './actionTypes';

export function logoutUser() {
  return { type: actionTypes.USER_LOGOUT };
}
