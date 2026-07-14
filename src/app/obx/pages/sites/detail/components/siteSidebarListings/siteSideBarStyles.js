import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  searchComponentWrapper: {
    padding: '12px',
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  searchComponent: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    margin: '0 auto',
  },

  detailSideList: {
    padding: '0 !important',
    '& .MuiButtonBase-root ': {
      padding: '24px',
    },
  },

  listText: {
    padding: '0 !important',
    margin: '0 !important',
  },

  ownerName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  type: {
    display: 'flex',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  typeChip: {
    marginTop: '6px',
  },

  statusBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activeListItem: {
    background: theme.palette.textPrimary,
    color: theme.palette.textOnColor,
    '& .MuiButtonBase-root': {
      '& .MuiListItemText-root': {
        '& .MuiTypography-root ': {
          color: 'inherit !important',
        },
        '& .MuiBox-root': {
          color: theme.palette.textOnColor,
          '& .MuiTypography-root ': {
            background: theme.palette.surfaceGreyStrong1,
          },
        },
      },
    },
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  customScroll: {
    height: 'calc(100vh - 100px)',
    overflowY: 'auto',
    '&:hover': {
      // overflowY: 'auto',
    },
  },

  listCustomClass: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.surfaceWhite,
  },

  chipSpace: {
    gap: '8px',
    display: 'flex',
    flexDirection: 'column',
  },
}));
