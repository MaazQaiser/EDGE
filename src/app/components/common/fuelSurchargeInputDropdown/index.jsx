import { Box, Checkbox, Menu, MenuItem, TextField, Typography } from '@mui/material';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Regular } from 'src/assets/svg/checkbox.svg?react';
import { ReactComponent as Iregular } from 'src/assets/svg/checkbox-checked.svg?react';
import { regexValues } from 'src/utils/constants/index';

import { FUEL_SURCHARGE_LAYOUT_FLAT_RATE, useStyles } from './styles';

export const FUEL_SURCHARGE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_VALUE: 'fixed_value',
};

/** Same pattern as dispatch billing: % in (0, 100], max one decimal while typing. */
const rePercent = /^\d{0,3}(\.\d{0,1})?$/;

/** Per-keystroke filter (see dispatchBillingInfoComponent + regexValues.price for fixed $). */
export const isAllowedFuelSurchargeInput = (surchargeType, raw) => {
  if (raw === '') return true;
  const pct = surchargeType === FUEL_SURCHARGE_TYPES.PERCENTAGE;
  if (!(pct ? rePercent : regexValues.price).test(raw)) return false;
  const n = parseFloat(raw);
  if (Number.isNaN(n) || n < 0 || (pct && n > 100)) return false;
  if (n > 0) return true;
  return pct ? raw === '0' || raw === '0.' || /^\d{1,3}\.$/.test(raw) : /^(0|0\.|0\.0)$/.test(raw);
};

