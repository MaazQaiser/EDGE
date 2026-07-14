import { Box, Typography } from '@mui/material';
import { GoogleMap, InfoWindow, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as LocationIcon } from 'assets/svg/locationMap.svg?react';
import { ReactComponent as NoMapIcon } from 'assets/svg/NoMapIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getHoursDiff24HourFormat } from 'src/app/obx/pages/schedules/helper';
import { calculateAndDisplayRouteUtils, isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { DELETED_HIT } from 'src/redux/reducers/runSheetReducer';
import {
  dayjsFormatsEnum,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  googleMapStyles,
  runSheetIcons,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './directionMapStyles';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const SplitDirectionsMap = (props) => {
  const { t } = useTranslation();
  const {
    origin,
    destination,
    applyOnMap,
    center,
    waypoints,
    showPolyineAndMarkersSeparately,
    setCoordinates,
    pathData,
    mapPlaceholder,
    state,
    ...rest
  } = props;
  const classes = useStyles();
  const { hideMap } = rest;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [mapState, setMapState] = useState(1);
  const hardReset = useRef(false);
  const markerRef = useRef({});
  const [mapPolyline, setPolyLine] = useState([]);
  const [finalCenter, setFinalCenter] = useState(center);
  const [showLabel, setShowLabel] = useState(false);
  const onLoad = () => {};

  const applyOnMapRef = useRef(false);
  const activeMarkerIndex = useRef();
  const franchiseMarker = useSelector((state) => state?.auth);
  const { formatDayjsDateTime } = useDateTime();
  const { getLabel } = useTenantLabel();

  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfoOnHover = (polygon = null, boolean) => {
    activeMarkerIndex.current = polygon;
    setShowLabel(boolean);
  };

  const hideLabel = () => {
    setShowLabel(false);
    updateLabelInfoOnHover(null, false);
    activeMarkerIndex.current = null;
  };
  const calculateAndDisplayRoute = async () => {
    let finalWayPoints = waypoints?.filter((data) => !data?.status || data?.status !== DELETED_HIT);
    try {
      const visitSetPolyLines = (
        await calculateAndDisplayRouteUtils(origin, finalWayPoints, t, destination)
      )?.visitSetPolyLines;
      setCoordinates(visitSetPolyLines);
    } catch (error) {
      toaster.error({
        text: error?.message || error?.e,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setCoordinates([]);
    }
  };

  /**
   * Manage state if the apply on map is clicked
   */
  useEffect(() => {
    if (applyOnMap && !applyOnMapRef?.current) {
      calculateAndDisplayRoute();
      applyOnMapRef.current = true;
      setMapState((prev) => prev + 1);
      markerRef.current = {};
      return;
    } else if (!applyOnMap && applyOnMapRef.current) {
      applyOnMapRef.current = false;
      setPolyLine([]);
      setPolyLine(pathData);
      setMapState((prev) => prev + 1);
      markerRef.current = {};
    } else {
      setPolyLine(pathData);
      if (
        !isObjectEmpty(state?.startEndLocation) &&
        JSON.stringify(finalCenter) !== JSON.stringify(state?.startEndLocation)
      ) {
        setFinalCenter(state?.startEndLocation?.position || state?.startEndLocation);
        if (!hardReset.current) {
          setMapState((prev) => prev + 1);
          hardReset.current = true;
        }
      } else {
        setFinalCenter(pathData?.[0]?.start_location);
      }
    }
    markerRef.current = {};
  }, [applyOnMap, pathData]);

  /**
   * if center is changed
   */
  useEffect(() => {
    if (!isObjectEmpty(center) && JSON.stringify(center) !== JSON.stringify(finalCenter)) {
      setFinalCenter(center);
    }
  }, [center]);

  const polylineStrokeOptions = { strokeColor: '#146eff', strokeWeight: 3.5 };
  console.log({
    mapPolyline,
    mapState,
    center,
  });
  return (
    isLoaded && (
      <GoogleMap
        onClick={() => hideLabel()}
        onLoad={onLoad}
        options={{
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: googleMapStyles,
          fullscreenControlOptions: false,
        }}
        mapContainerStyle={containerStyle}
        center={
          franchiseMarker?.franchiseInfo &&
          franchiseMarker?.franchiseInfo?.lat &&
          franchiseMarker?.franchiseInfo?.lng
            ? {
                lat: Number(franchiseMarker?.franchiseInfo?.lat),
                lng: Number(franchiseMarker?.franchiseInfo?.lng),
              }
            : finalCenter
        }
        zoom={10}
      >
        {franchiseMarker?.franchiseInfo &&
          franchiseMarker?.franchiseInfo?.lat &&
          franchiseMarker?.franchiseInfo?.lng && (
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
        {!isObjectEmpty(state?.startEndLocation) && !applyOnMap && (
          <Marker
            position={state?.startEndLocation?.position}
            icon={runSheetIcons.startEndLocationIconBlack}
          />
        )}
        {/** Split run sheet first step */}

        {showPolyineAndMarkersSeparately && mapPolyline?.length > 0 && (
          <React.Fragment key={mapState}>
            {mapPolyline.map((line, index) => {
              const tempIndex = index;
              const marker = line?.uniqueId ? line : { ...line?.data, ...line };
              if (marker?.siteId && !markerRef.current?.[marker?.siteId]) {
                markerRef.current = { ...markerRef.current, [marker?.siteId]: index };
              }
              // if (line?.siteId && !markerRef.current?.[line?.siteId]) {
              //   markerRef.current = { ...markerRef.current, [line?.siteId]: index };
              // }

              let icon = line?.isStartEnd
                ? runSheetIcons.startEndLocationIconBlack
                : line?.isVisited || line?.isSelected
                  ? runSheetIcons.existingHitBlueIcon
                  : runSheetIcons.hitGreyIcon;

              if (isObjectEmpty(state?.isStartEndLocation) && !index) {
                icon = null;
              }
              // if applied on map is clicked and google's data is being rendered
              if (applyOnMap) {
                if (!index) {
                  icon = runSheetIcons.startEndLocationIconBlack;
                } else {
                  icon = runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes;
                }
              }
              let polyLineOptions = polylineStrokeOptions;
              if (
                mapPolyline[tempIndex + 1]?.isVisited ||
                mapPolyline[tempIndex + 1]?.isSelected ||
                (index === mapPolyline.length - 1 &&
                  (mapPolyline[index]?.isVisited || mapPolyline[index]?.isSelected))
              ) {
                polyLineOptions = { ...polylineStrokeOptions };
              } else {
                polyLineOptions = { ...polylineStrokeOptions, strokeColor: '#C0C0C0' };
              }
              if (applyOnMap) {
                polyLineOptions = { ...polylineStrokeOptions };
              }
              return (
                <React.Fragment key={mapState || line?._id || line?.hitId || index}>
                  <Polyline options={polyLineOptions} path={line?.mapPath || line} />
                  {icon && (
                    <Marker
                      onClick={() => line?.uniqueId && updateLabelInfoOnHover(line, true)}
                      position={line?.start_location || line?.position || line?.[0]}
                      icon={icon}
                      label={{
                        text:
                          // !applyOnMap
                          // ? // !line?.isStartEnd && index !== 0 && `${index}`
                          // : line?.uniqueId && !line?.isStartEnd && index
                          //   ? `${index}`
                          !line?.isStartEnd && markerRef?.current?.[line?.siteId]
                            ? `${markerRef?.current?.[line?.siteId]}`
                            : null,

                        color: 'white',
                      }}
                    />
                  )}

                  {showLabel &&
                    activeMarkerIndex.current?.uniqueId === line?.uniqueId &&
                    (() => {
                      const multipleHits = mapPolyline?.filter(
                        (data) => data.siteId === line?.siteId && !data?.isStartEnd,
                      );

                      return (
                        <InfoWindow
                          onCloseClick={() => {
                            setShowLabel(false);
                            updateLabelInfoOnHover(null, false);
                            activeMarkerIndex.current = null;
                          }}
                          position={
                            activeMarkerIndex?.current?.position ||
                            activeMarkerIndex?.current?.start_location ||
                            line?.coordinates?.[0]
                          }
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                          }}
                        >
                          <Box sx={{ background: 'white' }} className={classes.mainToolTipBoxs}>
                            {line?.siteImage && (
                              <img
                                src={line?.siteImage}
                                alt="room image"
                                className={classes.roomImageTool}
                              />
                            )}
                            <Typography variant="h6" className={classes.contactInformationName}>
                              {line?.siteName || line?.name}
                            </Typography>
                            {line?.siteAddress && (
                              <Box className={classes.iconWrraper}>
                                <LocationIcon />
                                <Typography variant="body3" className={classes.addressName}>
                                  {line?.siteAddress}
                                </Typography>
                              </Box>
                            )}
                            <Box className={classes.hitWrapperMain}>
                              {multipleHits?.length &&
                                multipleHits?.length > 1 &&
                                index !== 0 &&
                                multipleHits?.map((data, index) => {
                                  return (
                                    <Box key={index} className={classes.hitWrapper}>
                                      <Typography
                                        variant="subtitle3"
                                        className={classes.addressName}
                                      >
                                        Hit {index + 1}
                                      </Typography>
                                      <Typography variant="overline" className={classes.hitTime}>
                                        {data?.startsAt &&
                                          data?.endsAt &&
                                          `${formatDayjsDateTime({
                                            value: data?.startsAt,
                                            formatType: dayjsFormatsEnum.time,
                                          })} - ${formatDayjsDateTime({
                                            value: data?.endsAt,
                                            formatType: dayjsFormatsEnum.time,
                                          })} 
                (${getHoursDiff24HourFormat(data?.startsAt, data?.endsAt).toFixed(2)}h)`}
                                      </Typography>
                                    </Box>
                                  );
                                })}
                            </Box>
                          </Box>
                        </InfoWindow>
                      );
                    })()}
                </React.Fragment>
              );
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
      </GoogleMap>
    )
  );
};

SplitDirectionsMap.propTypes = {
  origin: PropTypes.object,
  setCoordinates: PropTypes.func,
  destination: PropTypes.object,
  waypoints: PropTypes.array,
  applyOnMap: PropTypes.bool,
  pathData: PropTypes.array,
  center: PropTypes.object,
  showPolyineAndMarkersSeparately: PropTypes.bool,
  mapPlaceholder: PropTypes.string,
  state: PropTypes.object,
};

SplitDirectionsMap.defaultProps = {
  origin: {},
  setCoordinates: () => {},
  destination: {},
  waypoints: [],
  pathData: [],
  center: {},
  showPolyineAndMarkersSeparately: true,
  mapPlaceholder: '',
  state: {},
};

export default SplitDirectionsMap;
