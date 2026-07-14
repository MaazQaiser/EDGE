import { Box } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './DipatchNotes';
const DipatchNotes = () => {
  const classes = useStyles();

  const { t } = useTranslation();
  return (
    <Box className={classes.dipacthDetails}>
      DipatchNotes =========== ======{`${t('obx.payroll.exportPayrun')}`}
    </Box>
  );
};

export default DipatchNotes;
