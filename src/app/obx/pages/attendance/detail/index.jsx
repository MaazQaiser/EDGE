import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getAttendance } from 'src/services/attendance.services';

import SidebarListings from './components/sidebarListings';

const AttendanceLogs = lazy(() => import('./components/logs'));
const PendingLeaveRequests = lazy(() => import('./components/pendingLeaveRequests'));
import TopDetail from './components/topDetails/topDetail';
import { useStyles } from './detailStyles';

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box className={classes.tabPanelContent}>{children}</Box>}
    </div>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const detailTabs = (t) => {
  return [
    {
      label: 'Pending Time Off Requests' || t('obx.users.details.tabs.labels.profile'),
    },
    {
      label: 'Logs' || t('obx.users.details.tabs.labels.attendance'),
    },
  ];
};

const detailTabsComponents = (currentId, data) => {
  return [
    {
      component: (
        <Suspense fallback={null}>
          <PendingLeaveRequests key={currentId} data={data} id={currentId} />
        </Suspense>
      ),
    },
    {
      component: (
        <Suspense fallback={null}>
          <AttendanceLogs key={currentId} data={data} id={currentId} />
        </Suspense>
      ),
    },
  ];
};

const AttendanceDetail = () => {
  const { t } = useTranslation();

  const { id } = useParams();

  const [data, setData] = useState({});
  const classes = useStyles();
  const [currentId, setCurrentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(0);

  const tabs = detailTabs(t);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (currentId) {
      fetchUserAttendance(currentId);
    }
  }, [currentId]);

  useEffect(() => {
    if (id) {
      setCurrentId(id);
    }
  }, [id]);

  const fetchUserAttendance = async () => {
    try {
      setLoading(true);
      const response = await getAttendance(currentId);
      if (response?.statusCode === 200) {
        setData(response?.data?.user || {});
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const allPanels = detailTabsComponents(currentId, data);

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
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <SidebarListings className={classes.sidebarSection} />
      <Box className={classes.franchisesContent}>
        <Box className={classes.mainBox}>
          <TopDetail data={data} className={classes.topDetailComponentWrapper} />
          <Box className={classes.mainWrapper}>
            <Box className={classes.functionaldiv}>
              <Box sx={{ borderColor: 'divider', flex: '1' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  aria-label="basic tabs example"
                  className={classes.tabContainer}
                >
                  {tabs?.map((element) => {
                    return <Tab key={element?.label} label={element?.label} {...element} />;
                  })}
                </Tabs>
              </Box>
            </Box>

            <Box className={classes.tabsContent}>{tabPanels}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default AttendanceDetail;
