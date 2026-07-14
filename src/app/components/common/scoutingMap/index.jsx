import { Box, Button, Chip, Modal, Skeleton, Stack, Typography } from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ReactComponent as MapOrangeIcon } from 'assets/icons/cirlceIcon.svg?react';
import { ReactComponent as MapPlaceholderIcon } from 'assets/svg/MapPlaceholderIcon.svg?react';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { locationStatuses } from 'salesComponents/locations/newLocationsDrawer/location.constant';
import { getLocationDetail } from 'services/location.service';
import { SALES_LOCATION } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
// import toolTipRoomImage from 'src/assets/images/toolTipRoomImage.png';
import {
  defaultMapZoom,
  GOOGLE_MAPS_API_VERSION,
  GOOGLE_MAPS_LIBRARIES,
  toastSettings,
} from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { isObjectEmpty } from '../../../../helper/utilityFunctions';
import { useStyles } from './scoutingMap';

/**
 * Default center if can't get location of user.
 */
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

/**
 * constant values
 */
const actionItemTypeKeys = {
  zone: 'zone',
  franchise: 'franchise',
  site: 'site',
  franchiseName: 'franchiseName',
  sitePin: 'https://signalassets.blob.core.windows.net/signal/assets/SitePin.svg',
  franchisePin: 'https://signalassets.blob.core.windows.net/signal/assets/FranchisesPin.svg',
  locationPin: 'https://signalassets.blob.core.windows.net/signal/Flags/cirlceIcon.svg',
};

const visitStatusEnum = {
  onTime: 'OnTime',
  late: 'LATE',
  early: 'EARLY',
};

const containerStyle = {
  width: '100%',
  height: '100dvh',
  borderRadius: '8px 0px 0px 8px',
};

/**
 * @description Pillar Component of the project and if you are here to edit this, then RIP in advance. :)
 * @param {Boolean} createOrUpdate toggle for drawing controls
 * @param {Object} mapCenter object that shows the center of the map
 * @param {Array} franchiseData object containing franchises, zones and sites along with the actionItem's parentId.
 * @returns
 */
