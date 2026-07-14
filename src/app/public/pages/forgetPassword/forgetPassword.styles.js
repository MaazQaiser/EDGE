import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },

  mainPasswordSection: {
    borderRadius: '16px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    background: theme.palette.surfaceWhite,
    maxWidth: '410px',
    padding: '50px 25px',
    textAlign: 'center',
    zIndex: '1',
  },

  passwordContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },

  passwordLogoImage: {
    width: '123.429px',
    height: '36px',
    margin: '0 auto',

    '& svg, & img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },

  passwordTextContentTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  passwordTextContentDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '4px',
    },
  },

  passwordTextField: {
    '& .MuiInputBase-root': {
      height: '44px',
    },
  },

  passwordloginButton: {
    '&.MuiButtonBase-root': {
      height: '44px',
    },
  },

  passwordBackBtn: {
    '&.MuiButtonBase-root': {
      height: '44px',
      width: '100%',
      marginTop: '16px',
    },
  },
}));
