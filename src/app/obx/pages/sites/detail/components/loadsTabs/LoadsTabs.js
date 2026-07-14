import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  visitorsTab: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingTop: '24px',
  },

  visitorsTabsContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  visitorsTabs: {
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  customTabBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  visitorsTabTitle: {
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  tabPanals: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    '& > .MuiBox-root': {
      padding: '0px',
    },
  },
  tabButtons: {
    '&.MuiTabs-root': {
      marginTop: '16px',
      minHeight: 'auto',
    },
    '& .MuiTabs-flexContainer': {
      gap: '8px',
    },
    '& .MuiButtonBase-root': {
      background: '#F5F5F6',
      minHeight: '22px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '18px',
      fontWeight: '500',
      color: '#6A6A70',
      padding: '2px 8px',
      '&.Mui-selected': {
        background: '#E5F6FF',
        color: '#146DFF',
      },
    },
    '& span.MuiTabs-indicator': {
      display: 'none',
    },
  },
}));
