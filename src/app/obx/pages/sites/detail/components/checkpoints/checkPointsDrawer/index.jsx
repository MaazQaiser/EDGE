import { Box, Button, InputLabel, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createSiteCheckpoint,
  getCheckpointType,
  getSiteCheckpointById,
  getSitesAllDevices,
  getSitesAllLocations,
  updateSiteCheckpoint,
} from 'services/sites.services';
import CreateTemplateSection from 'src/app/components/common/questionBuilder';
import DrawerHeader from 'src/app/components/salesComponents/components/drawerHeader';
import { AddIcon } from 'src/assets/svg';
import useFormHook from 'src/hooks/useFormHook';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './CheckPointsDrawer';

const templateConst = {
  templateTitle: 'Checkpoint Questions',
  templateableType: 'checkpoints',
  sectionTitle: 'Questions Section',
};

const editInstructionsFormData = {
  checkpointType: {},
  device: {},
  location: {},
};

const initialQuestion = [
  {
    instructions: '',
    optionsAttributes: [],
    questionStatement: '',
    required: false,
    responseType: 0,
  },
];

const initialTemplate = {
  title: templateConst.templateTitle,
  templateableType: templateConst.templateableType,
  sectionsAttributes: [
    {
      title: templateConst.sectionTitle,
      questionsAttributes: initialQuestion,
    },
  ],
};

const formConst = {
  CHECKPOINT_TYPE: 'checkpointType',
  DEVICE: 'device',
  LOCATION: 'location',
};
const CheckPointsDrawer = ({ anchor, assignCloseDrawer, width, checkPointId, refreshData, id }) => {
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
  const [existingTemplate, setExistingTemplate] = useState(null);
  const [template, setTemplate] = useState(null);

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
        setTemplate(response?.data?.checkpoint?.template || null);
        setExistingTemplate(response?.data?.checkpoint?.template || null);
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

  const handleSectionChange = (event) => {
    const splitNameIndex = event.target.name.split('-');
    setTemplate((prevState) => {
      return {
        ...prevState,
        sectionsAttributes: [
          { ...prevState.sectionsAttributes?.[0], [splitNameIndex[0]]: event.target.value },
        ],
      };
    });
  };

  const handleQuestions = (questions) => {
    setTemplate((prevState) => {
      return {
        ...prevState,
        sectionsAttributes: [
          { ...prevState.sectionsAttributes?.[0], questionsAttributes: questions },
        ],
      };
    });
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
    if (template) {
      formDataManipulated.sectionsAttributes = template.sectionsAttributes;
      formDataManipulated.templatesParams = { template };
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
      // Adding destroy key for deleting the existing template
      if (!template && !!existingTemplate) {
        formDataManipulated.templatesParams = {
          template: {
            destroy: true,
            id: existingTemplate?.id,
          },
        };
      }
      if (checkPointId) {
        res = await updateSiteCheckpoint(checkPointId, formDataManipulated);
      } else {
        res = await createSiteCheckpoint(id, formDataManipulated);
      }
      setDisabled(false);
      if (res?.statusCode === 200) {
        // handleClose();
        refreshData();
        toaster.success({
          text: res?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        assignCloseDrawer(anchor);
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
  return (
    <Box sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.mainBoxForm}
      >
        <Box className={classes.headerWrap}>
          <DrawerHeader
            title={
              !checkPointId
                ? t('obx.checkpoints.model.texts.createACheckpoint')
                : t('obx.checkpoints.update.button.updateCheckpoint')
            }
            handleCloseDrawer={assignCloseDrawer}
            anchor={anchor}
          />
        </Box>
        <Box className={classes.contentBox}>
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
          {!template ? (
            <Button
              startIcon={<AddIcon />}
              className={classes.brandbtn}
              variant="onlyText"
              onClick={() => setTemplate(initialTemplate)}
            >
              {t('obx.settings.preferences.visitorTypes.addQuestions')}
            </Button>
          ) : (
            <Fragment key={`section-0`}>
              <CreateTemplateSection
                questions={template?.sectionsAttributes?.[0]?.questionsAttributes}
                handleSectionChange={handleSectionChange}
                updateQuestions={handleQuestions}
                title={template?.sectionsAttributes?.[0]?.title}
                description={template?.sectionsAttributes?.[0]?.description}
                errorMessages={errorMessages}
                isEdit={!!checkPointId}
                removeSection={() => setTemplate(null)}
                showSection={false}
              />
            </Fragment>
          )}
        </Box>

        <Box className={classes.btnBox}>
          <Button onClick={() => assignCloseDrawer(anchor)} variant="secondaryGrey">
            {t('buttons.cancel')}
          </Button>
          <Button className={classes.saveBtn} type="submit" disabled={loading} variant="primary">
            {checkpointButtonText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

CheckPointsDrawer.propTypes = {
  anchor: PropTypes.string,
  assignCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  checkPointId: PropTypes.number,
  refreshData: PropTypes.func,
  id: PropTypes.number,
};
export default CheckPointsDrawer;
