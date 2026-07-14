import { Box, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './styles';

const ConfigureSkeleton = ({ isEditMode = false }) => {
  const classes = useStyles();

  return (
    <Box className={classes.configureContainer}>
      <Box className={classes.headerSection}>
        <Box className={classes.headerLeft}>
          <Box className={classes.headerLeftTitle}>
            <Skeleton variant="circular" width={36} height={36} />
            <Skeleton variant="text" width={200} height={28} sx={{ marginLeft: '8px' }} />
          </Box>

          {!isEditMode && (
            <Box className={classes.headerDropdowns}>
              <Skeleton
                variant="rectangular"
                width={100}
                height={37}
                sx={{ borderRadius: '4px' }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={37}
                sx={{ borderRadius: '4px' }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={37}
                sx={{ borderRadius: '4px' }}
              />
            </Box>
          )}
        </Box>
        <Box className={classes.headerRight}>
          <Skeleton variant="rectangular" width={80} height={37} sx={{ borderRadius: '4px' }} />
          <Skeleton variant="rectangular" width={80} height={37} sx={{ borderRadius: '4px' }} />
        </Box>
      </Box>

      <Box className={classes.contentSection}>
        <Box className={classes.numericInputsRow}>
          {[1, 2, 3].map((index) => (
            <Box key={index} className={classes.numericInput}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={37}
                sx={{ borderRadius: '4px' }}
              />
            </Box>
          ))}
        </Box>

        <Box className={classes.editorSection}>
          {[1, 2, 3].map((index) => (
            <Box key={index} className={classes.editorBlock}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width="100%" height={150} sx={{ borderRadius: '4px' }} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

ConfigureSkeleton.propTypes = {
  isEditMode: PropTypes.bool,
};

export default ConfigureSkeleton;
