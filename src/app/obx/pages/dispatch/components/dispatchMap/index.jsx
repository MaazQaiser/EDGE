// /*global google*/
import { Box, Typography } from '@mui/material';
import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as NoMapIcon } from 'assets/svg/NoMapIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { isObjectEmpty } from 'src/helper/utilityFunctions';
import {
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  googleMapStyles,
  runSheetIcons,
} from 'src/utils/constants';

import { useStyles } from './dispatchMap';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const DEFAULT_POLYLINE_OPTION = { strokeColor: '#75C4FF', strokeWeight: 2 };
const SELECTED_POLYLINE_OPTION = { strokeColor: '#146eff', strokeWeight: 4 };

const DispatchDirectionsMap = ({
  polygons,
  markers,
  center,
  selectedUniqueId,
  markerInfoWindow,
  polygonInfoWindow,
  mapPlaceholder,
  containerClassName,
  hideMap,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [finalCenter, setFinalCenter] = useState(defaultCenter);

  const { lat: franchiseLat, lng: franchiseLng } = useSelector(
    (state) => state?.auth?.franchiseInfo || {},
  );

  useEffect(() => {
    if (franchiseLat && franchiseLng)
      setFinalCenter({ lat: parseFloat(franchiseLat), lng: parseFloat(franchiseLng) });
  }, [franchiseLat, franchiseLng]);

  const map = useRef(null);

  const [markerModal, setMarkerModal] = useState();

  const franchiseMarker = useSelector((state) => state?.auth);
  const [polygonModal, setPolygonModal] = useState();

  const handleMapLoad = (mapInstance) => {
    map.current = mapInstance;
  };

  const moveTo = (position) => {
    if (!position?.lat) return;
    map?.current?.panTo(position);
  };

  const hidePopups = () => {
    setMarkerModal();
    setPolygonModal();
  };

  useEffect(() => {
    center && moveTo(center);
  }, [center]);

  const MarkerInforWindow = markerInfoWindow;
  const PolygonInfoWindow = polygonInfoWindow;

  return (
    isLoaded && (
      <GoogleMap
        options={{
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: googleMapStyles,
          fullscreenControlOptions: false,
        }}
        mapContainerStyle={containerStyle}
        center={finalCenter}
        zoom={10}
        onLoad={handleMapLoad}
        mapContainerClassName={containerClassName}
        onClick={() => hidePopups()}
      >
        {franchiseMarker?.franchiseInfo && !isObjectEmpty(franchiseMarker?.franchiseInfo) && (
          <Marker
            position={{
              lat: Number(franchiseMarker?.franchiseInfo?.lat),
              lng: Number(franchiseMarker?.franchiseInfo?.lng),
            }}
            icon={{
              scaledSize: new google.maps.Size(23.03, 28.4),
              url: runSheetIcons.franchiseIcon,
            }}
          />
        )}
        {markers.map((marker, index) => {
          return (
            <Marker
              key={index}
              position={marker?.position}
              icon={marker?.data?.uniqueId === selectedUniqueId ? marker.selectedIcon : marker.icon}
              onClick={() => setMarkerModal(marker)}
            />
          );
        })}

        {polygons?.length > 0 && (
          <React.Fragment>
            {polygons.map((polygon, index) => {
              return polygon?.lines?.map((line, i) => {
                return (
                  <Polyline
                    key={`ployline-${index}-${i}`}
                    options={
                      polygon?.data?.uniqueId === selectedUniqueId
                        ? SELECTED_POLYLINE_OPTION
                        : DEFAULT_POLYLINE_OPTION
                    }
                    path={line?.mapPath}
                    onClick={() => setPolygonModal(polygon)}
                  />
                );
              });
            })}
          </React.Fragment>
        )}

        {hideMap && (
          <Box className={classes.noMap}>
            <Box className={classes.noMapInner}>
              <NoMapIcon />
              <Typography>
                {' '}
                {mapPlaceholder ||
                  t('obx.runsheet.selectMap', {
                    runsheets: getLabel('terms', 'runsheets', t).toLowerCase(),
                  })}
              </Typography>
            </Box>
          </Box>
        )}

        {markerModal && MarkerInforWindow && (
          <InfoWindow position={markerModal.position}>
            <MarkerInforWindow data={markerModal} />
          </InfoWindow>
        )}
        {polygonModal && PolygonInfoWindow && (
          <InfoWindow position={polygonModal.position}>
            <PolygonInfoWindow data={polygonModal} />
          </InfoWindow>
        )}
      </GoogleMap>
    )
  );
};

DispatchDirectionsMap.propTypes = {
  center: PropTypes.object,
  polygons: PropTypes.array,
  markers: PropTypes.array,
  selectedUniqueId: PropTypes.string,
  hideMap: PropTypes.bool,
  mapPlaceholder: PropTypes.string,
  containerClassName: PropTypes.string,
  polygonInfoWindow: PropTypes.node,
  markerInfoWindow: PropTypes.node,
};

DispatchDirectionsMap.defaultProps = {
  origin: {},
  setCoordinates: () => {},
  destination: {},
  polygons: [],
  markers: [],
  mapPlaceholder: '',
  selectedUniqueId: '',
};

export default DispatchDirectionsMap;
