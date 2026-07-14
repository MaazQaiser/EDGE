import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTenantLabel } from '../../../../helper/utilityHooks';
import { useStyles } from './NoShiftAvailable.style';
const NoShiftAvailable = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  return (
    <Box className={classes.notesBox}>
      <NoDataIcon />
      <Box className={classes.maxWidth}>
        <Typography variant="h2" className={classes.notesError}>
          {t('obx.dispatch.noShiftsAvailable!')}
        </Typography>
        <Typography variant="body2" className={classes.notesMessage}>
          {t('obx.dispatch.noShiftsText', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
            dispatch: getLabel('terms', 'dispatch', t).toLowerCase(),
          })}
        </Typography>
      </Box>
      <Button variant="primary">
        {t('obx.dispatch.createRunsheet', {
          runsheet: getLabel('terms', 'runsheet', t),
        })}
      </Button>
    </Box>
  );
};

export default NoShiftAvailable;
