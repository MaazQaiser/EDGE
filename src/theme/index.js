import { createTheme } from '@mui/material/styles';

import { createTenantTheme } from './createTenantTheme';
import darkThemeConfig from './dark/theme';
import { SIGNAL_TENANT } from './tenantBranding';

export const theme = createTenantTheme(SIGNAL_TENANT);

export const themeDark = createTheme({
  ...darkThemeConfig,
  components: {
    MuiButton: darkThemeConfig.overrides.MuiButton,
  },
});

export { createTenantTheme } from './createTenantTheme';
export { FILTER_GO_TENANT, SIGNAL_TENANT } from './tenantBranding';
