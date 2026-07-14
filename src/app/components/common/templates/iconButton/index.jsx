import IconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * SimpleCheckbox is a reusable React component for checkbox with lable.
 * @param {object} Icon  label of the checkbox .
 *
 * @param rest
 */
const IconButtons = ({ Icon, ...rest }) => {
  return <IconButton {...rest}>{Icon}</IconButton>;
};
IconButtons.propTypes = {
  Icon: PropTypes.object.isRequired,
};

export default IconButtons;
