import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tabInnerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  jobCheckbox: {
    '& .MuiTypography-root': {
      fontSize: '14px',
      [theme.breakpoints.down(768)]: {
        fontSize: '12px',
      },
    },
    '& label.MuiFormControlLabel-root': {
      margin: '0px',
    },
  },
  noRecordFoundText: {
    [theme.breakpoints.down(768)]: {
      fontSize: '12px',
    },
  },
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    '& svg': {
      [theme.breakpoints.down(768)]: {
        width: '80px',
        height: '80px',
      },
    },
  },
}));
