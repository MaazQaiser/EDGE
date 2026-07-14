import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingBottom: '0',
  },
  mainBoxWrapperAvailbiltity: {
    // width: 'calc(100% - 300px)',
    '@media only screen and (max-width: 1024px)': {
      width: '100%',
    },
  },
  inputStyles: {
    '& .MuiInputBase-root': {
      maxHeight: '36px',
    },
  },
  searchSectionDashboard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0',
  },
  searchSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    columnGap: '12px',
    padding: '24px 0',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },
  tableWrapperCalendar: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingBottom: '24px',
  },
  tableWrapperOne: {
    // padding: '6px 24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tableavatar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  headerTitlle: {
    paddingBottom: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '16px',
  },
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  tableCalendarHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  weekDaysName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },
  description: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      fontWeight: '400 !important',
      paddingTop: '10px',
      paddingBottom: '10px',
    },
  },
  saveBtnWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  timeHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: ' 1fr 4fr 220px',
    padding: '12px 24px',
    alignItems: 'center',
  },
  availabiliySectionWrapper: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '1fr 4fr 220px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '6px 24px',
    gap: '48px',
    alignItems: 'center',
  },
  tableTitleWrapper: {
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tableTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  zoneCustomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
      marginBottom: '4px',
    },
  },

  invoiceSettings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  invoiceSettingsTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  invoiceSettingsText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  notesCloseBtn: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      width: 'auto',
      minWidth: 'auto',
      marginRight: 'auto',
    },
    '& .MuiButton-icon': {
      margin: '0',
      marginRight: '4px',
    },
    '& svg': {
      height: '20px',
      width: '20px',
    },
  },

  editModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: ' 392px',
    backgroundColor: theme.palette.surfaceWhite,
    boxShadow: '0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04)',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  editModalTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  editModalText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '6px',
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

  dropDownSkeleton: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
  },

  addOfficerDropdownField: {
    height: '44px',
  },

  addOfficerDropdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      display: 'flex',
      minWidth: 'fit-content',
      padding: 0,
      marginLeft: 'auto',

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  editModalDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  editModalActions: {
    marginTop: '4px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
  },

  linkReportProblem: {
    '&.MuiLink-root': {
      color: theme.palette.textBrand,
      textDecoration: 'none',
    },
  },

  templateActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  templateActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  templateActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  templateActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  templateActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textSecondary2,
      },
    },
  },

  supervisorName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  supervisorAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
    },
  },

  visitorsActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& .MuiTypography-root': {
      color: theme.palette.borderAlert,
    },

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& path': {
        stroke: theme.palette.textOnColor,
      },
    },
  },

  invoiceSettingsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },

  serviceHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: ' 1.5fr 1fr',
    padding: '12px 24px',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,

    '&:first-child': {
      borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  titleField: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  titleFieldText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  inputField: {
    width: '100%',
    '& .MuiInputBase-root': {
      minWidth: '100%',
      maxHeight: '36px',
    },
  },

  runsheetBtn: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));
