import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  btnLocation: {
    '&.MuiButton-root': {
      marginLeft: '12px',
      marginRight: '12px',
    },
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '28px',
    gap: '24px',
  },
  sideBySideColEmail: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    marginBottom: '20px',
    gap: '24px',
  },
  fieldWrapper: {
    width: '100%',
  },
  bordered: {
    border: '1px solid #e6e6e7',
    borderRadius: '8px',
    padding: '3px 0px',
  },
  assignToradio: {
    margin: '24px 0px',
  },
  secondDropdown: {
    marginTop: '24px',
  },
  sidetitle: {
    color: '#000',
    fontSize: '16px ',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },
  marginTopBottom: {
    marginBottom: '10px',
    marginTop: '30px',
  },
  siderbarbox: {
    padding: '32px 24px',
    height: '100vh',
  },
  boxinner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideheader: {
    display: 'block',
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 8px 0 8px',
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginLeft: '0px',
      padding: '0',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      marginBottom: '0px',
    },
    '& .MuiButtonBase-root': {
      padding: '0',
      marginRight: 8,
    },
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
  },
  radioOption: {
    '& .MuiFormControlLabel-root': {
      marginLeft: '40px',
    },
  },
  marginBotm: {
    marginBottom: '30px',
  },
  fiftyWidth: {
    width: '48%',
  },
  dropHigh: {
    height: '44px',
  },
  placeHolderText: {
    fontSize: '16px !important',
    fontWeight: '400 !important',
    color: theme.palette.textPlaceholderField,
  },
  sideDrawerFooter: {
    marginTop: '0 !important',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  newLocationDrawerHeader: {
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  inlineLables: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noPadding: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
    },
  },
}));
