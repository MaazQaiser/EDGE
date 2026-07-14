import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  pageWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingBottom: '24px',
  },

  pageMain: {
    height: 'calc(100dvh - 71px)',
    overflow: 'auto',
  },

  reportProblemDetail: {
    '& > .MuiBox-root:first-child': {
      position: 'sticky',
      width: '100%',
      top: 0,
      background: theme.palette.surfaceWhite,
      zIndex: '20',
    },
  },

  instructionContentLoader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  metaDataWrapper: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  keyName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  keyValue: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      textTransform: 'capitalize',
    },
  },
  instructionContentSkeleton: {
    '&.MuiSkeleton-root': {
      height: '200px',
      borderRadius: '8px !important',
      transform: 'none',
      transformOrigin: 'none',
    },
  },

  flexContainer: {
    display: 'flex',

    justifyContent: 'space-between',
  },

  flexArea: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    '& .MuiChip-root.MuiChip-filled': {
      height: '22px',
    },
  },
  inlineFlex: {
    display: 'flex',
    flexDirection: 'column',
  },
  headText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  metaWrapper: {
    margin: '16px 0',
  },
  subText: {
    '&.MuiTypography-root': {
      display: 'block',
      color: theme.palette.textPlaceholder,
      marginTop: '4px',
    },
  },

  BackButton: {
    margin: '24px 0px',
  },

  emailText: {
    margin: '10px 0px',
  },

  problemImages: {
    marginTop: '28px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',

    '& img': {
      width: '33.333%',
      borderRadius: '8px',
    },
  },

  instructionContent: {
    color: theme.palette.textPrimary,

    '& ul': {
      paddingLeft: '32px',
    },

    '& ol': {
      paddingLeft: '32px',
    },
  },

  inProgressChip: {
    borderRadius: '16px',
    height: '22px',
    border: 'none',

    '& > .MuiBox-root:first-child ': {
      background: theme.palette.surfaceBrandSubtle,
      padding: '4px 6px 4px 8px',
      borderRadius: '16px',

      '& > .MuiBox-root > .MuiTypography-root': {
        color: theme.palette.textBrand,
        fontSize: '12px',
        fontWeight: '500',
      },

      '& > .MuiBox-root ': {
        height: '14px',

        '& svg': {
          width: '14px',
          height: '14px',

          '& path': {
            stroke: theme.palette.surfaceBrand,
          },
        },
      },
    },
  },

  resolvedChip: {
    borderRadius: '16px',
    height: '22px',
    border: 'none',

    '& > .MuiBox-root:first-child ': {
      background: theme.palette.surfaceSuccessSubtle,
      padding: '4px 6px 4px 8px',
      borderRadius: '16px',

      '& > .MuiBox-root > .MuiTypography-root': {
        color: theme.palette.textSuccess,
        fontSize: '12px',
        fontWeight: '500',
      },

      '& > .MuiBox-root ': {
        height: '14px',

        '& svg': {
          width: '14px',
          height: '14px',

          '& path': {
            stroke: theme.palette.textSuccess,
          },
        },
      },
    },
  },

  toDoChip: {
    borderRadius: '16px',
    height: '22px',
    border: 'none',

    '& > .MuiBox-root:first-child ': {
      background: theme.palette.surfaceWarningSubtle,
      padding: '4px 6px 4px 8px',
      borderRadius: '16px',

      '& > .MuiBox-root > .MuiTypography-root': {
        color: theme.palette.textWarning,
        fontSize: '12px',
        fontWeight: '500',
      },

      '& > .MuiBox-root ': {
        height: '14px',

        '& svg': {
          width: '14px',
          height: '14px',

          '& path': {
            stroke: theme.palette.textWarning,
          },
        },
      },
    },
  },

  sendEmailBtn: {
    '&.MuiButtonBase-root': {
      '& .MuiButton-startIcon ': {
        marginRight: '4px',
        marginLeft: 0,

        '& svg': {
          width: '16px',
          height: '16px',
        },
      },
    },
  },

  disbaleEmail: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: 'auto',

    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },

  cancelledChip: {
    borderRadius: '16px',
    height: '22px',
    border: 'none',

    '& > .MuiBox-root:first-child ': {
      background: theme.palette.surfaceAlertSubtle,
      padding: '4px 6px 4px 8px',
      borderRadius: '16px',

      '& > .MuiBox-root > .MuiTypography-root': {
        color: theme.palette.textAlert,
        fontSize: '12px',
        fontWeight: '500',
      },

      '& > .MuiBox-root ': {
        height: '14px',

        '& svg': {
          width: '14px',
          height: '14px',

          '& path': {
            stroke: theme.palette.textAlert,
          },
        },
      },
    },
  },
}));
