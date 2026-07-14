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
    height: 'calc(200px - 24px)',
    width: '100%',
  },

  YAxisLabelsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 32,
    width: 30,
  },

  yAxisLabel: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: 8,
    },
  },

  rightGraphWrapper: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: 16,
    flex: 1,
    height: '100%',
    marginLeft: 20,
  },
  singleBar: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
  },
  verticalBarSmall: {
    '&.MuiSkeleton-root': {
      height: 84,
      width: 16,
    },
  },
  verticalBarMedium: {
    '&.MuiSkeleton-root': {
      height: 104,
      width: 16,
    },
  },
  verticalBarLarge: {
    '&.MuiSkeleton-root': {
      height: 137,
      width: 16,
    },
  },
  horizontalBar: {
    '&.MuiSkeleton-root': {
      height: 12,
      width: 30,
    },
  },
}));

/**
 * @description Bar Chart skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @param {String} title => Pass the title/heading of the PieChart box
 * @param {Boolean} isRequiredMoreBars => Pass the true/false to double the vertical bars
 * @param {Boolean} isValue => If that box has any counter or value you can pass true/false for value skeleton
 * @returns
 */

const BarChartSkeleton = ({ className, title, isRequiredMoreBars, isValue }) => {
  const classes = useStyles();
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
          <Box className={classes.YAxisLabelsBox}>
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
          </Box>
          <Box className={classes.rightGraphWrapper}>
            <Box className={classes.singleBar}>
              <Skeleton animation="wave" variant="rounded" className={classes.verticalBarSmall} />
              <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
            </Box>
            <Box className={classes.singleBar}>
              <Skeleton animation="wave" variant="rounded" className={classes.verticalBarLarge} />
              <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
            </Box>
            <Box className={classes.singleBar}>
              <Skeleton animation="wave" variant="rounded" className={classes.verticalBarMedium} />
              <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
            </Box>
            <Box className={classes.singleBar}>
              <Skeleton animation="wave" variant="rounded" className={classes.verticalBarSmall} />
              <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
            </Box>
            <Box className={classes.singleBar}>
              <Skeleton animation="wave" variant="rounded" className={classes.verticalBarLarge} />
              <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
            </Box>
            {isRequiredMoreBars && (
              <>
                <Box className={classes.singleBar}>
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    className={classes.verticalBarSmall}
                  />
                  <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
                </Box>
                <Box className={classes.singleBar}>
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    className={classes.verticalBarLarge}
                  />
                  <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
                </Box>
                <Box className={classes.singleBar}>
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    className={classes.verticalBarMedium}
                  />
                  <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
                </Box>
                <Box className={classes.singleBar}>
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    className={classes.verticalBarSmall}
                  />
                  <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
                </Box>
                <Box className={classes.singleBar}>
                  <Skeleton
                    animation="wave"
                    variant="rounded"
                    className={classes.verticalBarLarge}
                  />
                  <Skeleton animation="wave" variant="rounded" className={classes.horizontalBar} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

BarChartSkeleton.defaultProps = {
  isRequiredMoreBars: false,
  isValue: false,
};

BarChartSkeleton.propTypes = {
  className: PropTypes.object,
  title: PropTypes.string,
  isRequiredMoreBars: PropTypes.bool,
  isValue: PropTypes.bool,
};
export default BarChartSkeleton;
