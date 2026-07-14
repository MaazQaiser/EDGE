import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  // hitCardWrapper: {
  //   padding: '24px 0px 0px 0px',
  // },
  HitStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3 , 1fr)',
    gap: '16px',
    paddingBottom: '16px',
    // borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  hitItemTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      textTransform: 'capitalize',
    },
  },
  hitItem: {
    '& .MuiChip-root.MuiChip-filled': {
      display: 'block',
      width: 'fit-content',
    },
  },
  purpleChip: {
    '&.MuiChip-root.MuiChip-filled': {
      backgroundColor: '#F4EDFD',
      color: '#9747FF',
    },
  },

  hitItemSubTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  mapWrapper: {
    height: '300px',

    '& > div': {
      border: `1px solid ${theme.palette.borderSubtle1}`,
      borderRadius: '8px 8px 0px 0px',
    },
  },
  bottomArea: {
    marginBottom: '20px',
    backgroundColor: theme.palette.surfaceWhite,
    padding: '8px',
    width: '100%',
    height: '52px',
    borderRadius: '0px 0px 5px 5px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    overflowX: 'auto',
    boxShadow: '0px 4px 12px -6px rgba(0, 0, 0, 0.10)',
    border: `1px solid ${theme.palette.borderSubtle1}`,

    overflowY: 'hidden',
    '& .MuiButtonBase-root': {
      fontSize: '12px',
      color: theme.palette.textPrimary,
      pointerEvents: 'none',
      padding: '0px',
      height: 'auto',
      flex: '0 0 auto',
      minWidth: 'auto',
    },
  },
  assignButton: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '20px',
      color: theme.palette.textAlert,
      '&:disabled': {
        color: theme.palette.textDisabled,
      },
    },
  },
  disable: {
    '&.MuiButtonBase-root': {
      padding: '0px',
      height: '20px',
      color: theme.palette.textDisabled,
      '&:disabled': {
        color: theme.palette.textDisabled,
      },
    },
  },
  fieldSkelton: {
    '&.MuiSkeleton-root': {
      height: '20px',
      borderRadius: '5px !important',
    },
  },
  loaderBox: {
    '& .MuiSkeleton-root': {
      height: '44px',
      transformOrigin: 0,
      transform: 'none',
      borderRadius: '8px !important',
      marginBottom: '12px',
    },
  },
  nameAvatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& .MuiAvatar-root': {
      width: '20px',
      height: '20px',
    },
    '& svg': {
      cursor: 'pointer',
    },
  },
  shiftProgressWrapper: {
    marginBottom: '16px',
  },
  editButtonInner: {
    background: theme.palette.surfaceGreySubtle,
    border: `1px solid ${theme.palette.borderSubtle1}`,
    borderRadius: '4px',
    color: theme.palette.textPrimary,
    fontSize: '12px',
    marginBottom: '24px',
    height: '40px',
    padding: '0px 12px',
    boxShadow: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& img': {
      width: '24px',
      height: '24px',
      borderRadius: '60px',
    },
  },
  autoCheckout: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.surfaceGreySubtle,
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle1}`,
    height: '36px',
    padding: '8px 12px',
    marginBottom: '16px',
    maxWidth: '100%',
  },
  autoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}));
