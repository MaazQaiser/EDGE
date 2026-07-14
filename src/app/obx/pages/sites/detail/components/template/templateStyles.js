import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  visitors: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingTop: '24px',
  },

  visitorsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '12px',
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingBottom: '24px',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      rowGap: '24px',
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  visitorsTable: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  visitorsHeaderSearch: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '12px',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      order: 2,
      justifyContent: 'space-between',
    },
  },

  visitorsHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '12px',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      justifyContent: 'space-between',
    },
  },

  visitorsHeaderSearchField: {
    maxWidth: '220px',
  },

  SitesTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  addBannedVisitorBtn: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.textOnColor,
            },
          },
        },
      },
      '& .MuiButton-startIcon': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textOnColor,
          },
        },
      },
    },
  },

  simpleList: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& .MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,

      '& .MuiTypography-root': {
        color: theme.palette.textSecondary2,
      },

      // '& path': {
      //   fill: theme.palette.textSecondary2,
      // },
    },
  },

  visitorsActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
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
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& path': {
        fill: theme.palette.textOnColor,
      },
    },
  },

  visitorsDateRange: {
    width: '265px',
    '& .MuiStack-root': {
      '& div': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '265px',
            height: '36px',
          },
        },
      },
    },
  },
}));
