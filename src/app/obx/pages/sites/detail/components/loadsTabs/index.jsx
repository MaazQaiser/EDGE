import { Box, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './LoadsTabs';

const Officers = lazy(() => import('../officers'));
const Template = lazy(() => import('../template'));
const Visitors = lazy(() => import('../visitors'));
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className={value === index && classes.tabPanals}
    >
      {value === index && (
        <Box className={value === index && classes.customTabBox} sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
const LoadsTabs = ({ id }) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();
  const CATEGORY_TYPE = 'loads';
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    const newUrlParams = new URLSearchParams(window.location.search);
    newUrlParams.set('value', newValue.toString());

    const newUrl = `${window.location.pathname}?${newUrlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
  };

  useEffect(() => {
    if (urlParams.has('value')) setValue(+urlParams.get('value'));
  }, []);

  return (
    <Box className={classes.visitorsTab}>
      <Typography className={classes.visitorsTabTitle} variant="h1">
        {t('obx.loads.title')}
      </Typography>
      <Box className={classes.visitorsTabsContent}>
        <Box className={classes.visitorsTabs}>
          <Tabs
            className={classes.tabButtons}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label={t('obx.loads.loadsLog')} {...a11yProps(0)} />
            <Tab label={t('obx.loads.template')} {...a11yProps(1)} />
            <Tab label={getLabel('terms', 'officers', t)} {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Suspense fallback={null}>
            <Visitors siteId={id} categoryType={CATEGORY_TYPE} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Suspense fallback={null}>
            <Template siteId={id} categoryType={CATEGORY_TYPE} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Suspense fallback={null}>
            <Officers siteId={id} officersType={CATEGORY_TYPE} />
          </Suspense>
        </CustomTabPanel>
      </Box>
    </Box>
  );
};
LoadsTabs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
export default LoadsTabs;
