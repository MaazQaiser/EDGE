import { Box, Button, InputLabel, Skeleton, TextField, Typography } from '@mui/material';
import { ReactComponent as AddIcon } from 'assets/svg/create-icon.svg?react';
import { ReactComponent as EditIcon } from 'assets/svg/edit-bg.svg?react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { useApiControllers } from 'src/helper/axios';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  createNewLineItem,
  getGlGroupDropdown,
  updateLineItem,
} from 'src/services/invoice.services';
import { toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';

import { useStyles } from '../listing/invoiceSettings.styles';

const emptyState = {
  name: '',
  glGroup: {
    value: '',
    label: '',
  },
};

const CreateEditModal = ({ open, onClose, setLineItem, lineItem, fetchSageItems }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [loadingDropdown, setLoadingDropdown] = useState(true);
  const [dropdownData, setDropdownData] = useState([]);
  const { getNewApiController } = useApiControllers();
  const isNewLineItem = isObjectEmpty(lineItem);
  const [formData, setFormData] = useState(
    !isNewLineItem
      ? {
          name: lineItem?.lineItemName,
          glGroup: {
            value: lineItem?.glGroup?.value,
            label: lineItem?.glGroup?.label,
          },
        }
      : emptyState,
  );
  const [errorMessages, setErrorMessages] = useState({});
  const [disabledButton, setDisabledButton] = useState(false);

  const fetchGlGroup = async () => {
    const apiController = getNewApiController();

    try {
      const response = await getGlGroupDropdown();

      if (response && response?.statusCode === 200) {
        setDropdownData(response?.data || []);
        setLoadingDropdown(false);
      }
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoadingDropdown(false);
      }
    }
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      setErrorMessages((prevErrors) => ({
        ...prevErrors,
        [getErrorKey(name)]: '',
      }));
    },

    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessages({});

    const validatePayload = {
      lineItem: formData?.name || '',
      glGroup: formData?.glGroup?.value || '',
    };

    const errors = await joiValidate(validatePayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }

    const payload = {
      name: formData?.name,
      glGroup: formData?.glGroup?.value,
    };

    try {
      setDisabledButton(true);
      const response = !isNewLineItem
        ? await updateLineItem(lineItem.id, payload)
        : await createNewLineItem(payload);

      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      fetchSageItems();
      setFormData({});
      handleCloseModal();
      setDisabledButton(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setDisabledButton(false);
    }
  };

  const handleCloseModal = () => {
    setErrorMessages({});
    onClose();
    setFormData(emptyState);
    setLineItem({});
  };

  const getErrorKey = (key) => {
    return key === 'name' ? 'lineItem' : key;
  };

  useEffect(() => {
    fetchGlGroup();
  }, []);

  const addOfficerBody = (
    <Box className={classes.editModal}>
      {!isNewLineItem ? <EditIcon /> : <AddIcon />}
      <Box className={classes.editModalHeader}>
        <Typography variant="h3" className={classes.editModalTitle}>
          {!isNewLineItem
            ? t('obx.settings.preferences.invoiceSettings.editLineItem')
            : t('obx.settings.preferences.invoiceSettings.createLineItem')}
        </Typography>
        <Typography variant="body2" className={classes.editModalText}>
          {!isNewLineItem
            ? t('obx.settings.preferences.invoiceSettings.editLineItemDesc')
            : t('obx.settings.preferences.invoiceSettings.createLineItemDesc')}
        </Typography>
      </Box>

      <Box className={classes.addOfficerDropdown}>
        <InputLabel>{t('obx.settings.preferences.invoiceSettings.lineItem')}</InputLabel>
        <TextField
          id="name"
          value={formData?.name}
          error={!!errorMessages[getErrorKey('lineItem')]}
          helperText={
            !!errorMessages[getErrorKey('lineItem')] ? errorMessages[getErrorKey('lineItem')] : null
          }
          onChange={handleInputChange}
          name="name"
          placeholder={t('obx.settings.preferences.invoiceSettings.textFieldPlaceholder')}
          fullWidth
        />
      </Box>
      <Box className={classes.addOfficerDropdown}>
        <InputLabel>{t('obx.settings.preferences.invoiceSettings.glGroup')}</InputLabel>
        {loadingDropdown ? (
          <Skeleton className={classes.dropDownSkeleton} />
        ) : (
          <CustomDropDown
            name="glGroup"
            placeHolder={t('obx.settings.preferences.invoiceSettings.dropdownPlaceholder')}
            selectedValues={formData?.glGroup || {}}
            handleChange={handleInputChange}
            bordered
            searchable
            options={dropdownData || []}
            className={classes.addOfficerDropdownField}
            isError={!!errorMessages[getErrorKey('glGroup')]}
          />
        )}
        {errorMessages && (
          <Box className={classes.invalidFeedback}>
            {!!errorMessages[getErrorKey('glGroup')] ? errorMessages[getErrorKey('glGroup')] : null}
          </Box>
        )}
      </Box>

      <Box className={classes.editModalActions}>
        <Button variant="secondaryGrey" onClick={handleCloseModal} disabled={disabledButton}>
          {t('obx.visitorsLoadsOfficer.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={disabledButton}>
          {!isNewLineItem
            ? t('obx.settings.preferences.invoiceSettings.update')
            : t('obx.settings.preferences.invoiceSettings.create')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addOfficerBody} />;
};

CreateEditModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  lineItem: PropTypes.object,
  fetchSageItems: PropTypes.func,
  setLineItem: PropTypes.func,
};

export default CreateEditModal;
