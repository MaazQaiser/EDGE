import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  moreFilterHeader: {
    marginBottom: '16px !important',
  },

  sideHeader: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '24px 24px 10px',
  },

  moreFilterForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '6px 24px 24px 24px',
  },

  fieldWrapper: {
    marginBottom: '16px',
    '&  dropdownWrap': {
      height: '44px',
    },

    '&:last-child': {
      marginBottom: 0,
    },
  },

  placeHolderColor: {
    color: theme.palette.textPlaceholderField,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  dropdownWrap: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },

  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      width: 'fit-content',
      height: 'auto',
      padding: '0',
      '&:hover': {
        background: 'transparent',
      },

      '&.Mui-disabled': {
        '& svg': {
          '& path': {
            fill: theme.palette.textDisabled,
          },
        },
      },
    },
    '& svg': {
      width: '14px',
      height: '14px',
    },
  },

  dropdownHeight: {
    height: '44px !important',
  },
  textFiledFilter: {
    height: '44px !important',
  },

  moreFilterFooter: {
    margin: '0 24px 0px 24px',
    padding: '24px 0px',
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
