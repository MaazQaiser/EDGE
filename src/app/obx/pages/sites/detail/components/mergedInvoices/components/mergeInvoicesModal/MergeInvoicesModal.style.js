import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mergeModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 550px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flex: '1 1',
    flexDirection: 'column',
    overflow: 'auto',
    maxHeight: '587px',
  },
  modalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  modalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginBottom: '14px',
      paddingBottom: '14px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  mergeModalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  mergeSetWrapper: {
    '&:not(:last-child)': {
      marginBottom: '12px',
    },
  },
  mergeInvoiceDetails: {
    padding: '16px',
    borderRadius: '12px',
    background: '#FAFAFA',
    display: 'flex',
    flex: '1 1',
    flexDirection: 'column',
    overflow: 'auto',
  },
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '16px',
      width: '16px',
      '& path': {
        fill: theme.palette.textPlaceholder,
      },
    },
  },
  buttonWrraper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
  },
  mergeSetOptionsWrapper: {
    background: theme.palette.surfaceWhite,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '8px',
    gap: '4px',
    '& span.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  questionOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',

    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  setDates: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    marginTop: '6px',
  },
  questionRight: {
    flex: '0 0 50px',
    textAlign: 'right',
  },
  languageModalSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  languageModalSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
  createInstructionWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '24px',
    height: 'calc(100vh - 274px)',
    maxWidth: '380px',
    margin: ' 0 auto',
    textAlign: 'center',
  },
  siteWrapperText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  greytextColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));
