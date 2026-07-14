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
    marginBottom: '15px',
  },
  mainChartWrapper: {
    marginTop: '34px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
}));

const SalesTeam = () => {
  const classes = useStyles();
  return (
    <Box className={classes.mainChartWrapper}>
      <Box className={classes.dataFlexWrap}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Total Sales Persons</Typography>
          <Typography className={classes.dataAmount}>250</Typography>
          <Typography variant="h6" className={classes.dateInGreen}>
            <GraphArrow /> 6%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Total Interns</Typography>
          <Typography className={classes.dataAmount}>39</Typography>
          <Typography variant="h6" className={classes.dateInGreen}>
            <GraphArrow /> 3%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Avg. Proposal Value</Typography>
          <Typography className={classes.dataAmount}>15</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.5%
          </Typography>
        </Box>
      </Box>
      <Box className={classes.dataFlexWrap}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Avg. Conversion</Typography>
          <Typography className={classes.dataAmount}>40%</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Avg. Deals Closed</Typography>
          <Typography className={classes.dataAmount}>2</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Avg. Business in USD</Typography>
          <Typography className={classes.dataAmount}>$2,500</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

SalesTeam.propTypes = {
  heading: PropTypes.string,
};

export default SalesTeam;
