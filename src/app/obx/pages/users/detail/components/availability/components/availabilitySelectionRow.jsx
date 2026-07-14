import { Box, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { getTimeWithInterval, showError } from 'src/helper/utilityFunctions';
import useDateTime from 'src/hooks/useDateTime';

import { useStyles } from '../avalibilityStyle';

dayjs.extend(customParseFormat);

const enums = {
  startTime: 'startTime',
  endTime: 'endTime',
  availability: 'availability',
};

const AvailabilitySelectionRow = ({ data, onAvailabilityChange, index, errors }) => {
  const { is24Hours } = useDateTime();

  const onInputChange = (e) => {
    const { name, value } = e.target;

    if (enums.startTime === name) {
      onAvailabilityChange(enums.endTime, {}, index);
    }

    onAvailabilityChange(name, value, index);
  };

  const startTime = useMemo(() => {
    return [{ value: 'none', label: 'None' }, ...getTimeWithInterval({ is24Hours })];
  }, [is24Hours]);

  const endTime = useMemo(() => {
    return [...getTimeWithInterval({ is24Hours })];
  }, [is24Hours]);
  const classes = useStyles();

  const startTimeError = showError({
    key: enums?.startTime,
    formDataKey: enums?.availability,
    index,
    errors,
  });

  const endTimeError = showError({
    key: enums?.endTime,
    formDataKey: enums?.availability,
    index,
    errors,
  });

  return (
    <Box className={classes.rowSectionWrapper}>
      <>
        <Typography variant="subtitle2" className={classes.weekDaysName}>
          {data?.day}
        </Typography>

        <Box className={classes.dropDownSectionOne}>
          <CustomDropDown
            selectedValues={data?.startTime}
            handleChange={onInputChange}
            options={startTime}
            name={'startTime'}
            bordered
            isError={!!startTimeError}
          />
          {!!startTimeError && <div className={classes.invalidFeedback}>{startTimeError}</div>}
        </Box>

        <Box className={classes.dropDownSectionOne}>
          {data?.startTime?.value !== 'none' && (
            <>
              <CustomDropDown
                selectedValues={data?.endTime}
                handleChange={onInputChange}
                options={endTime}
                name={'endTime'}
                disabled={!data?.startTime?.value}
                bordered
                isError={!!endTimeError && data?.startTime?.value}
              />
              {!!endTimeError && data?.startTime?.value && (
                <div className={classes.invalidFeedback}>{endTimeError}</div>
              )}
            </>
          )}
        </Box>
      </>

      {/*<Typography variant="subtitle2" className={classes.weekDaysName}>*/}
      {/*  {data?.day}*/}
      {/*</Typography>*/}
    </Box>
  );
};

AvailabilitySelectionRow.propTypes = {
  showYear: PropTypes.bool,
  data: PropTypes.object,
  onAvailabilityChange: PropTypes.func,
  index: PropTypes.number,
  errors: PropTypes.object,
  loading: PropTypes.bool,
};

export default AvailabilitySelectionRow;
