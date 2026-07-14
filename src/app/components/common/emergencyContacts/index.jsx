import { Alert, Button, Checkbox, InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { ReactComponent as AddPersonIcon } from 'assets/svg/person-add.svg?react';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';

import PhoneNumberWithCountry from '../phoneNumberWithCountry';
import { useStyles } from '.';
const EmergencyContactsComponent = ({
  errorMessages,
  formDataKey,
  formData,
  updateFormHandler,
  setErrorMessages,
  role = false,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const addForm = () => {
    const contactsToDisplay = formData?.[formDataKey]?.filter((data) => !data?._destroy)?.length;
    if (contactsToDisplay >= 4) {
      return;
    }
    let newObj = {
      name: '',
      contact: '',
      email: null,
      isEmergencyContact: false,
    };
    if (role) {
      newObj = { ...newObj, role: '' };
    }
    setErrorMessages((prev) => removeKey([formDataKey], prev));
    updateFormHandler(formDataKey, [...(formData?.[formDataKey] ?? []), newObj]);
  };
  const removeForm = (index) => {
    const updatedForms = formData?.[formDataKey]
      .map((form, i) => {
        if (i === index && form?.id) {
          return { ...form, _destroy: true };
        }
        if (i === index && !form?.id) {
          return {};
        }
        return form;
      })
      .filter((data) => !isObjectEmpty(data));
    updateFormHandler(formDataKey, updatedForms);
    if (role) {
      setErrorMessages((prev) => removeKey([getErrorKey('role', formDataKey, index)], prev));
    }
    setErrorMessages((prev) => removeKey([getErrorKey('contact', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('name', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('email', formDataKey, index)], prev));
  };
  /**
   *
   * @param {*} index
   * @param {*} field
   * @param {*} value
   */
  const handleFieldChange = (index, field, value) => {
    const updatedForms = [...(formData?.[formDataKey] ?? [])];
    updatedForms[index][field] = value == undefined ? null : value;
    updateFormHandler(formDataKey, updatedForms);
    if (value) {
      const errorKey = getErrorKey(field, formDataKey, index);
      setErrorMessages((prev) => removeKey([errorKey], prev));
    }
  };
  /**
   * Generate Key for Joi
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };
  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const showError = (key, formDataKey, index) => {
    return errorMessages?.[`${getErrorKey(key, formDataKey, index)}`];
  };
  const disableAddButton =
    formData?.[formDataKey]?.filter((data) => !data?._destroy)?.length >= 4 ? true : false;
  return (
    <Box className={classes.addContactsWrapper}>
      {formData?.[formDataKey]?.map((form, index) => {
        if (!form?._destroy) {
          return (
            <Box key={index} className={classes.addContactsBox}>
              <Box className={classes.addContactsBoxHeader}>
                <Typography variant="h4" className={classes.addContactsBoxHeaderTitle}>
                  {t('obx.sites.siteInformation.person')} {index + 1}
                </Typography>
                <Button
                  onClick={() => removeForm(index)}
                  variant="destructiveSecondary"
                  className={classes.addContactsBoxHeaderBtn}
                  startIcon={<DeleteIcon />}
                  disableRipple
                >
                  {t('obx.buttons.removeContact')}
                </Button>
              </Box>
              <Box className={classes.addContactsBoxContent}>
                <Box className={classes.addContactsBoxGroup}>
                  <Box className={classes.addContactsBoxGroupControl}>
                    <InputLabel htmlFor="name">
                      {t('obx.form.input.textField.name.label')}
                      <RequiredAsterik />
                    </InputLabel>
                    <TextField
                      error={!!showError('name', formDataKey, index)}
                      placeholder={`${t('form.input.textField.name.placeHolder')}
              `}
                      fullWidth
                      type="text"
                      className={classes.addContactsInputs}
                      value={form.name}
                      onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                      helperText={
                        !!showError('name', formDataKey, index)
                          ? showError('name', formDataKey, index)
                          : null
                      }
                    />
                  </Box>
                  <Box className={classes.addContactsBoxGroupControl}>
                    <InputLabel htmlFor="contact">
                      {t('form.input.textField.contact.label')}
                      <RequiredAsterik />
                    </InputLabel>
                    <PhoneNumberWithCountry
                      isError={!!showError('contact', formDataKey, index)}
                      fullWidth
                      id="outlined-start-adornment"
                      placeholder={t('obx.form.input.textField.phoneNumber.placeHolder')}
                      name="phoneNumber"
                      className={classes.countryPhnNumber}
                      value={form.contact}
                      onChange={(value) => handleFieldChange(index, 'contact', value)}
                      variant="outlined"
                      error={
                        !!showError('contact', formDataKey, index)
                          ? showError('contact', formDataKey, index)
                          : null
                      }
                      international
                    />
                  </Box>
                </Box>
                <Box className={classes.addContactsBoxGroup}>
                  <Box className={classes.addContactsBoxGroupControl}>
                    <InputLabel htmlFor="contact-email">
                      {t('form.input.textField.email.label')}
                    </InputLabel>
                    <TextField
                      error={!!showError('email', formDataKey, index)}
                      fullWidth
                      value={form.email}
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'email',
                          e.target.value === '' ? null : e.target.value,
                        )
                      }
                      helperText={
                        !!showError('email', formDataKey, index)
                          ? showError('email', formDataKey, index)
                          : null
                      }
                      placeholder={t('form.input.textField.email.placeHolder')}
                      type="email"
                      className={classes.addContactsInputs}
                    />
                  </Box>
                  {role && (
                    <Box className={classes.addContactsBoxGroupControl}>
                      <InputLabel htmlFor="contact-role">
                        {t('obx.users.userInformation.role')}
                      </InputLabel>
                      <TextField
                        error={!!showError('role', formDataKey, index)}
                        fullWidth
                        value={form.role}
                        onChange={(e) => handleFieldChange(index, 'role', e.target.value)}
                        helperText={
                          !!showError('role', formDataKey, index)
                            ? showError('role', formDataKey, index)
                            : null
                        }
                        placeholder={t('obx.users.userInformation.role')}
                        type="role"
                        className={classes.addContactsInputs}
                      />
                    </Box>
                  )}
                  <Box className={classes.sitesContactCheckbox}>
                    <Checkbox
                      id="mark-emergency-contact"
                      onChange={(e) =>
                        handleFieldChange(
                          index,
                          'isEmergencyContact',
                          e.target.checked ? true : false,
                        )
                      }
                      icon={<CheckBoxRegularIcon />}
                      checked={form.isEmergencyContact}
                      checkedIcon={<CheckBoxCheckedIcon />}
                      className={classes.checkBoxCustom}
                    />
                    <InputLabel htmlFor="mark-emergency-contact">
                      {t('obx.form.input.textField.markEmergencyContact.label')}
                    </InputLabel>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        }
      })}
      {errorMessages?.[formDataKey] && (
        <Stack sx={{ width: '100%', alignItems: 'center' }} spacing={2}>
          <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
        </Stack>
      )}
      <Box
        onClick={addForm}
        className={`${classes.addContacts} ${disableAddButton ? classes.disabledButtonStyle : ''}`}
      >
        <AddPersonIcon />
        {t('obx.buttons.addContacts')}
      </Box>
    </Box>
  );
};
export default EmergencyContactsComponent;
EmergencyContactsComponent.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
  role: PropTypes.string,
};
