import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
      margin: '0 auto',
      '& .MuiButton-icon': {
        margin: '0',
      },
      '&:disabled': {
        '& .MuiButton-icon': {
          '& svg': {
            '& path': {
              stroke: theme.palette.surfaceAlertDisabled,
            },
          },
        },
      },
    },
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      width: '240px',
      height: '36px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  totalPrice: {
    '&.MuiBox-root': {
      color: theme.palette.textPrimary,
    },
  },

  locationListing: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& td.MuiTableCell-root , & th.MuiTableCell-root': {
      height: '40px !important',
      padding: '16px 24px !important',
      verticalAlign: 'top',
      '& .MuiFormControl-root': {
        marginTop: '0 !important',
        marginBottom: '0 !important',
      },
      '&:nth-child(2)': {
        textAlign: 'left',
        '& input': {
          textAlign: 'left',
        },
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '100%',
            maxWidth: '100%',
          },
        },
      },

      '&:not(:first-child)': {
        // color: theme.palette.textSecondary3,
        // textAlign: 'center',
        '& input': {
          textAlign: 'center',
          // color: theme.palette.textSecondary3,
        },
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '100px',
            maxWidth: '100px',
          },
        },
      },
    },
    '& th.MuiTableCell-root': {
      backgroundColor: `${theme.palette.surfaceGreyLight} !important`,
    },
  },

  scoutingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  lineField: {
    '& .MuiInputBase-root': {
      height: '36px',
    },
  },
  addOfficerDropdownField: {
    width: '100%',
    maxWidth: '252px',
    minWidth: '252px',
    '& >.MuiBox-root': {
      maxWidth: '252px',
      minWidth: '252px',
    },
  },
}));
