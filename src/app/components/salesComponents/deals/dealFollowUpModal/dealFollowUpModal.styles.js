import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  followUpModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    backgroundColor: theme.palette.surfaceWhite,
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    padding: '16px',
  },
  wordLimitText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
    },
  },
  followUpModalHeader: {
    marginBottom: '20px',
  },

  followUpModalHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '6px',
    },
  },

  followUpModalHeaderText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  followUpModalBody: {
    marginBottom: '20px',
  },

  followUpModalDate: {
    marginBottom: '12px',
  },

  followUpModalDateTimers: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },

  followUpModalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },
  textArea: {
    marginBottom: '12px',
  },
  followUpModalTextArea: {
    '&.MuiFormControl-root ': {
      width: '100%',

      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },
}));
