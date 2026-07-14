import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  releaseContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    padding: '24px 32px 0px 32px',
    [theme.breakpoints.down(786)]: {
      padding: '16px',
    },
  },
  headerSection: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    [theme.breakpoints.down(786)]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '16px',
    },
  },
  tabsSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statesButtons: {
    height: '37px',
    borderRadius: '8px !important',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceWhite,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    '& .Mui-selected': {
      borderRadius: '6px',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& svg': {
        color: 'white !important',
      },
      '& .MuiTypography-root': {
        color: 'white !important',
      },
    },
    '& .MuiToggleButton-root': {
      color: theme.palette.textPrimary,
      '& svg': {
        color: theme.palette.textPrimary,
      },
    },
  },
  tabContentWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  firstButton: {
    borderRadius: '6px 0px 0px 6px !important',
    '&.Mui-selected': {
      borderRadius: '6px 0px 0px 6px !important',
    },
  },
  lastButton: {
    borderRadius: '0px 6px 6px 0px !important',
    '&.Mui-selected': {
      borderRadius: '0px 6px 6px 0px !important',
    },
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  configureButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
    },
  },
  newReleaseButton: {
    '&.MuiButton-root': {
      height: '37px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
    },
  },
  yearControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  yearNavButton: {
    '&.MuiButton-root': {
      minWidth: '22px !important',
      width: '22px !important',
      height: '22px !important',
      padding: '0',
      borderRadius: '50%',
      backgroundColor: theme.palette.surfaceGreySubtle || '#E0E0E0',

      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      border: '1px solid #E0E0E0',
      '&:hover': {
        backgroundColor: theme.palette.surfaceGreyLight || '#D0D0D0',
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: theme.palette.surfaceGreySubtle || '#E0E0E0',
      },
      '& svg': {
        width: '16px',
        height: '16px',
        color: theme.palette.textPrimary,
      },
    },
  },
  yearText: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
      color: theme.palette.textPrimary,
      lineHeight: '1',
      marginRight: '4px',
    },
  },

  tabContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
  roadmapContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '0',
    width: '100%',
    alignItems: 'stretch',
    minHeight: '100%',
    [theme.breakpoints.down(786)]: {
      gridTemplateColumns: '1fr',
      gap: '12px',
    },
  },
  noDataContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: '600px',
    flex: 1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '40px 20px',
    height: '400px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    backgroundColor: theme.palette.surfaceWhite,

    '&:hover': {
      '& .MuiButton-root': {
        backgroundColor: `${theme.palette.textBrand} !important`,
        color: `${theme.palette.textOnColor} !important`,
      },
      '& svg': {
        ' & path:nth-child(4), & path:nth-child(n+7)': {
          fill: `#F2FAFF !important`,
        },
        '& path:nth-child(5), & path:nth-child(6)': {
          fill: `${theme.palette.textBrand} !important`,
        },
      },
    },
  },
  emptyStateText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: theme.palette.textSecondary1,
      textAlign: 'center',
      lineHeight: '24px',
      [theme.breakpoints.down(786)]: {
        fontSize: '14px',
        lineHeight: '20px',
      },
    },
  },
  emptyStatePlaceholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  emptyStateConfigureButton: {
    '&.MuiButton-root': {
      backgroundColor: '#6A6A70',
      color: '#FFFFFF',
      border: 'none',
      '&:hover': {
        backgroundColor: '#6A6A70',
        color: '#FFFFFF',
      },
      '&:active': {
        backgroundColor: '#6A6A70',
        color: '#FFFFFF',
      },
    },
  },
  yearNavButtonIcon: {
    transform: 'rotate(180deg)',
  },
}));
