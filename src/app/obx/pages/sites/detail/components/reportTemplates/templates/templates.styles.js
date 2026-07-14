import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  templates: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px',
    },
  },

  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingTop: '24px',
  },

  templateSearch: {
    height: '36px',
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
