import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
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
    background: '#fafafa',
  },
  newAlarm: {
    background: '#FEF3F2',
    color: '#B42318',
  },
  unassigned: {
    background: '#FEF3F2',
    color: '#B42318',
  },

  assigned: {
    background: '#FFFAEB',
    color: '#B54708',
  },
  acknowledged: {
    background: '#EFF8FF',
    color: '#0059FF',
  },
  callReceived: {
    background: '#EFF8FF',
    color: '#0059FF',
  },
  onTheWay: {
    background: '#EFF8FF',
    color: '#175CD3',
  },
  onSite: {
    background: '#F4F3FF',
    color: '#5925DC',
  },
  onSiteAllClear: {
    background: '#ECFDF3',
    color: '#2E964B',
  },
  reportCompleted: {
    background: '#ECFDF3',
    color: '#2E964B',
  },
  close: {
    background: '#F5F5F6',
    color: '#5B5B5F',
  },
  incidentToReport: {
    background: '#FBEEED',
    color: '#E43F32',
  },
  actionBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inlineBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonOffice: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      maxWidth: '100%',
      height: 'auto',
      color: theme.palette.textAlert,
      '&:hover': {
        color: theme.palette.textAlert,
      },
    },
  },
  buttonOfficeDisabled: {
    '&.MuiButtonBase-root:disabled': {
      color: theme.palette.textPlaceholderField,
      '&:hover': {
        color: theme.palette.textPlaceholderField,
      },
    },
    '& svg': {
      '& rect': {
        '&:first-child': {
          fill: theme.palette.textPlaceholderField,
        },
      },
      '& path:last-child': {
        fill: theme.palette.textPlaceholderField,
      },
      '& :nth-child(4)': {
        stroke: theme.palette.textPlaceholderField,
      },
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
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },
  timeElapsedStyle: {
    '&.MuiChip-root.MuiChip-filled': {
      background: theme.palette.surfaceGreySubtle,
    },
    '& .MuiChip-label': {
      color: theme.palette.textSecondary3,
    },
  },
  pulseAnimation: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
      animation: `$colorChange 2s infinite`,
      backgroundColor: '#F5F5F6',
    },
  },
  '@keyframes colorChange': {
    '0%': {
      backgroundColor: '#F5F5F6',
    },
    '50%': {
      backgroundColor: '#FECDCA',
      color: '#B32318',
    },
    '100%': {
      backgroundColor: '#F5F5F6',
    },
  },
  franchiseNameText: {
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
    },
  },
  avatarCol: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },
  avatarColName: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
  },

  countBoxText: {
    alignItems: 'center',
  },
  countBoxMain: {
    display: 'flex',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    [theme.breakpoints.down(786)]: {
      borderTop: 'none',
      borderBottom: 'none',
      padding: '0 8px',
      // flexDirection: 'column',
      // alignItems: 'flex-start',
      gap: '0',
    },
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '5px',
    [theme.breakpoints.down(786)]: {
      gap: '0',
    },
    '& button.MuiButtonBase-root.MuiIconButton-root': {
      padding: '0px',
    },
  },

  countBox: {
    gap: '12px',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '20px 24px',
    [theme.breakpoints.down(786)]: {
      padding: '8px',
      width: '100%',
      '& svg': {
        width: '20px',
        height: '20px',
        display: 'none',
      },
    },
  },
  sitesListingContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 32px',
    [theme.breakpoints.down(786)]: {
      padding: ' 16px',
      flexWrap: 'wrap',
      gap: '12px',
    },
  },
  userSection: {
    display: 'flex',
    [theme.breakpoints.down(786)]: {
      display: 'none',
    },
  },
  invoicesDateRange: {
    width: '284px',

    [theme.breakpoints.down(786)]: {
      width: '236px',
    },
    [theme.breakpoints.down(399)]: {
      width: '190px',
    },
    '& .MuiStack-root': {
      '& div': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            minWidth: '284px',
            height: '36px',
            [theme.breakpoints.down(786)]: {
              minWidth: '236px',
            },
            [theme.breakpoints.down(399)]: {
              minWidth: '190px',
              '& .MuiInputBase-input': {
                fontSize: '12px',
                lineHeight: '14px',
              },
            },
          },
        },
      },
    },
  },
  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    [theme.breakpoints.down(786)]: {
      gap: '0',
      flexWrap: 'wrap',
    },
    '& >.MuiTypography-root': {
      [theme.breakpoints.down(786)]: {
        fontSize: '18px',
        lineHeight: '24px',
      },
    },
    '& .$MuiButtonBase-root ': {
      [theme.breakpoints.down(786)]: {
        display: 'none',
      },
    },
    '& >.MuiBox-root:nth-child(2)': {
      [theme.breakpoints.down(786)]: {
        display: 'none !important',
      },
    },
    '& > div:first-child': {
      [theme.breakpoints.down(768)]: {
        width: '190px',
        '& .MuiFormControl-root': {
          width: '100%',
          '& .MuiInputBase-root': {
            width: '100%',
            minWidth: '190px',
            maxWidth: '190px',
          },
        },
      },
    },
  },
  rightBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& .MuiButtonBase-root': {
      [theme.breakpoints.down(786)]: {
        fontSize: '12px',
        lineHeight: '14px',
      },
      [theme.breakpoints.down(399)]: {
        '& .MuiButton-icon ': {
          display: 'none',
        },
      },
    },
    [theme.breakpoints.down(786)]: {
      gap: '0',
    },
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

  sideDrawerHeight: {
    '& .MuiDrawer-paper': {
      '& > .MuiBox-root': {
        height: '100%',
      },
    },
  },

  tableWrapper: {
    padding: '0px 32px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    [theme.breakpoints.down(786)]: {
      padding: '0px 16px',
    },
    '& table': {
      '& th:nth-child(1)': {
        minWidth: '114px',
        maxWidth: '114px',
        [theme.breakpoints.down(786)]: {
          position: 'unset',
        },
      },

      '& td:nth-child(1)': {
        minWidth: '114px',
        maxWidth: '114px',
        [theme.breakpoints.down(786)]: {
          position: 'unset',
        },
      },

      '& th:nth-child(2)': {
        position: 'sticky',
        left: '114px',
        background: theme.palette.surfaceWhite,
        zIndex: '21',
        minWidth: '100%',
        maxWidth: '240px',
        [theme.breakpoints.down(786)]: {
          left: 'unset',
          zIndex: 'unset',
        },
      },

      '& td:nth-child(2)': {
        position: 'sticky',
        left: '114px',
        zIndex: '20',
        minWidth: '100%',
        maxWidth: '240px',
        fontWeight: '500',
        color: theme.palette.textPrimary,
        [theme.breakpoints.down(786)]: {
          position: 'unset',
          left: 'unset',
          zIndex: 'unset',
        },
      },
      '& th:last-child': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '20',
        [theme.breakpoints.down(786)]: {
          position: 'unset',
        },
      },

      '& td:last-child': {
        minWidth: '60px',
        maxWidth: '60px',
        position: 'sticky',
        right: '0',
        background: theme.palette.surfaceWhite,
        zIndex: '19',
        [theme.breakpoints.down(786)]: {
          position: 'unset',
        },
      },
    },
  },
  templateActions: {
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

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
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
          stroke: theme.palette.textOnColor,
        },
      },
    },

    '& svg': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '0px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  questionBankActionsTextRegular: {
    whiteSpace: 'nowrap',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  popoverBtn: {
    marginBottom: '25px',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    '& button.MuiButtonBase-root': {
      padding: '4px',
      height: '24px',
      width: '24px',
    },
    '& button.MuiButtonBase-root.MuiIconButton-root': {
      '& path': {
        stroke: theme.palette.textPlaceholder,
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
        marginLeft: '6px',
      },
    },
  },
}));
