import { Box, Button, Skeleton, Typography } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress.jsx';
import ModalComponent from 'src/app/components/common/modal';
import { updateDispatchAddress } from 'src/services/dispatch.services.js';
import {
  fallbackCenterOfMap,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  toastSettings,
} from 'src/utils/constants/index.js';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck.js';
import { toaster } from 'src/utils/toast/index.jsx';

import { useStyles } from './style.js';

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '10px' };

const UpdateAddressModalBody = ({ handleCloseModal, dispatch, refetchDispatch = () => {} }) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState(fallbackCenterOfMap);
  const [activeMarker, setActiveMarker] = useState(null);
  const [address, setAddress] = useState('');
  const [previousMarker, setPreviousMarker] = useState(null); // Store previous marker to restore when cleared
  const [isInitialized, setIsInitialized] = useState(false); // Track if initial address is set
  const hasGeocodedInitial = useRef(false); // Track if initial geocoding is done
  const [errorsMessages, setErrorMessages] = useState({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Initialize address from dispatch (only once)
  useEffect(() => {
    if (dispatch?.address && !isInitialized) {
      setAddress(dispatch.address);
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized]);

  // Geocode initial dispatch address (only once when isLoaded and address is set)
  useEffect(() => {
    if (!isLoaded || !address || !isInitialized || hasGeocodedInitial.current) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const latLng = { lat: location.lat(), lng: location.lng() };
        setCenter(latLng);
        setActiveMarker(latLng);
        setPreviousMarker(latLng); // Store as previous marker
        hasGeocodedInitial.current = true; // Mark as geocoded
      }
    });
  }, [isLoaded, isInitialized]); // Only run when isLoaded or isInitialized changes, not on address changes

  // Cleaning the error messages state on change
  useEffect(() => {
    if (address && errorsMessages?.address) setErrorMessages({});
  }, [address, errorsMessages]);

  const handleSubmit = async () => {
    setLoading(true);
    const errors = await joiValidate({ address }, t);
    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }
    const payload = {
      address,
      lat: parseFloat(activeMarker?.lat),
      lng: parseFloat(activeMarker?.lng),
    };
    try {
      const response = await updateDispatchAddress(dispatch?.id, { dispatchRequest: payload });
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        handleCloseModal();
        refetchDispatch();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  // Only update map when the user selects a complete address (clicking on map)
  const handleSelectAddress = async (latLng, formattedAddress) => {
    setCenter(latLng);
    setActiveMarker(latLng);
    setPreviousMarker(latLng); // Update previous marker

    // If formattedAddress is provided, use it; otherwise reverse geocode
    if (formattedAddress) {
      setAddress(formattedAddress);
    } else if (isLoaded) {
      // Reverse geocode the clicked location to get the address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const formattedAddr = results[0].formatted_address;
          setAddress(formattedAddr);
        }
      });
    }
  };

  // Handler for when address is selected from autocomplete dropdown
  // searchAddress component calls setCenter with just the position object
  // This is ONLY called when an address is selected from dropdown, not on onChange
  const handleCenterChange = (position) => {
    if (position && position.lat && position.lng) {
      setCenter(position);
      setActiveMarker(position);
      setPreviousMarker(position); // Update previous marker
    }
  };

  // Handler for when address is selected from autocomplete dropdown
  // searchAddress component calls setActiveMarker with position or null
  // When input is cleared (null), restore previous marker
  const handleMarkerChange = (position) => {
    if (position === null) {
      // Input was cleared - restore previous marker or keep current
      if (previousMarker) {
        setActiveMarker(previousMarker);
      }
    } else {
      // Only update if it's a valid position (shouldn't happen on onChange)
      if (position && position.lat && position.lng) {
        setActiveMarker(position);
      }
    }
  };

  // Handler to capture full location data when address is selected from dropdown
  const handleSelectedLocation = (location) => {
    if (location?.position) {
      setCenter(location.position);
      setActiveMarker(location.position);
      setPreviousMarker(location.position); // Update previous marker
      if (location.name) {
        setAddress(location.name);
      }
    }
  };

  return (
    <Box className={classes.modalWrapper}>
      <Box className={classes.headText}>
        <Typography variant="h3">{t('obx.dispatch.editAddress.title')}</Typography>
        <Typography variant="body2" className={classes.descriptionText}>
          {t('obx.dispatch.editAddress.description')}
        </Typography>
      </Box>

      {isLoaded ? (
        <>
          <GoogleMapSearchAddressComponent
            isLoaded={isLoaded}
            address={address}
            setAddress={setAddress}
            setCenter={handleCenterChange}
            setActiveMarker={handleMarkerChange}
            setSelectedLocation={handleSelectedLocation}
            formKey="address"
            errorMessages={errorsMessages}
          />

          <GoogleMap
            center={center}
            zoom={14}
            mapContainerStyle={mapContainerStyle}
            onClick={(e) => handleSelectAddress({ lat: e.latLng.lat(), lng: e.latLng.lng() }, null)}
          >
            {activeMarker && <Marker position={activeMarker} />}
          </GoogleMap>
        </>
      ) : (
        <Skeleton width="100%" height="300px" className={classes.skeleton} />
      )}

      <Box className={classes.inlineButtons}>
        <Button onClick={handleCloseModal} variant="secondaryGrey">
          {t('obx.dispatch.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={loading} variant="primary">
          {t('obx.dispatch.editAddress.update')}
        </Button>
      </Box>
    </Box>
  );
};

UpdateAddressModalBody.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  dispatch: PropTypes.object.isRequired,
  refetchDispatch: PropTypes.func.isRequired,
};

const UpdateAddressModal = ({ openModal, handleCloseModal, dispatch, refetchDispatch }) => (
  <ModalComponent
    open={openModal}
    handleClose={handleCloseModal}
    body={
      <UpdateAddressModalBody
        handleCloseModal={handleCloseModal}
        dispatch={dispatch}
        refetchDispatch={refetchDispatch}
      />
    }
  />
);

UpdateAddressModal.propTypes = {
  openModal: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  dispatch: PropTypes.object.isRequired,
  refetchDispatch: PropTypes.func.isRequired,
};

export default UpdateAddressModal;
