import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  addBannedVisitorDrawer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },

  addBannedVisitorDrawerHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
  },

  closeBtn: {
    '&.MuiButtonBase-root': {
      minWidth: 'fit-content',
      padding: 0,

      '&:hover': {
        background: 'transparent',
      },
    },
  },

  addBannedVisitorDrawerBody: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    gap: '16px',
    paddingTop: 0,
    padding: '24px 24px',
    minWidth: 0,
    width: '100%',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
      padding: '16px',
    },
  },

  pdfDocumentWrapper: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
  },

  pdfLoadingSkeletons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',

    '& .MuiSkeleton-root': {
      height: 100,
      borderRadius: '8px !important',
      transform: 'none',
      transformOrigin: 0,
    },
  },

  reportsDrawerActions: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '12px',
  },
}));
