import { Button, InputLabel, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useState } from 'react';
// import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
// import DateRangePickerWithButtons from 'src/app/components/common/RangeDatepicker';
import { Clossicon } from 'src/assets/svg';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { useStyles } from './moreFiltersDrawer.js';

const queryKeys = {
  stateIds: 'stateIds',
  cityIds: 'cityIds',
  createdAt: 'createdAt',
  // industryTypeIds: 'industryTypeIds',
  // associatedCompanyIds: 'associatedCompanyIds',
  // parentCompanyIds: 'parentCompanyIds',
  // postalCode: 'postalCode',
  // hsId: 'hsId',
  // assignedTo: 'assignedTo',
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
  // companies,
  // industryTypes,
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

  const _handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    if (field === queryKeys.postalCode || field === queryKeys.hsId) {
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
  };

  useEffect(() => {}, []);

  // const filterItemsByProperty = (formData, propertyName, items) => {
  //   const propertyValues = new Set(formData?.[propertyName]?.map((value) => +value) || []);
  //   return items.filter((item) => propertyValues.has(+item.id));
  // };
  // const memoizedSelectedValueCompany = useMemo(() => {
  //   return filterItemsByProperty(formData, 'associatedCompanyIds', companies);
  // }, [JSON.stringify(formData), companies]);

  // const _memoizedSelectedParentCompany = useMemo(() => {
  //   return filterItemsByProperty(formData, 'parentCompanyIds', companies);
  // }, [JSON.stringify(formData), companies]);

  // const _memoizedSelectedValueIndustryType = useMemo(() => {
  //   return filterItemsByProperty(formData, 'industryTypeIds', industryTypes);
  // }, [JSON.stringify(formData?.industryTypeIds), industryTypes]);

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
                JSON.stringify({ ...formData }) === JSON.stringify(emptyState) &&
                JSON.stringify({ ...formData_ }) === JSON.stringify(emptyState)
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
            {/*<Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>*/}
            {/*  <InputLabel>{`${t('sales.users.createdAt')}`}</InputLabel>*/}
            {/*  <DateRangePickerWithButtons*/}
            {/*    placeHolder={`${t('sales.users.selectDateRange')}`}*/}
            {/*    selectedDates={formData?.createdAt}*/}
            {/*    setDates={(dates) => {*/}
            {/*      setFormData((prevState) => {*/}
            {/*        return {*/}
            {/*          ...prevState,*/}
            {/*          createdAt: dates,*/}
            {/*        };*/}
            {/*      });*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</Box>*/}
            {/*<Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>*/}
            {/*  <InputLabel>{`${t('sales.users.parentCompany')}`}</InputLabel>*/}
            {/*  <CustomDropDown*/}
            {/*    label={t('sales.users.parentCompany')}*/}
            {/*    name="parentCompany"*/}
            {/*    id="parentCompany"*/}
            {/*    placeHolder={t('sales.users.selectparentCompany')}*/}
            {/*    placeHolderClassName={classes.placeHolderColor}*/}
            {/*    options={transformArrayForOptions(companies, 'name', 'id') || []}*/}
            {/*    selectedValues={*/}
            {/*      transformArrayForOptions(memoizedSelectedParentCompany, 'name', 'id') || []*/}
            {/*    }*/}
            {/*    handleChange={(event) =>*/}
            {/*      handleMultipleSelectedValues(event, queryKeys.parentCompanyIds)*/}
            {/*    }*/}
            {/*    searchPlaceholder={t('sales.users.searchparentCompany')}*/}
            {/*    className={classes.dropdownWrap}*/}
            {/*    multiSelect*/}
            {/*    checkmark*/}
            {/*    searchable*/}
            {/*    bordered*/}
            {/*  />*/}
            {/*</Box>*/}
            {/*<Box className={`${classes?.fieldWrapper}  ${classes?.dropdownCommonSection}`}>*/}
            {/*  <InputLabel>{`${t('sales.users.industryVerticals')}`}</InputLabel>*/}
            {/*  <CustomDropDown*/}
            {/*    label={`${t('sales.users.industryVerticals')}`}*/}
            {/*    name="industryType"*/}
            {/*    id="industryType"*/}
            {/*    placeHolder={`${t('sales.users.selectIndustryVerticals')}`}*/}
            {/*    placeHolderClassName={classes.placeHolderColor}*/}
            {/*    options={transformArrayForOptions(industryTypes, 'name', 'id') || []}*/}
            {/*    selectedValues={*/}
            {/*      transformArrayForOptions(memoizedSelectedValueIndustryType, 'name', 'id') || []*/}
            {/*    }*/}
            {/*    handleChange={(event) =>*/}
            {/*      handleMultipleSelectedValues(event, queryKeys.industryTypeIds)*/}
            {/*    }*/}
            {/*    searchPlaceholder={t('sales.users.searchindustryVerticals')}*/}
            {/*    className={classes.dropdownWrap}*/}
            {/*    multiSelect*/}
            {/*    checkmark*/}
            {/*    searchable*/}
            {/*    bordered*/}
            {/*  />*/}
            {/*</Box>*/}

            {/*<Box className={classes.marginBotom}>*/}
            {/*  <InputLabel>{`${t('sales.users.dateCreated')}`}</InputLabel>*/}
            {/*  <DateRangePicker*/}
            {/*    selectedDates={formData?.createdAt}*/}
            {/*    setDates={(dates) => {*/}
            {/*      setFormData((prevState) => ({*/}
            {/*        ...prevState,*/}
            {/*        // createdAt: {*/}
            {/*        //   from: dayjs(dates[0]).startOf('day'),*/}
            {/*        //   to: dayjs(dates[1]).endOf('day'),*/}
            {/*        // },*/}
            {/*        createdAt: [*/}
            {/*          dayjs(dates[0]).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS'),*/}
            {/*          dayjs(dates[1]).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS'),*/}
            {/*        ],*/}
            {/*      }));*/}
            {/*    }}*/}
            {/*    format={'MM/DD/YYYY'}*/}
            {/*  />*/}
            {/*</Box>*/}
            {/*<Box className={classes.marginBotom}>*/}
            {/*  <InputLabel>{`${t('sales.users.lastActivity')}`}</InputLabel>*/}
            {/*  <ResponsiveDatePickers*/}
            {/*    value={formData.lastActivityDate}*/}
            {/*    onChange={(value) => {*/}
            {/*      const isValidDate = !isNaN(value['$d']);*/}
            {/*      if (isValidDate)*/}
            {/*        setFormData((prevState) => ({*/}
            {/*          ...prevState,*/}
            {/*          lastActivityDate: `${value['$y']}-${value['$M'] + 1}-${value['$D']}`,*/}
            {/*        }));*/}
            {/*      else*/}
            {/*        setFormData((prevState) => ({*/}
            {/*          ...prevState,*/}
            {/*          lastActivityDate: null,*/}
            {/*        }));*/}
            {/*    }}*/}
            {/*    placeholder={`${t('sales.users.selectLastActivity')}`}*/}
            {/*    className={classes.createdDatePicker}*/}
            {/*  />*/}
            {/*</Box>*/}
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

MoreFiltersDrawer.propTypes = {
  anchor: PropTypes.string,
  filterCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  formData_: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  setFormData_: PropTypes.func,
  handleClearFilters: PropTypes.func,
  applyFilters: PropTypes.func,
  emptyState: PropTypes.bool,
  // companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  industryTypes: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  setCompaniesFilters: PropTypes.func,
};

export default MoreFiltersDrawer;
