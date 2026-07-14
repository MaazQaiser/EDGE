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
    width: '100%',
    paddingBottom: '0',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  searchSectionDashboard: {
    padding: '0;',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    marginTop: '22px',
    height: '36px',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    gap: '8px',
  },
  userSection: {
    display: 'flex',
    gap: '16px',
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

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',

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
        minWidth: '200px',
        maxWidth: '200px',
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '82px',
        zIndex: '20',
        minWidth: '200px',
        maxWidth: '200px',
      },
    },
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
}));
