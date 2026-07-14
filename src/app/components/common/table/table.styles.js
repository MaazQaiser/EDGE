import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dataTable: {
    '&.MuiTableContainer-root': {
      '&::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },

      '&::-webkit-scrollbar-track': {
        boxShadow: 'none',
      },

      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(128, 128, 128, 0.4)',
        borderRadius: '10px',
      },

      '&:hover': {
        '&::-webkit-scrollbar-track': {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
        },

        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'grey',
        },
      },
    },

    '& .MuiTable-root': {
      minWidth: '100%',
      whiteSpace: 'nowrap',
      '& .MuiTableHead-root': {
        '& .MuiTableRow-head': {
          backgroundColor: theme.palette.surfaceWhite,
          '& .MuiTableCell-head': {
            fontSize: '12px',
            fontWeight: '500',
            lineHeight: '18px',
            color: theme.palette.textSecondary2,
            padding: '0px 24px',
            borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
            borderTop: `1px solid ${theme.palette.borderSubtle1}`,
            height: '48px',

            '&:first-child': {
              position: 'sticky',
              left: 0,
              zIndex: 21,
              backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
      '& .MuiTableBody-root': {
        '& .MuiTableRow-root': {
          background: theme.palette.surfaceWhite,
          '& .MuiTableCell-root': {
            padding: '0 24px',
            height: '48px',

            '&:first-child': {
              color: theme.palette.textSecondary1,
              fontWeight: 500,
              position: 'sticky',
              left: 0,
              backgroundColor: 'inherit',
              zIndex: 20,
            },
          },

          '&:hover': {
            backgroundColor: theme.palette.surfaceGreySubtle,
          },
        },
      },
    },
  },

  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  noRecordFoundData: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    width: '100%',
    flex: '1',
  },

  noRecordFoundTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginTop: '24px',
    },
  },

  noRecordFoundText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      marginTop: '16px',
    },
  },

  paginationTableWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    [theme.breakpoints.down(786)]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    },
  },

  selectedText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  paginationTable: {
    minHeight: '56px',
    '&.MuiTablePagination-root': {
      overflow: 'hidden',
      [theme.breakpoints.down(786)]: {
        padding: '8px 0',
      },
    },
    '& .MuiToolbar-root': {
      '&.MuiTablePagination-toolbar': {
        minHeight: '56px',
        padding: 0,
        [theme.breakpoints.down(786)]: {
          minHeight: 'auto',
          flexWrap: 'wrap',
          gap: '2px',
          justifyContent: 'center',
        },
      },

      '& .MuiTablePagination-selectLabel': {
        color: theme.palette.textSecondary1,
        [theme.breakpoints.down(786)]: {
          fontSize: '12px',
          lineHeight: '16px',
          marginRight: '8px',
        },
      },

      '& .MuiInputBase-root': {
        '& .MuiSelect-select': {
          color: theme.palette.textSecondary1,
          '&:focus': {
            background: 'transparent',
          },
          [theme.breakpoints.down(786)]: {
            fontSize: '12px',
            lineHeight: '16px',
            padding: '4px 24px 4px 8px',
          },
        },
        '& .MuiSelect-icon': {
          width: '18px',
          height: '18px',
          top: '6px',
          [theme.breakpoints.down(786)]: {
            width: '16px',
            height: '16px',
            top: '4px',
            right: '4px',
          },
          '& path': {
            stroke: theme.palette.textSecondary1,
          },
        },
      },

      '& .MuiTablePagination-displayedRows': {
        color: theme.palette.textSecondary1,
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '20px',
        [theme.breakpoints.down(786)]: {
          fontSize: '12px',
          lineHeight: '16px',
          marginLeft: '8px',
        },
      },

      '& .MuiTablePagination-actions': {
        marginLeft: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        [theme.breakpoints.down(786)]: {
          marginLeft: '8px',
          gap: '8px',
        },

        '& .MuiButtonBase-root': {
          color: theme.palette.textSecondary1,
          backgroundColor: 'white',
          border: `1px solid ${theme.palette.borderStrong1}`,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          padding: '0',
          [theme.breakpoints.down(786)]: {
            width: '28px',
            height: '28px',
            minWidth: '28px',
          },

          '&:hover': {
            color: theme.palette.textPrimary,
            backgroundColor: theme.palette.surfaceGreySubtle,
            border: `1px solid ${theme.palette.borderStrong1}`,
          },

          '&:active': {
            color: theme.palette.textPrimary,
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderStrong1}`,
            boxShadow: `0px 0px 0px 4px #F2F4F7, 0px 1px 2px 0px rgba(16, 24, 40, 0.05)`,
          },

          '&:disabled': {
            color: theme.palette.textDisabled,
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderSubtle2}`,
            '& span': {
              '& svg': {
                '& g': {
                  '& path': {
                    stroke: theme.palette.textDisabled,
                  },
                },
              },
            },
          },
          '@media (hover:none)': {
            backgroundColor: theme.palette.surfaceWhite,
            border: `1px solid ${theme.palette.borderStrong1}`,
          },

          '& .MuiSvgIcon-root': {
            fontSize: '24px',
            [theme.breakpoints.down(786)]: {
              fontSize: '20px',
            },
          },
        },
      },
    },
  },

  noRecordFoundImage: {
    padding: '1px',
  },

  paginationSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },

  paginationSelectedBtn: {
    '&.MuiButtonBase-root': {
      padding: '6px',
      borderRadius: '6px',
      '&:hover': {
        background: theme.palette.surfaceBrandSubtle,
      },
    },
  },

  selectDropdown: {
    '&.MuiPaper-root': {
      color: theme.palette.textSecondary1,
      backgroundColor: theme.palette.surfaceWhite,
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      boxShadow:
        '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
    },
  },
}));
