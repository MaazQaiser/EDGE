import { Box, LinearProgress, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from '../../dashboardStyles.js';
const JobEfficiency = ({ data }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  return (
    <Box className={classes.jobEfficiencyWrapper}>
      <Box className={classes.ProgressWrapper}>
        <Typography variant="body3" className={classes.pTitle}>
          {getLabel('terms', 'patrol', t)}
        </Typography>
        <Box className={classes.jobEfficiency}>
          <Typography variant="button" className={classes.jobPercent}>
            {data?.patrol?.percentage || 0}%
          </Typography>
          <Typography variant="overline" className={classes.jobCompletation}>
            {t('obx.dashboard.completion')}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={data?.patrol?.percentage || 0}
          color="primary"
        />
      </Box>
      <Box className={classes.ProgressWrapper}>
        <Typography variant="body3" className={classes.pTitle}>
          {getLabel('terms', 'dedicated', t)}
        </Typography>
        <Box className={classes.jobEfficiency}>
          <Typography variant="button" className={classes.jobPercent}>
            {data?.dedicated?.percentage || 0}%
          </Typography>
          <Typography variant="overline" className={classes.jobCompletation}>
            {t('obx.dashboard.completion')}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={data?.dedicated?.percentage || 0}
          color="secondary"
        />
      </Box>
    </Box>
  );
};

JobEfficiency.propTypes = {
  data: PropTypes.object,
};

export default JobEfficiency;
