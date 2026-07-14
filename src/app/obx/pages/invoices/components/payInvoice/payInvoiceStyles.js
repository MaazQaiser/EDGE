import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  payModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  payModalSubtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
    },
  },

  sectionLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
      marginTop: '24px',
      marginBottom: '8px',
    },
  },

  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '12px',
  },

  fieldLabel: {
    '&.MuiTypography-root': {
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
      color: theme.palette.textPrimary,
      flex: '0 0 auto',
    },
  },

  fieldInput: {
    '& .MuiInputBase-root': {
      width: '190px',
    },
    '& .MuiOutlinedInput-root': {
      width: '190px',
    },
  },

  divider: {
    height: '1px',
    backgroundColor: theme.palette.borderSubtle1,
    marginTop: '24px',
  },

  payModalActions: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  radioGroupWrapper: {
    '& .MuiFormControlLabel-label': {
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '20px',
      color: theme.palette.textSecondary3,
    },
  },
}));
