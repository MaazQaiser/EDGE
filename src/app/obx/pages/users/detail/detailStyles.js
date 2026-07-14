import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  detailContainer: {
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

  topDetailComponentWrapper: {
    top: 0,
    width: '100%',
    marginLeft: 0,
  },

  sidebarSection: {
    maxWidth: '300px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    overflow: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '1px !important',
  },

  mainWrapper: {
    padding: 0,
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

    '& .calendar-container .fc .fc-view-harness-active > .fc-view': {
      height: 'calc(100vh - 360px)',
    },

    '& .calendar-container .fc .fc-scrollgrid': {
      height: 'calc(100vh - 360px)',
    },
  },

  tabPanelContent: {
    padding: '0 0 24px 0',
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
      height: 'calc(100vh - 372px)',
    },

    '& .fc .fc-view-harness-active > .fc-view': {
      height: 'calc(100vh - 372px)',
    },
  },
}));
