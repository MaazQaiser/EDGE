import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  drawerContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '24px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  drawerTitle: {
    '&.MuiTypography-root': {
      fontWeight: 600,
      color: theme.palette.textPrimary,
    },
  },
  drawerSubtitleMaxLength: {
    '&.MuiTypography-root': {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  },
  drawerSubtitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },
  drawerBody: {
    flex: 1,
    padding: '16px 0 0 0 ',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflow: 'auto',
  },
  drawerField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  drawerLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  required: {
    color: '#DF372B',
    marginLeft: '2px',
  },
  drawerToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
  },
  scheduleSwitch: {
    '&.MuiSwitch-root': {
      width: 44,
      height: 24,
      padding: 0,
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,

      '&.Mui-checked': {
        transform: 'translateX(20px)',
        color: theme.palette.common.white,
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
          border: 'none',
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: 20,
      height: 20,
      boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.25)',
      backgroundColor: theme.palette.common.white,
    },
    '& .MuiSwitch-track': {
      borderRadius: 999,
      backgroundColor: theme.palette.background.neutral || theme.palette.action.hover,
      opacity: 1,
    },
  },
  drawerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
}));
