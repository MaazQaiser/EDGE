import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainMapSectionWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
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
    top: '50px',
    right: '12px',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
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

  contactInformation: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '24px',
      color: theme.palette.textSecondary3,
      wordBreak: 'break-word',
    },
  },
  subtitle2: {
    '&.MuiTypography-root': {
      wordBreak: 'break-word',
    },
  },
  modalHeading: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      lineHeight: '24px',
      fontWeight: '700',
      color: theme.palette.textSecondary1,
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

  mainToolTipBox: {
    width: '260px',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
  },

  markerModal: {
    left: 'calc(100% - 22%) !important',
    top: 'calc(100% - 68%) !important',
    '& span.MuiSkeleton-root': {
      borderRadius: '5px !important',
    },
  },
}));
