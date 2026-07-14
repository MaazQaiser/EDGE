import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  attendanceWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingTop: '16px',
    paddingBottom: 0,
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
    paddingBottom: '24px',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
      backgroundColor: 'white',
    },
  },
  reportsListingsHeaderRightDate: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },
}));
