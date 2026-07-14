import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  conditionDetailsWrapper: {
    width: '100%',
    display: 'flex',
    paddingBottom: '16px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    gap: '16px',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  conditionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },

  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  value: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  conditionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  templateActions: {
    '& .MuiPaper-root': {
      width: '182px',
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

  templateActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  templateActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textSecondary2,
      },
    },
  },
  visitorsActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& .MuiTypography-root': {
      color: theme.palette.borderAlert,
    },

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },
}));
