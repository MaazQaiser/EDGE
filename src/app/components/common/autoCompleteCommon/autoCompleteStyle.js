import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
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
    padding: '0px 32px 0px 32px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  siteDetaisFields: {
    display: 'flex',
    gap: '20px',
    margin: '20px 0px',
  },
  fieldWrapper: {
    flex: '1 1 25%',
  },
  emailWrapper: {
    flex: '1 1 100%',
  },
  onecols: {
    flex: '0 0 24.3%',
  },
  oneThird: {
    flex: '0 0 49.5%',
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
}));
