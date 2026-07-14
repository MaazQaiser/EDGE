import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  cloneModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },

  cloneModalContent: {
    marginTop: '20px',
  },

  cloneModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  cloneModalText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  cloneModalField: {
    marginTop: '14px',
  },

  cloneModalFieldLabel: {
    '&.MuiInputLabel-root': {
      marginTop: '6px',
    },
  },

  cloneModalFieldInput: {
    width: '100%',
  },

  cloneModalActions: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },
}));
