import 'react-phone-number-input/style.css';

import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { parsePhoneNumber } from 'react-phone-number-input';
import { useSelector } from 'react-redux';
import { canadianAreaCodes } from 'src/utils/constants';

const useStyles = makeStyles((theme) => ({
  errorClass: {
    borderColor: `${theme.palette.borderAlert} !important`,
  },
  invalidFeedback: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    margin: 0,
    marginTop: '4px',
    color: theme.palette.textAlert,
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
  },
}));

const US_AND_CA_ENUM = {
  UNITED_STATES: 'US',
  CANADA: 'CA',
  COUNTRY_CALLING_CODE: '1',
  DIALING_PREFIX: '+',
};

const PhoneNumberWithCountry = ({
  placeholder,
  value,
  onChange,
  name,
  disabled,
  error,
  defaultCountry,
  international,
  className,
  isError,
  ...rest
}) => {
  const classes = useStyles();
  const [country, setCountry] = useState(defaultCountry);
  const [_inputKey, setInputKey] = useState(0); // Force re-render when country changes
  const franchiseCountryCode = useSelector(
    (state) => state?.auth?.countryConfiguration?.country?.shortCode,
  );

  useEffect(() => {
    if (value && value.startsWith(US_AND_CA_ENUM.DIALING_PREFIX)) {
      try {
        const phoneNumber = parsePhoneNumber(value);

        if (phoneNumber) {
          let detectedCountry = phoneNumber.country;
          const nationalNumber = phoneNumber.nationalNumber || '';

          if (phoneNumber.countryCallingCode === US_AND_CA_ENUM.COUNTRY_CALLING_CODE) {
            if (nationalNumber.length >= 3) {
              let areaCode = nationalNumber.substring(0, 3);
              areaCode = areaCode.toString();
              if (canadianAreaCodes.includes(areaCode)) detectedCountry = US_AND_CA_ENUM.CANADA;
              else detectedCountry = US_AND_CA_ENUM.UNITED_STATES;
            } else detectedCountry = US_AND_CA_ENUM.UNITED_STATES;
          }

          if (detectedCountry !== country) {
            setCountry(detectedCountry || franchiseCountryCode || defaultCountry);
            setInputKey((prev) => prev + 1);
          }
        } else setCountry(franchiseCountryCode || defaultCountry);
      } catch (error) {
        setCountry(franchiseCountryCode || defaultCountry);
      }
    } else setCountry(franchiseCountryCode || defaultCountry);
  }, [value, defaultCountry]);

  return (
    <div>
      <div className={`phone-input-container ${className} ${isError && classes.errorClass}`}>
        <PhoneInput
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          defaultCountry={country} // Only use defaultCountry, as country is not supported dynamically
          international={international}
          disabled={disabled}
          {...rest}
        />
      </div>
      {error && <span className={classes.invalidFeedback}>{error}</span>}
    </div>
  );
};

PhoneNumberWithCountry.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  defaultCountry: PropTypes.string,
  international: PropTypes.bool,
  className: PropTypes.string,
  isError: PropTypes.bool,
};

PhoneNumberWithCountry.defaultProps = {
  placeholder: 'Enter phone number',
  value: '',
  name: 'phone',
  disabled: false,
  error: '',
  defaultCountry: 'US',
  international: false,
  className: '',
  isError: false,
};

export default PhoneNumberWithCountry;
