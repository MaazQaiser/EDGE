import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUsersById } from 'services/user.services';
import UsersSidebarListings from 'src/app/obx/pages/users/detail/components/usersSidebarListings';

const Attendance = lazy(
  () => import('src/app/obx/pages/users/detail/components/attendance/attendance'),
);
const Availability = lazy(
  () => import('src/app/obx/pages/users/detail/components/availability/availability'),
);
const EmploymentHistory = lazy(() => import('src/app/obx/pages/users/detail/employmentHistory'));
const GeneralInformation = lazy(
  () => import('src/app/obx/pages/users/detail/components/generalInformation/generalInformation'),
);
const ObxDataComponent = lazy(() => import('src/app/obx/pages/users/detail/components/obxData'));
const Schedule = lazy(() => import('src/app/obx/pages/users/detail/components/schedule'));
const UserPermissions = lazy(
  () => import('src/app/obx/pages/users/detail/components/userPermissions'),
);
import {
  ACL_OBX_SCHEDULES_VIEW,
  ACL_OBX_USERS_ATTENDANCE_VIEW,
  ACL_OBX_USERS_AVAILABILITY_VIEW,
  ACL_OBX_USERS_OBX_FORM_VIEW,
  ACL_OBX_USERS_USERINFORMATION_VIEW,
} from 'src/app/router/constant/OBXMODULE';
import userHasPermission from 'src/utils/auth/userHasPermission';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import TopDetail from './components/topDetails/topDetail';
import { useStyles } from './detailStyles';

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
      {value === index && <Box className={classes.tabPanelContent}>{children}</Box>}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const detailTabs = (t, data) => {
  const franchiseId = useSelector((state) => state.auth.franchiseId);

  return [
    {
      label: t('obx.users.details.tabs.labels.profile'),
      value: 0,
      toShow: userHasPermission(ACL_OBX_USERS_USERINFORMATION_VIEW),
    },
    {
      label: t('obx.users.details.tabs.labels.attendance'),
      value: 1,
      toShow: userHasPermission(ACL_OBX_USERS_ATTENDANCE_VIEW) && !!franchiseId,
    },
    {
      label: t('obx.users.details.tabs.labels.schedule'),
      value: 2,
      toShow: userHasPermission(ACL_OBX_SCHEDULES_VIEW) && !!franchiseId,
    },
    {
      label: t('obx.users.details.tabs.labels.availability'),
      value: 3,
      toShow: userHasPermission(ACL_OBX_USERS_AVAILABILITY_VIEW) && !!franchiseId,
    },
    {
      label: t('obx.users.details.tabs.labels.permissions'),
      toShow: !!franchiseId,
      value: 4,
    },
    {
      label: t('obx.users.details.tabs.labels.employmentHistory'),
      value: 5,
      toShow: userHasPermission(ACL_OBX_USERS_USERINFORMATION_VIEW),
    },
    {
      label: t('obx.users.details.tabs.labels.obxData'),
      value: 6,
      toShow: userHasPermission(ACL_OBX_USERS_OBX_FORM_VIEW) && data?.isObxFormAvailable,
    },
  ];
};

const detailTabsComponents = (currentId, data, loading, setData, fetchUser) => {
  const classes = useStyles();
  return [
    {
      component: (
        <Suspense fallback={null}>
          <GeneralInformation
            data={data}
            id={currentId}
            loading={loading}
            refetchUser={fetchUser}
          />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_USERS_USERINFORMATION_VIEW),
      value: 0,
    },
    {
      component: (
        <Suspense fallback={null}>
          <Attendance data={data} key={currentId} id={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_USERS_ATTENDANCE_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Schedule data={data} id={currentId} className={classes.dutySite} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_SCHEDULES_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <Availability data={data} id={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_USERS_AVAILABILITY_VIEW),
    },
    {
      component: (
        <Suspense fallback={null}>
          <UserPermissions data={data} id={currentId} setData={setData} />
        </Suspense>
      ),
      toShow: true,
    },
    {
      component: (
        <Suspense fallback={null}>
          <EmploymentHistory data={data} id={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_USERS_USERINFORMATION_VIEW),
      value: 5,
    },
    {
      component: (
        <Suspense fallback={null}>
          <ObxDataComponent data={data} id={currentId} />
        </Suspense>
      ),
      toShow: userHasPermission(ACL_OBX_USERS_OBX_FORM_VIEW) && data?.isObxFormAvailable,
      value: 6,
    },
  ];
};

const UserDetails = () => {
  const { t } = useTranslation();

  const { userId: id } = useParams();

  const [data, setData] = useState({});
  const classes = useStyles();
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);

  const tabs = detailTabs(t, data).filter((a) => a.toShow == true);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (currentId) {
      fetchUser(currentId);
    }
  }, [currentId]);

  useEffect(() => {
    if (id) {
      setCurrentId(id);
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUsersById(currentId);
      if (response?.statusCode === 200) {
        setData(response?.data?.user || {});
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);

      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const allPanels = detailTabsComponents(currentId, data, loading, setData, fetchUser).filter(
    (a) => a.toShow == true,
  );

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

  return (
    <Box className={classes.detailContainer}>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <UsersSidebarListings className={classes.sidebarSection} />

      <Box className={classes.franchisesContent}>
        <Box className={classes.mainBox}>
          <TopDetail data={data} className={classes.topDetailComponentWrapper} loading={loading} />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionalDiv}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                className={classes.tabContainer}
              >
                {tabs?.map((props) => {
                  return <Tab key={props?.label} label={props?.label} {...props} />;
                })}
              </Tabs>
            </Box>

            <Box className={classes.tabsContent}>{tabPanels}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

UserDetails.propTypes = {
  label: PropTypes.string,
};
export default UserDetails;
