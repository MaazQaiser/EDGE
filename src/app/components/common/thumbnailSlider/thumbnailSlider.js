import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  addBannedVisitorDrawer: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
  },
  liteBox: {
    display: 'none',
  },
  addBannedVisitorDrawerTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },
  yarl__container: {
    opacity: '0.5',
  },
  yarl__thumbnails_container: {
    opacity: '0.5',
  },
  yarl__slide: {
    paddingTop: '50px',
    paddingbottom: '40px',
    '&img.yarl__slide_image': {
      borderRadius: '24px',
    },
  },
}));
