import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types'; // Import PropTypes
import * as React from 'react';
import { ReactComponent as RadioBgIcon } from 'src/assets/svg/radio-bg.svg?react';
import { ReactComponent as RadioBgDisabledIcon } from 'src/assets/svg/radio-bg-disabled.svg?react';
import { ReactComponent as RadioCheckedIcon } from 'src/assets/svg/radio-checked.svg?react';
import { ReactComponent as RadioCheckedDisabledIcon } from 'src/assets/svg/radio-checked-disabled.svg?react';

const useStyles = makeStyles((_theme) => ({
  customRadioGroup: {
    '& .MuiFormGroup-root ': {
      '& .MuiFormControlLabel-root': {
        marginRight: '24px',
        marginLeft: '0px',
        '& .MuiButtonBase-root': {
          padding: '0',
          paddingRight: '8px',
        },
      },
    },
  },
}));

const CustomRadioGroup = ({
  options = [],
  label = '',
  value = '',
  handleChange = null,
  disabled,
}) => {
  const classes = useStyles();
  return (
    <FormControl className={classes.customRadioGroup}>
      <FormLabel>{label}</FormLabel>
      <RadioGroup row name="radio" value={value} onChange={handleChange}>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={option?.id}
            disabled={disabled}
            control={
              <Radio
                icon={disabled ? <RadioBgDisabledIcon /> : <RadioBgIcon />}
                checkedIcon={disabled ? <RadioCheckedDisabledIcon /> : <RadioCheckedIcon />}
              />
            }
            label={option?.optionText}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

CustomRadioGroup.propTypes = {
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
export default CustomRadioGroup;
