import { Box, Button, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { ReactComponent as Logo } from 'assets/images/signalLogo.svg';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import scssClasses from 'src/app/obx/pages/profile/style.module.scss';

const useStyles = makeStyles((theme) => ({
  inputComponent: {
    '&.MuiBox-root': {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
  },
  manageText: {
    '&.MuiTypography-root': {
      color: theme.palette.textSecondary3,
    },
  },
  btnGroupBox: {
    '&.MuiBox-root': {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '26px',
    },
  },
  loginButton: {
    '&.MuiButtonBase-root': {
      height: 'auto',
      padding: '10px 16px ',
    },
  },
  logoWrapper: {
    height: '36px',
    '& svg': {
      height: '100%',
    },
  },
}));
const updatePasswordConstants = {
  CURRENT_PASSWORD: 'currentPassword',
  NEW_PASSWORD: 'newPassword',
  PASSWORD_CONFIRMATION: 'passwordConfirmation',
};
const style = {
  display: ' flex',
  flexDirection: 'column',
  gap: '36px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#FFF',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '20px',
  p: '50px 25px',
  alignItems: 'center',
  textAlign: 'center',
  width: '450px',
};
const UpdatePassword = ({
  open,
  handleClose,
  handleSubmit,
  formData,
  handleInputChange,
  renderError,
  disabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const tenantInfo = useSelector((state) => state.auth?.tenantInfo);

  const modalBody = (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={scssClasses.mainBoxForm}
        sx={style}
      >
        <Box className={classes.logoWrapper}>
          <img src={tenantInfo?.logo} style={{ width: '170px', height: '50px' }} />
        </Box>

        <Box className={scssClasses.loginHeadingWrapper}>
          <Typography gutterBottom variant="h1">
            {t('commonText.updatePassword')}
          </Typography>
          <Typography className={classes.manageText} variant="body2">
            {t('commonText.updatePasswordText')}
          </Typography>
        </Box>
        <Box className={classes.inputComponent}>
          <TextField
            error={renderError(updatePasswordConstants?.CURRENT_PASSWORD) ? true : false}
            value={formData?.currentPassword}
            onChange={handleInputChange}
            name="currentPassword"
            type={'password'}
            helperText={renderError(updatePasswordConstants?.CURRENT_PASSWORD)}
            placeholder={t('form.input.textField.currentPassword.placeHolder')}
            fullWidth
          />

          <TextField
            error={renderError(updatePasswordConstants?.NEW_PASSWORD) ? true : false}
            value={formData?.newPassword}
            onChange={handleInputChange}
            type={'password'}
            name="newPassword"
            helperText={renderError(updatePasswordConstants?.NEW_PASSWORD)}
            placeholder={t('form.input.textField.newPassword.placeHolder')}
            fullWidth
          />

          <TextField
            error={renderError(updatePasswordConstants?.PASSWORD_CONFIRMATION) ? true : false}
            value={formData?.passwordConfirmation}
            onChange={handleInputChange}
            type={'password'}
            helperText={renderError(updatePasswordConstants?.PASSWORD_CONFIRMATION)}
            name="passwordConfirmation"
            placeholder={t('form.input.textField.confirmPassword.placeHolder')}
            fullWidth
          />
        </Box>
        <Box className={classes.btnGroupBox}>
          <Button
            disabled={disabled}
            className={classes.loginButton}
            type="submit"
            variant="primary"
            fullWidth
          >
            {t('commonText.updatePassword')}
          </Button>
          <Button
            onClick={() => {
              handleClose();
            }}
            variant="tertiaryGrey"
          >
            {t('links.cancel')}
          </Button>
        </Box>
      </Box>
    </>
  );
  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

UpdatePassword.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleSubmit: PropTypes.func,
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  handleInputChange: PropTypes.func,
  renderError: PropTypes.func,
  disabled: PropTypes.bool,
};

export default UpdatePassword;
