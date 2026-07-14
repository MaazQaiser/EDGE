// import './multiSelect.scss';

import Autocomplete from '@mui/material/Autocomplete';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';

/**
 *
 * @param {String} label - The label for the dropdown.
 * @param {Array} options - An array of objects representing the dropdown options.
 * @param {Array} selectedValues - The state variable to handle and store the selected option(s).
 * @param {Function} handleChange - A function to react to the selected values.
 * @param {Boolean} loading - Set this to true if options are being fetched via API.
 * @param {Boolean} disabled - Set this to true if multiselect is disabled.
 * @return Component
 */

const MultiSelect = ({
  label,
  options,
  selectedValues,
  handleChange,
  handleOptionRemove = () => {},
  loading = false,
  disabled = false,
}) => {
  const selectedOptions = selectedValues.map((value) => ({
    label: options.find((option) => option.value === value).label,
    value: value,
  }));
  return (
    <div className="mb-24">
      <Autocomplete
        multiple
        className="searchdrop"
        id="select-with-search"
        options={options}
        getOptionLabel={(option) => option.label}
        onChange={handleChange}
        value={[]}
        placeholder={label}
        renderInput={(params) => <TextField {...params} placeholder={label} />}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        loading={loading}
        disabled={disabled}
      />
      <Breadcrumbs aria-label="breadcrumb">
        {selectedOptions.map((option) => (
          <span key={option.value}>
            <Chip label={option.label} onDelete={() => handleOptionRemove(option)} />
          </span>
        ))}
      </Breadcrumbs>
    </div>
  );
};

MultiSelect.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  selectedValues: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleOptionRemove: PropTypes.func,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

MultiSelect.defaultProps = {
  handleOptionRemove: () => {},
  loading: false,
  disabled: false,
};
export default MultiSelect;
