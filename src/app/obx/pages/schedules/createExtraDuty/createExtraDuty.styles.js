import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createExtraDuty: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  createExtraDutyContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '20px 32px',
    gap: '24px',

    [theme.breakpoints.down('lg')]: {
      paddingLeft: '24px',
      paddingRight: '24px',
    },
  },

  createExtraDutyHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  createExtraDutyTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  createExtraDutyText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },

  createExtraDutyDropdowns: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  createExtraDutyEditor: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '24px',
  },

  createExtraDutyDropdownBox: {
    width: '420px',
  },

  createExtraDutyDropdown: {
    height: '44px',
    '& div': {
      '& div': {
        '& .MuiTypography-root': {
          fontSize: '16px',
          fontWeight: '400',
        },
      },
    },
  },

  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  createExtraDutyFooter: {
    padding: '12px 32px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
  },

  createDutyEditor: {
    fontSize: '16px',
    fontWeight: '400',
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
}));
