import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  configureContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    margin: '32px auto',
    maxWidth: '75%',
    width: '100%',
    borderRadius: '8px',
    [theme.breakpoints.down(786)]: {
      padding: '16px',
    },
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    [theme.breakpoints.down(786)]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '16px',
    },
  },
  headerDropdowns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerLeftTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  backButton: {
    padding: '8px',
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },
  headerTitle: {
    '&.MuiTypography-root': {
      fontSize: '20px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
    },
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerDropdown: {
    flex: '0 1 auto',
    minWidth: '80px',
    '& > div': {
      width: '100% !important',
      minWidth: '80px !important',
      maxWidth: '100% !important',
    },
  },
  cancelButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: `1px solid ${theme.palette.borderStrong1}`,
    },
  },
  saveButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
    },
  },
  contentSection: {
    borderRadius: '8px',
    padding: '24px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: 'rgba(245, 245, 246, 0.30)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  numericInputsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  numericInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  inputLabel: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '500',
      color: theme.palette.textSecondary3,
    },
  },
  numberInput: {
    '& .MuiOutlinedInput-root': {
      height: '44px',
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  editorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  editorBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  richTextEditor: {
    minHeight: '100px',
    '& .rdw-editor-wrapper': {
      display: 'flex',
      flexDirection: 'column-reverse',
    },
    '& .rdw-editor-toolbar': {
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
      borderBottom: 'none',
      borderRadius: '0 0 8px 8px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '10px 8px',
      marginTop: 0,
      marginBottom: 0,
    },
    '& .rdw-editor-main': {
      minHeight: '100px',
      borderRadius: '8px 8px 0 0',
      borderBottom: 'none',
    },
    '& .rdw-editor-toolbar .rdw-option-wrapper': {
      border: 'none',
    },
  },
}));
