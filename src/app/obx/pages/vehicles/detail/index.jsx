import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicle } from 'src/services/vehicles.services';

import GeneralInformation from './component/generalInformation';
import SidebarListings from './component/sidebarListing/sidebarListings';
import TopDetail from './component/topDetail';

const useStyles = makeStyles((theme) => ({
  vehicleDetailContianer: {
    display: 'flex',
    flex: '1',
    overflow: 'auto',
  },

  sidebarSection: {
    maxWidth: '247px',
    borderRight: `1px solid ${theme.palette.borderSubtle1}`,
    overflow: 'auto',
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '1px !important',
  },

  vehicleContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'auto',
    position: 'relative',
  },

  mainBox: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },

  generalInformation: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    padding: '0 32px 24px 32px',
    [theme.breakpoints.down('lg')]: {
      padding: '0 24px 24px 24px',
    },
  },
}));
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function ZonesDetail() {
  const { id } = useParams();

  const [vehicleData, setVehicleData] = useState({});
  const classes = useStyles();

  const [_currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentId(id);
    fetchVehicle(id);
  }, [id]);

  const fetchVehicle = async (currentId) => {
    setLoading(true);
    try {
      const response = await getVehicle(currentId);
      if (response && response?.statusCode === 200) {
        setVehicleData(response?.data?.vehicle || {});
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={classes.vehicleDetailContianer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <SidebarListings className={classes.sidebarSection} />
      <Box className={classes.vehicleContent}>
        <Box className={classes.mainBox}>
          <TopDetail loading={loading} vehicleData={vehicleData} />
          <GeneralInformation
            className={classes.generalInformation}
            vehicleData={vehicleData}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
}
