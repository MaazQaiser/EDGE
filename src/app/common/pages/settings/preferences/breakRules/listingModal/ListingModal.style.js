import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '850px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    transform: 'translate(-50%,-50%)',
    maxHeight: '700px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '24px',
  },
  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  closeDrawerIcon: {
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    '& button.MuiButtonBase-root': {
      paddingBottom: '0px',
      paddingTop: '0px',
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
  conditionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },

  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  MainTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '20px',
    },
  },
  value: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  conditionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  conditionDetailsWrapper: {
    width: '100%',
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    flex: '1 1',
    overflow: 'auto',
    maxHeight: '500px',
  },
  conditionDetailsInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      paddingBottom: '16px',
      marginBottom: '16px',
    },
  },
  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& .MuiTabs-root': {
      minHeight: '34px',
    },
    '& .MuiTabs-scroller': {
      '& .MuiButtonBase-root': {
        padding: '0px',
        minWidth: 'auto',
        marginRight: '16px',
        minHeight: 'auto',
        color: theme.palette.textPlaceholder,
        '&.Mui-selected': {
          color: theme.palette.textBrand,
        },
      },
      '& span.MuiTabs-indicator': {
        backgroundColor: theme.palette.textBrand,
      },
    },
  },
  tabContent: {
    paddingTop: '20px',
    '& > div': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
    },
  },

  languageModalSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  languageModalSkeleton: {
    '&.MuiSkeleton-root': {
      borderRadius: '8px !important',
    },
  },
  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: '12px',
  },
}));
