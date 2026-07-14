import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  followUp: {
    padding: '12px',
    background: theme.palette.surfaceBrandSubtle,
    borderRadius: '8px',
    marginBottom: '20px',
  },

  followUpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },

  followUpEdit: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },

  followUpRepeatIcon: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    background: theme.palette.surfaceBrand,
  },

  followUpLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  followUpTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  followUpBody: {
    marginTop: '8px',
  },

  followUpBodyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  followUpMoreLessBtn: {
    '&.MuiButtonBase-root': {
      display: 'inline-block',
      padding: 0,
      fontSize: '12px',
      fontWeight: 400,
      minWidth: 'auto',
      height: 'auto',
    },
  },

  followUpDoneBtn: {
    '&.MuiButtonBase-root': {
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: 500,
      height: '30px',
      marginTop: '8px',
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
    // textTransform: 'capitalize',
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
