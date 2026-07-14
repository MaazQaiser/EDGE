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
  invalidFeedback: {
    color: '#b32318',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    textAlign: 'left',
    marginTop: '6px',
    textTransform: 'lowercase',
    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },
  modalContentHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  inlineButtons: {
    display: 'flex',
    gap: '12px',
    paddingTop: '8px',
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
  subText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    '& .label': {
      color: `${theme.palette.textSecondary3}`,
    },
  },
}));
