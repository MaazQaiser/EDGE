import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesSubheader: {
    position: 'sticky',
    backgroundColor: theme.palette.surfaceGreySubtle,
    left: 0,
    zIndex: 9,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
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
    [theme.breakpoints.down(786)]: {
      fontSize: '10px',
      lineHeight: '12px',
    },
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
    [theme.breakpoints.down(786)]: {
      padding: '16px',
      gap: '12px',
      flexDirection: 'column',
    },
  },

  avatarSection: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    [theme.breakpoints.down(786)]: {
      alignItems: 'flex-start',
    },
  },

  avatarImage: {
    width: '48px',
    height: '48px',
    '& > img': {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    [theme.breakpoints.down(786)]: {
      minWidth: '32px',
      minHeight: '32px',
      height: '100%',
      '& > img': {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        minWidth: '32px',
        minHeight: '32px',
      },
    },
  },
  editIcon: {
    cursor: 'pointer',
  },

  siteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      [theme.breakpoints.down(786)]: {
        fontSize: '14px',
        lineHeight: '16px',
      },
    },
  },

  address: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      [theme.breakpoints.down(786)]: {
        fontSize: '10px',
        lineHeight: '12px',
      },
    },
  },

  rightContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '32px',
    [theme.breakpoints.down('lg')]: {
      gap: '16px',
    },
    [theme.breakpoints.down(786)]: {
      justifyContent: 'center',
      width: '100%',
      gap: '8px',
      alignItems: 'center',
    },
  },

  rightDetail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  textLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      [theme.breakpoints.down(786)]: {
        fontSize: '10px',
        lineHeight: '12px',
      },
    },
  },

  textDetail: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      [theme.breakpoints.down(786)]: {
        fontSize: '10px',
        lineHeight: '12px',
        '& svg': {
          width: '12px',
          height: '12px',
        },
      },
    },
  },
  assignAvatar: {
    '&.MuiAvatar-root': {
      marginRight: '6px',
      width: '20px',
      height: '20px',
    },
  },
  Status: {
    display: 'flex',
    gap: '5px',
    borderRadius: '16px',
    backgroundColor: '#fef3f2',
    color: '#fa4949',
    fontSize: '12px',
    padding: '0px 8px 0px 8px',
    fontWeight: 500,
    lineHeight: '18px',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#0059FF',
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
}));
