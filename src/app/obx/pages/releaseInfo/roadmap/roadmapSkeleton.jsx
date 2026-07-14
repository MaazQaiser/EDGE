import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { useStyles } from './styles';

const RoadmapSkeleton = () => {
  const classes = useStyles();

  return (
    <Box className={classes.roadmapContainer}>
      <Box className={classes.quarterCard}>
        <Box className={classes.quarterHeader}>
          <Box className={classes.statusContainer}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '16px' }} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          <Skeleton variant="text" width={120} height={24} sx={{ marginTop: '8px' }} />
          <Skeleton variant="text" width={100} height={20} sx={{ marginTop: '4px' }} />
          <Box className={classes.summaryContainer} style={{ marginTop: '8px' }}>
            <Skeleton variant="text" width={60} height={18} />
            <Box sx={{ width: '4px', height: '4px' }} />
            <Skeleton variant="text" width={50} height={18} />
            <Box sx={{ width: '4px', height: '4px' }} />
            <Skeleton variant="text" width={80} height={18} />
          </Box>
        </Box>
        <Box className={classes.quarterDetails}>
          <Box className={classes.detailSection}>
            <Skeleton variant="text" width={80} height={20} sx={{ marginBottom: '8px' }} />
            <Box className={classes.detailList}>
              <Skeleton variant="text" width="90%" height={18} />
              <Skeleton variant="text" width="75%" height={18} />
            </Box>
          </Box>
          <Box className={classes.detailSection}>
            <Skeleton variant="text" width={60} height={20} sx={{ marginBottom: '8px' }} />
            <Box className={classes.detailList}>
              <Skeleton variant="text" width="85%" height={18} />
              <Skeleton variant="text" width="70%" height={18} />
            </Box>
          </Box>
          <Box className={classes.detailSection}>
            <Skeleton variant="text" width={100} height={20} sx={{ marginBottom: '8px' }} />
            <Box className={classes.detailList}>
              <Skeleton variant="text" width="95%" height={18} />
              <Skeleton variant="text" width="80%" height={18} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RoadmapSkeleton;
