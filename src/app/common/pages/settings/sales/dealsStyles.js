import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((theme) => ({
  header: {
    marginBottom: '24px',
    display: 'flex',
    gap: '4px',
    flexDirection: 'column',
  },
  title: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
    },
  },
  tagline: {
    '&.MuiTypography-root ': {
      color: theme.palette.textPrimary,
    },
  },
  searchSection: {
    marginBottom: '24px',
    display: 'flex',
    gap: '4px',
    justifyContent: 'space-between',
  },
  tableWrapperOne: {
    borderTop: `1px solid ${theme.palette.borderSubtle1}`,
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
  },
  timeHeader: {
    display: 'grid',
    gap: '48px',
    gridTemplateColumns: '1fr 1fr',
    padding: '12px 24px',
    alignItems: 'center',
  },
}));
