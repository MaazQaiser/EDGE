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
  popStyleee: {
    width: '400px',
  },
  marginBottomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '20px',
    },
  },
  countNumber: {
    '&.MuiTypography-root': {
      textAlign: 'right',
      display: 'block',
      marginTop: '4px',
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
  },
  myEditor: {
    border: '1px solid red',
  },
  saleCK: {
    marginTop: '20px',
  },
  createNotesField: {
    '&.MuiFormControl-root': {
      width: '100%',

      '& .MuiInputBase-root': {
        '& textarea': {
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
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'grey',
          },
        },
      },
    },
  },
}));
