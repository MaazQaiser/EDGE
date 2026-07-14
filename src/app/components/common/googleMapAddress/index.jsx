import { Box, InputLabel, List, ListItem, ListItemText, TextField } from '@mui/material';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { getLocationAddressFromGoogle } from 'src/services/googleMap.service';
import {
  defaultMapZoom,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
} from 'src/utils/constants';

import RequiredAsterik from '../requiredAsterik';
import { useStyles } from './mapsStyle';

const defaultCenter = { lat: 41.216362, lng: -96.13607 };
const GoogleMapAddressComponent = ({ updateMapValue, errorMessages }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [activeMarker, setActiveMarker] = useState(null);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(defaultMapZoom);
  const [selectedLocation, setSelectedLocation] = useState({});
  const [center, setCenter] = useState(defaultCenter);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const mapRef = useRef();
  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const [address, setAddress] = useState('');

  const handleMapClick = async (event) => {
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    try {
      const response = await getLocationAddressFromGoogle(latitude, longitude);

      if (response?.data && response?.data.results.length > 0) {
        const result = response.data.results[0];
        const locationName = result.formatted_address;

        // Create a new location object with dynamically generated ID, name, and description
        const newLocation = {
          id: Date.now(), // Using timestamp as a unique ID (replace with your logic)
          name: locationName,
          position: { lat: latitude, lng: longitude },
        };

        // Update the selectedLocation state with the details of the clicked location
        // mapRef.current.panTo(newLocation.position);
        updateMapValue('googleAddress', newLocation);
        setAddress(locationName);
        setCenter(newLocation?.position);
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  const handleMarkerDragEnd = async (event) => {
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    try {
      const response = await getLocationAddressFromGoogle(latitude, longitude);

      if (response?.data && response?.data.results.length > 0) {
        const result = response.data.results[0];
        const locationName = result.formatted_address;

        // Create a new location object with dynamically generated ID, name, and description
        const newLocation = {
          id: Date.now(), // Using timestamp as a unique ID (replace with your logic)
          name: locationName,
          description: 'Custom description for the new location', // Add your description here
          position: { lat: latitude, lng: longitude },
        };

        // Update the selectedLocation state with the details of the clicked location
        // Update the selectedLocation state with the details of the clicked location
        // mapRef.current.panTo(newLocation.position);
        setAddress(locationName);
        updateMapValue('googleAddress', newLocation);
        setCenter(newLocation?.position);
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  const handleSelect = async (selected) => {
    try {
      const results = await geocodeByAddress(selected);
      const latLng = await getLatLng(results[0]);

      const location = {
        id: results.length && results[0].place_id,
        name: selected,
        position: { lat: latLng.lat, lng: latLng.lng },
      };
      // Handle the selected location data as needed

      // Update state if needed
      // mapRef.current.panTo(location.position);
      setAddress(selected);
      updateMapValue('googleAddress', location);
      setCenter(location?.position);
      setSelectedLocation(location);
    } catch (error) {
      console.error('Error selecting place', error);
    }
  };

  const handleClickMarker = (id) => {
    setActiveMarker(id);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  const handleInputChange = (value) => {
    // If the input value is empty, reset the selectedLocation state
    if (!value.trim()) {
      setSelectedLocation(null);
      updateMapValue('googleAddress', null);
    }
    setAddress(value);
  };

  return (
    <>
      {isLoaded && !isObjectEmpty(center) && (
        <>
          <PlacesAutocomplete
            value={address}
            onChange={(value) => handleInputChange(value)}
            onSelect={handleSelect}
            googleCallbackName={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="address">
                  {`${t('sales.locations.address')}`} <RequiredAsterik />
                </InputLabel>
                <Box className={classes.inputWrapper}>
                  <TextField
                    name="googleAddress"
                    id="googleAddress"
                    fullWidth
                    {...getInputProps({ placeholder: `${t('sales.locations.typeAddress')}` })}
                    error={!!errorMessages?.googleAddress}
                  />
                  {loading && (
                    <Box className={classes.loaderWrapper}>
                      <Box className={classes.loadingState}> </Box>
                    </Box>
                  )}
                </Box>

                {suggestions?.length > 0 && (
                  <List className={classes.mapListing}>
                    {suggestions?.map((suggestion) => (
                      <ListItem key={suggestion.placeId} {...getSuggestionItemProps(suggestion)}>
                        <ListItemText primary={suggestion.description} />
                      </ListItem>
                    ))}
                  </List>
                )}
                {/* {suggestions && suggestions.length === 0 && (
                  <List className={classes.mapListing}>
                    <ListItem>
                      <ListItemText primary={t('sales.locations.noRecords')} />
                    </ListItem>
                  </List>
                )} */}
              </Box>
            )}
          </PlacesAutocomplete>
          <GoogleMap
            options={{
              clickableIcons: false,
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: false,
              fullscreenControl: false,
            }}
            // onLoad={handleOnLoad}
            className={classes.mapStyles}
            mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
            onClick={handleMapClick}
            zoom={zoom}
            onLoad={(map) => {
              onLoadMap();
              setMap(map);
            }}
            center={center}
            onZoomChanged={() => {
              if (map) {
                setZoom(map.getZoom());
              }
            }}
          >
            {selectedLocation?.position && (
              <Marker
                key={selectedLocation?.id}
                position={selectedLocation?.position}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
                onClick={() => handleClickMarker(selectedLocation?.id)}
              >
                {activeMarker === selectedLocation?.id && (
                  <InfoWindow onCloseClick={handleInfoWindowClose}>
                    <div>{selectedLocation?.name}</div>
                  </InfoWindow>
                )}
              </Marker>
            )}
          </GoogleMap>
        </>
      )}
    </>
  );
};

GoogleMapAddressComponent.propTypes = {
  updateMapValue: PropTypes.func,
  errorMessages: PropTypes.object,
};
export default GoogleMapAddressComponent;
