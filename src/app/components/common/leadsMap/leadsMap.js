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
    minWidth: '225px !important',
    height: '36px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        minWidth: '225px !important',
        '& .MuiOutlinedInput-notchedOutline': {
          minWidth: '225px !important',
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
    top: '16px',
    left: '24px',
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
    top: '16px',
    right: '24px',
    zIndex: 10,
    display: 'flex',
    gap: '16px',
  },
  mapInternalContent: {
    display: 'flex',
    gap: '4px',
    background: theme.palette.surfaceGreyStrong2,
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
  // leads map section
  leadsMapSection: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    padding: '10px 16px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    height: '36px',
  },
  showText: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: '500',
      lineHeight: '14px',
      color: theme.palette.textPlaceholder,
    },
  },
  checkBoxText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '20px',
      color: theme.palette.textPrimary,
    },
  },
  chekBoxMap: {
    padding: '0 !important',
  },
  internalMapBox: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  expandedSeachBar: {
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid grey',
    background: 'white',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
    width: '109px',
    height: '36px',
    '& .MuiInputBase-root': {
      minWidth: '0px !important',
    },
  },
  calendarHeaderToolbarToggle: {
    gap: '4px',
    '&.MuiToggleButtonGroup-root': {
      borderRadius: '34px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      background: `${theme.palette.surfaceGreyStrong2}`,
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 4px',

      '& .MuiToggleButtonGroup-grouped': {
        padding: '5px 5px',
        border: '0 ',
        height: 'auto',
        borderRadius: '34px !important',
      },
    },
  },
  calendarHeaderToolbarToggleBtn: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textOnColor}`,
      border: '1px solid transparent',
      display: 'flex',
      gap: '6px',
      '&:hover': {
        backgroundColor: `${theme.palette.surfaceWhite}`,
        color: theme.palette.textSecondary1,
      },

      '&:disabled': {
        color: `${theme.palette.surfaceWhite}`,
        backgroundColor: `${theme.palette.surfaceBrandDisabled}`,
        border: `1px solid ${theme.palette.surfaceBrandDisabled}`,
      },

      '&.Mui-selected': {
        backgroundColor: `${theme.palette.surfaceWhite}`,
        color: `${theme.palette.textSecondary1}`,
        '&:hover': {
          backgroundColor: `${theme.palette.surfaceWhite}`,
          color: 'black !important',
        },
      },
    },
  },
  belowMapSection: {
    transform: 'translateX(-50%)',
    gap: '20px',
    bottom: '32px',
    display: 'flex',
    zIndex: '10',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: '-145px',
    padding: '10px 16px',
    background: theme.palette.surfaceWhite,
    borderRadius: '55px',
    boxShadow: '0px 4px 14px 0px rgba(0, 0, 0, 0.10)',
  },
  internalBelowMapSections: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
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
  leadsMapText: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
    },
  },

  leadsMapCreateBtn: {
    '&.MuiButtonBase-root': {
      '& .MuiButton-startIcon': {
        '& svg': {
          width: '14px',
          height: '14px',
        },
      },
    },
  },

  collapse: {
    minWidth: '225px !important',
    width: '225px',
    '& .MuiFormControl-root': {
      '& .MuiInputBase-root': {
        minWidth: '225px !important',
        width: '225px',
        '& .MuiOutlinedInput-notchedOutline': {
          minWidth: '225px !important',
          width: '225px',
        },
      },
    },
  },
  '@keyframes slideUp': {
    from: {
      transform: 'translate(-50%, 100%)',
    },
    to: {
      transform: 'translate(-50%, 0)',
    },
  },

  popUp: {
    cursor: 'pointer',
    position: 'fixed',
    bottom: '34px',
    left: '20%',
    transform: 'translateX(-50%)',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
    padding: '12px',
    borderRadius: '8px',
    animation: '$slideUp 0.5s ease-in-out',
    background: 'black',
    color: theme.palette.textOnColor,
  },
  popUpText: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '700',
      lineHeight: '16px',
      color: theme.palette.textOnColor,
    },
  },
  popUpContent: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '16px',
      color: theme.palette.textDisabled,
    },
  },
  popUpInnerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  mainToolTipBoxs: {
    width: '260px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
  },
  mainToolTipBox: {
    width: '187px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0',
    borderRadius: '8px',
  },
  roomImageTool: {
    width: '245px',
    height: '120px',
    borderRadius: '6px',
  },
  contactInformation: {
    '&.MuiTypography-root': {
      fontSize: '10px',
      fontWeight: '500',
      lineHeight: '14px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
    },
  },
  contactInfoDetail: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '500',
      lineHeight: '14px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      textTransform: 'capitalize',
    },
  },
  industyName: {
    '&.MuiTypography-root': {
      fontSize: '12px',
      fontWeight: '700',
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      marginBottom: '4px',
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
  contactInformationName: {
    '&.MuiTypography-root': {
      wordBreak: 'break-word',
      marginBottom: '4px',
    },
  },
  addressName: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '700',
      lineHeight: '18px',
      color: theme.palette.textPrimary,
      wordBreak: 'break-word',
      marginBottom: '6px',
    },
  },
  viewDetailButton: {
    color: ' #146DFF',
    fontSize: '10px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '14px',
    textDecorationLine: 'underline',
    cursor: 'pointer',
  },
  markerModal: { left: '55% !important', top: '50% !important' },
}));
