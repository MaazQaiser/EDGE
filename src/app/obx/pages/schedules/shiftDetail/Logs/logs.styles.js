import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dutyDetailLogs: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  log: {
    padding: '4px 0',
    display: 'flex',
    gap: '8px',
    position: 'relative',

    '&:before': {
      content: '""',
      position: 'absolute',
      top: '90%',
      transform: 'translateY(-50%)',
      left: '12px',
      width: '1px',
      height: '23px',
      background: theme.palette.borderSubtle1,
    },

    '&:last-child:before': {
      display: 'none',
    },
  },

  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  logAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },

  logLink: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: theme.palette.textBrand,
  },

  logTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  logTime: {
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  logTimeName: {
    whiteSpace: 'nowrap',
    flexWrap: 'wrap',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
    '& circle': {
      fill: theme.palette.textPlaceholder,
    },
  },
  dot: {
    width: '3px',
    height: '3px',
  },
  dutyDetailLogsCentered: {
    height: 'calc(100dvh - 206.1px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
