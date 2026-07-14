import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  drawerHeader: {
    padding: '24px 24px',
    '& p.MuiTypography-root.MuiTypography-body2': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },
  drawerHeaderTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
  inlineFlex: {
    display: 'flex',
    alignItems: 'center',
  },
  holidayWrapIn: {
    marginTop: '24px',
  },
  loopHoliday: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflow: 'auto',
  },
  drawerInner: {
    padding: '24px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  activityBox: {
    position: 'relative',
    display: 'flex',
    gap: '8px',
    paddingBottom: '20px',
    '&:last-child': {
      paddingBottom: 0,
    },
    '& .MuiTypography-body3': {
      display: 'block',
      color: theme.palette.textPlaceholder,
    },
    '& .MuiTypography-body2': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
    },
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '11px',
      bottom: '0',
      width: '2px',
      height: '100%',
      borderLeft: `2px dotted ${theme.palette.borderSubtle1}`,
    },
    '&:last-child::before': {
      display: 'none',
    },
  },
  dutyDetailLogsCentered: {
    height: 'calc(100dvh - 79px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysDetailsHol: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '12px',
    '& .MuiTypography-root.MuiTypography-body3': {
      color: theme.palette.textPlaceholder,
    },
    '& .MuiTypography-root.MuiTypography-subtitle1': {
      color: theme.palette.textPrimary,
    },
  },
  questionBankActions: {
    '& .MuiPaper-root': {
      width: '201px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  questionBankActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& .MuiSvgIcon-root': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
  headText: {
    '& .MuiTypography-root.MuiTypography-body1': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
