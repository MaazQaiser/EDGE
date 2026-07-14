import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  siteWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '20px 32px',
  },
  topBarArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  topText: {
    '& span.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  createInstructionWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '24px',
    height: 'calc(100vh - 274px)',
    maxWidth: '380px',
    margin: ' 0 auto',
    textAlign: 'center',
  },
  siteWrapperText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  greytextColor: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  tableWrapper: {
    '& td.MuiTableCell-root , th.MuiTableCell-root': {
      textAlign: 'center',
      '&:not(:last-child)': {
        borderRight: `1px solid ${theme.palette.borderSubtle1}`,
      },
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

  commonStageColor: {
    textAlign: 'center',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '18px',
    borderRadius: '16px',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    width: 'fit-content',
    padding: '4px 12px',
  },

  semi_monthly: {
    color: theme.palette.textBrand,
    backgroundColor: theme.palette.surfaceBrandSubtle,
  },

  monthly: {
    color: theme.palette.textSuccess,
    backgroundColor: theme.palette.surfaceSuccessSubtle,
  },

  contractNames: {
    padding: '20px 0px 0px 0px',
    color: theme.palette.textSecondary3,
    '&:last-child': {
      paddingBottom: '20px',
    },
  },
}));
