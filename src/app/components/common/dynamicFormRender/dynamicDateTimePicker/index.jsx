import { Box } from '@mui/material';
import classNames from 'classnames';
import ResponsiveDateTimePickers from 'commonComponents/dateTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDateTime from 'src/hooks/useDateTime';

dayjs.extend(utc);

const DynamicDateTimePicker = (props) => {
  const { t } = useTranslation();

  const { dateTimeFormat } = useDateTime();

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
        props?.fieldDisable && props?.classes.disabledEvent,
      )}
    >
      <ResponsiveDateTimePickers
        name={props?.id}
        timeStepsMinutes={1}
        value={value}
        disabled={props?.fieldDisable}
        onChange={handleLocalChange}
        placeholder={dateTimeFormat}
        format={dateTimeFormat}
        helperText={!!props?.errorMessage ? t('errors.dynamic.date.time.required') : null}
        error={!!props?.errorMessage}
      />
    </Box>
  );
};

DynamicDateTimePicker.propTypes = {
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
export default DynamicDateTimePicker;
