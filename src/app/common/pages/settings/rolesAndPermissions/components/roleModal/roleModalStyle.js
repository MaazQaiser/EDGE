import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormControl-root': {
      margin: '0px',
    },
  },

  inlineButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary3}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },
  resetModalTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dropdownWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  dropdownLabel: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary3}`,
    },
  },
  alert: {
    '&.MuiAlert-root': {
      alignItems: 'center',
      gap: '4px',
      borderRadius: '8px',
    },
    '& .MuiAlert-icon': {
      marginRight: '0px',
      padding: '0px',
    },
  },
}));
