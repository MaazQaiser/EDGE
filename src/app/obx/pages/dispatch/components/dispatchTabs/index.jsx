import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { useTenantLabel } from 'src/helper/utilityHooks';

import { useStyles } from './DispatchTabs';

const DipacthDetails = lazy(() => import('./dipacthDetails'));
const DispatchActivityLogs = lazy(() => import('./dispatchActivityLogs'));
const DispatchNotes = lazy(() => import('./dispatchNotes'));
const DispatchReport = lazy(() => import('./dispatchReport'));
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
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

const dispatchDetailTabs = (t, getLabel) => {
  return [
    {
      label: t('obx.dispatch.detailTabs.detail', {
        dispatch: getLabel('terms', 'dispatch', t),
      }),
      panel: 'detail',
    },
    {
      label: t('obx.dispatch.detailTabs.report'),
      panel: 'report',
    },
    {
      label: t('obx.dispatch.detailTabs.notes'),
      panel: 'notes',
    },
    {
      label: t('obx.dispatch.detailTabs.logs'),
      panel: 'logs',
    },
  ];
};

const DispatchTabs = ({ dispatch, dispatchId, loading, refetchDispatch = () => {} }) => {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();
  const { getLabel } = useTenantLabel();

  const [value, setValue] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const value = urlParams.get('value');
    return value ? Number(value) : 0;
  });

  const tabs = dispatchDetailTabs(t, getLabel);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
    const newUrlParams = new URLSearchParams(location.search);
    newUrlParams.set('value', newValue);
    history.push(`${location.pathname}?${newUrlParams.toString()}`);
  };

  return (
    <Box sx={{ width: '100%' }} className={classNames(classes.tabWrapper, 'innerScrollBar')}>
      <Box className={classes.payrollTabButtonTops}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {tabs?.map((tab, index) => (
            <Tab key={index} label={tab?.label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      <CustomTabPanel className={classes.tabContent} value={value} index={0}>
        <Suspense fallback={null}>
          <DipacthDetails dispatch={dispatch} loading={loading} refetchDispatch={refetchDispatch} />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={1}>
        <Suspense fallback={null}>
          <DispatchReport dispatchId={dispatchId} dispatch={dispatch} />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={2}>
        <Suspense fallback={null}>
          <DispatchNotes objectId={dispatchId} />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel className={classes.tabContent} value={value} index={3}>
        <Suspense fallback={null}>
          <DispatchActivityLogs dispatchId={dispatchId} />
        </Suspense>
      </CustomTabPanel>
    </Box>
  );
};

DispatchTabs.propTypes = {
  dispatchId: PropTypes.string,
  dispatch: PropTypes.object,
  loading: PropTypes.bool,
  refetchDispatch: PropTypes.func,
};

export default DispatchTabs;
