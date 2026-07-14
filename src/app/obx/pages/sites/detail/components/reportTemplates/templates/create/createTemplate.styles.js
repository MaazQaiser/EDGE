import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createTemplate: {
    maxWidth: '910px',
    width: '100%',
    margin: '0 auto',
  },

  createTemplateHeader: {
    marginTop: '24px',
  },

  createTemplateDivider: {
    '&.MuiDivider-root': {
      display: 'block',
      margin: '16px 0',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  createTemplateContent: {
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(245, 245, 246, 0.3)',
    padding: '16px 24px',
    borderRadius: '8px',
    borderTop: '8px solid #F4780B',
    marginBottom: '16px',
  },

  createTemplateTitle: {
    marginBottom: '32px',
  },

  createTemplateAddSection: {
    marginTop: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginBottom: '16px',
    paddingLeft: '24px',
    marginTop: '-10px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));
