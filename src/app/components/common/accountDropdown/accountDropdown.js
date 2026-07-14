import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mainBoxWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
    '& .MuiAvatar-circular ': {
      height: '32px',
      width: '32px',
      marginRight: '8px',
      [theme.breakpoints.down(786)]: {
        height: '24px',
        width: '24px',
      },
    },
  },

  userName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },

  reportProblemLink: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  logoutText: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      textTransform: 'capitalize',
    },
  },

  employeeName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
      [theme.breakpoints.down(786)]: {
        display: 'none',
      },
    },
  },
  userDesignationOuter: {
    '&.MuiTypography-root ': {
      color: theme.palette.textSecondary3,
      textTransform: 'capitalize',
      [theme.breakpoints.down(786)]: {
        display: 'none',
      },
    },
  },
  userDesignation: {
    '&.MuiTypography-root ': {
      color: theme.palette.textSecondary3,
      textTransform: 'capitalize',
    },
  },

  menuMainWrapper: {
    '&.MuiPaper-root': {
      width: '309px',
      padding: '0',
      borderRadius: '8px',
      background: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
    },

    '&.MuiMenu-list': {
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
    },

    '& .MuiMenuItem-root': {
      padding: '0',
    },
  },

  logoutBtn: {
    width: '100%',
    '&.MuiButtonBase-root': {
      '&.MuiButtonBase-root': {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        padding: '16px',
        height: 'unset',
        borderRadius: 0,
      },
      '&:hover': {
        backgroundColor: theme.palette.surfaceAlertSubtle,
        color: '#D9534F ',
        border: 'none',
      },
      '&:active': {
        backgroundColor: theme.palette.surfaceAlertSubtle,
        color: '#D9534F ',
        border: 'none',
      },
      '& .MuiButton-startIcon': {
        marginLeft: '0',
      },
    },
  },

  dividerGap: {
    '&.MuiDivider-root ': {
      margin: '0px',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  dropFooter: {
    // padding: '0px 20px 0 20px',
  },

  svgWrapper: {
    alignSelf: 'start',
    marginTop: '4px',
    marginLeft: '4px',
  },

  logoutItem: {
    display: 'flex',
    gap: '8px',
    padding: '0 !important',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },

  mainAvatarItem: {
    width: '100%',
    display: 'flex',
    padding: '8px 16px',
    alignItems: 'center',
    backgroundColor: theme.palette.surfaceBrandSubtle,

    '& .MuiAvatar-root': {
      width: '48px',
      height: '48px',
    },
  },

  dropRight: {
    marginLeft: ' 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    textDecoration: 'none',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    minWidth: '170px',
  },

  profileBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '16px',
      height: 'unset',
      borderRadius: '0',
      '&:hover': {
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },

  linkBtn: {
    '&.MuiLink-root': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '16px',
      '&:hover': {
        background: theme.palette.surfaceGreySubtle,
      },
    },
  },

  addLanguage: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  IconClass: {
    display: 'flex',
    alignItems: 'center',

    height: '12px',
    width: '22px',
  },

  flagImages: {
    height: '100%',
    width: '100%',
  },
}));
