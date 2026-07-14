import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  drawerHeader: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '28px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
  inlineBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
}));
