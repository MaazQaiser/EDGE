import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  viewDetailModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 600px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px',
  },

  viewDetailModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  viewDetailModalList: {
    display: 'flex',
    gap: '6px',
  },

  viewDetailModalCircle: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: theme.palette.surfaceBrand,
    marginTop: '7px',
  },

  viewDetailModalListTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  viewDetailModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  viewDetailModalListText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '16px',
      width: '16px',
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },

  viewDetailModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
}));
