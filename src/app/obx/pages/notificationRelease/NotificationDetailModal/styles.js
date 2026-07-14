import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    '&.MuiPaper-root ': {
      borderRadius: '12px',
      padding: '20px',
      minHeight: '220px',
      display: 'flex',
      flexDirection: 'column',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    '&.MuiTypography-root': {
      fontWeight: 700,
      color: theme.palette.textPrimary,
    },
  },
  closeButton: {
    '&.MuiIconButton-root': {
      padding: '4px',
    },
  },
  body: {
    flex: 1,
    paddingBottom: '24px',
    overflow: 'auto',
    minHeight: '100px',
    height: '100%',
    maxHeight: '300px',
  },

  bodySkeleton: {
    flex: 1,
    padding: '24px 0',
  },
  messageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      lineHeight: 1.6,
    },
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '16px',
  },
  statusChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  createdBySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    paddingLeft: '16px',
  },
  createdByLabel: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: 500,
      lineHeight: '20px',
      color: theme.palette.textPlaceholder,
    },
  },
  avatar: {
    '&.MuiAvatar-root': {
      width: 16,
      height: 16,
      fontSize: 8,
    },
  },
  createdByText: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: 400,
      fontStyle: 'italic',
      lineHeight: '20px',
      color: theme.palette.textSecondary2,
    },
  },
}));
