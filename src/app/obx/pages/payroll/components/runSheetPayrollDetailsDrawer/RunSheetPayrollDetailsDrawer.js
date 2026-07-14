import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  drawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
    width: '100%',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
    width: '100%',
    padding: '16px 24px',
  },
  payrollHeader: {
    padding: '16px 24px',
    width: '100%',
  },
  payrollDrawerHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerText: {
    display: 'flex',
    flexDirection: 'column',
  },
  footerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '12px',
    padding: '12px 24px',
    width: '100%',
  },
  textInlineRow: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  darkText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  smallDot: {
    '&.MuiTypography-root': {
      fontSize: '10px',
    },
  },
  misshitText: {
    '&.MuiTypography-root': {
      marginLeft: '20px',
      width: '100%',
      marginTop: '24px',
      marginBottom: '10px',
    },
  },
  topStatsBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px',
    background: theme.palette.surfaceBrandSubtle,
    gap: '40px',
    borderRadius: '8px',
    marginTop: '18px',
  },
  statValue: {
    gap: '6px',
    display: 'flex',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  iconText: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  bottomStatsBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  bottomRight: {
    flex: '1 1',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'flex-end',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  blueText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },
  redText: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
  },
  purpleText: {
    '&.MuiTypography-root': {
      color: '#A142F5',
    },
  },
  redValue: {
    borderRadius: '8px',
    padding: '8px',
    background: theme.palette.surfaceAlertSubtle,
    '& p.MuiTypography-root.MuiTypography-body2': {
      paddingLeft: '10px',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '2px',
        height: '80%',
        backgroundColor: theme.palette.textAlert,
      },
    },
  },

  purpleValue: {
    borderRadius: '8px',
    padding: '8px',

    '& p.MuiTypography-root.MuiTypography-body2': {
      paddingLeft: '10px',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: '2px',
        height: '80%',
        backgroundColor: '#A142F5',
      },
    },
  },
}));
