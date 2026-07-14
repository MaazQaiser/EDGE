/*global google*/
import { Box, Chip, Typography } from '@mui/material';
import {
  DirectionsRenderer,
  GoogleMap,
  InfoWindow,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import { ReactComponent as GoToNextIcon } from 'assets/svg/arrow-right.svg?react';
import { ReactComponent as LocationIcon } from 'assets/svg/locationMap.svg?react';
import { ReactComponent as NoMapIcon } from 'assets/svg/NoMapIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getHoursDiff24HourFormat } from 'src/app/obx/pages/schedules/helper';
import { OBX_RUNSHEET, OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import {
  decode,
  formatTimeFromMinutes,
  generateUniqueId,
  // getRandomColor,
  isObjectEmpty,
  mapRunSheetData,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { ADDED_HIT, DELETED_HIT } from 'src/redux/reducers/runSheetReducer';
import {
  dayjsFormatsEnum,
  directionServiceErrors,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  googleMapStyles,
  runsheetDefaultPolyline,
  runSheetIcons,
  toastSettings,
  visitedPolyline,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { useStyles } from './directionMapStyles';

// const useStyles = makeStyles((theme) => ({

// }));
const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
};

const DM_LOG = '[DirectionsMap]';

const isValidWaypointPosition = (w) => {
  const lat = Number(w?.position?.lat);
  const lng = Number(w?.position?.lng);
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
};

const DirectionsMap = (props) => {
  const { t } = useTranslation();
  const {
    origin,
    destination,
    applyOnMap,
    center,
    enableToolTipOnPolyline,
    waypoints,
    showPolyineAndMarkersSeparately,
    onlyShowPolyline,
    setCoordinates,
    showAllRunSheets = false,
    pathData,
    runsheetMissedHits,
    // editScreenDirections,
    showVisitedPoints,
    visitedPoints,
    errorCallback,
    drawOnlyLines = false,
    dontRunDirections = false,
    mapPlaceholder,
    runsheetMissedHitsData = [],
    unassignedHits = false,
    enableHitHover = false,
    isAssignHits = false,
    ...rest
  } = props;
  const classes = useStyles();
  const { hideMap, onlyShowMarkers } = rest;
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const [mapPolyline, setPolyLine] = useState([]);
  const [markers, setMarkers] = useState([]); // Array to hold marker references
  const [polygons, setPolygons] = useState([]);
  const [finalCenter, setFinalCenter] = useState(defaultCenter);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [map, setMap] = useState(null); // To hold the map instance
  const [directionCalLoading, setDirectionCalLoading] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState();
  const [zoom, setZoom] = useState(10);
  const franchiseMarker = useSelector((state) => state?.auth);
  const { lat: franchiseLat, lng: franchiseLng } = useSelector(
    (state) => state?.auth?.franchiseInfo || {},
  );

  useEffect(() => {
    if (franchiseLat && franchiseLng)
      setFinalCenter({ lat: parseFloat(franchiseLat), lng: parseFloat(franchiseLng) });
  }, [franchiseLat, franchiseLng]);
  const { formatDayjsDateTime } = useDateTime();

  const { getLabel } = useTenantLabel();

  const markerRef = useRef({});
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };
  const clearMarkers = () => {
    markers.forEach((marker) => {
      marker?.setMap && marker?.setMap(); // Remove marker from the map
    });
    setMarkers([]); // Clear the markers array
  };
  const applyOnMapRef = useRef(false);
  const activePolygonIndex = useRef();

  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfo = (polygon = null, boolean) => {
    activePolygonIndex.current = polygon;
    setShowLabel(boolean);
  };
  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfoOnHover = (polygon = null, boolean) => {
    setActiveMarkerIndex(polygon);
    setShowLabel(boolean);
  };
  const clearRoute = () => {
    if (directionsRenderer && directionsService) {
      clearDirections();
      clearMarkers();
    }
  };
  /** reset directions map directions on map */
  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] }); // Clears the route from the map
      directionsRenderer.setMap(null);
    }
    setDirectionsResponse(null); // Clear directions response from state
  };

  // Maximum waypoints that can be handled by directions API
  const MAX_WAYPOINTS = 23;
  const smoothZoom = (targetZoom, center = null) => {
    if (center) {
      setFinalCenter(center);
    }
    setZoom((prevZoom) => {
      if (prevZoom === targetZoom) {
        return prevZoom; // Stop recursion when target is reached
      }

      let newZoom = prevZoom < targetZoom ? prevZoom + 1 : prevZoom - 1; // Zoom in or out
      setTimeout(() => smoothZoom(targetZoom, center), 50); // Continue zooming after a delay
      return newZoom;
    });
  };
  const calculateAndDisplayRoute = async () => {
    const segments = [];
    let chunksCoordinates = [];
    let chunksPolyline = [];
    let chunksLatLng = [];
    let chunksMarkers = [];

    if (!directionsService) return;

    const missingPositionHits = [];
    for (let i = 0; i < waypoints.length; i++) {
      const w = waypoints[i];
      if (isValidWaypointPosition(w)) continue;
      missingPositionHits.push({
        index: i,
        hitId: w?.hitId ?? w?.missedHitId ?? w?.dispatchId,
        siteId: w?.siteId,
        siteName: w?.siteName ?? w?.name,
        position: w?.position,
      });
    }
    if (missingPositionHits.length) {
      // eslint-disable-next-line no-console -- monitoring: missing lat/lng on map waypoints
      console.warn(DM_LOG, 'Waypoint(s) missing or invalid position.lat/lng', {
        count: missingPositionHits.length,
        hits: missingPositionHits,
      });
    }

    // Pushing chunk segments to an array (segments)
    for (let i = 0; i < waypoints.length; i += MAX_WAYPOINTS) {
      const segment = waypoints.slice(i, i + MAX_WAYPOINTS);
      segments.push(segment);
    }

    // An async function that will return the pathData on every segment
    const getRouteForSegment = (segment, segmentIndex) => {
      return new Promise((resolve, reject) => {
        let finalWayPoints = segment?.filter(
          (data) => !data?.status || data?.status !== DELETED_HIT,
        );
        const segmentsOrigin =
          segmentIndex === 0
            ? origin
            : { position: segments[segmentIndex - 1]?.[MAX_WAYPOINTS - 1]?.position };

        directionsService.route(
          {
            origin: new google.maps.LatLng(
              segmentsOrigin.position.lat,
              segmentsOrigin.position.lng,
            ),
            destination: new google.maps.LatLng(destination.position.lat, destination.position.lng),
            waypoints: finalWayPoints.map((waypoint) => ({
              location: new google.maps.LatLng(waypoint?.position?.lat, waypoint?.position?.lng),
              stopover: true,
            })),
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              let visitSetPolyLines = [];
              let latLngs = [];
              let mapPolyLineArray = [];
              let totalDistance = 0;
              let totalDuration = 0;

              const legs = response.routes[0].legs;

              for (let i = 0; i < legs.length; i++) {
                totalDistance += legs[i].distance.value;
                totalDuration += legs[i].duration.value;
              }
              for (let i = 0; i < legs.length; i++) {
                const steps = legs[i].steps;
                mapPolyLineArray[i] = decode(steps);
                latLngs[i] = steps?.map((step) => step.polyline.points);

                // Finding the previous chunk's end value
                // Description: Doing this because next chunks starting value should contain the previous chunk's end value
                const previousChunkEnd =
                  segmentIndex !== 0 && i === segment?.length
                    ? segments[segmentIndex - 1][segments[segmentIndex - 1]?.length - 1]
                    : i - 1;
                const calculatedIndex = MAX_WAYPOINTS * segmentIndex + i + segmentIndex;

                visitSetPolyLines.push({
                  distance: legs[i].distance,
                  duration: legs[i].duration,
                  ...(calculatedIndex === 0 ? origin : finalWayPoints[i]),
                  name: finalWayPoints[i]?.name || finalWayPoints[previousChunkEnd]?.siteName,
                  siteName:
                    finalWayPoints[i]?.siteName ||
                    finalWayPoints[i]?.name ||
                    finalWayPoints[previousChunkEnd]?.siteName,
                  hitId: finalWayPoints[i]?.hitId || finalWayPoints[previousChunkEnd]?.hitId,
                  isStartEnd: calculatedIndex === 0,
                  end_location: {
                    lat: legs[i]?.end_location?.lat(),
                    lng: legs[i]?.end_location?.lng(),
                  },
                  start_location: {
                    lat: legs[i]?.start_location?.lat(),
                    lng: legs[i]?.start_location?.lng(),
                  },
                  mapPath: latLngs[i],
                  totalDistance,
                  totalDuration,
                  isVisited: null,
                  status: null,
                  isSelected: null,
                });
              }

              let markers = [];
              let markerReference = {};
              finalWayPoints.forEach((point, index) => {
                if (point?.siteId && !markerReference[point?.siteId]) {
                  markerReference[point.siteId] = `${index}`;
                }
              });

              clearMarkers();
              let markerIndexes = {};
              if (response?.routes[0]?.legs) {
                for (const [i, leg] of response.routes[0].legs.entries()) {
                  const calculatedIndex = MAX_WAYPOINTS * segmentIndex + i + segmentIndex;
                  if (!markerIndexes?.[JSON.stringify(leg.start_location)]) {
                    markerIndexes[JSON.stringify(leg.start_location)] = true;
                    markers.push(
                      makeMarker(
                        leg.start_location,
                        calculatedIndex === 0 ? null : `${i}`,
                        map,
                        calculatedIndex === 0 ? runSheetIcons.startEndLocationIconBlack : null,
                        { ...finalWayPoints[i - 1], uniqueId: i ? generateUniqueId() : null },
                      ),
                    );
                  }
                }
              }
              // Resolving all the values
              resolve({
                visitSetPolyLines,
                latLngs,
                mapPolyLineArray,
                markers,
              });
            } else {
              reject(status);
            }
          },
        );
      });
    };

    try {
      setDirectionCalLoading(true);

      // Fetch all routes concurrently
      const results = await Promise.all(
        segments.map((segment, index) => getRouteForSegment(segment, index)),
      );

      // Appending all of the values
      results.forEach(({ visitSetPolyLines, latLngs, mapPolyLineArray, markers }) => {
        chunksCoordinates = [...chunksCoordinates, ...visitSetPolyLines];
        chunksLatLng = [...chunksLatLng, ...latLngs];
        chunksPolyline = [...chunksPolyline, ...mapPolyLineArray];
        chunksMarkers = [...chunksMarkers, ...markers];
      });

      smoothZoom(zoom >= 15 ? zoom - 1 : zoom + 1, chunksCoordinates?.[0]?.start_location);
      // Set the states after all routes are processed
      setCoordinates(chunksCoordinates);
      setPolyLine(chunksPolyline);
      setMarkers(chunksMarkers);
    } catch (error) {
      const errorMessage =
        error === directionServiceErrors.invalidRequest
          ? t('obx.runsheet.invalidRouteError')
          : t('obx.runsheet.noRouteFoundError', {
              hits: getLabel('terms', 'hits', t).toLowerCase(),
            });
      toaster.error({
        text: errorMessage,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      errorCallback();
    } finally {
      setDirectionCalLoading(false);
    }
  };

  /**
   * @description create markers for directions
   * @param {*} position
   * @param {*} title
   * @param {*} map
   * @returns
   */
  const makeMarker = (position, title, map, icon, data = null) => {
    const greenCircleSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'green',
      fillOpacity: 0.6,
      strokeColor: 'green',
      strokeWeight: 2,
      scale: 8,
    };

    let finalObject = {
      position: position,
      map: map,
      data: !isObjectEmpty(data) ? data : {},
      icon: icon
        ? icon
        : showVisitedPoints && !visitedPoints?.[pathData?.[title]?.hitId]
          ? runSheetIcons?.existingHitBlueIcon
          : showVisitedPoints && visitedPoints?.[pathData?.[title]?.hitId]
            ? greenCircleSymbol
            : runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes,
      // icon: icon ? icon : runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes,
      // label: { color: '#fff', fontWeight: 'bold', fontSize: '14px', text: title },
    };
    if (title) {
      finalObject = {
        ...finalObject,
        label: {
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '9px',
          padding: '5px',
          text: title,
        },
      };
    }
    return new google.maps.Marker(finalObject);
  };

  useEffect(() => {
    if (!isLoaded) return;
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: zoom,
      center: center,
      streetViewControl: false,
      mapTypeControl: false,
      zoomControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        // {
        //   featureType: 'all',
        //   elementType: 'labels.text',
        //   stylers: [{ visibility: 'off' }],
        // },
      ],
    });

    directionsRenderer.setMap(map);
    setDirectionsRenderer(directionsRenderer);
    setDirectionsService(directionsService);

    /** Set center */
  }, [isLoaded]);

  useEffect(() => {
    /**
     * If page is read only and no data is found
     */
    if (onlyShowPolyline && !waypoints?.length) {
      setPolygons([]);
      return;
    }

    if (unassignedHits && waypoints?.length) {
      const dataSet = waypoints.map((waypoint) => ({ ...waypoint, uniqueId: generateUniqueId() }));
      setPolygons(dataSet);
    }

    /**
     * Page is read only and data is found i.e multiple runsheets listing page
     */
    if (onlyShowPolyline && waypoints?.length) {
      let dataSet = [];
      for (let i = 0; i < waypoints?.length; i++) {
        // add unique id on show all runsheets page
        dataSet[i] = {
          ...waypoints[i],
          uniqueId: generateUniqueId(),
          coordinates: waypoints[i]?.coordinates,
          mapPathCoordinates: waypoints[i]?.pathData?.length ? mapRunSheetData(waypoints[i]) : [],
        };
      }
      setPolygons(dataSet);
      setFinalCenter(dataSet?.[0]?.coordinates?.[0]);
      return;
    }

    /**
     * condition for edit screen, this needs to run when user re-arranges the hits
     * UI should move to polyline and the directions api should not be called
     */
    if (showPolyineAndMarkersSeparately && props?.pathData?.length) {
      const dataSet = props.pathData?.map((data) => ({ ...data, uniqueId: generateUniqueId() }));
      setPolygons(dataSet);
      clearDirections();
      setFinalCenter(props?.pathData?.[0]?.start_location);
      return;
    }
  }, [waypoints, onlyShowPolyline, showPolyineAndMarkersSeparately, unassignedHits]);

  /**
   * Re-order page for directions service API call
   */
  useEffect(() => {
    if (
      waypoints?.length &&
      !isObjectEmpty(origin?.position) &&
      !isObjectEmpty(destination?.position) &&
      !onlyShowMarkers &&
      !onlyShowPolyline &&
      !dontRunDirections
    ) {
      calculateAndDisplayRoute();
    }
  }, [
    `${JSON.stringify(origin?.position)}-${JSON.stringify(waypoints)}`,
    onlyShowMarkers,
    dontRunDirections,
  ]);

  /**
   * Update the polylines, only for viewing,the shows the array of coordinates (decoded)
   */
  useEffect(() => {
    if (pathData?.length) {
      const dataSet = pathData.map((data) => ({ ...data, uniqueId: generateUniqueId() }));
      markerRef.current = {};
      setPolyLine(dataSet);
    }
  }, [pathData]);

  /**
   * Manage state if the apply on map is clicked
   */
  useEffect(() => {
    if (applyOnMap && !applyOnMapRef?.current) {
      markerRef.current = {};
      calculateAndDisplayRoute();
      applyOnMapRef.current = true;
      return;
    }
    if (!applyOnMap && applyOnMapRef.current) {
      clearRoute();
      applyOnMapRef.current = false;
      const dataSet = pathData.map((data) => ({ ...data, uniqueId: generateUniqueId() }));
      markerRef.current = {};
      setPolyLine(dataSet);
    }
  }, [applyOnMap]);

  /**
   * Screen for select hits
   */
  useEffect(() => {
    if (map && !isObjectEmpty(map) && onlyShowMarkers) {
      clearDirections();
      clearMarkers();

      let final = [];
      let data = waypoints;
      if (!isObjectEmpty(origin)) {
        data = [
          {
            ...origin,
            position: { lat: origin?.position.lat, lng: origin.position?.lng },
            isStartEnd: true,
          },
          ...data,
        ];
      }
      data?.forEach((waypoint, _index) => {
        final = [
          ...final,
          {
            ...waypoint,
            uniqueId: generateUniqueId(),
            position: waypoint?.position,
            icon:
              runsheetMissedHits && !waypoint?.selectedRunsheet
                ? runSheetIcons.runsheetMissedHitsIcon
                : waypoint?.isStartEnd
                  ? runSheetIcons.startEndLocationIconBlack
                  : runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes,
          },
        ];
      });
      setMarkers(final);
    }
  }, [waypoints, origin?.position, onlyShowMarkers]);

  /**
   * if center is changed
   */
  useEffect(() => {
    if (!isObjectEmpty(center) && JSON.stringify(center) !== JSON.stringify(finalCenter))
      setFinalCenter(center);
  }, [center]);

  const handleTooltipClick = (marker) => {
    const targetMarker = marker?.uniqueId ? marker : marker?.data;

    if (targetMarker?.uniqueId) {
      updateLabelInfoOnHover(targetMarker, true);
    }
  };

  const hideLabel = () => {
    setShowLabel(false);
    updateLabelInfoOnHover(null, false);
    setActiveMarkerIndex(null);
  };

  const doesMapPolylineContains = (line, status) => {
    return (
      waypoints?.some(
        (data) => data.siteId === line?.siteId && !data?.isStartEnd && data?.status === status,
      ) || false
    );
  };

  const markersToRender = isAssignHits ? runsheetMissedHitsData : markers;

  // console.log({
  //   props,
  //   polygons,
  //   applyOnMap,
  //   applyOnMapRef,
  //   directionsRenderer,
  //   enableHitHover,
  //   mapPolyline,
  //   waypoints,
  //   runsheetMissedHitsData,
  //   activeMarkerIndex,
  //   directionsResponse,
  //   directionsService,
  //   markers,
  //   markerRef,
  // });
  return (
    isLoaded && (
      <GoogleMap
        id="map"
        key={directionsRenderer}
        onLoad={onLoad}
        options={{
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          // zoomControl: false,
          fullscreenControl: false,
          styles: googleMapStyles,
          fullscreenControlOptions: false,
        }}
        mapContainerStyle={containerStyle}
        mapContainerClassName="directions-map"
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
        zoom={zoom}
        onClick={() => hideLabel()}
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
        {/** Draw map polylines only (displays default lines on edit screen's initial state ) */}
        {!onlyShowMarkers &&
          drawOnlyLines &&
          mapPolyline?.length &&
          mapPolyline?.map((line, index) => (
            <Polyline options={runsheetDefaultPolyline} key={index} path={line} />
          ))}

        {enableHitHover &&
          markersToRender?.length &&
          markersToRender.map((item, _index) => {
            const marker = item?.uniqueId ? item : { ...item?.data, ...item };
            if (marker?.siteId && !markerRef.current?.[marker?.siteId]) {
              markerRef.current = { ...markerRef.current, [marker?.siteId]: _index };
            }
            const icon =
              isAssignHits && !marker?.selectedRunsheet
                ? runSheetIcons.runsheetMissedHitsIcon
                : isAssignHits && marker?.selectedRunsheet
                  ? runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes
                  : marker?.icon;
            let rest = {};
            if (
              unassignedHits &&
              icon === runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes
            ) {
              rest = { zIndex: 999 };
            }
            return (
              <React.Fragment key={`${zoom}-${_index}`}>
                <Marker
                  key={marker?.uniqueId}
                  position={marker?.position}
                  icon={icon}
                  {...rest}
                  // zIndex={

                  // label={{
                  //   text:
                  //     !marker?.isStartEnd &&
                  //     markerRef?.current?.[marker?.siteId] === _index &&
                  //     `${markerRef?.current?.[marker?.siteId]}`,
                  //   color: 'white',
                  // }}
                  onClick={() => handleTooltipClick(marker)}
                />
                {showLabel &&
                  activeMarkerIndex &&
                  activeMarkerIndex?.uniqueId === marker?.uniqueId &&
                  (() => {
                    let multipleHits = markersToRender?.filter(
                      (data) => data.siteId === marker?.siteId && !data?.isStartEnd,
                    );
                    if (!multipleHits?.length)
                      multipleHits = waypoints?.filter(
                        (data) =>
                          data.siteId === marker?.siteId &&
                          !data?.isStartEnd &&
                          data?.status !== DELETED_HIT,
                      );

                    return (
                      <InfoWindow
                        position={activeMarkerIndex?.position || marker?.coordinates?.[0]}
                        options={{
                          pixelOffset: new window.google.maps.Size(0, -30),
                        }}
                      >
                        <Box sx={{ background: 'white' }} className={classes.mainToolTipBoxs}>
                          {/* {marker?.siteImage && ( */}
                          <img
                            src={marker?.siteImage || runSheetIcons?.sitePlaceholder}
                            alt="room image"
                            className={classes.roomImageTool}
                          />
                          {/* )} */}
                          <Box className={classes.nameWrap}>
                            <Typography variant="h6" className={classes.contactInformationName}>
                              {marker?.siteName || marker?.name}
                            </Typography>
                            {marker?.siteId && (
                              <Box
                                className={classes.gotoNextIcon}
                                onClick={() => {
                                  history.push(`${OBX_SITES_DETAIL}/${marker?.siteId}`);
                                }}
                              >
                                <GoToNextIcon />
                              </Box>
                            )}
                            {isAssignHits && (
                              <Chip
                                color="primary"
                                label={marker?.type === 'Patrol' ? 'Patrol' : ''}
                              />
                            )}
                          </Box>
                          {marker?.siteAddress && (
                            <Box className={classes.iconWrraper}>
                              <LocationIcon />
                              <Typography variant="body3" className={classes.addressName}>
                                {marker?.siteAddress}
                              </Typography>
                            </Box>
                          )}
                          <Box className={classes.hitWrapperMain}>
                            {multipleHits?.length > 1 &&
                              !_index !== 0 &&
                              multipleHits?.map((data, index) => {
                                return (
                                  <Box key={index} className={classes.hitWrapper}>
                                    <Box className={classes.hit}>
                                      <Typography
                                        variant="subtitle3"
                                        className={classes.addressName}
                                      >
                                        Hit {index + 1} •
                                      </Typography>
                                      {/* <Typography variant="body3" className={classes.addressName}>
                                    {data?.name || t('commonText.nA')}
                                  </Typography> */}
                                      <Typography variant="overline" className={classes.hitTime}>
                                        {data?.startsAt &&
                                          data?.endsAt &&
                                          `${formatDayjsDateTime({
                                            value: data?.startsAt,
                                            formatType: dayjsFormatsEnum.time,
                                          })} - ${formatDayjsDateTime({
                                            value: data?.endsAt,
                                            formatType: dayjsFormatsEnum.time,
                                          })}`}
                                      </Typography>
                                    </Box>
                                    <Typography variant="overline" className={classes.hitTime}>
                                      Service Time:{' '}
                                      {data?.duration
                                        ? formatTimeFromMinutes(data?.duration)
                                        : `${getHoursDiff24HourFormat(
                                            data?.startsAt,
                                            data?.endsAt,
                                          ).toFixed(2)}h`}
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

        {showPolyineAndMarkersSeparately &&
          mapPolyline?.length > 0 &&
          mapPolyline.map((line, index) => {
            if (line?.siteId && !markerRef.current?.[line?.siteId]) {
              markerRef.current = { ...markerRef.current, [line?.siteId]: index };
            }
            return (
              <React.Fragment key={index}>
                <Polyline
                  options={
                    showVisitedPoints &&
                    (visitedPoints?.[pathData?.[index]?.hitId] ||
                      visitedPoints?.[pathData?.[index + 1]?.hitId])
                      ? visitedPolyline
                      : runsheetDefaultPolyline
                  }
                  path={line}
                />
                {!showVisitedPoints && props.pathData?.length && (
                  <Marker
                    onClick={() => {}}
                    onMouseOver={() => enableHitHover && updateLabelInfo(line, true)}
                    onMouseOut={() => enableHitHover && updateLabelInfo(null, false)}
                    position={line?.[0]}
                    icon={
                      index === 0
                        ? runSheetIcons.runsheetSitePinIcon
                        : runSheetIcons.existingHitBlueIcon
                    }
                    label={{
                      text:
                        !line?.isStartEnd &&
                        markerRef?.current?.[line?.siteId] &&
                        `${markerRef?.current?.[line?.siteId]}`,
                      color: 'white',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

        {/** Draw lines on apply on map button */}
        {applyOnMap &&
          mapPolyline?.length &&
          mapPolyline?.map((line, index) => (
            <Polyline options={runsheetDefaultPolyline} key={index} path={line} />
          ))}

        {/** edit screen's state where both red and blue lines are visible */}
        {showPolyineAndMarkersSeparately && mapPolyline?.length > 0 && (
          <React.Fragment>
            {mapPolyline.map((line, index) => {
              if (line?.siteId && !markerRef.current?.[line?.siteId]) {
                markerRef.current = { ...markerRef.current, [line?.siteId]: index };
              }
              let icon =
                index === 0
                  ? runSheetIcons.startEndLocationIconBlack
                  : doesMapPolylineContains(line, DELETED_HIT)
                    ? runSheetIcons.deletedHitRedIcon
                    : doesMapPolylineContains(line, ADDED_HIT) || line?.isVisited
                      ? runSheetIcons.addedHitGreenicon
                      : line?.isDisabled
                        ? runSheetIcons.hitGreyIcon
                        : line?.visitType === 'dispatch'
                          ? runSheetIcons.runsheetDispatchIcon
                          : runSheetIcons.existingHitBlueIcon;
              return (
                <React.Fragment key={line?._id || line?.hitId || index}>
                  {/* {!line?.status && ( */}
                  <Polyline
                    options={
                      mapPolyline[index + 1]?.isVisited ||
                      (index === mapPolyline.length - 1 && origin?.isVisited)
                        ? visitedPolyline
                        : mapPolyline[index + 1]?.isDisabled
                          ? { ...runsheetDefaultPolyline, strokeColor: '#C0C0C0' }
                          : runsheetDefaultPolyline
                    }
                    // path={polygon?.coordinates}
                    path={line?.mapPath || line}
                  />
                  {/* )} */}
                  {props.pathData.length > 0 && (
                    <Marker
                      onClick={() =>
                        line?.uniqueId &&
                        !line?.isStartEnd &&
                        index &&
                        updateLabelInfoOnHover(line, true)
                      }
                      position={line?.position || line?.start_location || line?.[0]}
                      icon={icon}
                      label={{
                        text:
                          !line?.isStartEnd &&
                          markerRef?.current?.[line?.siteId] &&
                          `${markerRef?.current?.[line?.siteId]}`,
                        color: 'white',
                      }}
                    />
                  )}
                  {showLabel &&
                    activeMarkerIndex?.uniqueId === line?.uniqueId &&
                    (() => {
                      const multipleHits = mapPolyline?.filter(
                        (data) => data.siteId === line?.siteId && !data?.isStartEnd,
                      );
                      return (
                        <InfoWindow
                          position={activeMarkerIndex?.position || line?.coordinates?.[0]}
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                          }}
                        >
                          <Box sx={{ background: 'white' }} className={classes.mainToolTipBoxs}>
                            {/* {line?.siteImage && ( */}
                            <img
                              src={line?.siteImage || runSheetIcons?.sitePlaceholder}
                              alt="room image"
                              className={classes.roomImageTool}
                            />
                            {/* )} */}
                            <Box className={classes.nameWrap}>
                              <Typography variant="h6" className={classes.contactInformationName}>
                                {line?.siteName || line?.name}
                              </Typography>
                              {activeMarkerIndex?.siteId && (
                                <Box
                                  className={classes.gotoNextIcon}
                                  onClick={() => {
                                    history.push(
                                      `${OBX_SITES_DETAIL}/${activeMarkerIndex?.siteId}`,
                                    );
                                  }}
                                >
                                  <GoToNextIcon />
                                </Box>
                              )}
                            </Box>

                            {line?.siteAddress && (
                              <Box className={classes.iconWrraper}>
                                <LocationIcon />
                                <Typography variant="body3" className={classes.addressName}>
                                  {line?.siteAddress}
                                </Typography>
                              </Box>
                            )}

                            <Box className={classes.hitWrapperMain}>
                              {multipleHits?.length && multipleHits?.length > 1 && index !== 0
                                ? multipleHits?.map((data, index) => {
                                    return (
                                      <Box key={index} className={classes.hitWrapper}>
                                        <Box className={classes.hit}>
                                          <Typography
                                            variant="subtitle3"
                                            className={classes.addressName}
                                          >
                                            Hit {index + 1} •
                                          </Typography>
                                          {/* <Typography variant="body3" className={classes.addressName}>
                                        {data?.name || t('commonText.nA')}
                                      </Typography> */}
                                          <Typography
                                            variant="subtitle3"
                                            className={classes.addressName}
                                          >
                                            {data?.startsAt &&
                                              data?.endsAt &&
                                              `${formatDayjsDateTime({
                                                value: data?.startsAt,
                                                formatType: dayjsFormatsEnum.time,
                                              })} - ${formatDayjsDateTime({
                                                value: data?.endsAt,
                                                formatType: dayjsFormatsEnum.time,
                                              })} `}
                                          </Typography>
                                        </Box>
                                        <Typography variant="overline" className={classes.hitTime}>
                                          Service Time:{' '}
                                          {data?.duration?.value
                                            ? formatTimeFromMinutes(data?.duration?.value)
                                            : `${getHoursDiff24HourFormat(
                                                data?.startsAt,
                                                data?.endsAt,
                                              ).toFixed(2)}h`}
                                        </Typography>
                                      </Box>
                                    );
                                  })
                                : null}
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

        {/** show polylines and markers for deleted and added hits separately */}
        {onlyShowPolyline &&
          polygons?.length > 0 &&
          polygons.map((polygon, index) => {
            return (
              polygon?.mapPathCoordinates?.pathData?.length > 0 &&
              polygon.mapPathCoordinates.pathData.map((data, dataIndex) => {
                const dataWithParent = {
                  ...data,
                  uniqueId: polygon?.uniqueId || null,
                  runSheetData: polygon.mapPathCoordinates,
                };
                const icon =
                  dataIndex === 0
                    ? runSheetIcons.startEndLocationIconBlack
                    : data?.status === DELETED_HIT
                      ? runSheetIcons.deletedHitRedIcon
                      : data?.status === ADDED_HIT
                        ? runSheetIcons.addedHitGreenicon
                        : {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: 'navy',
                            fillOpacity: 1,
                            strokeColor: 'navy',
                            strokeWeight: 1,
                            scale: 8,
                          };
                return (
                  <React.Fragment key={`${index}-${dataIndex}`}>
                    {dataWithParent?.status !== ADDED_HIT && (
                      <Polyline
                        options={runsheetDefaultPolyline}
                        // path={polygon?.coordinates}
                        onClick={() => {
                          enableToolTipOnPolyline && updateLabelInfo(dataWithParent, true);
                        }}
                        path={dataWithParent?.mapPath || dataWithParent?.pathData || dataWithParent}
                      />
                    )}
                    {/** If page is not show all run sheets */}
                    {(!showAllRunSheets || dataIndex === 0) && (
                      <Marker
                        // label={dataIndex + 1}
                        position={polygon?.coordinates?.[dataIndex]}
                        icon={icon}
                      />
                    )}
                    {/** If page is show all run sheets */}

                    {enableToolTipOnPolyline &&
                      showLabel &&
                      activePolygonIndex.current?.uniqueId === polygon?.uniqueId &&
                      (() => {
                        const cardData = activePolygonIndex?.current;
                        return (
                          <InfoWindow
                            onCloseClick={() => {
                              setShowLabel(false);
                              activePolygonIndex.current = null;
                            }}
                            position={
                              activePolygonIndex?.current?.position || polygon?.coordinates?.[0]
                            }
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <>
                              <Box className={classes.mainToolTipBoxRunsheet}>
                                <Box className={classes.nameWrapperMain}>
                                  {/* {polygon?.id && `${polygon?.id} -`} */}
                                  <Box className={classes.nameWrapper}>
                                    <Typography variant="h4">
                                      {cardData?.runSheetData?.name}
                                    </Typography>
                                    <Chip
                                      color="primary"
                                      label={
                                        cardData?.runSheetData?.type === 'Patrol' ? 'Patrol' : ''
                                      }
                                    />
                                  </Box>
                                  {cardData?.runSheetData?.runsheetTemplateId && (
                                    <Box
                                      className={classes.gotoNextIcon}
                                      onClick={() => {
                                        history.push(
                                          `${OBX_RUNSHEET}/details/${cardData?.runSheetData?.runsheetTemplateId}`,
                                        );
                                      }}
                                    >
                                      <GoToNextIcon />
                                    </Box>
                                  )}
                                </Box>
                                <Box className={classes.nameWrapper}>
                                  <Typography variant="body3" color="#444446">
                                    Estimated runsheet time:
                                  </Typography>
                                  <Typography variant="body3" className={classes.dateWrraper}>
                                    {cardData?.runSheetData?.startsAt &&
                                      cardData?.runSheetData?.endsAt &&
                                      `${formatDayjsDateTime({
                                        value: cardData?.runSheetData?.startsAt,
                                        formatType: dayjsFormatsEnum.time,
                                      })} - ${formatDayjsDateTime({
                                        value: cardData?.runSheetData?.endsAt,
                                        formatType: dayjsFormatsEnum.time,
                                      })} 
                (${getHoursDiff24HourFormat(cardData?.runSheetData?.startsAt, cardData?.runSheetData?.endsAt).toFixed(2)}h)`}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })
            );
          })}

        {/** Polyline for assigned hits */}
        {unassignedHits &&
          waypoints?.length > 0 &&
          waypoints.map((polygon, index) => {
            return (
              polygon?.pathData?.length > 0 &&
              polygon?.pathData.map((data, dataIndex) => {
                const icon =
                  dataIndex === 0
                    ? runSheetIcons.startEndLocationIconBlack
                    : data?.status === DELETED_HIT
                      ? runSheetIcons.deletedHitRedIcon
                      : data?.status === ADDED_HIT
                        ? runSheetIcons.addedHitGreenicon
                        : null;
                // {
                //     path: google.maps.SymbolPath.CIRCLE,
                //     fillColor: 'navy',
                //     fillOpacity: 1,
                //     strokeColor: 'navy',
                //     strokeWeight: 1,
                //     scale: 8,
                //   };

                return (
                  <React.Fragment key={`${index}-${dataIndex}`}>
                    {data?.status !== ADDED_HIT && (
                      <Polyline
                        options={runsheetDefaultPolyline}
                        onClick={() => {
                          enableToolTipOnPolyline && updateLabelInfo(polygon, true);
                        }}
                        // path={polygon?.coordinates}
                        path={data?.mapPath || data?.pathData || data}
                      />
                    )}
                    {icon && (
                      <Marker
                        // label={dataIndex + 1}
                        position={
                          polygon?.coordinates?.[dataIndex]?.lat
                            ? polygon?.coordinates?.[dataIndex]
                            : polygon?.pathData?.[0]?.position
                        }
                        icon={icon}
                      />
                    )}
                    {enableToolTipOnPolyline &&
                      showLabel &&
                      activePolygonIndex.current &&
                      index === 0 &&
                      activePolygonIndex.current?.uniqueId === polygon?.uniqueId &&
                      (() => {
                        const center = activePolygonIndex?.current?.coordinates?.[dataIndex]?.lat
                          ? activePolygonIndex?.current?.coordinates?.[dataIndex]
                          : activePolygonIndex?.current?.startEndLocation?.position?.lat
                            ? activePolygonIndex?.current?.startEndLocation?.position
                            : activePolygonIndex?.current?.pathData?.[0]?.position?.lat
                              ? activePolygonIndex?.current?.pathData?.[0]?.position
                              : activePolygonIndex?.current?.pathData?.[0]?.start_location;
                        return (
                          <InfoWindow
                            onCloseClick={() => {
                              setShowLabel(false);
                              activePolygonIndex.current = null;
                            }}
                            position={center}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <>
                              <Box className={classes.mainToolTipBoxRunsheet}>
                                <Box className={classes.nameWrapperMain}>
                                  {/* {polygon?.id && `${polygon?.id} -`} */}
                                  <Box className={classes.nameWrapper}>
                                    <Typography variant="h4">
                                      {activePolygonIndex?.current?.runsheetName}
                                    </Typography>
                                    <Chip
                                      color="primary"
                                      label={
                                        activePolygonIndex?.current?.shiftType === 'patrol'
                                          ? 'Patrol'
                                          : ''
                                      }
                                    />
                                  </Box>
                                  {activePolygonIndex?.current?.id && (
                                    <Box
                                      className={classes.gotoNextIcon}
                                      onClick={() => {
                                        history.push(
                                          `${OBX_RUNSHEET}/details/${activePolygonIndex?.current?.id}`,
                                        );
                                      }}
                                    >
                                      <GoToNextIcon />
                                    </Box>
                                  )}
                                </Box>
                                <Box className={classes.nameWrapper}>
                                  <Typography variant="body3" color="#444446">
                                    Estimated runsheet time:
                                  </Typography>
                                  <Typography variant="body3" className={classes.dateWrraper}>
                                    {activePolygonIndex?.current?.startsAt &&
                                      activePolygonIndex?.current?.endsAt &&
                                      `${formatDayjsDateTime({
                                        value: activePolygonIndex?.current?.startsAt,
                                        formatType: dayjsFormatsEnum.time,
                                      })} - ${formatDayjsDateTime({
                                        value: activePolygonIndex?.current?.endsAt,
                                        formatType: dayjsFormatsEnum.time,
                                      })} 

                (${getHoursDiff24HourFormat(activePolygonIndex?.current?.startsAt, activePolygonIndex?.current?.endsAt).toFixed(2)}h)`}
                                  </Typography>
                                </Box>
                              </Box>
                            </>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })
            );
          })}

        {/** marker for unassigned hits */}
        {/* {unassignedHits &&
          runsheetMissedHitsData?.length > 0 &&
          runsheetMissedHitsData.map((data, index) => {
            const icon = !data?.selectedRunsheet
              ? runSheetIcons.runsheetMissedHitsIcon
              : runSheetIcons.runsheetMapBluePointerIconForDirectionsServiceRes;
            return (
              <React.Fragment key={`${index}-${index}`}>
                <Marker
                  // label={dataIndex + 1}
                  position={data?.position}
                  icon={icon}
                />
              </React.Fragment>
            );
          })} */}

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

        {directionCalLoading && <Box>Loading</Box>}
        {directionsResponse && !directionCalLoading && (
          <DirectionsRenderer
            options={{
              polylineOptions: {
                strokeOpacity: 1.0,
                strokeWeight: 1.5,
                strokeColor: 'red',
                visible: false,
              },
              suppressMarkers: true,
            }}
            key={`${directionsRenderer}-${waypoints?.length}`}
            directions={directionsResponse}
          />
        )}
      </GoogleMap>
    )
  );
};

DirectionsMap.propTypes = {
  origin: PropTypes.object,
  setCoordinates: PropTypes.func,
  destination: PropTypes.object,
  waypoints: PropTypes.array,
  applyOnMap: PropTypes.bool,
  dontRunDirections: PropTypes.bool,
  pathData: PropTypes.array,
  center: PropTypes.object,
  drawOnlyLines: PropTypes.bool,
  enableToolTipOnPolyline: PropTypes.bool,
  onlyShowPolyline: PropTypes.bool,
  showPolyineAndMarkersSeparately: PropTypes.bool,
  showVisitedPoints: PropTypes.bool,
  unassignedHits: PropTypes.bool,
  visitedPoints: PropTypes.object,
  showAllRunSheets: PropTypes.bool,
  mapPlaceholder: PropTypes.string,
  runsheetMissedHitsData: PropTypes.array,
  runsheetMissedHits: PropTypes.bool,
  enableHitHover: PropTypes.bool,
  isAssignHits: PropTypes.bool,
  errorCallback: PropTypes.func,
};

DirectionsMap.defaultProps = {
  origin: {},
  setCoordinates: () => {},
  destination: {},
  runsheetMissedHitsData: [],
  waypoints: [],
  editScreenDirections: false,
  pathData: [],
  center: {},
  onlyShowPolyline: false,
  enableToolTipOnPolyline: false,
  showPolyineAndMarkersSeparately: true,
  showVisitedPoints: false,
  visitedPoints: {},
  mapPlaceholder: '',
  enableHitHover: false,
  unassignedHits: false,
  runsheetMissedHits: false,
  isAssignHits: false,
  errorCallback: () => {},
};

export default DirectionsMap;
