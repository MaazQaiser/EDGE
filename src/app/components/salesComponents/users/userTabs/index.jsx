import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CustomTabPanel from 'src/app/components/common/customTabPanel';

import { useStyles } from './tabs';

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};
const UserTabs = () => {
  const [value, setValue] = useState(0); // Initialize 'value' state variable

  const handleChange = (event, newValue) => {
    setValue(newValue); // Update 'value' when the tab changes
  };

  const classes = useStyles();
  return (
    <Box sx={{ width: '100%' }} className={classes.tabArea}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          className={classes.tabsBtnWrapper}
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab className={classes.tabBtn} disableRipple label="Locations" {...a11yProps(0)} />
          <Tab className={classes.tabBtn} disableRipple label="Deals" {...a11yProps(1)} />
          <Tab className={classes.tabBtn} disableRipple label="History" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} className={value === 0 && classes.overviewTabsOne}>
        <>Hi</>
      </CustomTabPanel>
      <CustomTabPanel
        value={value}
        index={1}
        className={classNames(value === 1 && classes.overviewTabs, 'innerScrollBar')}
      >
        <>Hi</>
      </CustomTabPanel>
      <CustomTabPanel
        value={value}
        index={2}
        className={classNames(value === 2 && classes.historyTab, 'innerScrollBar')}
      >
        <>HI</>
      </CustomTabPanel>
    </Box>
  );
};

UserTabs.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fetchUserDeals: PropTypes.func,
  fetchUserHistory: PropTypes.func,
  setValue: PropTypes.func,
  value: PropTypes.any, // Adjust the type accordingly based on the expected data structure
  userDetail: PropTypes.object,
};

export default UserTabs;
