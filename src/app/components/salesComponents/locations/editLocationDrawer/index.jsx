import { InputLabel, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import {
  getCitiesOptions,
  getCompaniesOption,
  getFranchisesOptions,
  getStatesOptions,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { toastSettings } from 'src/utils/constants';
import { toaster } from 'src/utils/toast';

import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import { assignToOptions, locationSourceOptions } from '../newLocationsDrawer/location.constant';
import { useStyles } from './newLocationDrawer.js';
import { usersData } from './stubbedDataOptions';

const EditLocationDrawer = (anchor, locationCloseDrawer, width) => {
  /**
   * // Set the default value to 'Sales Person'
   */
  const [assignTo, setAssignTo] = useState(assignToOptions[0]?.value);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({});
  const [_loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [errorMessages, setErrorMessages] = useState({});

  /**
   * use to handle Assign To
   * @param {*} event
   */
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    /**
     * if user switch between option then it will reset the previous
     * selected options
     */
    const formDataUpdate =
      selectedValue === (assignToOptions[1].value || assignToOptions[0].value)
        ? { ...formData, salesPerson: '', intern: '' }
        : selectedValue === assignToOptions[2].value
          ? { ...formData, salesPerson: '' }
          : formData;

    setFormData(formDataUpdate);
    setAssignTo(selectedValue);
  };

  const classes = useStyles();
  const { t } = useTranslation();

  /**
   * common function to update data to formDat object
   */
  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const inputChangedHandler = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    /**
     * erros and API to create location will be added
     */
  };

  /**
   * Fetch companies listing
   * @param {*} page
   * @param {*} query
   */
  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCompaniesOption(page);
      if (response) {
        setCompanies(response?.data?.companies);
      }
      setLoading(false);
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
    setLoading(false);
  };

  /**
   * Fetch states listing
   * @param {*} page
   * @param {*} query
   */
  const fetchStates = async () => {
    try {
      const response = await getStatesOptions();
      if (response.statusCode === 200) {
        const states = response?.data?.states;
        /**
         * format the data according to dropdown
         */
        setStates(
          Object.keys(states).map((key) => ({
            label: states[key],
            value: key,
          })),
        );
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
   * Fetch franchise listing
   * @param {*} page
   * @param {*} query
   */
  const fetchFranchises = async () => {
    try {
      const response = await getFranchisesOptions();
      if (response?.statusCode === 200) setFranchises(response?.data?.franchises);
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
   * Fetch cities listing
   * @param {*} page
   * @param {*} query
   */
  const fetchCities = async (stateId) => {
    try {
      const response = await getCitiesOptions([stateId]);
      if (response.statusCode === 200) {
        const states = response?.data?.cities;
        /**
         * format the data according to dropdown
         */
        setCities(
          Object.keys(states).map((key) => ({
            label: states[key],
            value: key,
          })),
        );
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
   * get the selected state
   * @param {*} e
   */
  const _handleSelectState = (e) => {
    inputChangedHandler(e);
    /**
     * Empty previous cities options if
     * new state is selected
     */
    setCities([]);
    fetchCities(e.target.value.value);
  };

  useEffect(() => {
    fetchCompanies();
    fetchStates();
    fetchFranchises();
  }, []);

  return (
    <Box
      className={classes.siderbarbox}
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width }}
      role="presentation"
      component="form"
      onSubmit={handleFormSubmit}
    >
      <Stack className={classes.boxinner} justifyContent="space-between">
        <Box className={classes.sideheader}>
          <DrawerHeader
            title={t('sales.locations.editLocation')}
            subtext={t('sales.locations.editText')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
          />
          <Box className={classes.locationForm}>
            <Box className={classes.sideBySideCol}>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="company">{t('sales.locations.company')}</InputLabel>
                <CustomDropDown
                  name="company"
                  id="company"
                  label={t('sales.locations.company')}
                  options={transformArrayForOptions(companies, 'name', 'id') || []}
                  selectedValues={formData?.company || {}}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('sales.locations.search')}
                  bordered
                  className={classes.dropHigh}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="parentCompany">
                  {t('sales.locations.parentCompany')}
                </InputLabel>
                <TextField
                  name="parentCompany"
                  id="parentCompany"
                  value={formData?.company?.parentCompany || ''}
                  fullWidth
                  Disabled
                  placeholder="Costco"
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="propertyName">{t('sales.locations.propertyName')}</InputLabel>
                <TextField
                  id="propertyName"
                  name="propertyName"
                  fullWidth
                  Disabled
                  placeholder="Costco"
                  error={!!errorMessages?.propertyName}
                  onChange={inputChangedHandler}
                  value={formData?.propertyName || ''}
                />
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="locationSource">
                  {t('sales.locations.locationSource')}
                </InputLabel>
                <CustomDropDown
                  id="locationSource"
                  name="locationSource"
                  label={t('sales.locations.locationSource')}
                  options={locationSourceOptions || []}
                  selectedValues={formData?.locationSource || {}}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('sales.locations.search')}
                  bordered
                  className={classes.dropHigh}
                />
              </Box>
            </Box>
            <Box
              className={`${classes.sideBySideCol}  ${classes.marginBotm} ${classes.fiftyWidth}`}
            >
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="associatedFranchise">
                  {t('sales.locations.associatedFranchise')}
                </InputLabel>
                <CustomDropDown
                  name="associatedFranchise"
                  id="associatedFranchise"
                  label={t('sales.locations.associatedFranchise')}
                  options={transformArrayForOptions(franchises, 'franchiseName', 'id') || []}
                  selectedValues={formData?.associatedFranchise || {}}
                  handleChange={inputChangedHandler}
                  searchPlaceholder={t('sales.locations.search')}
                  bordered
                  className={classes.dropHigh}
                />
              </Box>
            </Box>
            <Divider variant="fullWidth" />
            <Box className={classes.assignToradio}>
              <Box className={classes.radioWrapper}>
                <h5 className={classes.sidetitle}>{t('sales.locations.assignTo')}</h5>
                <FormControl className={classes.radioOption}>
                  <RadioGroup
                    row
                    value={assignTo}
                    onChange={handleChange}
                    name="radio-buttons-group"
                  >
                    {assignToOptions?.map((item, index) => (
                      <FormControlLabel
                        value={item?.value}
                        control={<Radio />}
                        label={item?.label}
                        key={index}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
              {assignTo === assignToOptions[1].value && (
                <Box className={classes.secondDropdown}>
                  <InputLabel htmlFor="salesPerson"> {t('sales.locations.salesPerson')}</InputLabel>
                  <CustomDropDown
                    name="salesPerson"
                    id="salesPerson"
                    label={t('sales.locations.salesPerson')}
                    options={
                      transformArrayForOptions(
                        /**
                         * options are used from stubbed data and will be replaced
                         * later with actual data once an API is available.
                         */
                        usersData?.salesPersonListing?.data?.salesPersons,
                        'name',
                        'id',
                      ) || []
                    }
                    selectedValues={formData?.salesPerson || {}}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.search')}
                    searchable
                    bordered
                    className={classes.dropHigh}
                  />
                </Box>
              )}

              {assignTo === assignToOptions[2].value && (
                <Box className={classes.sideBySideCol}>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="salesPerson">
                      {t('sales.locations.salesPerson')}
                    </InputLabel>
                    <CustomDropDown
                      name="salesPerson"
                      id="salesPerson"
                      label={t('sales.locations.salesPerson')}
                      options={
                        transformArrayForOptions(
                          /**
                           * options are used from stubbed data and will be replaced
                           * later with actual data once an API is available.
                           */
                          usersData?.salesPersonListing?.data?.salesPersons,
                          'name',
                          'id',
                        ) || []
                      }
                      selectedValues={formData?.salesPerson || {}}
                      handleChange={inputChangedHandler}
                      searchPlaceholder={t('sales.locations.search')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                    />
                  </Box>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="intern"> {t('sales.locations.intern')}</InputLabel>
                    <CustomDropDown
                      name="intern"
                      id="intern"
                      label={t('sales.locations.intern')}
                      options={
                        transformArrayForOptions(
                          /**
                           * options are used from stubbed data and will be replaced
                           * later with actual data once an API is available.
                           */
                          usersData?.internsListing?.data?.interns,
                          'name',
                          'id',
                        ) || []
                      }
                      selectedValues={formData?.intern || {}}
                      handleChange={inputChangedHandler}
                      searchPlaceholder={t('sales.locations.search')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            <Divider variant="fullWidth" />
            <Box className={classes.contactDetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.contactDetails')}
              </h5>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="name">{t('sales.locations.name')}</InputLabel>
                  <TextField
                    name="name"
                    id="name"
                    fullWidth
                    Disabled
                    placeholder="Mike Henry"
                    error={!!errorMessages?.name}
                    onChange={inputChangedHandler}
                    value={formData?.name || ''}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="title">{t('sales.locations.title')}</InputLabel>
                  <TextField
                    name="title"
                    id="title"
                    fullWidth
                    Disabled
                    placeholder="Senior Manager"
                    error={!!errorMessages?.title}
                    onChange={inputChangedHandler}
                    value={formData?.title || ''}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="contact">{t('sales.locations.contact')}</InputLabel>
                  <TextField
                    name="contact"
                    id="contact"
                    type="number"
                    fullWidth
                    placeholder="+1 234 3409 0823"
                    error={!!errorMessages?.contact}
                    onChange={inputChangedHandler}
                    value={formData?.contact || ''}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="email">{t('sales.locations.email')}</InputLabel>
                  <TextField
                    name="email"
                    id="email"
                    type="email"
                    fullWidth
                    placeholder="mike.henry@costco.co"
                    error={!!errorMessages?.email}
                    onChange={inputChangedHandler}
                    value={formData?.email || ''}
                  />
                </Box>
              </Box>
            </Box>
            <Box className={classes.addressetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>Address</h5>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="streetAddress">
                    {t('sales.locations.streetAddress')}
                  </InputLabel>

                  <TextField
                    name="address"
                    id="address"
                    fullWidth
                    placeholder="456 Elm Ave"
                    error={!!errorMessages?.address}
                    helperText={errorMessages?.address}
                    onChange={inputChangedHandler}
                    value={formData?.address || ''}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="addressLine">{t('sales.locations.addressLine')}</InputLabel>
                  <TextField
                    name="address2"
                    id="address2"
                    fullWidth
                    placeholder="Douglas County"
                    error={!!errorMessages?.address2}
                    onChange={inputChangedHandler}
                    value={formData?.address2 || ''}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="city">{t('sales.locations.state')}</InputLabel>
                  <CustomDropDown
                    name="state"
                    id="state"
                    label={t('sales.locations.state')}
                    options={states || []}
                    selectedValues={formData?.state || {}}
                    // handleChange={(event) => console.log(event, queryKeys.stateIds)}
                    searchPlaceholder={t('sales.locations.search')}
                    searchable
                    bordered
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="state">{t('sales.locations.city')}</InputLabel>
                  <CustomDropDown
                    name="city"
                    id="city"
                    label={t('sales.locations.city')}
                    options={cities || []}
                    selectedValues={formData?.city || {}}
                    handleChange={inputChangedHandler}
                    searchPlaceholder={t('sales.locations.search')}
                    searchable
                    bordered
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={`${classes.fieldWrapper} ${classes.fiftyWidth}`}>
                  <InputLabel htmlFor="postalCode">{t('sales.locations.postalCode')}</InputLabel>
                  <TextField
                    name="postalCode"
                    id="postalCode"
                    type="number"
                    fullWidth
                    placeholder="68010"
                    error={!!errorMessages?.postalCode}
                    helperText={errorMessages?.postalCode}
                    onChange={inputChangedHandler}
                    value={formData?.postalCode || ''}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <DrawerFooter
          bulkApply={t('sales.locations.save')}
          bulkCancel={t('sales.locations.cancel')}
          handleCloseDrawer={locationCloseDrawer}
          anchor={anchor}
          type="submit"
        />
      </Stack>
    </Box>
  );
};

export default EditLocationDrawer;
