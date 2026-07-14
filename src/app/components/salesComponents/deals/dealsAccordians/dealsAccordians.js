import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  accordianWrapper: {
    '& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation': {
      border: 0,
      boxShadow: 'none',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root': {
      flexDirection: 'row-reverse',
      padding: '0px 0px 0 0',
      minHeight: 'auto',
      border: 0,
    },
    '& .MuiAccordionSummary-content.Mui-expanded.MuiAccordionSummary-contentGutters': {
      margin: '0',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded svg': {
      background: '#007aff',
      borderColor: '#007aff',
    },
    '& .MuiPaper-root.MuiPaper-elevation .MuiAccordionSummary-root.Mui-expanded path': {
      fill: 'white',
    },
    '& .MuiAccordionSummary-expandIconWrapper svg': {
      borderRadius: '30px',
      border: '1px solid #e6e6e7',
      background: '#f5f5f6',
    },
    '& .MuiAccordionSummary-expandIconWrapper path': {
      fill: '#262527',
    },
    '& .MuiAccordionSummary-content': {
      paddingLeft: '10px',
      margin: '0 auto',
    },
    '& .MuiAccordionSummary-content p.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 700,
      letterSpacing: '0.25px',
    },
    '&  .MuiCollapse-wrapper .MuiAccordionDetails-root': {
      padding: '16px 0',
    },
    '& .MuiTypography-root': {
      color: '#86868b',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
    },
    '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-hidden': {
      visibility: 'visible',
    },
    '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered': {
      borderBottom: '1px solid #f5f5f6',
    },
    '&  .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiAccordion-root': {
      marginBottom: '24px',
      position: 'initial',
      '&:last-child': {
        '& .MuiCollapse-root.MuiCollapse-vertical.MuiCollapse-entered': {
          borderBottom: `0px solid ${theme.palette.borderSubtle1} !important`,
        },
      },
    },
  },
  toolTipBox: {
    cursor: 'pointer',
  },
  dataColWrap: {
    display: 'flex',
    gap: '40px',
    [theme.breakpoints.down('lg')]: {
      gap: '20px',
    },
  },
  dataColmLabel: {
    flex: '0 0 46%',
    [theme.breakpoints.down('lg')]: {
      flex: '0 0 40%',
    },
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  dataColmDetail: {
    flex: '1 1 40%',
  },
  contactWrap: {
    display: 'flex',
    gap: '5px',
    marginTop: '20px',
    '&:first-child': {
      marginTop: '10px',
    },
  },
  dataLink: {
    '&.MuiTypography-root': {
      textDecoration: 'none',
    },
  },
  dealsData: {
    marginTop: '20px',
    '&:first-child': {
      marginTop: '0px',
    },
  },
  attchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& .MuiButtonBase-root.MuiButton-root.MuiButton-onlyText.MuiButton-onlyTextPrimary.MuiButton-sizeMedium':
      {
        padding: '0px',
        '& svg': {
          width: '81px',
          height: '20px',
          background: '#007aff00',
          borderColor: '#007aff00',
          '& path': {
            fill: '#007aff',
          },
        },
      },
  },
  attachAccordian: {
    '& .MuiAccordionSummary-content': {
      justifyContent: 'space-between',
      width: '100%',
    },
  },
  plusBtn: {
    fontSize: '30px',
    marginRight: '10px',
  },
  attachSuccess: {
    marginTop: '8px',
    marginBottom: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.surfaceGreySubtle}`,
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
    '& svg': {
      flex: '0 0 36px',
    },
  },
  attachName: {
    fontSize: '14px',
    color: '#444446',
  },
  attachSize: {
    fontSize: '14px',
    color: '#86868B',
  },
  attachNameWrap: {
    marginLeft: '10px',
  },
  uploadBtnImg: {
    position: 'relative',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    '& span.MuiButtonBase-root': {
      marginTop: '10px',
      height: '111px',
      padding: '0px',
      justifyContent: 'flex-start',
    },
  },
  fileUpload: {
    position: 'absolute',
    zIndex: '1',
    width: '100%',
    height: '100%',
    opacity: '0',
    cursor: 'pointer',
  },
  emailIcon: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  attachSuccessFile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  trashIconBox: {
    cursor: 'pointer',
    lineHeight: 1,
  },
  userImage: {
    height: '48px',
    width: '100%',
  },
}));
