import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  banModalBody: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '600px',
    padding: '24px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
  },

  banModalBodyTitle: {
    '&.MuiTypography-root': {
      marginTop: '20px',
      color: theme.palette.textPrimary,
    },
  },

  banModalBodyText: {
    '&.MuiTypography-root': {
      marginTop: '8px',
      color: theme.palette.textPlaceholder,
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

  banModalBodyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
  },

  reasonCharacterLimit: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  addBannedHelperText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
