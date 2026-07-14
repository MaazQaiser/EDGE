import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  assignWrapper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    gap: '16px',
    padding: '0px 32px 23px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 23px 24px',
    },
  },
  inlineText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& .MuiTypography-root.MuiTypography-captio': {
      color: theme.palette.textSecondary3,
    },
    '& .MuiTypography-root.MuiTypography-h5': {
      color: theme.palette.textPrimary,
    },
  },
}));
