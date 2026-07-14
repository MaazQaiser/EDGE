import { Box, IconButton, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const AddReleaseSkeleton = ({ classes }) => {
  return (
    <Box className={classes.addReleaseContainer}>
      <Box className={classes.headerSection}>
        <Box className={classes.headerLeft}>
          <IconButton className={classes.backButton} disabled>
            <Skeleton variant="circular" width={24} height={24} />
          </IconButton>
          <Typography variant="h4" className={classes.headerTitle}>
            <Skeleton variant="text" width={220} height={36} />
          </Typography>
        </Box>
        <Box className={classes.headerRight}>
          <Skeleton variant="text" width={55} height={37} />

          <Skeleton variant="text" width={90} height={37} />
        </Box>
      </Box>
      <Box className={classes.contentSection}>
        <Box className={classes.formSection}>
          <Box className={classes.formField}>
            <Typography variant="body2" className={classes.inputLabel}>
              <Skeleton variant="text" width={180} />
            </Typography>
            <Skeleton variant="text" width="100%" height={56} />
          </Box>
          <Box className={classes.formField}>
            <Typography variant="body2" className={classes.inputLabel}>
              <Skeleton variant="text" width={160} />
            </Typography>
            <Skeleton variant="text" width="100%" height={56} />
          </Box>
        </Box>
        <Box className={classes.formField}>
          <Typography variant="body2" className={classes.inputLabel}>
            <Skeleton variant="text" width={130} />
          </Typography>
          <Skeleton variant="text" width="100%" height={260} />
        </Box>
      </Box>
    </Box>
  );
};

AddReleaseSkeleton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default AddReleaseSkeleton;
