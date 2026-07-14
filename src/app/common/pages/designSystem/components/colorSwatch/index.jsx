import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ColorSwatch = ({ name, value }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const isLight = (hex) => {
    const c = hex.replace('#', '');
    if (c.length !== 6) return true;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 186;
  };

  return (
    <Box
      onClick={handleCopy}
      sx={{
        cursor: 'pointer',
        borderRadius: 1,
        border: '1px solid #e6e6e7',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      }}
      title={t('designSystemPage.colors.clickToCopy')}
    >
      <Box
        sx={{
          height: 56,
          backgroundColor: value,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          p: 0.5,
        }}
      >
        {copied && (
          <Typography
            variant="caption"
            sx={{
              color: isLight(value) ? '#262527' : '#fff',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {t('designSystemPage.colors.copied')}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1, backgroundColor: '#fff' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: '#262527' }}>
          {name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#86868b', fontFamily: 'monospace' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

ColorSwatch.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default ColorSwatch;
