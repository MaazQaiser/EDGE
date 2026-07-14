import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  obxDataContainer: {
    padding: theme.spacing(3),
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

  // Header Styles
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: theme.spacing(2),
  },
  accordionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));
