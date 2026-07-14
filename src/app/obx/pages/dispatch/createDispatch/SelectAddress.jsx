import { Box } from '@mui/material';
import { useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  fallbackCenterOfMap,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
} from 'src/utils/constants';

const SelectAddress = ({ handleChangeAddress, formData, errorMessages }) => {
  const [address, setAddress] = useState('');
  const [center, setCenter] = useState(fallbackCenterOfMap);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});

  const { lat: franchiseLat, lng: franchiseLng } = useSelector(
    (state) => state?.auth?.franchiseInfo || {},
  );

  const updateMapValue = (_name, value) => {
    handleChangeAddress(value);
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  /**
   * calculate the center of the map
   */
  const finalCenter = useMemo(() => {
    if (!isObjectEmpty(formData?.googleAddress)) {
      return formData.googleAddress.position;
    }
    return center;
  }, [formData?.googleAddress, center]);

  const finalLocation = useMemo(() => {
    if (!formData?.googleAddress) return {};
    return !isObjectEmpty(selectedLocation) ? selectedLocation : {};
  }, [formData?.googleAddress, selectedLocation]);

  useEffect(() => {
    if (franchiseLat && franchiseLng) {
      setCenter({
        lat: parseFloat(franchiseLat),
        lng: parseFloat(franchiseLng),
      });
    }
  }, [franchiseLat, franchiseLng]);

  // ✅ Safe conditional render AFTER all hooks
  if (!isLoaded) {
    return null;
  }

  return (
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
        mapContainerStyle={{
          width: '100%',
          height: '300px',
          borderRadius: '10px',
        }}
      />
    </Box>
  );
};

export default SelectAddress;

SelectAddress.propTypes = {
  handleChangeAddress: PropTypes.func,
  formData: PropTypes.object,
  errorMessages: PropTypes.object,
};
