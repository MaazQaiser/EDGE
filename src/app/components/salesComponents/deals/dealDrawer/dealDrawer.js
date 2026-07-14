import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siderBarBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  sideHeader: {
    display: 'block',
    padding: '24px 32px 32px 24px',

    '& .MuiBox-root': {
      marginBottom: 0,
      paddingRight: 0,
    },
  },
  fieldWrapper: {
    width: '100%',
  },
  fiftyWidth: {
    width: '48%',
  },
  locationForm: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 20px 32px',
  },
  boxInner: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: '#262527',
      textTransform: 'capitalize',
      marginBottom: '18px',
    },
    '& svg': {
      width: '10px',
      height: '10px',
      marginLeft: '8px',
    },
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '24px',
  },
  approveTextBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: '32px',
    paddingBottom: '8px',
    '&:last-child': {
      borderBottom: 0,
      paddingBottom: 0,
    },
  },

  approveTextBoxTitle: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },

  additionalFieldBox: {
    margin: '32px 0 0 0',
    paddingBottom: '32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  companyFlex: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cLabel: {
    flex: '0 0 40%',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  compDetName: {
    flex: '0 0 60%',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
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
  sideDrawerFooter: {
    paddingLeft: '32px',
    paddingRight: '32px',
    marginTop: 0,
  },
  noMarginBottom: {
    marginBottom: 0,
  },
}));
