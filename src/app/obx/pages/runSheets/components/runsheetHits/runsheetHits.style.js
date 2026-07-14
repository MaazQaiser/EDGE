import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  HitStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3 , 1fr)',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  hitItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },
  hitItemSubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      marginBottom: '8px',
    },
  },
  hitCardWrapper: {
    padding: '20px 24px',
  },
  checkPointsWrapper: {
    padding: '16px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  ListItem: {
    '&.MuiListItem-root': {
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '0px',
      paddingRight: '0px',
      '&:last-child': {
        paddingBottom: '0px',
      },
      '&:first-child': {
        paddingTop: '0px',
      },
    },
  },
  LeftListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  BlueNumerICon: {
    '&.MuiTypography-root ': {
      padding: '8px',
      backgroundColor: theme.palette.surfaceBrand,
      display: 'flex',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'var(--8, 8px)',
      color: theme.palette.textOnColor,
      fontSize: '12px',
    },
  },

  instructionWrapper: {
    padding: '16px 0',
    '&:last-child': {
      paddingBottom: '0px',
    },
  },

  instructionTextStyle: {
    padding: '0px 24px',
  },
  accessText: {
    '&.MuiTypography-root ': {
      color: theme.palette.textAlert,
      textTransform: 'capitalize',
    },
  },
  patrolSetupText: {
    color: ' #5B5B5F',
    textTransform: 'capitalize',
    maxWidth: '390px',
    textAlign: 'center',
  },
  patrolSetupWrapper: {
    padding: '16px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '16px',
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
}));
