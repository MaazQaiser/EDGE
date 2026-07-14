import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
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

      '& .MuiSvgIcon-root': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  // contractsTableBody: {
  //   '&.MuiTableBody-root': {
  //     '&:hover': {
  //       backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
  //       '& td[rowspan]': { backgroundColor: `${theme.palette.surfaceGreySubtle} !important` },
  //     },
  //   },
  // },

  contractNotSpan: {
    '&.MuiTableCell-root': {
      position: 'static !important',
      fontWeight: '400 !important',
      color: `${theme.palette.textSecondary3} !important`,
    },
  },

  contractTableCell: {
    '&.MuiTableRow-root': {
      // '& .MuiTableCell-root:nth-child(2)': {
      //   position: 'static !important',
      //   fontWeight: '400 !important',
      //   color: `${theme.palette.textSecondary3} !important`,
      // },
    },
    // '&.MuiTableRow-root': {
    //   '& tr:not([rowspan])': {
    //     '& .MuiTableCell-root:first-child': {
    //       position: 'static !important',
    //       fontWeight: '400 !important',
    //       color: `${theme.palette.textSecondary3} !important`,
    //     },
    //   },
    // },
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

  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  cursorPointer: {
    cursor: 'pointer',
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },
  contractsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingTop: '8px',
    paddingBottom: '8px',
  },

  collapseContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',

    '& .MuiPaper-root': {
      boxShadow: 'none',
      padding: '0',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '0 !important',

      '&:last-child': {
        borderBottom: 0,
      },

      '&::before': {
        height: 0,
      },

      // '& .MuiButtonBase-root ': {
      //   padding: '0 !important',
      //   display: 'flex',
      //   flexDirection: 'row-reverse',
      //   gap: '8px',
      // },

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
        padding: '16px 24px',

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
          flex: '1',
        },
      },
    },

    // '& .MuiTableCell-root': {
    //   borderBottom: 0,
    // },
  },
  accordianWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: '16px',
  },

  chipWrapper: {
    display: 'flex',
    gap: '4px',
  },

  titleWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },

  Title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    [theme.breakpoints.down('lg')]: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  },

  timeSpan: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
      textAlign: 'center',
      borderRadius: '8px',
      background: theme.palette.surfaceGreySubtle,
      padding: '4px 8px',
    },
  },

  jobType: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}));
