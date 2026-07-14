import { Box } from '@mui/material';
import classNames from 'classnames';
import CustomInput from 'commonComponents/templates/customInput';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const DynamicInput = (props) => {
  const [value, setValue] = useState(props?.answers || '');
  const handleLocalChange = ({ target: { value } }) => {
    setValue(value);
  };

  useEffect(() => {
    if (props?.answers !== undefined && props?.answers !== null) {
      setValue((prev) => (String(prev) === String(props.answers) ? prev : props.answers));
    }
  }, [props?.answers]);

  useEffect(() => {
    const data = {
      target: {
        value: value,
        name: props?.id,
      },
    };
    props?.removeError(props?.nameField);
    props?.handleChange(data);
  }, [value]);
  return (
    <Box
      className={classNames(
        !props?.multiline
          ? props?.classes.previewTemplateField
          : props?.classes.previewTemplateFieldTextArea,
        props?.fieldDisable && props?.classes.disabledEvent,
      )}
    >
      <CustomInput
        {...props}
        name={props?.id}
        value={value}
        label=""
        onChange={handleLocalChange}
      />
    </Box>
  );
};

DynamicInput.propTypes = {
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
  multiline: PropTypes.bool,
};

export default DynamicInput;
