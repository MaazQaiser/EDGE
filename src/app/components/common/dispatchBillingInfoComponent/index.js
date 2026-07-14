import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  inlineBtnsCols: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  fieldWrapper: {
    flex: '1 1 25%',
    '& label.MuiFormLabel-root': {
      alignItems: 'center',
    },
  },
  siteDetaisFields: {
    display: 'flex',
    gap: '20px',
    margin: '16px 0px',
  },
  dropdownWraps: {
    height: '44px',
    fontSize: '16px',
    fontWeight: '400',
  },
  dropdownWrap: {
    height: '44px !important',
  },
  invalidFeedback: {
    display: 'block',
    color: '#b32318',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '20px',
    textAlign: 'left',
    marginTop: '6px',
    textTransform: 'lowercase',
    '&::first-letter': {
      textTransform: 'capitalize',
    },
  },
  placeHolderColor: {
    color: `${theme.palette.textPlaceholderField} !important`,

    fontSize: '16px !important',
    fontWeight: '400 !important',
  },
}));
