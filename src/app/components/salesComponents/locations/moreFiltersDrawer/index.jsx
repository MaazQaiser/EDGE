import { Button, Chip, InputLabel, TextField, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { ReactComponent as ChevronDown } from 'assets/svg/chevronDown.svg?react';
import { ReactComponent as GreyInfoIcon } from 'assets/svg/greyInfoIcon.svg?react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { locationScoreFilterOptions } from 'src/app/sales/pages/locations/listing/locations.constant';
import { Clossicon } from 'src/assets/svg';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { getIndustryTypes } from 'src/services/company.service';
import { getInternsAndSalesPersons } from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import {
  locationTypeDropdownOptions,
  sitesDropdownOptions,
  stagesDropdownOptions,
} from '../newLocationsDrawer/location.constant';
import { useStyles } from './moreFiltersDrawer.js';
const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  industryType: 'industryType',
  associatedCompanyIds: 'associatedCompanyIds',
  parentCompanyIds: 'parentCompanyIds',
  postalCode: 'postalCode',
  postalCodes: 'postalCodes',
  hsId: 'hsId',
  assignedTo: 'assignedTo',
  industry: 'industry',
};

const arrayFiltersEmptyState = {
  associatedCompanyIds: [],
  parentCompanyIds: [],
  assignedTo: [],
};

