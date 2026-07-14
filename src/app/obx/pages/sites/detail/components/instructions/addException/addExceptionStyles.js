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
    padding: '24px',
    borderRadius: '12px',
  },
  modalBody: {
    maxHeight: 'calc(80vh - 169px)',
    overflow: 'auto',
    height: '100%',
    padding: '0 20px 20px 4px',
  },

  modalField: {
    marginBottom: '16px',
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
    paddingTop: '24px',
    alignItems: 'center',
  },

  headerTitle: {
    marginBottom: '20px',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  formBoxGrid: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    gap: '20px',
    marginBottom: '16px',
  },

  editorWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
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
    textTransform: 'uppercase',
  },

  daySelected: {
    border: `1px black ${theme.palette.borderBrand}`,
    color: theme.palette.textOnColor,
    backgroundColor: theme.palette.surfaceBrand,
  },

  inputWrapper: {
    width: '100%',
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
