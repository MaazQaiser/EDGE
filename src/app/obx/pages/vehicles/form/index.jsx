import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, TextField } from '@mui/material';
import { InputLabel } from '@mui/material';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
// import FileUpload from 'commonComponents/fileUpload';
import ProfileImageUpload from 'commonComponents/profileImageUpload';
// import ProfileImageUpload from 'commonComponents/profileImageUpload';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import LoaderComponent from 'src/app/components/common/loader';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import {
  ACL_OBX_VEHICLES_CREATE,
  ACL_OBX_VEHICLES_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import { OBX_VEHICLES } from 'src/app/router/constant/ROUTE';
import * as routes from 'src/app/router/constant/ROUTE';
import { removeKey } from 'src/helper/utilityFunctions';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { createVehicle, getVehicle, updateVehicle } from 'src/services/vehicles.services';
import { toastSettings } from 'src/utils/constants';
import { DateToday } from 'src/utils/date';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { useStyles } from './vehicleForm';

const initialFormData = {
  makeModelYear: '',
  registrationNumber: '',
  createdAt: DateToday,
  lastMaintenance: null,
  uploadedImages: [],
  images: [],
};

const today = dayjs();

export default function CreateVehicle() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleId = queryParams.get('id');
  const classes = useStyles();

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessages, setErrorMessages] = useState({});
  // const [profileImage, setImage] = useState([]);

  const [uploadedImages, setUploadedImages] = useState([]);

  const { t } = useTranslation();

  const history = useHistory();
  const [disabled, setDisabled] = useState(false);

  const [loading, setLoading] = useState(false);

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  function inputChangedHandler(event) {
    const { name, value } = event.target;
    if (value) {
      setErrorMessages((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    updateFormHandler(name, value);
  }

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const handleDateTimeChange = (value, name) => {
    const event = {
      target: {
        value: value,
        name: name,
      },
    };
    handleInputChange(event);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // ? NOTE: if the variable "image" is not getting used add _ before it or this rule will suffice the need here.
    // eslint-disable-next-line no-unused-vars
    let { images, ...payload } = formData;

    let finalPayload = JSON.parse(JSON.stringify(payload));

    let errorCheckPayload = { ...finalPayload };
    delete errorCheckPayload.lastMaintenance;

    const errors = await formValidatorJoi(errorCheckPayload, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      return;
    }
    setDisabled(true);
    setLoading(true);
    let form = new FormData();
    let formInput = finalPayload;
    /**
     * picture updated by user
     */

    form.append('images', JSON.stringify(formData?.images));
    for (let x = 0; uploadedImages?.length > x; x++) {
      form.append('newImages[]', uploadedImages[x]);
    }

    for (const [key, value] of Object.entries(formInput)) {
      let item = value;
      if (typeof item === 'object' && item !== null) {
        item = JSON.stringify(item);
      }
      if (!item) {
        item = '';
      }
      form.append(key, item);
    }

    try {
      let response = {};
      if (vehicleId) {
        response = await updateVehicle(vehicleId, form);
      } else {
        response = await createVehicle(form);
      }
      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        if (vehicleId) {
          history.push(`${routes.OBX_VEHICLE_DETAIL}/${vehicleId}`);
        } else {
          history.push(OBX_VEHICLES);
        }
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setDisabled(false);
      setLoading(false);
    }
  };
  const getThisVehicle = async () => {
    try {
      setLoading(true);
      const response = await getVehicle(vehicleId);
      if (response && response?.statusCode === 200) {
        const obj = {
          makeModelYear: response.data?.vehicle?.makeModelYear,
          registrationNumber: response.data?.vehicle?.registrationNumber,
          createdAt: response.data?.vehicle?.createdAt,
          lastMaintenance: dayjs(response.data?.vehicle?.lastMaintenance),
          images: response.data?.vehicle?.images,
        };
        setFormData(obj);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const goBack = () => {
    if (vehicleId) {
      const route = `${routes.OBX_VEHICLE_DETAIL}/${vehicleId}`;
      history.push(route);
    } else {
      history.push(OBX_VEHICLES);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      getThisVehicle(vehicleId);
    }
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      className={classes.mainBoxForm}
      noValidate
      autoComplete="off"
    >
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.btnBox}>
        <Button variant="tertiaryGrey" onClick={goBack} startIcon={<ArrowBackIcon />}>
          {t('links.back')}
        </Button>
        <Box className={classes.buttonGroup}>
          <Button variant="secondaryGrey" onClick={goBack}>
            {t('links.cancel')}
          </Button>
          <RenderIfHasPermission
            name={vehicleId ? ACL_OBX_VEHICLES_UPDATE : ACL_OBX_VEHICLES_CREATE}
          >
            <Button variant="primary" type="submit" disabled={disabled}>
              {t('links.save')}
            </Button>
          </RenderIfHasPermission>
        </Box>
      </Box>

      <Box className={classes.vehicleInfoWrapper}>
        <Typography className={classes.vehicleInfoTitle} variant="subtitle1">
          {t('form.input.textField.vehicle.info')}
        </Typography>
        <Box className={classes.formBox}>
          <Box className={classes.flexControl}>
            <InputLabel htmlFor="outlined-search">
              {`${t('form.input.textField.vehicleMakeInput.label')}`}
              <RequiredAsterik />
            </InputLabel>
            <TextField
              error={!!errorMessages?.makeModelYear}
              id="outlined-search"
              onChange={inputChangedHandler}
              name="makeModelYear"
              value={formData.makeModelYear}
              placeholder={t('form.input.textField.vehicleMakeInput.placeHolder')}
              fullWidth
              type="text"
              helperText={!!errorMessages?.makeModelYear ? errorMessages?.makeModelYear : null}
            />
          </Box>
          <Box className={classes.flexControl}>
            <InputLabel htmlFor="outlined-search">
              {`${t('form.input.textField.vehicleRegistrationNumber.label')}`}
              <RequiredAsterik />
            </InputLabel>
            <TextField
              id="outlined-search"
              error={!!errorMessages?.registrationNumber}
              variant="outlined"
              name="registrationNumber"
              onChange={inputChangedHandler}
              value={formData.registrationNumber}
              placeholder={t('form.input.textField.vehicleRegistrationNumber.placeHolder')}
              fullWidth
              type="text"
              helperText={
                !!errorMessages?.registrationNumber ? errorMessages?.registrationNumber : null
              }
            />
          </Box>
        </Box>
        <Box className={classes.formBox}>
          <Box className={classes.flexControlOnly}>
            <InputLabel htmlFor="outlined-start-adornment">
              {`${t('form.input.textField.vehicleLastMaintenance.label')} `}
            </InputLabel>
            <ResponsiveDatePickers
              value={formData.lastMaintenance}
              onChange={(value) => {
                const val = value;
                handleDateTimeChange(val, 'lastMaintenance');
              }}
              label={`${t('obx.form.input.textField.dutyTime.placeHolder')}`}
              maxDate={today}
            />
          </Box>
        </Box>
        {/** Profile Image */}

        {formData?.images && Array.isArray(formData?.images) && (
          <ProfileImageUpload
            formData={formData}
            multiple={true}
            formImageKey={'images'}
            updateFormHandler={updateFormHandler}
            errorMessages={errorMessages}
            setErrorMessages={setErrorMessages}
            image={uploadedImages}
            setImage={setUploadedImages}
            profileImageClass={classes.vehicleImageUpload}
            defaultImage="https://signalassets.blob.core.windows.net/signal/assets/vehicle-placeholder.svg"
          />
        )}
      </Box>

      <Box className={classes.buttonGroupLast}>
        <Button variant="secondaryGrey" onClick={goBack}>
          {t('links.cancel')}
        </Button>
        <RenderIfHasPermission name={vehicleId ? ACL_OBX_VEHICLES_UPDATE : ACL_OBX_VEHICLES_CREATE}>
          <Button variant="primary" type="submit" disabled={disabled}>
            {t('links.save')}
          </Button>
        </RenderIfHasPermission>
      </Box>
    </Box>
  );
}
