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
  Boldtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: '700',
      display: 'inline-block',
    },
  },
  rejectModalInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '4px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  addOfficerCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
  },

  addOfficerDropdownField: {
    height: '44px',
  },

  addOfficerDropdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '16px',
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  subText: {
    '&.MuiTypography-root.MuiTypography-subtitle2': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      minWidth: 'fit-content',
      padding: 0,
      marginLeft: 'auto',

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  rejectModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  rejectModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  linkReportProblem: {
    '&.MuiLink-root': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
    },
  },
  inlinefield: {
    display: 'flex',
    gap: '20px',
  },
  inlinefieldText: {
    display: 'flex',
    gap: '8px',
  },
  siteAlert: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    background: theme.palette.surfaceAlertSubtle,
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

  reassignShiftChip: {
    marginTop: '12px',
    '& .MuiChip-root': {
      width: '100%',
      justifyContent: 'flex-start',
      padding: '8px 12px',
      borderRadius: '8px',
      textTransform: 'unset',

      '& .MuiChip-label': {
        fontSize: '14px',
        lineHeight: '20px',
      },

      '& svg': {
        width: '18px',
        height: '18px',
        '& path': {
          stroke: theme.palette.textBrand,
        },
      },
    },
  },
}));
