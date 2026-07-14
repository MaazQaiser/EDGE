import { Box, Grid, Skeleton, Typography } from '@mui/material';
import { ReactComponent as BlueDotIcon } from 'assets/svg/BlueDotIcon.svg?react';
import { ReactComponent as GreenDotIcon } from 'assets/svg/GreenDotIcon.svg?react';
import { ReactComponent as OrangeDotIcon } from 'assets/svg/OrangeDotIcon.svg?react';
import { ReactComponent as PurpleDotIcon } from 'assets/svg/PurpleDotIcon.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { fomatNumbersWithCommas } from 'src/utils/currencyFormater';

import { useStyles } from '../../dashboardStyles.js';
function KeyMatrics({ data, isLoading, franchiseKeyMetrics }) {
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={0} columns={16} className={classes.borderTop}>
        <Grid item xs={4} md={4} className={classes.borderRight}>
          <Box className={classes.statBox}>
            <OrangeDotIcon />
            <Box>
              <Typography variant="subtitle2">
                {!isLoading && franchiseKeyMetrics?.functionalSites?.name}
                {isLoading && (
                  <Skeleton animation="wave" variant="rounded" width={120} height={15} />
                )}
              </Typography>
              <Typography variant="h5">
                {!isLoading && fomatNumbersWithCommas(franchiseKeyMetrics?.functionalSites?.value)}
                {isLoading && (
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    width={80}
                    height={10}
                    sx={{ marginTop: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={4} md={4} className={classes.borderRight}>
          <Box className={classes.statBox}>
            <GreenDotIcon />
            <Box>
              <Typography variant="subtitle2">
                {!isLoading && data?.dedicatedShifts?.name}
                {isLoading && (
                  <Skeleton animation="wave" variant="rounded" width={120} height={15} />
                )}
              </Typography>
              <Typography variant="h5">
                {!isLoading && fomatNumbersWithCommas(data?.dedicatedShifts?.value)}
                {isLoading && (
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    width={80}
                    height={10}
                    sx={{ marginTop: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={4} md={4} className={classes.borderRight}>
          <Box className={classes.statBox}>
            <BlueDotIcon />
            <Box>
              <Typography variant="subtitle2">
                {!isLoading && data?.patrolShifts?.name}
                {isLoading && (
                  <Skeleton animation="wave" variant="rounded" width={120} height={15} />
                )}
              </Typography>
              <Typography variant="h5">
                {!isLoading && fomatNumbersWithCommas(data?.patrolShifts?.value)}
                {isLoading && (
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    width={80}
                    height={10}
                    sx={{ marginTop: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={4} md={4}>
          <Box className={classes.statBox}>
            <PurpleDotIcon />
            <Box>
              <Typography variant="subtitle2">
                {!isLoading && franchiseKeyMetrics?.dispatchRequests?.name}
                {isLoading && (
                  <Skeleton animation="wave" variant="rounded" width={120} height={15} />
                )}
              </Typography>
              <Typography variant="h5">
                {!isLoading && fomatNumbersWithCommas(franchiseKeyMetrics?.dispatchRequests?.value)}
                {isLoading && (
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    width={80}
                    height={10}
                    sx={{ marginTop: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

KeyMatrics.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
  franchiseKeyMetrics: PropTypes.object,
};

export default KeyMatrics;
