import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  headerProfileEdit: {
    padding: '24px 32px 16px',
    margin: '0px',
  },
  innerContent: {
    padding: '0px 24px',
    display: 'flex',
    flex: '1 1',
    flexDirection: 'column',
    overflow: 'auto',
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '24px',
  },
  fieldWrapper: {
    width: '100%',
  },
  sideBySideColEmail: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: '20px',
    gap: '24px',
  },
  sidetitle: {
    color: '#000',
    fontSize: '16px ',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },
  marginTopBottom: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
      marginTop: '24px',
    },
  },
  locationsDivider: {
    '&.MuiDivider-root': {
      paddingTop: '4px',
    },
  },

  followUpModalTextArea: {
    '&.MuiFormControl-root ': {
      width: '100%',

      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  wordLimitText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '12px',
    },
  },
  fileUploader: {
    marginBottom: '20px',
  },
  bannedFooter: {
    '& button.MuiButtonBase-root.MuiButton-root.MuiButton-primary': {
      background: theme.palette.surfaceAlertStrong,
      borderColor: theme.palette.surfaceAlertStrong,
    },
  },
  addBannedVisitorDrawerTextArea: {
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
}));
