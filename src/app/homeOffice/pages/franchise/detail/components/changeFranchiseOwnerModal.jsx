import { Box, Button, InputAdornment, InputLabel, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as EmailIcon } from 'assets/images/email.svg?react';
import { ReactComponent as EditFranchiseIcon } from 'assets/svg/edit.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';

const useStyles = makeStyles((theme) => ({
  editSection: {
    height: '57px',
    width: '57px',
    padding: '12px',
    borderRadius: '28px',
    border: '8px solid  #E5F6FF',
    background: theme.palette.surfaceBrandDisabled,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.textBrandHover,
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  mainFlexBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  modalContent: {
    '&.MuiTypography-root': {
      color: theme.palette.textPlaceholder,
    },
  },
  buttonSection: {
    display: 'flex',
    gap: '12px',
    paddingTop: '12px',
    justifyContent: 'flex-end',
  },
  headerMain: {
    display: ' flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mainModalComponent: {
    display: ' flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: theme.palette.surfaceWhite,
    boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
    borderRadius: '12px',
    padding: '24px',
    width: '600px',
  },
}));
const ChangeFranchiseOwnerModal = ({
  formData,
  setFormData,
  errorMessages,
  handleSubmit,
  handleClose,
  disabled,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

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

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} className={classes.mainModalComponent}>
        <Box className={classes.editSection}>
          <EditFranchiseIcon />
        </Box>
        <Box className={classes.headerMain}>
          <Typography id="modal-modal-title" variant="h4">
            {t('commonText.modal.changeFranchiseOwner.title')}
          </Typography>
          <Typography id="modal-modal-description" variant="body2" className={classes.modalContent}>
            {t('commonText.modal.changeFranchiseOwner.text')}
          </Typography>
        </Box>
        <Box className={classes.formSection}>
          <Box className={classes.mainFlexBox}>
            <InputLabel htmlFor="firstName">
              {t('form.input.textField.firstName.label')}
              <RequiredAsterik />
            </InputLabel>
            <TextField
              variant="outlined"
              type="text"
              name="firstName"
              placeholder={t('form.input.textField.firstName.placeHolder')}
              defaultValue={formData.firstName}
              onChange={(e) => inputChangedHandler(e)}
              helperText={errorMessages?.firstName}
              error={errorMessages?.firstName}
            />
          </Box>
          <Box className={classes.mainFlexBox}>
            <InputLabel htmlFor="lastName">
              {t('form.input.textField.lastName.label')} <RequiredAsterik />
            </InputLabel>
            <TextField
              variant="outlined"
              name="lastName"
              placeholder={t('form.input.textField.lastName.placeHolder')}
              defaultValue={formData.lastName}
              onChange={(e) => inputChangedHandler(e)}
              helperText={errorMessages?.lastName}
              error={errorMessages?.lastName}
            />
          </Box>
          <Box className={classes.mainFlexBox}>
            <InputLabel htmlFor="email">
              {t('form.input.textField.email.label')} <RequiredAsterik />
            </InputLabel>
            <TextField
              variant="outlined"
              name="email"
              type="email"
              placeholder={t('form.input.textField.email.placeHolder')}
              defaultValue={formData.email}
              onChange={(e) => inputChangedHandler(e)}
              error={errorMessages?.email}
              helperText={errorMessages?.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
        <Box className={classes.buttonSection}>
          <Button variant="secondaryGrey" onClick={handleClose}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={disabled}>
            {t('buttons.changeOwner')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

ChangeFranchiseOwnerModal.propTypes = {
  formData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData: PropTypes.func,
  errorMessages: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
  disabled: PropTypes.bool,
};

export default ChangeFranchiseOwnerModal;
