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
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
  },
  modalWrapperIn: {
    marginBottom: '32px',
    marginTop: '20px',
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      marginTop: '4px',
      color: `${theme.palette.textSecondary3}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
      marginBottom: '8px',
    },
  },
}));
