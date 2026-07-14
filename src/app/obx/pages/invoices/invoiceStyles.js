import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  ZonesTD: {
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

  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  qbPopover: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
      minWidth: '180px',
    },
  },

  qbPopoverOption: {
    padding: '12px 16px',
    cursor: 'pointer',
    color: theme.palette.textPrimary,
    fontSize: '14px',
    lineHeight: '20px',
    '&:hover': {
      backgroundColor: theme.palette.surfaceHover || '#f9fafb',
    },
  },

  btnAction: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '31px',
      width: '31px',
      minWidth: '31px',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '16px',
      width: '16px',
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
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
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '12px',
    justifyContent: 'space-between',
  },

  sitesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '32px',

    [theme.breakpoints.down('lg')]: {
      padding: '24px',
    },
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
    marginBottom: '24px',
  },

  invoicesDateRange: {
    width: '284px',
    '& .MuiStack-root': {
      '& div': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '284px',
            height: '36px',
          },
        },
      },
    },
  },

  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  rightBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  greenText: {
    color: theme.palette.borderSuccess,
    background: theme.palette.surfaceSuccessSubtle,
  },

  brandText: {
    color: theme.palette.surfaceWhite,
    background: theme.palette.borderBrand,
  },

  otherStageColor: {
    background: theme.palette.textPlaceholder,
  },

  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '32px',
      width: '32px',
    },
  },
  buttonDisable: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      opacity: '0.5',
      minWidth: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
    '& svg': {
      height: '32px',
      width: '32px',
    },
  },
  sideDrawerHeight: {
    '& .MuiDrawer-paper': {
      '& > .MuiBox-root': {
        height: '100%',
      },
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  tableWrapperUS: {
    '& table': {
      '& th:nth-child(1)': {
        minWidth: '82px',
        maxWidth: '82px',
      },

      '& td:nth-child(1)': {
        minWidth: '82px',
        maxWidth: '82px',
      },

      '& th:nth-child(2)': {
        position: 'sticky',
        left: '82px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '180px',
        maxWidth: '180px',
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '82px',
        zIndex: '20',
        minWidth: '140px',
        maxWidth: '140px',
      },
      '& th:last-child': {
        minWidth: '143px',
        maxWidth: '143px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },

      '& td:last-child': {
        minWidth: '143px',
        maxWidth: '143px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
    },
  },

  tableWrapperGermany: {
    '& table': {
      '& th:nth-child(1)': {
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
        minWidth: '200px',
        maxWidth: '200px',
      },

      '& td:nth-child(1)': {
        position: 'sticky',
        left: '0',
        zIndex: '21',
        minWidth: '200px',
        maxWidth: '200px',
      },

      '& th:nth-child(2)': {
        position: 'sticky',
        left: '200px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '125px',
        maxWidth: '125px',
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '200px',
        zIndex: '20',
        minWidth: '125px',
        maxWidth: '125px',
      },
      '& th:last-child': {
        minWidth: '143px',
        maxWidth: '143px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },

      '& td:last-child': {
        minWidth: '143px',
        maxWidth: '143px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
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
  contractName: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    '& .MuiChip-root.MuiChip-filled': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: theme.palette.surfaceGreySubtle,
      color: theme.palette.textSecondary3,
      fontSize: '12px',
    },
    '& span.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  associatedSites: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
  associatedSitesItem: {
    padding: '2px 8px',
    borderRadius: '24px',

    lineHeight: '18px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceGreySubtle,
    color: theme.palette.textSecondary3,
    fontSize: '12px',
  },
  associatedSitesNo: {
    color: theme.palette.textSecondary3,
    fontSize: '12px',
    lineHeight: '18px',
  },
  exportButton: {
    '& svg': {
      width: '17px',
      height: '17px',
    },
  },
  invoiceButtonClass: {
    border: '1px solid green',
    borderRadius: '10px',
    borderColor: 'green',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceIcon: {
    width: '20px',
    height: '20px',
    padding: '4px',
  },
}));
