import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
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
    height: '50%',
  },
  dataFlex: {
    flex: '1 1',
  },
  dataFlexGay: {
    background: '#F5F5F6',
    borderRadius: '8px',
    padding: '13px 19px',
    display: 'flex',
    alignItems: 'center',
    height: 'auto',
  },
  mainChartWrapper: {
    marginTop: '34px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
}));

const LocationMatic = () => {
  const classes = useStyles();
  return (
    <Box className={classes.mainChartWrapper}>
      <Box className={classes.dataFlexWrap}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Property Visits</Typography>
          <Typography className={classes.dataAmount}>3</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Met Decision Maker</Typography>
          <Typography className={classes.dataAmount}>30%</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Location to Deal</Typography>
          <Typography className={classes.dataAmount}>2:1.5</Typography>
          <Typography variant="h6" className={classes.dateInRed}>
            <GraphArrow /> 0.1%
          </Typography>
        </Box>
      </Box>
      <Box className={classNames(classes.dataFlexWrap, classes.dataFlexGay)}>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Qualified</Typography>
          <Typography className={classes.dataAmount}>3</Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Unqualified</Typography>
          <Typography className={classes.dataAmount}>1</Typography>
        </Box>
        <Box className={classes.dataFlex}>
          <Typography className={classes.chartHeading}>Percentage</Typography>
          <Typography className={classes.dataAmount}>2</Typography>
        </Box>
      </Box>
    </Box>
  );
};

LocationMatic.propTypes = {
  heading: PropTypes.string,
};

export default LocationMatic;
