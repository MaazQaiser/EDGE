import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  drawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
  },

  name: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  signalLogo: {
    '&.MuiSvgIcon-root': {
      width: '125px',
      height: '37px',
    },
  },

  footerArea: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    padding: '8px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,

    width: '100%',
  },
  headerCol: {
    '& .MuiTypography-body2': {
      color: theme.palette.textSecondary1,
      LineHeight: '23px',
    },
  },
  headerArea: {
    padding: '60px 60px 0px 60px',
    width: '100%',
  },
  headerWrapper: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginBottom: '24px',
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  dutyInformationDropdownOfficer: {
    height: '44px',
    '& div': {
      '&  div': {
        '&  .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },
  fieldColms: {
    display: 'flex',
    gap: '8px',
    paddingBottom: '24px',
    width: '100%',
    flexDirection: 'column',
    marginRight: 'auto',
  },
  colmData: {
    width: '500px',
    display: 'flex',
    justifyContent: 'space-between',
    '&:first-child , & h6.MuiTypography-root , & .MuiTypography-body2': {
      width: '225px',
    },
  },
  contentArea: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
    padding: '0px 60px 0px 60px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      marginTop: '12px',
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
  },
  padTop: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
  },
  tableWrapper: {
    width: '100%',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    paddingTop: '24px',
  },
  inlineTD: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '334px',
    paddingBottom: '6px',
    paddingTop: '6px',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  footerColms: {
    marginTop: '24px',
    width: 'fit-content',
    marginLeft: 'auto',
    marginBottom: '24px',
  },
}));
