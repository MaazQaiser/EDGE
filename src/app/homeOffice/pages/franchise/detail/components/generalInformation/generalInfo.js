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

  columnDataFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  companyCodeTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  companyCodeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
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
      paddingRight: '24px',
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
      paddingLeft: '24px',
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
    width: '50%',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  columnDetailEmail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
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
  inlineFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignContent: 'center',
    gap: '50px',
    [theme.breakpoints.down('lg')]: {
      gap: '25px',
    },
  },
  mainContentContact: {
    display: 'flex',
    flexDirection: 'column',
    '&:not(:last-child)': {
      marginBottom: '16px',
    },
  },
  nameDetail: {
    gap: '6px',
    display: 'flex',
    alignItems: 'center',
  },

  legalInformationSection: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginLeft: '32px',
    marginRight: '32px',
    paddingTop: '20px',
    paddingBottom: '20px',
    [theme.breakpoints.down('lg')]: {
      marginLeft: '20px',
      marginRight: '20px',
    },
  },

  legalInformationTitle: {
    marginBottom: '16px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  legalInformationRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: '5px',
    gap: '40px',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      gap: '16px',
    },
  },

  legalInformationColumn: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 1 auto',
    minWidth: 0,
    gap: '4px',
  },

  legalInformationValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
}));
