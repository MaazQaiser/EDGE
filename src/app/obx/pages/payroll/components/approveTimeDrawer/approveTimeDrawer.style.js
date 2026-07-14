import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  activityDrawer: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  drawerHeader: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cancelIcon: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: 'auto',
      minWidth: 'auto',
    },
  },
  drawerTitle: {
    flexDirection: 'column',
    gap: '4px',
    display: 'flex',
  },
  detalsTitle: {
    alignItems: 'center',
    gap: '4px',
    display: 'flex',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },
  Title: {
    '&.MuiTypography-root': {
      textTransform: 'capitalize',
    },
  },
  drawerInner: {
    padding: '24px 24px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
  },

  eventAvatar: {
    '&.MuiAvatar-root': {
      width: '24px',
      height: '24px',
      border: `1px solid ${theme.palette.borderSubtle1}`,
    },
  },

  activityBox: {
    position: 'relative',
    display: 'flex',
    gap: '8px',
    paddingBottom: '20px',

    '&:last-child': {
      paddingBottom: 0,
    },

    '& .MuiTypography-body3': {
      display: 'block',
      color: theme.palette.textPlaceholder,
    },
    '& .MuiTypography-body2': {
      color: theme.palette.textPrimary,
      fontWeight: '500',
    },
    '&:before': {
      content: "''",
      position: 'absolute',
      left: '11px',
      bottom: '0',
      width: '2px',
      height: '100%',
      borderLeft: `2px dotted ${theme.palette.borderSubtle1}`,
    },
    '&:last-child::before': {
      display: 'none',
    },
  },

  dutyDetailLogsCentered: {
    height: 'calc(100dvh - 79px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
    gap: '12px',
    padding: '16px 24px 0px 24px',
  },

  grayAlert: {
    '&.MuiAlert-standard': {
      borderRadius: '10px',
      background: theme.palette.surfaceGreySubtle,
      padding: '12px',
      alignItems: 'center',
      '& .MuiAlert-message': {
        color: theme.palette.textSecondary3,
        fontWeight: 500,
        padding: '0',
      },
      '& .MuiAlert-icon': {
        color: theme.palette.textBrand,
        padding: '0',
        marginRight: '6px',
      },
    },
  },

  activityRowWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  activityRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 425px',
    alignItems: 'baseline',
    gap: '16px',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 425px',
    gap: '16px',
    marginBottom: '24px',
  },
  headerText: {
    padding: '12px 16px',
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      whiteSpace: 'nowrap',
    },
  },
  blueBtn: {
    '&.MuiButtonBase-root': {
      paddingLeft: '0px',
    },
  },
  disabledBlueBtn: {
    '&.MuiButtonBase-root': {
      paddingLeft: '0px',
      color: '#A9DEFF',
    },
    '&:hover': {
      backgroundColor: 'transparent', // or the default color to avoid change
      color: '#A9DEFF',
    },
    '&.MuiButtonBase-root:hover': {
      backgroundColor: 'transparent', // or the default color to avoid change
      color: '#A9DEFF',
    },
  },
  timeCellMiddle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    padding: '8px 16px',
    minWidth: '200px',
    maxWidth: '200px',
    '& .MuiStack-root': {
      '& .MuiFormControl-root': {
        '& .MuiInputBase-root': {
          height: '32px',
          minWidth: '70px',
          maxWidth: '156px',
        },
      },
    },
  },
  timeCell: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    padding: '8px 16px',
    '& .MuiStack-root': {
      '& .MuiFormControl-root': {
        '& .MuiInputBase-root': {
          height: '32px',
          minWidth: '70px',
          maxWidth: '156px',
        },
      },
    },
  },
  activityText: {
    '&.MuiTypography-root': {
      padding: '8px 16px',
      color: theme.palette.textSecondary1,
      whiteSpace: 'nowrap',
    },
  },
  timeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      whiteSpace: 'nowrap',
    },
  },
  duration: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
    },
  },
  summaryPanel: {
    marginTop: '16px',
    padding: '8px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  totalTimeText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
    },
  },
  totalTime: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'start',
    alignItems: 'center',
    '& p.MuiTypography-root.MuiTypography-body1': {
      color: theme.palette.textSecondary3,
    },
  },
  popoverPaperCustom: {
    width: '100%',
  },
  errorClass: {
    border: '1px solid #DF372B',
  },

  checkboxPanel: {
    marginTop: '16px',
    // padding: '8px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  checkbox: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  statesButtons: {
    height: '37px',
    borderRadius: '8px !important',
    padding: '1px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& button.MuiButtonBase-root': {
      border: '0px !important',
      padding: '4px 16px !important',
      minWidth: '112px',
    },
    '& .Mui-selected': {
      borderRadius: '6px !important',
      backgroundColor: `${theme.palette.textBrand} !important`,
      color: 'white !important',
      '& .MuiBox-root': {
        borderRadius: '6px',

        background: `${theme.palette.surfaceBrandSubtle} !important`,
        color: `${theme.palette.textBrand} !important`,
      },
    },
  },

  notesSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  notesArea: {
    '&.MuiTypography-root': {
      color: theme.palette.textOnColor,
    },
  },

  repateNotes: {
    marginBottom: '16px',
    position: 'relative',
    paddingLeft: '12px',

    '&:last-child': {
      marginBottom: 0,
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      width: '5px',
      height: '5px',
      borderRadius: '160px',
      backgroundColor: theme.palette.surfaceBrand,
      left: '0px',
      top: '8px',
    },
  },
}));
