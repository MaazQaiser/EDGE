import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  breakTypeWrapper: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  headerTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
  },
  backIconBtn: {
    '&.MuiIconButton-root': {
      color: theme.palette.grey[500],
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '& .MuiFormLabel-root': {
      marginBottom: '0px',
    },
    '& .selectInnerWrapper': {
      backgroundColor: theme.palette.surfaceWhite,
      height: 'auto',
    },

    '& .leadSelectPlaceHolder': {
      '&.MuiTypography-root': {
        color: theme.palette.textPlaceholder,
      },
    },
  },
  skeletonWrapper: {
    width: '100%',
  },
  errorMessage: {
    '&.MuiTypography-root': {
      color: theme.palette.textAlert,
      marginTop: '6px',
    },
  },

  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '16px',
    paddingBottom: '24px',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    position: 'absolute',
    bottom: '0',
    width: 'calc(100% - 48px)',
    background: theme.palette.surfaceWhite,
  },
  horizontalWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center',
  },
  conditionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.MuiInputBase-formControl.MuiInputBase-adornedEnd':
      {
        width: '132px',
        minWidth: '132px',
      },
  },
  breakConditionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  fixRangeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rangeButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    alignItems: 'center',
  },
  horizontalLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  buttonsBarWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    alignItems: 'center',
  },
  statesButtons: {
    '&.MuiToggleButtonGroup-root': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '12px',
      backgroundColor: theme.palette.surfaceWhite,
      width: '100%',
      '& button.MuiButtonBase-root': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: '4px 16px',
        fontWeight: '500',
        fontSize: '14px',
        lineHeight: '20px',
        position: 'relative',
        borderRadius: '8px',
        color: `${theme.palette.textSecondary2}`,
        border: `1px solid ${theme.palette.borderSubtle1}`,
        '&.Mui-selected': {
          color: `${theme.palette.textOnColor}`,
          backgroundColor: `${theme.palette.surfaceBrand}`,
          border: `1px solid ${theme.palette.borderBrand}`,
        },
      },
    },
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '4px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));
