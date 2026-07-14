let tenantConfig;

switch (process.env.REACT_APP_NODE_ENV) {
  case 'development':
    tenantConfig = await import('./tenants.development.js');
    break;
  case 'staging':
    tenantConfig = await import('./tenants.staging.js');
    break;
  case 'uat':
    tenantConfig = await import('./tenants.uat.js');
    break;
  case 'production':
    tenantConfig = await import('./tenants.production.js');
    break;
  case 'localhost': {
    const localhostConfig = process.env.REACT_APP_LOCALHOST_TENANT_CONFIG || 'development';
    tenantConfig = await import(`./tenants.${localhostConfig}.js`);
    break;
  }
  default:
    console.warn('Unknown environment. Falling back to development configs.');
    tenantConfig = await import('./tenants.production.js');
    break;
}

export const MULTI_TENANT_CONFIGURATIONS = tenantConfig.default;
