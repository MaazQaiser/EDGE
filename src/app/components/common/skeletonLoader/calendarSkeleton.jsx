import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import React from 'react';

export const useStyles = makeStyles((_theme) => ({
  calendarSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    rowGap: '20px',
    width: '100%',
    height: 'calc(100vh - 25px)',
  },

  calendarSkeletonHeader: {
    '& .MuiSkeleton-root': {
      width: '100%',
      height: 50,
      borderRadius: '8px !important',
    },
  },

  calendarSkeletonBody: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    '& .MuiSkeleton-root': {
      width: '100%',
      height: 100,
      borderRadius: '8px !important',
      transform: 'unset',
      transformOrigin: 'unset',
    },
  },
}));

const CalendarSkeleton = () => {
  const classes = useStyles();

  return (
    <Box className={classNames(classes.calendarSkeletonWrapper)}>
      <Box className={classes.calendarSkeletonBody}>
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
        <Skeleton animation="wave" />
      </Box>
    </Box>
  );
};

export default CalendarSkeleton;
