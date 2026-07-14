import { Box, Button, IconButton, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * PopoverButton is a reusable popover mui component.
 *
 * @param {String} variant - jsx type button or icon.
 * @param {Number} size - size of button or icon.
 * @param {String} label - Label for button
 * @param {Object} labelClass - class for label.
 * @param {Object} labelStyle - style for label.
 * @param {Object} style - style for popover div.
 * @param {String} className - className for popover div.
 * @param {JSX} Icon - Icon for button or icon variant type popover.
 * @return Component
 */
const useStyles = makeStyles((theme) => ({
  btnStyles: {
    '&.MuiButtonBase-root': {
      padding: '6px',
      color: theme.palette.textDisabled,
    },
  },
}));
const popOverVariantEnums = {
  button: 'button',
  icon: 'icon',
};
const PopoverButton = ({
  variant,
  size,
  label,
  labelClass,
  labelStyle,
  className,
  Icon,
  children,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const closePopover = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {variant === popOverVariantEnums.button && (
        <Button
          size={size}
          style={labelStyle ? labelStyle : null}
          className={labelClass ? labelClass : null}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
        >
          {Icon && <Icon />}
          {label}
        </Button>
      )}
      {variant === popOverVariantEnums.icon && (
        <IconButton
          size={size}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setAnchorEl(e.currentTarget);
          }}
          className={classes.btnStyles}
        >
          {Icon && <Icon />}
        </IconButton>
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePopover}
        className={className ? className : null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box onClick={closePopover}>{children}</Box>
      </Popover>
    </>
  );
};

PopoverButton.propTypes = {
  variant: PropTypes.string,
  size: PropTypes.string,
  label: PropTypes.string,
  labelClass: PropTypes.string,
  labelStyle: PropTypes.object,
  iconClass: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.any,
  Icon: PropTypes.any,
  disabled: PropTypes.bool,
};

PopoverButton.defaultProps = {
  variant: 'button',
  size: 'medium',
  disabled: false,
};

export default PopoverButton;
