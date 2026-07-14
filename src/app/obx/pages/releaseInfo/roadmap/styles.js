import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  roadmapContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    height: '100%',
    minHeight: '100%',
    alignSelf: 'stretch',
    '&:nth-of-type(-n+3)': {
      borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  quarterCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 24px',
    backgroundColor: theme.palette.surfaceWhite,
    gap: '16px',
    height: '100%',
    cursor: 'pointer',
    flex: 1,
    minHeight: 0,
    '&:hover': {
      '& $editButton': {
        opacity: 1,
        visibility: 'visible',
      },
    },
  },
  quarterCardNotPlanned: {
    backgroundColor: '#FBFBFB',
  },
  quarterHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: '140px',
    [theme.breakpoints.down(786)]: {
      paddingBottom: '12px',
      minHeight: '130px',
    },
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
    justifyContent: 'space-between',
  },
  editButton: {
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
    padding: '4px',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  editIcon: {
    width: '16px',
    height: '16px',
    '&svg': {
      width: '16px',
      height: '16px',
      color: theme.palette.textPrimary,
    },
  },
  statusText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '500',
      color: theme.palette.textPrimary,
    },
  },
  quarterTitle: {
    '&.MuiTypography-root': {
      fontSize: '18px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      lineHeight: '24px',
      [theme.breakpoints.down(786)]: {
        fontSize: '16px',
        lineHeight: '22px',
      },
    },
  },
  quarterTimeframe: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textSecondary1,
      lineHeight: '20px',
      [theme.breakpoints.down(786)]: {
        fontSize: '13px',
      },
    },
  },
  summaryContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& svg': {
      width: '4px',
      height: '4px',
      color: theme.palette.textSecondary1,
    },
  },
  quarterSummary: {
    paddingTop: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  summaryText: {
    '&.MuiTypography-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary1,
      lineHeight: '18px',
    },
  },
  quarterDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
    [theme.breakpoints.down(786)]: {
      gap: '12px',
    },
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailSectionTitle: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '600',
      color: theme.palette.textPrimary,
      lineHeight: '20px',
      marginBottom: '4px',
      [theme.breakpoints.down(786)]: {
        fontSize: '13px',
      },
    },
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingLeft: '0',
  },
  detailItem: {
    '&.MuiBox-root': {
      fontSize: '13px',
      color: theme.palette.textSecondary1,
    },
    '& ul': {
      paddingLeft: '16px',
    },
    '& p': {
      margin: 0,
    },
    '& ol': {
      margin: 0,
      paddingLeft: '16px',
    },
    '& li': {
      margin: 0,
      marginBottom: '4px',
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '40px 20px',
    height: '400px',
  },
  emptyStateWithHover: {
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
  configureButton: {
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
}));
