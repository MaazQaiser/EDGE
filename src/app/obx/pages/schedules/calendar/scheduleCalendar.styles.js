import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  scheduleCalendar: {
    padding: '24px 32px 30px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    position: 'relative',
    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },

  scheduleCalendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  scheduleCalendarHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  scheduleCalendarHeaderFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  scheduleCalendarHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  scheduleCalendarAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderAlert}`,
    background: theme.palette.surfaceAlertSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
    '& .MuiSvgIcon-root': {
      width: '18px',
      height: '18px',
    },
  },

  scheduleCalendarFull: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    marginTop: '24px',
  },

  scheduleCalendarAlertSkeleton: {
    '&.MuiSkeleton-root': {
      width: '230px',
      height: '26px',
      borderRadius: '20px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },
}));
