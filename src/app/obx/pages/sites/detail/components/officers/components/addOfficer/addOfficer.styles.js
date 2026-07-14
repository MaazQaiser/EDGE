import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 424px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',
  },

  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
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
      transform: 0,
      borderRadius: '8px !important',
    },
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

  rejectModalContent: {},

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
}));
