import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  borderSignature: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '16px',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  errorBorderSignature: {
    border: `1px solid ${theme.palette.textAlert}`,
    marginTop: '16px',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  sigCanvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  btn: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '16px',
  },
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '4px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));
