import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTenantLabel } from 'src/helper/utilityHooks';

import Jobs from '../jobs';
import { useStyles } from './All.style';

const All = ({ jobs, selectedJob, handleJobChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  return (
    <Box className={classes.tabInnerWrapper}>
      {!!jobs?.dedicatedJobs?.length && (
        <Jobs
          jobs={jobs?.dedicatedJobs}
          label={t('obx.dispatch.dedicatedJobs')}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type="dedicated"
        />
      )}
      {!!jobs?.patrolJobs?.length && (
        <Jobs
          jobs={jobs?.patrolJobs}
          label={t('obx.dispatch.patrolJobs', {
            patrol: getLabel('terms', 'patrol', t),
            runsheets: getLabel('terms', 'runsheets', t),
          })}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type="patrol"
        />
      )}
      {!!jobs?.patrolSupervisors?.length && (
        <Jobs
          jobs={jobs?.patrolSupervisors}
          label={t('obx.dispatch.users')}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type="patrolSupervisors"
        />
      )}
    </Box>
  );
};

All.propTypes = {
  jobs: PropTypes.object,
  selectedJob: PropTypes.object,
  showSupervisorList: PropTypes.bool,
  handleJobChange: PropTypes.func,
};

export default All;
