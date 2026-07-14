import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: '12px',
      height: '80vh',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
  },
  dialogTitle: {
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    margin: 0,
  },
  closeButton: {
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  formHeader: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '24px',
      marginBottom: '24px',
    },
  },
  dialogContent: {
    padding: '32px',
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  questionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
  questionText: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontFamily: 'Inter',
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '24px',
    },
    flex: 1,
  },
  requiredIcon: {
    width: 16,
    height: 16,
    marginTop: 2,
  },
  radioGroup: {
    marginLeft: 0,
  },
  radioLabel: {
    '&.MuiFormLabel-root': {
      color: '#6A6A70',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      marginBottom: '16px',
    },
  },
  radioOptions: {
    '&.MuiFormGroup-root': {
      display: 'flex',
      flexDirection: 'row',
      gap: theme.spacing(3),
      color: '#262527',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
    },
    '& .MuiButtonBase-root': {
      padding: '0px',
      paddingRight: '4px',
    },
  },
  radioOption: {
    margin: 0,
    '& .MuiFormControlLabel-label': {
      color: '#262527',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
    },
  },
  //   radio: {
  //     color: '#1976D2',
  //     '&.Mui-checked': {
  //       color: '#1976D2',
  //     },
  //     '&:hover': {
  //       backgroundColor: 'rgba(25, 118, 210, 0.04)',
  //     },
  //   },
  submissionInfo: {
    backgroundColor: '#F8F9FA',
    padding: theme.spacing(2),
    borderRadius: '8px',
    marginBottom: theme.spacing(3),
  },
  submissionText: {
    fontSize: '14px',
    marginBottom: theme.spacing(0.5),
    '& strong': {
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },
  modalTable: {
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.divider}`,
    '&:not(:first-child)': {
      borderLeft: `1px solid #E6E6E7`,
    },
  },
  tableRow: {
    '&:nth-of-type(even)': {
      backgroundColor: '#FAFAFA',
    },
    '&:hover': {
      backgroundColor: '#F0F0F0',
    },
  },
  questionCell: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:not(:first-child)': {
      borderLeft: `1px solid #E6E6E7`,
    },
  },
  answerCell: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:not(:first-child)': {
      borderLeft: `1px solid #E6E6E7`,
    },
  },
  answerText: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
  },
  yesText: {
    color: '#2E7D32',
    fontWeight: 600,
  },
  noText: {
    color: '#C62828',
    fontWeight: 600,
  },
  pendingText: {
    color: '#1976D2',
    fontWeight: 600,
  },

  dialogActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    padding: '16px 32px',
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },

  invalidFeedback: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      margin: 0,
      marginTop: '4px',
      color: `${theme.palette.textAlert} !important`,
      textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
}));
