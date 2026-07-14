import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  activityBox: {
    position: 'relative',
    display: 'flex',
    gap: '8px',
    paddingBottom: '20px',

    '&:last-child': {
      paddingBottom: 0,
    },

    '& .MuiTypography-body3': {
      display: 'block',
      color: theme.palette.textPlaceholder,
    },
    '& .MuiTypography-body2': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
    },
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '11px',
      bottom: '0',
      width: '2px',
      height: '100%',
      borderLeft: `2px dotted ${theme.palette.borderSubtle1}`,
    },
    '&:last-child::before': {
      display: 'none',
    },
  },
  intabHeading: {
    '&.MuiTypography-root': {
      marginBottom: '16px',
      color: theme.palette.textPrimary,
    },
  },
  dispatchSkelton: {
    '& .MuiSkeleton-root': {
      borderRadius: '5px !important',
    },
  },
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    '& .MuiTypography-root': {
      margin: 0,
      color: '#000',
      fontWeight: 700,
      fontSize: '22px',
      letterSpacing: 'normal',
      lineHeight: '30px',
    },
  },
}));
