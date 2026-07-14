import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  userName: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary1,
      textTransform: 'capitalize',
    },
  },

  headerWrapper: {
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  header: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },

  searchWidth: {
    width: '218px',
  },

  pageWidth: {
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
  },
}));
