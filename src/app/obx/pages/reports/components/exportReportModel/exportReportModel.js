import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  // Card
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  // Header
  rejectModalInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
      fontSize: 18,
      lineHeight: 1.2,
      marginTop: 4,
    },
  },
  subText: {
    marginTop: 6,
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      fontSize: 13,
      lineHeight: 1.45,
    },
  },
  Boldtext: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 700,
      display: 'inline-block',
    },
  },

  inlinefield: {
    display: 'flex',
    gap: 20,
    marginTop: 12,
  },
  invalidFeedback: {
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 400,
    margin: 0,
    marginTop: 4,
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  // Footer
  rejectModalActions: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: 12,
  },

  // Misc (unchanged/kept for compatibility)
  addOfficerCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  addOfficerDropdownField: { height: 44 },
  addOfficerDropdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    marginTop: 16,
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': { padding: 0 },
    '& svg': { width: 16, height: 16 },
  },
  closeBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      minWidth: 'fit-content',
      padding: 0,
      marginLeft: 'auto',
      '&:hover': { background: 'transparent' },
    },
  },
  rejectModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: 4,
    },
  },
  linkReportProblem: {
    '&.MuiLink-root': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
    },
  },
}));
