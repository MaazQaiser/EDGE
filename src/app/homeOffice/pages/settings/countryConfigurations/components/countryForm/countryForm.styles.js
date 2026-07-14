import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  countryForm: {
    maxWidth: '860px',
    width: '100%',
    margin: '0 auto',
    padding: '0 32px',
  },
  countryFormActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0 0 0',
    marginTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  countryFormActionsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  countryFormBody: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '16px',
    paddingTop: '16px',
  },

  countryFormTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '16px',
    },
  },

  countryFormField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',

    '&:last-child': {
      marginBottom: 0,
      alignItems: 'flex-start',
    },

    '& .MuiFormLabel-root': {
      marginBottom: 0,
      color: theme.palette.textSecondary1,
    },

    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        fontSize: '14px',
        fontWeight: '500',
        maxHeight: '36px',
        minWidth: '270px',

        '& .MuiInputBase-input': {
          fontSize: '14px',
          fontWeight: '500',

          '&::placeholder': {
            fontSize: '14px',
            fontWeight: '500',
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          background: theme.palette.surfaceWhite,
        },
      },
    },
  },

  employeeType: {
    '&.MuiTypography-root': {
      width: '128px',
      color: theme.palette.textPrimary,
      textAlign: 'right',
      paddingTop: '8px',
    },
  },

  employeeTypeDisabled: {
    '&.MuiTypography-root': {
      width: '128px',
      color: theme.palette.textDisabled,
      textAlign: 'right',
      paddingTop: '8px',
    },
  },

  countryFormGroup: {
    display: 'flex',
    gap: '12px',
  },

  countryFormFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  disabledField: {
    '&.MuiFormControl-root': {
      pointerEvents: 'none',
    },
  },

  countryFormDropdown: {
    width: '270px',
    height: '36px',
    background: theme.palette.surfaceWhite,
  },

  countryFormDateFormat: {
    '& div': {
      '& div': {
        '& h6': {
          textTransform: 'unset !important',
        },
      },
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

  countryFormPopper: {
    '& div': {
      '& p': {
        textTransform: 'unset !important',
      },
      '& div': {
        '& p': {
          textTransform: 'unset !important',
        },
      },
    },
  },

  sweetAlertConfirmBlueButton: {
    padding: '10px 16px',
    borderRadius: '8px !important',
    margin: 0,
    height: '40px',
    color: `${theme.palette.textOnColor} !important`,
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
    border: `1px solid ${theme.palette.borderBrand} !important`,
    fontFamily: 'inherit',
    fontSize: '14px !important',
    fontWeight: 500,
    lineHeight: '20px !important',
    boxShadow: 'none',
    // textTransform: 'capitalize',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: `${theme.palette.surfaceBrandHover} !important`,
      border: `1px solid ${theme.palette.borderBrandHover} !important`,
      backgroundImage: 'none !important',
    },

    '&:active': {
      backgroundColor: `${theme.palette.surfaceBrand} !important`,
      border: `1px solid ${theme.palette.borderBrand} !important`,
      boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      backgroundImage: 'none !important',
    },

    '&:focus': {
      boxShadow: `none !important`,
    },

    '&:disabled': {
      color: `${theme.palette.textOnColor} !important`,
      backgroundColor: `${theme.palette.textBrandDisabled} !important`,
      border: `1px solid ${theme.palette.borderBrandDisabled} !important`,
    },

    '&:focus-visible': {
      outline: 'none !important',
    },
  },

  countryFormRadio: {
    '&.MuiFormGroup-root': {
      gap: '16px',
      flexDirection: 'row',

      '& .MuiFormControlLabel-root': {
        marginLeft: 0,
        marginRight: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',

        '& .MuiTypography-root': {
          fontSize: '14px',
          fontWeight: '400',
          color: theme.palette.textPrimary,

          '&.Mui-disabled': {
            color: theme.palette.textDisabled,
          },
        },

        '& .MuiButtonBase-root': {
          padding: 0,

          '& .MuiSvgIcon-root': {
            width: '16px',
            height: '16px',
          },
        },
      },
    },
  },
  countryImage: {
    width: '20.8px',
    height: '16px',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },
  countryFormHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  countryFormWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    gap: '16px',
    marginBottom: '16px',

    '& .MuiAccordion-rounded': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px !important',

      padding: '16px',
      background: theme.palette.surfaceGreyLight,
      '&.Mui-expanded': {
        background: theme.palette.surfaceGreyLight,
      },
      '&::before': {
        opacity: '0',
      },

      '& .MuiAccordionSummary-root': {
        minHeight: 'auto',
        padding: '0px',
      },
      '& .MuiAccordionSummary-content': {
        margin: '0px',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'space-between',

        '& .MuiTypography-root': {
          padding: '0',
          width: '100%',
          margin: '0',
          borderBottom: `none !important`,
        },
      },
      '& .MuiAccordionDetails-root': {
        padding: '0 ',
      },
    },
  },
  dropDownSkeleton: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
}));
