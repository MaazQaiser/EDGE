import { Button, InputLabel, TextField } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { makeStyles } from '@mui/styles';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import { ReactComponent as Trash } from 'assets/svg/trash-2.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isObjectEmpty, removeKey } from 'src/helper/utilityFunctions';

import RequiredAsterik from '../requiredAsterik';

const useStyles = makeStyles((theme) => ({
  mainHeading: {
    '&.MuiTypography-root': {
      fontWeight: '700',
      fontSize: '28px',
      lineHeight: '36px',
    },
  },

  binIcon: {
    '&.MuiButtonBase-root': {
      padding: '10px',
      minWidth: 'unset',
      borderColor: theme.palette.borderSubtle2,
      minHeight: '43px',
    },
  },

  formBoxIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '32px',
    marginBottom: '20px',
    alignItems: 'baseline',
  },

  flexControl: {
    flex: '1 1',
  },

  inputWrapper: {
    flex: '1 1',
  },

  trashWrapper: {
    display: 'flex',
    gap: '8px',
  },

  trashInput: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },

  addContact: {
    '&.MuiButtonBase-root': {
      marginBottom: '20px !important',
    },
  },
}));

function DynamicFormComponent({
  formData,
  errorMessages,
  updateFormHandler,
  formDataKey,
  setErrorMessages,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const TrashInputClass = classNames(classes.flexControl, classes.trashInput);

  const addForm = () => {
    const contactsToDisplay = formData?.[formDataKey]?.filter((data) => !data?._destroy)?.length;
    if (contactsToDisplay >= 4) {
      return;
    }
    setErrorMessages((prev) => removeKey([formDataKey], prev));
    updateFormHandler(formDataKey, [...(formData?.[formDataKey] ?? []), { name: '', contact: '' }]);
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
    setErrorMessages((prev) => removeKey([getErrorKey('contact', formDataKey, index)], prev));
    setErrorMessages((prev) => removeKey([getErrorKey('name', formDataKey, index)], prev));
  };

  /**
   *
   * @param {*} index
   * @param {*} field
   * @param {*} value
   */
  const handleFieldChange = (index, field, value) => {
    const updatedForms = [...(formData?.[formDataKey] ?? [])];
    updatedForms[index][field] = value;
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

  return (
    <>
      {formData?.[formDataKey]?.map((form, index) => {
        if (!form?._destroy) {
          return (
            <Box key={index} className={classes.formBoxIcon}>
              <Box className={classes.flexControl}>
                <InputLabel>
                  {`${t('form.input.textField.name.label')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  error={!!showError('name', formDataKey, index)}
                  placeholder={`${t('form.input.textField.name.placeHolder')}
              `}
                  fullWidth
                  value={form.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  helperText={
                    !!showError('name', formDataKey, index)
                      ? showError('name', formDataKey, index)
                      : null
                  }
                />
              </Box>
              <Box className={TrashInputClass}>
                <Box className={classes.inputWrapper}>
                  <InputLabel>
                    {`${t('form.input.textField.contact.label')}
              `}
                    <RequiredAsterik />
                  </InputLabel>
                  <Box className={classes.trashWrapper}>
                    <TextField
                      error={!!showError('contact', formDataKey, index)}
                      fullWidth
                      placeholder={`${t('form.input.textField.phoneNumber.placeHolder')}
              `}
                      value={form.contact}
                      onChange={(e) => handleFieldChange(index, 'contact', e.target.value)}
                      helperText={
                        !!showError('contact', formDataKey, index)
                          ? showError('contact', formDataKey, index)
                          : null
                      }
                    />
                    <Button
                      variant="secondaryGrey"
                      onClick={() => removeForm(index)}
                      className={classes.binIcon}
                    >
                      <Trash />
                    </Button>
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
      <Button
        variant="onlyText"
        startIcon={<PlusIcon />}
        onClick={addForm}
        className={classes.addContact}
      >
        {t('obx.buttons.addContacts')}
      </Button>
    </>
  );
}

DynamicFormComponent.propTypes = {
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
  updateFormHandler: PropTypes.func,
  formDataKey: PropTypes.string,
  setErrorMessages: PropTypes.func,
};

export default DynamicFormComponent;
