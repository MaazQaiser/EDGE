import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  defaultButton: {
    '&.MuiButtonBase-root': {
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '4px', // Default styling for both buttons
      padding: '2px 8px',
      textTransform: 'none',
      backgroundColor: theme.palette.surfaceGreySubtle,
      color: theme.palette.textPlaceholder,
      '&:hover': {
        backgroundColor: theme.palette.surfaceBrandSubtle,
        color: theme.palette.textBrand,
      },
    },
  },
  activeButton: {
    '&.MuiButtonBase-root': {
      backgroundColor: theme.palette.surfaceBrandSubtle,
      color: theme.palette.textBrand,
    },
  },
  tabInButton: {
    display: 'flex',
    gap: '8px',
  },
  instructionsWrapper: {
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
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
  },

  newTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      marginBottom: '12px',
    },
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
  headerGrid: {
    display: 'flex',

    flexDirection: 'column',
    marginBottom: '24px',
    gap: '24px',
  },

  btnWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  innerGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: '24px',
  },

  editor: {
    '& .MuiBox-root': {
      '& p': {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: theme.palette.textPlaceholder,
        '& strong': {
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '20px',
          color: theme.palette.textSecondary1,
        },
      },
      '& ol': {
        marginLeft: '32px !important',
        '& li': {
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: theme.palette.textPlaceholder,
          marginBottom: '4px',
          '& strong': {
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: theme.palette.textSecondary1,
          },
        },
      },
      '& ul': {
        marginLeft: '32px !important',
        '& li': {
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: theme.palette.textPlaceholder,
          marginBottom: '4px',
          '& strong': {
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: theme.palette.textSecondary1,
          },
        },
      },
    },
  },

  dates: {
    display: 'flex',
    borderRadius: '16px',
    background: theme.palette.surfaceGreySubtle,
    padding: '4px 12px',
    gap: '8px',
  },

  date: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  day: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrandHover,
      background: '#CFEFFF',
      padding: '4px 12px',
      borderRadius: '16px',
    },
  },

  dateFormate: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '24px !important',
  },

  addExceptionDetails: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
  },

  instuctionsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
    padding: '24px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '8px',
  },

  zoneCustomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },

  zoneDetailText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },

  zoneDetailInstructionsText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  instructionsImage: {
    width: '200px',
  },
  tabFlex: {
    marginTop: '10px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createInstructionWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px',
    height: 'calc(100vh - 274px)',
    maxWidth: '380px',
    margin: ' 0 auto',
    textAlign: 'center',
  },

  greytextColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  profileImageUploaded: {
    '&.MuiAvatar-root': {
      width: '100px',
      height: '100px',
      borderRadius: '4px',
    },
  },
  questionBankActionsMenu: {
    display: 'flex',
    flexDirection: 'column',
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

  questionBankActionsIconRegular: {
    '&.MuiSvgIcon-root': {
      width: '16px',
      height: '16px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
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

    '& svg': {
      width: '16px',
      height: '16px',
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

  questionBankActions: {
    '& .MuiPaper-root': {
      width: '162px',
      backgroundColor: theme.palette.surfaceWhite,
      padding: '0px 0',
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px',
      boxShadow: `0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.10)`,
    },
  },
  questionBankActionsTextRegular: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
