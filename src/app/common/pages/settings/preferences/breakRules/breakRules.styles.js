import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
    marginBottom: '24px',
  },

  templatesTD: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f2f2f2 !important',
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },
  questionBankActions: {
    '& .MuiPaper-root': {
      width: '201px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },

  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
  },

  questionBankActionsDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceAlertStrong,

      '& .MuiTypography-root': {
        color: theme.palette.textOnColor,
      },

      '& svg': {
        '& path': {
          stroke: theme.palette.textOnColor,
        },
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActionsIconDelete: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsRegular: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: theme.palette.surfaceGreySubtle,
    },
  },

  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  franchiseNameIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: '#b3b3b3',
      },
    },
  },

  franchiseNameText: {
    '&.MuiBox-root': {
      color: theme.palette.textSecondary1,
      fontWeight: 500,
    },
  },

  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
  },
  sitesListingCommonContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    paddingBottom: '0',
    paddingTop: '24px',
  },
  mainBoxWrapperAvailbiltity: {
    // width: 'calc(100% - 300px)',
    '@media only screen and (max-width: 1024px)': {
      width: '100%',
    },
  },
  buttonsBarWrapper: {
    padding: '24px 0px 24px 0px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsBar: {
    display: 'flex',
    gap: '12px',
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
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
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
    padding: '20px 0',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  tableTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
}));
