import store from '../../store';

export default function userHasRole(roleId) {
  if (!roleId) {
    return false;
  }

  // Get the user's role ID from store
  const state = store.getState();
  const userRoleId = state.auth.userRoleId;

  // Check if user has permission
  return userRoleId && userRoleId === roleId;
}
