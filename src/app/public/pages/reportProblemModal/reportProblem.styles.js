import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 500px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '32px 40px',
  },

  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  rejectModalContent: {
    marginTop: '20px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      minWidth: 'fit-content',
      padding: 0,
      marginLeft: 'auto',

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  rejectModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  rejectModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  linkReportProblem: {
    '&.MuiLink-root': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
    },
  },
}));
