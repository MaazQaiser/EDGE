import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { useStyles } from '../../dashboardStyles.js';
const OfficersOnDutySkeleton = () => {
  const classes = useStyles();
  return (
    <>
      <Box className={classes.profileContainer}>
        <Box className={classes.box}>
          <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          <Skeleton animation="wave" variant="rounded" width={200} height={10} />
        </Box>
        <Box className={classes.onDutyOfficer}>
          <Skeleton animation="wave" variant="rounded" width={220} height={10} />
        </Box>
        <Skeleton animation="wave" variant="rounded" width={250} height={10} />
        <Skeleton animation="wave" variant="rounded" width={200} height={10} />
      </Box>
      <Box className={classes.profileContainer}>
        <Box className={classes.box}>
          <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          <Skeleton animation="wave" variant="rounded" width={200} height={10} />
        </Box>
        <Box className={classes.onDutyOfficer}>
          <Skeleton animation="wave" variant="rounded" width={220} height={10} />
        </Box>
        <Skeleton animation="wave" variant="rounded" width={250} height={10} />
        <Skeleton animation="wave" variant="rounded" width={200} height={10} />
      </Box>
      <Box className={classes.profileContainer}>
        <Box className={classes.box}>
          <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          <Skeleton animation="wave" variant="rounded" width={200} height={10} />
        </Box>
        <Box className={classes.onDutyOfficer}>
          <Skeleton animation="wave" variant="rounded" width={220} height={10} />
        </Box>
        <Skeleton animation="wave" variant="rounded" width={250} height={10} />
        <Skeleton animation="wave" variant="rounded" width={200} height={10} />
      </Box>
      <Box className={classes.profileContainer}>
        <Box className={classes.box}>
          <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          <Skeleton animation="wave" variant="rounded" width={200} height={10} />
        </Box>
        <Box className={classes.onDutyOfficer}>
          <Skeleton animation="wave" variant="rounded" width={220} height={10} />
        </Box>
        <Skeleton animation="wave" variant="rounded" width={250} height={10} />
        <Skeleton animation="wave" variant="rounded" width={200} height={10} />
      </Box>
    </>
  );
};

export default OfficersOnDutySkeleton;
