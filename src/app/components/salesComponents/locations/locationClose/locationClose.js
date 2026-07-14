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
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
      marginLeft: '-5px',
    },
  },
  stageDropdwon: {
    marginTop: '10px',
  },
  spaceBelow: {
    '&.MuiTypography-root': {
      marginBottom: '8px',
    },
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      // width: '100%',
      height: '40px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPlaceholder}`,
    },
  },
}));
