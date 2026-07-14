import { Box, Button, InputLabel, Skeleton, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ModalComponent from 'src/app/components/common/modal';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useFormHook from 'src/hooks/useFormHook';
import { addSupervisor } from 'src/services/runsheet.services';
import { getRunsheetSupervisorsOptions } from 'src/services/user.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../runsheetStyle';

const AddSupervisorModal = ({ open, onClose, fetchSupervisors }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const {
    formData,
    setFormData,
    errorMessages,
    setErrorMessages,
    handleInputChange,
    disabled,
    setDisabled,
    updateFormHandler,
  } = useFormHook({
    defaultFormData: {
      selectedSupervisor: [],
      dropdownData: [],
      loadingDropdown: true,
    },
  });

  const fetchSupervisorOptions = async () => {
    try {
      const response = await getRunsheetSupervisorsOptions();

      updateFormHandler(
        'dropdownData',
        transformArrayForOptions(response?.data?.supervisors, 'name', 'id'),
      );
      updateFormHandler('loadingDropdown', false);
    } catch (error) {
      updateFormHandler('loadingDropdown', false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessages({});

    const payload = {
      supervisor_ids: formData?.selectedSupervisor?.map((supervisor) => supervisor?.id),
    };

    if (payload.supervisor_ids?.length) {
      try {
        setDisabled(true);
        const response = await addSupervisor(payload);

        if (response?.statusCode === 200) {
          toaster.success({
            text: response?.message,
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
        }

        fetchSupervisors();
        handleCloseModal();
      } catch (error) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      } finally {
        setDisabled(false);
      }
    } else {
      setErrorMessages({
        selectedSupervisors: t('obx.settings.preferences.runsheetSettings.errorMessage', {
          supervisor: getLabel('terms', 'supervisor', t)?.toLowerCase(),
        }),
      });
    }
  };

  const handleCloseModal = () => {
    setErrorMessages({});
    onClose();
    setFormData((prevState) => ({
      ...prevState,
      selectedSupervisors: [],
    }));
  };

  useEffect(() => {
    fetchSupervisorOptions();
  }, []);

  const addOfficerBody = (
    <Box className={classes.editModal}>
      <Box className={classes.editModalHeader}>
        <Typography variant="h3" className={classes.editModalTitle}>
          {t('obx.settings.preferences.runsheetSettings.addSupervisor', {
            runsheet: getLabel('terms', 'runsheet', t),
            supervisors: getLabel('terms', 'supervisors', t),
          })}
        </Typography>
      </Box>

      <Typography variant="body2" className={classes.editModalText}>
        {t('obx.settings.preferences.runsheetSettings.addSupervisorText', {
          supervisors: getLabel('terms', 'supervisors', t)?.toLowerCase(),
        })}
      </Typography>

      <Box className={classes.addOfficerDropdown}>
        <InputLabel>
          {t('obx.settings.preferences.runsheetSettings.addSupervisorLabel', {
            supervisors: getLabel('terms', 'supervisors', t),
          })}
        </InputLabel>
        {formData.loadingDropdown ? (
          <Skeleton className={classes.dropDownSkeleton} />
        ) : (
          <CustomDropDown
            name="selectedSupervisor"
            label={t('obx.settings.preferences.runsheetSettings.supervisors', {
              supervisors: getLabel('terms', 'supervisors', t),
            })}
            placeHolder={t('obx.settings.preferences.runsheetSettings.dropdownPlaceholder', {
              supervisor: getLabel('terms', 'supervisor', t),
            })}
            selectedValues={formData?.selectedSupervisor || []}
            handleChange={handleInputChange}
            bordered
            searchable
            options={formData.dropdownData}
            className={classes.addOfficerDropdownField}
            isError={!!errorMessages.selectedSupervisor}
            checkmark
            multiSelect
          />
        )}
        {errorMessages.selectedSupervisors && (
          <Box className={classes.invalidFeedback}>{errorMessages.selectedSupervisors}</Box>
        )}
      </Box>

      <Box className={classes.editModalActions}>
        <Button variant="secondaryGrey" onClick={handleCloseModal} disabled={disabled}>
          {t('obx.visitorsLoadsOfficer.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={disabled}>
          {t('obx.settings.preferences.runsheetSettings.save')}
        </Button>
      </Box>
    </Box>
  );

  return <ModalComponent open={open} handleClose={onClose} body={addOfficerBody} />;
};

AddSupervisorModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  fetchSupervisors: PropTypes.func,
};

export default AddSupervisorModal;
