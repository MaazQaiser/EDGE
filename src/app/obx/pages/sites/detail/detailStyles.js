import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  siteDetailContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'auto',
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

  siteAlert: {
    '&.MuiAlert-root': {
      borderRadius: '0',
      padding: '8px 16px',
    },

    '& .MuiAlert-icon': {
      padding: '0',
      fontSize: '20px',
    },

    '& .MuiAlert-message': {
      padding: '0',
    },
  },

  topDetailComponentWrapper: {
    top: 0,
    width: '100%',
    marginLeft: 0,
  },

  sidebarSection: {
    maxWidth: '247px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    overflow: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '1px !important',
  },

  mainWrapper: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
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

  tabContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        gap: '16px',
      },
    },
    '& .MuiTabs-scrollButtons': {
      width: '32px',
      height: '32px',
      minWidth: '32px',
      borderRadius: '50%',
      padding: '0',
      marginTop: '6.5px',
      '& svg': {
        width: '20px',
        height: '20px',
        '& path': {
          stroke: theme.palette.textPlaceholder,
        },
      },
    },
  },
  tabsContent: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',

    '& .schedules': {
      padding: 0,
    },

    '& .schedules .schedules-header': {
      paddingTop: '24px',
    },
  },

  contractsTabPanelContent: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
  },

  tabPanelContent: {
    // padding: '0 0 24px 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
  },

  sitesTabPanel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  dutySite: {
    paddingBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',

    '& .fc .fc-scrollgrid': {
      height: 'calc(100vh - 372px) !important',
      overflow: 'auto !important',
    },

    '& .fc .fc-view-harness-active > .fc-view': {
      height: 'calc(100vh - 372px) !important',
    },
  },

  dutySiteAlert: {
    '& .fc .fc-scrollgrid': {
      height: 'calc(100vh - 398px)',
    },

    '& .fc .fc-view-harness-active > .fc-view': {
      height: 'calc(100vh - 398px)',
    },
  },
  topAlert: {
    '&.MuiAlert-root': {
      backgroundColor: theme.palette.surfaceAlertStrong,
      display: 'flex',
      padding: '6px 32px',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      borderRadius: '0px',
      '& .MuiAlert-message': {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        margin: '0px',
        padding: '0px',
        justifyContent: 'space-between',
        width: '100%',
      },
    },
  },
  alertText: {
    '&.MuiTypography-root': {
      color: theme.palette.surfaceWhite,
    },
  },
}));
