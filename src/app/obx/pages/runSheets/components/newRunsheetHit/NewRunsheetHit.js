import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  '@keyframes colorChange': {
    '0%': {
      backgroundColor: '#F5F5F6',
    },
    '50%': {
      backgroundColor: '#FECDCA',
      color: '#B32318',
    },
    '100%': {
      backgroundColor: '#F5F5F6',
    },
  },
  pulseAnimation: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
      animation: `$colorChange 2s infinite`,
      backgroundColor: '#F5F5F6',
    },
  },

  intabHeading: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
      color: theme.palette.textPrimary,
    },
  },
  textLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  hitSkeleton: {
    marginBottom: '16px',
    '& .MuiSkeleton-root': {
      height: '60px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
    '&:last-child': {
      marginBottom: '0',
    },
  },
  textDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  dipatchRowBox: {
    display: 'flex',
    alignItems: 'center',
  },
  dipatchRowDate: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '4px',
  },
  textLabelChip: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
    },
  },
  space: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    marginBottom: '16px',
  },

  dipatchRowDateFull: {
    marginTop: '16px',
  },

  dispatchSkelton: {
    '& .MuiSkeleton-root': {
      borderRadius: '5px !important',
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
      left: '15px',
      bottom: '0',
      width: '2px',
      height: '100%',
      borderLeft: `2px dotted ${theme.palette.borderSubtle1}`,
    },
    '&:last-child::before': {
      display: 'none',
    },
  },
  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '32px',
      height: '32px',
    },
  },

  eventIcon: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    position: 'relative',
    '& svg g': {
      clipPath: 'none !important',
    },
  },
}));
