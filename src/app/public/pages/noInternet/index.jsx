import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as NoInternetIcon } from 'assets/svg/NoInternetIcon.svg?react';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((theme) => ({
  notesBox: {
    '&.MuiBox-root': {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'auto',
      height: '100vh',
      justifyContent: 'center',
    },
  },
  notesError: {
    '&.MuiTypography-root': {
      margin: '24px 0px 0px 0px',
    },
  },
  notesMessage: {
    '&.MuiTypography-root': {
      color: `${theme.palette.textSecondary2}`,
      marginBottom: '16px',
      marginTop: '16px',
    },
  },
  maxWidth: {
    maxWidth: '380px',
    margin: '0 auto',
    width: '100%',
  },
}));

const NoInternet = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <NoInternetIcon />
      <Box className={classes.maxWidth}>
        <Typography variant="h2" className={classes.notesError}>
          {t('errors.noInternet')}
        </Typography>
        <Typography variant="body2" className={classes.notesMessage}>
          {t('errors.noInternetConnectionText')}
        </Typography>
      </Box>
      <Button variant="primary"> {t('errors.retry')}</Button>
    </Box>
  );
};

export default NoInternet;
