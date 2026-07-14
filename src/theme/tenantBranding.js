export const FILTER_GO_TENANT = 'filter-go.com';
export const SIGNAL_TENANT = 'teamsignal.com';

export const TENANT_BRAND_TOKENS = {
  [FILTER_GO_TENANT]: {
    brandColor: '#2DA551',
    brandHover: '#248F44',
    brandSubtle: '#E8F7ED',
    brandDisabled: '#A8DDB8',
    brandSecondary: '#1E7A3E',
    brandSecondaryLight: '#B8E6C8',
  },
  [SIGNAL_TENANT]: {
    brandColor: '#146DFF',
    brandHover: '#0059FF',
    brandSubtle: '#E5F6FF',
    brandDisabled: '#A9DEFF',
    brandSecondary: '#FF9332',
    brandSecondaryLight: '#A9DEFF',
  },
};

export function getBrandTokensForTenant(tenant) {
  if (tenant === FILTER_GO_TENANT) {
    return TENANT_BRAND_TOKENS[FILTER_GO_TENANT];
  }
  return TENANT_BRAND_TOKENS[SIGNAL_TENANT];
}

export function applyBrandTokensToPalette(basePalette, tokens) {
  return {
    ...basePalette,
    textBrand: tokens.brandColor,
    textBrandHover: tokens.brandHover,
    textBrandDisabled: tokens.brandDisabled,
    borderBrand: tokens.brandColor,
    borderBrandDisabled: tokens.brandDisabled,
    surfaceBrand: tokens.brandColor,
    surfaceBrandHover: tokens.brandHover,
    surfaceBrandSubtle: tokens.brandSubtle,
    surfaceBrandDisabled: tokens.brandDisabled,
    brandSecondary: tokens.brandSecondary,
    brandSecondaryLight: tokens.brandSecondaryLight,
    primary: {
      main: tokens.brandColor,
      dark: tokens.brandHover,
      light: tokens.brandSubtle,
      contrastText: '#ffffff',
    },
    secondary: {
      main: tokens.brandSecondary,
      light: tokens.brandSecondaryLight,
      contrastText: '#ffffff',
    },
  };
}
