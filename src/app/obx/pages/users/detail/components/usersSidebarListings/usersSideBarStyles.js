import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  searchComponentWrapper: {
    padding: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& .MuiFormControl-root.MuiTextField-root': {
      width: '100%',
    },
  },

  detailSideList: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0 !important',
    '& .MuiButtonBase-root ': {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      '& .MuiListItemText-root': {
        margin: 0,
        '& .MuiTypography-root ': {
          color: theme.palette.textPrimary,
          textTransform: 'capitalize',
        },
      },
    },
  },

  listUserType: {
    '&.MuiTypography-root ': {
      color: `${theme.palette.textPlaceholder} !important`,
    },
  },

  customScroll: {
    height: 'calc(100vh - 100px)',
    overflowY: 'auto',
    '&:hover': {
      // overflowY: 'auto',xs
    },
  },

  sidebarList: {
    width: '100%',
    bgcolor: theme.palette.surfaceWhite,
    '&.MuiList-root': {
      padding: '0px',
    },
    '& .MuiListItem-root': {
      '& .MuiButtonBase-root': {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      },
    },
  },

  listItemText: {
    borderRadius: '4px',
    background: '#F5F5F6',
    padding: '0px 4px',
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },

  statusBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  activeListItem: {
    background: theme.palette.textPrimary,
    color: theme.palette.textOnColor,
    '& .MuiButtonBase-root': {
      '& .MuiListItemText-root': {
        '& .MuiTypography-root': {
          color: 'inherit !important',
        },
        '& .MuiBox-root': {
          color: theme.palette.textOnColor,
        },
      },
      '& .listItemText': {
        borderRadius: '4px',
        background: 'red',
        padding: '10px 10px',
        '& .MuiTypography-root': {
          color: 'red',
        },
      },
    },
  },
  statesButtons: {
    marginBottom: '16px',
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
      fontSize: '12px',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },
  userSection: {
    display: 'flex',
    gap: '10px',
    height: '50%',
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
