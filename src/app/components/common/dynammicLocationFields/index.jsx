import { Button, InputLabel, TextField, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Trash } from 'assets/svg/trash-2.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import RequiredAsterik from '../requiredAsterik';

/**
 * @param {array} formData locations array of objects with each object having a key locationName of type string
 * @param {object} errorMessages object containing errors object of form
 * @param {function} updateFormHandler function to update formData
 * @param {string} formDataKey string that represent the key that holds data in the form
 * @param {function} setErrorMessages function that updates error messages in the component containing the form
 */

const useStyles = makeStyles((theme) => ({
  formBoxIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '32px',
    marginBottom: '20px',
    alignItems: 'baseline',
  },
  flexControl: {
    flex: 1,
    gap: theme.spacing(1),
  },
  binIcon: {
    '&.MuiButtonBase-root': {
      padding: '10px',
      minWidth: 'unset',
      borderColor: theme.palette.borderSubtle2,
      minHeight: '43px',
    },
  },
  addContact: {
    '&.MuiButtonBase-root': {
      marginBottom: '20px !important',
      padding: '0 !important',
    },
  },
  trashWrapper: {
    display: 'flex',
    gap: '8px',
  },
}));
const DynammicLocationFields = ({
  formData,
  errorMessages,
  updateFormHandler,
  formDataKey,
  setErrorMessages,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const addForm = () => {
    updateFormHandler(formDataKey, [...formData, { locationName: '' }]);
  };
  const removeForm = (index) => {
    const updatedForms = formData?.filter((_, i) => i !== index);
    updateFormHandler(formDataKey, updatedForms);
  };

  /**
   *
   * @param {*} index
   * @param {*} field
   * @param {*} value
   */
  const handleFieldChange = (index, field, value) => {
    formData[index][field] = value;
    updateFormHandler(formDataKey, formData);

    if (value) {
      const errorKey = getErrorKey(field, formDataKey, index);
      setErrorMessages((prev) => ({
        ...prev,
        [errorKey]: null,
      }));
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
      <Box className={classes.mainLocationWrapper}>
        <Typography variant="subtitle1" mb={'20px'}>
          {t('form.input.textField.locations.header')}
          <RequiredAsterik />
        </Typography>
        {formData?.map((form, index) => (
          <Box key={index} className={classes.formBoxIcon}>
            <Box className={classes.flexControl}>
              <InputLabel>
                {`${t('form.input.textField.locations.label')}
              `}
                {index + 1}
              </InputLabel>
              <Box className={classes.trashWrapper}>
                <TextField
                  error={!!showError('locationName', formDataKey, index)}
                  placeholder={`${t('form.input.textField.locations.placeHolder')}
              `}
                  variant="outlined"
                  fullWidth
                  value={form.locationName}
                  className={classes.customInput}
                  onChange={(e) => handleFieldChange(index, 'locationName', e.target.value)}
                  helperText={
                    !!showError('locationName', formDataKey, index)
                      ? showError('locationName', formDataKey, index)
                      : null
                  }
                />

                <Button
                  onClick={() => removeForm(index)}
                  variant="secondaryGrey"
                  className={classes.binIcon}
                >
                  <Trash />
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
        <Button variant="onlyText" onClick={addForm} className={classes.addContact}>
          {t('obx.buttons.addLocations')}
        </Button>
        {errorMessages?.[formDataKey] && (
          <Stack sx={{ width: '100%', alignItems: 'center' }} spacing={2}>
            <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
          </Stack>
        )}
      </Box>
    </>
  );
};

DynammicLocationFields.propTypes = {
  formData: PropTypes.array.isRequired,
  errorMessages: PropTypes.object.isRequired,
  updateFormHandler: PropTypes.func.isRequired,
  formDataKey: PropTypes.string.isRequired,
  setErrorMessages: PropTypes.func.isRequired,
};

export default DynammicLocationFields;
