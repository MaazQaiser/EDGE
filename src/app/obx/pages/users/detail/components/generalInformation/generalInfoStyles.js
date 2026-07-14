import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainBoxSection: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginLeft: '32px',
    marginRight: '32px',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      marginLeft: '24px',
      marginRight: '24px',
    },
  },

  terminateUserSection: {
    display: 'flex',
    padding: '16px 32px',
    justifyContent: 'flex-start',
  },

  internalBoxWrapper: {
    flex: 1,
    '&:not(:last-child)': {
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    },
    [theme.breakpoints.down('lg')]: {
      '&:not(:last-child)': {
        borderRight: 'none',
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      },
    },
  },

  cardContentLeft: {
    '&.MuiPaper-root': {
      padding: '24px 0',
      paddingRight: '32px',
      borderRadius: '8px',
      boxShadow: 'none !important',
      [theme.breakpoints.down('lg')]: {
        paddingRight: 0,
      },
    },
  },

  cardContentRight: {
    '&.MuiPaper-root': {
      padding: '24px 0',
      paddingLeft: '32px',
      borderRadius: '8px',
      boxShadow: 'none !important',
      [theme.breakpoints.down('lg')]: {
        paddingLeft: 0,
      },
    },
  },

  cardFlexContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },

  cardHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  cardActionWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  editIcon: {
    display: 'flex',
  },

  informationCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '50px',
    [theme.breakpoints.down('lg')]: {
      gap: '25px',
    },
  },

  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '50%',
  },

  columnDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  contentDetail: {
    display: 'flex',
    flexDirection: 'column',
  },

  columnHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  mapContent: {
    padding: '20px 32px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  mapSection: {
    padding: '0 32px 24px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 24px',
    },
  },

  chipBar: {
    '&.MuiSkeleton-root': {
      width: '69px',
      height: 12,
    },
  },

  skeletonWrapperCard: {
    width: '50%',
  },

  mapSkeleton: {
    height: '400px',
    '& .MuiSkeleton-root': {
      height: '100%',
      borderRadius: '0 !important',
      transform: 'unset',
      transformOrigin: 'unset',
    },
  },
}));
