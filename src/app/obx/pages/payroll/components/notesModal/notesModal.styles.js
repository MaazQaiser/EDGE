import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 604px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  rejectModalContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
      marginBottom: '16px',
    },
  },

  notesSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  notesArea: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  repateNotes: {
    marginBottom: '16px',
    position: 'relative',
    paddingLeft: '12px',

    '&:last-child': {
      marginBottom: 0,
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      width: '5px',
      height: '5px',
      borderRadius: '160px',
      backgroundColor: theme.palette.surfaceBrand,
      left: '0px',
      top: '8px',
    },
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
}));
