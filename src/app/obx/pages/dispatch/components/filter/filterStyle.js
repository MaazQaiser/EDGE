import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  sideHeader: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '24px 24px 10px',
  },

  topFilterBtn: {
    display: 'flex',
    flexDirection: 'column',
  },

  filedArea: {
    padding: '0 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
  },

  sideHeaderTop: {
    '&.MuiStack-root': {
      marginBottom: '16px',
    },
  },

  marginBotom: {
    marginTop: '16px',
  },
  buttonStacks: {
    display: 'flex',
    gap: '10px',
  },
  sideFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 0px',
    margin: '24px 24px 0px 24px',
  },

  dropHigh: {
    height: '42px',
  },
  moreFilterForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '6px 24px 16px 24px',
  },

  clearAll: {
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
  },

  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent !important',
        color: theme.palette.textPrimary,
      },
      '& svg': {
        marginLeft: '6px',
      },
    },
  },

  redCircle: {
    width: '12px',
    height: '12px',
    fontSize: '7.5px',
    marginLeft: '6px',
    color: theme.palette.textOnColor,
    backgroundColor: theme.palette.surfaceAlertStrong,
    borderRadius: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spaceBtn: {
    color: `${theme.palette.textPrimary} !important`,
    '& svg': {
      marginLeft: '8px',
      padding: '0px',
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
    },
  },
  cancelBtn: {
    cursor: 'pointer',
    '& svg': {
      width: '24px',
      height: '24px',
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },
  lastActivityDatePicker: {
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
  },
  createdDatePicker: {
    '& input': {
      fontSize: '14px !important',
      '&::placeholder': {
        fontSize: '14px !important',
      },
    },
  },
}));
