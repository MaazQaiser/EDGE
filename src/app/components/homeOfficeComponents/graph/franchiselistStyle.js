import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  chartHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '8px',
    },
  },

  chartHeadingBar: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  dataAmount: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mainWrapper: {
    display: 'flex',
    width: '100%',
  },

  gridSection: {
    width: '28%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  gridSectionClient: {
    width: '28%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  gridSectionOne: {
    width: '44%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '24px',
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  pieChartSkeletonWrapperClient: {
    width: '28%',
    padding: '24px 16px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  lineChartSkeletonWrapperRight: {
    width: '44%',
    padding: '24px 16px',
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  pieChartSkeletonWrapper: {
    width: '28%',
    padding: '24px 16px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    resize: 'both',
    [theme.breakpoints.down('lg')]: {
      width: '33.333%',
      paddingLeft: '8px',
      paddingRight: '8px',
    },
  },

  headerBarIn: {
    marginBottom: '20px',
  },

  legendsLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  legendLineChart: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  legendLineChartIndicator: {
    width: '14.064px',
    height: '7.928px',
    borderRadius: '8px',
  },

  legendGray: {
    backgroundColor: theme.palette.surfaceGreyStrong1,
  },

  legendBrand: {
    backgroundColor: theme.palette.surfaceBrand,
  },

  legendLineChartText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  customHeadingChart: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
  },

  chipWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
}));
