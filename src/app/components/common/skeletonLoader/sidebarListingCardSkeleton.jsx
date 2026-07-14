import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '16px',
  },
  loaderShapesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  sidebarCardSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    gap: '8px',
    padding: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  upperBar: {
    '&.MuiSkeleton-root': {
      width: 100,
      height: 12,
    },
  },
  lowerBar: {
    '&.MuiSkeleton-root': {
      width: 40,
      height: 8,
    },
  },
}));

/**
 * @description Pie skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @returns
 */

const SideBarListingSkeleton = ({ className }) => {
  const classes = useStyles();

  return (
    <>
      <Box className={classNames(classes.container, className)}>
        <Box className={classes.loaderShapesWrapper}>
          <Box className={classes.sidebarCardSkeleton}>
            <Skeleton animation="wave" variant="rounded" className={classes.upperBar} />
            <Skeleton animation="wave" variant="rounded" className={classes.lowerBar} />
          </Box>
          <Box className={classes.sidebarCardSkeleton}>
            <Skeleton animation="wave" variant="rounded" className={classes.upperBar} />
            <Skeleton animation="wave" variant="rounded" className={classes.lowerBar} />
          </Box>
        </Box>
      </Box>
    </>
  );
};

SideBarListingSkeleton.defaultProps = {};

SideBarListingSkeleton.propTypes = {
  className: PropTypes.object,
};
export default SideBarListingSkeleton;
