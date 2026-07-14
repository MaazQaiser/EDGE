import { checkACLPermission } from 'src/helper/utilityFunctions';

import store from '../../redux/store/index';

export default function userHasPermission(name) {
  let hasPermission = false;

  if (!name) {
    return hasPermission;
  }
  // Get all permissions from store
  const state = store.getState();
  // const permissions = state.auth.accessList;
  const reduxACLPermissions = state.auth.accessControlPermissions;

  // // Check if user has permission
  // if (permissions && permissions.length > 0) {
  hasPermission = checkACLPermission(reduxACLPermissions, name);
  // }

  return hasPermission;
}
