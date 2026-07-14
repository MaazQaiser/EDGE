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
    fontSize: '16px',
    '& .MuiListItemText-primary': {
      fontWeight: '500 !important',
      wordBreak: 'break-word',
      color: theme.palette.textPrimary,
    },
  },
  ownerName: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px !important',
      fontStyle: 'normal',
      fontWeight: '400',
      lineHeight: '16px !important',
    },
  },
  type: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    marginTop: '4px',
    gap: '8px',
    '& .MuiTypography-root': {
      backgroundColor: 'transparent !important',
      color: theme.palette.textPrimary,
      fontSize: '12px !important',
      fontWeight: '400',
      lineHeight: '18px',
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
}));
