import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Eye } from 'assets/images/eye.svg?react';
import { ReactComponent as EyeOff } from 'assets/images/eye-off.svg?react';
import { ReactComponent as Lock } from 'assets/images/lock.svg?react';
import { ReactComponent as Email } from 'assets/images/mail.svg?react';
import { ReactComponent as Logo } from 'assets/images/signalLogo.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

const useStyles = makeStyles((theme) => ({
  manageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
      marginTop: '4px',
    },
  },

  manageTitle: {
    '&.MuiTypography-root': {
      color: theme.palette.textPrimary,
    },
  },

  mainContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
    border: '1px solid #e6e6e7',
    background: '#fff',
    boxShadow: '0px 2px 20px 0px rgba(0, 122, 255, 0.05)',
    width: '410px',
    padding: '50px 25px',
    textAlign: 'center',
    zIndex: '1',
    outline: 'none',
  },

  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  mainContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },

  wrapperContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '36px',
  },

  iconSvg: {
    width: '16px',
    height: '16px',
  },

  logoImage: {
    '& svg': {
      height: '36px',
    },
  },

  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));

const userFormData = {
  email: '',
  password: '',
};

const allowedUsers = [
  {
    email: 'admin@signal.com',
    password: 'Admin@123',
  },
  {
    email: 'dev@signal.com',
    password: 'Dev@123',
  },
];

const CredentialsModal = ({ open, handleClose }) => {
  const classes = useStyles();

  const { t } = useTranslation();

  const [invalidMsg, setInvalidMsg] = useState({
    msg: 'Invalid email or password',
    show: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const {
    handleInputChange,
    // updateFormHandler,
    formData,
    // setFormData,
    errorMessages,
    setErrorMessages,
  } = useFormHook({
    defaultFormData: {
      ...userFormData,
    },
  });

  const validateForm = async (e) => {
    e.preventDefault();
    setInvalidMsg((prev) => ({
      ...prev,
      show: false,
    }));
    const errors = await formValidatorJoi(formData, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }

    submitForm(formData);
  };

  const submitForm = (payload) => {
    const user = allowedUsers.find((user) => user.email === payload.email);
    if (!user || user.password !== payload.password) {
      setInvalidMsg((prev) => ({
        ...prev,
        show: true,
      }));
      return;
    }
    localStorage.setItem('devLogin', JSON.stringify(user));
    toaster.success({
      text: 'Logged-in successfully!',
      position: 'top-right',
      autoClose: toastSettings.AUTO_CLOSE,
    });
    handleClose(false);
  };

  const modalBody = (
    <Box className={classes.mainContainer}>
      <Box className={classes.mainPasswordSection}>
        <Box className={classes.mainContentWrapper}>
          <Box className={classes.logoImage}>
            <Logo alt="signalLogo" />
          </Box>
          <Box className={classes.welcomeContent}>
            <Typography variant="h1" className={classes.manageTitle}>
              Add your credentials
            </Typography>
            <Typography className={classes.manageText} variant="body2">
              Enter email & password to access signal support centre page
            </Typography>
          </Box>
          <Box component="form" className={classes.wrapperContent}>
            <Box className={classes.formSection}>
              <Box>
                <TextField
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t('form.input.textField.email.placeHolder')}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                  value={formData.email}
                  onChange={handleInputChange}
                  helperText={errorMessages?.email}
                  error={!!errorMessages?.email}
                />
              </Box>
              <Box>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  placeholder={t('form.input.textField.password.placeHolder')}
                  fullWidth
                  value={formData.password}
                  onChange={handleInputChange}
                  helperText={errorMessages?.password}
                  error={!!errorMessages?.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    // <-- This is where the toggle button is added.
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? (
                            <Eye className={classes.iconSvg} />
                          ) : (
                            <EyeOff className={classes.iconSvg} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {invalidMsg.show && <div className={classes.invalidFeedback}>{invalidMsg.msg}</div>}

            <Button
              className={classes.loginButton}
              onClick={validateForm}
              type={'submit'}
              variant="primary"
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      slotProps={{ backdrop: { style: { backgroundColor: '#fff' } } }}
    >
      {modalBody}
    </Modal>
  );
};

CredentialsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CredentialsModal;
