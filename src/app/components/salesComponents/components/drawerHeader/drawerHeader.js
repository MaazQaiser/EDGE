import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  boxHeader: {
    margin: '0px 0px 16px 0px',
  },

  titleHead: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    '& svg': {
      '& path': {
        fill: theme.palette.textPrimary,
      },
    },
  },

  sideTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
      marginBottom: '0',
    },
  },

  bulkSubHeading: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
}));
