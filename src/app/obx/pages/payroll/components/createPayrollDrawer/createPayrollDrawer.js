import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  drawerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
    flex: '1 1',
  },

  drawerHeaderTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '6px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },

  footerArea: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: '12px',
    padding: '8px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    width: '100%',
  },

  drawerHeader: {
    padding: '36px 36px 24px 36px',
    textAlign: 'left',
    width: '100%',
  },

  headerArea: {
    width: '100%',
    padding: '0px 36px 20px 36px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: '1 1',
  },

  placeHolderColor: {
    color: `${theme.palette.textPlaceholderField} !important`,
    fontSize: '16px !important',
    fontWeight: '400 !important',
  },

  fieldWrapper: {
    display: 'flex',
    // alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },

  fieldArea: {
    flex: '0 0 31%',
  },

  dropdownWrap: {
    height: '44px !important',
  },

  skeletonDropdown: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
}));
