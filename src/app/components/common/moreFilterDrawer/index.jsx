import { Button, Chip, InputLabel, Stack, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { Clossicon } from 'src/assets/svg';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';

import DrawerFooter from '../../salesComponents/components/drawerFooter';
import DrawerHeader from '../../salesComponents/components/drawerHeader';
import { useStyles } from './moreFiltersDrawer.styles.js';

const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  industryType: 'industryType',
  associatedCompanyIds: 'associatedCompanyIds',
  parentCompanyIds: 'parentCompanyIds',
  postalCode: 'postalCode',
  hsId: 'hsId',
  assignedTo: 'assignedTo',
};

const MoreFilterDrawer = ({
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
  fetchMoreOptions,
  loadingCompaniesDropDown,
  isDealDrawer,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({ ...formData_ });
  // const [interneesAndSalesPersons, setInterneesAndSalesPersons] = useState([]);
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
      searchPlaceholder: t('sales.users.searchStates'),
      bordered: true,
      className: classes.dropdownWrap,
      placeHolderClassName: classes.placeHolderColor,
    },
    cityProps: {
      placeHolder: t('sales.users.selectCities'),
      searchPlaceholder: t('sales.users.searchCities'),
      bordered: true,
      className: classes.dropdownWrap,
      placeHolderClassName: classes.placeHolderColor,
    },
  });

  const multipleSelectedAssociatedCompanies = async (event, field) => {
    const selectedValues = event.target.value?.map((value) => value);

    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedValues,
    }));
  };

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    if (field === queryKeys.postalCodes) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: [...prevState[field], event.target.value],
      }));
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
    const selectedValues = event.target.value?.map((value) => value.value);

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
    /**
     * will be used in next release
     */
  }, []);

  const filterItemsByProperty = (formData, propertyName, items) => {
    const propertyValues =
      (propertyName && formData?.[propertyName]?.map((value) => parseInt(value, 10))) || [];
    return items.filter((item) => propertyValues.includes(item.id));
  };
  const _memoizedSelectedValueCompany = useMemo(() => {
    return filterItemsByProperty(formData, 'associatedCompanyIds', companies);
  }, [JSON.stringify(formData), companies]);

  const _memoizedSelectedParentCompany = useMemo(() => {
    return filterItemsByProperty(formData, 'parentCompanyIds', companies);
  }, [JSON.stringify(formData), companies]);

  // const memoizedAssignedTo = useMemo(() => {
  //   return filterItemsByProperty(formData, 'assignedTo', interneesAndSalesPersons);
  // }, [JSON.stringify(formData), interneesAndSalesPersons]);

  return (
    <Box
      className={classes?.siderBarBox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
    >
      <Stack className={classes?.boxInner} justifyContent="space-between">
        <Box className={classes?.sideHeader}>
          <DrawerHeader
            title={t('sales.locations.allFilters')}
            handleCloseDrawer={filterCloseDrawer}
            anchor={anchor}
          />
          <Box className="closall">
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
              }}
            >
              {`${t('commonText.clearAll')}`} <Clossicon className={classes.filterIcon} />
            </Button>
          </Box>
          <Box className={classes?.moreFilterForm}>
            <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
              <InputLabel>{`${t('sales.users.states')}`}</InputLabel>
              <StateHookComponent bordered={true} />
            </Box>
            <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
              <InputLabel>{`${t('sales.users.cities')}`}</InputLabel>
              <CityHookComponent bordered={true} />
            </Box>
            <Box className={classes?.fieldWrapper}>
              <InputLabel>{`${t('sales.users.zipCode')}`}</InputLabel>
              <Autocomplete
                multiple
                disableClearable={true}
                id={'postalCodes'}
                options={[]}
                value={formData.postalCodes}
                className={classes.autoCompleteField}
                freeSolo
                onChange={(event) => handleMultipleSelectedValues(event, queryKeys.postalCodes)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip variant="outlined" label={option} key={key} {...tagProps} />;
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
              <InputLabel>{`${t('sales.users.parentCompany')}`}</InputLabel>
              <CustomDropDown
                label={t('sales.locations.parentCompany')}
                name="parentCompany"
                id="parentCompany"
                placeHolder={t('sales.users.selectparentCompany')}
                placeHolderClassName={classes.placeHolderColor}
                options={companies}
                selectedValues={formData.parentCompanies}
                handleChange={(event) => {
                  multipleSelectedAssociatedCompanies(event, 'parentCompanies');
                  handleMultipleSelectedValues(event, queryKeys.parentCompanyIds);
                }}
                searchPlaceholder={t('sales.users.searchparentCompany')}
                className={classes.dropdownWrap}
                multiSelect
                checkmark
                searchable
                bordered
                withTiles
                pagination={companiesPagination}
                fetchMoreOptions={fetchMoreOptions}
                isLoading={loadingCompaniesDropDown}
              />
            </Box>
            {isDealDrawer && (
              <Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>
                <InputLabel>{`${t('sales.users.companyAssociated')}`}</InputLabel>
                <CustomDropDown
                  label={t('sales.users.companyAssociated')}
                  name="companyAssociated"
                  id="companyAssociated"
                  placeHolder={t('sales.users.selectCompanyAssociated')}
                  placeHolderClassName={classes.placeHolderColor}
                  options={companies}
                  selectedValues={formData.associatedCompanies}
                  handleChange={(event) => {
                    multipleSelectedAssociatedCompanies(event, 'associatedCompanies');
                    handleMultipleSelectedValues(event, queryKeys.associatedCompanyIds);
                  }}
                  searchPlaceholder={t('sales.users.searchCompanyAssociated')}
                  className={classes.dropdownWrap}
                  multiSelect
                  checkmark
                  searchable
                  bordered
                  withTiles
                  pagination={companiesPagination}
                  fetchMoreOptions={fetchMoreOptions}
                  isLoading={loadingCompaniesDropDown}
                />
              </Box>
            )}
            <Box className={classes?.fieldWrapper}>
              <InputLabel>{`${t('sales.users.id')}`}</InputLabel>
              <TextField
                className={classes?.textFiledFilter}
                name="id"
                id="id"
                fullWidth
                placeholder={t('sales.users.addId')}
                onChange={(event) => handleMultipleSelectedValues(event, queryKeys.hsId)}
                value={formData?.hsId || ''}
              />
            </Box>
            {/* will be used in next release. Functionality implemented */}
          </Box>
        </Box>

        <DrawerFooter
          bulkApply={t('sales.users.applyFilters')}
          bulkCancel={t('sales.users.cancel')}
          handleCloseDrawer={filterCloseDrawer}
          anchor={anchor}
          type="submit"
          setFormData={setFormData_}
          applyFilters={applyFilters}
          drawerQuery={formData}
          disabled={
            JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState) &&
            JSON.stringify({ ...formData }) === JSON.stringify(emptyState)
          }
        />
      </Stack>
    </Box>
  );
};

MoreFilterDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  handleClearFilters: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.bool,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setCompaniesFilters: PropTypes.func,
  companiesPagination: PropTypes.object,
  fetchMoreOptions: PropTypes.func,
  loadingCompaniesDropDown: PropTypes.bool,
  isDealDrawer: PropTypes.bool,
};

MoreFilterDrawer.defaultProps = {
  anchor: '',
  filterCloseDrawer: () => {},
  width: 0,
  formData_: {},
  setFormData_: () => {},
  handleClearFilters: () => {},
  applyFilters: () => {},
  emptyState: true,
  companies: [],
  setCompaniesFilters: () => {},
  companiesPagination: {},
  fetchMoreOptions: () => {},
  loadingCompaniesDropDown: true,
  isDealDrawer: false,
};

export default MoreFilterDrawer;
