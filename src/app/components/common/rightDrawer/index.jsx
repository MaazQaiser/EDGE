import Drawer from '@mui/material/Drawer';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import * as React from 'react';

const useStyles = makeStyles((_theme) => ({
  rightSideDrawer: {
    width: '523px',
    '& .MuiDrawer-paper': {
      width: '523px',
    },
  },
}));
export default function DetailDrawer({ children, open, position, onClose }) {
  const classes = useStyles();

  return (
    <Drawer anchor={position} open={open} onClose={onClose} className={classes.rightSideDrawer}>
      {children}
    </Drawer>
  );
}

DetailDrawer.propTypes = {
  children: PropTypes.node,
  open: PropTypes.bool,
  position: PropTypes.string,
  onClose: PropTypes.func,
};
