import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: '0',
      width: '75%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  inlineValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },
  },
  inlineValueTwo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    [theme.breakpoints.down(768)]: {
      flexWrap: 'wrap',
      gap: '4px',
    },
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },
  },
  smallDot: {
    [theme.breakpoints.down(768)]: {
      display: 'none',
    },
  },
  inlineValueTwoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    [theme.breakpoints.down(768)]: {
      flexWrap: 'wrap',
      gap: '4px',
    },
  },
  timeRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& .MuiTypography-root': {
      [theme.breakpoints.down(768)]: {
        fontSize: '10px',
      },
    },
  },
  jobTitleText: {
    [theme.breakpoints.down(768)]: {
      maxWidth: '14ch',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  chipAndText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  jobGrayBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    [theme.breakpoints.down(768)]: {
      marginBottom: '0',
    },
  },

  jobCheckbox: {
    '& .MuiTypography-root': {
      fontSize: '14px',
    },
    '& label.MuiFormControlLabel-root': {
      margin: '0px',
    },
  },
  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
    background: '#fafafa',
  },
  newAlarm: {
    background: '#FEF3F2',
    color: '#B42318',
  },
  unassigned: {
    background: '#FEF3F2',
    color: '#B42318',
  },

  assigned: {
    background: '#FFFAEB',
    color: '#B54708',
  },
  acknowledged: {
    background: '#EFF8FF',
    color: '#0059FF',
  },
  callReceived: {
    background: '#EFF8FF',
    color: '#146DFF',
  },
  onTheWay: {
    background: '#EFF8FF',
    color: '#175CD3',
  },
  onSite: {
    background: '#F4F3FF',
    color: '#5925DC',
  },
  onSiteAllClear: {
    background: '#ECFDF3',
    color: '#2E964B',
  },
  reportCompleted: {
    background: '#ECFDF3',
    color: '#2E964B',
  },
  close: {
    background: '#F5F5F6',
    color: '#5B5B5F',
  },
  incidentToReport: {
    background: '#FBEEED',
    color: '#E43F32',
  },
  notStarted: {
    background: '#FBEEED',
    color: '#E95A08',
  },
  available: {
    background: '#FFFAEB',
    color: '#DC6803',
  },
}));
