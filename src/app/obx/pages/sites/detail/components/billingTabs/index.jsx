import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddIcon } from 'src/assets/svg';

import { useStyles } from './billingTabs';

const BillingDetails = lazy(() => import('../billingDetails'));
const Contacts = lazy(() => import('../contacts'));
const MergedInvoices = lazy(() => import('../mergedInvoices'));
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
const BillingTabs = ({ id }) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { t } = useTranslation();

  const [openAddBreakType, setOpenAddBreakType] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCloseAddBreakType = () => {
    setOpenAddBreakType(false);
  };

  return (
    <Box className={classes.visitorsTab}>
      <Typography className={classes.visitorsTabTitle} variant="h1">
        {t('obx.billing.billing')}
      </Typography>
      <Box className={classes.visitorsTabsContent}>
        <Box className={classes.visitorsTabs}>
          <Tabs
            className={classes.tabButtons}
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label={t('obx.billing.billingDetails')} {...a11yProps(0)} />
            <Tab label={t('obx.billing.mergedInvoices')} {...a11yProps(1)} />
            <Tab label="Contacts" {...a11yProps(2)} />
          </Tabs>
          {value === 2 && (
            <Button
              onClick={() => setOpenAddBreakType(true)}
              variant="primary"
              startIcon={<AddIcon />}
            >
              {t('obx.billing.addContact')}
            </Button>
          )}
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Suspense fallback={null}>
            <BillingDetails siteId={id} />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Suspense fallback={null}>
            <MergedInvoices />
          </Suspense>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Suspense fallback={null}>
            <Contacts
              siteId={id}
              openAddBreakType={openAddBreakType}
              handleCloseAddBreakType={handleCloseAddBreakType}
              setOpenAddBreakTyp={setOpenAddBreakType}
            />
          </Suspense>
        </CustomTabPanel>
      </Box>
    </Box>
  );
};
BillingTabs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
export default BillingTabs;
