import { Box, Skeleton } from '@mui/material';
import React from 'react';

import { useStyles } from '../../dashboardStyles.js';

const TopSiteSkeleton = () => {
  const classes = useStyles();
  return (
    <Box className={classes.inventoaryListWrapper}>
      <Box className={classes.inventoryList}>
        <Box className={classes.leftListSide}>
          <Box className={classes.topImageWrapper}>
            <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          </Box>

          <Skeleton animation="wave" variant="rounded" width={120} height={10} />
        </Box>
        <Box className={classes.rightListSide}>
          <Box className={classes.ListItem}>
            <Skeleton animation="wave" variant="rounded" width={70} height={10} />
          </Box>
        </Box>
      </Box>
      <Box className={classes.inventoryList}>
        <Box className={classes.leftListSide}>
          <Box className={classes.topImageWrapper}>
            <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          </Box>

          <Skeleton animation="wave" variant="rounded" width={120} height={10} />
        </Box>
        <Box className={classes.rightListSide}>
          <Box className={classes.ListItem}>
            <Skeleton animation="wave" variant="rounded" width={70} height={10} />
          </Box>
        </Box>
      </Box>
      <Box className={classes.inventoryList}>
        <Box className={classes.leftListSide}>
          <Box className={classes.topImageWrapper}>
            <Skeleton animation="wave" variant="rounded" width={30} height={30} />
          </Box>

          <Skeleton animation="wave" variant="rounded" width={120} height={10} />
        </Box>
        <Box className={classes.rightListSide}>
          <Box className={classes.ListItem}>
            <Skeleton animation="wave" variant="rounded" width={70} height={10} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopSiteSkeleton;
