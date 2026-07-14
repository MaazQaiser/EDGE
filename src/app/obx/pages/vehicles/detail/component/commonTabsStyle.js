import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  franchiseSubHeader: {
    position: 'sticky',
    backgroundColor: theme.palette.surfaceGreySubtle,
    left: '0',
    zIndex: '9',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  headerDetail: {
    padding: '16px 32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  lowerText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  noImagePlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
    gap: '12px',
  },

  internalBox: {
    width: '90%',
    margin: '0 auto',
    height: '100%',
    position: 'relative',
    padding: '24px 0',
    paddingLeft: '24px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '0',
    },

    '& .slick-slide': {
      borderRadius: '8px',
    },

    '& .slick-list': {
      borderRadius: '8px',
    },
  },

  cardImgWrapper: {
    height: '274px',
    borderRadius: '8px',
  },

  vehicleImage: {
    width: '100%',
    height: '274px',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: '8px',
  },

  noImageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
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
    width: '50%',
    '&:not(:last-child)': {
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    },
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      '&:not(:last-child)': {
        borderRight: 'none',
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      },
    },
  },

  cardContent: {
    '&.MuiPaper-root': {
      padding: '24px 32px 24px 0',
      borderRadius: '8px',
      boxShadow: 'none !important',
      [theme.breakpoints.down('lg')]: {
        paddingRight: 0,
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
    width: '100%',
  },

  informationEmergencyCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
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

  mainContentContact: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },

  columnHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  mapSection: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
  },

  skeletonWrapperCard: {
    width: '50%',
  },

  arrowSliderRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    transform: 'rotate(-180deg)',
  },

  cardImageSkeleton: {
    width: '100%',
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
      height: '100%',
    },
  },

  arrowNextSlider: {
    display: 'block',
    width: '100px',
  },
}));
