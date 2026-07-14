import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  searchComponentWrapper: {
    padding: '12px',
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
    '& .MuiListItemText-primary': {
      fontWeight: '500 !important',
      color: theme.palette.textPrimary,
      wordBreak: 'break-all',
    },
  },

  ownerName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px !important',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px !important',
      textTransform: 'capitalize',
    },
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
        },
      },
    },
  },

  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  vehicleName: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}));
