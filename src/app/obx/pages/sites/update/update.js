import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  updateSites: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },

  mainBoxForm: {
    maxWidth: '974px',
    width: '100%',
    margin: '0 auto',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },

  sitesFieldsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    // Neutralise the trailing bottom-margin of a group's last element so the
    // 48px flex gap is the only spacing between groups (otherwise groups that
    // end in a formBox/infoCard leak an extra 10–20px).
    '& > *:last-child': {
      marginBottom: 0,
    },
  },

  sitesDynamicContent: {
    marginTop: 0,
  },

  btnBox: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  flexControlEmail: {
    marginBottom: '20px',
    width: '48.243%',
  },

  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },

  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  formBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '32px',
    marginBottom: '20px',
  },

  // Location fields share one grid so every field (country, region, city, etc.)
  // keeps an identical vertical and horizontal rhythm.
  avatarFormImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
  },

  flexControl: {
    flex: 1,
  },

  flexHalf: {
    width: 'calc(50% - 16px)',
  },

  mapBox: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '10px',
    marginBottom: '10px',
  },

  mapSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  addressSearch: {
    marginBottom: '20px',
  },

  buttonGroupLast: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  sitesFieldsTitle: {
    '&.MuiTypography-root': {
      marginBottom: 0,
      color: theme.palette.textPrimary,
    },
  },

  // Unified section header used by every top-level group (Client, Site Details,
  // Reports Distribution, Integrations, Additional Contacts): the title is
  // separated from its body by a hairline, so all groups read with the same
  // separator and spacing.
  sectionHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '12px',
    marginBottom: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  subSectionTitle: {
    '&.MuiTypography-root': {
      marginTop: '32px',
      marginBottom: '16px',
      color: theme.palette.textSecondary1,
      fontWeight: 600,
    },
  },

  clientPicker: {
    '& .MuiOutlinedInput-root': {
      background: theme.palette.surfaceWhite,
    },
  },

  optionRow: {
    display: 'flex',
    flexDirection: 'column',
  },

  optionName: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textPrimary,
  },

  optionMeta: {
    fontSize: '12px',
    color: theme.palette.textSecondary2,
  },

  readOnlyItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },

  readOnlyLabel: {
    fontSize: '12px',
    fontWeight: 400,
    color: theme.palette.textSecondary2,
  },

  readOnlyValue: {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textPrimary,
    wordBreak: 'break-word',
  },

  // Read-only info card (client + location): a flat grid of labelled fields
  // inside a subtle panel — no header/monogram hierarchy.
  infoCard: {
    background: theme.palette.surfaceGreySubtle,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
  },

  // The address field carries its reset affordance inline with the label.
  addressLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },

  resetAddressBtn: {
    '&.MuiButtonBase-root': {
      flexShrink: 0,
      height: 'auto',
      minWidth: 'auto',
      padding: '2px 6px',
    },
  },

  infoDetailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    columnGap: '40px',
    rowGap: '16px',
    padding: '16px 20px',
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: '1fr',
    },
  },

  clientEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    borderRadius: '8px',
    border: `1px dashed ${theme.palette.borderSubtle1}`,
    textAlign: 'center',
    color: theme.palette.textSecondary2,
    fontSize: '13px',
  },

  addContacts: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 24px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.textBrand,
    cursor: 'pointer',
  },

  addContactsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  addContactsBox: {
    background: theme.palette.surfaceGreySubtle,
    padding: '16px',
    borderRadius: '8px',
  },

  addContactsBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  addContactsBoxHeaderBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      background: 'transparent',
      border: 0,
      fontSize: '14px',
      height: 'auto',
      boxShadow: 'none',
      borderRadius: 'none',
      '&:hover': {
        border: 0,
        background: 'transparent',
      },
      '&:active': {
        background: 'transparent',
        border: 0,
        boxShadow: 'none',
      },
      '&:disabled': {
        color: '#FECDCA',
        background: 'transparent',
        border: 0,
        '& .MuiButton-startIcon': {
          '& svg': {
            ' & path': {
              stroke: '#FECDCA',
            },
          },
        },
      },
      '& .MuiButton-startIcon': {
        marginRight: '4px',
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },
    },
  },

  addContactsBoxContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
  },

  addContactsBoxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },

  inputLabel: {
    display: 'flex',
    alignItems: 'center',
  },

  addContactsBoxGroupControl: {
    width: '50%',
  },

  addContactsInputs: {
    '& .MuiInputBase-root': {
      '& .MuiOutlinedInput-notchedOutline': {
        background: theme.palette.surfaceWhite,
      },
    },
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

  sitesContactCheckbox: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px',
    marginTop: 'auto',

    '& .MuiFormLabel-root': {
      marginBottom: 0,
      fontWeight: 400,
      color: theme.palette.textPrimary,
    },
  },

  addContactsBoxHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  countryPhnNumber: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0px 14px',
    borderRadius: '8px',
    '& > div': {
      '& div:nth-child(1)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
        margin: '8px 8px 8px 0px',
        paddingRight: '8px',
      },
    },
    '& input': {
      height: '44px',
      border: 0,
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
      },
      '&:focus , &:focus-visible': {
        border: 0,
        boxShadow: 'none',
        outline: 'none',
      },
    },
  },
  cbxInviteUsersWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: theme.palette.surfaceGreySubtle,
    padding: '16px',
    borderRadius: '8px',
    border: `1px dashed ${theme.palette.borderSubtle1}`,
    '& .MuiInputBase-root': {
      backgroundColor: `${theme.palette.surfaceWhite} !important`,
    },
  },
  inviteUsersTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      paddingBottom: '12px',
      marginBottom: '12px',
    },
  },
  inviteUsersLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      fontSize: '14px',
      lineHeight: '20px',
      marginBottom: '8px',
    },
  },
  inviteUsersInputContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  inviteUsersAutocomplete: {
    flex: 1,
    '& .MuiAutocomplete-root': {
      '& .MuiOutlinedInput-root': {
        padding: '8px 14px',
        minHeight: '44px',
        backgroundColor: theme.palette.surfaceWhite,
        borderRadius: '8px',
        border: `1px solid ${theme.palette.borderSubtle2}`,
        '&:hover': {
          borderColor: theme.palette.borderStrong1,
        },
        '&.Mui-focused': {
          borderColor: theme.palette.borderBrand,
          boxShadow: 'none',
        },
        '& fieldset': {
          border: 'none',
        },
      },
      '& .MuiInputBase-input': {
        padding: '0 !important',
        fontSize: '16px',
        lineHeight: '24px',
        '&::placeholder': {
          color: theme.palette.textPlaceholderField,
          opacity: 1,
        },
      },
    },
  },
  inviteUsersChip: {
    backgroundColor: theme.palette.surfaceBrand,
    color: theme.palette.textOnColor,
    height: '28px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    '& .MuiChip-deleteIcon': {
      color: theme.palette.textOnColor,
      fontSize: '16px',
      '&:hover': {
        color: theme.palette.textOnColor,
      },
    },
  },
  inviteUsersSendButton: {
    '&.MuiButton-root': {
      backgroundColor: theme.palette.surfaceBrand,
      color: theme.palette.textOnColor,
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '24px',
      textTransform: 'none',
      minWidth: 'auto',
      whiteSpace: 'nowrap',
      '&:hover': {
        backgroundColor: theme.palette.surfaceBrand,
        opacity: 0.9,
      },
      '& .MuiButton-endIcon': {
        marginLeft: '8px',
        '& svg': {
          fontSize: '20px',
        },
      },
    },
  },

  integrationsCheck: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      paddingBottom: '16px',
      marginBottom: '16px',
    },
  },

  integrationRowText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  switchWrapper: {
    display: 'flex',
    alignItems: 'center',

    '& span.MuiSwitch-root.MuiSwitch-sizeMedium': {
      backgroundColor: '#ebebeb',
      borderRadius: '50px',
    },
  },

  grayBackgroundWrapper: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    padding: '16px',
    borderRadius: '8px',
    marginTop: 0,
    '& .MuiTypography-root.MuiTypography-body3': {
      color: theme.palette.textSecondary2,
      display: 'inline-block',
    },
    '& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },

  // Dispatch report field carries its "Send immediately" checkbox directly
  // beneath the input; keep the same bottom rhythm as a formBox.
  dispatchReportField: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '32px',
    marginBottom: '20px',
  },

  sendImmediatelyCheck: {
    '&.MuiFormControlLabel-root': {
      marginLeft: 0,
      marginTop: '10px',
      gap: '8px',
      '& .MuiFormControlLabel-label': {
        fontSize: '14px',
        color: theme.palette.textPrimary,
      },
    },
  },
}));
