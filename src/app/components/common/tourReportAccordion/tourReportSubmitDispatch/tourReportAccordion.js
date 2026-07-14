import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tourWrapper: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    minWidth: 0,
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
    '& .MuiAccordion-rounded': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      marginTop: '16px',
      borderRadius: '8px',
      borderBottomRightRadius: '8px !important',
      borderBottomLeftRadius: '8px !important',
      padding: '0px',
      '&::before': {
        opacity: '0',
      },
      '& .MuiAccordionSummary-root': {
        minHeight: 'auto',
        padding: '0px 24px 0px 0px',
      },
      '& .MuiAccordionSummary-content': {
        margin: '0px',
        padding: '24px',
        [theme.breakpoints.down('sm')]: {
          padding: '16px 12px',
        },
      },
      '& .MuiAccordionDetails-root': {
        padding: '0  24px 12px 24px',
        [theme.breakpoints.down('sm')]: {
          padding: '0 12px 12px 12px',
        },
      },
    },
  },
  summeryWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    minWidth: 0,
    '& .MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  accordionData: {
    width: '100%',
    minWidth: 0,
  },
  CheckPointText: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dotCode: {
    '&.MuiTypography-root': {
      fontSize: '35px',
    },
  },
  footerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: '12px',
    borderTop: '1px solid #e6e6e7',
    marginTop: '12px',
    gap: '8px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',

    width: '100%',
  },
  textContent: {
    display: 'flex',
    alignItems: 'center',

    width: '100%',
  },
  reportFormWrapper: {
    margin: 'unset !important',
    maxWidth: '100% !important',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    '& > .MuiBox-root': {
      width: '100%',
      minWidth: 0,
      '& > .MuiBox-root': {
        width: '100%',
        minWidth: 0,
        '& .MuiFormControl-root': {
          width: '100% !important',
          maxWidth: '392px',
          boxSizing: 'border-box',
          [theme.breakpoints.down('sm')]: {
            maxWidth: '100%',
          },
        },
      },
    },
  },

  borderWrapper: {
    borderTop: '1px solid #e6e6e7',
    paddingTop: '24px',
  },
  skeletonWrraper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  //   backgroundColor: theme.palette.surfaceGreySubtle,
  //   color: theme.palette.textSecondary1,
  //   border: `1px solid ${theme.palette.borderSubtle1}`,
}));
