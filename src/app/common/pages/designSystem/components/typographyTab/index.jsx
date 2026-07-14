import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import palette from 'src/theme/palette';
import typographyFactory from 'src/theme/typography';

const TYPOGRAPHY_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'subtitle3',
  'subtitle4',
  'body1',
  'body2',
  'body3',
  'button',
  'caption',
  'info',
  'overline',
];

const typographyStyles = typographyFactory(palette);

const TypographyTab = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 3, color: '#86868b' }}>
        src/theme/typography.js — Font family: Inter
      </Typography>
      {TYPOGRAPHY_VARIANTS.map((variant, index) => {
        const style = typographyStyles[variant] || {};
        return (
          <Box key={variant}>
            {index > 0 && <Divider sx={{ my: 2 }} />}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#262527' }}>
                  {variant}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: '#86868b', fontFamily: 'monospace', mt: 0.5 }}
                >
                  {style.fontSize} / {style.fontWeight} / {style.lineHeight}
                </Typography>
              </Box>
              <Typography sx={style}>{t('designSystemPage.typography.sampleText')}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default TypographyTab;
