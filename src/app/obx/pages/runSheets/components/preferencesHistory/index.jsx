import { Box, Button, Switch, Tooltip, Typography } from '@mui/material';
import { ReactComponent as AlertBlueIcon } from 'assets/svg/alertCircle.svg?react';
import { ReactComponent as CautionIcon } from 'assets/svg/caution.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import React from 'react';

import { useStyles } from '../../listing/runsheets.styles';
import SliderComponent from '../slider';

const HistoryPreferences = () => {
  const [checked, setChecked] = React.useState(true);
  const classes = useStyles();

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  return (
    <Box className={classes.editPreferences}>
      <Box className={classes.editPreferencesHeader}>
        <Box className={classes.editPreferencesHeaderContent}>
          <Box className={classes.editPreferencesTitle}>
            <Button variant="tertiaryGrey"></Button>
            <Typography variant="h3" className={classes.editPreferencesTitleText}>
              Preferences History
            </Typography>
          </Box>
          <Button
            disableRipple
            className={classes.assignDrawerHeaderCloseBtn}
            onClick={handleCloseEditPreferencesDrawer}
          >
            <CloseIcon />
          </Button>
        </Box>
        <Typography variant="body2" className={classes.editPreferencesText}>
          These are current runsheet preferences for Monday 01/12/2023.
          <Box
            component={'span'}
            sx={{
              display: 'block',
            }}
          >
            Changing these will re-create all runsheets of this day.
          </Box>
        </Typography>
      </Box>
      <Box className={classes.editPreferencesBody}>
        <Box className={classes.editPreferencesSwitchContent}>
          <Box className={classes.editPreferencesSwitch}>
            <Switch
              checked={checked}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography className={classes.editPreferencesSwitchText} variant="subtitle2">
              Hits
            </Typography>
            <Tooltip arrow placement="top" title={'Maximum hits in a runsheets'}>
              <CautionIcon />
            </Tooltip>
          </Box>
          {checked && (
            <Box className={classes.editPreferencesSlider}>
              <SliderComponent />
            </Box>
          )}
        </Box>
        <Box className={classes.editPreferencesSwitchContent}>
          <Box className={classes.editPreferencesSwitch}>
            <Switch
              checked={checked}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography className={classes.editPreferencesSwitchText} variant="subtitle2">
              Vehicles
            </Typography>
            <Tooltip arrow placement="top" title={'Maximum number of runsheets'}>
              <CautionIcon />
            </Tooltip>
          </Box>
          <Box className={classes.editPreferencesSlider}>
            <SliderComponent />
          </Box>
        </Box>
        <Box className={classes.editPreferencesSwitchContent}>
          <Box className={classes.editPreferencesSwitch}>
            <Switch
              checked={checked}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
            <Typography className={classes.editPreferencesSwitchText} variant="subtitle2">
              Duration
            </Typography>
            <Tooltip arrow placement="top" title={'Maximum duration of a runsheet'}>
              <CautionIcon />
            </Tooltip>
          </Box>
          <Box className={classes.editPreferencesSlider}>
            <SliderComponent />
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
    </Box>
  );
};

export default HistoryPreferences;
