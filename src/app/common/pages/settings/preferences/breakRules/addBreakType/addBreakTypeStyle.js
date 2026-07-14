import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  breakTypeWrapper: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    height: '100%',
    flex: '1 1',
    overflow: 'auto',
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
  closeDrawerIcon: {
    cursor: 'pointer',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
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
  chipWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '& .MuiChip-root': {
      '& svg': {
        '& path': {
          fill: theme.palette.textBrand,
        },
        margin: '0px',
      },
    },
  },
  noConditionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '42px 22px',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },
  noConditionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  noConditionDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      maxWidth: '300px',
      margin: '0 auto',
    },
  },
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    flex: '1 1',
    overflow: 'auto',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '16px',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  conditionDetailsWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceGreySubtle,
  },
  conditionDetailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  conditionDetailsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  icnBtn: {
    '&.MuiIconButton-root': {
      display: 'flex',
      padding: '8px',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      borderRadius: '8px',
      border: `1px solid ${theme.palette.borderBrand}`,
      background: theme.palette.surfaceWhite,
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
}));
