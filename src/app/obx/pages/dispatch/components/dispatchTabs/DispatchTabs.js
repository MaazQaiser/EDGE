import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTops: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '20px 24px',
    },
    [theme.breakpoints.down(768)]: {
      padding: '8px 16px 0 16px',
    },
  },
  userSection: {
    display: 'flex',
    gap: '16px',
    height: '100%',
  },
  invoicesDateRange: {
    width: '265px',
    position: 'relative',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },
  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    padding: '20px 0px',
    [theme.breakpoints.down(768)]: {
      padding: '16px 0',
    },
    '& .MuiTabs-root': {
      minHeight: '34px',
    },
    '& .MuiTabs-scroller': {
      '& .MuiButtonBase-root': {
        padding: '0px',
        minWidth: 'auto',
        marginRight: '16px',
        minHeight: 'auto',
        [theme.breakpoints.down(786)]: {
          marginRight: '10px',
        },
        color: theme.palette.textPlaceholder,
        '&.Mui-selected': {
          color: theme.palette.textBrand,
        },
      },
      '& span.MuiTabs-indicator': {
        backgroundColor: theme.palette.textBrand,
      },
    },
  },
  tabContent: {
    padding: '20px 32px',
    [theme.breakpoints.down(768)]: {
      padding: '8px 16px !important',
    },
    [theme.breakpoints.down('lg')]: {
      padding: '20px 24px',
    },
    '& > div': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
    },
  },
}));
