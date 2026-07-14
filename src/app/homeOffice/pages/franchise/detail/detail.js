import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  franchisesDetailContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'auto',
  },

  topDetailComponentWrapper: {
    top: 0,
    width: '100%',
    marginLeft: 0,
  },

  sidebarSection: {
    maxWidth: '247px',
    borderRight: '1px solid #e6e6e7',
    overflow: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  franchisesContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  },

  mainBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  mainWrapper: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  tabContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        gap: '16px',
      },
    },
  },

  tabsContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  franchisesTabPanel: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '100%',
  },

  functionalDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '8px 32px 0',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& [class*="MuiTab-root"]': {
      padding: '4px 6px !important',
      minWidth: 'unset',
      maxWidth: 'unset',
      fontWeight: 400,
      color: theme.palette.textPlaceholder,
      '&.Mui-selected': {
        color: theme.palette.textBrand,
        fontWeight: 500,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },

  generalInformationClass: {
    padding: '0px !important',
  },
}));
