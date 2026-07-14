import { Box, Button, Drawer, Modal, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { GoogleMap, InfoWindow, Marker, Polygon, useJsApiLoader } from '@react-google-maps/api';
import area from '@turf/area';
import centerOfMass from '@turf/center-of-mass';
import { multiPolygon as createMultiPolygon } from '@turf/helpers';
import { ReactComponent as AddLocationIcon } from 'assets/icons/addLocationIcon.svg?react';
import { ReactComponent as BlackCircleIcon } from 'assets/icons/blackCircleIcon.svg?react';
import { ReactComponent as BlueCircleIcon } from 'assets/icons/cirlceIcon.svg?react';
import { ReactComponent as HomeIcon } from 'assets/icons/franchiseIcon.svg?react';
import { ReactComponent as GreenCircleIcon } from 'assets/icons/greencircle.svg?react';
import {
  ReactComponent as PlusIcon,
  ReactComponent as PlusMapIcon,
} from 'assets/icons/PlusMapIcon.svg';
import { ReactComponent as RedCircleIcon } from 'assets/icons/redcirlce.svg?react';
import MapImage from 'assets/images/map.png';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { HO_FRANCHISE_DETAIL, SALES_LOCATION } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { ReactComponent as CheckBoxRegularIcon } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxCheckedIcon } from 'src/assets/svg/checkbox-checked.svg?react';
import { getLocationAddressFromGoogle } from 'src/services/googleMap.service';
import { getCompaniesOption } from 'src/services/location.service';
import {
  colorCodesLocation,
  defaultMapZoom,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  leadsMapCreateLocationMarker,
  leadsMapLocationsIcons,
  polygonlocationTypes,
  toastSettings,
} from 'src/utils/constants';
import { companiesPaginationEmptyState } from 'src/utils/constants/emptyStates/companiesPagination';
import { toaster } from 'src/utils/toast';

import {
  generateUniqueId,
  getPlacesDetail,
  isObjectEmpty,
} from '../../../../helper/utilityFunctions';
import NewLocationDrawer from '../../salesComponents/locations/newLocationsDrawer';
import { locationDrawerTypes } from '../../salesComponents/locations/newLocationsDrawer/location.constant';
import GoogleMapSearchAddressComponent from '../googleMap/searchAddress';
import { useStyles } from './leadsMap';

/**
 * Default center if can't get location of user.
 */
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

/**
 * constant values.
 */
export const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
  franchiseName: 'franchiseName',
  sitePin: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
  franchisePin: 'https://signalassets.blob.core.windows.net/signal/assets/FranchisesPin.svg',
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
  strokeWeight: 0,
  draggable: true,
  editable: true,
};

const containerStyle = {
  width: '100%',
  height: 'calc(100dvh - 60px)',
};

/**
 * @description Pillar Component of the project and if you are here to edit this, then RIP in advance. :)
 * @param {Object} mapCenter object that shows the center of the map
 * @param {Object} franchiseData object containing franchises, zones and sites along with the actionItem's parentId.
 * @returns
 */
