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
      width: '75%',
      height: '1px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  offierLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inlineValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
    '& .MuiAvatar-root': {
      width: '16px',
      height: '16px',
    },
  },
  chipAndText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  jobGrayBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '4px',
    marginBottom: '8px',
  },
  jobCheckbox: {
    '& .MuiTypography-root': {
      fontSize: '14px',
    },
    '& label.MuiFormControlLabel-root': {
      margin: '0px',
    },
  },
}));
