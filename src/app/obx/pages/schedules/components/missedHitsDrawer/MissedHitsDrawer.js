import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  drawerHeader: {
    padding: '24px 24px 16px 24px',
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

  datePicker: {
    padding: '0px 24px 0 24px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },

  drawerInner: {
    padding: '0px 24px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    gap: '8px',
  },

  labelClass: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  missedBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '4px',
    width: 'calc(100% - 20px)',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    '& .MuiTypography-root.MuiTypography-h5': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
    '& .MuiTypography-root.MuiTypography-subtitle3': {
      color: theme.palette.textPrimary,
    },
    '& .MuiTypography-root.MuiTypography-body3': {
      display: 'block',
      color: theme.palette.textSecondary2,
    },
  },

  missedButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',

    '& .MuiButtonBase-root': {
      padding: '0px',
      height: '32px',
      minWidth: '32px',
    },
  },

  drawerHeaderNew: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 24px 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  drawerHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'space-between',
    width: '100%',
  },

  drawerInnerMissed: {
    margin: '0 24px',
  },

  drawerHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  drawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerHeaderBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  dot: {
    width: '3px',
    height: '3px',
  },

  drawerHeaderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  drawerDateRange: {
    '& .MuiFormControl-root': {
      minWidth: '100%',
      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  drawerFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  reassignHit: {
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    width: 'calc(100% - 20px)',
  },

  drawerBodyInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    gap: '8px',
  },

  reassignHitTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  searchComponent: {
    flex: 0,
    width: 'auto',
  },

  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    margin: '24px',
    marginRight: 0,
    gap: '8px',
  },

  reassignHitBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  reassignHitText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  reassignHitUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },

    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  drawerBodyTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 24px',
  },

  drawerInnerNew: {
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  loaderBox: {
    width: 'calc(100% - 20px)',
    padding: '20px 0px',
    '& .MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
      marginBottom: '12px',
    },
  },
}));
