import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';
import { makeStyles } from '@mui/styles';
import { ReactComponent as DeleteIcon } from 'assets/svg/trash-2.svg?react';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
const useStyles = makeStyles((_theme) => ({
  customInputIcon: {
    position: 'relative',

    '& .MuiInputBase-root': {
      height: '44px',
      paddingRight: '58px',
    },
  },
  customInputIconFieldIcon: {
    position: 'absolute',
    top: '22px',
    right: '0',
    transform: 'translateY(-50%)',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '1px solid #D0CFD2',
    cursor: 'pointer',
    zIndex: 1,
    width: '44px',

    '& svg': {
      width: '20px',
      height: '20px',

      '& path': {
        stroke: '#E43F32',
      },
    },
  },
}));
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
const CustomInputIcon = ({
  value,
  name,
  handleChange,
  handleRemove,
  errorMessage,
  placeholder,
  id,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Box className={classes.customInputIcon}>
        <TextField
          value={value}
          name={name}
          onChange={handleChange}
          fullWidth
          id={id}
          error={!!errorMessage}
          helperText={!!errorMessage ? errorMessage : null}
          placeholder={placeholder ? placeholder : `${t('commonText.input.defaultPlaceholder')}`}
        />
        <Box onClick={handleRemove} className={classes.customInputIconFieldIcon}>
          <DeleteIcon name={name} />
        </Box>
      </Box>
    </>
  );
};

CustomInputIcon.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  placeholder: PropTypes.string,
};

CustomInputIcon.defaultProps = {
  label: '',
  name: '',
  value: '',
  errorMessage: '',
  id: '',
};

export default CustomInputIcon;
