import { Box, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
  subHeaderMainSkeleton: {
    position: 'sticky',
    backgroundColor: theme.palette.surfaceGreySubtle,
    left: 0,
    zIndex: 9,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  headrDetailsSkeleton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
  },
  userNameTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 18,
      width: 118,
      [theme.breakpoints.down(786)]: {
        width: '50px',
        height: '10px',
      },
    },
  },
  usedetailsTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 8,
      width: 187,
      [theme.breakpoints.down(786)]: {
        width: '70px',
      },
    },
  },
  statusNameTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 12,
      width: 100,
    },
  },
  statusValuTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 8,
      width: 40,
    },
  },
  avatarSectionSkeleton: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flex: '1',
  },
  avatarSkeleton: {
    '&.MuiSkeleton-root': {
      height: 32,
      width: 32,
      [theme.breakpoints.down(786)]: {
        display: 'none',
      },
    },
  },
  rightContentSkeleton: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  rightDetailSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userWrapperSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
}));

/**
 * @description top details skeleton loader for all top details of detail components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @param {number} numberOfStatusItem => You can pass the number, to show the number of status used in top deatils for skeleton body

 * @returns
 */

const DispatchHeaderSkeletonThreeColumn = ({ className, hasImage }) => {
  const classes = useStyles();
  //   const statusSkeletonHTML = (
  //     <Box className={classes.rightDetailSkeleton}>
  //       <Skeleton animation="wave" variant="rounded" className={classes.statusNameTextSkeleton} />
  //       <Skeleton animation="wave" variant="rounded" className={classes.statusValuTextSkeleton} />
  //       <Skeleton animation="wave" variant="rounded" className={classes.statusValuTextSkeleton} />
  //       <Skeleton animation="wave" variant="rounded" className={classes.statusValuTextSkeleton} />
  //       <Skeleton animation="wave" variant="rounded" className={classes.statusValuTextSkeleton} />
  //     </Box>
  //   );
  //   const statusSkeletonHandler = () => {
  //     const skeletonBar = [];
  //     for (let a = 0; a < numberOfStatusItem; a++) {
  //       skeletonBar.push(statusSkeletonHTML);
  //     }
  //     return skeletonBar;
  //   };

  return (
    <>
      <Box className={classNames(classes.subHeaderMainSkeleton, className)}>
        <Box className={classes.headrDetailsSkeleton}>
          <Box className={classes.avatarSectionSkeleton}>
            {hasImage && (
              <Skeleton animation="wave" variant="circular" className={classes.avatarSkeleton} />
            )}
            <Box className={classes.userWrapperSkeleton}>
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.userNameTextSkeleton}
              />
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.usedetailsTextSkeleton}
              />
            </Box>
          </Box>
          <Box className={classes.avatarSectionSkeleton}>
            {hasImage && (
              <Skeleton animation="wave" variant="circular" className={classes.avatarSkeleton} />
            )}
            <Box className={classes.userWrapperSkeleton}>
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.userNameTextSkeleton}
              />
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.usedetailsTextSkeleton}
              />
            </Box>
          </Box>
          <Box className={classes.avatarSectionSkeleton}>
            {hasImage && (
              <Skeleton animation="wave" variant="circular" className={classes.avatarSkeleton} />
            )}
            <Box className={classes.userWrapperSkeleton}>
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.userNameTextSkeleton}
              />
              <Skeleton
                animation="wave"
                variant="rounded"
                className={classes.usedetailsTextSkeleton}
              />
            </Box>
          </Box>
          {/* <Box className={classes.rightContentSkeleton}>{statusSkeletonHandler()}</Box> */}
        </Box>
      </Box>
    </>
  );
};

DispatchHeaderSkeletonThreeColumn.defaultProps = {
  numberOfStatusItem: 3,
  hasImage: true,
};

DispatchHeaderSkeletonThreeColumn.propTypes = {
  className: PropTypes.object,
  numberOfStatusItem: PropTypes.number,
  hasImage: PropTypes.bool,
};
export default DispatchHeaderSkeletonThreeColumn;
