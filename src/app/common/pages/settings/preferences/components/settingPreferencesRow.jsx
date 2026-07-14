import { Box, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PropTypes from 'prop-types';
import React from 'react';
import { showError } from 'src/helper/utilityFunctions';

import { useStyles } from '../runsheet/runsheetStyle';

dayjs.extend(customParseFormat);

// const enums = {
//   value: 'value',
// };

const SettingPreferencesRow = ({
  data,
  onValueChange,
  index,
  errors,
  name,
  valKey = 'value',
  descKey = 'description',
}) => {
  // const onInputChange = (e) => {
  //   const { name, value } = e.target;
  //
  //   if (enums.startTime === name) {
  //     onAvailabilityChange(enums.endTime, {}, index);
  //   }
  //
  //   onAvailabilityChange(name, value, index);
  // };
  const classes = useStyles();

  const handleInputChange = (e) => {
    const { value } = e.target;
    const pattern = /^(?:0|[1-9]\d{0,2}|)$/;
    if (!pattern.test(value)) {
      return;
    }
    onValueChange(e, index, valKey);
  };

  const valueError = showError({
    key: valKey,
    formDataKey: name,
    index,
    errors,
  });

  return (
    <Box className={classes.availabiliySectionWrapper}>
      <Typography variant="subtitle2" className={classes.weekDaysName}>
        {data?.key}
      </Typography>
      <Box className={classes.dropDownSectionBox}>
        <Typography variant="subtitle2" className={classes.description}>
          {data?.[descKey]}
        </Typography>
      </Box>
      {valKey && (
        <Box className={classes.dropDownSectionBox}>
          <TextField
            className={classes.inputStyles}
            value={data?.[valKey] ?? ''}
            onChange={handleInputChange}
            name={name}
            helperText={valueError}
            error={valueError}
          />
        </Box>
      )}
    </Box>
  );
};

SettingPreferencesRow.propTypes = {
  data: PropTypes.object.isRequired, // Assuming data is an object, adjust as needed
  onValueChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object.isRequired, // Assuming errors is an object, adjust as needed
  name: PropTypes.string.isRequired,
  valKey: PropTypes.string,
  descKey: PropTypes.string,
};
export default SettingPreferencesRow;
