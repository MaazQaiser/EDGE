import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((_theme) => ({
  loaderShapesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    rowGap: '24px',
    width: '100%',
  },
  infoCardSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    gap: '6px',
  },
  upperBar: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: 12,
    },
  },
  lowerBar: {
    '&.MuiSkeleton-root': {
      width: '50%',
      height: 8,
    },
  },
}));

/**
 * @description Pie skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const InfoCardSkeleton = ({ noOfRows = 1 }) => {
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
          <Box key={index} className={classes.infoCardSkeleton}>
            <Skeleton animation="wave" variant="rounded" className={classes.upperBar} />
            <Skeleton animation="wave" variant="rounded" className={classes.lowerBar} />
          </Box>
        );
      })}
    </Box>
  );
};

InfoCardSkeleton.defaultProps = {};

InfoCardSkeleton.propTypes = {
  className: PropTypes.object,
  noOfRows: PropTypes.number,
};
export default InfoCardSkeleton;
