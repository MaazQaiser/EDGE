import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  obxDataContainer: {
    padding: theme.spacing(3),
  },
  obxDataTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },

  // Accordion Styles
  accordion: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    '&.MuiAccordion-root': {
      backgroundColor: 'transparent !important',
      margin: '0px !important',
      '&.Mui-expanded': {
        margin: '0px !important',
      },
      '&:before': {
        display: 'none',
      },
      '& .MuiButtonBase-root': {
        backgroundColor: `1px solid ${theme.palette.borderSubtle1}`,

        '&:hover': {
          backgroundColor: `1px solid ${theme.palette.borderSubtle1}`,
        },
      },
    },
  },
  accordionSummary: {
    flexDirection: 'row-reverse',
    minHeight: '0px !important',
    gap: '10px',
    '&.Mui-expanded': {
      margin: '0px !important',
    },
    '& .MuiAccordionSummary-content': {
      '&.Mui-expanded': {
        margin: '12px 0px !important',
      },
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      margin: '0px !important',
    },
  },
  expandIcon: {
    backgroundColor: `${theme.palette.surfaceGreySubtle} !important`,
    borderRadius: '50%',
  },
  accordionDetails: {
    padding: 0,
  },

  // Header Styles
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  accordionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  accordionTitleText: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontFamily: 'Inter',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
    },
  },
  dueDateTitle: {
    '&.MuiTypography-root': {
      color: '#6A6A70 !important',
      fontFamily: 'Inter',
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
    },
  },
  dueDateValue: {
    '&.MuiTypography-root': {
      color: '#B32318 !important',
      fontWeight: 500,
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.4px',
    },
  },
  statusChip: {
    fontWeight: 500,
    fontSize: '0.75rem',
  },
  statusChipComplete: {
    fontWeight: 500,
    fontSize: '0.75rem',
  },
  statusChipProgress: {
    fontWeight: 500,
    fontSize: '0.75rem',
  },
  statusChipPending: {
    fontWeight: 500,
    fontSize: '0.75rem',
  },

  // Submission Info Styles
  submissionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  submissionText: {
    '&.MuiTypography-root': {
      color: theme.palette.text.secondary,
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
  },
  emoloyeeInfo: {
    '&.MuiTypography-root': {
      color: theme.palette.text.secondary,
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      borderRight: '2px solid #E6E6E7',
      paddingRight: '10px',
    },
  },
  submissionBoldText: {
    color: '#000000',
    fontWeight: 500,
  },
  managerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  managerAvatar: {
    '&.MuiAvatar-root': {
      width: 20,
      height: 20,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #E6E6E7',
      '& > img': {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
      },
    },
  },

  // Table Styles
  checklistTable: {
    width: '100%',
  },
  tableHeader: {
    '&.MuiTableCell-root': {
      // backgroundColor: '#F5F5F5',
      fontWeight: 600,
      color: theme.palette.text.primary,
      borderBottom: `1px solid #E6E6E7`,
      '&:not(:first-child)': {
        borderLeft: `1px solid #E6E6E7`,
      },
    },
  },
  tableRow: {
    '&:nth-of-type(even)': {
      //   backgroundColor: '#FAFAFA',
    },
    '&:hover': {
      //   backgroundColor: '#F0F0F0',
    },
    '&:last-child': {
      '& .MuiTableCell-root': {
        borderBottom: 'none',
      },
    },
  },
  questionCell: {
    fontWeight: 500,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&.MuiTableCell-root': {
      '&:not(:first-child)': {
        borderLeft: `1px solid #E6E6E7`,
      },
    },
  },
  answerCell: {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&.MuiTableCell-root': {
      '&:not(:first-child)': {
        borderLeft: `1px solid #E6E6E7`,
      },
    },
  },
  answerText: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '20px',
  },
  yesText: {
    color: '#2E7D32',
    fontWeight: 600,
  },
  noText: {
    color: '#C62828',
    fontWeight: 600,
  },
  pendingText: {
    color: '#1976D2',
    fontWeight: 600,
  },

  // Notification Card Styles
  notificationCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F6',
    borderRadius: '8px',
    padding: '16px',
  },
  notificationContent: {
    flex: 1,
    marginRight: theme.spacing(3),
  },
  notificationText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: theme.spacing(1),
  },
  notificationTitle: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontFamily: 'Inter',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: '16px',
    },
  },
  notificationIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: '#DC2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exclamationMark: {
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: '12px',
    margin: 0,
  },
  notificationMessage: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      fontFamily: 'Inter',
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },

  noRecordFound: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '12px',
  },
}));
