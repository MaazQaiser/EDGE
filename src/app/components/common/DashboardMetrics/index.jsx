import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { GraphArrow } from 'src/assets/svg';

export const useStyles = makeStyles((_theme) => ({
  dateInGreen: {
    '&.MuiTypography-root': {
      color: '#5CB85C',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    '& svg': {
      width: '16px',
      height: '16px',

      '& path': {
        stroke: '#5CB85C',
      },
    },
  },
  dateInRed: {
    '&.MuiTypography-root': {
      color: '#D9534F',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    '& svg': {
      width: '16px',
      height: '16px',
      transform: 'rotate(180deg)',
      '& path': {
        stroke: '#D9534F',
      },
    },
  },
  dataAmount: {
    '&.MuiTypography-root': {
      color: '#000',
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '24px',
      marginTop: '5px',
      marginBottom: '5px',
    },
  },
  chartHeading: {
    '&.MuiTypography-root': {
      color: '#86868B',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '700',
      lineHeight: '20px',
      letterSpacing: '0.25px',
    },
  },
  dataFlexWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    flex: 1,
  },
  dataFlex: {
    flex: '1 1',
  },
  mainChartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginTop: '24px',
    gap: '32px',
  },
}));

const DashboardMetrics = () => {
  const classes = useStyles();
  return (
    <Box className={classes.mainChartWrapper}>
      <Box className={classes.dataFlexWrap}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Missed Duties</Typography>
          <Typography className={classes.dataAmount}>25</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 6%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Overtime</Typography>
          <Typography className={classes.dataAmount}>11</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 3%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Officer Efficiency</Typography>
          <Typography className={classes.dataAmount}>$24,450</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.5%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Patrol duties</Typography>
          <Typography className={classes.dataAmount}>3</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
      </Box>
      <Box className={classes.dataFlexWrap}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Dedicated duties</Typography>
          <Typography className={classes.dataAmount}>1</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Dispatches</Typography>
          <Typography className={classes.dataAmount}>2</Typography>
          <Typography variant="h6" className={classes.dateInGreen}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}></Box>
        <Box className={classes.dataFlex}></Box>
      </Box>
    </Box>
  );
};

DashboardMetrics.propTypes = {
  heading: PropTypes.string,
};

export default DashboardMetrics;
