import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  searchdrop: {
    '& .MuiOutlinedInput-root': {
      '& .MuiAutocomplete-input': {
        padding: 0,
      },
    },
  },
  inputBase: {
    borderRadius: 8,
    padding: '7px 14px',
  },
  breadcrumbSeparator: {
    '& li.MuiBreadcrumbs-separator.css-1wuw8dw-MuiBreadcrumbs-separator': {
      display: 'none',
    },
    '& li.MuiBreadcrumbs-li': {
      borderRadius: '100px',
      background: theme.palette.grey[50],
      marginRight: '10px',
      marginTop: '10px',
      '& span': {
        color: theme.palette.grey[300],
        fontFamily: theme.typography.fontFamily,
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '20px',
      },
    },
  },
  mb24: {
    marginTop: '24px',
  },
  chip: {
    '& .MuiButtonBase-root.MuiChip-root.MuiChip-filled': {
      backgroundColor: 'transparent',
    },
  },
  inputPlaceholder: {
    '& input::placeholder': {
      opacity: 1,
      color: theme.palette.grey[300],
      fontFamily: theme.typography.fontFamily,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px' /* 142.857% */,
    },
  },
}));
