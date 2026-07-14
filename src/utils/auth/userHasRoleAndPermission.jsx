import store from '../../store';

export default function userHasRoleAndPermission(role, permission) {
  let hasRoleAndPermission = false;

  if (!role || !permission) {
    return hasRoleAndPermission;
  }

  // Get all the user's permissions and role ID from store
  const state = store.getState();
  const permissions = state.auth.permissions;
  const userRoleId = state.auth.userRoleId;

  // Check if user has permission
  if (permissions && permissions.length > 0) {
    hasRoleAndPermission = role === userRoleId;
    hasRoleAndPermission = hasRoleAndPermission && permissions.includes(permission);
  }

  return hasRoleAndPermission;
}
