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
      marginBottom: '24px',
    },
  },

  previewTemplateInfo: {
    margin: '24px 0',
  },

  previewTemplateInfoTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateFooter: {
    marginBottom: '24px',
  },

  previewTemplateInfoText: {
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

    // pointerEvents: 'none',
  },

  previewTemplateSection: {
    paddingBottom: '24px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    marginBottom: '24px',
  },

  previewTemplateSectionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateSectionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      marginTop: '8px',
    },
  },

  previewTemplateQuestionTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  previewTemplateQuestionText: {
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

  previewTemplateImageVideo: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },

  previewTemplateImage: {
    width: '267px',
    height: '150px',
    borderRadius: '12px',

    '& img': {
      display: 'block',
      width: '100%',
      height: '100%',
      borderRadius: '12px',
      objectFit: 'cover',
      objectPosition: 'center',
    },

    '& video': {
      display: 'block',
      width: '100%',
      height: '100%',
      borderRadius: '12px',
      objectFit: 'cover',
      objectPosition: 'center',
    },
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
  },

  previewTemplateOption: {
    padding: '8px 20px',
    borderRadius: '4px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
  },

  previewTemplateOptionSelected: {
    color: theme.palette.textBrand,
    border: `1px solid ${theme.palette.borderBrand}`,

    '&.MuiTypography-root': {
      color: theme.palette.textBrand,
    },
  },

  previewTemplateRadio: {
    marginTop: '16px',
  },

  previewTemplateProfile: {},

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

  disabledPointer: {
    pointerEvents: 'none',
  },
}));
