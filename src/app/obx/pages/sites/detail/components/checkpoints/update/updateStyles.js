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
    width: 600,
    background: 'white',
    boxShadow: 24,
    padding: '24px',
    borderRadius: '12px',
  },
  btnBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitlle: {
    marginBottom: '24px',
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.textSecondary1,
    },
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  Icon: {
    marginBottom: '18px',
  },
  error: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 400,
      margin: 0,
      marginTop: '6px',
    },
  },
}));
