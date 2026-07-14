import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '640px',
    margin: '24px auto',
    gap: '16px',
    marginBottom: '84px',
  },
  footerWrapper: {
    position: 'fixed',
    height: '60px',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    width: '100%',
    padding: '12px 32px',
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    zIndex: '10',
  },
  selectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignSelf: 'stretch',
    width: '100%',
  },
  label: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimery,
    },
  },
  SelectGroup: {
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    background: theme.palette.surfaceWhite,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1 0 0',
    height: 'unset',
  },
  chipsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    '& .MuiChip-root': {
      '& .MuiChip-deleteIcon': {
        margin: '0px',
      },
    },
  },
  grayWrapper: {
    display: 'flex',
    padding: '12px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    alignSelf: 'stretch',
    borderRadius: '12px',
    background: theme.palette.surfaceGreySubtle,
  },

  dropDownSkeleton: {
    '&.MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
    },
  },
  blueChip: {
    '&.MuiButtonBase-root': {
      color: `${theme.palette.textOnColor} !important`,
      backgroundColor: `${theme.palette.surfaceBrand} !important`,
    },
  },
}));
