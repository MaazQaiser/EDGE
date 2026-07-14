import { Box, Button, InputLabel, TextField, Typography } from '@mui/material';
import { ReactComponent as EditIcon } from 'assets/svg/edit-bg.svg?react';
import LoaderComponent from 'commonComponents/loader';
import ModalComponent from 'commonComponents/modal';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createSiteLocations,
  getSiteLocationById,
  updateSiteLocations,
} from 'services/sites.services';
import useFormHook from 'src/hooks/useFormHook';
import { toastSettings } from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './updatesStyles';

const locationsFormData = {
  name: '',
};

const LocationsUpdate = ({ open, handleClose, id, locationId, refreshData }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const { handleInputChange, formData, setFormData, errorMessages, setErrorMessages, setDisabled } =
    useFormHook({ defaultFormData: locationsFormData });

  const fetchLocationData = async (id) => {
    try {
      setLoading(true);
      const response = await getSiteLocationById(id);

      if (response?.statusCode === 200) {
        setFormData({
          name: response?.data?.location?.name,
        });
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalPayload = JSON.parse(JSON.stringify(formData));

    const errors = await formValidatorJoi(finalPayload, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages((prev) => ({ ...prev, ...errors }));

      return;
    }

    setDisabled(true);
    setLoading(true);

    try {
      let res = null;

      if (locationId) {
        res = await updateSiteLocations(id, locationId, finalPayload);
      } else {
        res = await createSiteLocations(id, finalPayload);
      }

      setDisabled(false);
      setLoading(false);
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
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchLocationData(locationId);
    }
  }, [locationId]);

  const locationButtonText = !locationId
    ? t('obx.locations.create.button.createLocation')
    : t('obx.locations.update.button.updateLocation');

  const modalBody = (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.mainBoxForm}
      >
        {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        <Box className={classes.Icon}>
          {' '}
          <EditIcon />
        </Box>
        <Box className={classes.headerTitlle}>
          <Typography variant="h3" className={classes.zoneCustomText} gutterBottom>
            {t('obx.locations.model.texts.createLocation')}
          </Typography>
          <Typography variant="body2" className={classes.zoneDetailText}>
            {t('obx.locations.model.texts.createLocationDes')}
          </Typography>
        </Box>
        <Box className={classes.headerTitlle}>
          <InputLabel>{t('obx.locations.form.locationName.label')}</InputLabel>
          <TextField
            error={!!errorMessages?.name}
            value={formData?.name}
            onChange={handleInputChange}
            name="name"
            helperText={errorMessages?.name || ''}
            placeholder={t('obx.locations.form.locationName.placeHolder')}
            fullWidth
          />
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
            {locationButtonText}
          </Button>
        </Box>
      </Box>
    </>
  );
  return <ModalComponent open={open} handleClose={handleClose} body={modalBody}></ModalComponent>;
};

LocationsUpdate.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  id: PropTypes.number,
  locationId: PropTypes.number,
  refreshData: PropTypes.func,
};
export default LocationsUpdate;
