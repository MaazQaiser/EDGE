import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
    gap: '24px',
  },

  buttonsBarWrapper: {
    // padding: '15px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  questionBankActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  questionBankActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

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

    '& svg': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '0px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
