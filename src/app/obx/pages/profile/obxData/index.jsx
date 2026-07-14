import { Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ObxDataComponent from '../../users/detail/components/obxData';
import { useStyles } from '../style';

const ObxData = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { id } = useSelector((state) => state.user.info);
  return (
    <Box>
      <Box className={classes.tabContent}>
        <Typography variant="h5" gutterBottom>
          {t('obx.profile.obxData')}
        </Typography>
        <Typography className={classes.descriptionText} variant="body2">
          {t('obx.profile.obxDataText')}
        </Typography>
      </Box>
      <ObxDataComponent id={id} isProfile />
    </Box>
  );
};

export default ObxData;
