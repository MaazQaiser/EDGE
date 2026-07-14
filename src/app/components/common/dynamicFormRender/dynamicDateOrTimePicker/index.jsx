import { Box } from '@mui/material';
import classNames from 'classnames';
import ResponsiveDatePickers from 'commonComponents/datePicker';
import ResponsiveTimePickers from 'commonComponents/timePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const dateFormat = 'DD/MM/YYYY';
const timeFormat = 'hh:mm A';

dayjs.extend(utc);

const DynamicDateOrTimePicker = (props) => {
  const { t } = useTranslation();

  const [value, setValue] = useState(props?.answers ? dayjs(props?.answers) : null);

  const handleLocalChange = (value) => {
    setValue(value);
  };
  useEffect(() => {
    if (value) {
      const formatVal = dayjs(value)?.utc()?.format();
      const data = {
        target: {
          value: formatVal,
          name: props?.id,
        },
      };
      props?.removeError(props?.nameField);
      props?.handleChange(data);
    }
  }, [value]);

  return (
    <Box
      className={classNames(
        props.classes.previewTemplateDateTime,
        props?.fieldDisable && props.classes.disabledEvent,
      )}
    >
      {props?.type === 'date' ? (
        <ResponsiveDatePickers
          format="MM/DD/YYYY"
          inputFormat="MM/DD/YYYY"
          name={props?.id}
          timeStepsMinutes={1}
          value={value}
          disabled={props?.fieldDisable}
          onChange={handleLocalChange}
          placeholder={dayjs().format(dateFormat)}
          helperText={!!props?.errorMessage ? t('errors.dynamic.date.required') : null}
          error={!!props?.errorMessage}
        />
      ) : (
        <ResponsiveTimePickers
          format="MM/DD/YYYY"
          inputFormat="MM/DD/YYYY"
          name={props?.id}
          timeStepsMinutes={1}
          value={value}
          disabled={props?.fieldDisable}
          onChange={handleLocalChange}
          placeholder={dayjs().format(timeFormat)}
          helperText={!!props?.errorMessage ? t('errors.dynamic.time.required') : null}
          error={!!props?.errorMessage}
        />
      )}
    </Box>
  );
};

DynamicDateOrTimePicker.propTypes = {
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  removeError: PropTypes.func,
  errorMessage: PropTypes.string,
  classes: PropTypes.object,
  fieldDisable: PropTypes.bool,
  nameField: PropTypes.string,
  id: PropTypes.number,
  answers: PropTypes.string,
  type: PropTypes.string,
};
export default DynamicDateOrTimePicker;
