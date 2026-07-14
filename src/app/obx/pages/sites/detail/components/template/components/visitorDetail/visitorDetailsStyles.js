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

  asideHeaderBan: {
    padding: '16px 24px',
    background: theme.palette.surfaceAlertSubtle,
  },

  profileWrapper: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '12px',
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

  userDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  status: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
    },
  },

  banVisitorReasons: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  label: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },

  labelData: {
    '&.MuiTypography-root': {
      fontWeight: '500',
      color: theme.palette.textPrimary,
    },
  },

  visitorHeaderRight: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },

  unbanBtn: {
    '&.MuiButtonBase-root': {
      '& .MuiButton-startIcon': {
        '& path:nth-child(2)': {
          fill: theme.palette.textPlaceholder,
        },
      },
    },
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

  banVisitorReasonText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },

    '& strong': {
      color: theme.palette.textPlaceholder,
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

  imageWrapper: {
    height: '40px',
    width: '40px',
    '& img': {
      height: '100%',
      width: '100%',
      objectFit: 'contain',
      borderRadius: '50%',
    },
  },
  StatsWrapper: {
    padding: '24px 24px 0 24px',
    display: 'grid',
    gridTemplateColumns: `repeat(4, 1fr)`,
    columnGap: theme.spacing(2),
  },
  statsList: {
    padding: '8px 12px',
    borderRadius: '8px',
    background: theme.palette.surfaceGreySubtle,
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownWrapper: {
    padding: '24px 24px 0',
    display: 'flex',
  },
  mainTableWrapper: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
}));
