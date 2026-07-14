import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '500px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
    [theme.breakpoints.down('768')]: {
      maxWidth: '90%',
      padding: '16px',
    },
    '& svg': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
      [theme.breakpoints.down('768')]: {
        width: '42px !important',
        height: '42px !important',
      },
    },
  },
  banModalBodyField: {
    marginTop: '20px',
  },
  banModalBodyFieldArea: {
    width: '100%',
    '& .MuiInputBase-root': {
      minWidth: '100%',
    },
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      marginTop: '4px',
      color: `${theme.palette.textPlaceholder}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      marginTop: '16px',
    },
  },
}));
