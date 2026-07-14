import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  previewTemplate: {
    maxWidth: '860px',
    width: '100%',
    margin: '0 auto',
    padding: '24px',
  },

  previewTemplateDivider: {
    '&.MuiDivider-root': {
      marginTop: '16px',
      borderColor: theme.palette.borderSubtle1,
    },
  },

  previewTemplateInfo: {
    margin: '24px 0',
  },

  previewTemplateInfoTitle: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateInfoText: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  previewTemplateContent: {
    padding: '24px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: 'rgba(245, 245, 246, 0.3)',
    marginBottom: '24px',
    // pointerEvents: 'none',
  },

  previewTemplateSection: {
    paddingBottom: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '24px',
  },

  previewTemplateSectionTitle: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateSectionText: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  previewTemplateQuestionTitle: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateQuestionText: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  previewTemplateQuestion: {
    paddingBottom: '24px',

    '&:last-child': {
      paddingBottom: '0',
    },
  },

  previewTemplateUploaded: {
    display: 'flex',
    width: '100px',
    height: '100px',
    padding: '8px 20px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '12px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    marginTop: '16px',
  },

  previewTemplateField: {
    marginTop: '16px',

    '& .MuiBox-root': {
      '& .MuiFormControl-root ': {
        '& .MuiInputBase-root': {
          height: '44px',
        },
      },
    },
  },

  previewTemplateOptions: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '16px',
    gap: '4px',
    flexWrap: 'wrap',
  },

  previewTemplateOption: {
    padding: '8px 20px',
    borderRadius: '8px !Important',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },

  previewTemplateRadio: {
    marginTop: '16px',
  },

  previewTemplatePicker: {
    marginTop: '16px',
    maxWidth: '420px',
    width: '100%',

    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '44px',
            '& .MuiOutlinedInput-notchedOutline': {
              backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },

  previewTemplateDateTime: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '420px',
    width: '100%',

    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '44px',
            '& .MuiOutlinedInput-notchedOutline': {
              backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },

  disabledEvent: {
    pointerEvents: 'none',
  },
}));
