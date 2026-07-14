import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    padding: '24px 0 0 32px',
    overflow: 'auto',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: 0,
    },
  },

  availabilityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    paddingRight: '32px',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: 0,
      paddingRight: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0',
  },

  tableWrapperCalendar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingRight: '32px',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: 0,
      paddingRight: '24px',
    },
  },

  tableWrapperOne: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  zoneCustomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  tableCalendarHeading: {
    padding: '12px 24px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      lineHeight: '20px',
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },

  tableCalendarHeadingOne: {
    flex: '1 1 33.333%',
  },

  tableCalendarHeadingTwo: {
    flex: '1 1 33.333%',
  },

  tableCalendarHeadingThree: {
    flex: '1 1 33.333%',
  },

  weekDaysName: {
    flex: '1 1 33.333%',
    padding: '6px 24px',
    alignSelf: 'center',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },

  dropDownSectionOne: {
    padding: '6px 24px',
    flex: '1 1 33.333%',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },

  saveBtnWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingRight: '32px',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  timeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  rowSectionWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    '&:last-child': {
      borderBottom: 0,
    },
  },

  rowSkeleton: {
    '&.MuiSkeleton-root': {
      width: '98%',
      margin: '0 auto',
      height: '48px',
      borderRadius: '8px !important',
    },
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
