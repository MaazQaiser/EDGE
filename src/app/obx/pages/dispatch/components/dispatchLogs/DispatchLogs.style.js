import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    position: 'relative',
  },

  drawerInner: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    marginBottom: '20px',
  },
  imgBox: {
    '&.MuiTypography-root': {
      textDecoration: 'none',
      cursor: 'pointer',
    },

    '& img': {
      width: '100%',
      display: 'block',
    },
  },
  linkBox: {
    background: theme.palette.surfaceGreySubtle,
    padding: '8px 12px',
    borderRadius: '0px 0px 8px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },
  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '32px',
      height: '32px',
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
      textTransform: 'capitalize',
    },
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '14px',
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
      // marginTop: '16px',
      color: theme.palette.textPrimary,
    },
  },
  tabsSkelton: {
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
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));
