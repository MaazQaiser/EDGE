import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '0 32px',
  },
  siteWrapper: {
    paddingBottom: '4px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
    '& h3.MuiTypography-root , & h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  upperWrap: {
    padding: '24px 0',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  siteDetais: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  siteDetaisWrapper: {
    width: '100%',
  },
  siteDetaisTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 500,
      marginBottom: '16px',
    },
  },
  siteDetaisFields: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  fieldWrapper: {
    flex: '1 1 calc(25% - 18px)',
    minWidth: '200px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  oneThird: {
    flex: '1 1 calc(50% - 12px)',
    minWidth: '300px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  onecols: {
    flex: '1 1 calc(25% - 18px)',
    minWidth: '200px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
    '& .select__control': {
      height: '44px',
      minHeight: '44px',
    },
    '& .select__value-container': {
      padding: '2px 8px',
    },
    '& .select__input-container': {
      margin: 0,
      padding: 0,
    },
  },
  textFiledFilter: {
    '& .MuiInputBase-root': {
      height: '44px',
    },
  },
  placeHolderColors: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  dropdownWraps: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },
  emailChips: {
    gap: '8px',
    display: 'flex',
    marginTop: '15px',
    '& .MuiButtonBase-root.MuiChip-root.MuiChip-filled': {
      gap: '15px',
    },
  },
  inlineFields: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  alertIcon: {
    marginBottom: '6px',
  },

  lowerWrap: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    padding: '16px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: 'auto',
    width: '100%',
    zIndex: 1,
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  autoCompleteField: {
    minHeight: '44px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        fontSize: 16,
        lineHeight: '24px',
        color: '#262527', // Change the color of input text
        zIndex: 1,
        padding: '10px 14px',
        background: 'transparent',
        gap: '4px',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.borderSubtle2}`,

        '& .MuiChip-root': {
          margin: 0,
          textTransform: 'unset',
          '& .MuiSvgIcon-root': {
            color: theme.palette.textBrand,
            '&:hover': {
              color: theme.palette.textBrand,
            },
          },
        },

        '&:hover': {
          borderColor: theme.palette.borderStrong1, // Border Color when Hovered
          boxShadow: 'none',
        },

        '&::after': {
          display: 'none',
        },
        '&::before': {
          display: 'none',
        },
        '& .MuiInputBase-input': {
          padding: 0,

          '&::placeholder': {
            color: theme.palette.textPlaceholderField, // Placeholder Color
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            opacity: 1,
          },
        },
      },
    },
  },

  autoCheckout: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    marginTop: '8px',
    '& span.MuiSwitch-root': {
      background: theme.palette.surfaceGreyLight,
      borderRadius: '20px',
    },
    '& label.MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },

  countryPhnNumber: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0px 14px',
    borderRadius: '8px',
    height: '44px',
    '& > div': {
      height: '100%',
      '& div:nth-child(1)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
        margin: '8px 8px 8px 0px',
        paddingRight: '8px',
      },
    },
    '& input': {
      height: '100%',
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
  sectionTitle: {
    color: theme.palette.textPrimary,
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 500,
  },
  dropdownCommon: {
    maxHeight: '44px',
    height: '44px',
  },
}));
