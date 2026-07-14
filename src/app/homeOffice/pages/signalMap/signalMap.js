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
    top: '16px',
    left: '12px',
    zIndex: 10,
  },
  leftMapSectionInternal: {
    backgroundColor: theme.palette.surfaceWhite,
    height: '100%',
    // top: '0',
    // left: '0',
    // zIndex: '1',
    // position: 'absolute',
    // minWidth: '322px',
    // transition: 'left .5s cubic-bezier(0.820, 0.085, 0.395, 0.895)',
  },
  dropDownSection: {
    display: 'flex',
    gap: '8px',
  },
  dropdownWrap: {
    flex: '1 !important',
  },
  franchiseCustomDropdown: {
    flex: '1 !important',
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
    position: 'relative',
  },
  hotelMainSection: {
    marginTop: '133px',
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
  },
  hotelContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listMapSection: {
    width: '100%',
    // maxWidth: 322,
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  mapIconClose: {
    position: 'absolute',
    right: '0',
    top: '4px',
    zIndex: '3',
    width: '45px',
    height: '45px',
  },
  listText: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between',
  },
  ownerName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  lefrDrawer: {
    '& .MuiBackdrop-root.MuiModal-backdrop': {
      backgroundColor: 'transparent',
    },
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation16.MuiDrawer-paper.MuiDrawer-paperAnchorLeft':
      {
        left: '77px !important',
        height: 'calc(100% - 60px)',
        bottom: '0px',
        top: 'unset',
        boxShadow: 'none',
        width: '350px',
      },
  },
}));
