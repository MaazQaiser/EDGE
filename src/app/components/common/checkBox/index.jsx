import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import PropTypes from 'prop-types';
import React from 'react';

const CustomCheckbox = ({ checked, onChange, name, label }) => {
  return (
    <div>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => {
              onChange(name, e.target.checked);
            }}
            name={name}
          />
        }
        label={label}
      />
    </div>
  );
};

CustomCheckbox.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string,
};

export default CustomCheckbox;
