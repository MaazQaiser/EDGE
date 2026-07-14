import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  createTemplate: {
    maxWidth: '910px',
    width: '100%',
    margin: '0 auto',
  },
  checkInWrapper: {
    display: 'flex',
    gap: '12px',
  },

  checkInWrapperLast: {
    marginTop: '16px',
  },

  checkInWrapperDD: {
    width: '100%',
    height: '44px',
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
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },

  internalMapBox: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },

  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  mb0: {
    marginBottom: 0,
    lineHeight: 1.2,
    display: 'flex',
    alignItems: 'center',
  },

  checkboxWrapper: {
    display: 'flex',
    gap: '20px',
    margin: '16px 0px',
  },
}));
