import { Box } from '@mui/material';
import ResponsiveDateTimePickers from 'commonComponents/dateTimePicker';
import { PropTypes } from 'prop-types';
import React, { useEffect, useState } from 'react';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import useDateTime from 'src/hooks/useDateTime';

import { useStyles } from './timePopover';
const TimePopoverForBreakIntervals = ({
  value,
  onSave,
  disabled = false,
  minValue = null,
  maxValue = null,
  helperText = null,
  error = false,
}) => {
  const classes = useStyles();
  // const { t } = useTranslation();
  const { timeFormatType } = useDateTime();
  const [time, setTime] = useState(dayjsWithStandardOffset(value));
  useEffect(() => {
    if (value) {
      setTime(value);
    }
  }, [value]);

  const handleSave = (time) => {
    onSave(time);
  };

  return (
    <Box className={classes.centerBox}>
      <ResponsiveDateTimePickers
        value={time}
        format={timeFormatType}
        onChange={(val) => {
          setTime(dayjsWithStandardOffset(val));
          handleSave(dayjsWithStandardOffset(val));
        }}
        disabled={disabled}
        minDateTime={minValue}
        maxDateTime={maxValue}
        timeStepsMinutes={1}
        helperText={helperText}
        error={error}
        readOnly={true}
      />
    </Box>
  );
};
TimePopoverForBreakIntervals.propTypes = {
  value: PropTypes.string,
  onSave: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  minValue: PropTypes.string,
  maxValue: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};
export default TimePopoverForBreakIntervals;
