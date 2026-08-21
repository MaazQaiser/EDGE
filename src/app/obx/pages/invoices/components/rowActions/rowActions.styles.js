import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },

  iconButton: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '32px',
      width: '32px',
      minWidth: '32px',
      borderRadius: '6px',
    },
    '& .MuiButton-icon': { margin: '0px' },
    '& svg': { height: '32px', width: '32px' },
  },

  // A disabled control at 0.5. The old payments asset baked a second `opacity="0.5"`
  // into the SVG itself, so the disabled state compounded to 25% and the feature's
  // main affordance was all but invisible.
  iconButtonMuted: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '32px',
      width: '32px',
      minWidth: '32px',
      opacity: 0.5,
      borderRadius: '6px',
    },
    '& .MuiButton-icon': { margin: '0px' },
    '& svg': { height: '32px', width: '32px' },
  },

  moreButton: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '32px',
      width: '28px',
      minWidth: '28px',
      borderRadius: '6px',
      '&:hover': { background: theme.palette.surfaceGreySubtle },
    },
    '& .MuiButton-icon': { margin: '0px' },
    '& svg': { height: '20px', width: '20px' },
  },

  menu: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      minWidth: '208px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    },
    '& .MuiMenuItem-root': {
      fontSize: '14px',
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
      padding: '8px 12px',
      gap: '2px',
    },
  },

  menuIcon: {
    '&.MuiListItemIcon-root': { minWidth: '28px' },
    '& svg': { height: '20px', width: '20px' },
  },

  destructive: { '&.MuiMenuItem-root': { color: theme.palette.textAlert } },
}));
