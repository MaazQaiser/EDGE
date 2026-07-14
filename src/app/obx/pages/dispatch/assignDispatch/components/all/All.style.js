import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  tabInnerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
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
