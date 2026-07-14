import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesSubheader: {
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
    '& > img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
    },
  },

  siteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  address: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  rightContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '32px',
    [theme.breakpoints.down('lg')]: {
      gap: '16px',
    },
  },

  rightDetail: {
    display: 'flex',
    flexDirection: 'column',
  },

  textLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  textDetail: {
    display: 'flex',
    flexDirection: 'row',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  Status: {
    display: 'flex',
    gap: '5px',
    borderRadius: '16px',
    backgroundColor: '#fef3f2',
    color: '#fa4949',
    fontSize: '12px',
    padding: '0px 8px 0px 8px',
    fontWeight: 500,
    lineHeight: '18px',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
