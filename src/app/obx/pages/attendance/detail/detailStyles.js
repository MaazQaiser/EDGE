import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
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
    maxWidth: '247px',
    borderRight: '1px solid #e6e6e7',
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
  functionaldiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '0 32px',
    flex: 'unset',
    borderBottom: '1px solid #e6e6e7',
    '& .MuiTab-root': {
      padding: '0 8px !important',
      minWidth: 'unset',
      maxWidth: 'unset',
    },
  },
  tabContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        overflow: 'auto',
      },
    },
  },
  tabsContent: {
    flex: 1,
    overflow: 'auto',
  },
  tabPanelContent: {
    padding: '24px 32px',
  },
}));
