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
    marginBottom: '20px',
    gap: '24px',
  },

  locationsDivider: {
    '&.MuiDivider-root': {
      marginTop: '4px',
    },
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
    margin: '24px 0px 20px',
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
    marginBottom: '8px',
    marginTop: '24px',
  },
  siderbarbox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
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
    padding: '24px 32px 32px 24px',

    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 20px 32px',
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
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  newLocationDrawerHeader: {
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
      marginBottom: '6px',
    },
  },
}));
