import { makeStyles } from '@mui/styles';
import searchIcon from 'assets/images/search.svg';
import chevronIcon from 'assets/svg/commonDropdown/chevron_down.svg';
import chevronIconDisabled from 'assets/svg/commonDropdown/chevron_down_disabled.svg';
export const useStyles = makeStyles((theme) => ({
  countrySelectorInput: {
    width: '100%',
    margin: '0 !important',
    '& [class*="ReactFlagsSelect-module_selectOptions__3LNBJ"]': {
      borderRadius: '8px',
      background: theme.palette.common.white,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
      marginTop: '4px',
      border: `1px solid ${theme.palette.divider}`,
      padding: '0 !important',
    },
    '& [class*="flag-button"]': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle2}`,
      padding: '10px 14px !important',
      height: '44px !important',
      '&::after': {
        position: 'absolute',
        right: 14,
        width: '12px !important',
        height: '7px !important',
        content: '""',
        border: 'none !important',
        background: `url(${chevronIcon})`,
        backgroundPosition: 'center',
        backgroundSize: '12px 7px',
      },
      '&[aria-expanded="true"]::after': {
        transform: 'rotate(180deg) ',
      },
      '&:hover': {
        borderColor: theme.palette.borderSubtle2,
        boxShadow: 'none',
      },
      '&:focus': {
        border: '1px solid #3f99ff !important',
        boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1) !important',
      },
      color: '#262527',
    },
    '& [class*="ReactFlagsSelect-module_selectValue__152eS"]': {
      padding: '0 !important',
    },
    '& [class*="ReactFlagsSelect-module_disabledBtn__3A4GF"]': {
      background: 'transparent',
      color: theme.palette.textDisabled,
      '&::after': {
        background: `url(${chevronIconDisabled}) !important`,
      },
    },
    '& [class*="Mui-error"]': {
      '&:hover': {
        '& [class*="flag-button"]': {
          borderColor: '#DF372B !important',
          borderWidth: '1px !important',
          boxShadow: `0px 0px 0px 4px #fee4e2,
            0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
        },
      },
      '& [class*="flag-button"]': {
        borderColor: '#DF372B !important',
        borderWidth: '1px !important',
        boxShadow: `0px 0px 0px 4px #fee4e2,
        0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      },
    },
    '& [class*="Mui-focused"]': {
      '&:hover': {
        '& [class*="flag-button"]': {
          borderRadius: '8px',
          border: '1px solid #3f99ff !important',
          boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1) !important',
        },
      },
      '& [class*="flag-button"]': {
        borderRadius: '8px',
        border: '1px solid #3f99ff !important',
        boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1) !important',
      },
    },
    '& [class*="flag-button"]::placeholder': {
      color: `${theme.palette.textPlaceholderField} !important`,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '24px',
    },
    '& [class*="Mui-error"][class*="Mui-focused"] [class*="flag-button"]': {
      borderRadius: '8px !important',
      border: '1px solid #fda29b !important',
      boxShadow: `0px 0px 0px 4px ${theme.palette.error.light}, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
    },

    '& [class*="ReactFlagsSelect-module_selectOptionWithlabel__2GpmM"]': {
      padding: '10px 14px !important',
      margin: '0',
      color: theme.palette.textPrimary,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '20px',
      '& .ReactFlagsSelect-module_selectFlag__2q5gC': {
        fontSize: '20px',
      },
      '&:hover': {
        backgroundColor: 'transparent !important',
      },
    },
  },
  countrySelectorInputPlaceholder: {
    color: theme.palette.textPlaceholderField,
  },
  flagSelact: {
    padding: '0 !important',
    '&:hover': {
      '& [class*="MuiOutlinedInput-notchedOutline"]': {
        borderColor: theme.palette.borderSubtle2,
        boxShadow: 'none !important',
      },
    },
    '& .ReactFlagsSelect-module_selectOptions__3LNBJ': {
      '& .ReactFlagsSelect-module_filterBox__3m8EU': {
        position: 'relative',
        paddingBottom: '10px',
        paddingTop: '10px',
        '&::before': {
          content: "''",
          position: 'absolute',
          left: '18px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '20px',
          backgroundImage: `url(${searchIcon})`,
          backgroundPosition: ' center',
          borderRadius: '50%',
        },
        '& input': {
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
          border: `1px solid ${theme.palette.borderSubtle1}`,
          borderRadius: '8px',
          padding: '10px 14px 10px 32px',
          height: '36px',
          '&::placeholder': {
            color: '#cccccc',
          },
          '&:hover': {
            borderColor: '#AEAEB2',
          },
          '&:focus': {
            border: '1px solid #146DFF', // Border Color when Focused
            boxShadow: '0px 0px 0px 4px rgba(14, 165, 233, 0.1)',
          },
        },
      },
    },
  },
  errorClass: {
    borderColor: '#de382b !important',
    marginTop: '0 !important',
    '&:hover': {
      borderColor: '#de382b !important',
    },
  },
}));
