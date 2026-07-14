import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siteWrapper: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  headerWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  closeIcon: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& svg': {
      width: '24px',
      height: '24px',
      '& path': {
        fill: theme.palette.text.primary,
      },
    },
  },
  pageTitlesub: {
    marginBottom: '8px',
    marginTop: '0px !important',
    '&.MuiTypography-root': {
      fontWeight: 600,

      color: theme.palette.textSecondary,
    },
  },
  pageTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageTitleSubmain: {
    '&.MuiTypography-root': {
      color: '#86868B',
    },
  },
  pageTitlem: {
    color: theme.palette.textPrimary,

    lineHeight: '32px',
    fontWeight: 500,
  },
  pageTitle: {
    color: theme.palette.textPrimary,
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 500,
  },
  scrollContent: {
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
  },
  upperWrap: {
    paddingBottom: '24px',
  },
  siteDetais: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldWrapper: {
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  onecols: {
    width: '100%',
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
  oneThird: {
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  textFiledFilter: {
    '& .MuiInputBase-root': {
      height: '44px',
    },
  },
  lowerWrap: {
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${theme.palette.divider}`,
    zIndex: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  emailWrapper: {
    width: '100%',
  },
  inlineFields: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '8px',
  },
  alertIcon: {
    marginBottom: '6px',
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
        color: '#262527',
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
          borderColor: theme.palette.borderStrong1,
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
            color: theme.palette.textPlaceholderField,
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            opacity: 1,
          },
        },
      },
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
}));
