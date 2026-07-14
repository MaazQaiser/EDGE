import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  paperContainer: {
    borderRadius: '8px',
    background: '#fff',
    boxShadow:
      ' 0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1) !important ',
    marginTop: '4px !important',
    border: ' 1px solid #e6e6e7 !important',
    '& .MuiList-root': {
      '& .MuiButtonBase-root': {
        '&.MuiMenuItem-root': {
          '&.Mui-disabled': {
            opacity: 1,
            '& .MuiTypography-root': {
              color: theme.palette.textDisabled,
            },
          },
          '& .MuiTypography-root': {
            color: theme.palette.textPrimary,
          },
        },
      },
    },
  },

  ul: {
    padding: ' 0 !important',
  },

  span: {
    color: '#5b5b5f',
    fontSize: '14px !important',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
  },

  customDropdownOptionsSearch: {
    padding: '10px 14px',
    position: 'relative',
    zIndex: 99,
  },

  customDropdownSearchField: {
    height: '36px',

    '& .MuiInputBase-root': {
      '& .MuiInputBase-input': {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
      },
    },
  },

  customInputSelect: {
    '& .MuiInputBase-root': {
      '& .MuiSvgIcon-root': {
        width: '20px',
        height: '20px',
        top: 'unset',
        right: '10px',

        '&.Mui-disabled': {
          color: theme.palette.textDisabled,
          '&.MuiSelect-icon': {
            '& path': {
              stroke: theme.palette.textDisabled,
            },
          },
        },
      },
    },
  },

  searchBar: {
    padding: '0 !important',
    lineHeight: '0 !important',
  },
}));
