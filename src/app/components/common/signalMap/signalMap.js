import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainMapSectionWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customSearchColor: {
    backgroundColor: theme.palette.surfaceWhite,
    borderRadius: '8px',
    minWidth: '295px !important',
    height: '36px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        minWidth: '295px !important',
        '& .MuiOutlinedInput-notchedOutline': {
          minWidth: '295px !important',
        },
      },
    },
  },

  mainMapSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftMapSection: {
    position: 'absolute',
    top: '50px',
    left: '12px',
    zIndex: 10,
  },

  leftMapSectionInternal: {
    backgroundColor: theme.palette.surfaceWhite,
    height: '100%',
    top: '0',
    left: '0',
    zIndex: '1',
    position: 'absolute',
    minWidth: '322px',
  },

  dropDownSection: {
    display: 'flex',
    gap: '8px',
  },

  hotelSections: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  customSearchColorOne: {
    maxHeight: '36px !important',
    width: '266px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },

  flexSection: {
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },

  hotelMainSection: {
    marginTop: '143px',
  },

  borderedSection: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'fixed',
    zIndex: '2',
    backgroundColor: theme.palette.surfaceWhite,
  },

  rightMapSection: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
  },

  runSheetName: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '&.MuiTypography-root': {
      // '&:hover': {
      //   textDecoration: 'underline',
      //   '& svg': {
      //     display: 'block',
      //   },
      // },
      // '& svg': {
      //   display: 'none',
      // },
    },
  },
  tooltipSpace: {
    justifyContent: 'space-between',
    display: 'flex',
  },
  mapInternalContent: {
    display: 'flex',
    gap: '4px',
    background: 'black',
    height: '36px',
    padding: '4px 12px',
    borderRadius: '8px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    color: theme.palette.textOnColor,
    alignItems: 'center',
  },

  mapInternalContentOne: {
    display: 'flex',
    gap: '4px',
    backgroundColor: theme.palette.surfaceWhite,
    height: '36px',
    padding: '4px 12px',
    borderRadius: '8px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    color: theme.palette.textOnColor,
    alignItems: 'center',
  },

  siteTypo: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  numberOfRooms: {
    '&.MuiTypography-root': {
      paddingTop: '10px',
    },
  },

  hotelDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  roomImage: {
    width: '77px',
    height: '77px',
    borderRadius: '8px',
  },
  siteVehicleBtn: {
    '&.MuiButtonBase-root': {
      backgroundColor: theme.palette.textPrimary,
      border: `1px solid ${theme.palette.textPrimary}`,
      '&:hover': {
        backgroundColor: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.textPrimary}`,
      },
      '&:active': {
        backgroundColor: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.textPrimary}`,
      },
    },
  },
  boundaryBtnVehicle: {
    '&.MuiButtonBase-root': {
      backgroundColor: theme.palette.textPrimary,
      border: `1px solid ${theme.palette.textPrimary}`,
      '&:hover': {
        backgroundColor: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.textPrimary}`,
      },
      '&:active': {
        backgroundColor: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.textPrimary}`,
      },
    },
  },
  boundaryBtn: {
    '&.MuiButtonBase-root': {
      backgroundColor: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.surfaceWhite}`,
      color: theme.palette.textPrimary,
      '&:hover': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.surfaceWhite}`,
      },
      '&:active': {
        backgroundColor: theme.palette.surfaceWhite,
        color: theme.palette.textPrimary,
        border: `1px solid ${theme.palette.surfaceWhite}`,
      },
    },
    '& svg': {
      '& path': {
        fill: 'black',
      },
    },
  },
  hotelContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  belowMapSection: {
    gap: '16px',
    bottom: '40px',
    display: 'flex',
    zIndex: '10',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: '72px',
    padding: '8px 12px',
    background: theme.palette.surfaceWhite,
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
  },
  blueMapSection: {
    gap: '16px',
    bottom: '40px',
    cursor: 'pointer',
    display: 'flex',
    zIndex: '10',
    color: 'white',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: '72px',
    padding: '8px 12px',
    background: theme.palette.surfaceBrandHover,
    borderRadius: '8px',
    border: `1px solid ${theme.palette.surfaceBrandHover}`,
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
  },
  internalBelowMapSections: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  leadsMapText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  leadsMapRunSheetText: {
    '&.MuiTypography-root': {
      color: 'white',
    },
  },
  viewDetailButton: {
    color: ' #146DFF',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '14px',
    textDecorationLine: 'underline',
    cursor: 'pointer',
    textTransform: 'capitalize',
  },
  industyName: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '700',
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
    },
  },
  industyDetail: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: '500',
      lineHeight: '14px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      textTransform: 'capitalize',
      marginBottom: '4px',
    },
  },
  skeletonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    gap: '4px',
  },
  toolTipWrapper: {
    width: '190px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    gap: '4px',
    padding: '0 0 4px 4px',
    borderRadius: '8px',
    '& .gm-style-iw-d': {
      overflow: 'hidden !important',
    },
  },
  roomImageTool: {
    width: '100%',
    height: '96px',
    borderRadius: '6px',
    marginBottom: '4px',
    backgroundSize: 'cover',
    // width: '248px',
  },
  borderDiv: {
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '4px',
  },
  // officer Tooltip?
  officerTooltipWrapper: {
    padding: '16px',
    minWidth: '343px',
    maxWidth: '400px',
  },
  officerTooltipHeader: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  officersSiteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      textTransform: 'capitalize',
      marginBottom: '3px',
    },
    cursor: 'pointer',
  },
  officerIndustyName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      wordBreak: 'break-word',
      textTransform: 'capitalize',
    },
  },
  officerDetailsWrapper: {
    padding: '12px 0px 0px 0px',
    display: 'flex',
    gap: '10px',
  },
  officerProfile: {
    height: '40px',
    minWidth: '40px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '100%',
    overflow: 'hidden',
  },
  officerProfileDetails: {
    width: '100%',
  },
  officerImage: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    objectFit: 'cover',
  },
  officerName: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  officerProgressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // green?
  indicatorGreen: {
    position: 'relative',
    paddingLeft: '12px',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '8px',
      height: '8px',
      backgroundColor: theme.palette.surfaceSuccessStrong,
      borderRadius: '50%',
    },
  },
  // blue?
  indicatorBlue: {
    position: 'relative',
    paddingLeft: '12px',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '8px',
      height: '8px',
      backgroundColor: theme.palette.textBrand,
      borderRadius: '50%',
    },
  },
  indicatorRed: {
    position: 'relative',
    paddingLeft: '12px',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '8px',
      height: '8px',
      backgroundColor: theme.palette.surfaceAlertStrong,
      borderRadius: '50%',
    },
  },
  indicatorOrange: {
    position: 'relative',
    paddingLeft: '12px',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '8px',
      height: '8px',
      backgroundColor: theme.palette.surfaceWarningStrong,
      borderRadius: '50%',
    },
  },
  viewDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: ' #146DFF',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '16px',
    cursor: 'pointer',
    textTransform: 'capitalize',
    '& svg': {
      height: '20px',
      width: '20px',
      '& path': {
        stroke: ' #146DFF',
      },
    },
  },
  dateWrraper: {
    display: 'flex',
    gap: '2px',
    textAlign: 'center',
    alignItems: 'center',
  },
  iconWrraper: {
    display: 'grid',
    gridTemplateColumns: '1fr 12fr ',
    alignItems: 'flex-start',
  },
  nameWrapperMain: {
    display: 'flex',
    gap: '7px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gotoNextIcon: {
    cursor: 'pointer',
    '& svg': {
      '& g': {
        '& path': {
          stroke: '#262527',
        },
      },
    },
  },
  mainToolTipBoxs: {
    width: '260px',
    height: 'auto',
    maxHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    overflow: 'auto',
  },
  contactInformationName: {
    '&.MuiTypography-root': {
      wordBreak: 'break-word',
      marginBottom: '4px',
      color: theme.palette.textPrimary,
    },
  },
  addressName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      display: 'flex',
      gap: '4px',
      alignItems: 'flex-start',
    },
  },
  hitWrapper: {
    display: 'flex',
    flexDirection: 'column',
    background: '#f5f5f6',
    width: 'auto',
    padding: ' 6px',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  hitWrapperMain: {
    gap: '4px',
  },
  hitTime: {
    '&.MuiTypography-root': {
      whiteSpace: 'nowrap',
      color: '#444446',
    },
  },
  // roomImageTool: {
  //   width: '100%',
  //   height: '96px',
  //   borderRadius: '6px',
  //   marginBottom: '4px',
  //   backgroundSize: 'cover',
  //   // width: '248px',
  // },

  siteBoxWrapper: {
    borderRadius: '8px',
    padding: '12px',
    width: '322px',
  },

  siteDetails: {
    display: 'flex',
    gap: '10px',
    alignItems: 'stretch',
  },

  siteImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  siteImageWrapper: {
    borderRadius: '8px',
    width: '66px',
    height: '66px',
    minWidth: '66px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    overflow: 'hidden',
    display: 'flex',
  },

  siteDetailsRightSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  siteNameWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  siteName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      textTransform: 'capitalize',
    },
  },

  officerLatLongWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  internalMapBox: {
    '&.MuiBox-root': {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      backgroundColor: theme.palette.surfaceWhite,
      border: `1px solid ${theme.palette.surfaceWhite}`,
      color: theme.palette.textPrimary,
      borderRadius: '8px',
      padding: '4px 8px',
      boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    },
    '& .MuiFormLabel-root ': {
      marginBottom: '0px',
    },
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },
  },
}));
