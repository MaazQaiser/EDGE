import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  rejectModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    borderRadius: '12px',
    padding: '24px',
  },

  rejectModalContent: {
    marginTop: '20px',
  },

  rejectModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  rejectModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  rejectModalActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  rejectModalField: {
    marginTop: '20px',
  },

  rejectModalTextField: {
    width: '100%',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      padding: '0px',
    },
    '& .MuiInputBase-root': {
      '& .MuiInputBase-input': {
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
        height: '145px !important',
        padding: '10px 14px !important',
        overflowY: 'scroll !important',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },

        '&::-webkit-scrollbar-track': {
          boxShadow: 'none',
        },

        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(128, 128, 128, 0.4)',
          borderRadius: '10px',
        },

        '&:hover': {
          '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'grey',
          },
        },
        '&::placeholder': {
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '20px',
        },
      },
    },
  },
}));
