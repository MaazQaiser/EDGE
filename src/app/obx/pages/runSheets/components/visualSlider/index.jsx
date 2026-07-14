import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  visualSlider: {
    margin: '8px 0',
    position: 'relative',
  },
  visualSliderBg: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },
  visualSliderInner: {
    height: '8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceBrand,
  },
  visualSliderLeftText: {
    position: 'absolute',
    top: '12px',
    left: '0',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  visualSliderText: {
    position: 'absolute',
    top: '12px',
    transform: 'translateX(-50%)', // Center the text at the left position
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  visualSliderRightText: {
    position: 'absolute',
    top: '12px',
    right: '0',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));

const calculateSliderPosition = (start, current, end) => {
  if (current < start || current > end) {
    throw new Error('Current value must be between start and end values');
  }

  const range = end - start;
  const percentage = ((current - start) / range) * 100;

  return {
    widthPercentage: percentage,
    leftPosition: percentage,
  };
};

const VisualSlider = ({ start, current, end, text = '' }) => {
  const classes = useStyles();
  const { widthPercentage, leftPosition } = calculateSliderPosition(start, current, end);

  return (
    <Box className={classes.visualSlider}>
      <Box className={classes.visualSliderBg}>
        <Box className={classes.visualSliderInner} style={{ width: `${widthPercentage}%` }}></Box>
      </Box>
      <Box>
        <Typography className={classes.visualSliderLeftText} variant="subtitle2">
          {start}
        </Typography>
        <Typography
          className={classes.visualSliderText}
          variant="subtitle2"
          style={{ left: `${leftPosition}%` }}
        >
          {current} {text}
        </Typography>
        <Typography className={classes.visualSliderRightText} variant="subtitle2">
          {end}
        </Typography>
      </Box>
    </Box>
  );
};

VisualSlider.propTypes = {
  start: PropTypes.number,
  current: PropTypes.number,
  end: PropTypes.number,
  text: PropTypes.string,
};

export default VisualSlider;
