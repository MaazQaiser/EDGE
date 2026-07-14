import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  payrollTabButtonTops: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    '& .MuiTabs-scroller': {
      display: 'flex',
      alignItems: 'center',
    },
  },

  assignDispatchHeading: {
    ' &.MuiTypography-root': {
      padding: '24px 32px 16px 32px',
      position: 'sticky',
      top: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      [theme.breakpoints.down('lg')]: {
        padding: '16px 24px 16px 24px',
      },
      [theme.breakpoints.down(768)]: {
        padding: '16px ',
      },
    },
    [theme.breakpoints.down(768)]: {
      padding: '16px ',
    },
  },
  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    // flex: '1 1',
    // overflow: 'auto',

    '& .MuiTabs-root': {
      minHeight: '34px',
    },
    '& .MuiTabs-scroller': {
      '& .MuiButtonBase-root': {
        minWidth: 'auto',
        marginRight: '8px',
        minHeight: 'auto',
        fontSize: '14px',
        fontWeight: '500',
        padding: '4px 16px',
        borderRadius: '60px',
        color: theme.palette.textSecondary1,
        border: `1px solid ${theme.palette.borderSubtle1}`,
        [theme.breakpoints.down(786)]: {
          fontSize: '12px',
          padding: '4px 8px',
        },
        '&.Mui-selected': {
          color: theme.palette.textOnColor,
          backgroundColor: theme.palette.textBrand,
          border: `1px solid ${theme.palette.textBrand}`,
        },
      },
      '& span.MuiTabs-indicator': {
        display: 'none',
      },
    },
  },
  accordionWrapper: {
    '& .MuiPaper-root': {
      margin: '0px !important',
      borderRadius: '0px !important',
      boxShadow: 'none !important',
      border: 'none !important',
    },
    '& .MuiAccordion-root': {
      borderRadius: '0px !important',
      boxShadow: 'none !important',
      border: 'none !important',
      '&:before': {
        display: 'none !important',
      },
    },
    '& .MuiAccordionSummary-root': {
      minHeight: '0px !important',
      padding: '12px 32px !important',
      justifyContent: 'flex-start !important',
      gap: '8px !important',
      cursor: 'pointer !important',
      [theme.breakpoints.down(768)]: {
        padding: '12px 16px !important',
      },
    },
    '& .MuiAccordionSummary-content': {
      margin: '0px !important',
      maxWidth: 'fit-content !important',
    },
    '& .MuiAccordionSummary-content.Mui-expanded': {
      minHeight: '0 !important',
      margin: '0px !important',
      maxWidth: 'fit-content !important',
    },
    '& .MuiAccordionDetails-root': {
      padding: '0px 32px !important',
      [theme.breakpoints.down(768)]: {
        padding: '0px 16px !important',
      },
    },
  },
  tabContent: {
    padding: '12px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '12px 24px',
    },
    '& > div': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
    },
  },
  tabBarWrap: {
    padding: '0px 32px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'column',
    flexWrap: 'wrap',
    [theme.breakpoints.down(768)]: {
      padding: '0px 16px !important',
      gap: '8px !important',
    },
  },
  tabsLabesl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  skeletonWrapper: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    padding: '12px 32px',
    flexDirection: 'column',
    '& .MuiSkeleton-root ': {
      borderRadius: '4px !important',
    },
  },
  dropdownWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    '& >.MuiBox-root': {
      '& >.MuiBox-root': {
        padding: '4px 8px !important',
      },
    },
    '& .MuiTypography-root': {
      fontSize: '10px',
      fontWeight: '500',
      lineHeight: '20px',
      color: theme.palette.textSecondary1,
    },
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  totalCount: {
    '&.MuiTypography-root': {
      color: '#5B5B5F !important',
    },
  },
}));
