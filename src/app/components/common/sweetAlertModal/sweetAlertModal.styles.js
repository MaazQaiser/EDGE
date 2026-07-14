import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sweetAlertIcon: {
    border: 0,
    display: 'block !important',
    width: '100%',
    margin: 0,
    height: 'auto',

    '& svg': {
      width: '48px',
      height: '48px',
    },
  },
  sweetAlertContainer: {
    zIndex: '11000 !important',
  },

  sweetAlertPopup: {
    width: '500px',
    padding: '24px',
    borderRadius: '12px',
    background: theme.palette.surfaceWhite,
    boxShadow: `
      0px 8px 8px -4px rgba(16, 24, 40, 0.04),
      0px 20px 24px -4px rgba(16, 24, 40, 0.1)`,
  },

  sweetAlertTitle: {
    color: `${theme.palette.textPrimary} !important`,
    fontFamily: 'inherit',
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: '24px',
    textAlign: 'left',
    marginTop: '16px',
    padding: 0,
  },

  sweetAlertHtmlContainer: {
    padding: '0 !important',
    margin: '0 !important',
    marginTop: '4px !important',
    fontFamily: 'inherit',
    fontSize: '14px !important ',
    fontWeight: 400,
    lineHeight: '20px !important',
    color: `${theme.palette.textSecondary3} !important`,
    textAlign: 'left !important',
  },

  sweetAlertDescription: {
    fontFamily: 'inherit',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    color: `${theme.palette.textSecondary3} !important`,
    textAlign: 'left',

    '&:last-child': {
      marginTop: '16px',
    },
  },

  sweetAlertActions: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    marginTop: '24px',
  },

  sweetAlertCancelButton: {
    padding: '10px 16px',
    borderRadius: '8px !important',
    margin: 0,
    height: '40px',
    border: `1px solid ${theme.palette.borderStrong1} !important`,
    backgroundColor: `${theme.palette.surfaceWhite} !important`,
    fontFamily: 'inherit',
    fontSize: '14px !important',
    fontWeight: 500,
    lineHeight: '20px !important',
    color: `${theme.palette.textSecondary1} !important`,
    boxShadow: 'none',
    textTransform: 'capitalize',
    cursor: 'pointer',

    '&:hover': {
      color: `${theme.palette.textPrimary} !important`,
      border: `1px solid ${theme.palette.borderStrong1} !important`,
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      backgroundImage: 'none !important',
    },

    '&:active': {
      color: `${theme.palette.textSecondary1} !important`,
      backgroundColor: `${theme.palette.surfaceWhite} !important`,
      border: `1px solid ${theme.palette.borderStrong1} !important`,
      boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      backgroundImage: 'none !important',
    },

    '&:focus': {
      boxShadow: `none !important`,
    },

    '&:disabled': {
      color: `${theme.palette.textDisabled} !important`,
      backgroundColor: `${theme.palette.surfaceWhite} !important`,
      border: `1px solid ${theme.palette.borderSubtle2} !important`,
    },

    '&:focus-visible': {
      outline: 'none !important',
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
      border: `1px solid ${theme.palette.borderAlertDisabled} !important`,
      boxShadow: 'none !important',
      opacity: '1 !important',
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
