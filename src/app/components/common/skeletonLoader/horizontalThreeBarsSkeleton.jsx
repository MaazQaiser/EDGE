import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '16px',
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      marginBottom: '8px',
    },
  },
  value: {
    '&.MuiSkeleton-root': {
      height: 18,
      width: 57,
    },
  },
  loaderShapesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flex: 1,
    gap: '8px',
    width: '100%',
  },
  horizontalTopBar: {
    '&.MuiSkeleton-root': {
      height: 12,
      width: 57,
    },
  },
  horizontalMiddleBar: {
    '&.MuiSkeleton-root': {
      height: 18,
      width: 93,
    },
  },
  horizontalBottomBar: {
    '&.MuiSkeleton-root': {
      height: 11,
      width: 30,
    },
  },
}));

/**
 * @description Horizontal three bar skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const HorizontalThreeBarsSkeleton = ({ className }) => {
  const classes = useStyles();

  return (
    <>
      <Box className={classNames(classes.container, className)}>
        <Box className={classes.loaderShapesWrapper}>
          <Skeleton animation="wave" variant="rounded" className={classes.horizontalTopBar} />
          <Skeleton animation="wave" variant="rounded" className={classes.horizontalMiddleBar} />
          <Skeleton animation="wave" variant="rounded" className={classes.horizontalBottomBar} />
        </Box>
      </Box>
    </>
  );
};

HorizontalThreeBarsSkeleton.defaultProps = {};

HorizontalThreeBarsSkeleton.propTypes = {
  className: PropTypes.object,
};
export default HorizontalThreeBarsSkeleton;
