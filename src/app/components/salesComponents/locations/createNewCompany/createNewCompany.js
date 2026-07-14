import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  boxHeader: {
    margin: '0px 0px 24px 0px',
  },
  titlehead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sidetitle: {
    textAlign: 'left',
    color: '#102818',
    marginBottom: '0',
  },
  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  sidefooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  footerText: {
    display: 'flex',
    alignItems: 'center',
  },
  footerButtons: {
    display: 'flex',
    gap: '12px',
  },
  alterIcon: {
    width: '16px',
    height: '16px',
    marginRight: '5px',
  },
  converInner: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    margin: '24px 0px',
    padding: '20px 0px 5px 0px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: 'calc(100vh - 300px)',
    paddingRight: '10px',
  },
  sideBySideCol: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '20px',
  },
  marginBottomCol: {
    marginBottom: '24px',
  },
  fieldWrapper: {
    width: '100%',
  },
  dropHigh: {
    height: '44px ',
  },
  placeHolderSize: {
    '&.MuiTypography-root': {
      fontSize: '16px',
      color: theme.palette.textPlaceholderField,
    },
  },
  modalTextBlue: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,

      paddingLeft: '4px',
    },
  },
  inlineBoxIcons: {
    display: 'flex',
  },
  arrowIcons: {
    margin: '0px 12px',
    '& path': {
      stroke: '#000000',
    },
  },
  inlineIconsBox: {
    display: 'flex',
  },
  dealIcon: {
    '&.MuiSvgIcon-root': {
      width: '17px',
      height: '20px',
    },
  },
}));
