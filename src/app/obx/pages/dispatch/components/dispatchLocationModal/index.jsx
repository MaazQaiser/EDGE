import { Box, Button, Typography } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import ModalComponent from 'src/app/components/common/modal';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { UPDATE_RUNSHEET_STATE } from 'src/redux/reducers/runSheetReducer';
import { getPlaceImage, getPlaceInformationFromGoogle } from 'src/services/googleMap.service';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES } from 'src/utils/constants';

import { useStyles } from './LocationModal';
const LocationModalBody = ({ handleCloseModal, ...props }) => {
  const { errorMessages, state, dispatch } = props;
  const [address, setAddress] = useState(() => {
    return state?.startEndLocation?.address || state?.startEndLocation?.name || '';
  });
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const classes = useStyles();
  const [center, setCenter] = useState(
    state?.startEndLocation?.position ||
      state?.startEndLocation || { lat: 41.216362, lng: -96.13607 },
  );

  const [form, setForm] = useState(() => {
    return { googleAddress: state?.startEndLocation };
  });

  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [loading, setLoading] = useState(false);

  const updateMapValue = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const handleClose = () => {
    handleCloseModal();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const data = await getPlaceInformationFromGoogle(form?.googleAddress?.id, ['photos']);
    const result = await getPlaceImage(data?.photos?.[0]);
    dispatch({
      type: UPDATE_RUNSHEET_STATE,
      payload: {
        key: 'startEndLocation',
        value: { ...form?.googleAddress, siteImage: result?.photoUri || null },
      },
    });
    handleClose();
    setLoading(false);
  };

  /**
   * calculate the center of the map
   */
  const getFinalCenter = useMemo(() => {
    let result = center;
    if (!isObjectEmpty(state?.startEndLocation?.position)) {
      result = state?.startEndLocation?.position;
    }
    if (!isObjectEmpty(form?.googleAddress)) {
      result = form?.googleAddress?.position;
    }

    return result;
  }, [form.googleAddress, center]);

  const getFinalLocation = useMemo(() => {
    let result = {};

    if (!isObjectEmpty(state?.startEndLocation)) {
      result = state?.startEndLocation;
    }

    if (!isObjectEmpty(selectedLocation)) {
      result = selectedLocation;
    }
    return result;
  }, [form?.googleAddress, selectedLocation]);

  if (!isLoaded) {
    return;
  }

  const isLocationAlreadyAssigned = !!!state?.startEndLocation;
  const finalCenter = getFinalCenter;
  const finalLocation = getFinalLocation;
  return (
    <Box className={classes.modalWrapper}>
      <Box>
        <Typography variant="h4" className={classes.headText}>
          {/* NOTE:::::manage edit and add heading with condition */}
          {isLocationAlreadyAssigned
            ? t('obx.runsheet.addLocationHeading')
            : t('obx.runsheet.editLocationHeading')}
        </Typography>
        <Typography variant="body2" className={classes.closetext}>
          {t('obx.runsheet.mapSubHeading', {
            runsheet: getLabel('terms', 'runsheet', t).toLowerCase(),
          })}
        </Typography>
      </Box>
      <Box>
        <GoogleMapSearchAddressComponent
          isLoaded={isLoaded}
          updateMapValue={updateMapValue}
          errorMessages={errorMessages}
          formKey="googleAddress"
          setAddress={setAddress}
          address={address}
          setActiveMarker={setActiveMarker}
          setSelectedLocation={setSelectedLocation}
          setCenter={setCenter}
          disabled={false}
        />
        <GoogleMapViewComponent
          isLoaded={isLoaded}
          updateMapValue={updateMapValue}
          formKey="googleAddress"
          setAddress={setAddress}
          setActiveMarker={setActiveMarker}
          activeMarker={activeMarker}
          setSelectedLocation={setSelectedLocation}
          selectedLocation={finalLocation}
          setCenter={setCenter}
          center={finalCenter}
          mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
        />
      </Box>

      <Box className={classes.inlineButtons}>
        <Button onClick={handleClose} variant="secondaryGrey">
          {t('obx.runsheet.cancel')}
        </Button>
        <Button
          variant="primary"
          disabled={isObjectEmpty(finalLocation) || loading}
          onClick={handleSubmit}
        >
          {/* NOTE:::::manage edit and add buttons Text with condition */}
          {isLocationAlreadyAssigned
            ? t('obx.runsheet.addLocation')
            : t('obx.runsheet.editLocation')}
        </Button>
      </Box>
    </Box>
  );
};

LocationModalBody.propTypes = {
  handleCloseModal: PropTypes.func,
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.function,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
};

const DispatchLocationModal = ({ openModal, handleCloseModal, ...props }) => {
  return (
    <ModalComponent
      open={openModal}
      // handleClose={handleCloseModal}
      body={<LocationModalBody handleCloseModal={handleCloseModal} {...props} />}
    />
  );
};

DispatchLocationModal.propTypes = {
  openModal: PropTypes.bool,
  handleCloseModal: PropTypes.func,
  state: PropTypes.shape({
    runsheetName: PropTypes.string,
    startsAt: PropTypes.string,
    startDate: PropTypes.string,
    endsAt: PropTypes.string, // Ensure this line is present
    startEndLocation: PropTypes.object,
    dutyDay: PropTypes.array,
  }).isRequired,
  dispatch: PropTypes.function,
  errorMessages: PropTypes.object,
  setErrorMessages: PropTypes.func,
};

export default DispatchLocationModal;
