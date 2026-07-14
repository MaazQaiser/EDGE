import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import customTheme from 'src/customTheme.json';
import palette from 'src/theme/palette';

import ColorSwatch from '../colorSwatch';

const SEMANTIC_GROUPS = {
  text: [
    'textPrimary',
    'textSecondary1',
    'textSecondary2',
    'textSecondary3',
    'textPlaceholder',
    'textPlaceholderField',
    'textDisabled',
    'textOnColor',
    'textBrand',
    'textBrandHover',
    'textBrandDisabled',
    'textAlert',
    'textAlerDisabled',
    'textSuccess',
    'textWarning',
  ],
  border: [
    'borderSubtle1',
    'borderSubtle2',
    'borderStrong1',
    'borderStrong2',
    'borderBrand',
    'borderWarning',
    'borderSuccess',
    'borderAlert',
    'borderPurple',
    'borderAlertHover',
    'borderAlertDisabled',
    'borderBrandDisabled',
  ],
  surface: [
    'surfaceWhite',
    'surfaceGreySubtle',
    'surfaceGreyLight',
    'surfaceGreyStrong1',
    'surfaceGreyDisabled',
    'surfaceGreyStrong2',
    'surfaceAlertSubtle',
    'surfaceAlertStrong',
    'surfaceAlertDisabled',
    'surfaceAlertHover',
    'surfaceSuccessSubtle',
    'surfaceSuccessStrong',
    'surfaceWarningSubtle',
    'surfaceWarningStrong',
    'surfaceBrandSubtle',
    'surfaceBrand',
    'surfaceBrandDisabled',
    'surfaceBrandHover',
  ],
};

const RAW_SCALES = ['common', 'blue', 'orange', 'grey'];

const ColorsTab = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="h4" sx={{ mb: 2, color: '#262527' }}>
          {t('designSystemPage.colors.semanticTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#86868b' }}>
          src/theme/palette.js
        </Typography>
        {Object.entries(SEMANTIC_GROUPS).map(([groupKey, keys]) => (
          <Box key={groupKey} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#444446' }}>
              {t(`designSystemPage.colors.groups.${groupKey}`)}
            </Typography>
            <Grid container spacing={2}>
              {keys.map((key) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={key}>
                  <ColorSwatch name={key} value={palette[key]} />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>

      <Box>
        <Typography variant="h4" sx={{ mb: 2, color: '#262527' }}>
          {t('designSystemPage.colors.rawTitle')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#86868b' }}>
          src/customTheme.json
        </Typography>
        {RAW_SCALES.map((scaleKey) => {
          const scale = customTheme.palette[scaleKey];
          if (!scale) return null;
          return (
            <Box key={scaleKey} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#444446' }}>
                {t(`designSystemPage.colors.scales.${scaleKey}`)}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(scale).map(([shade, hex]) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={`${scaleKey}-${shade}`}>
                    <ColorSwatch name={`${scaleKey}-${shade}`} value={hex} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ColorsTab;
