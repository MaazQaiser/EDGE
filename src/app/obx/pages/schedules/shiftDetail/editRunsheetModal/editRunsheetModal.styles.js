import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '598px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  rejectModalInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  subText: {
    '&.MuiTypography-root.MuiTypography-subtitle2': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  rejectModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  inlinefield: {
    display: 'flex',
    gap: '20px',
  },

  inlinefieldInner: {
    flex: 1,
  },

  inlinefieldError: {
    marginTop: '4px',
  },

  officerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  labelText: {
    color: theme.palette.textSecondary3,
    fontWeight: 500,
  },

  siteAlert: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    background: theme.palette.surfaceAlertSubtle,
  },

  hitsAccordion: {
    marginTop: 16,
    '& .MuiAccordion-root': {
      boxShadow: 'none',
      '&:before': { display: 'none' },
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      marginBottom: 8,
      overflow: 'hidden',
      '&.Mui-expanded': { marginBottom: 8 },
    },
    '& .MuiAccordionSummary-root': {
      minHeight: 44,
      backgroundColor: theme.palette.surfaceGreySubtle,
      '&.Mui-expanded': {
        minHeight: 44,
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      },
      '& .MuiAccordionSummary-content': {
        margin: '10px 0',
        fontWeight: 600,
        color: theme.palette.textPrimary,
        backgroundColor: theme.palette.surfaceGreySubtle,
      },
    },
    '& .MuiAccordionDetails-root': {
      padding: '12px 16px 12px',
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
  hitItem: {
    padding: '4px 0',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  grayAlert: {
    '&.MuiAlert-standard': {
      borderRadius: '10px',
      marginTop: '12px',
      background: theme.palette.surfaceGreySubtle,
      padding: '12px',
      alignItems: 'center',
      '& .MuiAlert-message': {
        color: theme.palette.textSecondary3,
        fontWeight: 500,
        padding: '0',
      },
      '& .MuiAlert-icon': {
        color: theme.palette.textBrand,
        padding: '0',
        marginRight: '6px',
      },
    },
  },
}));
