import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  siderBarBox: {
    width: '700px',
    height: '100vh',
    padding: '24px 24px 0px 24px',
  },
  sideHeader: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  boxInner: {
    height: '100%',
  },
}));
