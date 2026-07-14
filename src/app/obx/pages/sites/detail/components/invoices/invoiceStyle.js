import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  visitors: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  visitorsHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: '12px',
    paddingBottom: '24px',
    [theme.breakpoints.down('lg')]: {
      flexDirection: 'column',
      rowGap: '24px',
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

    '& div': {
      '& .MuiFormControl-root': {
        '& .MuiInputBase-root': {
          minWidth: '250px',
        },
      },
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
  franchiseNameText: {
    '& .MuiTypography-root': {
      color: '#444446',
      textTransform: 'capitalize',
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
  },

  addBannedVisitorBtn: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.textDisabled,
            },
          },
        },
      },
      '& .MuiButton-startIcon': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textPlaceholder,
          },
        },
      },
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

      '& svg': {
        '& > g': {
          '& path:nth-child(2)': {
            fill: theme.palette.textOnColor,
          },
        },
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
