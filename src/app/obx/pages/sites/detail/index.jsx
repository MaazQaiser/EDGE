import { Button, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ReactComponent as ChevronLeftIcon } from 'assets/svg/chevron-left.svg?react';
import { ReactComponent as ChevronRightIcon } from 'assets/svg/chevron-right.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { getSingleSite } from 'services/sites.services';

const Attendance = lazy(
  () => import('src/app/obx/pages/sites/detail/components/attendance/attendance'),
);
const Checkpoints = lazy(
  () => import('src/app/obx/pages/sites/detail/components/checkpoints/checkpoints'),
);
const Contracts = lazy(() => import('src/app/obx/pages/sites/detail/components/contracts'));
const Duty = lazy(() => import('src/app/obx/pages/sites/detail/components/duty/duty'));
const Instructions = lazy(
  () => import('src/app/obx/pages/sites/detail/components/instructions/instructions'),
);
const Locations = lazy(
  () => import('src/app/obx/pages/sites/detail/components/locations/locations'),
);
import {
  ACL_OBX_SITE_ATTENDANCE_VIEW,
  ACL_OBX_SITE_BILLINGS_VIEW,
  ACL_OBX_SITE_CHECKPOINTS_VIEW,
  ACL_OBX_SITE_CONTRACT_VIEW,
  ACL_OBX_SITE_DEVICES_VIEW,
  ACL_OBX_SITE_INSTRUCTIONS_VIEW,
  ACL_OBX_SITE_JOB_VIEW,
  ACL_OBX_SITE_LOCATIONS_VIEW,
  ACL_OBX_SITE_REPORTS_VIEW,
  ACL_OBX_SITE_SCHEDULES_VIEW,
  ACL_OBX_SITE_VISITOR_LOAD_VIEW,
  ACL_OBX_SITE_VISITOR_VIEW,
  ACL_OBX_SITES_VIEW,
} from 'src/app/router/constant/OBXMODULE';
import history from 'src/app/router/utils/history';
import { findParentAndSiblingsPolygon, isObjectEmpty } from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import { getGeoLocation } from 'src/services/franchise.services';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { actionItemTypeKeys, toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import SitesSidebarListings from '../../sites/detail/components/siteSidebarListings/index';
import ContractModal from './components/contractModal';
import TopDetail from './components/topDetails/topDetail';
import { useStyles } from './detailStyles';

const BillingTabs = lazy(() => import('./components/billingTabs'));
const Devices = lazy(() => import('./components/devices/devices'));
const GeneralInformation = lazy(() => import('./components/generalInformation/generalInformation'));
const Jobs = lazy(() => import('./components/jobs'));
const LoadsTabs = lazy(() => import('./components/loadsTabs'));
const Templates = lazy(() => import('./components/reportTemplates/templates'));
const VisitorTabs = lazy(() => import('./components/visitorTabs'));

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value === index && classes.sitesTabPanel}
    >
      {value === index && (
        <Box
          className={
            value !== 1 && value !== 2 ? classes.tabPanelContent : classes.contractsTabPanelContent
          }
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const siteDetailTabs = (t) => {
  return [
    {
      // icon: <ErrorIcon sx={{ color: 'red' }} />,
      // iconPosition: 'end',
      label: t('obx.sites.details.tabs.labels.generalInformation'),
      panel: 'general',
      toShow: userHasPermission(ACL_OBX_SITES_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.contracts'),
      panel: 'contract',
      toShow: userHasPermission(ACL_OBX_SITE_CONTRACT_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.jobs'),
      panel: 'jobs',
      toShow: userHasPermission(ACL_OBX_SITE_JOB_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.duty'),
      panel: 'duty',
      toShow: userHasPermission(ACL_OBX_SITE_SCHEDULES_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.reportTemplates'),
      panel: 'reports',
      toShow: userHasPermission(ACL_OBX_SITE_REPORTS_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.instructions'),
      panel: 'instructions',
      toShow: userHasPermission(ACL_OBX_SITE_INSTRUCTIONS_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.locations'),
      panel: 'locations',
      toShow: userHasPermission(ACL_OBX_SITE_LOCATIONS_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.devices'),
      panel: 'devices',
      toShow: userHasPermission(ACL_OBX_SITE_DEVICES_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.checkpoints'),
      panel: 'checkpoints',
      toShow: userHasPermission(ACL_OBX_SITE_CHECKPOINTS_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.attendance'),
      panel: 'attendance',
      toShow: userHasPermission(ACL_OBX_SITE_ATTENDANCE_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.visitors'),
      panel: 'visitors',
      toShow: userHasPermission(ACL_OBX_SITE_VISITOR_VIEW),
    },
    {
      label: t('obx.sites.details.tabs.labels.loads'),
      panel: 'loads',
      toShow: userHasPermission(ACL_OBX_SITE_VISITOR_LOAD_VIEW),
    },
    {
      label: t('obx.users.details.tabs.labels.billing'),
      panel: 'billing',
      toShow: userHasPermission(ACL_OBX_SITE_BILLINGS_VIEW),
    },
  ];
};

const siteDetailTabsComponents = (currentId, siteData, franchiseData, loading, checkAlert) => {
  const classes = useStyles();

  return [
    {
      component: (
        <Suspense fallback={null}>
          <GeneralInformation
            siteData={siteData}
            keyId={currentId}
            loading={loading}
            franchiseData={franchiseData}
          />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITES_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Contracts id={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_CONTRACT_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Jobs id={currentId} siteData={siteData} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_JOB_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Duty
            id={currentId}
            siteData={{
              ...siteData,
              id: currentId,
            }}
            key={currentId}
            className={classNames(classes.dutySite, checkAlert ? classes.dutySiteAlert : '')}
          />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_SCHEDULES_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Templates id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_REPORTS_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Instructions id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_INSTRUCTIONS_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Locations id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_LOCATIONS_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Devices id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_DEVICES_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Checkpoints id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_CHECKPOINTS_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Attendance id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_ATTENDANCE_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <VisitorTabs siteId={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_VISITOR_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <LoadsTabs id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_VISITOR_LOAD_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <BillingTabs id={currentId} key={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SITE_BILLINGS_VIEW),
    },
  ];
};
export default function SiteDetails() {
  const { t } = useTranslation();

  const { getLabel } = useTenantLabel();

  const { id } = useParams();

  const location = useLocation();

  const [siteData, setSiteData] = useState({});
  const classes = useStyles();
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [franchiseData, setFranchiseData] = useState({});

  const tabs = siteDetailTabs(t).filter((a) => a.toShow == true);
  const [openContractModal, setOpenContractModal] = useState(false);
  const handleOpenContractModal = () => setOpenContractModal(true);
  const handleCloseContractModal = () => setOpenContractModal(false);
  const handleContractSubmit = () => {
    console.log('handleSubmit');
  };

  const [value, setValue] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const activeTabLabel = urlParams.get('activeTab');
    const initialTabIndex = tabs.findIndex((tab) => tab.panel === activeTabLabel);
    return initialTabIndex !== -1 ? initialTabIndex : 0;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
    const newUrlParams = new URLSearchParams();
    newUrlParams.set('activeTab', tabs[newValue]?.panel || '');
    newUrlParams.set('value', 0);
    history.push(`${location.pathname}?${newUrlParams.toString()}`);
  };

  useEffect(() => {
    if (currentId) {
      fetchSite(currentId);
      getGeoLocationInfo();
    }
  }, [currentId]);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  const getGeoLocationInfo = async () => {
    try {
      const data = await getGeoLocation({ entity: 'site', endpoint: 'view', id: currentId });
      let { franchiseArea } = findParentAndSiblingsPolygon(
        currentId,
        data,
        actionItemTypeKeys.site,
        false,
      );
      franchiseArea.zones = [];
      setFranchiseData(franchiseArea);
    } catch (e) {
      toaster.error({
        text: e.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchSite = async () => {
    try {
      setLoading(true);
      setSiteData({});
      const response = await getSingleSite(currentId);
      if (response?.statusCode === 200) {
        setSiteData(response?.data?.site || {});
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const checkAlert =
    !isObjectEmpty(siteData) &&
    !loading &&
    (!siteData?.zone || !siteData?.data?.supervisors?.length);

  const allPanels = siteDetailTabsComponents(
    currentId,
    siteData,
    franchiseData,
    loading,
    checkAlert,
  ).filter((a) => a.toShow == true);

  const tabPanels = useMemo(() => {
    let panels = [];

    for (let i = 0; i < allPanels.length; i++) {
      const panelComponent = allPanels[i];

      const data = (
        <CustomTabPanel value={value} index={i}>
          {panelComponent?.component}
        </CustomTabPanel>
      );

      panels = [...panels, data];
    }
    return panels;
  }, [value, allPanels]);
  console.log({ tabPanels });

  return (
    <Box className={classes.siteDetailContainer}>
      <SitesSidebarListings className={classes.sidebarSection} />

      <Box className={classes.franchisesContent}>
        {siteData?.hasContractsWithRequireAttention && (
          <Alert variant="filled" severity="error" className={classes.topAlert} icon={false}>
            <Typography variant="subtitle2" className={classes.alertText}>
              {t('obx.sites.details.addendumNotificationBar')}
            </Typography>
            <Button
              variant="destructiveSecondary"
              className={classes.alertButton}
              onClick={handleOpenContractModal}
            >
              {t('obx.sites.details.reviewAndAcknowledge')}
            </Button>
            {openContractModal && (
              <ContractModal
                id={currentId}
                openModal={openContractModal}
                handleOpenContractModal={handleOpenContractModal}
                handleCloseModal={handleCloseContractModal}
                handleSubmit={handleContractSubmit}
              />
            )}
          </Alert>
        )}
        <Box className={classes.mainBox}>
          {!isObjectEmpty(siteData) &&
          !loading &&
          (!siteData?.zone || !siteData?.data?.supervisors?.length) ? (
            <Alert severity="error" className={classes.siteAlert}>
              {!siteData?.zone ? t('obx.sites.siteInformation.zoneRequire') : ''}
              {!siteData?.data?.supervisors?.length
                ? t('obx.sites.siteInformation.supervisorRequire', {
                    supervisor: getLabel('terms', 'supervisor', t)?.toLowerCase(),
                  })
                : ''}
            </Alert>
          ) : null}
          <TopDetail
            loading={loading}
            data={siteData}
            className={classes.topDetailComponentWrapper}
          />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionalDiv}>
              <Tabs
                variant="scrollable"
                scrollButtons="auto"
                value={value}
                onChange={handleChange}
                className={classes.tabContainer}
                ScrollButtonComponent={({ direction, disabled, ...props }) => {
                  if (direction === 'left' && !disabled) {
                    return (
                      <Button variant="secondaryGrey" {...props}>
                        <ChevronLeftIcon />
                      </Button>
                    );
                  } else if (direction === 'right' && !disabled) {
                    return (
                      <Button variant="secondaryGrey" {...props}>
                        <ChevronRightIcon />
                      </Button>
                    );
                  } else {
                    return null;
                  }
                }}
              >
                {tabs?.map((element, _index) => {
                  return <Tab key={element?.label} label={element?.label} {...element} />;
                })}
              </Tabs>

              {/* <Box className={classes.functionalbtn}>
                <Button variant="secondaryGrey">{t('buttons.makeItFunctional')}</Button>
              </Box> */}
            </Box>

            <Box className={classes.tabsContent}>{tabPanels}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
