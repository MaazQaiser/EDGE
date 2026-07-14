import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  notesModalContainer: {
    display: 'block',
  },
  popStyle: {
    borderRadius: '12px',
    position: 'absolute;',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '768px',
    padding: '24px 32px',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04),0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
  },
  marginBottomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '20px',
    },
  },
  marginBottom: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginBottom: '6px',
    },
  },
  sideFooter: {
    display: 'block',
  },
  dividerGap: {
    '&.MuiDivider-root ': {
      marginTop: '24px',
      marginBottom: '24px',
    },
  },
  fieldHead: {
    marginBottom: '10px',
  },
  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      boxShadow: 'none',
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: '400',
      margin: '0',
      marginTop: '6px',
      textShadow: '0px 0px 0px #f4ebff, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
  richTextEditor: {
    marginTop: '22px',

    '& .ck.ck-content.ck-editor__editable.ck-rounded-corners.ck-editor__editable_inline.ck-blurred':
      {
        height: '142px',
        color: theme.palette.textSecondary2,
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '20px',
        padding: '12px 16px',
        borderRadius: '0px 0px 8px 8px',
        marginBottom: '24px',
      },
    '& .ck.ck-editor__editable_inline > :last-child': {
      margin: '0',
    },
    '& .ck.ck-toolbar.ck-toolbar_grouping': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  myEditor: {
    border: '1px solid red',
  },
  saleCK: {
    marginTop: '20px',

    '& ul': {
      textAlign: 'left',
      paddingLeft: '20px',
    },
    '& ol': {
      textAlign: 'left',
      paddingLeft: '20px',
    },
    '& .ck.ck-content.ck-editor__editable.ck-rounded-corners.ck-editor__editable_inline': {
      maxHeight: '150px',
      height: '150px',
      color: theme.palette.textSecondary2,
      fontFamily: '$font-inter-base',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
      padding: '12px 16px',
      borderRadius: '0px 0px 8px 8px',
      '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },

      '&::-webkit-scrollbar-track': {
        boxShadow: 'none',
      },

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(128, 128, 128, 0.4)',
        borderRadius: '10px',
      },

      '&:hover': {
        '&::-webkit-scrollbar-track': {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
        },

        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey',
        },
      },
    },
    '& .ck.ck-toolbar.ck-toolbar_grouping': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      borderRadius: '8px 8px 0px 0px !important',
    },
  },
}));
