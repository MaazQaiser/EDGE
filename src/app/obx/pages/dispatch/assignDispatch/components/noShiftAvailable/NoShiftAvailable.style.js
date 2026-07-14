import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  maxWidth: {
    maxWidth: '321px',
    margin: '0 auto',
    width: '100%',
  },
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      height: 'calc(100vh - 216px)',
      justifyContent: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '16px 0px 0px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
      marginBottom: '16px',
      marginTop: '16px',
    },
  },
}));
