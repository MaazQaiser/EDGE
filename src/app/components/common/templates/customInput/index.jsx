import { InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import RequiredAsterik from '../../requiredAsterik';

/**
 * CustomInput is a reusable React component for checkbox with lable.
 * @param {string} label  label of the checkbox .
 * @param {function} onChange - Function to update value.
 * @param {array} value - value .
 * @param {string} errorMessage - error message.
 * @param {string} name - name
 * @param {number} width - width
 * @param {number} minHeight - min height
 * @param {number} maxHeight - max height
 * @param {string} placeholder - placeholder
 * @param {string} id - id
 * @param {boolean} multiline - multiline
 * @param {string} className - use css for chnage the styling
 */

const useStyles = makeStyles((theme) => ({
  customInput: {
    display: 'flex',
    flexDirection: 'column',
  },

  customInputField: {
    '& .MuiOutlinedInput-notchedOutline': {
      backgroundColor: theme.palette.surfaceWhite,
    },
  },
}));

function CustomInput({
  label,
  disabled,
  errorMessage,
  value,
  name,
  onChange,
  placeholder,
  required,
  id,
  multiline,
  type,
  className,
  rows,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Box className={classes.customInput}>
      {label && (
        <InputLabel htmlFor={id}>
          {label}
          {required && <RequiredAsterik />}
        </InputLabel>
      )}
      <TextField
        value={value}
        onChange={onChange}
        name={name}
        fullWidth
        id={id}
        disabled={disabled}
        error={!!errorMessage}
        multiline={multiline}
        placeholder={placeholder ? placeholder : `${t('commonText.input.defaultPlaceholder')}`}
        type={type ? type : 'text'}
        helperText={!!errorMessage ? errorMessage : null}
        className={classNames(classes.customInputField, className)}
        minRows={rows}
      />
    </Box>
  );
}

CustomInput.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.boolean,
  errorMessage: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  multiline: PropTypes.bool,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  rows: PropTypes.number,
};

CustomInput.defaultProps = {
  label: '',
  disabled: false,
  name: '',
  value: '',
  errorMessage: '',
  id: '',
  placeholder: '',
  required: false,
  multiline: false,
};

export default CustomInput;
