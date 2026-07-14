import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  addBannedVisitorDrawer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },

  addBannedVisitorDrawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
  },

  recaptchaBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      minWidth: 'fit-content',
      padding: 0,

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  addBannedVisitorDrawerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  addBannedVisitorDrawerBody: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    gap: '16px',
    paddingTop: 0,
    padding: '24px 24px',
  },

  addBannedVisitorDrawerFields: {
    // display: 'flex',
    // justifyContent: 'space-between',
    gap: '20px',
  },

  addBannedVisitorDrawerField: {
    width: '100%',

    '& .MuiFormControl-root': {
      width: '100%',
    },
  },

  addBannedVisitorDrawerTextArea: {
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },

  addBannedVisitorDrawerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  addBannedHelperText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reasonCharacterLimit: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
