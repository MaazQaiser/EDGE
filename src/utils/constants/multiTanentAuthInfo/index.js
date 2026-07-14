import { MULTI_TENANT_CONFIGURATIONS as tenantConfigs } from './tenantConfigs/index';
import tenantDefaults from './tenantDefaults';

// Validate tenant consistency
const defaultTenants = Object.keys(tenantDefaults);
const configTenants = Object.keys(tenantConfigs);

// if (defaultTenants?.length !== configTenants?.length) {
//   console.error(
//     `🚨 Tenants defined in tenantDefaults are not equal to tenants defined in tenantConfigs`,
//   );
//   throw new Error(
//     `🚨 Tenants defined in tenantDefaults are not equal to tenants defined in tenantConfigs`,
//   );
// }

// Find missing or extra tenants
const missingInConfigs = defaultTenants.filter((t) => !configTenants.includes(t));
const extraInConfigs = configTenants.filter((t) => !defaultTenants.includes(t));

console.log({ missingInConfigs });
//
// if (missingInConfigs.length > 0) {
//   console.error(`🚨 Missing tenant(s) in tenantConfigs: ${missingInConfigs.join(', ')}`);
//   throw new Error(`Missing tenant(s) configuration(s): ${missingInConfigs.join(', ')}`);
// }

if (extraInConfigs.length > 0) {
  console.warn(
    `⚠️ Warning: Extra tenant(s) found in tenantConfigs not declared in tenantDefaults: ${extraInConfigs.join(', ')}`,
  );
}

// Merge both configs
export const MULTI_TENANT_AUTH = defaultTenants.reduce((acc, tenant) => {
  acc[tenant] = {
    ...tenantDefaults[tenant],
    ...tenantConfigs[tenant],
  };
  return acc;
}, {});
