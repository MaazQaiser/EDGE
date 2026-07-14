import { Box, Button, Switch, Tooltip, Typography } from '@mui/material';
import { ReactComponent as AlertBlueIcon } from 'assets/svg/alertCircle.svg?react';
import { ReactComponent as CautionIcon } from 'assets/svg/caution.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as DotIcon } from 'assets/svg/dot.svg?react';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from '../../listing/runsheets.styles';
import SliderComponent from '../slider';

const EditPreferences = ({ handleCloseEditPreferencesDrawer }) => {
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
            <Typography variant="h3" className={classes.editPreferencesTitleText}>
              Edit Preferences
            </Typography>
            <DotIcon className={classes.editPreferencesDivider} />
            <Typography variant="h5" className={classes.editPreferencesTitleText}>
              01/12/2023
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
              At least one from Hits or Duration is required. Number of Vehicles is optional.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={classes.editPreferencesFooter}>
        <Button variant="secondaryGrey">Cancel</Button>
        <Button variant="primary">Update</Button>
      </Box>
    </Box>
  );
};

EditPreferences.propTypes = {
  handleCloseEditPreferencesDrawer: PropTypes.func,
};

export default EditPreferences;
