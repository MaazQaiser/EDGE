import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  hourFiled: {
    textAlign: 'center',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      width: '85px',
      color: theme.palette.textSecondary3,
      minWidth: '70px',
      height: '32px',
      fontSize: '14px',
      padding: '8px 14px',
      '& .MuiInputBase-input': {
        textAlign: 'center',
        fontSize: '14px',
        color: theme.palette.textSecondary3,
      },
    },
  },

  centerBox: {
    textAlign: 'center',

    '& .MuiFormControl-root.MuiTextField-root': {
      minWidth: '130px',
      maxWidth: '130px',
    },
    '& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.MuiInputBase-formControl':
      {
        minWidth: '130px',
        maxWidth: '130px',
      },
  },
  popverWrapper: {
    '& .MuiPopover-paper': {
      width: '282px',
      BorderRight: '8px',
    },
  },
  popContent: {
    padding: '16px 16px 0px 16px',
  },
  boxSpace: {
    margin: '10px 0px',
    '& .MuiFormControl-root.MuiTextField-root': {
      minWidth: 'auto',
    },
  },
  popFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '10px',
    margin: '0px 16px 16px 16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
}));
