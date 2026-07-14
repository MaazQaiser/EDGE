import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  previewTemplate: {
    maxWidth: '860px',
    width: '100%',
    minWidth: 0,
    margin: '0 auto',
    boxSizing: 'border-box',
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
    borderRadius: '8px',
    marginBottom: '24px',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    boxSizing: 'border-box',

    '&:last-child': {
      marginBottom: 0,
    },
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

  previewTemplateTitleAndPill: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    minWidth: 0,
  },
  previewTemplateQuestionTitleCluster: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  previewTemplateAiSparkleTooltipTrigger: {
    cursor: 'default',
    outline: 'none',
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${theme.palette?.surfaceWhite || '#fff'}, 0 0 0 4px ${theme.palette?.primary?.main || '#7c3aed'}`,
    },
  },
  previewTemplateAiSparkleWrap: {
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    color: '#fff',
    marginTop: '1px',
    '& svg': {
      width: 12,
      height: 12,
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
    cursor: 'pointer',
  },

  previewTemplateField: {
    marginTop: '16px',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',

    '& .MuiFormControl-root': {
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
    },

    '& .MuiBox-root': {
      '& .MuiFormControl-root ': {
        '& .MuiInputBase-root': {
          height: '44px',
        },
      },
    },
  },
  previewTemplateFieldTextArea: {
    marginTop: '16px',
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',

    '& .MuiFormControl-root': {
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
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

  previewTemplateOptionSelected: {
    background: theme.palette.surfaceBrand,
    '&.MuiTypography-root ': {
      color: theme.palette.textOnColor,
    },
  },

  previewTemplateRadio: {
    marginTop: '16px',
  },

  previewTemplatePicker: {
    marginTop: '16px',
    maxWidth: '420px',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
    },

    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '44px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
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
    minWidth: 0,
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
    },

    '& .MuiBox-root': {
      '& .MuiStack-root': {
        '& .MuiFormControl-root': {
          '& .MuiInputBase-root': {
            height: '44px',
            '& .MuiOutlinedInput-notchedOutline': {
              // backgroundColor: theme.palette.surfaceWhite,
            },
          },
        },
      },
    },
  },

  disabledEvent: {
    pointerEvents: 'none',
  },
  invalidData: {
    display: 'flex',
    // padding: '6px 12px',

    justifyContent: 'center',
    alignItems: 'center',
    // gap: '4px',
    borderRadius: '8px',

    fontSize: '14px',
    fontWeight: '400',
    color: theme.palette.textAlert,
    width: 'fit-content',
    lineHeight: '20px',
    margin: '0px',
    marginTop: '6px',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));
