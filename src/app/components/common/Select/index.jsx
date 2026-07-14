import { Box, InputAdornment, ListSubheader, SvgIcon, TextField, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { ReactComponent as SearchIcon } from 'assets/images/search.svg?react';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FieldError from '../fieldError';
import { useStyles } from './select';
/**
 * @description Select Input Re-usable component (if you want to show default value that is coming from api set the supervisor key's value to the id of the supervisor data coming from the API)
 * @param {String} defaultLabel the default selected value of the drop down
 * @param {String} name name for state key i.e key that react reads to get data
 * @param {String} inputKey data key that needs to be set in state when option is selected
 * @param {String} labelKey data key that is used to show label or the UI text i.e name or value or label
 * @param {String} defaultValue default value (should be a string  not the whole object)
 * @param {String} selectedValue instructions same as defaultvalue
 * @param {Object} options array of objects e.g {id:1, name:"John", label:"Show this in drop down"}
 * @param {Function} onChange function to handle selected value click (check handleInputChange)
 * @param {String} error string that shows error parent should pass formdata.errorKey
 * @param {bool} disabled disables the input
 * @param {bool} searchable enables search feature
 * @returns
 */

const SelectInput = ({
  defaultLabel,
  name,
  inputKey = 'id',
  labelKey = 'value',
  defaultValue,
  selectedValue,
  options,
  disabled = false,
  onChange,
  searchable = false,
  error = null,
  showFirst = true,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState('');
  const inputData =
    selectedValue?.[0]?.[inputKey] || //if array of supervisor objects are sent
    selectedValue?.[inputKey] ||
    selectedValue ||
    defaultValue ||
    defaultValue?.[inputKey] ||
    '';
  const defaultPlaceHolder = t('obx.form.input.dropDown.pleaseSelectAnOption');
  const ChevronDown = (props) => (
    <SvgIcon {...props}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="#262527"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
  const getdefaultLabel = () => {
    let res;
    if (inputData) {
      res = selectedValue?.[labelKey];
    }
    if (defaultLabel) {
      res = defaultLabel;
    }
    return res ? res : defaultPlaceHolder;
  };
  const handleSearchInput = (e) => {
    setSearchText(e.target.value);
  };
  const filteredValues = React.useMemo(() => {
    if (searchText?.length > 0 && options?.length > 0) {
      return options?.filter(
        (option) =>
          (option?.id && option?.id?.toLowerCase().includes(searchText.toLowerCase())) ||
          (option?.name && option?.name?.toLowerCase().includes(searchText.toLowerCase())) ||
          (option?.label && option?.label?.toLowerCase().includes(searchText.toLowerCase())) ||
          (option?.value && option?.value?.toLowerCase().includes(searchText.toLowerCase())),
      );
    }
    return options;
  }, [searchText, options]);
  return (
    <FormControl className={classes.customInputSelect} sx={{ minWidth: '100%' }} error={!!error}>
      <Select
        IconComponent={ChevronDown}
        fullWidth
        disabled={disabled}
        value={inputData}
        name={name}
        onClose={() => setSearchText('')}
        onChange={onChange}
        displayEmpty={true}
        MenuProps={{
          autoFocus: false,
          classes: {
            paper: classes.paperContainer,
          },
        }}
        sx={{
          '& .MuiSelect-select .notranslate::after': getdefaultLabel()
            ? {
                content: `"${getdefaultLabel()}"`,
                color: '#cccccc',
              }
            : {},
        }}
      >
        {searchable && (
          <Box className={classes.customDropdownOptionsSearch}>
            <ListSubheader
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={classes.searchBar}
            >
              <TextField
                type="text"
                placeholder={t('form.input.textField.search.placeHolder')}
                value={searchText || ''}
                onChange={handleSearchInput}
                fullWidth
                autoFocus
                onKeyDown={(e) => {
                  if (e.key !== 'Escape') {
                    // Prevents autoselecting item while typing (default Select behaviour)
                    e.stopPropagation();
                  }
                }}
                className={classes.customDropdownSearchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </ListSubheader>
          </Box>
        )}
        {showFirst && (
          <>
            <MenuItem className={classes.selectPlaceholder} disabled value="">
              <Typography>
                {filteredValues?.length === 0
                  ? t('commonText.table.noRecordFound')
                  : defaultLabel
                    ? defaultLabel
                    : defaultPlaceHolder}
              </Typography>
            </MenuItem>
            {/* <MenuItem disabled defaultChecked value="">
              <ListItemText className={classes.menuItemText} />
            </MenuItem> */}
          </>
        )}

        {filteredValues?.map((option) => (
          <MenuItem key={option.id} value={option?.[inputKey]}>
            <ListItemText className={classes.menuItemText} primary={option?.[labelKey]} />
          </MenuItem>
        ))}
      </Select>
      <FieldError error={!!error && error} />
    </FormControl>
  );
};

SelectInput.propTypes = {
  defaultLabel: PropTypes.string,
  name: PropTypes.string.isRequired,
  inputKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  selectedValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  searchable: PropTypes.bool,
  showFirst: PropTypes.bool,
};

export default SelectInput;
