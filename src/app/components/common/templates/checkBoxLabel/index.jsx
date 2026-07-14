import { Box } from '@mui/material';
import { InputLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { ReactComponent as CheckBoxRegular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as CheckBoxChecked } from 'src/assets/svg/checkbox-checked.svg?react';
import { ReactComponent as CheckBoxCheckedDisabled } from 'src/assets/svg/checkbox-checked-disabled.svg?react';
import { ReactComponent as CheckboxDisabled } from 'src/assets/svg/checkbox-disabled.svg?react';

const useStyles = makeStyles((theme) => ({
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
  },
  checkBoxCustom: {
    '&.MuiCheckbox-root': {
      padding: '0',
    },

    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  checkboxLabelText: {
    cursor: 'pointer',
    '&.MuiFormLabel-root': {
      color: theme.palette.textSecondary1,
      fontSize: '14px',
      marginBottom: '0px',
      fontWeight: '400',
      lineHeight: '20px',
    },
  },
}));
/**
 * CheckBoxLabel is a reusable React component for checkbox with lable.
 * @param {string} label  label of the checkbox .
 * @param {function} handleChange - Function to update question state.
 * @param {string} name - function to change section state.
 * @param {boolean} value - boolean.
 * @param {string} customClassName - custom class name for the checkbox.
 */

const CheckBoxLabel = ({ label, handleChange, name, value, disabled }) => {
  const classes = useStyles();

  const onChange = (event) => {
    handleChange({
      target: {
        name: event.target.name,
        value: event.target.checked,
      },
    });
  };
  return (
    <Box className={classes.checkboxLabel}>
      <Checkbox
        onChange={onChange}
        name={name}
        checked={value}
        disableRipple={true}
        disabled={disabled}
        value={value}
        id={name}
        icon={disabled ? <CheckboxDisabled /> : <CheckBoxRegular />}
        checkedIcon={disabled ? <CheckBoxCheckedDisabled /> : <CheckBoxChecked />}
        className={classes.checkBoxCustom}
      />
      <InputLabel className={classes.checkboxLabelText} htmlFor={name}>
        {label}
      </InputLabel>
    </Box>
  );
};

CheckBoxLabel.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};

CheckBoxLabel.defaultProps = {
  value: false,
  label: '',
  name: '',
};

export default CheckBoxLabel;
