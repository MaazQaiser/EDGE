import { alpha, Button, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useState } from 'react';

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles('dark', {
          color: 'inherit',
        }),
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

/**
 * StyledMenuButton is a reusable component that combines a Button with a styled Menu.
 * The button defaults to primary color with white text.
 *
 * @param {String} buttonId - ID for the button element
 * @param {String} menuId - ID for the menu element
 * @param {String} buttonLabel - Label text for the button
 * {String} buttonVariant - Variant of the button (default: 'contained')
 * @param {String} buttonColor - Color of the button (default: 'primary')
 * @param {Boolean} disableElevation - Whether to disable button elevation (default: true)
 * @param {JSX} startIcon - Icon to display at the start of the button
 * @param {JSX} endIcon - Icon to display at the end of the button
 * @param {Function} onMenuItemClick - Callback function when a menu item is clicked
 * @param {Array} menuItems - Array of menu item objects with { label, onClick, icon, disableRipple }
 * @param {Object} buttonProps - Additional props to pass to the Button component
 * @param {Object} menuProps - Additional props to pass to the StyledMenu component
 * @param {Object} anchorOrigin - Anchor origin for the menu (default: { vertical: 'bottom', horizontal: 'right' })
 * @param {Object} transformOrigin - Transform origin for the menu (default: { vertical: 'top', horizontal: 'right' })
 * @return Component
 */
const StyledMenuButton = ({
  buttonId,
  menuId,
  buttonLabel,
  buttonVariant = 'contained',
  buttonColor = 'primary',
  disabled = false,
  startIcon,
  endIcon,
  onMenuItemClick,
  menuItems = [],
  buttonProps = {},
  menuProps = {},
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (itemOnClick, type) => {
    if (itemOnClick) {
      itemOnClick(type);
    }
    if (onMenuItemClick) {
      onMenuItemClick(type);
    }
    handleClose();
  };

  return (
    <>
      <Button
        id={buttonId || 'styled-menu-button'}
        aria-controls={open ? menuId || 'styled-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant={buttonVariant}
        color={buttonColor}
        disabled={disabled}
        onClick={handleClick}
        startIcon={startIcon}
        endIcon={endIcon}
        {...buttonProps}
      >
        {buttonLabel}
      </Button>
      <StyledMenu
        id={menuId || 'styled-menu'}
        slotProps={{
          list: {
            'aria-labelledby': buttonId || 'styled-menu-button',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        {...menuProps}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={item.id || index}
            onClick={() => handleMenuItemClick(item.onClick, item.id)}
            disableRipple={item.disableRipple !== false}
            {...item.menuItemProps}
          >
            {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
            {item.label}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

StyledMenuButton.propTypes = {
  buttonId: PropTypes.string,
  menuId: PropTypes.string,
  buttonLabel: PropTypes.string.isRequired,
  buttonVariant: PropTypes.string,
  buttonColor: PropTypes.string,
  disabled: PropTypes.bool,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  onMenuItemClick: PropTypes.func,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      icon: PropTypes.node,
      disableRipple: PropTypes.bool,
      menuItemProps: PropTypes.object,
    }),
  ),
  buttonProps: PropTypes.object,
  menuProps: PropTypes.object,
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.string,
    horizontal: PropTypes.string,
  }),
  transformOrigin: PropTypes.shape({
    vertical: PropTypes.string,
    horizontal: PropTypes.string,
  }),
};

export default StyledMenuButton;
