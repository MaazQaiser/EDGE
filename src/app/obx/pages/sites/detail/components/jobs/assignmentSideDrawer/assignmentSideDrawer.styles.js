import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  assignDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    height: '100%',
    minHeight: 0, // allow body to shrink for scrolling
  },

  assignDrawerHeader: {
    padding: '24px 24px 0 24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: theme.palette.background.paper,
    flexShrink: 0,
  },

  assignShiftBodyMain: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },
  trashIcon: {
    cursor: 'pointer',
  },
  assignDrawerHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  assignDrawerHeaderTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  assignDrawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  shiftFullyCancelledHeaderInfoWrapper: {
    display: 'inline-flex',
    marginLeft: '8px',
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

  assignDrawerHeaderBottom: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
    padding: '12px',
  },

  assignDrawerHeaderBottomRow: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    gap: '16px',
  },

  assignDrawerHeaderBottomContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  assignDrawerHeaderBottomContentLayout: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '4px',
    justifyContent: 'center',
  },
  itemBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  assignDrawerHeaderBottomRowSeparator: {
    '&.MuiDivider-root': {
      width: '1px',
      height: '40px',
      color: theme.palette.borderSubtle1,
      background: theme.palette.borderSubtle1,
    },
  },

  assignDrawerHeaderBottomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },

  assignDrawerHeaderBottomLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      lineHeight: '16px',
    },
  },

  titleDivider: {
    color: theme.palette.textSecondary3,
  },

  assignDrawerHeaderTopText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '8px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },

  assignDrawerCalendarIcon: {
    '& path': {
      fill: theme.palette.textPlaceholder,
    },
  },

  assignDrawerHeaderBodyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  singleTourOptionDescText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  assignDrawerCalendarBodyIcon: {
    '& path': {
      fill: theme.palette.textBrand,
    },
  },

  assignShiftBody: {
    padding: '16px 24px',

    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minHeight: 0, // enable internal scroll
    overflowY: 'auto',
  },
  assignShiftBodyW: {
    // padding: '12px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  assignShiftBodyDatePicker: {
    paddingBottom: '16px',
    width: '50%',
  },

  assignShiftBodyBox: {
    borderRadius: '8px',
  },

  assignShiftBodyHeader: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '8px 8px 0 0',
  },

  assignShiftBodyHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  assignShiftBodyHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  assignShiftBodyHeaderTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',

    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },

    '& svg': {
      '& path': {
        fill: theme.palette.textBrand,
      },
    },
  },

  assignShiftBodyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  assignShiftBodyContentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    width: '100%',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    // paddingBottom: '12px',
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },

  shiftRateDropDown: {
    height: '44px',
    width: '300px',
  },

  assignShiftBodyDropDown: {
    height: '44px',
    width: '100%',
    '& div': {
      '& div': {
        '& h6': {
          fontSize: '16px',
          fontWeight: 400,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          width: '194px',
          whiteSpace: 'nowrap',
        },
      },
    },
  },

  assignShiftBodyContentRowActions: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    // alignItems: 'baseline',
    gap: '16px',

    '& > div': {
      width: '50%',
    },
  },
  assignShiftBodyContentRowActionsDrop: {
    flex: 1,
    '& > div': {
      width: '100%',
    },
  },
  assignShiftBodyAddTours: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    paddingTop: '4px',
    // borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    // padding: '0 12px 12px 12px',
  },

  assignShiftBodyAddToursBtn: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      padding: '0',
    },
  },
  TextEditorwrapper: {
    width: '100%',
    paddingLeft: '34px',
    '& .rdw-editor-main': {
      minHeight: '90px',
    },
  },
  editorButton: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '8px',
  },
  crossIcon: {
    '&.MuiButtonBase-root': {
      padding: '6px',
      border: '0.75px solid #DF372B',
      height: '24px',
      minWidth: '24px',
      minHeight: '24px',
      borderRadius: '6px',
    },
    '& svg': {
      height: '12px',
      width: '12px',
    },
  },
  checkIcon: {
    '&.MuiButtonBase-root': {
      height: '24px',
      minWidth: '24px',
      minHeight: '24px',
      padding: '0',
    },
    '& svg': {
      height: '24px',
      width: '24px',
    },
  },
  assignShiftBodyAddToursText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  assignShiftTours: {
    paddingTop: '4px',
    // borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  assignShiftToursContentRowActions: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    // alignItems: 'center',
    gap: '16px',

    '& > div': {
      width: '286px',
    },
  },

  assignShiftToursContentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    // alignItems: 'baseline',
    gap: '16px',
  },

  assignShiftShowTours: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    marginTop: '16px',
  },

  assignShiftToursContentRowTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  assignShiftToursContentRowText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  assignShiftShowToursHeader: {
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    background: theme.palette.surfaceBrandSubtle,
    padding: '8px',
  },

  assignShiftShowToursTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  assignShiftToursDelete: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',

    '& path': {
      stroke: theme.palette.textPrimary,
    },
  },
  assignShiftToursDeleteDisable: {
    pointerEvents: 'none',
  },

  assignShiftShowToursBody: {
    padding: '12px',
  },

  assignShiftShowToursBodyDropDown: {
    height: '44px !important',
    '& div': {
      '& div': {
        '& h6': {
          fontSize: '16px',
          fontWeight: 400,
        },
      },
    },
  },

  assignDrawerHeaderTours: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  assignDrawerHeaderToursBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      width: '36px',
      height: '36px',
      minWidth: '36px',

      '& .MuiSvgIcon-root ': {
        width: '20px',
        height: '20px',
      },
    },
  },

  createToursBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  createToursBodyContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    gap: '16px',
    padding: '16px 0',
  },

  createToursBodyInfo: {
    padding: 0,
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    gap: '16px',
  },

  createToursInput: {
    // paddingTop: '16px',
    '& .MuiFormControl-root': {
      width: '100%',
      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  chooseReassignOfficer: {
    paddingTop: '8px',
    paddingBottom: '12px',
    '& .MuiFormControl-root': {
      width: '100%',
      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  createToursDropDown: {
    height: '44px',
    '& div': {
      '& div': {
        '& h6': {
          fontSize: '16px',
          fontWeight: 400,
        },
      },
    },
  },

  createToursCheckpoints: {
    padding: '10px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    textTransform: 'capitalize',
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'column',
    width: '100%',
    gap: '8px',
  },
  checkpointNameWrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  LeftListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  BlueNumerICon: {
    '&.MuiTypography-root ': {
      padding: '8px',
      backgroundColor: '#7b7a7a6e',
      display: 'flex',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'var(--8, 8px)',
      color: theme.palette.textOnColor,
      fontSize: '12px',
    },
  },

  createToursCheckpointsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  createToursCheckpointsText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  assignShiftBodyAddToursDescription: {
    '&.MuiFormControl-root': {
      marginTop: '12px',
      width: '100%',

      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  createToursTime: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },

  createToursTimePicker: {
    flex: '1 1 33.33%',
    '& label.MuiFormLabel-root': {
      alignItems: 'center',
    },
  },

  createToursDuration: {
    flex: '1 1 33.33%',
  },

  createToursOccurancesBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
      width: 'fit-content',
      fontSize: '16px',
      fontWeight: 700,
      color: theme.palette.textPrimary,

      '&:hover': {
        backgroundColor: 'transparent',
      },

      '& .MuiButton-endIcon': {
        '& svg': {
          '& path': {
            stroke: theme.palette.textPrimary,
          },
        },
      },
    },
  },

  createToursOccurances: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  assignDrawerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px 24px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    flexShrink: 0,
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
    background: theme.palette.background.paper,
  },

  singleOfficerOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
  },

  singleOfficerOptionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },

  singleOfficerOptionImage: {
    '&.MuiAvatar-root': {
      width: '32px',
      height: '32px',
    },

    '& > img': {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
    },
  },

  singleTourAdd: {
    marginTop: '4px',
  },

  singleTourOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },

  singleTourOptionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  singleOfficerOptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
  },

  singleTourOptionBtn: {
    '&.MuiButtonBase-root': {
      padding: 0,
      height: 'auto',
      minWidth: 'auto',

      '&:hover': {
        background: 'transparent',
      },
    },

    '& svg': {
      width: '18x',
      height: '18px',
    },
  },

  assignShiftShowToursBodyInside: {
    '& > .MuiBox-root': {
      '@global': {
        '*::-webkit-scrollbar-track': {
          '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(128, 128, 128, 0.4)',
          outline: '1px solid transparent',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'grey',
        },
      },

      '& > .MuiBox-root': {
        padding: '12px',
      },
    },
  },

  labelArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  rateLabelField: {
    '&.MuiFormControl-root': {
      width: '317px',
    },

    '& .MuiInputBase-root': {
      minWidth: '317px',
    },
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    columnGap: '16px',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    flexDirection: 'column',
  },
  hourlyRateTitle: {
    display: 'flex',
    columnGap: '8px',
  },
  inputStyle: {
    marginTop: '12px',
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '18px',
      height: '18px',
    },
  },
  checkboxLabelText: {
    cursor: 'pointer',
    '&.MuiFormLabel-root': {
      color: theme.palette.textPrimary,
      fontSize: '16px',
      marginBottom: '0px',
      fontWeight: '500',
      lineHeight: '20px',
    },
  },
  radioDiv: {
    gap: '30px',
    paddingTop: '8px',
  },
  assignDrawerHeaderBottomSkeleton: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',

    '& .MuiSkeleton-root': {
      width: '50%',
      height: '30px',
      borderRadius: '8px !important',
    },
  },

  titleSkeleton: {
    '&.MuiSkeleton-root': {
      width: '164.5px',
      height: '30px',
      borderRadius: '8px !important',
    },
  },

  customDropdownOptionLink: {
    padding: '12px 0 16px 0',
    margin: '0 16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    marginBottom: '8px',
    '& .MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textBrand,
      },
    },
    '& .MuiTypography-root': {
      fontWeight: '500',
      color: theme.palette.textBrand,
    },
  },

  locationIcon: {
    position: 'relative',
    top: '8px',
  },

  assignShiftSkeleton: {
    padding: '12px 0',

    '& .MuiSkeleton-root': {
      width: '100%',
      height: '72px',
      borderRadius: '8px !important',
    },
  },
  shiftsSkeleton: {
    borderRadius: '8px',
    padding: '12px 24px ',
    '& .MuiSkeleton-root': {
      width: '100%',
      height: '72px',
      borderRadius: '8px !important',
    },
  },

  singleTourSkeleton: {
    padding: '12px 24px',
    '& .MuiSkeleton-root': {
      width: '100%',
      height: '72px',
      borderRadius: '8px !important',
    },
  },

  assignShiftOfficerMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 14px 12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
  },

  assignShiftOfficerMeDisabled: {
    pointerEvents: 'none',
    cursor: 'not-allowed !important',
    backgroundColor: theme.palette.surfaceGreySubtle,
    opacity: '0.5',
  },

  assignShiftOfficerMeSelected: {
    backgroundColor: theme.palette.surfaceBrandSubtle,
  },

  assignShiftOfficerMeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    width: '102px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'capitalize',
  },

  singleTourAddWrapper: {
    padding: '0 12px 12px',
  },

  assignRangeDatePickers: {
    marginBottom: '16px',
    '& .MuiFormControl-root': {
      width: '100%',
      '& .MuiInputBase-root': {
        minWidth: '100%',
      },
    },
  },

  officerDropdownSkeleton: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '44px',
      borderRadius: '8px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },
  daySelectionWrapper: {
    padding: '4px 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  reassignmentBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,

    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  officerLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    paddingTop: '16px',

    '& .MuiAvatar-root ': {
      width: '32px',
      height: '32px',
    },

    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  officerLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  officerLabelInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  reassignShift: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    padding: '24px 24px 16px',
    gap: '16px',
  },

  reassignShiftTimer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    paddingTop: '8px',
    '& .MuiBox-root': {
      flex: '1 1 33.333%',
    },
  },

  reassignShiftOfficer: {
    width: '100%',

    '&.MuiSkeleton-root': {
      width: '100%',
      height: '44px',
      borderRadius: '8px !important',
      transformOrigin: 'none',
      transform: 'none',
    },
  },

  reassignShiftChip: {
    marginTop: 'auto',

    '& .MuiChip-root': {
      width: '100%',
      justifyContent: 'flex-start',
      padding: '8px 12px',
      borderRadius: '8px',
      textTransform: 'unset',

      '& .MuiChip-label': {
        fontSize: '14px',
        lineHeight: '20px',
      },

      '& svg': {
        width: '18px',
        height: '18px',
        '& path': {
          stroke: theme.palette.textBrand,
        },
      },
    },
  },

  reassignShiftChipInScroll: {
    marginTop: 0,
  },

  officerLabelBtn: {
    cursor: 'pointer',
    '& svg': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  officerLabelBtnDisabled: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    '& svg': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textDisabled,
      },
    },
  },
  cancelShiftDialogPaper: {
    '&.MuiPaper-root': {
      borderRadius: '12px',
      padding: '8px 0 0',
      boxShadow:
        '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.1)',
    },
  },
  cancelShiftContentWrapper: {},
  cancelShiftContentWrapperActive: {
    backgroundColor: theme.palette.surfaceWhite,
  },
  cancelShiftHeaderRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    flexDirection: 'column',
  },
  cancelShiftIconCircle: {
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: '50%',
    backgroundColor: '#E43F32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 500,
  },
  cancelShiftTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
    },
  },
  cancelShiftSubtitle: {
    marginTop: '4px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  cancelShiftRadioRoot: {
    marginBottom: 0,
    '& .MuiFormControlLabel-label': {
      ...theme.typography.subtitle2,
      color: theme.palette.textPrimary,
    },
  },
  cancelShiftRadioDivider: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  cancelShiftCustomRangePanel: {
    marginTop: '8px',
    marginBottom: '8px',
    padding: '12px 0 0',
  },
  cancelShiftCustomRangePanelActive: {
    '& $cancelShiftCustomRangeContainer': {
      borderColor: theme.palette.error.main,
      backgroundColor: theme.palette.surfaceAlertSubtle,
    },
  },
  cancelShiftCustomRangeContainer: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
    padding: '16px',
  },
  cancelShiftCustomRangeRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  cancelShiftCustomRangeField: {
    flex: 1,
  },
  cancelShiftCustomRangeLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginBottom: '8px',
    },
  },
  cancelShiftDateField: {
    '&.calendar': {
      '& .MuiInputBase-root': {
        borderRadius: '12px',
        backgroundColor: theme.palette.surfaceWhite,
        height: '44px',
      },
      '& .MuiOutlinedInput-input': {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
      },
      '& .MuiInputAdornment-root': {
        marginRight: '2px',
      },
      '& svg': {
        width: '20px',
        height: '20px',
      },
    },
  },
  cancelShiftDaysLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginBottom: '10px',
    },
  },
  cancelShiftReasonLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '6px',
      marginTop: '8px',
    },
  },
  cancelShiftReasonAsterisk: {
    color: theme.palette.error.main,
  },
  cancelShiftReasonField: {
    width: '100%',
  },
  cancelShiftActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
  },
  splitCustomDutyToggles: {
    padding: '4px 12px',
    minWidth: '56px',
    width: '56px',
    height: '28px',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '20px',
    borderRadius: '40px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    color: theme.palette.textPrimary,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: '8px',
  },
  dayContent: {
    padding: '16px 0',
  },
  TourTemplatesDrawerWrapper: {
    flex: '1',
    padding: '0 24px 24px 24px',
    overflow: 'auto',
  },
  customDropdownCheckboxIcon: {
    height: '14px',
  },
  colorChip: {
    '&  .MuiChip-root.MuiChip-colorSuccess': {
      color: theme.palette.textSuccess,
      background: theme.palette.surfaceSuccessSubtle,
    },
    '&  .MuiChip-root.MuiChip-colorError': {
      color: theme.palette.textAlert,
      background: theme.palette.surfaceAlertSubtle,
    },
    '&  .MuiChip-root.MuiChip-colorWarning': {
      background: theme.palette.surfaceWarningSubtle,
      color: '#F4780B',
    },
  },
  labelFlex: {
    display: 'flex',
    flexDirection: 'column',
    '& span.MuiTypography-root.MuiTypography-body3': {
      color: theme.palette.textSecondary3,
    },
  },

  grayAlert: {
    '&.MuiAlert-standard': {
      borderRadius: '10px',
      background: theme.palette.surfaceGreySubtle,
      padding: '12px',
      alignItems: 'center',
      '& .MuiAlert-message': {
        color: theme.palette.textSecondary3,
        fontWeight: 500,
        padding: '0',
      },
      '& .MuiAlert-icon': {
        color: theme.palette.textBrand,
        padding: '0',
        marginRight: '6px',
      },
    },
  },
  editShiftTimeTabLabelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    '& .MuiTypography-root': {
      textAlign: 'start',
      whiteSpace: 'nowrap',
    },
  },
  editShiftTimeWrapper: {
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '10px',
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  },
  assignShiftToursScrollOnly: {
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
  },
  editShiftTimeTabs: {
    '&.MuiTabs-root': {
      minHeight: 'auto',
      width: '100%',
    },
    '& .MuiTabs-flexContainer': {
      gap: '10px',
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      padding: '16px 0',
    },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
  },
  editShiftTimeTab: {
    '&.MuiButtonBase-root': {
      minHeight: 'auto',
      padding: '8px 16px',
      borderRadius: '10px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      backgroundColor: theme.palette.surfaceWhite,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      textTransform: 'none',
      flex: 1,
      maxWidth: 'none',
    },
    '&.Mui-selected': {
      backgroundColor: theme.palette.surfaceBrandSubtle,
      borderColor: theme.palette.textBrand,
    },
  },
  editShiftTimeTabContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  editShiftTimeTabLabelPrimary: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 500,
      display: 'flex',
    },
  },
  editShiftTimeTabLabelSecondary: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  editShiftTimeBody: {},
  editShiftTimeRadio: {
    '&.MuiRadio-root': {
      padding: 0,
      marginRight: '4px',
    },
  },
  editShiftTimeDropdown: {
    height: '44px',
    '& div': {
      '& div': {
        '& h6': {
          fontSize: '16px',
          fontWeight: 400,
        },
      },
    },
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  thisShiftSettingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  thisShiftSettingText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',

    '& .MuiTypography-body1': {
      color: theme.palette.textPrimary,
      fontWeight: 600,
    },

    '& .MuiTypography-body2': {
      color: theme.palette.textSecondary3,
    },
  },
  thisShiftInlineFieldsRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',

    '& > .MuiBox-root': {
      flex: 1,
    },
  },
  thisShiftSwitch: {
    '& .MuiSwitch-switchBase': {
      '&.Mui-checked': {
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.textBrand,
        },
      },
      '&:not(.Mui-checked) + .MuiSwitch-track': {
        backgroundColor: theme.palette.surfaceWhite,
        border: `1px solid ${theme.palette.borderSubtle1}`,
      },
    },
    '& .MuiSwitch-track': {
      opacity: 1,
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  selectedDaysBtns: {
    width: '56px',
    height: '28px',
    borderRadius: '40px',
    padding: '4px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
    textTransform: 'capitalize',
    color: theme.palette.textPrimary,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    cursor: 'pointer',
    textAlign: 'center',
  },
  DaysWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  thisShiftSettingTextDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  locationInfoIcon: {
    color: '#146DFF',
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  locationInfoWrapper: {
    paddingTop: '6px',
  },
  toursInfoBox: {
    marginTop: '8px',
    borderRadius: '8px',
    backgroundColor: '#E5F6FF',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toursInfoBannerBelowSubtitle: {
    marginTop: '12px',
    marginBottom: '16px',
    borderRadius: '8px',
    backgroundColor: '#E5F6FF',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  toursInfoIcon: {
    width: '16px',
    height: '16px',
    color: '#146DFF',
    flexShrink: 0,
  },
  toursInfoText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  chnagesToApply: {
    padding: '16px',
    backgroundColor: '#FFF4E6',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexShrink: 0,
    marginBottom: '16px',
  },
  changesToApplyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontWeight: 700,
      fontSize: '14px',
      lineHeight: '20px',
    },
  },
  changesToApplyContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  changesToApplyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  changesToApplyLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      width: '150px',
    },
  },
  changesToApplyArrow: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '14px',
      lineHeight: '12px',
    },
  },
  changesToApplyValue: {
    '&.MuiTypography-root': {
      color: '#000',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',
      textTransform: 'capitalize',
    },
  },
  changesToApplyOfficerValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  changesToApplyAvatar: {
    '&.MuiAvatar-root ': {
      width: '16px',
      height: '16px',
    },
  },

  disabledEditShiftTimeTabLabelPrimary: {
    '&.MuiTypography-root': {
      color: theme.palette.textDisabled,
      fontWeight: 500,
      display: 'flex',
    },
  },

  disabledEditShiftTimeTabLabelSecondary: {
    '&.MuiTypography-root': {
      color: theme.palette.textDisabled,
    },
  },

  reassigmentShiftChip: {
    paddingBottom: '16px',
    '& .MuiChip-root': {
      width: '100%',
      justifyContent: 'flex-start',
      padding: '8px 12px',
      borderRadius: '8px',
      textTransform: 'unset',

      '& .MuiChip-label': {
        fontSize: '14px',
        lineHeight: '20px',
      },

      '& svg': {
        width: '18px',
        height: '18px',
        '& path': {
          stroke: theme.palette.textBrand,
        },
      },
    },
  },

  showReassignmentSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    paddingBottom: '12px',
  },

  showReassignmentWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  invalidFeedback: {
    '&.MuiTypography-root': {
      marginTop: '8px',
      color: theme.palette.textAlert,
      textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    },
  },
}));
