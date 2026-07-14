import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  dutyDetailActivities: {
    padding: '24px',
  },

  dutyDetailActivitiesTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailActivitiesStatus: {
    marginTop: '8px',
  },

  dutyDetailReports: {
    padding: '12px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
  },

  dutyDetailReportsImage: {
    display: 'block',
    width: '25.14px',
    height: '28px',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  dutyDetailReportsContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    gap: '6px',
  },

  dutyDetailReportsHeader: {
    display: 'flex',
    cursor: 'pointer',
    flexDirection: 'column',
  },

  reportTourTitleAndDate: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },

  noCursorHeader: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },

  reportsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  dutyDetailReportIcon: {
    width: '20px',
    height: '20px',
  },

  dutyDetailReportsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailReportsLink: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: theme.palette.textBrand,
  },

  dutyDetailReportsLinkDisabled: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: theme.palette.textBrandDisabled,
    cursor: 'default',
  },

  dutyDetailReportsDescription: {
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  dutyDetailReportsTime: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  dutyDetailActivitiesReports: {
    marginTop: '12px',
  },

  dutyDetailActivitiesTours: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  dutyDetailTours: {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  dutyDetailToursHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '4px',
  },

  dutyDetailToursLink: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    color: theme.palette.textBrand,
  },

  dutyDetailToursName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailToursLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  dutyDetailToursLocationText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  dutyDetailToursCheckpoints: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
  },

  dutyDetailToursCheckpointsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailToursCheckpointsText: {
    display: 'flex',
    alignItems: 'center',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  dutyDetailToursCheckpointsTextColor: {
    color: theme.palette.textBrand,
    marginLeft: '4px',
  },

  reportNotSubmitted: {
    fontSize: '12px',
    lineHeight: '18px',
    fontWeight: '500',
    background: theme.palette.surfaceAlertStrong,
    color: theme.palette.textOnColor,
    display: 'flex',
    height: '22px',
    padding: '4px 8px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    width: 'fit-content',
    borderRadius: '48px',
  },

  activitiesSkeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '16px',

    '& .MuiSkeleton-root': {
      height: '62px',
      borderRadius: '8px !important',
      transform: 'unset',
      transformOrigin: 'unset',
    },
  },

  reportsActionsCross: {
    '&.MuiButtonBase-root': {
      width: '32px',
      minWidth: '32px',
      height: '32px',
      padding: 0,
    },
  },

  reportsActionsTick: {
    '&.MuiButtonBase-root': {
      width: '32px',
      minWidth: '32px',
      height: '32px',
      padding: 0,
    },
  },
  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
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

  tourChipStatus: {
    '&.MuiChip-root.MuiChip-filled': {
      height: '22px',
    },
  },
  dispatchSkelton: {
    '& .MuiSkeleton-root': {
      borderRadius: '5px !important',
    },
  },
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
    marginTop: '40px',
  },
  reportsError: {
    '&.MuiTypography-root': {
      fontSize: '17px',
      fontWeight: '700',
      marginBottom: '4px',
      color: '#262527',
    },
  },
  reportsMessage: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: '#5B5B5F',
    },
  },
}));
