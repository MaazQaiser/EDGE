import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  runsheetWrapper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    gap: '24px',
    padding: '0px 32px 23px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 23px 24px',
    },
  },
  hitsSplitWrapper: {
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
  splitColms: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: '1fr ',
    },
  },
  dayColor: {
    color: theme.palette.textBrand,
  },
  smallText: {
    '&.MuiTypography-root': {
      marginTop: '8px',
    },
  },
  redButton: {
    '&.MuiButtonBase-root': {
      minWidth: '100%',
      background: theme.palette.surfaceAlertSubtle,
      borderColor: theme.palette.surfaceAlertSubtle,
      color: '#D9534F',
      justifyContent: 'flex-start',
      fontSize: '12px',
      height: '40px',
      padding: '8px 12px',
      marginLeft: '0px',
      boxShadow: 'none',
      '&:hover , &:focus , &:active': {
        background: theme.palette.surfaceAlertSubtle,
        borderColor: theme.palette.surfaceAlertSubtle,
        color: '#D9534F',
        boxShadow: 'none',
      },
    },
  },
  editButton: {
    '&.MuiButtonBase-root': {
      minWidth: '100%',
      background: theme.palette.surfaceGreySubtle,
      borderColor: theme.palette.borderSubtle1,
      color: theme.palette.textPrimary,
      justifyContent: 'space-between',
      fontSize: '12px',
      height: '40px',
      padding: '8px 12px',
      boxShadow: 'none',
      '&:hover , &:focus , &:active': {
        background: theme.palette.surfaceGreySubtle,
        borderColor: theme.palette.borderSubtle1,
        color: theme.palette.textPrimary,
        boxShadow: 'none',
      },
    },
  },
  editButtonInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& img': {
      width: '24px',
      height: '24px',
      borderRadius: '60px',
    },
  },
  accordionWrapper: {
    padding: '0px 32px 23px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 23px 24px',
    },
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    minHeight: '200px',
  },

  errorForAllHitsSelection: {
    color: theme.palette.textAlert,
  },
}));
