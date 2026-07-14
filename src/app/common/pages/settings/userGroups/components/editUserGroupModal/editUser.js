import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  modalWrapper: {
    maxWidth: '1140px',
    width: '100%',
    backgroundColor: `${theme.palette.surfaceWhite}`,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    position: 'absolute',
    left: '50%',
    top: '50%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRadius: '12px',
    maxHeight: '80vh',
    transform: 'translate(-50%,-50%)',
    '& .MuiFormControl-root': {
      margin: '0px',
    },
  },

  inlineButtons: {
    display: 'flex',
    gap: '12px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    paddingTop: '8px',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      height: '36px',
    },
  },
  closetext: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary3}`,
    },
  },
  headText: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textPrimary}`,
    },
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  modalContentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabsfunctionalWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    // padding: '0 32px',
    flex: 'unset',
    borderBottom: '1px solid #e6e6e7',
    '& .MuiTab-root': {
      padding: '0 8px !important',
      minWidth: 'unset',
      maxWidth: 'unset',
    },
  },
  tabMainContainer: {
    '& .MuiTabs-scroller': {
      '& .MuiTabs-flexContainer ': {
        overflow: 'auto',
      },
    },
  },
  tabsContent: {
    flex: 1,
    overflow: 'auto',
  },
  tabPanelContent: {
    padding: '24px 0px 0px',
    '& > .MuiBox-root': {
      padding: '0px',
    },
  },
  permissionsGridWrapper: {
    overflow: 'auto',
    maxHeight: 'calc(80vh - 292px)',
  },
  userListingWrapper: {
    '& .userListingTable': {
      overflow: 'auto',
      maxHeight: 'calc(80vh - 292px)',
    },
  },
}));
