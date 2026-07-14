import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  '@keyframes colorChange': {
    '0%': {
      backgroundColor: '#F5F5F6',
    },
    '50%': {
      backgroundColor: '#FECDCA',
      color: '#B32318',
    },
    '100%': {
      backgroundColor: '#F5F5F6',
    },
  },
  pulseAnimation: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
      animation: `$colorChange 2s infinite`,
      backgroundColor: '#F5F5F6',
    },
  },

  intabHeading: {
    '&.MuiTypography-root': {
      marginBottom: '20px',
      color: theme.palette.textPrimary,
      [theme.breakpoints.down(786)]: {
        fontSize: '16px',
      },
    },
  },
  textLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  textDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  dipatchRowBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    [theme.breakpoints.down(786)]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    },
  },
  dipatchRowDate: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    gap: '4px',
  },
  textLabelChip: {
    '&.MuiChip-root.MuiChip-filled': {
      maxWidth: 'fit-content',
    },
  },
  space: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    paddingBottom: '24px',
    marginBottom: '24px',
  },

  dipatchRowDateFull: {
    marginTop: '16px',
  },

  dispatchSkelton: {
    '& .MuiSkeleton-root': {
      borderRadius: '5px !important',
    },
  },
  htmlDescription: {
    '& ul': {
      paddingLeft: '1rem', // Adjust as needed for indentation
    },
    '& ol': {
      paddingLeft: '1rem', // Adjust as needed for indentation
    },
  },
  dipatchTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  downloadCallerButton: {
    '&.MuiButton-root': {
      color: '#146DFF',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: '20px',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
  addButtonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    '&.MuiButton-root': {
      backgroundColor: '#ffffff',
      boxShadow: 'none',
      color: '#146dff',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '20px',
      textTransform: 'none',
      display: 'flex',
      alignItems: 'center',

      // Lock icon container size
      '& .MuiButton-startIcon': {
        marginRight: '6px',
        '& svg': {
          width: '18px !important',
          height: '18px !important',
          flexShrink: 0,
        },
      },

      // Normal icon color
      '& .MuiButton-startIcon svg path': {
        stroke: '#146dff',
      },

      // Disabled state
      '&.Mui-disabled': {
        backgroundColor: '#ffffff !important',
        color: '#A9DEFF !important',

        '& .MuiButton-startIcon svg path': {
          stroke: '#A9DEFF !important',
        },
      },

      '&:hover': {
        backgroundColor: '#ffffff',
        boxShadow: 'none',
      },
    },
  },
}));
