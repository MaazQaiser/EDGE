import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types'; // Import PropTypes
import React from 'react';

import customTheme from '../../../../customTheme.json';

/**
 * DropdownComponent is a reusable dropdown (select) input component.
 *
 * @param {String} label - The label for the dropdown.
 * @param {Object} options - An array of objects representing the dropdown options.
 * @param {String|Array} selectedValues - The state variable to handle and store the selected option(s).
 * @param {Function} handleChange - A function to react to the selected values.
 * @param {Boolean} multiple - Set this to true if the dropdown is multi-select.
 * @param {Boolean} checkmark - Set this to true if checkmark are required in the multi-select dropdown.
 * @param {Number} width - Set this to true if checkmark are required in the multi-select dropdown.
 * @param {String} type - Set to headerDropdown or ''
 * @return Component
 */

const DropdownComponent = ({
  // label,
  options,
  selectedValues,
  handleChange,
  multiple,
  checkmark,
  width,
  // type,
  onClose = () => {},
  optionsLoaded = false,
}) => {
  return (
    <FormControl sx={{ m: 1, width: width }}>
      <Select
        multiple={multiple}
        value={selectedValues}
        onChange={handleChange}
        onClose={onClose}
        renderValue={(selected) =>
          multiple ? selected.map((key) => options[key]).join(', ') : selected
        }
        className="dropdownField"
        inputProps={{ IconComponent: () => null }}
        sx={{
          // eslint-disable-next-line no-constant-condition
          '& .MuiSelect-select .notranslate::after': `${options[Object.keys(options)[0]]}`
            ? {
                content: `"${options[Object.keys(options)[0]]}"`,
                opacity: 0.42,
              }
            : {},
          boxShadow: 'none',
          height: '36px',
          fontSize: '14px',
          fontWeight: 500,
          width: '100%',
          color: `${customTheme.palette.grey[700]}`,
        }}
      >
        {optionsLoaded &&
          Object.keys(options).map((key) => (
            <MenuItem key={key} name={options[key]} value={key}>
              {multiple && checkmark && <Checkbox checked={selectedValues.includes(key)} />}
              <ListItemText primary={options[key]} />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

// Define propTypes for your component
DropdownComponent.propTypes = {
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  selectedValues: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  checkmark: PropTypes.bool,
  width: PropTypes.number,
  type: PropTypes.oneOf(['headerDropdown', '']),
  onClose: PropTypes.func,
  optionsLoaded: PropTypes.bool,
};

// Set default values for optional props
DropdownComponent.defaultProps = {
  label: '',
  multiple: false,
  checkmark: false,
  width: 120,
  type: '',
};

export default DropdownComponent;
