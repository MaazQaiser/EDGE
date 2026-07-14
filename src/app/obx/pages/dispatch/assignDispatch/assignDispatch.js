import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  assignDispatchWrap: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
  },
  assignDispatchLeft: {
    display: 'flex',
    overflow: 'auto',
    flex: '1',
    flexDirection: 'column',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    paddingLeft: '1px',
    justifyContent: 'space-between',
  },
  assignDispatchRight: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    flexDirection: 'column',
    [theme.breakpoints.down(768)]: {
      display: 'none',
    },
  },
  mapArea: {
    backgroundColor: '#f9f5ed',
    width: '100%',
    height: '500px',
  },
  bottomButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
  },
}));