const CommonScoutingMap = (props) => {
  const { routeData = [], mapCenter = {}, externalCenter = {} } = props;

  const { t } = useTranslation();
  const mapRef = useRef();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  /**
   * all the polygons that are shown on map are these
   */
  const [polygons, setPolygons] = useState([]);

  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(defaultMapZoom);
  const classes = useStyles();
  const [map, setMap] = useState(null);

  // Show info window of site clicked
  const [showModal, setShowModal] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState({});
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const NA = t('commonText.nA');

  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const getAddress = (info) => {
    let str = '';

    const addComma = (str) => {
      return (str = str.length > 0 ? str + ', ' : str + ' ');
    };
    if (info?.street) str = str + info?.street;
    if (info?.addressLine2) str = str + info?.addressLine2;
    if (info?.city) {
      str = addComma(str);
      str = str + info?.city;
    }
    if (info?.state) {
      str = addComma(str);
      str = str + info?.state;
    }
    if (info?.country) {
      str = addComma(str);
      str = str + info?.country;
    }
    if (info?.postalCode) {
      str = addComma(str);
      str = str + info?.postalCode;
    }

    return str || NA;
  };

  const fetchLocation = async (id) => {
    try {
      setData({});
      setLoading(true);
      const response = await getLocationDetail(id);

      if (response.statusCode === 200) {
        const locationStatus = response?.data?.location?.status;
        if (
          !locationStatus ||
          [locationStatuses.PENDING, locationStatuses.REJECTED].includes(locationStatus)
        ) {
          setShowModal(false);
          toaster.error({
            text: t('sales.locations.locationNeedsApproval'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          return;
        }
        setData(response?.data?.location);
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      setShowModal(false);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * @description set the current to uniqueId so that the polygon could * identified.
   * @param {*} polygon
   */
  const onClickPolygon = (polygon) => {
    setShowModal(true);
    setCurrentPolygon(polygon);
    fetchLocation(polygon?.siteId);
  };

  const gotoLocationDetail = (id) => {
    history.push(`${SALES_LOCATION}/${id}`);
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

    setPolygons(routeData);
  }, []);

  useEffect(() => {
    if (!isObjectEmpty(externalCenter)) {
      setCenter(externalCenter);
      // setZoom(22);
    }
  }, [externalCenter]);

  /**
   * Hide everything if there is no center
   */
  if (!center) {
    return null;
  }
  return (
    isLoaded &&
    !isObjectEmpty(center) && (
      <>
        <Box className={classes.belowMapSection}>
          <Box className={classes.internalBelowMapSections}>
            <MapOrangeIcon />
            <Typography variant="subtitle3" className={classes.leadsMapText}>
              {t('sales.scouting.maps.infoBar.visitedLocations')}
            </Typography>
          </Box>
        </Box>
        <Box className="map-container" style={{ position: 'relative', width: '100%' }}>
          <GoogleMap
            options={{
              clickableIcons: false,
              streetViewControl: false,
              mapTypeControl: false,
              zoomControl: true,
              fullscreenControl: false,
            }}
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
          >
            {polygons?.length > 0 &&
              polygons?.map((polygon, index) => {
                return (
                  <React.Fragment key={index}>
                    <Marker
                      key={`${index}-${polygon?.siteId}-${polygon.visitedAt}`}
                      // onMouseOver={() => {
                      //   updateLabelInfo(polygon, true);
                      // }}
                      // onMouseOut={() => {
                      //   updateLabelInfo(null, false);
                      // }}
                      onClick={() => {
                        onClickPolygon(polygon);
                      }}
                      position={polygon?.coordinates}
                      icon={{
                        scaledSize: new google.maps.Size(26, 37),
                        url: actionItemTypeKeys.locationPin,
                      }}
                    />
                  </React.Fragment>
                );
              })}
          </GoogleMap>
        </Box>

        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          className={classes.markerModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ background: 'white' }} className={classes.mainToolTipBox}>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="rectangular" width={240} height={120} />

                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                <Skeleton variant="rectangular" width={240} height={36} />
              </Stack>
            ) : (
              <>
                <MapPlaceholderIcon />
                {/* <img src={toolTipRoomImage} alt="room image" className={classes.roomImageTool} /> */}
                <Box>
                  <Typography
                    id="modal-modal-title"
                    variant="subtitle2"
                    className={classes.modalHeading}
                  >
                    {data?.locationName || NA} &nbsp;
                    {currentPolygon?.visitStatus === visitStatusEnum.late ? (
                      <Chip
                        color="warning"
                        size="small"
                        label={t('sales.scouting.maps.modal.visitsStatuses.late')}
                      />
                    ) : (
                      <Chip
                        color="success"
                        size="small"
                        label={t('sales.scouting.maps.modal.visitsStatuses.onTime')}
                      />
                    )}
                  </Typography>
                  <Typography
                    id="modal-modal-description"
                    variant="subtitle2"
                    className={classes.contactInformation}
                  >
                    {data?.industry || NA}
                  </Typography>
                  <Typography
                    id="modal-modal-description"
                    variant="subtitle2"
                    className={classes.contactInformation}
                  >
                    {data?.contact?.phone || NA}
                  </Typography>
                  <Typography
                    id="modal-modal-description"
                    variant="subtitle2"
                    className={classes.contactInformation}
                  >
                    {getAddress(data)}
                  </Typography>
                </Box>
                <Button
                  variant="primary"
                  onClick={() => gotoLocationDetail(currentPolygon?.siteId)}
                >
                  {t('sales.scouting.maps.modal.buttons.locationDetail')}
                </Button>
              </>
            )}
          </Box>
        </Modal>
      </>
    )
  );
};

CommonScoutingMap.propTypes = {
  /**
   * whether we are creating or updating a polygon
   */
  createOrUpdate: PropTypes.bool.isRequired,
  mapCenter: PropTypes.shape({
    lat: PropTypes.any,
    lng: PropTypes.any,
  }),
  routeData: PropTypes.array.isRequired,
  showPolyLines: PropTypes.bool,
  externalCenter: PropTypes.object,
};

export default CommonScoutingMap;
