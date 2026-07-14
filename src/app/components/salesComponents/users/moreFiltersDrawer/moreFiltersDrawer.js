import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    padding: '24px 24px 0px 24px',
    height: '100vh',
  },
  textFiledFil: {
    height: '44px',
  },
  textFiledFilter: {
    height: '44px',
  },
  boxInner: {
    '&.MuiStack-root': {
      height: '100%',
    },
  },
  sideHeader: {
    display: 'block',
  },
  fieldWrapper: {
    marginBottom: '24px',
    '&  dropdownWrap': {
      height: '44px',
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
      marginBottom: '18px',
      padding: '0px',
    },
    '& svg': {
      width: '10px',
      height: '10px',
      marginLeft: '8px',
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
  createdDatePicker: {
    '& input': {
      fontSize: '16px !important',
      '&::placeholder': {
        fontSize: '16px !important',
      },
    },
  },
  marginBotom: {
    marginTop: '24px',
  },
  dropdownCommonSection: {
    '& .MuiFormControl-root.MuiTextField-root': {
      width: '100%',
    },
  },
}));
