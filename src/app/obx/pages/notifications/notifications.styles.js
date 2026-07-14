import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  notifications: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  notificationsContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  notificationsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  notificationsContainer: {
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  customScroll: {
    height: 'calc(100vh - 100px)',
    overflowY: 'auto',
    '&:hover': {
      // overflowY: 'auto',
    },
  },

  notificationBox: {
    maxWidth: '860px',
    width: '100%',
    margin: '0 auto',
  },

  notificationsMenuTitle: {
    maxWidth: '860px',
    width: '100%',

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      padding: '24px 0',
      margin: '0 auto',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  notificationsMenuItemWrapper: {
    padding: '20px 10px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '4px',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  notificationItemNoRedirect: {
    cursor: 'default',
  },
  notificationsMenuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  dateWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  notificationsMenuItemIcon: {
    width: '40px',
    height: '40px',
  },
  notificationsMenuItemDetail: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  notificationsMenuItemAction: {
    width: '50px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '8px',

    '& svg': {
      width: '16px',
      height: '16px',
      alignSelf: 'flex-end',

      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  notificationsMenuItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  notificationsMenuItemText: {
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    '& strong': {
      fontWeight: '600',
    },
  },

  notificationsMenuItemDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  notificationsPlaceholder: {
    paddingTop: '20px',
    paddingBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  notificationsPlaceholderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
    },
  },

  notificationsPlaceholderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },
}));
