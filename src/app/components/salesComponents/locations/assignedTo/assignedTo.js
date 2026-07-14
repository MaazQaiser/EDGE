import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  fieldWrapper: {
    width: '100%',
  },
  assignToradio: {
    margin: '24px 0px',
  },
  secondDropdown: {
    marginTop: '10px',
    marginBottom: '20px',
  },
  sideTitle: {
    color: theme.palette.textPrimary,
  },
  sideBarBox: {
    padding: '24px 24px 0px 24px',
    height: '100vh',
    width: '742px',
  },
  boxInner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  sideheader: {
    display: 'block',
  },
  radioWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    '& .MuiFormControlLabel-root': {
      marginRight: '143px',
    },
    '& .MuiTypography-root': {
      fontSize: '14px',
      color: theme.palette.textPrimary,
    },
  },

  marginBotm: {
    marginBottom: '30px',
  },

  dropHigh: {
    height: '44px !important',
    '& > :nth-child(2)': {
      width: '100%',
    },
  },
  divideColor: {
    '&.MuiDivider-root': {
      borderColor: theme.palette.borderSubtle1,
    },
  },
  radioOption: {
    '&.MuiFormControl-root': {
      marginTop: '16px',
      width: '100%',
      marginLeft: '0px',
      marginBottom: '12px',
    },
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      marginLeft: '0px',
    },
    '& .MuiFormControlLabel-root': {
      marginRight: '140px',
    },
    '& .MuiButtonBase-root': {
      paddingBottom: '0px ',
      paddingTop: '0px',
    },
  },
}));
