import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import { getLocationAddressFromGoogle } from 'src/services/googleMap.service';
import { defaultMapZoom, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './mapsStyle';

const GoogleMapViewComponent = ({
  updateMapValue,
  formKey,
  setAddress = () => {},
  setActiveMarker,
  activeMarker,
  setSelectedLocation,
  selectedLocation,
  setCenter,
  center,
  isLoaded = false,
  mapContainerStyle,
}) => {
  const classes = useStyles();
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(defaultMapZoom);

  const mapRef = useRef();
  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  /**
   * choose a location by clicking on map
   * @param {*} event
   */
  const handleMapClick = async (event) => {
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    try {
      const payload = {
        lat: latitude,
        lng: longitude,
      };

      //API to fetch location details using lat long
      const response = await getLocationAddressFromGoogle(payload);

      if (response && response?.length) {
        const result = response[0];
        const locationName = result.formatted_address;

        // Create a new location object with dynamically generated ID, name, and description
        const newLocation = {
          id: result.place_id,
          name: locationName,
          position: { lat: latitude, lng: longitude },
        };

        // Update the selectedLocation state with the details of the clicked location
        updateMapValue(formKey, newLocation);
        setAddress(locationName);
        setCenter(newLocation?.position);
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const calculateOffset = (currentZoom) => {
    const baseOffset = 8.0;
    const exponentialFactor = 1; // Adjust this value based on your preference
    return baseOffset / Math.pow(2, exponentialFactor * (currentZoom - 1));
  };
  /**
   * choose a location by drag and drop a marker on a map
   * @param {*} event
   */
  const handleMarkerDragEnd = async (event) => {
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();

    try {
      const payload = {
        lat: latitude,
        lng: longitude,
      };

      //API to fetch location details using lat long
      const response = await getLocationAddressFromGoogle(payload);

      if (response && response?.length) {
        const result = response[0];
        const locationName = result.formatted_address;

        // Create a new location object with dynamically generated ID, name, and description
        const newLocation = {
          id: Date.now(), // Using timestamp as a unique ID (replace with your logic)
          name: locationName,
          position: { lat: latitude, lng: longitude },
        };

        // Update the selectedLocation state with the details of the drag and dropped location
        updateMapValue(formKey, newLocation);
        setAddress(locationName);
        setCenter(newLocation?.position);
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleClickMarker = (id) => {
    setActiveMarker(id);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  return (
    <>
      {isLoaded && !isObjectEmpty(center) && (
        <>
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
            mapContainerStyle={mapContainerStyle}
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
                onMouseOver={() => handleClickMarker(selectedLocation?.id)}
                onMouseOut={() => setActiveMarker(null)}
              >
                {activeMarker === selectedLocation?.id && (
                  <InfoWindow
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -30),
                    }}
                    position={{
                      lat: selectedLocation?.position?.lat + calculateOffset(zoom),
                      lng: selectedLocation?.position?.lng,
                    }}
                    onCloseClick={handleInfoWindowClose}
                  >
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

GoogleMapViewComponent.propTypes = {
  updateMapValue: PropTypes.func,
  isLoaded: PropTypes.bool,
  formKey: PropTypes.string,
  setAddress: PropTypes.func,
  setActiveMarker: PropTypes.func,
  activeMarker: PropTypes.string,
  setSelectedLocation: PropTypes.func,
  selectedLocation: PropTypes.object,
  setCenter: PropTypes.func,
  center: PropTypes.object,
  mapContainerStyle: PropTypes.object,
};
export default GoogleMapViewComponent;
