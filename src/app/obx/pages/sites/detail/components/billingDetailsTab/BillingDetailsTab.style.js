import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  visitorsTab: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
    gap: '24px',
  },
  fieldWrapperInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flex: '1 1',
  },
  dropHight: {
    height: '44px !important',
    maxWidth: '345px',
    flex: '1 1 345px',
  },
  placeHolderSize: {
    '&.MuiTypography-root': {
      fontSize: '16px',
      fontWeight: '400',
    },
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  checkBoxText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  tabheading: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },
  internalMapBox: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16px 0px 16px 0px',

    margin: '24px 32px 0px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  sideTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0',
    },
  },
}));
