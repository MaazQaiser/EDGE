import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  addReleaseContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    width: '100%',
    maxWidth: '75%',
    margin: '32px auto',
    borderRadius: '8px',
    [theme.breakpoints.down(786)]: {
      padding: '16px',
    },
  },
  headerDropdowns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerDropdown: {
    width: '100%',
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
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  cancelButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: `1px solid ${theme.palette.borderStrong1}`,
    },
  },
  saveDraftButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
    },
  },
  savePublishButton: {
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
    [theme.breakpoints.down(786)]: {
      padding: '16px',
      gap: '16px',
    },
  },
  formSection: {
    display: 'flex',
    gap: '16px',
    [theme.breakpoints.down(786)]: {
      flexDirection: 'column',
      gap: '16px',
    },
  },
  formField: {
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
  textInput: {
    '& .MuiOutlinedInput-root': {
      height: '44px',
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  datePicker: {
    '& .MuiOutlinedInput-root': {
      height: '44px',
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
  richTextEditor: {
    minHeight: '300px',
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
      minHeight: '300px',
      borderRadius: '8px 8px 0 0',
      borderBottom: 'none',
    },
    '& .rdw-editor-toolbar .rdw-option-wrapper': {
      border: 'none',
    },
  },
}));
