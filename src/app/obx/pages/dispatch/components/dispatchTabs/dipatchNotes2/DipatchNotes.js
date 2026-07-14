import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: '0',
      width: '75%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
}));
