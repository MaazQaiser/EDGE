import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { t } from 'i18next';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((_theme) => ({
  whiteBtnMap: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      zIndex: '10',
      bottom: '70px',
      left: '22px',
      gap: '8px',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
  },

  whiteBtnMapActive: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      zIndex: '10',
      bottom: '70px',
      left: '22px',
      gap: '8px',
      minWidth: 'auto',
      animation: 'glowing 1300ms infinite',

      '&:disabled': {
        animation: 'none',
      },
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
  },
}));
const MapBottomButton = ({ disabled = false, onClick, isSplit = false, label }) => {
  const classes = useStyles();
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      disableRipple
      className={isSplit ? classes.whiteBtnMapActive : classes.whiteBtnMap}
      variant={isSplit ? 'primary' : 'secondaryGrey'}
      sx={{
        '@keyframes glowing': {
          '0%': {
            backgroundColor: '#146DFF',
            boxShadow: '0 0 5px #146DFF',
          },
          '50%': {
            backgroundColor: '#0059FF',
            boxShadow: '0 0 20px #0059FF',
          },
          '100%': {
            backgroundColor: '#146DFF',
            boxShadow: '0 0 5px #146DFF',
          },
        },
      }}
    >
      {label}
    </Button>
  );
};

MapBottomButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  isSplit: PropTypes.bool,
  label: PropTypes.string,
};

export default MapBottomButton;
