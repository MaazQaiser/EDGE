import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '32px',
  },

  asideHeader: {
    padding: '16px 24px',
    boxShadow: '0px -1px 0px 0px #F0F0F0 inset',
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flex: 1,
  },

  name: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },

    '& .MuiChip-root': {
      mixBlendMode: 'multiply',
    },
  },

  HeaderRight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },

  banVisitorReasonDetail: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },

    '& strong': {
      color: theme.palette.textPrimary,
      fontWeight: 500,
    },
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
}));
