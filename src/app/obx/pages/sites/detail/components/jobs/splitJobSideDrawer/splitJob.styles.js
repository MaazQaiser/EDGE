import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  splitDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  splitDrawerHeader: {
    padding: '24px 24px 0 24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  splitDrawerHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  splitDrawerHeaderTopRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  splitDrawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  splitDrawerHeaderCloseBtn: {
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

  splitDrawerHeaderTopRightLink: {
    color: theme.palette.textBrand,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '20px',
  },

  splitDrawerHeaderBottom: {
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '48px',
  },

  splitDrawerHeaderBottomContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  splitDrawerHeaderBottomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  splitDrawerCalendarIcon: {
    '& path': {
      fill: theme.palette.textPlaceholder,
    },
  },

  splitDrawerBody: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  splitDrawerBodyTopFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },

  splitDrawerBodyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  splitDrawerBodySubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  splitDrawerBodyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  splitDrawerBodyTop: {
    paddingBottom: '16px',
  },

  splitDrawerDefaultRadio: {
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '12px',

    '&:last-child': {
      marginBottom: 0,
    },
  },

  splitDrawerDefaultRadioShow: {
    border: `1px solid ${theme.palette.borderBrand}`,
    background: theme.palette.surfaceBrandSubtle,

    '& .MuiBox-root': {
      '& .MuiFormControlLabel-root': {
        '& .MuiTypography-root': {
          color: theme.palette.textBrandHover,
        },
      },
    },
  },

  splitDrawerDefaultRadioClose: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },

  splitDrawerDefaultRadioControl: {
    '&.MuiFormControlLabel-root': {
      marginRight: 0,
      marginLeft: 0,

      '& .MuiButtonBase-root': {
        padding: 0,
        position: 'unset',

        '& span': {
          '& svg': {
            width: '17px',
            height: '17px',
          },
        },
      },

      '& .MuiTypography-root': {
        display: 'block',
        marginLeft: '8px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: 500,
        lineHeight: '20px',
        color: theme.palette.textPrimary,
      },
    },
  },

  splitDefaultShiftText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginLeft: '25px',
    },
  },

  splitDefaultDutyBoxSubText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  splitDefaultShiftTextShow: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  splitCustomDutyBoxRowTimerText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '4px',
    },
  },

  splitDefaultShiftSmallText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  splitDefaultShiftSubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  splitDrawerContent: {
    '&.MuiFormGroup-root': {
      flexWrap: 'nowrap !important',
    },
  },

  splitDefaultDuty: {
    marginBottom: '12px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  splitDefaultDutyBox: {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderBrand}`,
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    width: '49%',
    height: 'fit-content',
  },

  splitDefaultDutyBoxText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },

    '& span': {
      color: theme.palette.textSecondary3,
    },
  },

  splitCustomDuty: {
    marginTop: '12px',
  },

  splitCustomDutyBox: {
    padding: '0 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },

  splitCustomDutyDivider: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '24px 0',

    '&:last-child': {
      borderBottom: 0,
    },
  },

  splitCustomDutyBoxRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
  },

  splitCustomDutyBoxRowDays: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  splitCustomDutyBoxRowText: {
    width: '120px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  splitCustomDutyBoxRowTimer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    flex: 1,
    color: theme.palette.textPrimary,
  },

  splitCustomDutyBoxRowBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      width: '44px',
      minWidth: '44px',
      height: '44px',
      borderRadius: '8px',
      position: 'relative',
      top: '2.5px',
    },
    '& svg': {
      width: '18px',
      height: '18px',
    },
  },

  splitCustomDutyBoxRowToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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

  splitCustomInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  splitCustomInfoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  splitCustomInfoTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  splitCustomInfoText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  splitCustomInfoStatus: {
    '& svg': {
      width: '12px',
      height: '12px',
    },
  },

  splitCustomDutyBtn: {
    '&.MuiButtonBase-root': {
      padding: '0',
      width: '36px',
      minWidth: '36px',
      height: '36px',
      borderRadius: '8px',

      '&:disabled': {
        cursor: 'not-allowed',
        '& svg': {
          '& path': {
            stroke: theme.palette.textDisabled,
          },
        },
      },
    },
    '& svg': {
      width: '16px',
      height: '16px',

      '& path': {
        stroke: theme.palette.textPrimary,
      },
    },
  },

  splitCustomDutyAction: {
    paddingTop: '16px',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },

  splitCustomDutyActionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  splitCustomDutyActionTextDisabled: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrandDisabled,
    },
  },

  splitDrawerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px 24px 24px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },

  customSplitErrors: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  splitBodySkeletons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',

    '& .MuiSkeleton-root': {
      borderRadius: '8px !important',
      height: '112px',
    },
  },

  customSplitErrorsBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '12px',
  },
}));
