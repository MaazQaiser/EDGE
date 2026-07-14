import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    // flex: '1',
    overflow: 'auto',
  },

  drawerHeader: {
    padding: '24px 24px 16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerHeaderTopSkeleton: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'column',
    gap: '8px',
  },
  drawerHeaderTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
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

  titleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '164.5px',
      height: '30px',
      borderRadius: '8px !important',
    },
  },
  titleSkeleton2: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '20px',
      borderRadius: '8px !important',
    },
  },
}));
