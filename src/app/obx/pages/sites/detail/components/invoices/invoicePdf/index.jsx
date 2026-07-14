import { Box, Button, Typography } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './styles';

const InvoicePdf = ({ setShowDrawer }) => {
  const classes = useStyles();

  const closeDrawer = () => {
    setShowDrawer(false);
  };

  const TopBarNameElement = () => (
    <>
      <Box className={classes.asideHeader}>
        <Box className={classes.headerInner}>
          <Box className={classes.headerLeft}>
            <Box className={classes.userNamme}>
              <Typography variant="h4" className={classes.name}>
                Invoice
              </Typography>
            </Box>
          </Box>
          <Box className={classes.HeaderRight}>
            <Button
              disableRipple
              className={classes.closeBtn}
              onClick={() => {
                closeDrawer();
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );

  TopBarNameElement.propTypes = {
    data: PropTypes.object,
  };

  return (
    <>
      <TopBarNameElement />
    </>
  );
};
InvoicePdf.propTypes = {
  setShowDrawer: PropTypes.func,
};
export default InvoicePdf;
