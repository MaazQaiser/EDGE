import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  noChangesContainer: {
    padding: '57px 32px 0px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    height: '100%',
    maxHeight: '326px',
  },
  noChangesContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    maxWidth: '368px',
  },
  noChangesTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      textTransform: 'capitalize',
    },
  },
  noChangesSubtitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
      textAlign: 'center',
    },
  },
  noChangesImage: {
    width: '108px',
    height: '120px',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },
}));
