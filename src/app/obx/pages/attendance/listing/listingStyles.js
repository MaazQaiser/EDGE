import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  attendancesListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '24px 32px',
    paddingBottom: 0,
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  attendancesListingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },

  supervisorColumnWrapper: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },

  rejectBtn: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            width: '16px',
            height: '16px',
            '& path': {
              fill: '#FECDCA',
            },
          },
        },
      },
      '& .MuiButton-startIcon': {
        '& svg': {
          width: '16px',
          height: '16px',
          '& path': {
            fill: theme.palette.surfaceAlertStrong,
          },
        },
      },
    },
  },

  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',

    '& table': {
      '& th:nth-child(1), & th:nth-child(2), & td:nth-child(2)': {
        zIndex: '22 !important',
        position: 'sticky',
      },

      '& th:nth-child(1), & td:nth-child(1)': {
        left: 0,
      },
      '& th:nth-child(2), & td:nth-child(2)': {
        left: '64px',
      },
    },
  },

  reportsListingsHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  reportsListingsHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  tableAvatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  tableNameText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  attendanceListingDelete: {
    cursor: 'pointer',
  },

  sweetAlertConfirmBlueButton: {
    padding: '10px 16px',
    borderRadius: '8px !important',
    margin: 0,
    height: '40px',
    color: `${theme.palette.textOnColor} !important`,
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
    border: `1px solid ${theme.palette.borderBrand} !important`,
    fontFamily: 'inherit',
    fontSize: '14px !important',
    fontWeight: 500,
    lineHeight: '20px !important',
    boxShadow: 'none',
    textTransform: 'capitalize',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: `${theme.palette.surfaceBrandHover} !important`,
      border: `1px solid ${theme.palette.borderBrandHover} !important`,
      backgroundImage: 'none !important',
    },

    '&:active': {
      backgroundColor: `${theme.palette.surfaceBrand} !important`,
      border: `1px solid ${theme.palette.borderBrand} !important`,
      boxShadow: `0px 0px 0px 4px #E5F6FF, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) !important`,
      backgroundImage: 'none !important',
    },

    '&:focus': {
      boxShadow: `none !important`,
    },

    '&:disabled': {
      color: `${theme.palette.textOnColor} !important`,
      backgroundColor: `${theme.palette.textBrandDisabled} !important`,
      border: `1px solid ${theme.palette.borderBrandDisabled} !important`,
    },

    '&:focus-visible': {
      outline: 'none !important',
    },
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

  rejectLeaveModalBody: {
    maxWidth: '550px',
    width: '100%',
    margin: '0 auto',
    background: theme.palette.surfaceWhite,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    borderRadius: '8px',
    padding: '24px',
  },

  rejectLeaveModalBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '20px',
    },
  },

  leaveRequestModalBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  rejectLeaveModalBodyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  rejectLeaveModalBodyField: {
    marginTop: '20px',
    '& .MuiFormControl-root': {
      width: '100%',
      '& .MuiOutlinedInput-root': {
        minWidth: '100%',
      },
    },
  },

  leaveRequestModalBodyField: {
    marginTop: '24px',
    paddingBottom: '24px',
    '& .MuiFormControl-root': {
      width: '100%',
      '& .MuiOutlinedInput-root': {
        minWidth: '100%',
      },
    },
  },

  leaveRequestModalBodyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  rejectLeaveModalBodyActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
  },

  rejectLeaveModalBodyDateTime: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    marginTop: '24px',
  },

  modalDateTimePicker: {
    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          minWidth: 'auto',
        },
      },
    },
  },
}));
