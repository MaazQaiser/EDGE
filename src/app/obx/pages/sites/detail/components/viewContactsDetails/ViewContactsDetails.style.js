import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  siteWrapper: {
    '& h3.MuiTypography-root , & h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },
  boxHeader: {
    padding: '24px',
  },

  titleHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ChipsWrap: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  titleHeadBtn: {
    '& svg': {
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16px 24px 24px 24px',
    gap: '12px',
    marginTop: '24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  sideTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0',
    },
  },

  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  upperWrap: {
    padding: '0px 24px 0px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    gap: '24px',
    flex: '1 1',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  mainHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '6px',
      fontWeight: '600',
    },
  },
  fieldWrapper: {
    flex: '0 1 48.4%',
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  fieldWrapperHalf: {
    flex: '0 1 48.4%',
  },
  fieldWrapperFull: {
    flex: '1 1 100%',
  },
  fieldWrapperTwin: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
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
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 0px 0px 0px',
    margin: '0px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
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
    gap: '12px',
    '& span.MuiSwitch-root': {
      background: theme.palette.surfaceGreyLight,
      borderRadius: '20px',
    },
    '& label.MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
}));
