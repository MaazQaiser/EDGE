import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  container: {
    borderRadius: theme.shape.borderRadius,
    padding: ' 0 16px 0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  title: {
    spaceer: {
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
      },
    },
  },
  text: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));

// eslint-disable-next-line react/prop-types
const CustomToast = ({ text }) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography variant="info" className={classes.text}>
        {text}
      </Typography>
    </div>
  );
};

export default CustomToast;
