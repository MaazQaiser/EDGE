import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    alignSelf: 'stretch',
    borderRadius: '12px',
    background: theme.palette.surfaceGreySubtle,
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  formContentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    alignSelf: 'stretch',
    width: '100%',
  },
}));
