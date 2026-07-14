import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  richTextEditor: {
    borderRadius: '8px',

    '& .rdw-option-wrapper': {
      width: '24px',
      minWidth: '24px',
      height: '24px',
      borderRadius: '4px',
      padding: '2px',
      border: 0,

      '&:hover': {
        boxShadow: 'none',
      },

      '&:active': {
        boxShadow: 'none',
      },

      '&:focus-visible': {
        outline: 'none',
      },
    },

    '& .rdw-option-active': {
      border: `1px solid ${theme.palette.textBrand}`,
      boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
    },

    '& .rdw-list-wrapper': {
      marginBottom: 0,
    },

    '& .rdw-inline-wrapper': {
      marginBottom: 0,
    },

    '& .public-DraftStyleDefault-block': {
      margin: 0,
    },

    '& .public-DraftStyleDefault-ul': {
      margin: 0,
    },

    '& .public-DraftStyleDefault-ol': {
      margin: 0,
    },

    '& .public-DraftEditorPlaceholder-inner': {
      color: theme.palette.textPlaceholderField,
    },
  },

  removePlaceholder: {
    '& .public-DraftEditorPlaceholder-inner': {
      display: 'none',
    },
  },

  wrapperClass: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },

  editorClass: {
    backgroundColor: theme.palette.surfaceWhite,
    minHeight: '155px',
    maxHeight: '155px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.palette.textPrimary,
  },

  toolbarClass: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px 8px 0 0',
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '10px 8px',
    marginBottom: 0,
  },

  richTextBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  limitText: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    '& .MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '6px',
    },
  },
}));
