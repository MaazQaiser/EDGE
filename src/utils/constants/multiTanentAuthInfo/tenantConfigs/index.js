/**
 * Which tenant's auth0 configuration this build talks to.
 *
 * **This used to `await import()` one of four files at the top level of the
 * module, and that is why no test in this repo could run.** Jest transforms to
 * CommonJS, where there is no module body to await inside, so the whole suite
 * died on `SyntaxError: await is only valid in async functions and the top level
 * bodies of modules` — reached from `setupTests.js`, so every test file paid for
 * it whether or not it touched tenants.
 *
 * The dynamic import was not buying anything either. `multiTanentAuthInfo/index.js`
 * reads `Object.keys(MULTI_TENANT_CONFIGURATIONS)` at *its* module scope, so the
 * value has to be there synchronously; the top-level await only papered over a
 * load-order dependency it also created. Four static imports of four small
 * objects — 87 lines of auth0 domains between them — make the export honestly
 * synchronous, and the environments a build never uses are dead weight measured
 * in bytes.
 */

import development from './tenants.development.js';
import production from './tenants.production.js';
import staging from './tenants.staging.js';
import uat from './tenants.uat.js';

const CONFIGS = { development, staging, uat, production };

const resolveConfig = () => {
  const environment = process.env.REACT_APP_NODE_ENV;

  if (environment === 'localhost') {
    const named = process.env.REACT_APP_LOCALHOST_TENANT_CONFIG || 'development';
    /* Previously a bad value here threw an unresolved-module error at import
       time. Naming it and carrying on is more use to whoever set it. */
    if (!CONFIGS[named]) {
      console.warn(`Unknown localhost tenant config "${named}". Falling back to development.`);
      return CONFIGS.development;
    }
    return CONFIGS[named];
  }

  if (CONFIGS[environment]) return CONFIGS[environment];

  /* Kept as it was, message included: the warning says development and the
     fallback is production. Left alone deliberately — correcting it is a
     behaviour change to auth configuration, not a test fix. */
  console.warn('Unknown environment. Falling back to development configs.');
  return CONFIGS.production;
};

export const MULTI_TENANT_CONFIGURATIONS = resolveConfig();
