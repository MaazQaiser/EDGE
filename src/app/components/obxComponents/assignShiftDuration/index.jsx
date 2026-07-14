import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SHIFT_ASSIGNMENT_DURATION } from 'src/utils/constants/schedules';

import classes from './assignShiftDuration.module.scss';

const AssignShiftDuration = ({ title, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Box className={classes.assignShiftHeader}>
      <Typography variant="h5" className={classes.assignShift}>
        {title}
      </Typography>
      <RadioGroup onChange={onChange} value={value}>
        <FormControlLabel
          value={SHIFT_ASSIGNMENT_DURATION.TODAY_ONLY}
          control={<Radio disableRipple />}
          label={t('obx.schedules.assignDedicatedDuty.assignShift.assignShiftsFor.options.option1')}
        />
        <FormControlLabel
          value={SHIFT_ASSIGNMENT_DURATION.TODAY_ONWARDS}
          control={<Radio disableRipple />}
          label={t('obx.schedules.assignDedicatedDuty.assignShift.assignShiftsFor.options.option2')}
        />
      </RadioGroup>
    </Box>
  );
};

AssignShiftDuration.propTypes = {
  value: PropTypes.bool,
  title: PropTypes.string,
  onChange: PropTypes.func,
};
export default AssignShiftDuration;
