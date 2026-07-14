import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  locationWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingBottom: 0,
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '24px',
  },

  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  tableComponent: {
    position: 'relative',
    '& th:nth-child(2), & td:nth-child(2)': {
      position: 'sticky',
      left: '150px',
      zIndex: 1,
      backgroundColor: theme.palette.surfaceWhite,
    },
  },

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

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& .MuiSvgIcon-root': {
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

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  templateActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
}));
