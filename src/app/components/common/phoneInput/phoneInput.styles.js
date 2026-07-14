import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  phoneInput: {
    '& .MuiInputBase-root': {
      '&.Mui-disabled': {
        '& .MuiInputAdornment-root': {
          '& .MuiTypography-root': {
            color: theme.palette.textDisabled,
          },
        },
      },

      '& .MuiInputAdornment-root': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginRight: '4px',
        position: 'relative',
        zIndex: 1,

        '& span': {
          display: 'none',
        },
        '& .MuiTypography-root': {
          color: theme.palette.textPrimary,
        },
      },
    },
  },
}));
