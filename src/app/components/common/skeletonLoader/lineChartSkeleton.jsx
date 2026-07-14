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
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
    height: '100%',
    marginLeft: 20,
  },
  lineGraphLinesBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
    flex: 1,
  },
  lineSkeleton: {
    '&.MuiSkeleton-root': {
      width: '90%',
      height: 8,

      '&:nth-child(1)': {
        width: '33%',
      },
      '&:nth-child(2)': {
        width: '66%',
      },
    },
  },
  XAxisLabelsBox: {
    height: 8,
    minHeight: 8,
    display: 'flex',
    gap: 12,
    width: '100%',
  },
  XAxisLabel: {
    '&.MuiSkeleton-root': {
      height: '100%',
      flex: 1,
    },
  },
}));

/**
 * @description Linr Chart skeleton loader for all piechart used components
 * @param {String} className => Pass the class to overwrite the styles from parent component
 * @param {String} title => Pass the title/heading of the PieChart box
 * @returns
 */

const LineChartSkeleton = ({ className, title }) => {
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
        </Box>
        <Box className={classes.loaderShapesWrapper}>
          <Box className={classes.YAxisLabelsBox}>
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
            <Skeleton animation="wave" variant="rounded" className={classes.yAxisLabel} />
          </Box>
          <Box className={classes.rightGraphWrapper}>
            <Box className={classes.lineGraphLinesBox}>
              <Skeleton animation="wave" variant="rounded" className={classes.lineSkeleton} />
              <Skeleton animation="wave" variant="rounded" className={classes.lineSkeleton} />
              <Skeleton animation="wave" variant="rounded" className={classes.lineSkeleton} />
              <Skeleton animation="wave" variant="rounded" className={classes.lineSkeleton} />
            </Box>
            <Box className={classes.XAxisLabelsBox}>
              <Skeleton animation="wave" variant="rounded" className={classes.XAxisLabel} />
              <Skeleton animation="wave" variant="rounded" className={classes.XAxisLabel} />
              <Skeleton animation="wave" variant="rounded" className={classes.XAxisLabel} />
              <Skeleton animation="wave" variant="rounded" className={classes.XAxisLabel} />
              <Skeleton animation="wave" variant="rounded" className={classes.XAxisLabel} />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

LineChartSkeleton.defaultProps = {};

LineChartSkeleton.propTypes = {
  className: PropTypes.object,
  title: PropTypes.string,
};
export default LineChartSkeleton;
