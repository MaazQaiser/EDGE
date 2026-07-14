import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  notificationsSkeleton: {
    padding: '20px 10px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },

  activityBarSkeleton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  activityBarSkeletonLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  notificationsSkeletonIcon: {
    '& .MuiSkeleton-root': {
      width: 40,
      height: 40,
      borderRadius: '8px !important',
    },
  },

  notificationsSkeletonDetail: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflow: 'hidden',

    '& .MuiSkeleton-root': {
      width: '100%',
      height: 18,
    },
  },

  notificationsSkeletonTitle: {
    '&.MuiSkeleton-root': {
      width: '50%',
      height: 18,
    },
  },

  notificationsSkeletonAction: {
    width: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '8px',
  },
}));

const NotificationSkeleton = ({ noOfNotification = 1 }) => {
  const classes = useStyles();

  function numberToArray(number) {
    // Check if the input is a valid number
    if (typeof number !== 'number' || isNaN(number) || number < 0) {
      console.error('Please provide a valid non-negative number.');
      return;
    }

    // Create an array with length equal to the number
    const resultArray = Array.from({ length: number }, (_, index) => index);

    return resultArray;
  }

  const resultArray = numberToArray(noOfNotification);

  return (
    <>
      {resultArray.map((_, index) => {
        return (
          <Box key={index} className={classes.notificationsSkeleton}>
            <Box className={classes.notificationsSkeletonIcon}>
              <Skeleton variant="rectangular" />
            </Box>
            <Box className={classes.notificationsSkeletonDetail}>
              <Skeleton variant="rectangular" className={classes.notificationsSkeletonTitle} />
              <Skeleton variant="rectangular" />
            </Box>
            <Box className={classes.notificationsSkeletonAction}>
              <Skeleton variant="rectangular" />
              <Skeleton variant="rectangular" />
            </Box>
          </Box>
        );
      })}
    </>
  );
};

NotificationSkeleton.propTypes = {
  noOfNotification: PropTypes.number,
};

export default NotificationSkeleton;
