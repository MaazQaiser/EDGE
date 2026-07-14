import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  assignDispatchHeading: {
    background: theme.palette.primary,
  },
  blueBox: {
    background: theme.palette.surfaceBrandSubtle,
    padding: '12px',
    borderRadius: '8px',
    display: 'flex',
    gap: '8px',
  },
  assignOfficerHeader: {
    gap: '16px',
    display: 'flex',

    flexDirection: 'column',
    padding: '24px 20px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '16px 20px 0px 20px',
    },
  },
  fullWidth: {
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  officerListing: {
    marginTop: '12px',
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    flexDirection: 'column',
    padding: '0px 20px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 20px 0px 20px',
    },
  },
  skeletonContainer: {
    flex: '1 1',
  },
  skeletonWrapper: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    padding: '12px 32px',
    flexDirection: 'column',
    '& .MuiSkeleton-root ': {
      borderRadius: '4px !important',
    },
  },
}));
