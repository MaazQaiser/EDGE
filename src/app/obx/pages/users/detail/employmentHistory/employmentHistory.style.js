import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((_theme) => ({
  container: {
    padding: '24px 32px',
    maxWidth: '100% !important',
    '& .MuiAccordionDetails-root': {
      padding: '8px 16px 0 0 !important',
    },
  },
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  accordionContainerSingle: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  franchiseName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  franchiseNameText: {
    '&.MuiTypography-root': {
      color: '#86868B',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  franchiseNameValue: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
    },
  },
  accordion: {
    '&.MuiAccordion-root': {
      backgroundColor: 'transparent !important',
      '&::before': {
        display: 'none !important',
      },
      '&.Mui-expanded': {
        margin: '0 !important',
      },
      '& .MuiButtonBase-root': {
        backgroundColor: '#F5F5F6 !important',
        padding: '8px  !important',
        minHeight: 'unset !important',
        height: 'unset !important',
        flexDirection: 'row-reverse !important',
        gap: '8px !important',

        '& .MuiAccordionSummary-expandIconWrapper': {
          margin: '0 !important',
        },
        '&:hover': {
          backgroundColor: '#F5F5F6 !important',
        },
        '& .MuiAccordionSummary-content': {
          margin: '0 !important',
        },
      },
    },
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    '&.MuiAvatar-root': {
      backgroundColor: 'transparent',
    },
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      top: 25,
      left: 20,
      display: 'block',
      width: '1px',
      height: '100%',
      borderLeft: '1px dashed #E0E0E0',
      margin: '8px 0',
      zIndex: -1,
    },
  },
  itemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
    width: '100%',
  },
  itemContentText: {
    '&.MuiTypography-root': {
      color: '#262527',
      fontWeight: 600,
      textTransform: 'capitalize',
    },
  },
  itemContentTextName: {
    '&.MuiTypography-root': {
      fontWeight: 400,
      color: '#6A6A70',
    },
  },
  itemContentTextNameDate: {
    color: '#262527',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  itemContentInner: {
    display: 'flex',
    alignItems: 'flex-start ',
    gap: 2,
    flexDirection: 'column',
  },
  reasonText: {
    '&.MuiTypography-root': {
      color: '#6A6A70',
      textTransform: 'capitalize',
    },
  },
  detailsText: {
    '&.MuiTypography-root': {
      color: '#262527',
    },
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    position: 'relative',
  },
  statusIconSkeleton: {
    marginLeft: 7,
    '&.MuiSkeleton-root': {
      height: 30,
      width: 30,
    },
  },
  dateSkeleton: {
    '&.MuiSkeleton-root': {
      height: 18,
      width: 118,
    },
  },
  usedetailsTextSkeleton: {
    '&.MuiSkeleton-root': {
      height: 8,
      width: 187,
    },
  },
  skeletonSection: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  languageModalSkeletonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  skeletonMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
}));
