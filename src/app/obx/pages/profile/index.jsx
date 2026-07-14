import { Box, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import ObxData from './obxData/index';
import ProfileInfo from './perosnalInfo/index';
import { useStyles } from './style';
const profileTabs = (t, isObxFormAvailable) => [
  {
    label: t('obx.profile.tabs.labels.personalInfo'),
    toShow: true,
    value: 0,
  },
  {
    label: t('obx.profile.tabs.labels.obxData'),
    toShow: isObxFormAvailable,
    value: 1,
  },
];

const CustomTabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
};

const ProfilePage = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const { isObxFormAvailable } = useSelector((state) => state.user.info);

  const tabs = profileTabs(t, isObxFormAvailable).filter((a) => a.toShow == true);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="profile tabs"
        className={classes.tabContainer}
      >
        {tabs?.map((tab) => {
          return <Tab key={tab?.label} label={tab?.label} value={tab?.value} />;
        })}
      </Tabs>

      <CustomTabPanel value={value} index={0}>
        <ProfileInfo />
      </CustomTabPanel>

      {isObxFormAvailable && (
        <CustomTabPanel value={value} index={1}>
          <ObxData />
        </CustomTabPanel>
      )}
    </Box>
  );
};

export default ProfilePage;
