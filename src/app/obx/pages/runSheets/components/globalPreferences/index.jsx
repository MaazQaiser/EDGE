import { _Tooltip, Box, Button, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { ReactComponent as AlertBlueIcon } from 'assets/svg/alertCircle.svg?react';
import { ReactComponent as CautionIcon } from 'assets/svg/caution.svg?react';
import { ReactComponent as ClockIcon } from 'assets/svg/clock.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as EditPreferencesIcon } from 'assets/svg/edit-lock.svg?react';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useStyles } from '../../listing/runsheets.styles';
import VisualSlider from '../visualSlider';

const GlobalPreferences = ({ handleCloseGlobalPreferencesDrawer }) => {
  const classes = useStyles();

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box className={classes.editPreferences}>
      <Box className={classes.editPreferencesHeader}>
        <Box className={classes.editPreferencesHeaderContent}>
          <Typography variant="h3" className={classes.editPreferencesTitleText}>
            Global Preferences
          </Typography>

          <Button
            disableRipple
            className={classes.assignDrawerHeaderCloseBtn}
            onClick={handleCloseGlobalPreferencesDrawer}
          >
            <CloseIcon />
          </Button>
        </Box>
        <Typography variant="body2" className={classes.editPreferencesText}>
          These are current run-sheets preferences. Changing these will re-create all runsheets for
          the selected period.
        </Typography>
      </Box>
      <Box className={classes.globalPreferencesBody}>
        <Box>
          <Box className={classes.functionalDiv}>
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              value={value}
              onChange={handleChange}
              className={classes.tabContainer}
            >
              <Tab label="This Week" {...a11yProps(0)} />
              <Tab label="Upcoming Week" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <Box className={classes.tabPanelBox}>
            <CustomTabPanel value={value} index={0}>
              <Box className={classes.globalPreferencesTabContent}>
                <Box className={classes.globalPreferencesWeek}>
                  <Typography variant="subtitle2" className={classes.globalPreferencesWeekText}>
                    Monday 12a - Wednesday 12a
                  </Typography>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Duration
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum duration of a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={4} current={6} text="Hrs" end={12} />
                  </Box>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                </Box>
                <Box className={classes.globalPreferencesWeek}>
                  <Typography variant="subtitle2" className={classes.globalPreferencesWeekText}>
                    Monday 12a - Wednesday 12a
                  </Typography>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Box className={classes.globalPreferencesTabContent}>
                <Box className={classes.globalPreferencesWeek}>
                  <Typography variant="subtitle2" className={classes.globalPreferencesWeekText}>
                    Monday 12a - Wednesday 12a
                  </Typography>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Duration
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum duration of a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={4} current={6} text="Hrs" end={12} />
                  </Box>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                </Box>
                <Box className={classes.globalPreferencesWeek}>
                  <Typography variant="subtitle2" className={classes.globalPreferencesWeekText}>
                    Monday 12a - Wednesday 12a
                  </Typography>
                  <Box className={classes.globalPreferencesWeekInfo}>
                    <Box className={classes.globalPreferencesWeekInfoTop}>
                      <Typography
                        className={classes.globalPreferencesWeekInfoText}
                        variant="subtitle2"
                      >
                        Hits
                      </Typography>
                      <Tooltip arrow placement="top" title={'Maximum hits in a runsheet'}>
                        <CautionIcon />
                      </Tooltip>
                    </Box>
                    <VisualSlider start={10} current={50} end={100} />
                  </Box>
                </Box>
              </Box>
            </CustomTabPanel>
          </Box>
        </Box>

        <Box className={classes.editPreferencesAlert}>
          <Box className={classes.editPreferencesAlertBox}>
            <AlertBlueIcon />
            <Typography variant="subtitle2" className={classes.editPreferencesAlertText}>
              Runsheets are auto-created every Friday at 12:00 am UTC 0 for the upcoming week.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.globalPreferencesFooter}>
        <Button variant="secondaryGrey" startIcon={<EditPreferencesIcon />}>
          Edit
        </Button>
        <Button variant="tertiaryGrey" startIcon={<ClockIcon />}>
          History
        </Button>
      </Box>
    </Box>
  );
};

GlobalPreferences.propTypes = {
  handleCloseGlobalPreferencesDrawer: PropTypes.func,
};

export default GlobalPreferences;

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <Box
      role="tabpanel"
      className={classes.faqTabPanel}
      id={`simple-tabpanel-${index}`}
      hidden={value !== index}
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
