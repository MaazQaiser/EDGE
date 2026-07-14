import { Box, Menu, MenuItem, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import classNames from 'classnames';
import { HOLIDAY_RATE_TYPES } from 'globalUtils/constants';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  combinedInput: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderRadius: '8px',
    backgroundColor: theme.palette.surfaceWhite,
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      borderColor: theme.palette.borderStrong1,
    },
    '&:focus-within': {
      borderColor: theme.palette.borderBrand,
    },
  },
  inputField: {
    flex: '1 1 10%',
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
      minWidth: 'unset',
      [theme.breakpoints.down('lg')]: {
        width: '100%',
      },
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused': {
        boxShadow: 'none',
        '& fieldset': {
          border: 'none',
        },
      },
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
      fontSize: '16px',
      lineHeight: '24px',
      '&::placeholder': {
        color: theme.palette.textPlaceholderField,
        opacity: 1,
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },
  separator: {
    width: '1px',
    height: '24px',
    backgroundColor: theme.palette.borderSubtle1,
    margin: '0 8px',
  },
  dropdownSection: {
    flex: '1 1 34%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    backgroundColor: theme.palette.surfaceWhite,
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreyLight,
    },
  },
  dropdownText: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    flex: 1,
    whiteSpace: 'nowrap',
  },
  chevronIcon: {
    width: '16px',
    height: '16px',
    marginLeft: '8px',
    transition: 'transform 0.2s',
    '&.open': {
      transform: 'rotate(180deg)',
    },
  },
  dropdownMenu: {
    marginTop: '4px',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
  menuItem: {
    padding: '10px 14px',
    fontSize: '16px',
    lineHeight: '24px',
    color: theme.palette.textPrimary,
    '&:hover': {
      backgroundColor: theme.palette.surfaceGreyLight,
    },
  },
}));

const HolidayRateInputDropdown = ({
  name,
  id,
  placeholder,
  value,
  dropdownValue = HOLIDAY_RATE_TYPES.MULTIPLIER_RATE,
  dropdownOptions = [],
  onChange,
  onDropdownChange,
  className,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);
  const isDropdownOpen = Boolean(anchorEl);

  const defaultOptions = [
    {
      value: HOLIDAY_RATE_TYPES.MULTIPLIER_RATE,
      label: t('obx.sites.createSite.holidayMultiplier'),
    },
    {
      value: HOLIDAY_RATE_TYPES.FLAT_RATE,
      label: t('obx.sites.createSite.billingOptions.flatRate'),
    },
  ];

  const options = dropdownOptions?.length ? dropdownOptions : defaultOptions;

  const selectedOption = options.find((opt) => opt.value === dropdownValue) || options[0];
  const displayText = selectedOption?.label || '';

  const handleDropdownClick = () => {
    setAnchorEl(containerRef.current);
  };

  const menuWidth = anchorEl ? anchorEl.offsetWidth : 'auto';

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionSelect = (optionValue) => {
    onDropdownChange({
      target: {
        name: `${name}Type`,
        value: optionValue,
      },
    });
    handleMenuClose();
  };

  return (
    <Box ref={containerRef} className={classNames(classes.combinedInput, className)}>
      <TextField
        name={name}
        id={id}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className={classes.inputField}
        fullWidth
        type="text"
      />
      <Box className={classes.separator} />
      <Box className={classes.dropdownSection} onClick={handleDropdownClick}>
        <span className={classes.dropdownText}>{displayText}</span>
        <ChevronDown
          className={classNames(classes.chevronIcon, {
            [classes.open]: isDropdownOpen,
          })}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={isDropdownOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          className: classes.dropdownMenu,
          style: {
            width: menuWidth,
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={classes.menuItem}
            selected={dropdownValue === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

HolidayRateInputDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  onChange: PropTypes.func.isRequired,
  onDropdownChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

HolidayRateInputDropdown.defaultProps = {
  placeholder: '',
  value: '',
  dropdownValue: HOLIDAY_RATE_TYPES.MULTIPLIER_RATE,
  dropdownOptions: [],
  className: '',
};

export default HolidayRateInputDropdown;
