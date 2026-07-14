import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { findParentAndSiblingsPolygon } from 'src/helper/utilityFunctions';
import { getGeoLocation } from 'src/services/franchise.services';
import { getZoneDetails } from 'src/services/zone.service';
import { actionItemTypeKeys, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import GeneralInformation from './component/generalInformation';
import SidebarListings from './component/sidebarListing/sidebarListings';
import TopDetail from './component/topDetail';
import { useStyles } from './zoneDetail';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Box>{children}</Box>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function ZonesDetail() {
  const classes = useStyles();

  const [zonesData, setZonesData] = useState({});
  const [franchiseData, setFranchiseData] = useState({});

  const { id: zoneId } = useParams();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // setCurrentId(currentId);
    if (zoneId) {
      Promise.all([getZoneDetailData(), getGeoLocationInfo()]);
    }
  }, [zoneId]);

  const getGeoLocationInfo = async () => {
    try {
      setFranchiseData({});
      const data = await getGeoLocation({ entity: 'zone', endpoint: 'view', id: zoneId });
      const { franchiseArea } = findParentAndSiblingsPolygon(
        zoneId,
        data,
        actionItemTypeKeys.zone,
        false,
      );
      setFranchiseData(franchiseArea);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getZoneDetailData = async () => {
    try {
      setLoading(true);
      const response = await getZoneDetails(zoneId);
      if (response && response?.statusCode === 200) {
        setZonesData(response?.data?.zone);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  return (
    <Box className={classes.zonesDetailContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <SidebarListings className={classes.sidebarSection} />
      {/* {!isObjectEmpty(zonesData) && ( */}
      <Box className={classes.zonesContent}>
        <Box className={classes.mainBox}>
          <TopDetail
            zonesData={zonesData}
            className={classes.topDetailComponentWrapper}
            loading={loading}
          />
          {/* {zonesData && ( */}
          <GeneralInformation
            className={classes.generalInformation}
            zonesData={zonesData}
            franchiseData={franchiseData}
            loading={loading}
            key={JSON.stringify(franchiseData)}
          />
          {/* )} */}
        </Box>
      </Box>
      {/* )} */}
    </Box>
  );
}
