import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  zonesDetailContainer: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
  },
  topDetailComponentWrapper: {
    top: '0',
    width: '100%',
    marginLeft: '0',
  },
  sidebarSection: {
    maxWidth: '247px',
    borderRight: '1px solid #e6e6e7',
    overflow: 'auto',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '1px !important',
  },
  zonesContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    position: 'relative',
  },
  mainBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  generalInformation: {
    padding: '0px 24px 24px 24px',
  },
  mainWrapper: {
    padding: '16px 0',
    flex: '1',
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
  },
  tabsContent: {
    flex: '1',
    overflow: 'auto',
  },
}));