const FuelSurchargeInputDropdown = ({
  name,
  id,
  placeholder,
  value,
  dropdownValue = FUEL_SURCHARGE_TYPES.PERCENTAGE,
  dropdownOptions = [],
  onChange,
  onDropdownChange,
  className,
  error = false,
  helperText = '',
  checked = false,
  onCheckChange,
  label,
  layout,
  // Contract service type: `patrol` | `dedicated` | `dispatch`; otherwise generic % / $ labels.
  surchargeServiceType,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isFlatRateLayout = layout === FUEL_SURCHARGE_LAYOUT_FLAT_RATE;
  const [anchorEl, setAnchorEl] = useState(null);
  const containerRef = useRef(null);
  const isDropdownOpen = Boolean(anchorEl);

  const defaultOptions = useMemo(() => {
    if (surchargeServiceType === 'patrol') {
      return [
        {
          value: FUEL_SURCHARGE_TYPES.PERCENTAGE,
          label: t('obx.sites.createSite.fuelSurchargePercentagePatrol', 'Percent per patrol'),
        },
        {
          value: FUEL_SURCHARGE_TYPES.FIXED_VALUE,
          label: t('obx.sites.createSite.fuelSurchargeFixedValuePatrol', 'Value per patrol'),
        },
      ];
    }
    if (surchargeServiceType === 'dedicated') {
      return [
        {
          value: FUEL_SURCHARGE_TYPES.PERCENTAGE,
          label: t('obx.sites.createSite.fuelSurchargePercentageDedicated', 'Percent per hour'),
        },
        {
          value: FUEL_SURCHARGE_TYPES.FIXED_VALUE,
          label: t('obx.sites.createSite.fuelSurchargeFixedValueDedicated', 'Value per hour'),
        },
      ];
    }
    if (surchargeServiceType === 'dispatch') {
      return [
        {
          value: FUEL_SURCHARGE_TYPES.PERCENTAGE,
          label: t('obx.sites.createSite.fuelSurchargePercentageDispatch', 'Percent per dispatch'),
        },
        {
          value: FUEL_SURCHARGE_TYPES.FIXED_VALUE,
          label: t('obx.sites.createSite.fuelSurchargeFixedValueDispatch', 'Value per dispatch'),
        },
      ];
    }
    return [
      {
        value: FUEL_SURCHARGE_TYPES.PERCENTAGE,
        label: t('obx.sites.createSite.fuelSurchargePercentage', 'Percentage (%)'),
      },
      {
        value: FUEL_SURCHARGE_TYPES.FIXED_VALUE,
        label: t('obx.sites.createSite.fuelSurchargeFixedValue', 'Value ($)'),
      },
    ];
  }, [surchargeServiceType, t]);

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

  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    if (inputVal === '' || isAllowedFuelSurchargeInput(dropdownValue, inputVal)) {
      onChange(e);
    }
  };

  const handleOptionSelect = (optionValue) => {
    if (optionValue !== dropdownValue) {
      onChange({ target: { name, value: '' } });
    }
    onDropdownChange({
      target: {
        name: `${name}Type`,
        value: optionValue,
      },
    });
    handleMenuClose();
  };

  const hasError = checked && error && helperText;

  return (
    <Box
      className={classNames(classes.wrapper, {
        [classes.wrapperFlatRate]: isFlatRateLayout,
      })}
    >
      <Box
        className={classNames(classes.checkboxLabel, {
          [classes.checkboxLabelFlatRate]: isFlatRateLayout,
        })}
        onClick={() => onCheckChange?.(!checked)}
      >
        <Checkbox
          checked={checked}
          className={classes.checkbox}
          inputProps={{ 'aria-label': 'fuel surcharge checkbox' }}
          icon={<Regular />}
          checkedIcon={<Iregular />}
        />
        <Typography className={classes.labelText} variant="body2">
          {label}
        </Typography>
      </Box>
      <Box
        className={classNames(classes.fuelSurchargeRow, {
          [classes.fuelSurchargeRowFlatRate]: isFlatRateLayout,
        })}
      >
        <Box
          className={classNames(classes.row, {
            [classes.rowFlatRate]: isFlatRateLayout,
          })}
        >
          {checked && (
            <Box
              ref={containerRef}
              className={classNames(
                classes.combinedInput,
                { [classes.combinedInputError]: hasError },
                className,
              )}
            >
              <TextField
                name={name}
                id={id}
                placeholder={placeholder}
                value={value || ''}
                onChange={handleInputChange}
                className={classes.inputField}
                fullWidth
                type="text"
              />
              <Box className={classes.separator} />
              <Box
                className={classNames(classes.dropdownSection, {
                  [classes.dropdownSectionFlatRate]: isFlatRateLayout,
                })}
                onClick={handleDropdownClick}
              >
                <span className={classes.dropdownText}>{displayText}</span>
                <ChevronDown
                  className={classNames(classes.chevronIcon, {
                    [classes.chevronFlatRate]: isFlatRateLayout,
                    [classes.chevronIconOpen]: isDropdownOpen,
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
          )}
        </Box>
        {hasError && (
          <Box
            component="span"
            className={classNames(classes.errorText, {
              [classes.errorTextFlatRate]: isFlatRateLayout,
            })}
          >
            {helperText}
          </Box>
        )}
      </Box>
    </Box>
  );
};

FuelSurchargeInputDropdown.propTypes = {
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
  error: PropTypes.bool,
  helperText: PropTypes.string,
  checked: PropTypes.bool,
  onCheckChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  layout: PropTypes.oneOf([FUEL_SURCHARGE_LAYOUT_FLAT_RATE]),
  surchargeServiceType: PropTypes.oneOf(['patrol', 'dedicated', 'dispatch']),
};

FuelSurchargeInputDropdown.defaultProps = {
  placeholder: '',
  value: '',
  dropdownValue: FUEL_SURCHARGE_TYPES.PERCENTAGE,
  dropdownOptions: [],
  className: '',
  error: false,
  helperText: '',
  checked: false,
  label: '',
  layout: undefined,
  surchargeServiceType: undefined,
};

export default FuelSurchargeInputDropdown;
export { FUEL_SURCHARGE_LAYOUT_FLAT_RATE } from './styles';
