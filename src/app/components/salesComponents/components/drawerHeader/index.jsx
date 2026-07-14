import { Box, Typography } from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { CloseIcon } from 'src/assets/svg';

import { useStyles } from './drawerHeader.js';

const DrawerHeader = ({ title, subtext, handleCloseDrawer, anchor, className }) => {
  const classes = useStyles();
  return (
    <Box className={classNames(classes.boxHeader, className)}>
      <Box className={classes.titleHead}>
        <Typography variant="h3" className={classes.sideTitle}>
          {title}
        </Typography>
        <a href="#" onClick={() => handleCloseDrawer(anchor)}>
          <CloseIcon />
        </a>
      </Box>
      <Typography variant="body2" className={classes.bulkSubHeading}>
        {subtext}
      </Typography>
    </Box>
  );
};

DrawerHeader.propTypes = {
  title: PropTypes.string,
  subtext: PropTypes.string,
  handleCloseDrawer: PropTypes.func,
  anchor: PropTypes.string,
  className: PropTypes.string,
};
export default DrawerHeader;
