import { checkACLPermission } from 'src/helper/utilityFunctions';

import store from '../../redux/store/index';
// import { rolesEnum } from '../../utils/constants/index';

export default function userHasPermissionSideBar(name, activeModule, aclPermission = '') {
  let hasPermission = false;

  if (!name) {
    return hasPermission;
  }
  // Get all permissions from store
  const state = store.getState();
  const dashboardActive = state.auth.dashboardActive;
  const reduxACLPermissions = state.auth.accessControlPermissions;
  // Check if user has permission

  if (
    dashboardActive &&
    checkACLPermission(reduxACLPermissions, aclPermission) &&
    activeModule.includes(dashboardActive)
  ) {
    hasPermission = true;
  } else {
    hasPermission = checkACLPermission(reduxACLPermissions, aclPermission);
  }

  return hasPermission;
}
