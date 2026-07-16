import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {
  // Autocomplete,
  DrawingManager,
  GoogleMap,
  InfoWindow,
  Marker,
  Polygon,
  useJsApiLoader,
} from '@react-google-maps/api';
import area from '@turf/area';
import booleanIntersects from '@turf/boolean-intersects';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import centerOfMass from '@turf/center-of-mass';
import {
  lineString,
  multiPolygon as createMultiPolygon,
  point as createTurfPoint,
  points as createPointsCollection,
} from '@turf/helpers';
import lineIntersect from '@turf/line-intersect';
import pointsWithinPolygon from '@turf/points-within-polygon';
import deleteIcon from 'assets/images/remove.png';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OBX_SITES_DETAIL } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { getLocationAddressFromGoogle } from 'src/services/googleMap.service';
import {
  defaultMapZoom,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  polygonlocationTypes,
  polygonNameOptions,
} from 'src/utils/constants';
import { KEY } from 'src/utils/constants/events/keyPressEvents';

import { generateUniqueId, isObjectEmpty, removeKey } from '../../../../helper/utilityFunctions';

/**
 * Default center if can't get location of user.
 */
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

/**
 * constant values
 */
export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
  franchiseName: 'franchiseName',
};

/**
 * The options for each polygon (franchise)
 * Initially all polygons must not be either draggable or editable
 * These are turned to true only when they are about to be edited.
 */
const franchisePolygonOptions = {
  fillOpacity: 0.3,
  fillColor: '#FF9332',
  strokeColor: '#FF9332',
  strokeWeight: 2.5,
  draggable: true,
  editable: true,
};

/**
 * Zone polygon options
 */
const zonePolygonOptions = {
  fillOpacity: 0.3,
  fillColor: '#00BDBA',
  strokeColor: '#00BDBA',
  strokeWeight: 2.5,
  draggable: true,
  editable: true,
};

/**
 * Site polygon options
 */
const sitePolygonOptions = {
  fillOpacity: 0.5,
  fillColor: '#FB3737',
  strokeColor: '#FB3737',
  strokeWeight: 2.5,
  draggable: true,
  editable: true,
};

const containerStyle = {
  width: '100%',
  height: '400px',
};

// const autocompleteStyle = {
//   boxSizing: 'border-box',
//   border: '1px solid transparent',
//   width: '240px',
//   height: '38px',
//   padding: '0 12px',
//   borderRadius: '3px',
//   boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
//   fontSize: '14px',
//   outline: 'none',
//   textOverflow: 'ellipses',
//   position: 'absolute',
//   right: '8%',
//   top: '11px',
//   marginLeft: '-120px',
// };

/**
 * @description Pillar Component of the project and if you are here to edit this, then RIP in advance. :)
 *
 * @param {String} formDataKey represents the coordindates key in the formData
 * @param {Function} updateFormHandler updates the parent formData
 * @param {Object} errorMessages represents the form errors regarding the coordinates
 * @param {Function} setErrorMessages updates the form's error
 * @param {Boolean} createOrUpdate toggle for drawing controls
 * @param {String} actionItemType shows what kind of polygon are we dealing with
 * @param {Object} actionItem shows the item we are editing or the item of the formData
 * @param {Boolean} sameAsFranchise toggle for sameAsFranchise checkbox on zone page
 * @param {Object} mapCenter object that shows the center of the map
 * @param {Object} parentBoundry object representing the parent of the actionItem
 * @param {Array} siblings array of siblings that need to verified that are not intersecting with the action item coordinates
 * @param {Array} franchiseData object containing franchises, zones and sites along with the actionItem's parentId.
 *
 * @returns
 */
