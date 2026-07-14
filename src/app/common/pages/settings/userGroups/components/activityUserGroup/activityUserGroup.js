import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  reportsListingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderRadius: '2px',
    // boxShadow: '0px 1px 20px 0px rgba(27, 71, 138, 0.13)',
  },

  drawerHeader: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.surfaceWhite,
  },

  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
}));
