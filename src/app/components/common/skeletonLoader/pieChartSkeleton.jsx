import { Box, Skeleton, Typography } from '@mui/material';
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
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'calc(200px - 24px)',
    gap: '16px',
    width: '100%',
  },
  legendsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  lagendBarBox: {
    display: 'flex',
    gap: '6px',
  },
  lagendBarDott: {
    '&.MuiSkeleton-root': {
      width: 14,
      height: 8,
    },
  },
  lagendBarLine: {
    '&.MuiSkeleton-root': {
      width: 81,
      height: 8,
    },
  },
  pieChartCircle: {
    '&.MuiSkeleton-root': {
      height: 120,
      width: 120,
    },
  },
}));

/**
 * @description Pie Chart skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @param {String} title => Pass the title/heading of the PieChart box
 * @param {Boolean} isValue => If that box has any counter or value you can pass true/false for value skeleton
 * @param {number} legendCount => You can pass the number, to show up the legends besides the pie Chart
 * @returns
 */

const PieChartSkeleton = ({ className, title, isValue, legendCount }) => {
  const classes = useStyles();

  const legendBarSkeletonHTML = (id) => (
    <Box className={classes.lagendBarBox} key={id}>
      <Skeleton animation="wave" variant="rounded" className={classes.lagendBarDott} />
      <Skeleton animation="wave" variant="rounded" className={classes.lagendBarLine} />
    </Box>
  );

  const legendSkeletonHandler = () => {
    const skeletonBar = [];
    for (let a = 0; a < legendCount; a++) {
      skeletonBar.push(legendBarSkeletonHTML(a));
    }
    return skeletonBar;
  };

  return (
    <>
      <Box className={classNames(classes.container, className)}>
        <Box className={classes.chartInfo}>
          {title && (
            <Typography variant="subtitle2" className={classes.title}>
              {title}
            </Typography>
          )}
          {isValue && <Skeleton animation="wave" variant="rounded" className={classes.value} />}
        </Box>
        <Box className={classes.loaderShapesWrapper}>
          <Box className={classes.legendsWrapper}>{legendSkeletonHandler()}</Box>
          <Skeleton animation="wave" variant="circular" className={classes.pieChartCircle} />
        </Box>
      </Box>
    </>
  );
};

PieChartSkeleton.defaultProps = {
  isValue: false,
  legendCount: 3,
};

PieChartSkeleton.propTypes = {
  className: PropTypes.object,
  title: PropTypes.string,
  isValue: PropTypes.bool,
  legendCount: PropTypes.number,
};
export default PieChartSkeleton;
