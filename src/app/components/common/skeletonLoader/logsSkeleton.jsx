import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  log: {
    padding: '10px 0',
    display: 'flex',
    gap: '8px',
    position: 'relative',

    '&:before': {
      content: '""',
      position: 'absolute',
      top: '93%',
      transform: 'translateY(-50%)',
      left: '12px',
      width: '1px',
      height: '30px',
      background: theme.palette.borderSubtle1,
    },

    '&:last-child:before': {
      display: 'none',
    },
  },

  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  logAvatarSkeleton: {
    '&.MuiSkeleton-root': {
      width: '24px',
      height: '24px',
      borderRadius: '50% !important',
      transform: 'none',
      transformOrigin: 'none',
    },
  },

  logContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  logTitleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '60%',
      height: 16,
      transform: 'none',
      transformOrigin: 'none',
    },
  },

  logTextSkeleton: {
    '&.MuiSkeleton-root': {
      width: '30%',
      height: 8,
      transform: 'none',
      transformOrigin: 'none',
    },
  },
}));

/**
 * @description Pie skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const LogsSkeleton = ({ noOfRows = 1 }) => {
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

  const resultArray = numberToArray(noOfRows);

  return (
    <Box className={classes.loaderShapesWrapper}>
      {resultArray.map((el, index) => {
        return (
          <Box key={index} className={classes.log}>
            <Skeleton className={classes.logAvatarSkeleton} />
            <Box className={classes.logContent}>
              <Box className={classes.logHeader}>
                <Skeleton className={classes.logTitleSkeleton} />
              </Box>
              <Skeleton className={classes.logTextSkeleton} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

LogsSkeleton.defaultProps = {};

LogsSkeleton.propTypes = {
  className: PropTypes.object,
  noOfRows: PropTypes.number,
};
export default LogsSkeleton;
