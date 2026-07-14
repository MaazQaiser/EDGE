import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  moreFilterHeader: {
    marginBottom: '0px !important',
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
    padding: '6px 24px 16px 24px',
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

  moreFilterFooter: {
    marginTop: 0,
    padding: '24px 0px',
    marginLeft: '24px',
    marginRight: '24px',
  },

  checkBoxPoint: {
    display: 'flex',
    alignItems: 'center',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '-8px',
    marginBottom: '10px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
