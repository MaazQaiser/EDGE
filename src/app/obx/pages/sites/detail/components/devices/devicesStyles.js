import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  devicesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingBottom: 0,
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },
  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    columnGap: '12px',
    paddingBottom: '24px',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  tableComponent: {
    position: 'relative',
    '& th:nth-child(2), & td:nth-child(2)': {
      position: 'sticky',
      left: '150px',
      zIndex: 1,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
}));
