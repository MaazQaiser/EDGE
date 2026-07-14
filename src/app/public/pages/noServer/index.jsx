import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as NoServerIcon } from 'assets/svg/NoServerIcon.svg?react';
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
      margin: '46px 0px 0px 0px',
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

const NoServer = () => {
  const { t } = useTranslation();
  const classes = useStyles(); // Move the 'classes' assignment inside the component
  return (
    <Box className={classes.notesBox}>
      <NoServerIcon />
      <Box className={classes.maxWidth}>
        <Typography variant="h2" className={classes.notesError}>
          {t('errors.noServer')}
        </Typography>
        <Typography variant="body2" className={classes.notesMessage}>
          {t('errors.noServertext')}
        </Typography>
      </Box>
      <Button
        variant="primary"
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('errors.retry')}
      </Button>
    </Box>
  );
};

export default NoServer;
