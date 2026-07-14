import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  reportsListings: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1',
    paddingTop: '24px',
  },

  shiftRecordsNoRecord: {
    padding: '24px 0',
  },

  reportsListingsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '0 32px',

    // [theme.breakpoints.down('lg')]: {
    //   padding: '0 24px',
    //   flexDirection: 'column',
    // },
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
  },

  reportsListingsHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',

    // [theme.breakpoints.down('lg')]: {
    //   width: '100%',
    //   justifyContent: 'space-between',
    //   flexDirection: 'row-reverse',
    // },
  },

  reportsListingsFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  reportsListingsHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',

    // [theme.breakpoints.down('lg')]: {
    //   width: '100%',
    //   justifyContent: 'space-between',
    // },
  },

  reportsListingsHeaderRightDate: {
    width: '265px',
    '& .MuiBox-root ': {
      '& .MuiStack-root ': {
        '& .MuiFormControl-root ': {
          '& .MuiInputBase-root ': {
            height: '36px',
            minWidth: '265px',
          },
        },
      },
    },
  },

  reportsListingsHeaderRightSwitch: {
    '& .MuiToggleButtonGroup-root': {
      borderColor: theme.palette.borderSubtle1,
      borderWidth: '1px',
      borderRadius: '8px',
      borderStyle: 'solid',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px',
      '& .MuiToggleButton-root': {
        height: '30.4px',
        fontSize: '14px',
        lineHeight: '20px',
        fontWeight: '400',
        color: theme.palette.textDisabled,
        borderColor: theme.palette.borderSubtle2,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',

        '&:nth-child(1)': {
          border: 0,
        },
        '&:nth-child(2)': {
          border: 0,
          marginLeft: 0,
        },

        '&:nth-child(3)': {
          border: 0,
        },

        '& .MuiBox-root': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          lineHeight: '18px',
          fontWeight: '500',
          borderRadius: '16px',
          backgroundColor: theme.palette.surfaceAlertSubtle,
          color: theme.palette.textAlert,
          padding: '2px 8px',
        },

        '&.Mui-selected': {
          backgroundColor: theme.palette.surfaceBrand,
          color: theme.palette.textOnColor,
          borderColor: theme.palette.surfaceBrand,

          '& .MuiBox-root': {
            backgroundColor: theme.palette.surfaceBrandSubtle,
            color: theme.palette.textBrand,
          },
        },
      },
    },
  },

  reportsListingsAccordionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  reportsListingsAccordionTime: {
    padding: '4px 8px',
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  reportsListingsPagination: {
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px',
    },

    '& .MuiTablePagination-root': {
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  reportsListingsContent: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px',
    },

    '& .MuiPaper-root': {
      boxShadow: 'none',
      padding: '0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

      '&:last-child': {
        borderBottom: 0,
      },

      '&::before': {
        height: 0,
      },

      '&.MuiAccordion-rounded': {
        borderRadius: '0',
      },

      '&.Mui-expanded': {
        borderBottom: 'none',
        margin: '0',
      },

      '& .MuiCollapse-root': {
        '& .MuiAccordionDetails-root': {
          padding: '0',
        },
      },

      '& .MuiAccordionSummary-root': {
        flexDirection: 'row-reverse',
        gap: '10px',
        minHeight: 'auto',
        padding: '10px 24px',

        '& .MuiAccordionSummary-expandIconWrapper': {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: theme.palette.surfaceGreySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'rotate(180deg)',

          '&.Mui-expanded': {
            transform: 'rotate(0deg)',
          },
        },

        '& .MuiAccordionSummary-content': {
          justifyContent: 'space-between',
          gap: '10px',
          margin: 0,
          alignItems: 'center',
        },
      },
    },
  },

  noDataWrapper: {
    '& .MuiBox-root': {
      position: 'fixed !important',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      width: '100%',
      maxWidth: '439px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 458.4px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  reportsListingsAccordionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  functionalDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '8px',
    margin: '0 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '& [class*="MuiTab-root"]': {
      padding: '4px 6px !important',
      minWidth: 'unset',
      maxWidth: 'unset',
      fontWeight: 400,
      color: theme.palette.textPlaceholder,
      '&.Mui-selected': {
        color: theme.palette.textBrand,
        fontWeight: 500,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },

  tabContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        gap: '16px',
      },
    },
    '& .MuiTabs-scrollButtons': {
      width: '32px',
      height: '32px',
      minWidth: '32px',
      borderRadius: '50%',
      padding: '0',
      margin: '0 8px',
      marginTop: '6.5px',
      '& svg': {
        width: '20px',
        height: '20px',
        '& path': {
          stroke: theme.palette.textPlaceholder,
        },
      },
    },
  },

  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },

  franchiseName: {
    display: 'flex ',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  reportsTableTitle: {
    paddingRight: '10px !important',
    // minWidth: '380px',
    maxWidth: '380px',
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

  pointer: {
    cursor: 'pointer',
  },
}));
