import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: theme.palette.surfaceWhite,
    padding: '20px 24px',
  },
  title: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  itemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 24px',
  },
  contentItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  valueBoxWrapper: {
    display: 'flex',
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    '&.changedAssignee': {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  valueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 12px',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  minValue: {
    background: '  #FFEED4',
    '& .MuiTypography-root': {
      color: theme.palette.textSecondary1,
    },
  },
  minValueLine: {
    '& .MuiTypography-root': {
      textDecoration: 'line-through',
    },
  },
  maxValue: {
    background: '#E5F6FF',
  },
  contentPaymentItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
}));
