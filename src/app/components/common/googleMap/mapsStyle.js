import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mapListing: {
    '&.MuiList-root': {
      position: 'absolute',
      left: '0',
      right: '0',
      margin: '0 auto',
      top: '55px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: '#fff',
      zIndex: '1',
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)',
      borderRadius: '8px',
      '& li.MuiListItem-root': {
        borderBottom: '1px solid #d0cfd27a',
        padding: '8px 14px',
        '&:hover': {
          background: theme.palette.surfaceGreySubtle,
          cursor: 'pointer',
        },
        '& .MuiListItemText-root': {
          '& .MuiTypography-root': {
            color: theme.palette.textPrimary,
            fontSize: '14px',
            lineHeight: '20px',
          },
        },
      },
    },
  },
  fieldWrapper: {
    position: 'relative',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '10px',
    '& .MuiFormControl-root': {
      '& input': {},
      '&:hover': {
        background: 'transparent',
      },
    },
  },
  ChevronDownIcons: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      padding: '0',
      zIndex: '1',
    },
  },
  mapStyles: {
    width: '100%',
    height: '300px',
    borderRadius: '10px',
  },
  loaderWrapper: {
    position: 'absolute',
    right: '14px',
    top: '56.2%',
    transform: 'translateY(-50%)',
  },
  loadingState: {
    width: '24px',
    height: '24px',
    border: '3px dotted #146dff',
    borderStyle: 'solid solid dotted dotted',
    borderRadius: '50%',
    display: 'inline-block',
    position: 'relative',
    boxSizing: 'border-box',
    animation: '$rotation 2s linear infinite',
    '&:after': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      left: '0',
      right: '0',
      top: '0',
      bottom: '0',
      margin: 'auto',
      border: '3px dotted #146dff',
      borderStyle: 'solid solid dotted',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      animation: '$rotationBack 1s linear infinite',
      transformOrigin: 'center center',
    },
  },
  '@keyframes rotation': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  '@keyframes rotationBack': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100% ': {
      transform: 'rotate(-360deg)',
    },
  },
  customSearchColor: {
    backgroundColor: theme.palette.surfaceWhite,
    borderRadius: '8px',
    width: '225px !important',
    minWidth: '225px !important',
    height: '36px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    '&.MuiFormControl-root': {
      width: '225px !important',
      '& .MuiInputBase-root': {
        width: '225px !important',
        borderRadius: '8px',
        minWidth: '225px !important',
        '& .MuiOutlinedInput-notchedOutline': {
          width: '225px !important',

          minWidth: '225px !important',
        },
      },
    },
  },
  searchInputHeight: {
    '& .MuiInputBase-root': {
      height: '36px',
      backgroundColor: 'white',
      borderRadius: '8px',
    },
  },

  customDefaultSearch: {
    '&.MuiFormControl-root ': {
      width: '95px ',

      '& .MuiInputBase-root': {
        minWidth: '95px',
        width: '95px',
      },
    },
  },
}));
