import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactComponent as RequireIcon } from 'assets/svg/makeitfunctional.svg?react';
import PropTypes from 'prop-types';
import { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ModalComponent from 'src/app/components/common/modal';
import { HO_FRANCHISE_DETAIL, HO_FRANCHISE_UPDATE } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import { findParentAndSiblingsPolygon } from 'src/helper/utilityFunctions';
import {
  getGeoLocation,
  getSingleFranchise,
  makeThisFranchiseFunctional,
} from 'src/services/franchise.services';
import { actionItemTypeKeys, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import { franchiseStatusEnum } from '../utils/enums';
import FranchiseSidebarListings from './components/franchiseSidebarListings';
import MakeFranchiseFunctionalModalBody from './components/makeFranchiseFunctionalModalBody';
import TopDetailComponent from './components/topDetails/topDetail';
import { useStyles } from './detail';

const Devices = lazy(() => import('./components/devices'));
const Employees = lazy(() => import('./components/employees'));
const GeneralInformation = lazy(() => import('./components/generalInformation/generalInformation'));
const Settings = lazy(() => import('./components/settings'));
const Sites = lazy(() => import('./components/sites'));
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Box
      className={value === index && classes.franchisesTabPanel}
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

export default function FranchiseDetail() {
  const { t } = useTranslation();
  const classes = useStyles();
  const [franchiseData, setFranchiseData] = useState({});

  const { id } = useParams();

  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);

  const [franchiseArea, setFranchiseArea] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpenClose = (openModal) => setOpen(openModal);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getGeoLocationInfo = async () => {
    try {
      const apiData = await getGeoLocation({
        entity: 'franchise',
        endpoint: 'view',
        id: id,
      });
      const { franchiseArea } = findParentAndSiblingsPolygon(
        id,
        apiData,
        actionItemTypeKeys.franchise,
        false,
      );
      setFranchiseArea(franchiseArea);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchApis = () => {
    setCurrentId(id);
    fetchFranchise(id);
    getGeoLocationInfo();
  };
  useEffect(() => {
    if (id) {
      fetchApis();
    }
  }, [id]);

  useEffect(() => {
    if (id && value === 0) {
      fetchApis();
    }
  }, [value]);

  const fetchFranchise = async (currentId) => {
    setLoading(true);
    try {
      if (currentId) {
        const response = await getSingleFranchise(currentId);
        if (response && response?.statusCode === 200) {
          setFranchiseData(response?.data?.franchise || {});
        }
      }
    } catch (error) {
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toaster.error({
        text: error.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  const franchiseFunctionalChecks = () => {
    if (franchiseData?.coordinates?.length > 0) {
      return true;
    }
    return false;
  };

  const gotoForm = () => {
    history.push(`${HO_FRANCHISE_UPDATE}/${id}`);
  };

  const reloadFranchise = (id) => {
    history.push({
      pathname: `${HO_FRANCHISE_DETAIL}/${id}`,
      search: `?reload=${true}`,
    });
  };

  const makeFranchiseFunctional = async (e) => {
    e.preventDefault();
    try {
      handleOpenClose(false);
      const check = franchiseFunctionalChecks();
      if (check === false) {
        gotoForm();
        toaster.error({
          text: t('ho.ho_franchise.makeItFunctional'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        return;
      }
      setLoading(true);
      const response = await makeThisFranchiseFunctional(currentId);
      if (response && response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
      reloadFranchise(id);
      await fetchFranchise(id);
    } catch (error) {
      setLoading(false);
      /**
       * show error in the corresponding field
       * parse errors in array format and set them in errorMessages
       * setErrorMessages(error)
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      handleOpenClose(false);
    }
  };

  return (
    <Box className={classes.franchisesDetailContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}
      <FranchiseSidebarListings className={classes.sidebarSection} />

      <Box className={classes.franchisesContent}>
        <Box className={classes.mainBox}>
          <TopDetailComponent
            className={classes.topDetailComponentWrapper}
            franchiseData={franchiseData}
            loading={loading}
          />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionalDiv}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                className={classes.tabContainer}
              >
                <Tab
                  /* we will use this in future */
                  // icon={
                  //   franchiseData.status != franchiseStatusEnum.functional && (
                  //     <ErrorIcon sx={{ color: 'red' }} />
                  //   )
                  // }
                  // iconPosition="end"
                  label={t('ho.ho_franchise.tabs.generalInformation')}
                />
                <Tab label={t('ho.ho_franchise.tabs.sites')} />
                <Tab label={t('ho.ho_franchise.tabs.employees')} />
                <Tab label={t('ho.ho_franchise.tabs.devices')} />
                <Tab label={t('ho.ho_franchise.tabs.settings')} />
              </Tabs>
              {franchiseData?.id &&
                franchiseData?.status !== franchiseStatusEnum.functional &&
                !loading && (
                  <Button
                    disabled={loading}
                    variant="destructiveSecondary"
                    startIcon={<RequireIcon />}
                    onClick={() => handleOpenClose(true)}
                  >
                    {t('buttons.makeItFunctional')}
                  </Button>
                )}
            </Box>

            <Box className={classes.tabsContent}>
              <CustomTabPanel value={value} index={0}>
                <Suspense fallback={null}>
                  <GeneralInformation
                    franchiseData={franchiseData}
                    geoLocation={franchiseArea}
                    loading={loading}
                    className={classes.generalInformationClass}
                  />
                </Suspense>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <Suspense fallback={null}>
                  <Sites franchiseId={currentId} franchiseData={franchiseData} />
                </Suspense>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <Suspense fallback={null}>
                  <Employees franchiseId={currentId} />
                </Suspense>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={3}>
                <Suspense fallback={null}>
                  <Devices franchiseId={currentId} />
                </Suspense>
              </CustomTabPanel>
              <CustomTabPanel value={value} index={4}>
                <Suspense fallback={null}>
                  <Settings
                    franchiseData={franchiseData}
                    franchiseId={currentId}
                    setCurrentTabValue={setValue}
                  />
                </Suspense>
              </CustomTabPanel>
            </Box>
          </Box>
        </Box>
      </Box>
      <ModalComponent
        open={open}
        handleClose={() => handleOpenClose(false)}
        body={
          <MakeFranchiseFunctionalModalBody
            handleSubmit={makeFranchiseFunctional}
            handleClose={() => handleOpenClose(false)}
            disabled={loading}
          />
        }
      />
    </Box>
  );
}
