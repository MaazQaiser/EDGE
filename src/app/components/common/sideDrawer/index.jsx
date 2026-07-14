import Drawer from '@mui/material/Drawer';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((_theme) => ({
  sideDrawer: {
    '&.MuiDrawer-root': {
      zIndex: '999',
    },
  },
}));

const SideDrawer = ({ isOpen, closeDrawer = () => {}, children, totalWidth = '900px' }) => {
  const classes = useStyles();

  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          maxWidth: totalWidth,
          width: '100%',
          boxSizing: 'border-box',
        },
      }}
      className={classes.sideDrawer}
      anchor={'right'}
      open={isOpen}
      onClose={closeDrawer}
      variant="temporary"
    >
      {children}
    </Drawer>
  );
};

SideDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeDrawer: PropTypes.func,
  children: PropTypes.node.isRequired,
  totalWidth: PropTypes.string,
};

export default SideDrawer;