const CommonLeadsMap = (props) => {
  const { franchiseData = [], mapCenter = {}, refetch = () => {} } = props;

  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState({
    first: false,
    second: false,
  });
  const showPopup = () => {
    setCreateMode(true);
    setIsVisible((prev) => ({ ...prev, first: true }));

    setTimeout(() => {
      setIsVisible((prev) => ({ ...prev, first: false, second: true }));
    }, 3000);
  };
  const mapRef = useRef();
  const polygonRefs = useRef([]);
  const activePolygonIndex = useRef();

  const showToolTipRef = useRef();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const userRole = useSelector((state) => state.auth.userRole);

  const [selectedMarkerLocation, setSelectedMarkerLocation] = useState(null);
  const [selectedLocationModalInfo, setSelectedLocationModalInfo] = useState(null);
  /**
   * all the polygons that are shown on map are these
   */
  const [polygons, setPolygons] = useState([]);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [createMode, setCreateMode] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    new: true,
    old: true,
    lost: true,
    existing: true,
    franchises: true,
    boundry: false,
  });
  const [searchAddress, setSearchAddress] = useState('');
  const [center, setCenter] = useState(defaultCenter);
  const [companies, setCompanies] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [zoom, setZoom] = useState(defaultMapZoom);
  const classes = useStyles();
  const [map, setMap] = useState(null);
  const [showLabel, setShowLabel] = useState(false);
  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);
  const openDrawer = () => setDrawer(true);
  const onLoadPolygon = useCallback((polygon, index) => {
    polygonRefs.current[index] = polygon;
  }, []);
  const [companiesPagination, setCompaniesPagination] = useState(companiesPaginationEmptyState);
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

  /**
   * @description calculate the area of each polygon
   * @param {*} polygon
   * @returns
   */
  const calculateArea = (polygon) => {
    return area(createMultiPolygon([mapCoordinatesForTurf(polygon)])).toFixed(2);
  };

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

  const handleMarkerHoverIn = (polygon, status) => {
    updateLabelInfo(polygon, status);
    showToolTipRef.current = true;
    setHoverTimer(null);
  };

  const handleMarkerHoverOut = (polygon, boolean) => {
    const timerId = setTimeout(() => {
      if (!showToolTipRef.current) {
        updateLabelInfo(polygon, boolean);
      }
    }, 1500);
    setHoverTimer(timerId); // Store the timer ID
    showToolTipRef.current = false;
  };

  const handleInfoWindowHover = (polygon, status) => {
    clearTimeout(hoverTimer);
    setHoverTimer(null);
    showToolTipRef.current = true;
    updateLabelInfo(polygon, status);
  };

  const handleToolTipMouseOut = (polygon, status) => {
    updateLabelInfo(polygon, status);
    showToolTipRef.current = false;
    setHoverTimer(null); // Store the timer ID
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
   * @description Update show label and active item index value ref
   * @param {*} polygon
   * @param {*} boolean
   */
  const updateLabelInfo = (polygon = null, boolean) => {
    activePolygonIndex.current = polygon ? polygon?.uniqueId : null;
    setShowLabel(boolean);
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
    const editables = { editable: false, draggable: false };
    switch (optionType) {
      case actionItemTypeKeys?.site:
        certainOption = {
          ...sitePolygonOptions,
          ...editables,
        };
        break;
      case actionItemTypeKeys?.zone:
        certainOption = {
          ...zonePolygonOptions,
          ...editables,
        };
        break;
      case actionItemTypeKeys?.franchise:
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
      polyLineCoordinates:
        polygon?.coordinates?.length > 0 ? createPolylineCoordinates(polygon?.coordinates) : [],
    };
  };

  /**
   * Fetch companies listing
   */
  const fetchCompanies = async (refetch = false) => {
    try {
      const response = await getCompaniesOption(companiesPagination?.currentPage + 1);
      if (response.statusCode === 200) {
        if (refetch && response?.data?.companies?.length) {
          setCompanies((prevCompanies) => [...prevCompanies, ...response.data.companies]);
        } else {
          setCompanies(response?.data?.companies);
        }
        // setCompanies(response?.data?.companies);
        setCompaniesPagination(response?.pagination);
      }
    } catch (error) {
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

  /**
   * @description calculate the ratio of distance on zoom change
   * @param {*} currentZoom
   * @returns
   */
  const calculateOffset = (currentZoom) => {
    const baseOffset = 8.0;
    const exponentialFactor = 0.95; // Adjust this value based on your preference

    return baseOffset / Math.pow(2, exponentialFactor * (currentZoom - 1));
  };

  function createPolylineCoordinates(coordinates) {
    const closedCoordinates = [...coordinates, coordinates[0]]; // Add the first coordinate to the end
    return closedCoordinates.map((coord) => ({ lat: coord.lat, lng: coord.lng }));
  }

  const updateMapValue = async (name, value) => {
    if (value) {
      setSearchAddress(value.name);
      setSelectedMarkerLocation(value.position);
      const response = await getLocationAddressFromGoogle(value.position);
      if (response?.length) {
        const result = response[0];
        const details = await getPlacesDetail(result.place_id);
        details.coordinates = value.position;
        changeMapCenter(details);
        setSelectedLocationModalInfo(details);
      }
    }
  };

  const handleMapClick = async (event) => {
    if (!createMode && !searchAddress) {
      return;
    }
    if (searchAddress && !createMode) {
      setSelectedLocationModalInfo(null);
    }
    const { latLng } = event;
    const latitude = latLng.lat();
    const longitude = latLng.lng();
    let payload = { lat: latitude, lng: longitude };
    try {
      const response = await getLocationAddressFromGoogle(payload);
      if (response?.length) {
        const result = response[0];
        const details = await getPlacesDetail(result.place_id);
        details.coordinates = { lat: latitude, lng: longitude };
        changeMapCenter(details);
        setSelectedLocationModalInfo(details);
        setSearchAddress(details?.formatted_address);
      }
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  async function changeMapCenter(data) {
    if (map) {
      await map.panTo(data.coordinates);
      setSelectedMarkerLocation(data.coordinates);
    }
  }

  const handleCreateLocationMarkerClick = () => {
    map.panTo(selectedMarkerLocation);
    setTimeout(() => {
      setShowModal(true);
    }, 500);
  };

  const resetData = () => {
    setDrawer(false);
    refetch();
  };

  const cleanSelection = () => {
    setCreateMode(false);
    setIsVisible((prev) => ({ ...prev, first: false, second: false }));
    setSearchAddress('');
    setSelectedLocationModalInfo(null);
    setSelectedMarkerLocation(null);
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

    let polygonArray = [];
    let locations = [];
    /**
     * draw franchises from the geoLocation API
     */
    if (franchiseData?.franchises?.length) {
      let updatedFranchises = franchiseData?.franchises
        ?.filter((data) => data?.franchiseLocation?.lat && data?.franchiseLocation?.lng)
        .map((franchise) =>
          setObjectDetails(
            franchise,
            franchise?.coordinates?.[0],
            'name',
            t('commonText.newFranchise'),
            actionItemTypeKeys?.franchise,
          ),
        );
      polygonArray = [...polygonArray, ...updatedFranchises];
    }

    if (franchiseData?.existing?.length) {
      locations = [
        ...locations,
        ...(franchiseData?.existing?.map((data) =>
          makeLocationObject(data, colorCodesLocation.existing.key),
        ) || []),
      ];
    }
    if (franchiseData?.lost?.length) {
      locations = [
        ...locations,
        ...(franchiseData?.lost.map((data) =>
          makeLocationObject(data, colorCodesLocation.lost.key),
        ) || []),
      ];
    }
    if (franchiseData?.new?.length) {
      locations = [
        ...locations,
        ...(franchiseData?.new?.map((data) =>
          makeLocationObject(data, colorCodesLocation.new.key),
        ) || []),
      ];
    }
    if (franchiseData?.old?.length) {
      locations = [
        ...locations,
        ...(franchiseData?.old?.map((data) =>
          makeLocationObject(data, colorCodesLocation.old.key),
        ) || []),
      ];
    }

    fetchCompanies();
    setPolygons(polygonArray);
    setLocations(locations);
  }, []);

  const makeLocationObject = (location, type) => {
    let newObj = { ...location, uniqueId: generateUniqueId() };
    switch (type) {
      case colorCodesLocation.new.key:
        newObj = {
          ...newObj,
          color: colorCodesLocation.new.value,
          markerIcon: leadsMapLocationsIcons.new,
          type: colorCodesLocation.new.key,
        };
        break;
      case colorCodesLocation.old.key:
        newObj = {
          ...newObj,
          color: colorCodesLocation.old.value,
          markerIcon: leadsMapLocationsIcons.old,
          type: colorCodesLocation.old.key,
        };
        break;
      case colorCodesLocation.lost.key:
        newObj = {
          ...newObj,
          color: colorCodesLocation.lost.value,
          markerIcon: leadsMapLocationsIcons.lost,
          type: colorCodesLocation.lost.key,
        };
        break;
      case colorCodesLocation.existing.key:
        newObj = {
          ...newObj,
          color: colorCodesLocation.existing.value,
          uniqueId: generateUniqueId(),
          markerIcon: leadsMapLocationsIcons.existing,
          type: colorCodesLocation.existing.key,
        };
        break;
      default:
    }
    return newObj;
  };

  const goToLocation = (data) => {
    history.push(`${SALES_LOCATION}/${data?.id}`);
  };

  const goToFranchise = (data) => {
    history.push(`${HO_FRANCHISE_DETAIL}/${data?.id}`);
  };

  /**
   * Hide everything if there is no center
   */
  if (!center) {
    return null;
  }

  const populatefilteredLocations = useMemo(() => {
    let finalLocations = {
      old: [],
      new: [],
      lost: [],
      existing: [],
    };
    locations?.map((data) => {
      if (filters.new && data?.type === colorCodesLocation.new.key) {
        finalLocations = { ...finalLocations, new: [...finalLocations.new, data] };
      }
      if (filters.old && data?.type === colorCodesLocation.old.key) {
        finalLocations = { ...finalLocations, old: [...finalLocations.old, data] };
      }
      if (filters.existing && data?.type === colorCodesLocation.existing.key) {
        finalLocations = { ...finalLocations, existing: [...finalLocations.existing, data] };
      }
      if (filters.lost && data?.type === colorCodesLocation.lost.key) {
        finalLocations = { ...finalLocations, lost: [...finalLocations.lost, data] };
      }
    });
    return finalLocations;
  }, [filters, locations?.length]);
  const finalCenter = !isObjectEmpty(center) ? center : mapCenter;
  return (
    isLoaded &&
    !isObjectEmpty(center) && (
      <>
        <Box className={classes.mainMapSection}>
          <Box className={classes.leftMapSection}>
            {isLoaded && (
              <GoogleMapSearchAddressComponent
                placeHolder={t('sales.locations.searchByAddress')}
                formKey={'address'}
                setAddress={setSearchAddress}
                address={searchAddress}
                updateMapValue={updateMapValue}
                setActiveMarker={setSelectedMarkerLocation}
                setSelectedLocation={() => {}}
                setCenter={setCenter}
                isLoaded={isLoaded}
                collapseSearch={() => {}}
                isUsedInMap={true}
              />
            )}
            {/* <ToggleButtonGroup
              exclusive
              value={createMode}
              className={classes.calendarHeaderToolbarToggle}
            >
              <ToggleButton
                className={classes.calendarHeaderToolbarToggleBtn}
                onClick={() => {
                  setSelectedMarkerLocation(null);
                  setCreateMode(false);
                }}
                value={false}
              >
                Signal Network
              </ToggleButton>
              <ToggleButton
                className={classes.calendarHeaderToolbarToggleBtn}
                onClick={() => {
                  setCreateMode(true);
                  setSelectedMarkerLocation(null);
                }}
                value={true}
              >
                Create Location
                <ToggleIcon />
              </ToggleButton>
            </ToggleButtonGroup> */}
          </Box>
        </Box>
        <Box className={classes.rightMapSection}>
          <Box>
            <Box className={classes.leadsMapSection}>
              <Box className={classes.internalMapBox}>
                <Checkbox
                  checked={filters?.franchises}
                  // className={classes.chekBoxMap}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, franchises: !prev?.franchises }));
                  }}
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}>
                  {t('sideNavBar.linkText.franchise')}
                </Typography>
              </Box>
              {/* <Box className={classes.internalMapBox}>
                <Checkbox
                  checked={filters?.boundry}
                  className={classes.chekBoxMap}
                  disabled
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, boundry: !prev?.boundry }));
                  }}
                />
                <Typography className={classes.checkBoxText}>
                  {t('commonText.franchiseBoundry')}
                </Typography>
              </Box> */}
              <Box className={classes.internalMapBox}>
                <Checkbox
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, new: !prev?.new }));
                  }}
                  checked={filters?.new}
                  // className={classes.chekBoxMap}
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}> {t('commonText.new')}</Typography>
              </Box>
              <Box className={classes.internalMapBox}>
                <Checkbox
                  checked={filters?.old}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, old: !prev?.old }));
                  }}
                  // className={classes.chekBoxMap}
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}> {t('commonText.old')}</Typography>
              </Box>
              <Box className={classes.internalMapBox}>
                <Checkbox
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, existing: !prev?.existing }));
                  }}
                  checked={filters?.existing}
                  // className={classes.chekBoxMap}
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}>{t('commonText.existing')}</Typography>
              </Box>
              <Box className={classes.internalMapBox}>
                <Checkbox
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, lost: !prev?.lost }));
                  }}
                  checked={filters?.lost}
                  icon={<CheckBoxRegularIcon />}
                  checkedIcon={<CheckBoxCheckedIcon />}
                  className={classes.checkBoxCustom}
                />
                <Typography className={classes.checkBoxText}> {t('commonText.lost')}</Typography>
              </Box>
            </Box>
          </Box>
          <Button
            disabled={createMode}
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={showPopup}
            className={classes.leadsMapCreateBtn}
          >
            {t('mapPopUp.createLocationsButtonText')}
          </Button>
          {isVisible?.first && createMode && (
            <Box className={classes.popUp}>
              <Box className={classes.popUpInnerSection}>
                <AddLocationIcon></AddLocationIcon>
                <Box>
                  <Typography variant="body2" className={classes.popUpText}>
                    {t('mapPopUp.createLocationsButtonText')}
                  </Typography>
                  <Typography variant="body2" className={classes.popUpContent}>
                    {t('mapPopUp.createLocationsDesc')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          {isVisible?.second && createMode && (
            <Box className={classes.popUp} onClick={cleanSelection}>
              <Box className={classes.popUpInnerSection}>
                <AddLocationIcon></AddLocationIcon>
                <Box>
                  <Typography variant="body2" className={classes.popUpText}>
                    {t('commonText.exitCreateMode')}
                  </Typography>
                  <Typography variant="body2" className={classes.popUpContent}></Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
        <Box className={classes.belowMapSection}>
          <Box className={classes.internalBelowMapSections}>
            <HomeIcon></HomeIcon>
            <Typography className={classes.leadsMapText}>
              {t('sideNavBar.linkText.franchise')}
            </Typography>
          </Box>
          <Box className={classes.internalBelowMapSections}>
            <BlackCircleIcon></BlackCircleIcon>
            <Typography className={classes.leadsMapText}>{t('commonText.new')}</Typography>
          </Box>
          <Box className={classes.internalBelowMapSections}>
            <GreenCircleIcon></GreenCircleIcon>
            <Typography className={classes.leadsMapText}>{t('commonText.old')}</Typography>
          </Box>
          <Box className={classes.internalBelowMapSections}>
            <BlueCircleIcon></BlueCircleIcon>
            <Typography className={classes.leadsMapText}>{t('commonText.existing')}</Typography>
          </Box>
          <Box className={classes.internalBelowMapSections}>
            <RedCircleIcon></RedCircleIcon>
            <Typography className={classes.leadsMapText}>{t('commonText.lost')}</Typography>
          </Box>
        </Box>
        <div className="map-container" style={{ position: 'relative', width: '100%' }}>
          <GoogleMap
            onClick={(e) => {
              handleMapClick(e);
            }}
            zoom={zoom}
            center={finalCenter}
            onLoad={(map) => {
              onLoadMap();
              setMap(map);
            }}
            options={{
              clickableIcons: false,
              disableDoubleClickZoom: true,
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: true,
              fullscreenControl: false,
            }}
            mapContainerStyle={containerStyle}
            onZoomChanged={() => {
              if (map) {
                setZoom(map.getZoom());
              }
            }}
          >
            {/** When the create location marker is clicked */}
            {selectedMarkerLocation && (
              <Marker
                onClick={handleCreateLocationMarkerClick}
                position={selectedMarkerLocation}
                draggable={true}
                onDragEnd={handleMapClick}
                icon={{
                  scaledSize: new google.maps.Size(36, 36),
                  url: leadsMapCreateLocationMarker,
                }}
              ></Marker>
            )}
            {/** polygons */}
            {populatefilteredLocations?.old?.length > 0 &&
              filters?.old &&
              populatefilteredLocations?.old?.map((data, i) => {
                const showLocationLabel =
                  activePolygonIndex?.current === data?.uniqueId && showLabel;
                return (
                  <React.Fragment key={`${i}-old`}>
                    <Marker
                      onMouseOver={() => {
                        handleMarkerHoverIn(data, true);
                      }}
                      onMouseOut={() => {
                        handleMarkerHoverOut(data, false);
                      }}
                      key={`${data?.uniqueId}-location-${data?.id}-marker`}
                      position={{
                        lat: Number(data?.coordinates.lat),
                        lng: Number(data?.coordinates.lng),
                      }}
                      icon={{
                        scaledSize: new google.maps.Size(16, 20),
                        url: data?.markerIcon,
                      }}
                    ></Marker>

                    {showLocationLabel &&
                      (() => {
                        return (
                          <InfoWindow
                            position={{
                              lat: Number(data?.coordinates.lat) + calculateOffset(zoom),
                              lng: Number(data?.coordinates.lng),
                            }}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              onMouseOver={() => {
                                handleInfoWindowHover(data, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(data, false);
                              }}
                              sx={{ background: 'white' }}
                              className={classes.mainToolTipBox}
                            >
                              <Box>
                                <Typography
                                  id="modal-modal-title"
                                  variant="h6"
                                  className={classes.industyName}
                                >
                                  {data?.name || t('commonText.nA')}
                                </Typography>

                                {data?.industryType && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {t('sideNavBar.linkText.industry')} : {data?.industryType}
                                  </Typography>
                                )}

                                {data?.address && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {data?.address}
                                  </Typography>
                                )}
                                <Box
                                  onClick={() => goToLocation(data)}
                                  className={classes.viewDetailButton}
                                >
                                  {/** design needede  green*/}
                                  {t('commonText.viewDetails')}
                                </Box>
                              </Box>
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            {populatefilteredLocations?.new?.length > 0 &&
              filters?.new &&
              populatefilteredLocations?.new?.map((data, i) => {
                const showLocationLabel =
                  activePolygonIndex?.current === data?.uniqueId && showLabel;
                return (
                  <React.Fragment key={`${i}-new`}>
                    <Marker
                      onMouseOver={() => {
                        handleMarkerHoverIn(data, true);
                      }}
                      onMouseOut={() => {
                        handleMarkerHoverOut(data, false);
                      }}
                      key={`${data?.uniqueId}-location-${data?.id}-marker`}
                      position={{
                        lat: Number(data?.coordinates.lat),
                        lng: Number(data?.coordinates.lng),
                      }}
                      icon={{
                        scaledSize: new google.maps.Size(16, 20),
                        url: data?.markerIcon,
                      }}
                    ></Marker>

                    {showLocationLabel &&
                      (() => {
                        return (
                          <InfoWindow
                            position={{
                              lat: Number(data?.coordinates.lat) + calculateOffset(zoom),
                              lng: Number(data?.coordinates.lng),
                            }}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              onMouseOver={() => {
                                handleInfoWindowHover(data, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(data, false);
                              }}
                              sx={{ background: 'white' }}
                              className={classes.mainToolTipBox}
                            >
                              <Box>
                                <Typography
                                  id="modal-modal-title"
                                  variant="h6"
                                  className={classes.industyName}
                                >
                                  {data?.name || t('commonText.nA')}
                                </Typography>
                                {data?.industryType && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {t('sideNavBar.linkText.industry')} : {data?.industryType}
                                  </Typography>
                                )}
                                {data?.address && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {data?.address}
                                  </Typography>
                                )}
                                <Box
                                  onClick={() => goToLocation(data)}
                                  className={classes.viewDetailButton}
                                >
                                  {/** design needede black*/}
                                  {t('commonText.viewDetails')}
                                </Box>
                              </Box>
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            {populatefilteredLocations?.existing?.length > 0 &&
              filters?.existing &&
              populatefilteredLocations?.existing?.map((data, i) => {
                const showLocationLabel =
                  activePolygonIndex?.current === data?.uniqueId && showLabel;
                return (
                  <React.Fragment key={`${i}-existing`}>
                    <Marker
                      onMouseOver={() => {
                        handleMarkerHoverIn(data, true);
                      }}
                      onMouseOut={() => {
                        handleMarkerHoverOut(data, false);
                      }}
                      key={`${data?.uniqueId}-location-${data?.id}-marker`}
                      position={{
                        lat: Number(data?.coordinates.lat),
                        lng: Number(data?.coordinates.lng),
                      }}
                      icon={{
                        scaledSize: new google.maps.Size(16, 20),
                        url: data?.markerIcon,
                      }}
                    ></Marker>

                    {showLocationLabel &&
                      (() => {
                        return (
                          <InfoWindow
                            position={{
                              lat: Number(data?.coordinates.lat) + calculateOffset(zoom),
                              lng: Number(data?.coordinates.lng),
                            }}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              onMouseOver={() => {
                                handleInfoWindowHover(data, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(data, false);
                              }}
                              sx={{ background: 'white' }}
                              className={classes.mainToolTipBox}
                            >
                              <Box>
                                <Typography
                                  id="modal-modal-title"
                                  variant="subtitle2"
                                  className={classes.industyName}
                                >
                                  {data?.name || t('commonText.nA')}
                                </Typography>

                                {data?.industryType && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {t('sideNavBar.linkText.industry')} : {data?.industryType}
                                  </Typography>
                                )}

                                {data?.address && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {data?.address}
                                  </Typography>
                                )}
                                <Box
                                  onClick={() => goToLocation(data)}
                                  className={classes.viewDetailButton}
                                >
                                  {' '}
                                  {/** design needede blue*/}
                                  {t('commonText.viewDetails')}
                                </Box>
                              </Box>
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            {populatefilteredLocations?.lost?.length > 0 &&
              filters?.lost &&
              populatefilteredLocations?.lost?.map((data, i) => {
                const showLocationLabel =
                  activePolygonIndex?.current === data?.uniqueId && showLabel;
                return (
                  <React.Fragment key={`${i}-lost`}>
                    <Marker
                      onMouseOver={() => {
                        handleMarkerHoverIn(data, true);
                      }}
                      onMouseOut={() => {
                        handleMarkerHoverOut(data, false);
                      }}
                      key={`${data?.uniqueId}-location-${data?.id}-marker`}
                      position={{
                        lat: Number(data?.coordinates.lat),
                        lng: Number(data?.coordinates.lng),
                      }}
                      icon={{
                        scaledSize: new google.maps.Size(16, 20),
                        url: data?.markerIcon,
                      }}
                    ></Marker>

                    {showLocationLabel &&
                      (() => {
                        return (
                          <InfoWindow
                            position={{
                              lat: Number(data?.coordinates.lat) + calculateOffset(zoom),
                              lng: Number(data?.coordinates.lng),
                            }}
                            options={{
                              pixelOffset: new window.google.maps.Size(0, -30),
                            }}
                          >
                            <Box
                              onMouseOver={() => {
                                handleInfoWindowHover(data, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(data, false);
                              }}
                              sx={{ background: 'white' }}
                              className={classes.mainToolTipBox}
                            >
                              <Box>
                                <Typography
                                  id="modal-modal-title"
                                  variant="subtitle2"
                                  className={classes.industyName}
                                >
                                  {data?.name || t('commonText.nA')}
                                </Typography>
                                {data?.industryType && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {t('sideNavBar.linkText.industry')} : {data?.industryType}
                                  </Typography>
                                )}
                                {data?.address && (
                                  <Typography
                                    id="modal-modal-description"
                                    variant="subtitle2"
                                    className={classes.industyDetail}
                                  >
                                    {data?.address}
                                  </Typography>
                                )}
                                <Box
                                  onClick={() => goToLocation(data)}
                                  className={classes.viewDetailButton}
                                >
                                  {/** design needede red*/}
                                  {t('commonText.viewDetails')}
                                </Box>
                              </Box>
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                  </React.Fragment>
                );
              })}
            {filters.franchises &&
              polygons?.length &&
              polygons?.map((polygon, index) => {
                const showPolygonLabel =
                  activePolygonIndex?.current === polygon?.uniqueId && showLabel;
                return (
                  <React.Fragment key={index}>
                    <Polygon
                      key={`${polygon?.uniqueId}-p-${polygon?.id}-${polygon?.name}`}
                      onLoad={(event) => onLoadPolygon(event, index)}
                      onMouseDown={() => onClickPolygon(polygon)}
                      // onMouseUp={() => onEditPolygon(polygon, index)}
                      // onDragEnd={() => onEditPolygon(polygon, index)}
                      options={polygon?.options}
                      paths={polygon?.coordinates}
                      draggable={polygon?.draggable}
                      editable={polygon?.editable}
                    />

                    {polygon?.markerLocation && polygon?.franchiseLocation && (
                      <Marker
                        onMouseOver={() => {
                          handleMarkerHoverIn(polygon, true);
                        }}
                        onMouseOut={() => {
                          handleMarkerHoverOut(polygon, false);
                        }}
                        onClick={() => {
                          onClickPolygon(polygon);
                        }}
                        key={`${polygon?.uniqueId}-p-${polygon?.id}-${polygon?.franchiseName}-marker`}
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
                          >
                            <Box
                              onMouseOver={() => {
                                handleInfoWindowHover(polygon, true);
                              }}
                              onMouseOut={() => {
                                handleToolTipMouseOut(polygon, false);
                              }}
                            >
                              {polygon?.franchiseLocation && (
                                <Box className={classes.imageWrapper}>
                                  <img
                                    src={polygon?.image ? polygon?.image : MapImage}
                                    alt={polygon?.label}
                                    className={classes.roomImageTool}
                                  />
                                </Box>
                              )}
                              <Typography
                                id="modal-modal-title"
                                variant="subtitle2"
                                className={classes.industyDetail}
                              >
                                {polygon?.id} - {polygon?.label}
                              </Typography>
                              <Typography variant="body3">
                                {polygon?.franchiseAddresses && polygon?.franchiseAddresses[0]}
                                {polygon?.address && polygon?.address}
                              </Typography>

                              {polygon?.area && (
                                <Typography
                                  id="modal-modal-description"
                                  variant="subtitle2"
                                  className={classes.industyDetail}
                                >
                                  {polygon?.area} {t('commonText.squareMeter')}
                                </Typography>
                              )}
                              {userRole?.slug !== 'sales_person' && (
                                <Box
                                  onClick={() => goToFranchise(polygon)}
                                  className={classes.viewDetailButton}
                                >
                                  {/** design needede franchise*/}
                                  {t('commonText.goToFranchise')}
                                </Box>
                              )}
                            </Box>
                          </InfoWindow>
                        );
                      })()}
                    {/* {filters?.boundry && polygon?.polyLineCoordinates?.length && (
                      <Polyline
                        key={`${polygon?.uniqueId}-p-${polygon?.id}-${polygon?.franchiseName}`}
                        path={polygon?.polyLineCoordinates}
                        options={{
                          fillOpacity: 0,
                          strokeWeight: 0,
                          clickable: false,
                          editable: false,
                          zIndex: 1,
                          icons: [
                            {
                              icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                fillOpacity: 2,
                                fillColor: polygon?.backgroundColor
                                  ? polygon?.backgroundColor
                                  : '#FA9CE9',
                                strokeColor: polygon?.borderColor
                                  ? polygon?.borderColor
                                  : '#FA9CE9',
                                scale: 1,
                              },
                              offset: '0',
                              repeat: '6px',
                            },
                          ],
                        }}
                      />
                    )} */}
                  </React.Fragment>
                );
              })}
            <Modal
              open={showModal && !isObjectEmpty(selectedLocationModalInfo)}
              onClose={() => {
                setShowModal(false);
              }}
              className={classes.markerModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={{ background: 'white' }} className={classes.mainToolTipBoxs}>
                {selectedLocationModalInfo?.photos?.[0]?.getUrl() && (
                  <img
                    src={selectedLocationModalInfo?.photos?.[0]?.getUrl()}
                    alt="room image"
                    className={classes.roomImageTool}
                  />
                )}
                <Box>
                  <Typography
                    id="modal-modal-title"
                    variant="subtitle2"
                    className={classes.contactInformationName}
                  >
                    {selectedLocationModalInfo?.name}
                  </Typography>
                  {selectedLocationModalInfo?.type && (
                    <Typography
                      id="modal-modal-description"
                      variant="subtitle2"
                      className={classes.contactInformation}
                    >
                      {selectedLocationModalInfo?.type}
                    </Typography>
                  )}

                  {selectedLocationModalInfo?.formatted_phone_number ||
                    (selectedLocationModalInfo?.international_phone_number && (
                      <Typography
                        id="modal-modal-description"
                        variant="subtitle2"
                        className={classes.contactInformation}
                      >
                        {selectedLocationModalInfo?.formatted_phone_number ||
                          selectedLocationModalInfo?.international_phone_number}
                      </Typography>
                    ))}
                  <Typography
                    id="modal-modal-description"
                    variant="subtitle2"
                    className={classes.contactInformation}
                  >
                    {selectedLocationModalInfo?.formatted_address}
                  </Typography>
                  {selectedLocationModalInfo?.website && (
                    <Typography
                      id="modal-modal-description"
                      variant="subtitle2"
                      className={classes.contactInformation}
                    >
                      {selectedLocationModalInfo?.website}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="primary"
                  onClick={() => {
                    openDrawer();
                    setShowModal(false);
                  }}
                  startIcon={<PlusMapIcon />}
                >
                  {t('mapPopUp.createLocationsButtonTextSite')}
                </Button>
              </Box>
            </Modal>
          </GoogleMap>
          <Drawer anchor={locationDrawerTypes.RIGHT} open={drawer} onClose={() => setDrawer(false)}>
            <NewLocationDrawer
              showAddressField={false}
              isLoaded={isLoaded}
              anchor={locationDrawerTypes.RIGHT}
              locationCloseDrawer={() => {
                setDrawer(false);
              }}
              width={796}
              companies={companies}
              onSuccess={() => {
                setSearchAddress('');
                setSelectedMarkerLocation(null);
              }}
              fetchCompanies={fetchCompanies}
              addressFromParent={selectedLocationModalInfo || null}
              refetch={resetData}
              companiesPagination={companiesPagination}
            />
          </Drawer>
        </div>
      </>
    )
  );
};

CommonLeadsMap.propTypes = {
  mapCenter: PropTypes.shape({
    lat: PropTypes.any,
    lng: PropTypes.any,
  }),
  franchiseData: PropTypes.object.isRequired,
  externalCenter: PropTypes.object,
  refetch: PropTypes.func,
};
export default CommonLeadsMap;
