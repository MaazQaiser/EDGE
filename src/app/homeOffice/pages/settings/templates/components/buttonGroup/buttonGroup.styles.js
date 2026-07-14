import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createTemplateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '15px',
  },

  createTemplateBtns: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '12px',
  },

  createTemplateFooter: {
    paddingTop: '16px',
    paddingBottom: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    marginTop: 'auto',
  },
}));
