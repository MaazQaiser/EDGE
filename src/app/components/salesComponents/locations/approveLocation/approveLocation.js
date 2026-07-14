import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  btnLocation: {
    '&.MuiButton-root': {
      marginLeft: '12px',
      marginRight: '12px',
    },
  },

  fieldWrapper: {
    width: '100%',
  },
  modalBottomArea: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    '& button.MuiButtonBase-root': {
      maxWidth: '112px',
      width: '100%',
    },
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
  sideBarBox: {
    padding: '24px 32px',
    height: '100vh',
  },
  boxinner: {
    height: '100%',
  },
  sideheader: {
    display: 'block',
  },

  marginBotm: {
    marginBottom: '30px',
  },
  companyFlex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cLabel: {
    flex: '0 0 30%',
    border: '0',
    padding: '8px 0px',
    color: '#6a6a70',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    textTransform: 'capitalize',
    paddingBottom: '0',
  },
  compDetName: {
    flex: '0 0 70%',
    border: '0',
    padding: '8px 0px',
    color: '#262527',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '20px',
    textTransform: 'capitalize',
    paddingBottom: '0',
    wordBreak: 'break-word',
  },
  approveTextBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '32px',
    paddingBottom: '10px',
  },
  sideFooter: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
    marginTop: '16px',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));
