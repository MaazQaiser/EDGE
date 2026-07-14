import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  usersSubHeader: {
    position: 'sticky',
    backgroundColor: theme.palette.surfaceGreySubtle,
    left: 0,
    zIndex: 9,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  headerDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  avatarSection: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },

  avatarImage: {
    width: '48px',
    height: '48px',
    '& >img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
    },
  },

  usersTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },

  usersText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      textTransform: 'capitalize',
    },
  },

  statusTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },

  statusText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      textTransform: 'capitalize',
    },
  },

  rightcontent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  usersTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  lastWorkingDayContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FBEEED',
    padding: '2px 8px',
    borderRadius: '16px',
  },
  lastWorkingDayTitle: {
    '&.MuiTypography-root': {
      color: '#262527 !important',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '18px',
      letterSpacing: '0.4px',
    },
  },
  lastWorkingDayText: {
    '&.MuiTypography-root': {
      color: '#B32318 !important',
      fontWeight: 500,
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.4px',
    },
  },
}));