const MapComponent = (props) => {
  const {
    siblings = [],
    franchiseData = [],
    mapCenter = {},
    parentBoundry,
    setErrorMessages,
    updateFormHandler,
    errorMessages,
    formDataKey,
    actionItem = null,
    createOrUpdate = false,
    actionItemType = actionItemTypeKeys.franchise,
    sameAsFranchise = false,
    childrenPolygons = [],
    setActiveMarker = () => {},
    selectedLocation = {},
    updateMapValue = () => {},
    isSitePinDraggable = false,
    isEditingSite = false,
  } = props;
  /**
   * configuration of google maps drawing manager
   */
  const drawingManagerOptions = {
    polygonOptions: franchisePolygonOptions,
    drawingControl: false,
    drawingControlOptions: {
      position: window.google?.maps?.ControlPosition?.TOP_LEFT,
      drawingModes: window.google?.maps?.drawing?.OverlayType?.POLYGON
        ? [window.google.maps.drawing.OverlayType.POLYGON]
        : [],
    },
  };

  // const readOnlyDrawingManagerOptions = {
  //   // polygonOptions: zonePolygonOptions,
  //   drawingControl: false,
  //   drawingControlOptions: {
  //     position: window.google?.maps?.ControlPosition?.TOP_LEFT,
  //   },
  // };

  // const autocompleteRef = useRef();
  const { t } = useTranslation();
  const mapRef = useRef();
  const animationRef = useRef(true);
  const polygonRefs = useRef([]);

  /**
   * Most important, used to create/keep/remember track of currently selected polygon
   */
  const activePolygonIndex = useRef();
  const drawingManagerRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  /**
   * all the polygons that are shown on map are these
   */
  const [polygons, setPolygons] = useState([]);
  const [cancelActiveDrawing, setCancelActiveDrawing] = useState(false);
  const [actionPolygon, setActionPolygon] = useState({});
  const [center, setCenter] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(defaultMapZoom);
  const [showLabel, setShowLabel] = useState(false);
  const deleteIconStyle = {
    cursor: 'pointer',
    backgroundImage: `url(${deleteIcon})`,
    height: '24px',
    width: '24px',
    marginTop: '0',
    backgroundColor: '#fff',
    position: 'absolute',
    top: '10px',
    left: '52%',
    zIndex: 1,
    padding: '20px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    borderRadius: '2px',
  };

  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onLoadPolygon = useCallback((polygon, index) => {
    polygonRefs.current[index] = polygon;
  }, []);

  /**
   * @description set the current to uniqueId so that the polygon could * identified.
   * @param {*} polygon
   */
  const onClickPolygon = (polygon) => {
    activePolygonIndex.current = polygon?.uniqueId;
    /**
     * show label on click if polygon is of zone
     */
    if (polygon?.zoneArea) {
      setShowLabel(true);
    }
  };

  // const onLoadAutocomplete = (autocomplete) => {
  //   autocompleteRef.current = autocomplete;
  // };

  // const onPlaceChanged = () => {
  //   const { geometry } = autocompleteRef.current.getPlace();
  //   const bounds = new window.google.maps.LatLngBounds();
  //   if (geometry.viewport) {
  //     bounds.union(geometry.viewport);
  //   } else {
  //     bounds.extend(geometry.location);
  //   }
  //   mapRef.current.fitBounds(bounds);
  // };

  const onLoadDrawingManager = (drawingManager) => {
    drawingManagerRef.current = drawingManager;
  };

  /**
   * @description check if the polygon lines are not intersecting
   * @param {*} polygon1
   * @param {*} polygon2
   * @returns {Boolean}
   */
  const handleParentChildBoundryIntersection = (polygon1, polygon2) => {
    const polygon1Lines = mapCoordinatesForTurf(polygon1)[0];
    const polygon2Lines = mapCoordinatesForTurf(polygon2)[0];

    const lineStrings1 = createLineStrings(polygon1Lines);
    const lineStrings2 = createLineStrings(polygon2Lines);

    let intersects = false;
    for (let i = 0; i < lineStrings1.length; i++) {
      for (let j = 0; j < lineStrings2.length; j++) {
        intersects = lineIntersect(lineStrings1[i], lineStrings2[j]).features.length > 0;
        if (intersects) {
          const line1Coordinates = lineStrings1[i].geometry.coordinates;
          const line2Coordinates = lineStrings2[j].geometry.coordinates;
          const startPoint1 = line1Coordinates[0];
          const endPoint1 = line1Coordinates[line1Coordinates.length - 1];
          const startPoint2 = line2Coordinates[0];
          const endPoint2 = line2Coordinates[line2Coordinates.length - 1];
          if (
            (startPoint1[0] === endPoint2[0] && startPoint1[1] === endPoint2[1]) ||
            (endPoint1[0] === startPoint2[0] && endPoint1[1] === startPoint2[1])
          ) {
            continue;
          } else {
            return true;
          }
        }
      }
    }
    return false;
  };

  /**
   * @description cook data for line strings to check intersections
   * @param {*} coordinates
   * @returns {Array}
   */
  const createLineStrings = (coordinates) => {
    const lineStrings = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const line = lineString([
        [coordinates[i][1], coordinates[i][0]],
        [coordinates[i + 1][1], coordinates[i + 1][0]],
      ]);
      lineStrings.push(line);
    }
    return lineStrings;
  };

  /**
   *
   * @param {*} polygon
   * @returns {Boolean}
   */
  const handlePolygonLinesIntersectionOnDrawingOrUpdate = (polygon) => {
    let checkPolygon = mapCoordinatesForTurf(polygon?.[0]?.[0] ? polygon?.[0] : polygon)[0];
    const lineStrings = [];
    for (let i = 0; i < checkPolygon.length - 1; i++) {
      const line = lineString([
        [checkPolygon[i][1], checkPolygon[i][0]],
        [checkPolygon[i + 1][1], checkPolygon[i + 1][0]],
      ]);
      lineStrings.push(line);
    }
    let intersects = false;
    for (let i = 0; i < lineStrings.length; i++) {
      for (let j = i + 2; j < lineStrings.length; j++) {
        if (i !== 0 || j !== lineStrings.length - 1) {
          intersects = lineIntersect(lineStrings[i], lineStrings[j]).features.length > 0;
          if (intersects) {
            return true;
          }
        }
      }
    }
    return false;
  };

  /**
   * @description when a new polygon is created from scratch successfully
   * @param {*} $overlayEvent
   * @returns
   */
  const onOverlayComplete = ($overlayEvent) => {
    /**
     * handle escape button.
     */
    if (cancelActiveDrawing) {
      setCancelActiveDrawing(false);
      setActionPolygon({});
      let lastDraw = $overlayEvent?.overlay;
      lastDraw.setMap(null);
      return;
    }

    drawingManagerRef.current?.setDrawingMode(null);
    let error = false;
    /**
     * if you are creating a polygon
     */
    if ($overlayEvent.type === window.google?.maps?.drawing?.OverlayType?.POLYGON) {
      let newPolygonObject = {};
      const newPolygon = $overlayEvent.overlay
        .getPath()
        .getArray()
        .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));

      const startPoint = newPolygon[0];
      // polygons.pop();
      newPolygon.push(startPoint);

      /**
       * identifies the polygon in the array of polygons if it's
       * selected to edit, drag or deleted.
       */
      const uniqueId = generateUniqueId();

      /**
       * setMarker coordinates only if we have an actionitem
       */
      let markerLocation = null;
      if (actionItem) {
        markerLocation = getMarkerKey(actionItem);
      }

      newPolygonObject = {
        ...newPolygonObject,
        label: actionItem[getNameKey(actionItem)]
          ? actionItem[getNameKey(actionItem)]
          : getNewLabel(actionItemType),
        area: calculateArea(newPolygon),
        center: calculateCenter(newPolygon),
        uniqueId: uniqueId,
        isActionItem: true,
        coordinates: newPolygon,
        options: getPolygonOptions(actionItemType),
      };

      if (markerLocation) {
        // this key is for setting the marker coordinates key dynammically for error handling
        // reason for separate is that zones will not have a zoneLocation key so setting the dynammic key will break the code
        newPolygonObject = {
          ...newPolygonObject,
          markerLocation:
            actionItem?.[markerLocation] && !isObjectEmpty(actionItem?.[markerLocation])
              ? actionItem?.[markerLocation]
              : { lat: calculateCenter(newPolygon)[0], lng: calculateCenter(newPolygon)[1] },
          // this key is for the google maps loop at the bottom to show the marker
          [markerLocation]:
            actionItem?.[markerLocation] && !isObjectEmpty(actionItem?.[markerLocation])
              ? actionItem?.[markerLocation]
              : { lat: calculateCenter(newPolygon)[0], lng: calculateCenter(newPolygon)[1] },
        };
      }

      /**
       * if the polygon has non-null siteLocation or franchiseLocation or zoneLocation then check if the polygon is around
       * the marker when it is being moved
       */
      if (newPolygonObject?.[markerLocation]) {
        error = verifyMarkerLocationOnPolygonMovement(newPolygonObject);
      }

      /**
       * set this so that the newly created is set for edit or delete reference
       */
      activePolygonIndex.current = uniqueId;
      setShowLabel(true);
      $overlayEvent.overlay?.setMap(null);
      setActionPolygon(newPolygonObject);
      /**
       * when creating new setErrors
       */
      if (!error) {
        error = errorsInZoneEdgeCases(newPolygonObject);
      }

      if (handlePolygonLinesIntersectionOnDrawingOrUpdate(newPolygon)) {
        error = handlePolygonLinesIntersectionOnDrawingOrUpdate(newPolygon);
        setErrorMessages((prev) => ({
          ...prev,
          [formDataKey]: `${t('sideNavBar.linkText.polygon')} ${t('errors.selfIntersection')}`,
        }));
      }
      /**
       * verify item will always have childrens inside itself
       */
      if (childrenPolygons?.length && !error) {
        error = checkIfAllChildrensAreInsideActionItem(newPolygonObject, childrenPolygons);
      }
      if (!error) {
        setErrorMessages((prev) => removeKey([formDataKey], prev));
      }
      updateFormHandler(formDataKey, [newPolygonObject?.coordinates]);
      if (actionItemType !== actionItemTypeKeys.zone) {
        polygons.pop();
      }
      setPolygons([...polygons, newPolygonObject]);
      // checkIfPolygonIsInBoundry(parentBoundry, newPolygon);
    }
  };

  /**
   * @description calculate the area of each polygon
   * @param {*} polygon
   * @returns
   */
  const calculateArea = (polygon) => {
    return area(createMultiPolygon([mapCoordinatesForTurf(polygon)])).toFixed(2);
  };

  /**
   * @description returns the polygon options based on the action item
   * @param {*} type
   * @returns
   */
  const getPolygonOptions = (type) => {
    let res;
    switch (type) {
      case actionItemTypeKeys?.site:
        res = sitePolygonOptions;
        break;
      case actionItemTypeKeys?.zone:
        res = zonePolygonOptions;
        break;
      case actionItemTypeKeys?.franchise:
        res = franchisePolygonOptions;
        break;
      default:
        res = {};
        break;
    }
    return res;
  };

  /**
   * @description Check if the polygon is inside parent boundry
   * @param {*} boundry
   * @param {*} polygonToCheck
   */
  const checkIfPolygonIsInBoundry = (boundry, polygonToCheck) => {
    if (
      handleParentChildBoundryIntersection(
        boundry,
        polygonToCheck?.[0]?.[0] ? polygonToCheck?.[0] : polygonToCheck,
      )
    ) {
      setErrorMessages((prev) => ({
        ...prev,
        [formDataKey]: `${t('sideNavBar.linkText.polygon')} ${t('errors.selfIntersection')}`,
      }));
      return false;
    }
    const outer = createMultiPolygon([mapCoordinatesForTurf(boundry)]);
    const points = mapCoordinatesForTurf(
      polygonToCheck?.[0]?.[0] ? polygonToCheck?.[0] : polygonToCheck,
    )[0];
    const inner = createPointsCollection(points);
    const actionCoordinates = pointsWithinPolygon(inner, outer);
    return points?.length === actionCoordinates?.features?.length;
  };

  /**
   * @description Calculate center of polygon
   */
  const calculateCenter = (polygon) => {
    const data = [mapCoordinatesForTurf(polygon)];
    const multiPolygon = createMultiPolygon(data);
    return centerOfMass(multiPolygon).geometry.coordinates;
  };

  /**
   * @description handle delete polygon event.
   *
   */
  const onDeleteDrawing = () => {
    /**
     * when we delete something we enable the drawing control and set the active polygon to {}
     * We also the activePolygon which controls the selected item to undefined
     */
    // if (
    //   !isObjectEmpty(actionPolygon) &&
    //   activePolygonIndex.current &&
    //   actionPolygon?.uniqueId === activePolygonIndex?.current
    // ) {
    const filtered = polygons.filter(
      (_polygon, index) => polygons[index]?.uniqueId !== actionPolygon?.uniqueId,
    );
    /**
     * Once deleted, set the action polygon that controls delete button display to
     * {} so that delete icon gets hidden
     * Set the activepolygonindex that is used to indentify the polygon for label
     * and edit activity to undefined so we cant edit anything
     * Update formData
     * Set errorMessages
     */
    setPolygons(filtered);
    setActionPolygon({});
    activePolygonIndex.current = undefined;
    updateFormHandler(formDataKey, []);
    setErrorMessages((prev) => removeKey([formDataKey], prev));
    if (sameAsFranchise) {
      updateFormHandler('sameAsFranchise', false);
    }
  };

  /**
   * @description handle updates of polygon data when it is being dragged or edited.
   * @param {*} polygon
   * @param {*} index
   */
  const onEditPolygon = (polygon, index, skipCalculation = false) => {
    let error = false;
    const polygonRef = polygonRefs.current[index];
    let coordinates = [];
    if (polygonRef) {
      const allPolygons = [...polygons];
      if (!skipCalculation) {
        coordinates = polygonRef
          .getPath()
          .getArray()
          .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));
        /**
         * This updates the polygon label location, area and coordinates when it's updated
         */
        allPolygons[index].coordinates = coordinates;
        allPolygons[index].center = calculateCenter(coordinates);
        allPolygons[index].area = calculateArea(coordinates);
      } else {
        coordinates =
          allPolygons?.[index]?.coordinates && allPolygons?.[index]?.coordinates?.length
            ? allPolygons?.[index]?.coordinates
            : [];
        let calculatedCenter = coordinates?.length
          ? calculateCenter(coordinates?.[0]?.[0] ? coordinates?.[0] : coordinates)
          : allPolygons?.[index]?.markerLocation;
        let calculatedArea = coordinates?.length
          ? calculateArea(coordinates?.[0]?.[0] ? coordinates?.[0] : coordinates)
          : null;
        allPolygons[index].center = calculatedCenter;
        allPolygons[index].area = calculatedArea;
      }

      /**
       * This sets the controls to true when a polygon is selected
       */
      if (actionPolygon?.uniqueId === allPolygons[index]?.uniqueId) {
        allPolygons[index].options = {
          ...allPolygons[index].options,
          editable: createOrUpdate,
          draggable: createOrUpdate,
        };
        if (allPolygons?.[index]?.coordinates && allPolygons?.[index]?.coordinates?.length) {
          error = errorsInZoneEdgeCases(allPolygons[index]);
          if (childrenPolygons && childrenPolygons?.length && !error) {
            error = checkIfAllChildrensAreInsideActionItem(allPolygons[index], childrenPolygons);
          }

          /**
           * if the polygon has non-null siteLocation or franchiseLocation then check if the polygon is around
           * the marker when it is being moved
           */
          if (allPolygons[index][getMarkerKey(allPolygons[index])] && !error) {
            error = verifyMarkerLocationOnPolygonMovement(allPolygons[index]);
          }

          /**
           * update map UI
           */
          if (coordinates?.length && handlePolygonLinesIntersectionOnDrawingOrUpdate(coordinates)) {
            error = true;
            setErrorMessages((prev) => ({
              ...prev,
              [formDataKey]: `${t('sideNavBar.linkText.polygon')} ${t('errors.selfIntersection')}`,
            }));
          }

          if (!error) {
            setErrorMessages((prev) => removeKey([formDataKey], prev));
          }
          if (actionItemType === actionItemTypeKeys.zone) {
            activePolygonIndex.current = allPolygons[index]?.uniqueId;
            setShowLabel(true);
          }
          updateFormHandler(formDataKey, [allPolygons[index]?.coordinates]);
        }
      }
      /**
       * update formData
       */
      setPolygons(allPolygons);
    }
  };

  /**
   *
   * @param {*} data The polygon object
   * @param {*} overlap flag to identify the error type
   * @returns {String}
   */
  const returnValidErrorMessage = (
    data,
    overlap = false,
    insideParent = true,
    childrenError = false,
  ) => {
    if (data?.franchiseLocation && insideParent && !childrenError && overlap) {
      return t('errors.franchiseIntersecting', {
        label: t('sideNavBar.linkText.franchiseArea'),
      });
    }

    /**
     * if polygon has franchiseLocaton it means we are dealing with franchise and if not overlaping
     * then we are dealing with the issue where the franchise is not around the marker
     */
    if (data?.franchiseLocation && !overlap) {
      return t('errors.insideParent', { label: t('sideNavBar.linkText.franchiseArea') });
    }
    /**
     * if polygon does not have franchiseLocaton and siteLocation, it means we are dealing with zone if not overlaping
     * then we are dealing with the issue where the zone is not inside franchise area
     */
    if (!data?.siteLocation && !data?.franchiseLocation && !overlap) {
      return t('errors.zoneShouldBeInsideFranchise', {
        label: t('sideNavBar.linkText.zoneArea'),
      });
    }

    if (data?.zoneArea && childrenError) {
      return t('errors.zoneMustContainAllSites', {
        label: t('sideNavBar.linkText.zoneArea'),
      });
    }
    /**
     * if polygon does not have franchiseLocaton and siteLocation, it means we are dealing with zone if overlaping
     * then we are dealing with the issue where the zone is overlapping with other zones.
     */
    if (!data?.siteLocation && !data?.franchiseLocation && overlap) {
      return t('errors.zonesIntersecting', {
        label: t('sideNavBar.linkText.zoneArea'),
      });
    }
    if (data?.siteLocation && !overlap && insideParent) {
      return t('errors.markerNotInsideSiteLocation', {
        label: t('sideNavBar.linkText.siteArea'),
      });
    }
    if (data?.siteLocation && overlap && insideParent) {
      return t('errors.sitesIntersecting', {
        label: t('sideNavBar.linkText.siteArea'),
      });
    }
    if (data?.siteLocation && !overlap && !insideParent) {
      return t('errors.fallBackForOutsideBoundry', {
        label: t('sideNavBar.linkText.siteArea'),
      });
    }
    return t('errors.fallBackForOutsideBoundry');
  };

  /**
   *
   * @param {*} polygon
   */
  const verifyMarkerLocationOnPolygonMovement = (polygon) => {
    const res = pointIsInsideParent(polygon?.[getMarkerKey(polygon)], polygon);
    if (!res) {
      setErrorMessages((prev) => ({
        ...prev,
        [formDataKey]: returnValidErrorMessage(polygon),
      }));
      return true;
    }

    // setErrorMessages((prev) => removeKey([formDataKey], prev));
    return false;
  };

  /**
   * @description Loop over children and validate that they are inside parent
   * @param {*} actionItem
   * @param {*} children
   * @returns
   */
  const checkIfAllChildrensAreInsideActionItem = (actionItem, children) => {
    let childrenAreInside = false;

    for (const child of children) {
      childrenAreInside = checkIfPolygonIsInBoundry(
        actionItem?.coordinates?.[0]?.[0]
          ? actionItem?.coordinates
          : { ...actionItem, coordinates: [actionItem?.coordinates] },
        child?.coordinates,
      );
      if (!childrenAreInside) {
        setErrorMessages((prev) => ({
          ...prev,
          [formDataKey]: returnValidErrorMessage(child, false, childrenAreInside),
        }));
        break;
      }
    }

    return !childrenAreInside;
  };

  /**
   * @description check if child is not overlapping with siblings and is inside parent.
   * @param {*} childPolygon
   * @returns
   */
  const errorsInZoneEdgeCases = (childPolygon) => {
    /**
     * First verify if the zone is inside parent
     */
    if (parentBoundry && !isObjectEmpty(parentBoundry)) {
      const insideParent = checkIfPolygonIsInBoundry(parentBoundry, childPolygon?.coordinates);
      if (!insideParent) {
        setErrorMessages((prev) => ({
          ...prev,
          [formDataKey]: returnValidErrorMessage(childPolygon, false, insideParent),
        }));
        return true;
      }
    }
    /**
     * check intersection with siblings
     */
    if (siblings && siblings?.length) {
      let siblingsCoordinates = siblings
        ?.map((sibling) => sibling?.coordinates)
        ?.filter((item) => item?.length);
      let currentWithSiblings = [[childPolygon?.coordinates], ...siblingsCoordinates];
      const overlap = mapIsUpdated(currentWithSiblings);
      if (overlap) {
        setErrorMessages((prev) => ({
          ...prev,
          [formDataKey]: returnValidErrorMessage(childPolygon, true, true),
        }));
        return true;
      }
    }
    /**
     * sites will have a site location for the coordinates of a marker and check if the update site polygon
     * is around the marker coordinates
     */
    if (
      childPolygon?.[getMarkerKey(childPolygon)] &&
      !pointIsInsideParent(childPolygon?.[getMarkerKey(childPolygon)], childPolygon)
    ) {
      setErrorMessages((prev) => ({
        ...prev,
        [formDataKey]: returnValidErrorMessage(childPolygon, false, true),
      }));
      return true;
    }
    /**
     * If no errors unset the error
     */
    return false;
  };

  /**
   * @description terminate drawing control
   * @param {*} e
   */
  const attachMouseEvents = (e) => {
    if (e.keyCode === 27) {
      setCancelActiveDrawing(true);
      drawingManagerRef.current?.setDrawingMode(null); // To terminate the drawing, will result in autoclosing of the shape being drawn.
    }
  };

  /**
   * @description calculate the ratio of distance on zoom change
   * @param {*} currentZoom
   * @returns
   */
  const calculateOffset = (currentZoom) => {
    const baseOffset = 8.0;
    const exponentialFactor = 0.9; // Adjust this value based on your preference
    return baseOffset / Math.pow(2, exponentialFactor * (currentZoom - 1));
  };

  /**
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfo = (polygon = null, boolean) => {
    activePolygonIndex.current = polygon ? polygon?.uniqueId : null;
    setShowLabel(boolean);
    animationRef.current = false;
  };

  /**
   *
   * @param {*} polygon
   * @param {*} centerAreaKey
   * @param {*} labelKey
   * @param {*} i18Key
   * @param {*} optionType
   * @returns
   */
  const setObjectDetails = (
    polygon,
    centerAreaKey,
    labelKey,
    i18Key,
    optionType,
    isActionItem = false,
  ) => {
    let certainOption;
    const editAndDrag = createOrUpdate ? !createOrUpdate : false;
    const editables = { editable: editAndDrag, draggable: editAndDrag };
    switch (optionType) {
      case actionItemTypeKeys?.site:
        certainOption = {
          ...sitePolygonOptions,
          ...editables,
        };
        if (actionItemType === actionItemTypeKeys.site && !isObjectEmpty(actionItem)) {
          certainOption = { ...certainOption, fillColor: '#757575', strokeColor: '#757575' };
        }
        break;
      case actionItemTypeKeys?.zone:
        certainOption = {
          ...zonePolygonOptions,
          ...editables,
        };
        if (actionItemType === actionItemTypeKeys.zone && !isObjectEmpty(actionItem)) {
          certainOption = { ...certainOption, fillColor: '#757575', strokeColor: '#757575' };
        }
        break;
      case actionItemTypeKeys?.franchise:
        if (actionItemType === actionItemTypeKeys.franchise && !isObjectEmpty(actionItem)) {
          certainOption = { ...certainOption, fillColor: '#757575', strokeColor: '#757575' };
        }
        certainOption = {
          ...franchisePolygonOptions,
          ...editables,
        };
        break;
      default:
        certainOption = {};
        break;
    }

    const markerLocation = getMarkerKey(polygon);
    return {
      ...polygon,
      label: polygon?.[labelKey] ? polygon?.[labelKey] : i18Key,
      center: centerAreaKey?.length ? calculateCenter(centerAreaKey) : null,
      area: centerAreaKey?.length ? calculateArea(centerAreaKey) : null,
      uniqueId: polygon?.uniqueId ? polygon?.uniqueId : generateUniqueId(),
      options: certainOption,
      markerLocation: markerLocation ? polygon?.[markerLocation] : null,
      [markerLocation]: markerLocation ? polygon?.[markerLocation] : null,
      isActionItem: isActionItem ? true : false,
    };
  };

  /**
   * Get coordinates from API and add escape event listener
   */
  useEffect(() => {
    if (!isObjectEmpty(mapCenter)) {
      setCenter(mapCenter);
    } else {
      setCenter(defaultCenter);
    }

    window.addEventListener(KEY.DOWN, attachMouseEvents);
    let polygonArray = [];

    /**
     * draw franchises from the geoLocation API
     */
    if (franchiseData?.franchises?.length) {
      let updatedFranchises = franchiseData?.franchises?.map((franchise) => {
        return setObjectDetails(
          franchise,
          franchise?.coordinates?.[0],
          'franchiseName',
          t('commonText.newFranchise'),
          actionItemTypeKeys?.franchise,
        );
      });
      polygonArray = [...polygonArray, ...updatedFranchises];
    }

    /**
     * If franchise has zones then draw on map ( We are dealing with franchises but are drawing zones
     * also probably for siblings edge case)
     * zones are always inside a franchise not in a zone itself
     * and if we are catering with the zones prop then it means we are dealing with siblings of a zone
     */
    if (franchiseData?.zones?.length > 0) {
      let updatedZones = franchiseData?.zones?.map((zone) => {
        return setObjectDetails(
          zone,
          zone?.coordinates?.[0],
          'name',
          t('commonText.newZone'),
          actionItemTypeKeys?.zone,
        );
      });
      polygonArray = [...polygonArray, ...updatedZones];
    }

    /**
     * If we have sites then draw on map ( We are dealing with zones and sites)
     */
    if (!isEditingSite && franchiseData?.sites?.length) {
      let updatedSites = franchiseData?.sites?.map((site) => {
        return setObjectDetails(
          site,
          site?.coordinates?.[0],
          'name',
          t('commonText.newSite'),
          actionItemTypeKeys?.site,
        );
      });
      polygonArray = [...polygonArray, ...updatedSites];
    }

    // }

    /**
     * actionItem shows that you are editing an existing polygon (not creating a new one)
     */
    if (actionItem) {
      /**
       * zoneArea are the coordinates of the zone and is a zone,
       * this means we are dealing with a zone action item (updating a zone)
       */
      if (actionItem?.zoneArea?.length > 0) {
        let tempObj = setActiveItemObject(
          actionItem,
          'name',
          'zoneArea',
          actionItemTypeKeys.zone,
          zonePolygonOptions,
        );
        if (actionItem?.sameAsFranchise) {
          tempObj = {
            ...tempObj,
            options: { ...tempObj.options, editable: false, draggable: false },
          };
        }
        polygonArray = [...polygonArray, tempObj];
      }

      /**
       * If actionItem is a franchise
       */
      if (actionItem?.franchiseArea) {
        polygonArray = [
          ...polygonArray,
          setActiveItemObject(
            actionItem,
            'franchiseName',
            'franchiseArea',
            actionItemTypeKeys.franchise,
            franchisePolygonOptions,
          ),
        ];
        // polygonArray = [...polygonArray, updatedActionItem];
      }

      /**
       * If action item is a site
       */
      if (actionItem?.siteArea) {
        polygonArray = [
          ...polygonArray,
          setActiveItemObject(
            actionItem,
            'name',
            'siteArea',
            actionItemTypeKeys.site,
            sitePolygonOptions,
          ),
        ];
      }
    }

    setPolygons(polygonArray);

    /**
     * If user is sending some polygon (edit case) then set the local state equal to that so that it's can be identified using uniqueId
     */
    if (isObjectEmpty(actionPolygon)) {
      let polygonToDealWith;
      polygonArray.forEach((polygon) => {
        /**
         * if franchiseName is not there and the user has passed zone as actionitemtype it means we are dealing with zones
         */
        if (
          (actionItemType === actionItemTypeKeys.zone && polygon?.id === actionItem?.id) ||
          (polygon?.franchiseArea && actionItem?.id === polygon?.id) ||
          (actionItemType === actionItemTypeKeys?.site &&
            actionItem?.id === polygon?.id &&
            polygon?.siteArea)
        ) {
          polygonToDealWith = { ...actionItem, uniqueId: polygon?.uniqueId };
        }
      });
      setActionPolygon(polygonToDealWith);
    }
    return () => {
      window.removeEventListener(KEY.DOWN, attachMouseEvents);
    };
  }, []);

  /**
   * @description set the props for objects sent as actionItems (editable and creatables)
   * @param {*} actionObject
   * @param {*} nameProp
   * @param {*} areaPropKey
   * @param {*} labelKey
   * @param {*} polygonOptionObject
   * @returns
   */
  const setActiveItemObject = (
    actionObject,
    nameProp,
    areaPropKey,
    labelKey,
    polygonOptionObject,
  ) => {
    let tempObject = {
      ...actionObject,
      coordinates: actionObject?.[areaPropKey],
    };
    const markerLocation = getMarkerKey(tempObject);
    return {
      ...tempObject,
      isActionItem: true,
      label: tempObject?.[nameProp] ? tempObject?.[nameProp] : getNewLabel(labelKey),
      uniqueId: tempObject?.uniqueId ? tempObject?.uniqueId : generateUniqueId(),
      area: tempObject?.coordinates?.[0] ? calculateArea(tempObject?.coordinates?.[0]) : null,
      center: tempObject?.coordinates?.[0] ? calculateCenter(tempObject?.coordinates?.[0]) : null,
      options: {
        ...polygonOptionObject,
        editable: createOrUpdate ? createOrUpdate : false,
        draggable: createOrUpdate ? createOrUpdate : false,
      },
      markerLocation: markerLocation ? tempObject[markerLocation] : null,
    };
  };

  /**
   * @description get key that would represent the marker Location prop of the polygon
   * @param {*} polygon
   * @returns
   */
  const getMarkerKey = (polygon) => {
    for (let key in polygon) {
      const data = polygonlocationTypes.find((item) => item == key);
      if (data) {
        return data;
      }
    }
    return null;
  };

  /**
   * @description get key that would represent the name prop of the polygon
   * @param {*} polygon
   * @returns
   */
  const getNameKey = (polygon) => {
    for (let key in polygon) {
      const data = polygonNameOptions.find((item) => item == key);
      if (data) {
        return data;
      }
    }
    return null;
  };

  /**
   *
   * @param {*} labelKey
   * @returns {string}
   */
  const getNewLabel = (labelKey) => {
    let res;
    switch (labelKey) {
      case actionItemTypeKeys?.site:
        res = t('commonText.newSite');
        break;
      case actionItemTypeKeys?.zone:
        res = t('commonText.newZone');
        break;
      case actionItemTypeKeys?.franchise:
        res = t('commonText.newFranchise');
        break;
      default:
        res = 'N/A';
        break;
    }
    return res;
  };

  /**
   * this useffect should handle the coordinates of the zone if same as franchise checkbox is set to true
   */
  useEffect(() => {
    /**
     * same as franchise is only available for zones so we need to verify that we are playing with zones, there is a valid parent boundry
     * and it has it's own boundry too
     */
    if (
      sameAsFranchise &&
      parentBoundry &&
      parentBoundry?.coordinates?.length > 0 &&
      polygons?.length && //this check helps in not running this code on initial render
      actionItemType === actionItemTypeKeys?.zone
    ) {
      let data = {
        ...actionItem,
        uniqueId: generateUniqueId(),
      };
      let updatedActionItem = {
        ...data,
        isActionItem: true,
        ...setObjectDetails(
          data,
          parentBoundry?.coordinates?.[0],
          'name',
          t('commonText.newZone'),
          actionItemTypeKeys.zone,
          true,
        ),
        coordinates: parentBoundry?.coordinates?.[0],
      };
      /**
       * manually enabling the control due to lack of time for release
       */
      updatedActionItem = {
        ...updatedActionItem,
        options: {
          ...updatedActionItem.options,
          draggable: false,
          editable: false,
        },
      };
      if (parentBoundry && !isObjectEmpty(parentBoundry)) {
        errorsInZoneEdgeCases(updatedActionItem);
      }
      /**
       * update form data
       */
      updateFormHandler(formDataKey, parentBoundry?.coordinates);
      /**
       * This would help us set the Unique id of the polygon so that errors would work
       */
      setActionPolygon(updatedActionItem);
      /**
       * update UI of map
       */
      const updatePolygonsOnMap = [
        ...(polygons?.filter((polygon) => !polygon?.isActionItem) ?? []),
        updatedActionItem,
      ];
      setPolygons(updatePolygonsOnMap);
      activePolygonIndex.current = updatedActionItem?.uniqueId;
    }
    if (
      !sameAsFranchise &&
      parentBoundry &&
      parentBoundry?.coordinates?.length > 0 &&
      actionItemType === actionItemTypeKeys?.zone &&
      polygons?.length
    ) {
      /**
       * before it's clicked, set the delete ref
       */
      activePolygonIndex.current = actionPolygon?.uniqueId;
      onDeleteDrawing();
    }
  }, [sameAsFranchise]);

  /**
   * @description convert array of coordinates lat, long object to array of arrays
   * @param {*} input
   * @returns
   */
  const mapCoordinatesForTurf = (input) => {
    const coordinates = input?.coordinates ? input?.coordinates : [input];
    return coordinates?.map((data) => {
      return data?.map((coordinates) => [coordinates.lat, coordinates.lng]);
    });
  };

  /**
   * @description check if the point is inside polygon
   * @param {*} point
   * @param {*} polygon
   * @returns
   */
  const pointIsInsideParent = (point, polygon) => {
    /**
     * if marker location for polyon is set from franchiseLocation,siteLocation or zoneLocation then use that else use center
     */
    return booleanPointInPolygon(
      createTurfPoint([point?.lat, point?.lng]),
      createMultiPolygon([[polygon?.coordinates?.map((cord) => [cord?.lat, cord?.lng])]]),
    );
  };

  /**
   * @description convert array of coordinates of lat long for intersection
   * @param {*} input
   * @returns
   */
  const mapCoordinatesForIntersection = (input) => {
    return input.map((data) => {
      return data?.[0]?.map((coordinates) => [coordinates.lat, coordinates.lng]);
    });
  };

  /**
   * @description check if polygons are intersecting.
   * @param {*} polygons
   * @returns
   */
  const mapIsUpdated = (polygons) => {
    if (polygons?.length === 0) {
      return false;
    }
    const dataSet = mapCoordinatesForIntersection(polygons);
    for (let i = 0; i < dataSet?.length - 1; i++) {
      for (let j = i + 1; j < dataSet?.length; j++) {
        let result = booleanIntersects(
          createMultiPolygon([[dataSet[i]]]),
          createMultiPolygon([[dataSet[j]]]),
        );
        if (result) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * @description toggle drawing board controls
   * @returns
   */
  const toggleDrawingBoardOptions = () => {
    if (
      (createOrUpdate && isObjectEmpty(actionPolygon)) ||
      (createOrUpdate && !actionPolygon?.coordinates?.length) // this shows the marker only when we still hab eto craeted the coordinates of the site or franchise
    ) {
      return { ...drawingManagerOptions, drawingControl: true };
    }

    if (!createOrUpdate || (createOrUpdate && !isObjectEmpty(actionPolygon))) {
      return { ...drawingManagerOptions, drawingControl: false };
    }
    return drawingManagerOptions;
  };

  /**
   * Hide everything if there is no center
   */
  if (isObjectEmpty(center)) {
    return null;
  }
  /**
   * if a polygon is drawn, or being edited
   */
  // const showDeleteButton = !isObjectEmpty(actionPolygon) && createOrUpdate ? createOrUpdate : false;
  const deleteButtonView =
    drawingManagerRef?.current &&
    actionItemType &&
    actionItemType !== actionItemTypeKeys?.site &&
    actionItemType !== actionItemTypeKeys?.franchise &&
    polygons?.length > 0 &&
    !isObjectEmpty(actionPolygon) &&
    createOrUpdate
      ? createOrUpdate
      : false;

  /**
   *  @description update drawing controls, this fixes the flickers
   */
  const showDrawingControls = useMemo(() => {
    return toggleDrawingBoardOptions();
  }, [createOrUpdate, JSON.stringify(actionPolygon), JSON.stringify(drawingManagerOptions)]);
  const mapsApiVersionParts = window.google?.maps?.version
    ?.split('.')
    .map((versionPart) => Number(versionPart));
  const isUnsupportedDrawingVersion =
    mapsApiVersionParts?.[0] === 3 && mapsApiVersionParts?.[1] >= 65;
  const shouldRenderDrawingManager =
    showDrawingControls?.drawingControl &&
    !isUnsupportedDrawingVersion &&
    window.google?.maps?.drawing?.DrawingManager &&
    window.google?.maps?.drawing?.OverlayType?.POLYGON;

  /**
   *  @description update franchise polygon color if dealing with zones
   */
  // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
  // eslint-disable-next-line no-unused-vars
  const modifiedPolygons = useMemo(() => {
    if (polygons?.length) {
      return polygons.map((singlePolygon) => {
        if (actionItemType === actionItemTypeKeys?.zone && singlePolygon?.franchiseLocation) {
          return {
            ...singlePolygon,
            options: {
              ...singlePolygon.options,
              fillColor: '#EC7063',
            },
          };
        }
        return singlePolygon;
      });
    } else {
      return [];
    }
  }, [polygons, actionItemType, actionItemTypeKeys]);

  /**
   * @description When only franchise marker is there to show
   */
  // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
  // eslint-disable-next-line no-unused-vars
  const singleUniqueId = useMemo(() => {
    if (!polygons?.length && !isObjectEmpty(center)) {
      return generateUniqueId();
    }
    return null;
  }, [polygons, center, generateUniqueId, isObjectEmpty]);
  const currentMode = drawingManagerRef?.current ? drawingManagerRef?.current?.drawingMode : null;

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
          // Let consumers refresh derived address fields (country/state/city/postal).
          addressComponents: result?.address_components || [],
        };

        setPolygons((prev) => {
          const updatedPolygons = prev.map((polygon) => {
            if (actionPolygon?.id === polygon?.id) {
              return {
                ...polygon,
                address: locationName,
                markerLocation: newLocation.position,
              };
            }
            return polygon;
          });
          return updatedPolygons;
        });
        // Update the selectedLocation state with the details of the drag and dropped location
        updateMapValue?.(null, newLocation);
        setErrorMessages?.((prev) => ({
          ...prev,
          [formDataKey]: null,
        }));
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

  useEffect(() => {
    if (!selectedLocation?.id) return;

    setPolygons((prev) => {
      const updatedPolygons = prev.map((polygon) => {
        if (actionPolygon?.id === polygon?.id) {
          return {
            ...polygon,
            address: selectedLocation?.name,
            markerLocation: selectedLocation.position,
          };
        }
        return polygon;
      });
      return updatedPolygons;
    });
    setCenter(selectedLocation?.position);
    setErrorMessages?.((prev) => ({
      ...prev,
      [formDataKey]: null,
    }));
  }, [selectedLocation?.id]);

  return (
    isLoaded &&
    !isObjectEmpty(center) && (
      <div className="map-container" style={{ position: 'relative', width: '100%' }}>
        {deleteButtonView && (
          <div
            onClick={onDeleteDrawing}
            title={t('commonText.deleteShape')}
            style={deleteIconStyle}
          ></div>
        )}
        <GoogleMap
          zoom={zoom}
          center={center}
          onLoad={(map) => {
            onLoadMap();
            setMap(map);
          }}
          mapContainerStyle={containerStyle}
          onZoomChanged={() => {
            if (map) {
              setZoom(map.getZoom());
            }
          }}
          // onTilesLoaded={}
        >
          {shouldRenderDrawingManager && (
            <DrawingManager
              onLoad={onLoadDrawingManager}
              onOverlayComplete={onOverlayComplete}
              options={showDrawingControls}
            />
          )}

          {polygons?.length &&
            polygons?.map((polygon, index) => {
              const showPolygonLabel =
                activePolygonIndex?.current === polygon?.uniqueId && showLabel && !currentMode;
              return (
                <React.Fragment key={index}>
                  <Polygon
                    key={polygon?.uniqueId || id}
                    onLoad={(event) => onLoadPolygon(event, index)}
                    onMouseDown={() => onClickPolygon(polygon)}
                    onMouseUp={() => onEditPolygon(polygon, index)}
                    onDragEnd={() => onEditPolygon(polygon, index)}
                    options={polygon?.options}
                    paths={polygon?.coordinates}
                    draggable={polygon?.draggable}
                    editable={polygon?.editable}
                  />
                  {polygon?.markerLocation && polygon?.siteLocation && (
                    <Marker
                      key={polygon?.id}
                      draggable={isSitePinDraggable && actionPolygon?.id === polygon?.id}
                      onMouseOver={() => {
                        setActiveMarker?.(polygon?.id);
                        updateLabelInfo(polygon, true);
                      }}
                      onMouseOut={() => {
                        setActiveMarker?.(null);
                        updateLabelInfo(null, false);
                      }}
                      onDrag={() => updateLabelInfo(null, false)}
                      onDragEnd={handleMarkerDragEnd}
                      onClick={(_e) => {
                        if (window.location.pathname.includes('/zones/zonesDetail')) {
                          history.push(`${OBX_SITES_DETAIL}/${polygon?.id}`);
                          return;
                        }
                        onClickPolygon(polygon);
                        onEditPolygon(polygon, index, true);
                      }}
                      animation={
                        actionItemType !== actionItemTypeKeys.zone &&
                        JSON.stringify(polygon?.markerLocation) == JSON.stringify(mapCenter) &&
                        animationRef.current
                          ? google.maps.Animation.BOUNCE
                          : null
                      }
                      position={polygon?.markerLocation}
                      icon={{
                        scaledSize: new google.maps.Size(26, 37),
                        url: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
                      }}
                    ></Marker>
                  )}
                  {polygon?.markerLocation && polygon?.franchiseLocation && (
                    <Marker
                      onMouseOver={() => updateLabelInfo(polygon, true)}
                      onMouseOut={() => updateLabelInfo(null, false)}
                      onClick={() => {
                        onClickPolygon(polygon);
                        onEditPolygon(polygon, index, true);
                      }}
                      animation={
                        actionItemType !== actionItemTypeKeys.zone &&
                        JSON.stringify(polygon?.markerLocation) == JSON.stringify(mapCenter) &&
                        animationRef.current
                          ? google.maps.Animation.BOUNCE
                          : null
                      }
                      key={polygon?.id}
                      position={polygon?.markerLocation}
                      icon={{
                        scaledSize: new google.maps.Size(26, 37),
                        url: 'https://signalassets.blob.core.windows.net/signal/assets/FranchisesPin.svg',
                      }}
                    ></Marker>
                  )}
                  {showPolygonLabel &&
                    (() => {
                      return (
                        <InfoWindow
                          position={
                            polygon?.markerLocation
                              ? {
                                  lat: polygon?.markerLocation.lat + calculateOffset(zoom),
                                  lng: polygon?.markerLocation.lng,
                                }
                              : {
                                  lat: polygon?.center?.[0] + calculateOffset(zoom),
                                  lng: polygon?.center?.[1],
                                }
                          }
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                          }}
                          onCloseClick={() => setActiveMarker?.(null)}
                        >
                          <>
                            <div>
                              <div>
                                {polygon?.id && `${polygon?.id} -`}
                                {polygon?.label}
                              </div>
                              {polygon?.area && (
                                <div>
                                  {polygon?.area} {t('commonText.squareMeter')}
                                </div>
                              )}
                            </div>
                          </>
                        </InfoWindow>
                      );
                    })()}
                </React.Fragment>
              );
            })}
          {/* <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
          <input type="text" placeholder="Search Location" style={autocompleteStyle} />
        </Autocomplete> */}
          {/* {singleUniqueId && <Marker key={singleUniqueId} position={mapCenter}></Marker>} */}
        </GoogleMap>
        {errorMessages?.[formDataKey] && (
          <Stack sx={{ width: '100%', marginTop: '6px' }} className="Mui-error" spacing={2}>
            <Alert severity="error">{errorMessages?.[formDataKey]}</Alert>
          </Stack>
        )}
      </div>
    )
  );
};

