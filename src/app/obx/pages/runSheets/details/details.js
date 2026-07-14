import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',

    overflow: 'auto',
    flex: '1 1',
  },
  leftSide: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    justifyContent: 'space-between',
    transition: 'width 0.3s',
    width: (props) => (props.expanded ? '0' : '50%'),
    overflow: 'hidden',
  },
  innerUpperWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  bottomSticky: {
    backgroundColor: theme.palette.surfaceWhite,
    padding: '8px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '8px 24px',
    },
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  flexbtn: {
    display: 'flex',
    gap: '8px',
  },
  rightSide: {
    transition: 'width 0.3s',
    overflow: 'auto',
    width: (props) => (props.expanded ? '100%' : '50%'),
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
    // textTransform: 'capitalize',
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
    zIndex: 999,
    '&.MuiButtonBase-root': {
      position: 'absolute',
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
  stepContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  stepTabContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  stepperWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',

    '&  .MuiStepConnector-root, & span.MuiStepLabel-iconContainer': {
      display: 'none !important',
    },
    '& .MuiStepper-root.MuiStepper-horizontal': {
      justifyContent: 'space-between',
      padding: '24px 32px',
      [theme.breakpoints.down('lg')]: {
        padding: '24px 24px',
      },
      '& .MuiStep-root': {
        cursor: 'default',
        flex: '0 0 33.33%',
        [theme.breakpoints.down('lg')]: {
          flex: 'auto',
        },
        padding: '0',
        clipPath: 'polygon(94% 0%, 100% 50%, 94% 100%, 0% 100%, 6% 50%, 0% 0%)',
        backgroundColor: theme.palette.surfaceGreySubtle,
        '&:first-child': {
          clipPath: 'polygon(94% 0%, 100% 50%, 94% 100%, 0% 100%, 0% 50%, 0% 0%)',
          borderTopLeftRadius: '5px',
          borderBottomLeftRadius: '5px',
          '& span.MuiStepLabel-label': {
            padding: '8px 16px',
          },
        },
        '&:last-child': {
          clipPath: 'polygon(100% 0%, 100% 50%, 100% 100%, 0% 100%, 6% 50%, 0% 0%)',
          borderTopRightRadius: '5px',
          borderBottomRightRadius: '5px',
        },
        '&:hover': {
          backgroundColor: theme.palette.surfaceBrandSubtle,
        },
        '& svg': {
          '& path': {
            fill: theme.palette.textSuccess,
          },
        },
      },
      '& .Mui-completed': {
        backgroundColor: theme.palette.surfaceSuccessSubtle,
        '& svg': {
          '& path': {
            fill: `${theme.palette.textSuccess} !important`,
          },
        },
        '& h6.MuiTypography-root': {
          color: theme.palette.textPrimary,
        },
      },

      '& span.MuiStepLabel-label': {
        padding: '8px 24px',
        [theme.breakpoints.down('lg')]: {
          padding: '8px 19px',
        },
        color: theme.palette.textDisabled,
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
      },
      '& h6.MuiTypography-root': {
        color: theme.palette.textDisabled,
      },
      '& span.MuiTypography-root': {
        color: theme.palette.textDisabled,
      },
    },
  },

  activeStepWrapper: {
    backgroundColor: `${theme.palette.surfaceBrand} !important`,
    '& h6.MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,
    },
    '& span.MuiTypography-root': {
      color: `${theme.palette.textOnColor} !important`,

      position: 'relative',
    },
    '& svg': {
      '& path': {
        fill: `${theme.palette.textOnColor} !important`,
      },
    },
  },
  stepperIcon: {
    marginLeft: '5px',
  },
  stepperText: {
    [theme.breakpoints.down('mlgg')]: {
      display: 'none',
    },

    '& .MuiTypography-root': {
      color: theme.palette.textDisabled,
      fontWeight: '400',
      [theme.breakpoints.down('mlg')]: {
        fontSize: '11px',
      },
    },
  },

  steperName: {
    display: 'flex',
    alignItems: 'center',
  },
  splitHeader: {
    padding: '20px 32px 16px 32px',
    background: theme.palette.surfaceGreySubtle,
  },
  arrowtext: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    marginBottom: '8px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  splitHeadertext: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingLeft: '23px',
  },
  dots: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
    '&.MuiTypography-root.MuiTypography-subtitle2 , &.MuiTypography-root.MuiTypography-h5': {
      color: theme.palette.textPrimary,
    },
  },

  goToBox: {
    zIndex: '99',
    maxWidth: '383px',
    margin: '0 auto',
    width: '100%',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: '0px',
    right: '0px',
    background: theme.palette.surfaceWhite,
    padding: '20px 16px',
    display: 'flex',
    gap: '16px',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
  },
}));
