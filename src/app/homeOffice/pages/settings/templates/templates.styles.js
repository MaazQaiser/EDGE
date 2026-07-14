import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },

  templateSearch: {
    height: '36px',
  },

  templateHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  templateHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  templateBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  templatesTD: {
    cursor: 'pointer',
    '&:hover': {
      '& .MuiBox-root': {
        '& > :nth-child(2)': {
          '& svg': {
            visibility: 'visible !important',
          },
        },
      },
    },
  },

  templatesTitleIcon: {
    width: '20px',
    height: '20px',
    '& svg': {
      visibility: 'hidden',
      width: '20px',
      height: '20px',
      '& path': {
        stroke: theme.palette.textPlaceholder,
      },
    },
  },

  templatesTitle: {
    display: 'flex !important',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  templatesTitleText: {
    maxWidth: '270px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  templateCreator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  templateExportButton: {
    '&.MuiButtonBase-root': {
      '&:disabled': {
        '& .MuiButton-startIcon': {
          '& svg': {
            '& g': {
              '& path': {
                stroke: theme.palette.textDisabled,
              },
            },
          },
        },
      },
    },
  },
}));
