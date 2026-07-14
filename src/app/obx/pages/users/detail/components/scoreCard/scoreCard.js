import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    width: '100%',
    position: 'sticky',
    top: '0',
    background: theme.palette.surfaceWhite,
    zIndex: '100',
    padding: '24px 0',
  },

  mainScoreBoardWrapper: {
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'flex-start',
    },
  },

  countSecondFigure: {
    '&.MuiTypography-root': {
      color: theme.palette.textDisabled,
    },
  },

  countFirstFigure: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  combinationTypoBox: {
    display: 'flex',
    alignItems: 'center',
  },

  searchSection: {
    display: 'flex',
    flex: 1,
    padding: '8px 16px',
    justifyContent: 'space-between',
    gap: '8px',
    borderRadius: '8px',
    border: `1px solid  ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    maxHeight: '36px',
    [theme.breakpoints.down('lg')]: {
      gap: 0,
      width: '100%',
      order: 2,
      padding: '8px 12px',
    },
  },

  scroreBoardContent: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  scroreBoardContentText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  typoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('lg')]: {
      gap: '4px',
    },
  },

  verticalDivider: {
    height: '20px !important',
    margin: '0px 8px !important',
  },

  calendarHeaderToolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceWhite}`,
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '2px 2px',
      [theme.breakpoints.down('lg')]: {
        width: '100%',
      },

      '& .MuiToggleButtonGroup-grouped': {
        padding: '5px 16px',
        border: '0 ',
        height: 'auto',
        borderRadius: '6px !important',
      },
    },
  },

  calendarHeaderToolbarToggleBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textPlaceholder}`,
      border: '1px solid transparent',
      width: '100%',
      '&:hover': {
        backgroundColor: `${theme.palette.textBrand}`,
        color: theme.palette.textOnColor,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid ${theme.palette.surfaceBrandDisabled}`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.textBrand}`,
        color: `${theme.palette.textOnColor}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceBrandHover}`,
        },
      },
    },
  },

  progressbarWithlabel: {
    position: 'relative',
    display: 'inline-flex',
    zIndex: '0',
  },

  circularBarFunction: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarDescription: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px',
    [theme.breakpoints.down('lg')]: {
      gridTemplateColumns: '1fr 1fr',
    },
  },

  calendarDescriptionBox: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    padding: '24px',
  },

  completionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginBottom: '4px',
    },
  },

  percerntageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  completionTextOne: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  innerDescriptionBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  completionRateContent: {
    display: 'flex',
    flexDirection: 'column',
  },

  borderClass: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
  },

  progressBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressDescription: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  circularProgressBarWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    marginTop: '16px',
  },

  commentTypo: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  prgressTypo: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  mainLastContent: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  backgroundProgress: {
    zIndex: '1',
    position: 'absolute',
    '& svg': {
      color: '#F4780B', // Specify your desired color or use theme.palette.primary.main
      '& circle': {
        strokeDashoffset: '0px !important',
      },
    },
  },

  foregroundProgress: {
    position: 'relative',
    zIndex: 2,
    '& svg': {
      color: theme.palette.borderSubtle1, // Adjust the color based on your theme
      '& circle': {
        // Add styles for the circle in the foreground if needed
      },
    },
  },
}));
