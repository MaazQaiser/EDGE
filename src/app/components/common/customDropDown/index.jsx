import { Box, InputAdornment, Popper, TextField, Tooltip, Typography } from '@mui/material';
import { ReactComponent as CheckMark } from 'assets/svg/commonDropdown/checkBox.svg?react';
import { ReactComponent as ChevronDown } from 'assets/svg/commonDropdown/chevronDown.svg?react';
import { ReactComponent as CloseIcon } from 'assets/svg/commonDropdown/close.svg?react';
import { ReactComponent as CrossTile } from 'assets/svg/commonDropdown/crossTile.svg?react';
import { ReactComponent as Search } from 'assets/svg/commonDropdown/search.svg?react';
import { ReactComponent as NotChecked } from 'assets/svg/commonDropdown/unChecked.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownEmailIcon } from 'src/assets/svg';
import useDebounceHook from 'src/hooks/useDebounceHook';

import InfiniteScrollCustom from '../infiniteScrollCustom';
import { useStyles } from './customDropDown';

const isObject = (val) => {
  if (val === null) {
    return false;
  }
  return typeof val === 'function' || typeof val === 'object';
};

const enumSelect = {
  all: 'all',
};

const descriptionTruncChars = 85;

/**
 * DropdownComponent is a reusable dropdown (select) input component.
 *
 * @param {String} name - Name of the select input which will be returned in event.target.
 * @param {String} label - The label for the dropdown.
 * @param {String} searchPlaceholder - Placeholder for searcustomDropdownOptionch field in dropdown
 * @param {Object} options - An array of objects representing the dropdown options. ?[NOTE]: fields will be label, value, description(optional)
 * @param {Object} additionalOption - Any valid react element to show on top of dropdown
 * @param {String|Array} selectedValues - The state variable to handle and store the selected option(s).
 * @param {Function} handleChange - A function to react to the selected values.
 * @param {Boolean} multiSelect - Set this to true if the dropdown is multi-select.
 * @param {Boolean} checkmark - Set this to true if checkmark are required in the dropdown options.
 * @param {Boolean} clearAll - Set this to true if you need ablity to clear selected values on cross icon click.
 * @param {Number|String} width - Set this to true if checkmark are required in the multi-select dropdown.
 * @param {Boolean} searchable - Set this to true to add search field in dropdown. ? NOTE: this search is local, work as filter using (includes)
 * @param {Boolean} withTiles - Set this to true to add chips. ? NOTE: it only support multi-select
 * @param {String} className - class name to add css to the dropdown.
 * @param {Boolean} borderd -  Set this true if you need border around selected value
 * @param {String} type - defines dropdown type.
 * @param {String} position - defines dropdown position either left or right.
 * @param {Boolean} placeHolder - to add placeholder in dropdown.
 * @param {String} placeHolderClassName - to add class name in placeholder.
 * @param {String} isError - if true, will make dropdown border red.
 * @param {Boolean} showEmailInLine - if true, will show description in line with label.
 * @param {Boolean} enableForceClose - if true, will close the drop down.
 * @param {Element} overrideOption - if checkmark is false and overrideOption is passed from parent it will show the overrideOption component
 * @return Component
 */
