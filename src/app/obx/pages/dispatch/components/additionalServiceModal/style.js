import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '691px',
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
  headText: {
    '&.MuiTypography-root': {
      marginBottom: '16px',
    },
  },
  inlineButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '28px',
    borderTop: `1px solid #e6e6e7`,
    paddingTop: '24px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },

  errorMessage: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));
