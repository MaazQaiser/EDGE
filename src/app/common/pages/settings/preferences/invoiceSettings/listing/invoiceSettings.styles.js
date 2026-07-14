import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  invoiceSettings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  invoiceSettingsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  invoiceSettingsText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
      marginRight: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0',
      marginRight: '4px',
    },
    '& svg': {
      height: '20px',
      width: '20px',
    },
  },

  editModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  editModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  editModalText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '6px',
    },
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

  dropDownSkeleton: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  addOfficerDropdownField: {
    height: '44px',
  },

  addOfficerDropdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
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

  editModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  editModalActions: {
    marginTop: '12px',
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

  templateActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  templateActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  templateActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  templateActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textSecondary2,
      },
    },
  },
}));
