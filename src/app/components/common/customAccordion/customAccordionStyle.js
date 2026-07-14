import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  primaryAccordion: {
    '&.MuiAccordion-root': {
      borderRadius: '8px',
      marginBottom: '0px !important',
      '&::before': {
        display: 'none',
      },

      '& .MuiAccordionSummary-root': {
        display: 'flex',
        padding: '8px 12px',
        alignItems: 'flex-start',
        gap: '16px',
        alignSelf: 'stretch',
        borderRadius: '8px 8px 0px 0px',
        minHeight: 'unset',
        background: theme.palette.surfaceBrandSubtle,
        '&.Mui-expanded': {
          minHeight: 'unset',
        },
        '& .MuiAccordionSummary-content': {
          margin: 0,
        },
      },
    },
  },
  accordionDetails: {
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
    alignSelf: 'stretch',
    borderRadius: '0px 0px 8px 8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderTop: 'none',
  },
}));
