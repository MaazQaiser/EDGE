import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DeleteIcon } from 'assets/svg';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

// import CustomDropDown from '../../customDropDown';
import { useStyles } from './customInputIconDropdown.styles';

/**
 * CustomInputIcon is a reusable React component for checkbox with lable.
 * @param {string} label  label of the checkbox .
 * @param {function} onChange - Function to update value.
 * @param {array} value - value .
 * @param {string} errorMessage - error message.
 * @param {string} name - name
 * @param {function} handleRemove - function to remove option
 * @param {string} placeholder - placeholder
 * @param {string} id - id
 *
 */
const CustomInputIconDropDown = ({
  value,
  name,
  handleChange,
  handleRemove,
  errorMessage,
  placeholder,
  id,
  dropDownName,
  // selectedValues,
  // handleDropDown,
  // dropDownOptions,
  scorePlaceHolder,
  scoreValue,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Box className={classes.customInputIconDropDown}>
        <TextField
          value={value}
          name={name}
          onChange={handleChange}
          className={classes.customInputIconDropdownFieldOne}
          id={id}
          error={!!errorMessage}
          placeholder={placeholder ? placeholder : `${t('commonText.input.defaultPlaceholder')}`}
          helperText={!!errorMessage ? errorMessage : null}
        />
        <TextField
          value={scoreValue}
          name={dropDownName}
          type="number"
          onChange={handleChange}
          className={classes.customInputIconDropdownFieldTwo}
          id={id}
          placeholder={scorePlaceHolder}
        />
        {/* prev flow */}
        {/* <CustomDropDown
          label={''}
          name={dropDownName}
          options={dropDownOptions}
          selectedValues={selectedValues}
          handleChange={handleDropDown}
          multiple={false}
          bordered
          className={classes.customInputIconDropDownBox}
          position="right"
        /> */}
        <Box className={classes.customInputIconDropDownBtn}>
          <DeleteIcon name={name} onClick={handleRemove} />
        </Box>
      </Box>
    </>
  );
};

CustomInputIconDropDown.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  dropDownName: PropTypes.string,
  selectedValues: PropTypes.object,
  handleDropDown: PropTypes.func,
  dropDownOptions: PropTypes.array,
  scorePlaceHolder: PropTypes.string,
  scoreValue: PropTypes.number,
};

CustomInputIconDropDown.defaultProps = {
  label: '',
  name: '',
  value: '',
  errorMessage: '',
  id: '',
};

export default CustomInputIconDropDown;
