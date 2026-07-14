// import './settings.scss';

import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { HO_SETTINGS } from 'src/app/router/constant/ROUTE.jsx';
import history from 'src/app/router/utils/history.jsx';

import { useStyles } from './settings.js';
import Templates from './templates';

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}
const enumValueToTab = {
  0: 'preferences',
  1: 'reportTemplates',
  2: 'activityLog',
  3: 'portalAccesss',
  4: 'overtimeRules',
};
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Box
      className={classes.templates}
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

const getSettingTabs = (t) => {
  return [
    t('ho.settings.tabs.preferences'),
    t('ho.settings.tabs.reportTemplates'),
    t('ho.settings.tabs.activityLog'),
    t('ho.settings.tabs.portalAccesss'),
    t('ho.settings.tabs.overtimeRules'),
  ];
};

const renderTabs = (t) => {
  const settingTabs = getSettingTabs(t);
  return settingTabs.map((tab, index) => <Tab key={index} label={tab} />);
};

const Settings = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const query = useQuery();
  const activeTab = query.get('activeTab');
  const currentTab = () => {
    switch (activeTab) {
      case 'reportTemplates':
        return 1;
      case 'activityLog':
        return 2;
      case 'portalAccesss':
        return 3;
      case 'overtimeRules':
        return 4;
      default:
        return 0;
    }
  };
  const [value, setValue] = useState(currentTab());
  const handleChange = (event, newValue) => {
    history.push(`${HO_SETTINGS}?activeTab=${enumValueToTab[newValue]}`);
  };

  useEffect(() => {
    setValue(currentTab());
  }, [activeTab]);

  return (
    <Box className={classes.settings}>
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
        {renderTabs(t)}
      </Tabs>
      <CustomTabPanel value={value} index={1}>
        <Templates />
      </CustomTabPanel>
    </Box>
  );
};

export default Settings;
