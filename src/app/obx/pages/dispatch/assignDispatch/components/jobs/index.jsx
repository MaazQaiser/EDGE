import { Box, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import JobsBar from '../jobsBar';
import { useStyles } from './jobs.style';

const Jobs = ({ jobs, label, selectedJob, type, handleJobChange }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.tabInnerWrapper}>
      <Typography variant="h4">{label}</Typography>
      {!jobs?.length && (
        <Box className={classes.notRecordFounWrapper}>
          <Box className={classes.noRecordFound}>
            <NoDataIcon />
            <Typography variant="h2" className={classes.noRecordFoundText}>
              {t('commonText.table.noRecordFound')}
            </Typography>
          </Box>
        </Box>
      )}
      {jobs?.map((job, index) => (
        <JobsBar
          job={job}
          key={index}
          selectedJob={selectedJob}
          handleJobChange={handleJobChange}
          type={type}
        />
      ))}
    </Box>
  );
};

Jobs.propTypes = {
  jobs: PropTypes.array,
  label: PropTypes.string,
  selectedJob: PropTypes.object,
  handleJobChange: PropTypes.func,
  type: PropTypes.string,
};

export default Jobs;
