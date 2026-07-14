import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  reportProfile: {
    padding: '16px 32px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(245, 245, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },

  reportProfileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: '1 1 50%',
  },

  reportProfileAvatar: {
    '&.MuiAvatar-root': {
      width: '56px',
      height: '56px',
    },
  },

  reportProfileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  reportProfileInfoTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  reportProfileInfoText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  reportProfileRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flex: '1 1 50%',
  },

  reportProfileContentTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  reportProfileContentText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  reportProfileStatus: {
    display: 'block',
    padding: '2px 8px',
    borderRadius: '16px',
  },

  reportProfileStatusPending: {
    backgroundColor: theme.palette.surfaceBrandSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  reportProfileStatusRejected: {
    backgroundColor: theme.palette.surfaceAlertSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
  },

  reportProfileStatusApproved: {
    backgroundColor: theme.palette.surfaceSuccessSubtle,
    '&.MuiTypography-root': {
      color: theme.palette.textSuccess,
    },
  },
  reportCap: {
    textTransform: 'capitalize',
  },
}));