const CustomDropDown = React.forwardRef(
  (
    {
      enableForceClose = false,
      name,
      label,
      placeHolder,
      placeHolderClassName,
      options,
      additionalOption,
      selectedValues,
      handleChange,
      maxWidth = '290px',
      searchByDesc = false,
      multiSelect,
      checkmark,
      clearAll,
      searchable,
      withTiles,
      className,
      searchPlaceholder,
      isGrouped,
      bordered,
      position,
      isError,
      disabled,
      margin,
      showEmailInLine,
      overrideOption,
      selectedOptionClass,
      fetchMoreOptions = null,
      pagination = null,
      isLoading,
      fetchOptions,
      enableFetchOptions,
      zIndexValue,
      enableLowerCase,
      showLabelTooltip,
      // onCloseCleanup = () => {},
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const [searchText, setSearchText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const optionRefs = useRef([]); // Refs to track dropdown options
    const customSelectRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const dropdownHeaderRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const id = 'simple-popper';
    const dropdownWidth = anchorEl?.getBoundingClientRect?.().width || null;

    const [lastElement, setLastElement] = useState(null);
    const fetchMoreOptionsRef = useRef(fetchMoreOptions);
    fetchMoreOptionsRef.current = fetchMoreOptions;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          customSelectRef.current &&
          !customSelectRef.current.contains(event.target) &&
          dropdownHeaderRef.current &&
          !dropdownHeaderRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          if (searchText) {
            setSearchText('');
            if (searchable && fetchMoreOptionsRef.current) {
              fetchMoreOptionsRef.current(false, '');
            }
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchText, searchable]);

    useEffect(() => {
      if (fetchMoreOptions) fetchMoreOptions();
    }, []);

    const scrollToOption = (index) => {
      if (optionRefs.current[index]) {
        optionRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    const toggleSelect = (event) => {
      if (!isOpen && enableFetchOptions && !options?.length) fetchOptions();
      setIsOpen((prevState) => !prevState);

      setAnchorEl(event.currentTarget);
    };

    const handleOptionClick = (option) => {
      if (!option?.disabled) {
        const event = {
          target: {
            value: option,
            name: name,
          },
        };
        const exists =
          selectedValues.length && multiSelect
            ? selectedValues?.find((selected) => selected?.value === option?.value)
            : selectedValues?.value?.toString() === option?.value?.toString();

        const doesAllExists =
          selectedValues.length &&
          multiSelect &&
          selectedValues?.find((selected) => selected?.value === enumSelect.all);

        if (doesAllExists && multiSelect) {
          selectedValues = selectedValues?.filter((a) => a.value !== enumSelect.all);
        }

        const isAllSelected = option?.value === 'all';

        if (multiSelect) {
          if (exists) {
            const filterValues = selectedValues?.filter(
              (selected) => selected.value !== option.value,
            );
            event.target.value = filterValues;
            handleChange(event);
          } else {
            event.target.value = isAllSelected ? [option] : [...selectedValues, option];

            handleChange(event);
          }
          if (enableForceClose) {
            setIsOpen(false);
          }
          return;
        }

        // if multi select is false and option is already selected then clear selection
        if (exists && !multiSelect) {
          event.target.value = {};
          handleChange(event);
          setSearchText('');
          setIsOpen(false);
          return;
        }

        if (exists && checkmark) {
          event.target.value = {};
          handleChange(event);
          return;
        }

        handleChange(event);
        setSearchText('');
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (disabled || disabledIfNotDataExists) return;
      if (e.key === 'Enter' && !isOpen) {
        toggleSelect(e);
      } else if (e.key === 'Enter' && isOpen) {
        toggleSelect(e);
        if (focusedIndex !== -1) {
          handleOptionClick(options[focusedIndex]);
          setFocusedIndex(-1);
        }
      } else if (e.key === 'Escape' || e.key === 'Tab') {
        setIsOpen(false);
        setFocusedIndex(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = Math.min(prev + 1, options.length - 1);
          scrollToOption(newIndex);
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          scrollToOption(newIndex);
          return newIndex;
        });
      }
    };

    const isOptionSelected = (option) => {
      return selectedValues.length && multiSelect
        ? selectedValues?.some((selected) => selected?.value === option?.value)
        : selectedValues?.value?.toString() === option?.value?.toString();
    };

    const clear = (e) => {
      e.stopPropagation();
      const event = {
        target: {
          value: {},
          name: name,
        },
      };
      if (multiSelect) {
        event.target.value = [];
      }

      handleChange(event);
    };

    const CheckBoxComponent = () => {
      return (
        <Box className={classes.customDropdownCheckbox}>
          <Box className={classes.customDropdownCheckboxIcon}>
            <CheckMark />
          </Box>
        </Box>
      );
    };

    const NotCheckedComponent = () => {
      return (
        <Box className={classes.customDropdownCheckbox}>
          <Box className={classes.customDropdownCheckboxIcon}>
            <NotChecked />
          </Box>
        </Box>
      );
    };

    const TooltipComp = ({ data }) => (
      <Tooltip
        PopperProps={{ style: { zIndex: 10000 } }}
        arrow
        title={data}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        {data.substring(0, descriptionTruncChars) + '...'}
      </Tooltip>
    );

    TooltipComp.propTypes = {
      data: PropTypes.string.isRequired,
    };

    const showTooltip = (text) => (
      <>{text && text?.length > descriptionTruncChars ? <TooltipComp data={text} /> : text}</>
    );

    const MenuOption = ({ data }) => {
      if (data?.description) {
        return (
          <>
            {data?.image && <Avatar image={data.image} />}
            <Box
              className={classNames(
                classes.customDropdownTextBox,
                showEmailInLine && classes.showEmailInLineClass,
              )}
            >
              <Typography
                className={classNames(
                  classes.dropdownName,
                  showEmailInLine && classes.showEmailInLineName,
                )}
                component="h4"
                variant="body2"
              >
                {data.label || data.description}
              </Typography>
              <Box className={showEmailInLine && classes.dropdownEmailWrap}>
                {showEmailInLine && <DropdownEmailIcon />}
                <Typography
                  variant="body2"
                  className={classNames(
                    classes.customDropdownOptionListText,
                    showEmailInLine && classes.showEmailInLineIcon,
                  )}
                >
                  {showTooltip(data.description)}
                </Typography>
              </Box>
            </Box>
          </>
        );
      }

      return (
        <>
          {data?.image && <Avatar image={data.image} />}{' '}
          <Typography
            variant="body2"
            className={
              enableLowerCase
                ? classes.lowercaseCustomDropdownLabelText
                : classes.customDropdownLabelText
            }
          >
            {data.label && data.label?.length > 80 ? (
              <Tooltip
                PopperProps={{ style: { zIndex: 10000 } }}
                arrow
                title={data.label}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -14],
                        },
                      },
                    ],
                  },
                }}
              >
                {data.label.substring(0, 80) + '...'}
              </Tooltip>
            ) : (
              data.label
            )}
          </Typography>
        </>
      );
    };

    MenuOption.propTypes = {
      data: PropTypes.object.isRequired,
    };

    const Avatar = ({ image }) => {
      const defaultAvatar = 'https://signalassets.blob.core.windows.net/signal/assets/Avatar.png';
      return (
        <img
          className={classes.customDropdownAvatar}
          src={image || defaultAvatar}
          alt="Avatar"
          onError={(e) => {
            return (e.target.src = defaultAvatar);
          }}
        />
      );
    };

    Avatar.propTypes = {
      image: PropTypes.string.isRequired,
    };

    const fetchMoreCallBack = useDebounceHook(fetchMoreOptions, 200);

    const handleSearch = (e) => {
      if (searchable && fetchMoreOptions) {
        setSearchText(e.target.value);

        fetchMoreCallBack(false, e.target.value);
        // useDebounceHook(fetchMoreOptions(false, e.target.value), 500);
      } else {
        setSearchText(e.target.value);
      }
    };

    const simpleOptionsMap = () => {
      let filterOptions = [];
      if (searchable) {
        filterOptions = options?.filter(
          (option) =>
            option.label?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
            (searchByDesc &&
              option.description?.toLowerCase()?.includes(searchText?.toLowerCase())),
        );
      } else {
        filterOptions = options;
      }

      return filterOptions?.map((d, i) => {
        const isSelected = isOptionSelected(d);
        const isDisabled = d?.disabled || false;
        const activeIndex = i === focusedIndex;
        const className = classNames(
          classes.customDropdownOption,
          isSelected && !checkmark && classes.customDropdownSelected,
          isDisabled && classes.customDropdownSelectedOptionsDisabled,
          activeIndex && classes.customDropdownSelected,
        );

        const isLastElement = i === options.length - 1 && options.length <= pagination?.totalCount;

        return (
          <Box
            ref={(el) => {
              optionRefs.current[i] = el; // Store element in optionRefs array
              if (isLastElement) {
                setLastElement(el); // Set the last element separately
              }
            }}
            key={i}
            className={className}
            onMouseDown={(event) => {
              event?.stopPropagation();
              setFocusedIndex(i);
              handleOptionClick(d);
            }}
            onMouseEnter={() => {
              setFocusedIndex(i);
            }}
          >
            {!overrideOption && <MenuOption data={d} />}
            {isSelected ? checkmark && <CheckBoxComponent /> : checkmark && <NotCheckedComponent />}
            {!checkmark && overrideOption && typeof overrideOption === 'function'
              ? overrideOption(d, isSelected)
              : overrideOption}
          </Box>
        );
      });
    };

    const groupedOptionsMap = () => {
      const filterOptions = options?.map((option) => {
        return {
          ...option,
          data: option?.data?.filter((a) =>
            a?.label?.toLowerCase()?.includes(searchText?.toLowerCase()),
          ),
        };
      });

      const optionsArray = [];

      for (let i = 0; i < filterOptions?.length; i++) {
        const elements = filterOptions?.[i]?.data;
        const className = classNames(classes.customDropdownOptionTitle);
        if (filterOptions?.[i].title) {
          optionsArray.push(
            <Typography variant="subtitle2" key={filterOptions?.[i].title} className={className}>
              {filterOptions[i]?.title}
            </Typography>,
          );
        }

        for (let j = 0; j < elements?.length; j++) {
          // eslint-disable-next-line react/prop-types
          const data = elements[j];
          const isSelected = isOptionSelected(data);

          // eslint-disable-next-line react/prop-types
          const isDisabled = data?.disabled || false;

          const className = classNames(
            classes.customDropdownOption,
            isSelected && !checkmark && classes.customDropdownSelected,
            isDisabled && classes.customDropdownSelectedOptionsDisabled,
          );
          // eslint-disable-next-line react/prop-types
          if (data?.value && data?.label) {
            optionsArray.push(
              // eslint-disable-next-line react/prop-types
              <Box key={data.value} className={className} onClick={() => handleOptionClick(data)}>
                <MenuOption data={data} />
                {isSelected
                  ? checkmark && <CheckBoxComponent />
                  : checkmark && <NotCheckedComponent />}
              </Box>,
            );
          }
        }
      }

      return optionsArray;
    };

    const filteredOptions = () => {
      const params = {
        options,
        searchText,
        selectedValues,
      };

      return isGrouped ? (
        groupedOptionsMap(params)
      ) : (
        <InfiniteScrollCustom
          totalNoOfRecords={options?.length}
          noOfRecordsBeingDisplayed={options?.length}
          lastElement={lastElement}
          body={simpleOptionsMap}
          getMoreData={() => {
            pagination?.currentPage < pagination?.totalPages && fetchMoreOptions(true, searchText);
          }}
        />
      );
    };
    const truncateLabel = (label, maxLength) => {
      return label.length > maxLength ? label.substring(0, maxLength) + '...' : label;
    };
    const renderTiles = useMemo(() => {
      const tiles = [];
      for (let i = 0; i < selectedValues?.length; i++) {
        const option = selectedValues[i];
        tiles.push(
          <Box key={option.value} className={classes.customDropdownSelectedTile}>
            <Typography className={classes.customDropdownSelectedTileText} variant="subtitle2">
              {option.label}
            </Typography>

            <CrossTile onClick={() => handleOptionClick(option)} />
          </Box>,
        );
      }
      return tiles;
    }, [selectedValues]);

    if (multiSelect && !Array.isArray(selectedValues)) {
      console.error('Provide a array of objects containing value and label as there keys');
      return null;
    }

    if (!multiSelect && (!isObject(selectedValues) || Array.isArray(selectedValues))) {
      console.error('Provide an object containing value and label as there keys');
      return null;
    }

    const searchBarPlaceHolder = searchPlaceholder
      ? searchPlaceholder
      : t('commonText.dropDown.searchPlaceholder');

    const selectOption = t('form.input.textField.selectOption.label');

    const selectOptions = t('form.input.textField.selectOptions.label');

    const selectLabel = selectedValues?.label ? selectedValues.label : label || selectOptions;

    const selectedlength = selectedValues?.length;

    const multiSelectLabel =
      selectedlength > 0 ? `${label || selectOption} (${selectedlength})` : label || selectOption;

    const placeHolderUpdatedClassName = placeHolder
      ? classNames(classes.customDropdownPlaceHolder, placeHolderClassName)
      : classes.customDropdownLabel;

    const multiSelectBordered = multiSelect && selectedValues.length > 0;

    const errorClass = 'Mui-error';

    const disabledIfNotDataExists = additionalOption
      ? false
      : fetchMoreOptions
        ? false
        : enableFetchOptions
          ? false
          : !options?.length;

    return (
      <>
        <Box
          className={classNames(
            classes.customDropdownSelect,
            className,
            bordered && classes.bordered,
            bordered && isOpen && classes.dropdownOpen,
            bordered && isFocused && !disabled && classes.dropdownOpen,
            bordered && isError && classes.error,
            bordered && isError && errorClass,
            bordered && isError && isOpen && classes.errorDropdownOpen,
            bordered && (disabled || disabledIfNotDataExists) && classes.disabledBorderd,
            (disabled || disabledIfNotDataExists) && classes.disabled,
            multiSelectBordered && classes.bordered,
          )}
          aria-describedby={id}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // ref={customSelectRef}
          ref={ref}
          tabIndex={disabled || disabledIfNotDataExists ? -1 : 0} // Prevents focus when disabled
          onKeyDown={handleKeyDown}
        >
          <Box
            className={classes.customDropdownSelectHeader}
            ref={dropdownHeaderRef}
            onClick={toggleSelect}
          >
            {multiSelect ? (
              <Box className={classes.customDropdownSelectedOptions}>
                {selectedValues?.length ? (
                  <Typography
                    variant="subtitle2"
                    // className={classNames(className, colorChange && classes.colorChange)}
                  >
                    {multiSelectLabel}
                  </Typography>
                ) : (
                  <Typography variant="subtitle2" className={placeHolderUpdatedClassName}>
                    {placeHolder || multiSelectLabel}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box className={classes.customDropdownSelectedOption}>
                {selectedValues?.label || selectedValues?.description ? (
                  <>
                    {selectedValues?.image && <Avatar image={selectedValues.image} />}
                    {showLabelTooltip ? (
                      <Tooltip title={selectLabel}>
                        <Typography variant="subtitle2" className={classNames(selectedOptionClass)}>
                          {truncateLabel(selectLabel, 20)}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="subtitle2" className={classNames(selectedOptionClass)}>
                        {truncateLabel(selectLabel, 20)}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="subtitle2" className={placeHolderUpdatedClassName}>
                    {placeHolder || selectLabel}
                  </Typography>
                )}
              </Box>
            )}
            <Box className={classNames(classes.customDropdownIcon, isOpen && classes.open)}>
              {(multiSelect ? selectedValues?.length > 0 : selectedValues?.value) && clearAll ? (
                <CloseIcon onClick={clear} />
              ) : placeHolder ? (
                <ChevronDown className={classes.placeHolderColor} />
              ) : (
                <ChevronDown />
              )}
            </Box>
          </Box>
        </Box>
        {isOpen && (
          <Popper
            id={id}
            open={isOpen}
            anchorEl={anchorEl}
            placement={'bottom-start'}
            style={{
              zIndex: `${zIndexValue}`,
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: `1px solid #e6e6e7`,
              boxShadow:
                '0px 4px 6px -2px rgba(16, 24, 40, 0.05), 0px 12px 16px -4px rgba(16, 24, 40, 0.1)',
              width: dropdownWidth || (maxWidth ? maxWidth : '290px'),
              maxHeight: '270px',
              overflowY: 'auto',
              padding: '4px 0px',
            }}
            modifiers={[
              {
                name: 'flip',
                enabled: true, // Enable the flip behavior
                options: {
                  altBoundary: true,
                  rootBoundary: 'viewport',
                  padding: 8, // Optional: Adjust space from the edge of the viewport
                },
              },
              {
                name: 'preventOverflow',
                enabled: true, // Ensures it doesn’t overflow outside the viewport
                options: {
                  boundary: 'viewport',
                },
              },
              {
                name: 'offset',
                options: {
                  offset: [0, 4], // Adjust this to add spacing between button and dropdown
                },
              },
            ]}
            className={classNames(
              classes.customDropdownOptionsList,
              margin === 'set' && classes.customFranchiseList,
              position === 'right' && classes.positionRight,
            )}
            ref={customSelectRef}
          >
            {/* <Box
            className={classNames(
              classes.customDropdownOptionsList,
              margin === 'set' && classes.customFranchiseList,
              position === 'right' && classes.positionRight,
            )}
            // ref={menuRef}
          > */}
            {searchable && (
              <Box className={classes.customDropdownOptionsSearch}>
                <TextField
                  type="text"
                  placeholder={searchBarPlaceHolder}
                  value={searchText}
                  onChange={handleSearch}
                  fullWidth
                  className={classes.customDropdownSearchField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {multiSelect && withTiles && selectedValues.length > 0 && (
              <Box className={classes.customDropdownSelectedTiles}>{renderTiles}</Box>
            )}

            {additionalOption && additionalOption}

            {!isLoading && !options?.length ? (
              <Typography variant="subtitle1" className={classes.noRecordFoundTitle}>
                {t('commonText.table.noRecordFound')}
              </Typography>
            ) : (
              filteredOptions()
            )}

            {isLoading && (
              <Box className={classes.loadingWrapper}>
                <Box className={classes.loadingState}></Box>
              </Box>
            )}
            {/* </Box> */}
          </Popper>
        )}
      </>
    );
  },
);
CustomDropDown.displayName = 'CustomDropDown';

CustomDropDown.propTypes = {
  label: PropTypes.string,
  placeHolder: PropTypes.string,
  className: PropTypes.string,
  popperClass: PropTypes.string,
  colorChange: PropTypes.string,
  placeHolderClassName: PropTypes.string,
  options: PropTypes.array.isRequired,
  additionalOption: PropTypes.node,
  selectedValues: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
  handleChange: PropTypes.any,
  multiSelect: PropTypes.bool,
  checkmark: PropTypes.bool,
  clearAll: PropTypes.bool,
  searchable: PropTypes.bool,
  withTiles: PropTypes.bool,
  isGrouped: PropTypes.bool,
  isError: PropTypes.bool,
  name: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  searchPlaceholder: PropTypes.string,
  position: PropTypes.string,
  margin: PropTypes.string,
  bordered: PropTypes.bool,
  disabled: PropTypes.bool,
  enableForceClose: PropTypes.bool,
  showEmailInLine: PropTypes.bool,
  overrideOption: PropTypes.element,
  selectedOptionClass: PropTypes.string,
  pagination: PropTypes.object,
  fetchMoreOptions: PropTypes.func,
  onCloseCleanup: PropTypes.func,
  isLoading: PropTypes.bool,
  fetchOptions: PropTypes.func,
  enableFetchOptions: PropTypes.bool,
  zIndexValue: PropTypes.number,
  searchByDesc: PropTypes.bool,
  maxWidth: PropTypes.string,
  enableLowerCase: PropTypes.bool,
  showLabelTooltip: PropTypes.bool,
};

CustomDropDown.defaultProps = {
  enableForceClose: false,
  label: '',
  placeHolder: '',
  placeHolderClassName: '',
  popperClass: '',
  multiSelect: false,
  checkmark: false,
  clearAll: false,
  searchable: false,
  withTiles: false,
  isGrouped: false,
  isError: false,
  bordered: false,
  className: '',
  width: 300,
  searchPlaceholder: '',
  borderd: false,
  disabled: false,
  position: 'left',
  margin: 'unset',
  showEmailInLine: false,
  colorChange: '',
  additionalOption: null,
  overrideOption: null,
  isLoading: false,
  zIndexValue: '10000',
  fetchOptions: () => {},
  enableFetchOptions: false,
  enableLowerCase: false,
  showLabelTooltip: false,
};

export default CustomDropDown;
