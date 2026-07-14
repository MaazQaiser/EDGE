import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
  },

  deleteZoneBtnWrapper: {
    padding: '24px 32px',
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  mainBoxSection: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
    },
  },

  internalBoxWrapper: {
    flex: 1,
    height: '270px',
    overflow: 'auto',
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

  cardContent: {
    '&.MuiPaper-root': {
      padding: '24px 32px',
      borderRadius: '8px',
      boxShadow: 'none !important',
      [theme.breakpoints.down('lg')]: {
        padding: '24px',
      },
    },
  },

  cardFlexContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flex: '1',
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
    width: '100%',
  },

  informationEmergencyCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '80px',
  },

  columnDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
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

  franchiseSubHeader: {
    position: 'sticky',
    backgroundColor: '#f5f5f6',
    left: '0',
    zIndex: '20',
    borderBottom: '1px solid #e6e6e7',
  },

  headerDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  upperText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  skeletonWrapperCard: {
    width: '50%',
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
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px',
    },
  },

  mapSkeleton: {
    height: '400px',
    marginTop: '20px',
    '& .MuiSkeleton-root': {
      height: '100%',
      borderRadius: '0 !important',
      transform: 'unset',
      transformOrigin: 'unset',
    },
  },
}));
