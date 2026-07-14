import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  dispatchDetails: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
  },
  detailsLeftSide: {
    display: 'flex',
    [theme.breakpoints.down(786)]: {
      display: 'none',
    },

    maxWidth: '247px',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
  },
  detailsRightSide: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    flexDirection: 'column',
  },
  bottomAreaSplit: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    width: '100%',
  },
  bottomAreaLeft: {
    flex: '1 1 70%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    width: '100%',
  },
  bottomAreaRight: {
    flex: '1 1 30%',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      padding: '12px',
    },
    [theme.breakpoints.down(786)]: {
      display: 'none',
    },
    overflow: 'auto',
    flexDirection: 'column',
  },
}));
