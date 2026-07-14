import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((_theme) => ({
  loaderShapesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    rowGap: '20px',
    width: '100%',
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

  activityBarSkeletonRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px,',
  },
  iconBar: {
    '&.MuiSkeleton-root': {
      width: 40,
      height: 40,
      borderRadius: '8px !important',
    },
  },

  textBarSmall: {
    '&.MuiSkeleton-root': {
      width: '100px',
      height: 18,
    },
  },

  textBar: {
    '&.MuiSkeleton-root': {
      width: '200px',
      height: 18,
    },
  },

  longBar: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },

  simpleBar: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
  salesAccordionSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
}));

/**
 * @description Pie skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const ActivityBarSkeleton = ({ noOfRows = 1, onlyBar = false }) => {
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
      {onlyBar ? (
        <Box className={classes.salesAccordionSkeleton}>
          {resultArray.map((el, index) => {
            return (
              <React.Fragment key={index}>
                <Skeleton
                  animation="wave"
                  variant="rounded"
                  className={classes.simpleBar}
                  height={30}
                />
              </React.Fragment>
            );
          })}
        </Box>
      ) : (
        <>
          <Skeleton animation="wave" variant="rounded" className={classes.longBar} height={30} />
          {resultArray.map((el, index) => {
            return (
              <Box key={index} className={classes.activityBarSkeleton}>
                <Box className={classes.activityBarSkeletonLeft}>
                  <Skeleton animation="wave" variant="rounded" className={classes.iconBar} />
                  <Box className={classes.activityBarSkeletonRight}>
                    <Skeleton animation="wave" variant="text" className={classes.textBar} />
                    <Skeleton animation="wave" variant="text" className={classes.textBarSmall} />
                  </Box>
                </Box>
                <Box className={classes.activityBarSkeletonRight}>
                  <Skeleton animation="wave" variant="text" className={classes.textBar} />
                  <Skeleton animation="wave" variant="text" className={classes.textBarSmall} />
                </Box>
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
};

ActivityBarSkeleton.defaultProps = {};

ActivityBarSkeleton.propTypes = {
  className: PropTypes.object,
  noOfRows: PropTypes.number,
  onlyBar: PropTypes.bool,
};
export default ActivityBarSkeleton;
