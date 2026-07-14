import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainBoxForm: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '0 auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    background: theme.palette.surfaceWhite,
    boxShadow: `0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)`,
    borderRadius: '12px',
    maxHeight: '80vh',
  },

  invalidFeedback: {
    '&.MuiTypography-root': {
      marginTop: '6px',
      color: theme.palette.textAlert,
    },
  },

  specifyDate: {
    '&.MuiTypography-root': {
      marginBottom: '10px',
      color: theme.palette.textSecondary1,
    },
  },

  btnBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.borderSubtle1} `,
    padding: '24px',
    alignItems: 'center',
  },

  headerTitle: {
    padding: '24px 24px 0 24px',
    marginBottom: '20px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  formBoxGrid: {
    marginBottom: '24px',
  },

  editorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
  },

  editor: {
    width: '100%',
    '& .ck-editor': {
      '& .ck-editor__top': {
        '& .ck-toolbar ': {
          background: theme.palette.surfaceWhite,
        },
      },
    },
  },
  modalBody: {
    maxHeight: 'calc(80vh - 169px)',
    overflow: 'auto',
    height: '100%',
    padding: '0 24px 20px 24px',
  },
  daysOuterDiv: {
    '&.MuiFormControl-root ': {
      display: 'flex',
      flexDirection: 'row',
      gap: '16px',
    },
  },

  dayOuterLayer: {
    border: `1px solid ${theme.palette.borderSubtle2} `,
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: theme.palette.textSecondary1,
    borderRadius: '50%',
    height: '44px',
    width: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },

  daySelected: {
    border: `1px black ${theme.palette.borderBrand}`,
    color: theme.palette.textOnColor,
    backgroundColor: theme.palette.surfaceBrand,
  },

  zoneCustomText: {
    '&.MuiTypography-root': {
      marginTop: '12px',
      color: theme.palette.textSecondary1,
    },
  },

  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
