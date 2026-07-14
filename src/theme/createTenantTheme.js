import { createTheme } from '@mui/material/styles';

import breakpoints from './breakpoints';
import overrides from './overrides';
import basePalette from './palette';
import typography from './typography';
import { applyBrandTokensToPalette, getBrandTokensForTenant } from './tenantBranding';

export function createTenantTheme(tenant) {
  const tokens = getBrandTokensForTenant(tenant);
  const palette = applyBrandTokensToPalette(basePalette, tokens);

  const baseTheme = {
    palette,
    typography: typography(palette),
    overrides: overrides({ palette }),
    breakpoints,
  };

  return createTheme({
    ...baseTheme,
    components: {
      MuiButton: baseTheme.overrides.MuiButton,
      MuiOutlinedInput: baseTheme.overrides.MuiTextField,
      MuiSwitch: baseTheme.overrides.MuiSwitch,
      MuiRadio: baseTheme.overrides.MuiRadio,
      MuiCheckbox: baseTheme.overrides.MuiCheckbox,
      MuiInputLabel: baseTheme.overrides.MuiInputLabel,
      MuiTableCell: baseTheme.overrides.MuiTableCell,
      MuiChip: baseTheme.overrides.MuiChip,
      MuiSelect: baseTheme.overrides.MuiSelect,
      MuiMenuItem: baseTheme.overrides.MuiMenuItem,
      MuiTooltip: baseTheme.overrides.MuiTooltip,
      MuiAccordion: baseTheme.overrides.MuiAccordion,
      MuiSkeleton: baseTheme.overrides.MuiSkeleton,
      MuiList: baseTheme.overrides.MuiList,
      MuiLinearProgress: baseTheme.overrides.MuiLinearProgress,
    },
  });
}
