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
  searchCustomClass: {
    maxHeight: '36px',
  },
  detailSideList: {
    padding: '0 !important',
    '& .MuiButtonBase-root ': {
      padding: '24px',
    },
  },
  listCustomClass: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.surfaceWhite,
    paddingLeft: '1px !important',
  },
  listText: {
    padding: '0 !important',
    margin: '0 !important',
    '& .MuiListItemText-primary': {
      fontWeight: '500 !important',
      wordBreak: 'break-word !important',
      fontSize: '16px',
      lineHeight: '24px',
    },
  },
  id: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      fontSize: '12px !important',
      background: theme.palette.surfaceGreySubtle,
      fontWeight: '400',
      lineHeight: '18px',
      display: 'inline-block',
      borderRadius: '100px',
      padding: '0 8px',
    },
  },
  statusBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '8px',
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
}));
