import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Create = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: '24px' }}>
      <Typography variant="h4" gutterBottom>
        {t('obx.create.title', { defaultValue: 'Create' })}
      </Typography>
      <Typography variant="body1" sx={{ marginTop: '16px' }}>
        {t('obx.create.description', {
          defaultValue: 'Create new items and manage your content here.',
        })}
      </Typography>
    </Box>
  );
};

export default Create;
