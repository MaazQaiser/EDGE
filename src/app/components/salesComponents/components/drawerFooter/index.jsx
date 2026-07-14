import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';

const useStyles = makeStyles((theme) => ({
  sideFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 0px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'flex-end',
  },
}));

const DrawerFooter = ({
  bulkCancel,
  bulkApply,
  handleCloseDrawer,
  anchor,
  onSubmit,
  onSubmit2,
  type,
  setFormData,
  applyFilters,
  drawerQuery,
  disabled = false,
  disabled2 = false,
  isDoubleActionButton = false,
  classNameFooter,
}) => {
  const classes = useStyles();

  const handleOnClick = (e) => {
    if (applyFilters) {
      handleCloseDrawer(anchor);
      applyFilters(drawerQuery);
      setFormData(drawerQuery);
    }
    if (onSubmit) onSubmit(e);
  };
  return (
    <Box className={classNames(classes.sideFooter, classNameFooter)}>
      <Box className={classes.footer}>
        <Button
          onClick={(e) => (isDoubleActionButton ? onSubmit2(e) : handleCloseDrawer(anchor))}
          variant="secondaryGrey"
          disabled={isDoubleActionButton && disabled2}
        >
          {bulkCancel}
        </Button>
        <Button variant="primary" onClick={handleOnClick} type={type} disabled={disabled}>
          {bulkApply}
        </Button>
      </Box>
    </Box>
  );
};

DrawerFooter.propTypes = {
  bulkCancel: PropTypes.string,
  bulkApply: PropTypes.string,
  handleCloseDrawer: PropTypes.func,
  anchor: PropTypes.string,
  onSubmit: PropTypes.func,
  onSubmit2: PropTypes.func,
  type: PropTypes.string,
  setFormData: PropTypes.func,
  applyFilters: PropTypes.func,
  drawerQuery: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  disabled: PropTypes.bool,
  disabled2: PropTypes.bool,
  isDoubleActionButton: PropTypes.bool,
  classNameFooter: PropTypes.string,
};

export default DrawerFooter;
