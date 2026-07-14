import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },

  previewHeader: {
    padding: '21px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  namelable: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  marginTop: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      marginBottom: '6px',
    },
  },
  previewContent: {
    padding: '12px 24px 12px 24px ',
    paddingBottom: 0,
  },
  reasonText: {
    '& span': {
      color: theme.palette.textPlaceholder,
    },
  },
  boldText: {
    '& span': {
      fontWeight: '500',
      color: theme.palette.textPrimary,
    },
  },
  reasonBox: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  inlineFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '12px',
  },

  visitorlable: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  visitorValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    gap: '12px',
  },
  valueInline: {
    flex: '1 1 33.333%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  borderBox: {
    paddingTop: '16px',
    // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    // borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  attachmentsWrap: {
    marginTop: '12px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& img': {
      width: '100px',
      height: '100px',
      borderRadius: '4px',
    },
  },
  profileImage: {
    width: '100px !important',
    height: '100px !important',
    '& svg': {
      width: '32px',
      height: '32px',
    },
  },
  bgColor: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.palette.surfaceGreySubtle,
    borderRadius: '4px',
    cursor: 'pointer',
  },
  profileImageUploaded: {
    '&.MuiAvatar-root': {
      width: '100px',
      height: '100px',
      borderRadius: '4px',
    },
    cursor: 'pointer',
  },
  signatureUploaded: {
    width: '300px !important',
    height: '100px !important',
    borderRadius: '4px',
  },

  valueWrapperNew: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '16px',
  },

  valueWrapperNewImages: {
    // display: 'flex',
    // justifyContent: 'space-between',
    // flexWrap: 'wrap',
    gap: '12px',
    paddingBottom: '16px',
  },

  previewContentSkeletonTop: {
    '&.MuiSkeleton-root': {
      width: '100%',
      height: '170px',
      borderRadius: '8px !important',
      transform: 'none',
      marginBottom: '12px',
      '&:last-child': {
        marginBottom: 0,
      },
    },
  },

  nameSkeleton: {
    '&.MuiSkeleton-root': {
      width: '150px',
      height: '24px',
      borderRadius: '8px !important',
      transform: 'none',
    },
  },

  visitorDetails: {
    // paddingTop: '4px',
    // borderTop: `8px solid ${theme.palette.textBrand}`,
    // borderRadius: '8px',
    marginTop: '16px',
  },

  checkOutTitle: {
    padding: '4px 12px',
    borderRadius: '4px',
    background: theme.palette.surfaceBrand,
    '& .MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '200px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  newVisitorButton: {
    '& .MuiPaper-root': {
      width: '240px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '4px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  buttonStyle: {
    '& button.MuiButtonBase-root': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
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
          fill: theme.palette.textOnColor,
        },
      },
    },
  },

  questionBankActionsDeleteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    cursor: 'pointer',

    '& svg': {
      width: '14px',
      height: '14px',
      '& path': {
        stroke: '#DF372B',
      },
    },

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
  questionBankActionsIconDeleteRow: {
    '& svg': {
      width: '14px',
      height: '14px',
      '& path': {
        stroke: '#DF372B',
      },
    },
  },

  questionBankActionsTextDelete: {
    '&.MuiTypography-root': {
      color: '#DF372B',
    },
  },

  questionBankActionsTextEdit: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
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
}));
