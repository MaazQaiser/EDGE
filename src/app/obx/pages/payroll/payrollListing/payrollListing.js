import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  chipsBar: {
    display: 'flex',
    marginBottom: '24px',
  },

  chipsWrapper: {
    display: 'flex',
    gap: '12px',
    '& .MuiButtonBase-root.MuiChip-root.MuiChip-filled': {
      backgroundColor: theme.palette.surfaceGreySubtle,
      '& svg.MuiChip-deleteIcon': {
        marginLeft: '5px',
      },
    },
  },
  salesUserListingContainer: {
    paddingBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& table': {
      '& td[data-column-id="adpBadgeNumber"], & td[data-column-id="employeeName"], & td[data-column-id="name"]':
        {
          fontWeight: '500',
          color: theme.palette.textSecondary1,
        },
    },
  },
  searchSectionDashboard: {
    padding: '0;',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    marginTop: '22px',
    height: '38px',
    overflowY: 'hidden',
    overflowX: 'hidden',
    position: 'relative',
    '&:hover': {
      overflowX: 'auto',
    },
    scrollbarWidth: '8px',
    '&::-webkit-scrollbar': {
      height: '8px',
      backgroundColor: 'transparent',
    },
    '&:hover::-webkit-scrollbar': {
      backgroundColor: '#f0f0f0',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(128, 128, 128, 0.4)',
      borderRadius: '10px',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: 'grey',
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#aaa',
    },
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    gap: '8px',
  },
  userSection: {
    display: 'flex',
    gap: '8px',
    height: '100%',
  },
  filterBtnSection: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: '#fff',
    padding: '8px 14px 8px 14px',
    boxSizing: 'border-box',
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },

  moreFilter: {
    '&.MuiButtonBase-root': {
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      letterSpacing: '0px',
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      border: '0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'transparent !important',
        color: theme.palette.textPrimary,
      },
      '& svg': {
        marginLeft: '8px',
      },
    },
  },

  locationTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  locationName: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },
  graphHide: {
    display: 'flex',
    maxHeight: 0,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
  },

  graphExpandBtn: {
    '&.MuiButtonBase-root': {
      position: 'fixed',
      left: '52%',
      transform: 'translateX(-50%) rotate(-180deg)',
      top: '46px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      zIndex: '100',
      padding: '0',
    },
  },

  graphCollapseBtn: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: '-14px',
      minWidth: '28px',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      padding: '0',
    },
  },

  mainWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'relative',
    maxHeight: '284px',
  },
  invoicesDateRange: {
    width: '265px',
    position: 'relative',
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
  textField: {
    textAlign: 'center',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      width: '50px',
      minWidth: '50px',
      color: theme.palette.textSecondary3,
    },
  },
  inlineField: {
    display: 'flex',
    alignItems: 'center',
  },
  hourFiled: {
    textAlign: 'center',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      width: '85px',
      color: theme.palette.textSecondary3,
      minWidth: '85px',
    },
  },
  spaceer: {
    '&.MuiTypography-root': {
      margin: '0px 8px',
      color: theme.palette.textSecondary3,
    },
  },
  hourValue: {
    '&.MuiTypography-root': {
      marginLeft: '8px',
      color: theme.palette.textSecondary3,
    },
  },
  employeeNameClass: {
    display: 'flex',
    gap: '8px',
    textTransform: 'capitalize',
    '& .MuiButtonBase-root.MuiButton-root': {
      padding: '0',
      height: 'auto',
      minWidth: 'auto',

      '& .MuiButton-startIcon': {
        marginRight: 0,
        marginLeft: 0,
      },
    },
  },
  error: {
    fontSize: 11,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
    position: 'absolute',
    top: '-25px',
  },
  adhocPayrollChip: {
    '&.MuiChip-root': {
      backgroundColor: '#F4EDFD',
      color: '#9747FF',
    },
  },
  statesButtons: {
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },

  notesSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  notesArea: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  repateNotes: {
    marginBottom: '16px',
    position: 'relative',
    paddingLeft: '12px',

    '&:last-child': {
      marginBottom: 0,
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      width: '5px',
      height: '5px',
      borderRadius: '160px',
      backgroundColor: theme.palette.surfaceBrand,
      left: '0px',
      top: '8px',
    },
  },
  disabledRecord: {
    '&.MuiTableRow-root': {
      opacity: '0.5',
      // pointerEvents: 'none !important',
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',

    '& table': {
      '& .MuiTableCell-root': {
        padding: '0px 16px !important',
      },
      '& th[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
      },

      '& td[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
      },

      '& th[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },

      '& td[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
      '& th[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '115px',
        maxWidth: '115px',
      },
      '& td[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        zIndex: '20',
        minWidth: '115px',
        maxWidth: '115px',
      },

      '& th[data-column-id="employeeName"]': {
        position: 'sticky',
        left: '175px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '150px',
        // maxWidth: '150px',
        borderRight: '1px solid #e6e6e7',
      },

      '& td[data-column-id="employeeName"]': {
        position: 'sticky',
        left: '175px',
        zIndex: '20',
        minWidth: '150px',
        // maxWidth: '150px',
        borderRight: '1px solid #e6e6e7',
      },
      '& th[data-column-id="invoiceableHours"]': {
        position: 'sticky',
        right: 133,
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '133px',
      },
      '& td[data-column-id="invoiceableHours"]': {
        minWidth: '133px',
        position: 'sticky',
        right: 133,
        zIndex: '20',
      },
      '& th[data-column-id="approvedHours"]': {
        position: 'sticky',
        right: 266,
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '133px',
        borderLeft: '1px solid #e6e6e7',
      },
      '& td[data-column-id="approvedHours"]': {
        minWidth: '133px',
        position: 'sticky',
        right: 266,
        zIndex: '20',
        borderLeft: '1px solid #e6e6e7',
      },
    },
  },
  alignToShiftHoursButton: {
    '&.MuiButtonBase-root': {
      whiteSpace: 'nowrap',
      color: theme.palette.textBrand,
    },
    '&:hover': {
      backgroundColor: 'transparent !important',
      color: theme.palette.textBrand,
    },
  },
  tableWrapperNoCheckbox: {
    '& table': {
      '& th[data-column-id="adpBadgeNumber"]': {
        left: '0px !important',
      },
      '& td[data-column-id="adpBadgeNumber"]': {
        left: '0px !important',
      },
      '& th[data-column-id="employeeName"]': {
        left: '115px !important',
      },
      '& td[data-column-id="employeeName"]': {
        left: '115px !important',
      },
      '& th[data-column-id="name"]': {
        left: '115px !important',
      },
      '& td[data-column-id="name"]': {
        left: '115px !important',
      },
    },
  },
  tableWrapperPatrol: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& table': {
      '& .MuiTableCell-root': {
        padding: '0px 16px !important',
      },
      '& th[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
      },
      '& td[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
      },
      '& th[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },

      '& td[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
      '& th[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '115px',
        maxWidth: '115px',
      },
      '& td[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        zIndex: '20',
        minWidth: '115px',
        maxWidth: '115px',
      },

      '& th[data-column-id="name"]': {
        position: 'sticky',
        left: '175px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '150px',
        // maxWidth: '150px',
        borderRight: '1px solid #e6e6e7',
      },

      '& td[data-column-id="name"]': {
        position: 'sticky',
        left: '175px',
        zIndex: '20',
        minWidth: '150px',
        // maxWidth: '150px',
        borderRight: '1px solid #e6e6e7',
      },
      '& th[data-column-id="approvedHours"]': {
        position: 'sticky',
        right: 133,
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '133px',
        borderLeft: '1px solid #e6e6e7',
      },
      '& td[data-column-id="approvedHours"]': {
        minWidth: '133px',
        position: 'sticky',
        right: 133,
        zIndex: '20',
        borderLeft: '1px solid #e6e6e7',
      },
    },
  },
  tableWrapperSupervisor: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    '& table': {
      '& .MuiTableCell-root': {
        padding: '0px 16px !important',
      },
      '& th[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        width: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '22',
      },
      '& td[data-column-id="checkbox"]': {
        minWidth: '60px',
        maxWidth: '60px',
        width: '60px',
        position: 'sticky',
        left: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
      },
      '& th[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        backgroundColor: '#ffffff',
      },
      '& td[data-column-id="action"]': {
        minWidth: '133px',
        maxWidth: '133px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
      },
      '& th[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '115px',
        maxWidth: '115px',
      },
      '& td[data-column-id="adpBadgeNumber"]': {
        position: 'sticky',
        left: '60px',
        zIndex: '20',
        minWidth: '115px',
        maxWidth: '115px',
      },

      '& th[data-column-id="employeeName"]': {
        position: 'sticky',
        left: '175px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '140px',
        maxWidth: '140px',
        borderRight: '1px solid #e6e6e7',
      },

      '& td[data-column-id="employeeName"]': {
        position: 'sticky',
        left: '175px',
        zIndex: '20',
        minWidth: '140px',
        maxWidth: '140px',
        borderRight: '1px solid #e6e6e7',
      },
    },
  },
  hoursNewField: {
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '14px',
    },
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  boxValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      width: '70px',
      height: '32px',
      padding: '8px 14px',
      fontSize: '14px',
      maxWidth: '70px',
      borderRadius: '8px',
      border: '1px solid #D0CFD2',
      zIndex: '0',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  hourValueBox: {
    '&.MuiTypography-root': {
      color: '#444446',
      gap: '4px',
      fontSize: '14px',
      borderRadius: '8px',
      fontWeight: '500',
      lineHeight: '20px',
      zIndex: '0',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  },
}));
