import { Button, Chip, InputLabel, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { getIndustryTypes } from 'src/services/company.service';
import { getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { sitesDropdownOptions } from '../../locations/newLocationsDrawer/location.constant';
import {
  dealTypeDropdownOptions,
  proposalStatusDealsDropdownOptions,
  stagesDealsDropdownOptions,
} from './listingMoreFilter.constant';
import { useStyles } from './listingMoreFilter.js';

const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  industryType: 'industryType',
  associatedCompanyIds: 'associatedCompanyIds',
  postalCode: 'postalCode',
  postalCodes: 'postalCodes',
  hsId: 'hsId',
  dealOwnerIds: 'dealOwnerIds',
  site: 'site',
  industryIds: 'industryIds',
};

const ListingMoreFiltersDrawer = ({
  anchor,
  filterCloseDrawer,
  width,
  formData_,
  setFormData_,
  // errorMessages,
  // setErrorMessages,
  // inputChangedHandler,
  applyFilters,
  emptyState,
  handleClearFilters,
  setCompaniesFilters,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({ ...formData_ });
  const [options, setOptions] = useState({
    dealOwners: [],
    industries: [],
  });

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
    const selectedValues = event.target.value?.map((value) => value.id);

    if (field === queryKeys.stateIds) {
      // Call updateCities when stateIds are updated
      fetchCities(selectedValues);
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

  useEffect(() => {
    if (formData_) setFormData({ ...formData_ });
  }, [formData_]);

  /**
   *
   * @param {*} event
   * @param {*} field
   * @returns
   */
  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200)
        setOptions((prevOptions) => ({
          ...prevOptions,
          dealOwners: response?.data?.owners,
        }));
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
    fetchDealOwners();
    fetchIndustryVerticalOptions();
  }, []);

  const memoizedSelectedValuesOwners = useMemo(() => {
    return options?.dealOwners.filter((dealOwners) =>
      formData?.dealOwnerIds.includes(dealOwners.id),
    );
  }, [JSON.stringify(formData), options?.dealOwners]);

  const memoizedSelectedIndustryVerticals = useMemo(() => {
    return options?.industries.filter((industrie) => formData?.industryIds.includes(industrie.id));
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
          disableRipple
          className={classes?.moreFilter} // Disable the button if both formData and formData match the emptyState
          disabled={
            JSON.stringify({ ...formData, status: emptyState.status }) ===
              JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData_, status: emptyState.status }) ===
              JSON.stringify(emptyState)
          }
          onClick={(_e) => {
            handleClearFilters();
            setFormData({ ...formData_ });
          }}
          variant="tertiaryGrey"
          endIcon={<Clossicon className={classes.filterIcon} />}
        >
          {`${t('commonText.clearAll')}`}
        </Button>
      </Box>
      <Box className={classNames(classes.moreFilterForm, 'innerScrollBar')}>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.dealType')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.dealType')}
            name="dealType"
            id="dealType"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.dealType')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(dealTypeDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.dealType || {}}
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.sites')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.sites')}
            name="sites"
            id="sites"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.sites')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(sitesDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.sites || {}}
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.stages')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.stages')}
            name="stage"
            id="stage"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.stages')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(stagesDealsDropdownOptions, 'name', 'id') || []}
            selectedValues={formData?.stage || {}}
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>

        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>{t('sales.locations.proposalStatus')}</InputLabel>
          <CustomDropDown
            label={t('sales.locations.proposalStatus')}
            name="proposalStatus"
            id="proposalStatus"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.proposalStatus')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={
              transformArrayForOptions(proposalStatusDealsDropdownOptions, 'name', 'id') || []
            }
            selectedValues={formData?.proposalStatus || {}}
            handleChange={inputChangedHandler}
            className={classes.dropdownWrap}
            bordered
          />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>Industry Verticals</InputLabel>
          <CustomDropDown
            label={t('sales.users.industryVerticals')}
            name="industryIds"
            id="industryIds"
            placeHolder={`${t('sales.locations.select')} ${t('sales.users.industryVerticals')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(options?.industries, 'name', 'id') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedIndustryVerticals, 'name', 'id') || []
            }
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.industryIds)}
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
          <InputLabel>States</InputLabel>
          <StateHookComponent />
        </Box>
        <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
          <InputLabel>Cities</InputLabel>
          <CityHookComponent bordered={true} />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.locations.zipCode')}</InputLabel>
          {/*<TextField*/}
          {/*  name="postalCode"*/}
          {/*  id="postalCode"*/}
          {/*  fullWidth*/}
          {/*  placeholder={t('sales.locations.addZipCode')}*/}
          {/*  type="text"*/}
          {/*  className={classes?.textFiledFilter}*/}
          {/*  onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCode)}*/}
          {/*  value={formData?.postalCode || ''}*/}
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
          <InputLabel>Assigned To</InputLabel>
          <CustomDropDown
            label={t('sales.locations.assignedUserName')}
            name="dealOwnerIds"
            id="dealOwnerIds"
            placeHolder={`${t('sales.locations.select')} ${t('sales.locations.assignedUserName')}`}
            placeHolderClassName={classes.placeHolderColor}
            options={transformArrayForOptions(options?.dealOwners, 'name', 'id', 'email') || []}
            selectedValues={
              transformArrayForOptions(memoizedSelectedValuesOwners, 'name', 'id', 'email') || []
            }
            handleChange={(event) => handleMultipleSelectedValues(event, queryKeys.dealOwnerIds)}
            searchPlaceholder={t('sales.locations.search')}
            className={classes?.dropdownWrap}
            multiSelect
            checkmark
            searchable
            bordered
            withTiles
          />
        </Box>
        <Box className={classes?.fieldWrapper}>
          <InputLabel>{t('sales.deals.dealsId')}</InputLabel>
          <TextField
            className={classes?.textFiledFilter}
            name="hsId"
            id="hsId"
            fullWidth
            placeholder={t('sales.locations.addId')}
            onChange={(event) => handleMultipleSelectedValues(event, queryKeys.hsId)}
            value={formData?.hsId || ''}
          />
        </Box>
      </Box>

      <DrawerFooter
        bulkApply={t('sales.locations.applyFilters')}
        bulkCancel={t('sales.locations.cancel')}
        handleCloseDrawer={filterCloseDrawer}
        setFormData={setFormData_}
        applyFilters={applyFilters}
        drawerQuery={formData}
        disabled={
          JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState) &&
          JSON.stringify({ ...formData }) === JSON.stringify(emptyState)
        }
        anchor={anchor}
        type="submit"
        classNameFooter={classes.moreFilterFooter}
      />
    </Box>
  );
};

ListingMoreFiltersDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  // errorMessages: PropTypes.array,
  // setErrorMessages: PropTypes.func,
  // inputChangedHandler: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.object,
  handleClearFilters: PropTypes.func,
  setCompaniesFilters: PropTypes.func,
};

export default ListingMoreFiltersDrawer;
