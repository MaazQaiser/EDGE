import { Box, Button, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { LOGIN } from 'app/router/constant/ROUTE';
import history from 'app/router/utils/history';
import { ReactComponent as Logo } from 'assets/images/signalLogo.svg?react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { updatePassword } from 'services/auth.services';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../utils/formValidator/formValidator.requiredCheck';
import scssClasses from './changePassword.module.scss';
const useStyles = makeStyles((theme) => ({
  manageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  backLogin: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary2,
      paddingTop: '26px',
    },
  },
  loginButton: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      padding: '10px 16px ',
    },
  },
}));
const initialFormData = {
  newPassword: '',
  passwordConfirmation: '',
};

const ChangePassword = () => {
  const classes = useStyles();

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState({});

  const [disabled, setDisabled] = useState(false);

  const { t } = useTranslation();

  const updateFormHandler = (name, value) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
  };
  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const handleSubmit = async (event) => {
    // Prevent page reload
    event.preventDefault();
    setDisabled(true);

    const errors = await formValidatorJoi(formData, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setDisabled(false);
      return;
    }

    try {
      const response = await updatePassword(formData);
      if (response?.statusCode === 200) {
        history.push(LOGIN);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */

      setDisabled(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
    }
  };

  // JSX code for login form
  const renderForm = (
    <Box component="form" onSubmit={handleSubmit} className={scssClasses.wrapperContent}>
      <Box className={scssClasses.formSection}>
        <Box>
          <TextField
            error={errorMessages?.newPassword ? true : false}
            type={'password'}
            name="newPassword"
            helperText={errorMessages?.newPassword}
            placeholder={t('form.input.textField.newPassword.placeHolder')}
            defaultValue={formData.newPassword}
            onChange={(e) => inputChangedHandler(e)}
            fullWidth
          />
        </Box>
        <Box>
          <TextField
            error={errorMessages?.passwordConfirmation ? true : false}
            type={'password'}
            fullWidth
            helperText={errorMessages?.passwordConfirmation}
            name="passwordConfirmation"
            placeholder={t('form.input.textField.confirmPassword.placeHolder')}
            defaultValue={formData.passwordConfirmation}
            onChange={(e) => inputChangedHandler(e)}
          />
        </Box>
      </Box>

      <Button className={classes.loginButton} variant="primary" type="submit" disabled={disabled}>
        {t('buttons.updatePassword')}
      </Button>
    </Box>
  );

  return (
    <Box className={scssClasses.mainContainer}>
      <Box className={scssClasses.bannerImage}></Box>
      <Box className={scssClasses.mainPasswordSection}>
        <Box className={scssClasses.mainContentWrapper}>
          <Box className={scssClasses.logoImage}>
            <Logo alt="signalLogo" />
          </Box>
          <Box className={scssClasses.welcomeContent}>
            <Typography gutterBottom variant="h1">
              {t('commonText.resetPassword.title')}
            </Typography>
            <Typography gutterBottom className={classes.manageText} variant="body2">
              {t('commonText.resetPassword.desc')}
            </Typography>
          </Box>
          {renderForm}
        </Box>
        <Link to={LOGIN}>
          <Typography variant="subtitle2" className={classes.backLogin}>
            {t('links.backToLogin')}
          </Typography>
        </Link>
      </Box>
    </Box>
  );
};

export default ChangePassword;
