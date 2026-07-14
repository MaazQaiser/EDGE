import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '1140px',
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
    maxHeight: '80vh',
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
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'auto',
  },
  modalContentHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formGroupCheckbox: {
    '&.MuiFormGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      gap: '68px',
      alignItems: 'center',
      justifyContent: 'flex-start',
      '& .MuiFormControlLabel-root': {
        margin: '0px',
        '& .MuiCheckbox-root': {
          padding: '0px',
          marginRight: '8px',
        },
        '& .MuiFormControlLabel-label': {
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
          color: `${theme.palette.textPrimary}`,
        },
      },
    },
  },
}));
