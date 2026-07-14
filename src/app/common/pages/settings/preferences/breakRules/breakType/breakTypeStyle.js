import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  breakTypeWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative',
    height: '100%',
    padding: '24px',
    flex: '1 1',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '20px',
  },
  headerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  headerSubtitle: {
    '&.MuiTypography-root': {
      marginTop: '8px',
      color: theme.palette.textPlaceholder,
    },
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: '16px',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    alignItems: 'flex-start',
  },
  contentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '12px 0px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    width: '100%',
    '&:first-child': {
      paddingTop: '0px',
    },
    '&:last-child': {},
  },
  contentItemButton: {
    '&.MuiButton-root': {
      marginTop: '12px',
      padding: '0px',
      height: 'auto',
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
  headingBackIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    '& .MuiButtonBase-root': {
      height: '36px',
      minWidth: '36px',
      marginRight: '9px',
      padding: '0px',
    },
  },
  closeDrawerIcon: {
    cursor: 'pointer',
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
}));
