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
    background: theme.palette.surfaceWhite,
    boxShadow: 24,
    padding: '24px',
    borderRadius: '12px',
  },
  btnBox: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '24px',
    alignItems: 'center',
    gap: '12px',
  },
  headerTitlle: {
    marginBottom: '24px',
  },
  Icon: {
    marginBottom: '18px',
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
      marginBottom: '8px !important',
    },
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));
