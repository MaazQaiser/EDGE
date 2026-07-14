import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  InnerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',

    padding: '16px 24px 28px 24px',
  },
  footerButton: {
    display: 'flex',
    paddingTop: '16px',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  dayText: {
    margin: '8px 0px 20px 0px',
    '& span': {
      fontWeight: '500',
      color: theme.palette.textBrand,
    },
  },
  labelText: {
    '&.MuiTypography-root': {
      display: 'block',
      marginBottom: '8px',
    },
  },
}));
