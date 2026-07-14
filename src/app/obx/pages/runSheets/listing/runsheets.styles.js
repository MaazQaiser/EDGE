import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',

    overflow: 'auto',
    flex: '1 1',
  },
  flex: {
    display: 'flex',
    justifyContent: 'center',
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    transition: 'width 0.3s',
    width: (props) => (props.expanded ? '0' : '60%'),
    overflow: 'hidden',
  },
  rightSide: {
    transition: 'width 0.3s',
    overflow: 'auto',
    width: (props) => (props.expanded ? '100%' : '40%'),
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  iconRotate: {
    transition: 'transform 0.3s',
    transform: (props) => (props.expanded ? 'rotate(0deg)' : 'rotate(180deg)'),
  },
  mapArea: {
    backgroundColor: '#f9f5ed',
    width: '100%',
    height: '100%',
  },
  bottomArea: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '8px',
    width: '100%',
    borderRadius: '5px 5px 0px 0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    '& .MuiButtonBase-root': {
      color: theme.palette.textPrimary,
      pointerEvents: 'none',
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
  toggleButton: {
    '&.MuiButtonBase-root': {
      position: 'absolute',
      zIndex: '1',
      top: '22px',
      left: '22px',
      gap: '8px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '12px',
      borderRadius: '5px',
      color: theme.palette.textPrimary,
      minWidth: 'auto',
      '&:hover': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        minWidth: 'auto',
      },
    },
    '& .MuiButton-icon': {
      margin: '0px',
    },
  },

  runsheets: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  runsheetsListingHeader: {
    padding: '20px 0 16px 0',
    margin: '0 32px',
  },

  runsheetsListingHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
  },

  runsheetsListingHeaderBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  runsheetsListingHeaderDropdowns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  runsheetsListingHeaderActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  runsheetsListingHeaderActionsSearch: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  runsheetsListing: {
    width: '100%',
  },

  runsheetsMap: {
    flex: '1',
  },
  runsheetsListingHeaderSubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  accordionHeaderDate: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  accordionHeaderDot: {
    color: theme.palette.textPrimary,
  },

  accordionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
  },

  accordionHeaderDay: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  runsheetsAccordion: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 32px',
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

    // '& .MuiTableCell-root': {
    //   borderBottom: 0,
    // },
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
    padding: '12px 16px',
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
  dayShteetWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  accordionListItemUnassigned: {
    backgroundColor: theme.palette.surfaceGreySubtle,
    cursor: 'pointer',
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
    alignItems: 'center',
    gap: '6px',
  },

  accordionListTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  accordionListUnassignedVO: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  accordionListUnassigned: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  accordionListOfficerUnassigned: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
    },
    cursor: 'pointer',
  },

  accordionListVehiclesOfficers: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',

    '& .MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },

  accordionListVehicleOfficer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  accordionListNos: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  accordionListNo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  accordionListTitleText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  accordionListTimeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  accordionListOfficer: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  accordionListRedirection: {
    cursor: 'pointer',
    lineHeight: '0',
    '& svg': {
      '& path': {
        stroke: theme.palette.surfaceGreyStrong1,
      },
    },
  },

  settingsIcon: {
    pointerEvents: 'auto',
    cursor: 'pointer',
    '& path': {
      stroke: theme.palette.surfaceGreyStrong1,
    },
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

  assignDrawerHeaderCloseBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      width: '24px',
      minWidth: '24px',
      height: '24px',

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  editPreferences: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  editPreferencesHeader: {
    padding: '24px  24px 0 24px',
  },

  editPreferencesHeaderContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
  },

  editPreferencesTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  editPreferencesTitleText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  editPreferencesDivider: {
    width: '3px',
    height: '3px',
  },

  editPreferencesText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  editPreferencesBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '0 24px 12px',
    marginTop: '32px',
    gap: '24px',
  },

  globalPreferencesBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    padding: '0 24px 16px',
    marginTop: '24px',
    gap: '24px',
  },

  editPreferencesSwitchContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  editPreferencesSwitch: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  editPreferencesSlider: {
    '& .MuiSlider-root': {
      borderRadius: '4px',
      color: theme.palette.surfaceBrand,
      height: '5px',
      padding: ' 0 0 24px 0',
      marginBottom: '24px',

      '& .MuiSlider-rail': {
        opacity: 1,
        backgroundColor: theme.palette.surfaceGreySubtle,
      },

      '& .MuiSlider-mark': {
        display: 'none',
      },

      '& .MuiSlider-thumb': {
        width: '16px',
        height: '16px',
        backgroundColor: theme.palette.surfaceWhite,
        border: `2px solid ${theme.palette.borderBrand}`,

        '&:after': {
          width: '24px',
          height: '24px',
        },

        '&.Mui-active': {
          boxShadow: '0px 0px 0px 8px rgba(25, 118, 210, 0.16)',
        },
      },

      '& .MuiSlider-markLabel': {
        color: theme.palette.textSecondary3,

        '&:first-child': {
          left: '12px',
        },
      },

      '& .MuiSlider-markLabelActive': {
        color: theme.palette.textPrimary,
      },
    },

    editPreferencesSwitchText: {
      '&.MuiTypography-root': {
        color: theme.palette.textPrimary,
      },
    },
  },

  editPreferencesFooter: {
    padding: '24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  globalPreferencesFooter: {
    padding: '24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  editPreferencesAlert: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
    marginTop: 'auto',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  editPreferencesAlertBox: {
    display: 'flex',
    gap: '8px',
    backgroundColor: theme.palette.surfaceBrandSubtle,
    padding: '8px 12px',
    borderRadius: ' 8px',

    '& svg': {
      width: '18px',
      height: '18px',
      '& path': {
        stroke: theme.palette.surfaceBrand,
      },
    },
  },

  editPreferencesAlertText: {
    flex: 1,
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  tabPanelBox: {
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

  functionalDiv: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    paddingTop: '8px',

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

  globalPreferencesTabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    marginTop: '16px',
    opacity: '0.7',
  },

  globalPreferencesWeekText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '16px',
    },
  },

  globalPreferencesWeekInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '40px',
  },

  globalPreferencesWeekInfoTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  globalPreferencesWeekInfoText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      height: 'calc(100vh - 216px)',
      justifyContent: 'center',
    },
  },
  dayNotesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      height: 'calc(70vh - 216px)',
      justifyContent: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '16px 0px 0px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
      marginBottom: '16px',
      marginTop: '16px',
    },
  },
  maxWidth: {
    maxWidth: '321px',
    margin: '0 auto',
    width: '100%',
  },
  assignHitsWrapper: {
    padding: '5px 38px',
    backgroundColor: `${theme.palette.surfaceAlertStrong}`,
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    '& .MuiTypography-root': {
      color: `${theme.palette.surfaceWhite}`,
      textTransform: 'capitalize',
    },
  },
  loaderBox: {
    padding: '20px 32px',
    '& .MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
      marginBottom: '12px',
    },
  },
}));
