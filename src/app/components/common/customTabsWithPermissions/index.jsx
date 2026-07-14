import { Tab } from '@mui/base/Tab';
import { TabPanel } from '@mui/base/TabPanel';
import { Tabs } from '@mui/base/Tabs';
import { TabsList } from '@mui/base/TabsList';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { COMMON_SETTING } from 'src/app/router/constant/ROUTE';
import history from 'src/app/router/utils/history';
import userHasPermissionSideBar from 'src/utils/auth/userHasPermissionSideBar';

import { useStyles } from './customTabsWithPermissions';

const settingsTabs = (data, _t) => {
  return data.filter(
    (link) =>
      !!userHasPermissionSideBar(link.permission, link.activeModule, link.aclPermission) ||
      link.forOnlyHO,
  );
};

const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

const CustomTabsWithPermissions = ({ data, defaultTab = 0 }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const query = useQuery();

  const activeTab = query.get('activeTab');

  const [tabs, setTabs] = useState([]);

  const [tabVal, setTabVal] = useState(0);

  const [innerTabVal, setInnerTabVal] = useState(0);

  const handleTabChange = (event, newValue) => {
    setInnerTabVal(0);
    if (tabs[newValue]?.tabValue) {
      history.push(`${COMMON_SETTING}?activeTab=${tabs[newValue]?.tabValue}`);
      return;
    }
    setTabVal(newValue);
  };
  const handleChange = (event, newValue) => {
    setInnerTabVal(newValue);
  };

  const panels = useCallback((data) => {
    return data?.components
      ?.filter(
        (link) =>
          !!userHasPermissionSideBar(link.permission, link.activeModule, link.aclPermission),
      )
      ?.map((b, i) => {
        return (
          <TabPanel key={i} value={i} className={classes.horizontalTabPanel}>
            {b?.component}
          </TabPanel>
        );
      });
  }, []);

  const tabsList = useCallback((data) => {
    return data?.components
      ?.filter(
        (link) =>
          !!userHasPermissionSideBar(link.permission, link.activeModule, link.aclPermission),
      )
      ?.map((b, i) => {
        return (
          <Tab value={i} key={i} className={classes.verticalTabsItems}>
            {b.title}
          </Tab>
        );
      });
  }, []);

  const tabsAndPanels = () => {
    return tabs?.map((data, index) => {
      return (
        <TabPanel key={index} value={index} index={index}>
          <Tabs
            value={innerTabVal}
            onChange={handleChange}
            orientation="vertical"
            className={classes.horizontalmainWrapper}
          >
            {data?.components?.length && (
              <TabsList className={classes.horizontalTabList}>{tabsList(data)}</TabsList>
            )}

            {data?.components?.length && panels(data)}

            {data?.component && (
              <TabPanel key={index} className={classes.horizontalTabComponent}>
                {data?.component}
              </TabPanel>
            )}
          </Tabs>
        </TabPanel>
      );
    });
  };

  useEffect(() => {
    const tabsData = settingsTabs(data, t);
    setTabs(tabsData);
  }, []);

  useEffect(() => {
    setTabVal(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const getActiveIndex = tabs.findIndex((a) => a.tabValue == activeTab);

    if (getActiveIndex != -1) {
      setTabVal(getActiveIndex);
    } else {
      setTabVal(defaultTab);
    }
  }, [query, activeTab, tabs]);

  return (
    <Box className={classes.detailsnWrapper}>
      <Box className={classes.detailsSplitWrapper}>
        <Box className={classes.rightSideArea}>
          <Tabs value={tabVal} onChange={handleTabChange} className={classes.tabWrapper}>
            <Box className={classes.tabListMainBox}>
              <TabsList className={classes.mainListTabs}>
                {tabs?.map((data, index) => {
                  return (
                    <Tab className={classes.tabItems} value={index} key={index}>
                      {data?.title}
                    </Tab>
                  );
                })}
              </TabsList>
            </Box>

            {tabsAndPanels()}
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
};
CustomTabsWithPermissions.propTypes = {
  data: PropTypes.object,
  currentTab: PropTypes.number,
  defaultTab: PropTypes.number,
};
export default CustomTabsWithPermissions;