MapComponent.propTypes = {
  /**
   * object containing franchise details including franchiseArea (array of coordinates)
   */
  franchiseArea: PropTypes.shape({
    franchiseArea: PropTypes.any,
    zoneArea: PropTypes.any,
  }),
  formDataKey: PropTypes.string.isRequired,
  updateFormHandler: PropTypes.func.isRequired,
  errorMessages: PropTypes.object.isRequired,
  setErrorMessages: PropTypes.func.isRequired,

  /**
   * whether we are creating or updating a polygon
   */
  createOrUpdate: PropTypes.bool.isRequired,

  /**
   * actionItemType identifies whether we are working with zones or franchises
   */
  actionItemType: PropTypes.oneOf([
    actionItemTypeKeys?.franchise,
    actionItemTypeKeys?.zone,
    actionItemTypeKeys?.site,
  ]),

  /**
   * actionItem indicates the item or polygon we are dealing with, it is usually the formData itself having (franchiseArea and zones (both) incase of francises and zoneArea incase of zone)
   */
  actionItem: PropTypes.object,
  mapCenter: PropTypes.shape({
    lat: PropTypes.any,
    lng: PropTypes.any,
  }),
  sameAsFranchise: PropTypes.bool,
  parentBoundry: PropTypes.shape({
    franchiseArea: PropTypes.any,
    zoneArea: PropTypes.any,
    coordinates: PropTypes.any,
  }),
  siblings: PropTypes.array,
  franchiseData: PropTypes.array.isRequired,
  childrenPolygons: PropTypes.array,
  setActiveMarker: PropTypes.func,
  selectedLocation: PropTypes.object,
  updateMapValue: PropTypes.func,
  isSitePinDraggable: PropTypes.bool,
  isEditingSite: PropTypes.bool,
};

export default React.memo(MapComponent);
