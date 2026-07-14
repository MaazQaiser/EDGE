import { Box, Button, InputLabel, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import { ReactComponent as EditIcon } from 'assets/svg/edit-bg.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createSiteCheckpoint,
  getCheckpointType,
  getSiteCheckpointById,
  getSitesAllDevices,
  getSitesAllLocations,
  updateSiteCheckpoint,
} from 'services/sites.services';
import LoaderComponent from 'src/app/components/common/loader';
import useFormHook from 'src/hooks/useFormHook';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './updateStyles';
const editInstructionsFormData = {
  checkpointType: {},
  device: {},
  location: {},
};

const formConst = {
  CHECKPOINT_TYPE: 'checkpointType',
  DEVICE: 'device',
  LOCATION: 'location',
};

const CheckPointsUpdate = ({ open, handleClose, id, checkPointId, refreshData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    handleInputChange,
    formData,
    setFormData,
    updateFormHandler,
    errorMessages,
    setErrorMessages,
    setDisabled,
  } = useFormHook({ defaultFormData: editInstructionsFormData });

  const [devicesType, setDevicesType] = useState([]);

  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [checkpointLoading, setCheckpointLoading] = useState(true);

  const renderError = (name) => {
    let message = null;

    if (errorMessages[name]) {
      message = errorMessages[name];
    }
    return message && <div className={classes.invalidFeedback}>{message}</div>;
  };

  const getDevicesOfType = (e) => {
    if (e.target.value?.isDevice) {
      setDevices([]);
      fetchSitesAllDevices(id, e.target.value?.slug);
    }
    updateFormHandler(formConst.DEVICE, {});
    handleInputChange(e);
  };

  const fetchCheckpointType = async (id) => {
    try {
      setCheckpointLoading(true);
      const response = await getCheckpointType(id);
      if (response?.statusCode === 200 && response?.data?.checkpointTypes) {
        setDevicesType(response?.data?.checkpointTypes);
        // setDevicesType([]);
        setCheckpointLoading(false);
      }
    } catch (e) {
      setCheckpointLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSitesAllDevices = async (id, slug) => {
    try {
      const response = await getSitesAllDevices(id, slug);
      if (response?.statusCode === 200 && response?.data?.devices) {
        setDevices(response?.data?.devices);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const fetchSitesAllLocations = async (id) => {
    try {
      const response = await getSitesAllLocations(id);
      if (response?.statusCode === 200 && response?.data?.locations) {
        setLocations(response?.data?.locations);
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const mapObjForDeviceType = (checkpoint) => {
    const e = {
      target: { value: { isDevice: true, slug: checkpoint?.checkpointType } },
    };
    return e;
  };

  const mapObj = (data) => {
    const updatedObj = {};
    if (data.checkpointType) {
      updatedObj.checkpointType = {
        label: data?.checkpointType || '',
        value: data?.checkpointType || '',
        isDevice: data?.isDevice || false,
      };
    }
    if (data.device) {
      updatedObj.device = {
        ...data.device,
        label: data?.device?.name || '',
        value: data?.device?.id || '',
      };
    }
    if (data.siteLocation) {
      updatedObj.location = {
        value: data?.siteLocation?.id || '',
        label: data?.siteLocation?.name || '',
      };
    }
    return updatedObj;
  };

  const fetchCheckPointsData = async (id) => {
    try {
      setLoading(true);
      const response = await getSiteCheckpointById(id);

      if (response?.statusCode === 200 && response?.data?.checkpoint) {
        getDevicesOfType(mapObjForDeviceType(response?.data?.checkpoint));
        setFormData(mapObj(response?.data?.checkpoint));
      }
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataManipulated = {
      checkpointType: formData?.checkpointType?.value || '',
      locationId: formData?.location?.value?.toString() || '',
      location: formData?.location?.value?.toString() || '',
    };
    if (formData?.checkpointType?.isDevice) {
      formDataManipulated.deviceId = formData?.device?.value?.toString() || '';
      formDataManipulated.device = formData?.device?.value?.toString() || '';
    }
    const errors = await formValidatorJoi(formDataManipulated, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));
      return;
    }
    setDisabled(true);
    try {
      let res = null;
      setLoading(true);
      if (checkPointId) {
        res = await updateSiteCheckpoint(checkPointId, formDataManipulated);
      } else {
        res = await createSiteCheckpoint(id, formDataManipulated);
      }
      setDisabled(false);
      if (res?.statusCode === 200) {
        handleClose();
        refreshData();
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (e) {
      setDisabled(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (checkPointId) {
      fetchCheckPointsData(checkPointId);
    }
  }, [checkPointId]);

  useEffect(() => {
    if (id) {
      fetchCheckpointType(id);
      fetchSitesAllLocations(id);
    }
  }, [id]);

  const checkpointButtonText = !checkPointId
    ? t('obx.checkpoints.create.button.createCheckpoint')
    : t('obx.checkpoints.update.button.updateCheckpoint');

  const modalBody = (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.mainBoxForm}
      >
        <Box className={classes.Icon}>
          {' '}
          <EditIcon />
        </Box>
        <Box className={classes.headerTitlle}>
          <Typography className={classes.zoneCustomText}>
            {!checkPointId
              ? t('obx.checkpoints.model.texts.createACheckpoint')
              : t('obx.checkpoints.model.texts.updateACheckpoint')}
          </Typography>
          <Typography className={classes.zoneDetailText}>
            {!checkPointId
              ? t('obx.checkpoints.model.texts.createACheckpointDes')
              : t('obx.checkpoints.model.texts.updateACheckpointDes')}
          </Typography>
        </Box>
        <Box>
          {!devicesType.length && !checkpointLoading && (
            <Alert severity="error" className={classes.siteAlert}>
              {t('obx.checkpoints.form.emptyDevicesList')}
            </Alert>
          )}
        </Box>
        <Box className={classes.headerTitlle}>
          <InputLabel>{t('obx.checkpoints.form.checkPointType.label')}</InputLabel>
          <CustomDropDown
            name="checkpointType"
            label={t('obx.checkpoints.form.checkPointType.placeHolder')}
            selectedValues={formData.checkpointType}
            handleChange={getDevicesOfType}
            options={transformArrayForOptions(devicesType, 'name', 'slug')}
            isError={!!renderError(formConst?.CHECKPOINT_TYPE)}
            bordered
            // checkmark
          />
          <Typography component="span" className={classes.error}>
            {renderError(formConst?.CHECKPOINT_TYPE)}
          </Typography>
        </Box>
        {formData?.checkpointType?.isDevice === true && (
          <Box className={classes.headerTitlle}>
            <InputLabel>{t('obx.checkpoints.form.device.label')}</InputLabel>
            <CustomDropDown
              key={devices}
              name="device"
              label={t('obx.checkpoints.form.device.placeHolder')}
              selectedValues={formData.device}
              handleChange={handleInputChange}
              options={transformArrayForOptions(devices, 'name', 'id')}
              isError={!!renderError(formConst?.DEVICE)}
              bordered
              // checkmark
            />
            <Typography component="span" className={classes.error}>
              {renderError(formConst?.DEVICE)}
            </Typography>
          </Box>
        )}
        <Box className={classes.headerTitlle}>
          <InputLabel>{t('obx.checkpoints.form.location.label')}</InputLabel>
          <CustomDropDown
            label={t('obx.checkpoints.form.location.placeHolder')}
            name="location"
            selectedValues={formData.location}
            handleChange={handleInputChange}
            options={transformArrayForOptions(locations, 'name', 'id')}
            isError={!!renderError(formConst?.LOCATION)}
            bordered
            // checkmark
          />
          <Typography component="span" className={classes.error}>
            {renderError(formConst?.LOCATION)}
          </Typography>
        </Box>
        <Box className={classes.btnBox}>
          <Button
            onClick={() => {
              handleClose();
            }}
            variant="secondaryGrey"
          >
            {t('buttons.cancel')}
          </Button>
          <Button className={classes.saveBtn} type="submit" disabled={loading} variant="primary">
            {checkpointButtonText}
          </Button>
        </Box>
      </Box>
    </>
  );
  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>
    </>
  );
};

CheckPointsUpdate.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  id: PropTypes.number,
  checkPointId: PropTypes.number,
  refreshData: PropTypes.func,
};

export default CheckPointsUpdate;
