import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  hitsWrapper: {
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    flex: '1 1',
    gap: '16px',
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
  locationButtons: {
    padding: '0px 32px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 0px 24px',
    },
  },
  visitHits: {
    background: theme.palette.surfaceAlertSubtle,
    borderColor: theme.palette.surfaceAlertSubtle,
    color: '#D9534F',
    fontSize: '12px',
    height: '40px',
    padding: '8px 12px',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '0px 32px 0px 32px',
    borderRadius: '8px',
    [theme.breakpoints.down('lg')]: {
      margin: '0px 24px 0px 24px',
    },

    '& .MuiButtonBase-root': {
      background: 'none',
      border: 'none',
      color: theme.palette.textAlert,
      justifyContent: 'flex-start',
      fontSize: '14px',
      height: '40px',
      padding: '0',
      marginLeft: '0px',
      boxShadow: 'none',
      '&:hover , &:focus , &:active': {
        background: 'none',
        border: 'none',
        color: theme.palette.textAlert,
        boxShadow: 'none',
      },
    },
  },
  redButton: {
    '&.MuiButtonBase-root': {
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
  },
  searchSelected: {
    display: 'flex',
    gap: '16px',

    padding: '0px 32px 0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0px 24px 0px 24px',
    },
    '& .MuiFormControl-root.MuiTextField-root': {
      width: '100%',
    },
  },

  selectAll: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      alignItems: 'center',
      minWidth: 'auto',
      maxWidth: '123px',
      width: '100%',
      padding: '0px',
      gap: '6px',
      justifyContent: 'center',
      fontSize: '14px',
      lineHeight: '1',
      color: theme.palette.textPrimary,
    },
    '& span.MuiButtonBase-root.MuiCheckbox-root': {
      padding: '0px',
    },
  },

  sideDrawerHeight: {
    '& .MuiDrawer-paper': {
      '& > .MuiBox-root': {
        height: '100%',
      },
    },
  },
}));
