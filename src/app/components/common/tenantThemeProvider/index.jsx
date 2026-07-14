import { ThemeProvider } from '@mui/material';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { mainDomain } from 'src/helper/utilityFunctions';
import { createTenantTheme } from 'src/theme/createTenantTheme';

export default function TenantThemeProvider({ children }) {
  const tenant = mainDomain();
  const theme = useMemo(() => createTenantTheme(tenant), [tenant]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

TenantThemeProvider.propTypes = {
  children: PropTypes.node,
};
