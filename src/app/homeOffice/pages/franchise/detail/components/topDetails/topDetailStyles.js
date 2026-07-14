import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  franchiseSubheader: {
    position: 'sticky',
    backgroundColor: '#f5f5f6',
    left: 0,
    zIndex: 9,
    borderBottom: '1px solid #e6e6e7',
  },

  lowerText: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
    [theme.breakpoints.down('lg')]: {
      width: '270px',
      padding: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  upperText: {
    display: 'block',
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '6px',
    },
  },

  avatarSection: {
    display: 'flex',
    gap: '8px',
  },

  avatarImage: {
    display: 'block',
    width: '51px',
    height: '51px',
    borderRadius: '50%',
  },

  rightText: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
    },
  },

  bottomChip: {
    display: 'flex',
    gap: '8px',
  },

  rightDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  rightContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    [theme.breakpoints.down('lg')]: {
      gap: '16px',
    },
  },

  headerDetail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '16px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '16px 24px',
    },
  },
}));
