import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  templateActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  templateActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  templateActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& svg': {
      width: '16px',
      height: '16px',
    },

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& svg': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  templateActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  templateActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  templateActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& svg': {
      width: '16px',
      height: '16px',
    },
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  templateActionsIconRegular: {
    '& path': {
      stroke: theme.palette.textPlaceholder,
    },
  },

  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
