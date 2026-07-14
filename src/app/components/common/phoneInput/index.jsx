import { Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { ReactComponent as PhoneIcon } from 'assets/svg/phoneIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';

import { useStyles } from './phoneInput.styles';

const PhoneInputField = ({
  name,
  value,
  onChange,
  disabled,
  errorMessageText,
  errorMessage,
  placeHolder,
  // countryCode,
  phoneInputClass,
}) => {
  const classes = useStyles();

  const userPhoneNumberCode = useSelector(
    (state) => state.auth?.countryConfiguration?.phoneNumberCode,
  );

  // Remove country code from display value
  const displayValue = value ? value.replace(userPhoneNumberCode, '') : '';

  // Handle internal change to append country code
  const handleInternalChange = (event) => {
    const inputValue = event.target.value;

    // Create a new event with the modified value (including country code)
    const modifiedEvent = {
      ...event,
      target: {
        ...event.target,
        value: userPhoneNumberCode + inputValue,
        name: name,
      },
    };

    // Call the external onChange with the modified event
    onChange(modifiedEvent);
  };

  return (
    <TextField
      fullWidth
      placeholder={placeHolder}
      name={name}
      className={classNames(classes.phoneInput, phoneInputClass)}
      value={displayValue}
      onChange={handleInternalChange}
      variant="outlined"
      disabled={disabled}
      error={errorMessage}
      helperText={errorMessageText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <PhoneIcon />
            <Typography variant="body1">{userPhoneNumberCode}</Typography>
          </InputAdornment>
        ),
      }}
    />
  );
};

// Default props
PhoneInputField.defaultProps = {
  name: '',
  value: '',
  phoneInputClass: '',
  onChange: () => {},
  disabled: false,
  errorMessageText: '',
  errorMessage: false,
  customInput: '',
  // countryCode: '+1',
  placeHolder: 'Phone Number',
};

// PropTypes for type checking
PhoneInputField.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  // countryCode: PropTypes.string,
  phoneInputClass: PropTypes.string,
  errorMessage: PropTypes.bool,
  placeHolder: PropTypes.string,
  errorMessageText: PropTypes.string,
};

export default PhoneInputField;