const MoreFiltersDrawer = ({
  anchor,
  filterCloseDrawer,
  width,
  formData_,
  setFormData_,
  handleClearFilters,
  applyFilters,
  emptyState,
  companies,
  setCompaniesFilters,
  companiesPagination,
  fetchCompanies,
  loadingCompaniesDropDown,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({ ...formData_ });
  const [options, setOptions] = useState({
    industries: [],
  });
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsVisible(false);
    }
  };
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  const [interneesAndSalesPersons, setInterneesAndSalesPersons] = useState([]);
  /**
   * hook to for address
   */
  const { CityHookComponent, StateHookComponent } = useCountryCityStateHook({
    formData,
    setFormData,
    errorMessages: {},
    setErrorMessages: () => {},
    multiStates: true,
    multiCities: true,
    stateProps: {
      placeHolder: t('sales.users.selectStates'),
      bordered: true,
      className: classes.dropdownWrap,
      placeHolderClassName: classes.placeHolderColor,
    },
    cityProps: {
      placeHolder: t('sales.users.selectCities'),
      bordered: true,
      className: classes.dropdownWrap,
      placeHolderClassName: classes.placeHolderColor,
    },
  });

  /**
   *
   * @param {*} event
   * @param {*} field
   * @returns
   */
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    // if ((name === 'minUnits' || name === 'maxUnits') && Number(value) < 0) {
    //   value = 0;
    // }
    // if (name === 'minUnits' && formData.maxUnits && Number(value) > Number(formData.maxUnits)) {
    //   value = formData.maxUnits;
    // }
    // if (name === 'maxUnits' && formData.minUnits && Number(value) < Number(formData?.minUnits)) {
    //   value = formData?.minUnits;
    // }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const checkMinMaxValue = (event) => {
    let { name, value } = event.target;
    if ((name === 'minUnits' || name === 'maxUnits') && Number(value) < 0) {
      value = 0;
    }
    if (
      name === 'minUnits' &&
      value &&
      formData.maxUnits &&
      Number(value) > Number(formData.maxUnits)
    ) {
      toaster.info({
        text: 'Min cannot not be greater than Max',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      value = formData.maxUnits;
    }
    if (
      name === 'maxUnits' &&
      value &&
      formData.minUnits &&
      Number(value) < Number(formData?.minUnits)
    ) {
      toaster.info({
        text: 'Max cannot not be less than Min',
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      value = formData?.minUnits;
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const minMaxValue = () => {
    const minMaxPlaceholder = {
      class: '',
      text: t('sales.locations.noOfUnits'),
    };
    if (formData?.minUnits && !formData?.maxUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.min')}: ${formData?.minUnits}`;
      return minMaxPlaceholder;
    }
    if (formData?.maxUnits && !formData?.minUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.max')}: ${formData?.maxUnits}`;
      return minMaxPlaceholder;
    }
    if (formData?.minUnits && formData?.maxUnits) {
      minMaxPlaceholder.class = classes.PlaceHolderClass;
      minMaxPlaceholder.text = `${t('sales.locations.min')}: ${formData?.minUnits} & ${t('sales.locations.max')}: ${formData?.maxUnits}`;
      return minMaxPlaceholder;
      // return `${t('sales.locations.min')}: ${formData?.minUnits} & ${t('sales.locations.max')}: ${formData?.maxUnits}`;
    }
    return minMaxPlaceholder;
  };

  const handleChipDelete = (e, index) => {
    e.stopPropagation(); // Prevent onChange from being called

    const data = [...formData[queryKeys.postalCodes]];

    const afterRemove = data.filter((_a, i) => i !== index);

    setFormData((prevState) => ({
      ...prevState,
      [queryKeys.postalCodes]: afterRemove,
    }));
  };

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    if (field === queryKeys.postalCodes) {
      if (event.target.value) {
        setFormData((prevState) => ({
          ...prevState,
          [field]: [...prevState[field], event.target.value],
        }));
      }
      return;
    }

    if (field === queryKeys.hsId) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: event.target.value,
      }));
      return;
    }
    /**
     * get the ids from selected values
     */

    let selectedValues = event.target.value?.map((value) => value.value);

    if (field === queryKeys.parentCompanyIds || field === queryKeys.associatedCompanyIds) {
      selectedValues = event.target.value;
    }

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
    const companyFilter = event.target.value?.map((value) => ({
      value: value.value,
      label: value.label,
    }));
    setCompaniesFilters((prevState) => ({
      ...prevState,
      [field]: companyFilter,
    }));
  };

  /**
   * Fetch list of sales perons and interns
   * @param {*} page
   * @param {*} query
   */
  const fetchInternsAndSalesPersons = async (_stateIds) => {
    try {
      const response = await getInternsAndSalesPersons();
      if (response.statusCode === 200) {
        const data = response?.data?.internsAndSalesPersons;
        const mappedTypeWithNameData = data?.map((assignedUser) => ({
          ...assignedUser,
          fullName: assignedUser?.type
            ? `${assignedUser?.fullName} (${assignedUser.type})`
            : fullName,
        }));
        setInterneesAndSalesPersons(mappedTypeWithNameData);
      }
    } catch (error) {
      /**
       * show error
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * fetch industry verticals
   */
  const fetchIndustryVerticalOptions = async () => {
    try {
      const response = await getIndustryTypes();
      if (response?.statusCode === 200) {
        const verticals = response?.data?.industryVerticals || {};
        const tempIndustryVerticals = Object.keys(verticals)
          .map((key) => ({
            name: verticals[key],
            id: key,
          }))
          // Sort the industry verticals based on label to show industries in alphabetic order
          .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

        setOptions((prevOptions) => ({
          ...prevOptions,
          industries: tempIndustryVerticals,
        }));
      }
    } catch (error) {
      //error handelr
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  useEffect(() => {
    /**
     * will be used in next release
     */
    fetchInternsAndSalesPersons();
    fetchIndustryVerticalOptions();
  }, []);

  const filterItemsByProperty = (formData, propertyName, items) => {
    const propertyValues =
      (propertyName && formData?.[propertyName]?.map((value) => parseInt(value, 10))) || [];
    return items.filter((item) => propertyValues.includes(item.id));
  };
  const memoizedSelectedValueCompany = useMemo(() => {
    return transformArrayForOptions(formData[queryKeys.associatedCompanyIds], 'name', 'id') || [];
  }, [JSON.stringify(formData), companies]);

  const memoizedSelectedParentCompany = useMemo(() => {
    return transformArrayForOptions(formData[queryKeys.parentCompanyIds], 'name', 'id') || [];
  }, [JSON.stringify(formData), companies]);

  const memoizedAssignedTo = useMemo(() => {
    return filterItemsByProperty(formData, 'assignedTo', interneesAndSalesPersons);
  }, [JSON.stringify(formData), interneesAndSalesPersons]);

  const memoizedSelectedIndustryVerticals = useMemo(() => {
    return options?.industries.filter((industrie) => formData?.industry.includes(industrie.id));
  }, [JSON.stringify(formData), options?.industries]);

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Box className={classes?.sideHeader}>
        <DrawerHeader
          title={t('sales.locations.allFilters')}
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
          className={classes.moreFilterHeader}
        />

        <Button
          className={classes.moreFilter}
          // Disable the button if both formData and formData_ match the emptyState
          disabled={
            JSON.stringify({ ...formData, status: emptyState.status }) ===
              JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData_, status: emptyState.status }) ===
              JSON.stringify(emptyState)
          }
          onClick={(_e) => {
            handleClearFilters();
            setFormData(emptyState);
            setCompaniesFilters(arrayFiltersEmptyState);
          }}
          variant="tertiaryGrey"
          disableRipple
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>

      <Box className={classNames(classes.moreFilterForm, 'innerScrollBar')}>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.locationType')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.locationType')}
            name="locationType"
            id="locationType"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.locationType')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(locationTypeDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.locationType || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.score')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.score')}
            name="score"
            id="score"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.score')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(locationScoreFilterOptions, 'name', 'id') || []}
            selectedValues={formData?.score || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.stages')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.stage')}
            name="stage"
            id="stage"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.stages')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(stagesDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.stage || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.sites')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.sites')}
            name="site"
            id="site"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.sites')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(sitesDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.site || {}}
            handleChange={inputChangedHandler}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.users.industryVerticals')}</InputLabel>
          <CustomDropDown
            label={t('sales.users.industryVerticals')}
            name="industry"
            id="industry"
            placeHolder={`${t('sales.locations.select')} ${t('sales.users.industryVerticals')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(options?.industries, 'name', 'id') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedIndustryVerticals, 'name', 'id') || []
            }
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.industry)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes?.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.companies.states')}</InputLabel>
          <StateHookComponent bordered={true} />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.companies.cities')}</InputLabel>
          <CityHookComponent bordered={true} />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.associatedCompany')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.companyAssociated')}
            name="companyAssociated"
            id="companyAssociated"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.companyAssociated')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={memoizedSelectedValueCompany}
            handleChange={(event) =>
              handleMultipleSelectedValues(event, queryKeys.associatedCompanyIds)
            }
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            pagination={companiesPagination}
            fetchMoreOptions={fetchCompanies}
            isLoading={loadingCompaniesDropDown}
            withTiles
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.zipCode')}</InputLabel>
          {/*<TextField*/}
          {/*  name="postalCode"*/}
          {/*  id="postalCode"*/}
          {/*  fullWidth*/}
          {/*  placeholder={t('sales.locations.addZipCode')}*/}
          {/*  type="text"*/}
          {/*  onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCode)}*/}
          {/*  value={formData?.postalCode || ''}*/}
          {/*  className={classes.textFiledFil}*/}
          {/*/>*/}
          <Autocomplete
            multiple
            disableClearable={true}
            id={'postalCodes'}
            options={[]}
            // defaultValue={{}}
            value={formData.postalCodes}
            className={classes.autoCompleteField}
            freeSolo
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCodes)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                  <Chip
                    variant="outlined"
                    label={option}
                    key={key}
                    {...tagProps}
                    onDelete={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleChipDelete(event, index);
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                id={'postalCodes-text'}
                name={'postalCodes'}
                variant="filled"
                label=""
                placeholder={t('sales.locations.addZipCode')}
                type="text"
                className={classes.autoCompleteTextField}
              />
            )}
          />
        </Box>

        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.parentCompany')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.parentCompany')}
            name="parentCompany"
            id="parentCompany"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.parentCompany')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(companies, 'name', 'id') || []}
            selectedValues={memoizedSelectedParentCompany}
            handleChange={(event) =>
              handleMultipleSelectedValues(event, queryKeys.parentCompanyIds)
            }
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            pagination={companiesPagination}
            fetchMoreOptions={fetchCompanies}
            isLoading={loadingCompaniesDropDown}
            withTiles
          />
        </Box>

        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.locationId')}</InputLabel>
          <TextField
            className={classes?.textFiledFilter}
            name="id"
            id="id"
            fullWidth
            placeholder={t('sales.locations.addId')}
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.hsId)}
            value={formData?.hsId || ''}
          />
        </Box>
        {/* will be used in next release. Functionality implemented */}
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>Assigned To</InputLabel>
          <CustomDropDown
            label={t('sales.locations.assignedUserName')}
            name="assignedTo"
            id="assignedTo"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.assignedUserName')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={
              transformArrayForOptions(interneesAndSalesPersons, 'fullName', 'id', 'email') || []
            }
            selectedValues={transformArrayForOptions(memoizedAssignedTo, 'fullName', 'id') || []}
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.assignedTo)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.customBtns}`} ref={containerRef}>
          <InputLabel>
            {t('sales.locations.noOfUnits')}
            <Tooltip title={'Max value should always be greater than or equal to min value'} arrow>
              <GreyInfoIcon />
            </Tooltip>
          </InputLabel>
          <Button
            variant="onlyText"
            className={`${minMaxValue().class ? minMaxValue().class : classes.popButton} `}
            endIcon={<ChevronDown className={isVisible ? classes.iconRotated : ''} />}
            disableRipple
            onClick={handleClick}
          >
            {/*{t('sales.locations.noOfUnits')}*/}
            {minMaxValue().text}
          </Button>
          <Box className={`${classes.InlineRangeField} ${isVisible ? classes.visible : ''}`}>
            <Box className={classes.inBox}>
              <TextField
                type="number"
                fullWidth
                className={classes.customDropdownSearchField}
                placeholder={t('sales.locations.min')}
                name={'minUnits'}
                id={'minUnits'}
                onChange={inputChangedHandler}
                onBlur={checkMinMaxValue}
                value={formData.minUnits || ''}
                min={0}
                max={formData.maxUnits}
                InputProps={{ inputProps: { min: 0, max: formData.maxUnits } }}
              />
              -
              <TextField
                type="number"
                fullWidth
                className={classes.customDropdownSearchField}
                placeholder={t('sales.locations.max')}
                name={'maxUnits'}
                id={'maxUnits'}
                onChange={inputChangedHandler}
                onBlur={checkMinMaxValue}
                value={formData.maxUnits || ''}
                min={formData.minUnits}
                // max={formData.maxUnits}
                InputProps={{ inputProps: { min: formData.minUnits } }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <DrawerFooter
        bulkApply={t('sales.locations.applyFilters')}
        bulkCancel={t('sales.locations.cancel')}
        handleCloseDrawer={filterCloseDrawer}
        anchor={anchor}
        type="submit"
        setFormData={setFormData_}
        applyFilters={applyFilters}
        drawerQuery={{
          ...formData,
        }}
        disabled={
          JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState) &&
          JSON.stringify({ ...formData }) === JSON.stringify(emptyState)
        }
        classNameFooter={classes.moreFilterFooter}
      />
    </Box>
  );
};

MoreFiltersDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  handleClearFilters: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.object,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setCompaniesFilters: PropTypes.func,
  companiesPagination: PropTypes.object,
  fetchCompanies: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default MoreFiltersDrawer;
