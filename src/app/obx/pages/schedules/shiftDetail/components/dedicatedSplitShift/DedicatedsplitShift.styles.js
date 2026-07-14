import { makeStyles } from '@mui/styles';

const useSplitShiftStyles = makeStyles((theme) => ({
  drawerContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  drawerHeader: {
    padding: '24px 24px 0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '28px',
    },
  },
  closeButton: {
    '&.MuiButton-root': {
      padding: '0px',
      minWidth: 'auto',
    },
  },
  drawerContent: {
    padding: '16px 24px',
    flex: 1,
    overflow: 'auto',
  },
  shiftInfoSection: {
    padding: '12px',
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
    marginBottom: '16px',
    display: 'flex',
    gap: '0',
  },
  itemBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  shiftInfoBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 16px',
    '&:first-child': {
      paddingLeft: 0,
    },
    '&:last-child': {
      paddingRight: 0,
    },
  },
  shiftInfoBoxMiddle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 16px',
    borderLeft: `1px solid ${theme.palette.borderSubtle1}`,
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
  },
  shiftInfoLabel: {
    '&.MuiTypography-root': {
      color: '#86868B',
    },
  },
  shiftInfoValue: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },
  assignDrawerHeaderBottomText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  },
  divider: {
    '&.MuiDivider-root': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '24px 0',
    },
  },
  dividerTop: {
    '&.MuiDivider-root': {
      borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
      margin: '16px 0',
    },
  },

  splitShiftSection: {
    marginTop: '0',
  },
  splitShiftContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  splitShiftTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '4px',
    },
  },
  splitShiftDescription: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginBottom: '16px',
    },
  },

  shiftInputContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 4fr',
    gap: '40px',
    '& .MuiTextField-root ': {
      minWidth: 'unset !important',
    },
  },
  shiftInputLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  timeInputRow: {
    display: 'flex',
    gap: '16px',
  },
  timeInput: {
    flex: 1,
  },
  hoursDisplay: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary,
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
      marginTop: '4px',
    },
  },
  summaryBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  summaryBox: {
    display: 'flex',
    gap: '4px',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    '&:last-child': {
      marginBottom: 0,
    },
  },
  summaryLabel: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary,
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  summaryValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
    },
  },
  errorText: {
    '&.MuiTypography-root': {
      color: theme.palette.error.main,
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  },

  drawerFooter: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },
  buttonLoadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  customSplitErrorsBottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '12px',
  },
  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));

export default useSplitShiftStyles;
