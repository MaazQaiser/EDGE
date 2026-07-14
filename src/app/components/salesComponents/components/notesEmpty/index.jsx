import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { NotesEmptyIcon } from 'src/assets/svg';
const useStyles = makeStyles((_theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      padding: '40px !important',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      fontSize: '22px',
      fontWeight: '700',
      margin: '30px 0px 16px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      fontSize: '14px',
      fontWeight: '400',
      color: '#5B5B5F',
    },
  },
}));

const NotesEmptyState = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <NotesEmptyIcon />
      <Typography className={classes.notesError}>{t('sales.locations.notesError')}</Typography>
      <Typography className={classes.notesMessage}>{t('sales.locations.notesMessage')}</Typography>
    </Box>
  );
};

export default NotesEmptyState;
