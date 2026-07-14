import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tabContainer: {
    borderBottom: `1px solid ${theme.palette.borderSubtle1}`,
    padding: '0 16px',
    '& .MuiTab-root': {
      textTransform: 'none',
      fontSize: '16px',
      fontWeight: 400,
      minHeight: '48px',
      color: theme.palette.textPlaceholder,
      '&.Mui-selected': {
        color: theme.palette.textBrand,
        fontWeight: 400,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: theme.palette.surfaceBrand,
    },
  },
  tabContent: {
    padding: '24px 32px',
  },
  descriptionText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
}));
