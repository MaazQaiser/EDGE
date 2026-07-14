import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 500px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      minWidth: 'fit-content',
      padding: 0,
      marginLeft: 'auto',

      '&:hover': {
        background: 'transparent',
      },
    },
  },
  innerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    '& .MuiInputBase-root.MuiOutlinedInput-root , & .MuiFormControl-root.MuiTextField-root': {
      minWidth: '100%',
    },
  },
  rejectModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },
}));
