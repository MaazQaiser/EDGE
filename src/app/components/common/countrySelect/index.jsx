import { Box, FormControl } from '@mui/material';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import { useTranslation } from 'react-i18next';

import FieldError from '../fieldError';
import { useStyles } from './countrySelectStyles';

/**
 *
 * @param {Object} data
 * @param {String} countryCode
 * @returns Component
 */
const CountrySelector = ({
  data,
  countryCodes,
  updateFormHandler,
  error,
  disabled = false,
  searchable = true,
}) => {
  const memoizedCodes = useMemo(() => {
    return countryCodes;
  }, [countryCodes]);
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <FormControl className={`${classes.countrySelectorInput}`}>
      <ReactFlagsSelect
        selected={data}
        disabled={disabled}
        searchable={searchable}
        onSelect={updateFormHandler}
        countries={memoizedCodes ? memoizedCodes : false}
        className={classes.flagSelact}
        selectButtonClassName={`${error ? classes.errorClass : ''} flag-button`}
        placeholder={
          <Box className={`${classes.countrySelectorInputPlaceholder}`}>
            {t('obx.form.input.dropDown.selectCountry.label')}
          </Box>
        }
      />
      <FieldError error={!!error && error} />
    </FormControl>
  );
};

CountrySelector.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  countryCodes: PropTypes.array,
  updateFormHandler: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  searchable: PropTypes.bool,
};

export default CountrySelector;
