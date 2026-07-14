import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
const RequiredAsterik = () => {
  const useStyles = makeStyles((_theme) => ({
    invalid: {
      color: '#B32318',
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
      marginLeft: '2px',
    },
  }));
  const classes = useStyles();
  return (
    <Box component="span" className={classes.invalid}>
      *
    </Box>
  );
};

export default RequiredAsterik;
