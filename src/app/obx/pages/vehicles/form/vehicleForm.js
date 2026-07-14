import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mainBoxForm: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: '1',
    overflow: 'auto',
    padding: '24px 32px',
    width: '860px',
    margin: '0 auto',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  btnBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  buttonGroupLast: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  vehicleInfoWrapper: {
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '20px',
  },

  vehicleInfoTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  formBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '32px',
  },

  flexControl: {
    width: '50%',
  },

  flexControlOnly: {
    width: 'calc(50% - 16px)',
  },

  vehicleImageUpload: {
    gap: '32px',
    marginBottom: 0,
  },
}));
