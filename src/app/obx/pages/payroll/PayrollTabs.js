import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: '0',
      width: '73%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  lockedPayrollTabButtonTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: '0',
      width: '83%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
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
    padding: '20px 32px',
    '& .MuiTabs-root': {
      minHeight: '34px',
    },
    '& .MuiTabs-scroller': {
      '& .MuiButtonBase-root': {
        padding: '0px',
        minWidth: 'auto',
        marginRight: '16px',
        minHeight: 'auto',
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
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& > div': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
    },
  },
  chindapdum: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
}));
