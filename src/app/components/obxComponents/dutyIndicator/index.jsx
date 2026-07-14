import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './dutyIndicator';

export default function DutyIndicator({ color, label, className }) {
  const classes = useStyles();
  return (
    <Box className={classNames(classes.indicatorMainWrapper, className)}>
      <Box
        className={classes.indicatorBar}
        sx={{
          background: `${color}`,
        }}
      ></Box>

      <Typography variant="subtitle3" className={classes.dutyType}>
        {label}
      </Typography>
    </Box>
  );
}

DutyIndicator.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string,
  className: PropTypes.string,
};
