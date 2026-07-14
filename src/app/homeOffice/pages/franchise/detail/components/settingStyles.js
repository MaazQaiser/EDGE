import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainSettingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },

  emailSection: {
    borderRadius: '8px',
    background: 'rgba(245, 245, 246, 0.5)',
    maxWidth: '60%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',

    [theme.breakpoints.down('lg')]: {
      maxWidth: '80%',
    },
  },

  mainFlexbox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  customInput: {
    background: '#fff',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: '10px 0px 10px 37px !important',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderRadius: '8px',
      border: '1px solid #aeaeb2',
      '&:invalid': {
        border: '1px solid red',
      },
    },
  },

  emailCustomInput: {
    width: '100%',
    background: theme.palette.surfaceWhite,
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',

    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },

  emailFranchiseBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
      fontSize: '16px',
      lineHeight: '24px',
    },
  },

  inviteLink: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
      fontSize: '16px',
      lineHeight: '24px',
    },
  },

  activeBtn: {
    '&.MuiButtonBase-root': {
      color: '#2E964B',
      padding: 0,
      height: 'auto',
      fontSize: '16px',
      lineHeight: '24px',
      '&:hover': {
        color: '#2E964B',
      },
      '& svg': {
        height: '20px',
        width: '20px',
      },
    },
  },

  deleteBtn: {
    '&.MuiButtonBase-root': {
      color: '#DF372B',
      padding: 0,
      height: 'auto',
      fontSize: '16px',
      lineHeight: '24px',
      '&:hover': {
        color: '#DF372B',
      },
      '& svg': {
        height: '20px',
        width: '20px',
      },
    },
  },

  sweetAlertConfirmButton: {
    padding: '10px 16px',
    borderRadius: '8px !important',
    margin: 0,
    height: '40px',
    border: `1px solid ${theme.palette.borderAlert} !important`,
    backgroundColor: `${theme.palette.surfaceAlertStrong} !important`,
    fontFamily: 'inherit',
    fontSize: '14px !important',
    fontWeight: 500,
    lineHeight: '20px !important',
    color: `${theme.palette.textOnColor} !important`,
    boxShadow: 'none',
    textTransform: 'capitalize',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: `${theme.palette.surfaceAlertHover} !important`,
      border: `1px solid ${theme.palette.borderAlertHover}!important`,
      backgroundImage: 'none !important',
    },

    '&:active': {
      border: `1px solid ${theme.palette.borderAlert} !important`,
      backgroundColor: `${theme.palette.surfaceAlertStrong} !important`,
      boxShadow: ` 0px 0px 0px 4px #FEE4E2, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      backgroundImage: 'none !important',
    },

    '&:focus': {
      boxShadow: `none !important`,
    },

    '&:disabled': {
      color: `${theme.palette.textOnColor} !important`,
      backgroundColor: `${theme.palette.surfaceAlertDisabled} !important`,
      border: `1px solid ${theme.palette.textAlertDisabled} !important`,
    },

    '&:focus-visible': {
      outline: 'none !important',
    },
  },

  sweetAlertConfirmBlueButton: {
    padding: '10px 16px',
    borderRadius: '8px !important',
    margin: 0,
    height: '40px',
    color: `${theme.palette.textOnColor} !important`,
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
    border: `1px solid ${theme.palette.borderBrand} !important`,
    fontFamily: 'inherit',
    fontSize: '14px !important',
    fontWeight: 500,
    lineHeight: '20px !important',
    boxShadow: 'none',
    textTransform: 'capitalize',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: `${theme.palette.surfaceBrandHover} !important`,
      border: `1px solid ${theme.palette.borderBrandHover} !important`,
      backgroundImage: 'none !important',
    },

    '&:active': {
      backgroundColor: `${theme.palette.surfaceBrand} !important`,
      border: `1px solid ${theme.palette.borderBrand} !important`,
      boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      backgroundImage: 'none !important',
    },

    '&:focus': {
      boxShadow: `none !important`,
    },

    '&:disabled': {
      color: `${theme.palette.textOnColor} !important`,
      backgroundColor: `${theme.palette.textBrandDisabled} !important`,
      border: `1px solid ${theme.palette.borderBrandDisabled} !important`,
    },

    '&:focus-visible': {
      outline: 'none !important',
    },
  },
}));
