import Drawer from '@mui/material/Drawer';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import * as React from 'react';

/** The system drawer width. Everything that does not ask for something else. */
const DEFAULT_WIDTH = 523;

const useStyles = makeStyles((theme) => ({
  rightSideDrawer: {
    width: ({ width }) => width,
    '& .MuiDrawer-paper': {
      width: ({ width }) => width,
      /* Below the drawer's own width there is no room to be precious about it —
         it takes the viewport rather than pushing content off the side. */
      maxWidth: '100vw',
      [theme.breakpoints.down('sm')]: {
        width: '100vw',
      },
    },
  },
}));

export default function DetailDrawer({ children, open, position, onClose, width = DEFAULT_WIDTH }) {
  const classes = useStyles({ width: typeof width === 'number' ? `${width}px` : width });

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
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
