import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  contractsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',

    // margin: '0 32px',
    // paddingTop: '14px',
    // paddingBottom: '14px',
  },
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
    marginTop: '12px',
    maxWidth: '268px',
    marginLeft: 'auto',
    marginRight: 'auto',
    textAlign: 'center',
    ' & svg': {
      width: '80px',
      height: '88px',
    },
    '& .MuiTypography-caption': {
      color: theme.palette.textPlaceholder,
    },
    '& h6.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '14px',
      marginBottom: '4px',
    },
  },
  jobsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 0 24px',
    margin: '0 32px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  assignIcon: {
    '& svg': {
      width: '56px',
      height: '56px',
    },
  },
  jobsSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    margin: '0 32px',
    padding: '14px 0',
    [theme.breakpoints.down('lg')]: {
      margin: '0 24px',
    },

    '& .MuiBox-root': {
      '& .MuiPaper-root': {
        '& .MuiButtonBase-root': {
          paddingLeft: 0,
          paddingRight: 0,
        },
      },
    },
  },

  collapseContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px',
    scrollbarGutter: 'stable both-edges',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },

    // height: 'calc(100dvh - 56px)',

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
        padding: '16px 0',
        alignItems: 'baseline',
        cursor: 'default !important',

        '& .MuiAccordionSummary-expandIconWrapper': {
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: theme.palette.surfaceGreySubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer !important',
          top: '2.5px',
          position: 'relative',
          transform: 'rotate(180deg)',

          '&.Mui-expanded': {
            transform: 'rotate(0deg)',
          },
        },

        '& .MuiAccordionSummary-content': {
          margin: 0,
          flexDirection: 'column',
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
    flexDirection: 'column',
    width: '100%',
    gap: '16px',
  },

  accordianBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  accordianBodyWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    left: '-30px',
  },

  accordianBodyBottom: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    left: '-30px',
  },

  accordianBodyContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    '& .MuiTypography-body2': {
      maxWidth: '200px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  chipWrapper: {
    display: 'flex',
    gap: '4px',
  },

  titleWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  rightArea: {
    display: 'flex',

    alignItems: 'center',
    gap: '12px',
  },
  titleWrapperLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  accordianTimeDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '3px 16px',
    borderRadius: '16px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    color: theme.palette.textSecondary3,
  },

  accordionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    [theme.breakpoints.down('lg')]: {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  },

  accordianBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  jobsSplitIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: theme.palette.surfaceGreySubtle,
    cursor: 'pointer',

    '& svg': {
      width: '16px',
      height: '16px',
      fill: theme.palette.textPrimary,
    },
  },

  accordianBodyText: {
    color: theme.palette.textSecondary1,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  functionalStatus: {
    display: 'flex',
    padding: '2px 8px 2px 6px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '16px',
    background: theme.palette.surfaceSuccessSubtle,
    width: 'fit-content',
    '&.MuiTypography-root': {
      color: theme.palette.textSuccess,
    },
    '& svg': {
      width: '12px',
      height: '12px',
    },
  },

  requireStatus: {
    display: 'flex',
    padding: '2px 8px 2px 6px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '16px',
    background: theme.palette.surfaceAlertSubtle,
    width: 'fit-content',
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
    '& svg': {
      width: '12px',
      height: '12px',
    },
  },

  SitesTD: {
    paddingRight: '10px !important',
    cursor: 'pointer',
    minWidth: '200px',
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
  aletIcon: {
    width: '18px',
    height: '18px',
  },
  shiftScheduleCancelledInfoIcon: {
    width: '16px',
    height: '16px',
    color: '#146DFF',
    flexShrink: 0,
  },
  franchiseName: {
    gap: '4px',
    display: 'flex !important',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  accordianTablePagination: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    margin: '0 32px',
  },

  tableRowNew: {
    '&.MuiTableRow-root': {
      '& .MuiTableCell-root': {
        borderBottom: '0',
      },
      '&:last-of-type': {
        // target the last table row
        '& .MuiTableCell-root': {
          borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
        },
      },
    },
  },

  expandClass: {
    background: 'red',
    '&.MuiTableCell-root': {
      padding: '0 12px !important',
      width: '60px',
      margin: '0 auto',
      '&:has(button)': {
        borderBottom: 0,
      },
    },
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '210px',
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
  templateActionsTextRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  templateActionsIconRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
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
          stroke: '#fff',
        },
      },
    },
  },
  questionBankActionsTextDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
    '&:hover': {
      '& svg': {
        '& path': {
          stroke: '#fff',
        },
      },
    },
  },

  deleteShiftInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',

      '& path': {
        stroke: '#DF372B',
      },

      '&:hover': {
        '& svg': {
          '& path': {
            stroke: '#fff',
          },
        },
      },
    },
  },

  cursorPointer: {
    cursor: 'pointer',
  },

  deletejobShiftModal: {
    backgroundColor: '#fff',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '517px',
    padding: '24px',
    borderRadius: '12px',
    background: theme.palette.surfaceWhite,
    boxShadow: `
      0px 8px 8px -4px rgba(16, 24, 40, 0.04),
      0px 20px 24px -4px rgba(16, 24, 40, 0.1)`,
  },
  modalTitle: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary} !important`,
      fontFamily: 'inherit',
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: '24px',
      textAlign: 'left',
      padding: 0,
    },
  },
  modalDescription: {
    '&.MuiTypography-root': {
      fontFamily: 'inherit',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
      color: `${theme.palette.textSecondary3} !important`,
      textAlign: 'left',
      marginBottom: '16px',
    },
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  modalBody: {
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '547px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  deletIcon: {
    marginBottom: '4px',
  },
  range: {
    '& .MuiFormControl-root ': {
      width: '100%',
    },
  },

  assignRunsheetModal: {
    backgroundColor: '#fff',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '560px',
    padding: '24px',
    borderRadius: '12px',
    background: theme.palette.surfaceWhite,
    boxShadow: `
      0px 8px 8px -4px rgba(16, 24, 40, 0.04),
      0px 20px 24px -4px rgba(16, 24, 40, 0.1)`,
    '& .MuiTypography-root.MuiTypography-info': {
      color: theme.palette.textSecondary3,
    },
  },

  runsheetsAccordionCurrent: {
    '&.MuiPaper-root': {
      '& .MuiAccordionSummary-root': {
        borderBottom: `1px solid ${theme.palette.surfaceBrandDisabled}`,
        backgroundColor: theme.palette.surfaceBrandSubtle,

        '&:hover': {
          backgroundColor: theme.palette.surfaceBrandSubtle,
        },

        '& .MuiAccordionSummary-expandIconWrapper': {
          backgroundColor: theme.palette.surfaceWhite,
        },
      },
    },
  },

  accordionListItem: {
    padding: '8px 16px',
    borderRadius: '4px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 250ms ease',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.borderSubtle1,
    },
  },
  accordionListItemUnassigned: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.surfaceBrandSubtle,
      '& > .MuiBox-root': {
        '& > .MuiTypography-root': {
          color: theme.palette.surfaceBrand,
        },
      },
    },
  },
  accordionListTitle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
    '& .MuiTypography-subtitle1': {
      color: `${theme.palette.textPlaceholder} !important`,
      fontSize: '14px !important',
    },
  },
  runsheetsAccordion: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 0',
    overflow: 'auto',
    '& .MuiPaper-root': {
      boxShadow: 'none',
      padding: '0',
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
        padding: '8px 12px',
        width: '100%',
        borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
        '&:hover': {
          backgroundColor: theme.palette.surfaceGreySubtle,
        },
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
    modalDescText: {},
    // '& .MuiTableCell-root': {
    //   borderBottom: 0,
    // },
  },
}));
