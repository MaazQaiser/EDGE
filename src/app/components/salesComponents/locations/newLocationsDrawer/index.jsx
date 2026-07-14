import { Button, InputLabel, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import CustomDropDown from 'src/app/components/common/customDropDown';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { SALES_LOCATIONS } from 'src/app/router/constant/ROUTE';
// import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { AddBlueIcon } from 'src/assets/svg';
import { generateUniqueId, isObjectEmpty, removeKeysFromObject } from 'src/helper/utilityFunctions';
import {
  createLocation,
  getFranchisesOptions,
  getInternsOptions,
  getLeadStageOptions,
  getSalesPersonOptions,
  updateLocation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnumWithName, toastSettings } from 'src/utils/constants';
import { updateAssignToPayload } from 'src/utils/formatAssignedTo';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
import CreateNewCompanyModal from '../createNewCompany';
import { stageValues } from '../locationStages/stage.constant';
import { assignToEnums, assignToOptions, locationSourceOptions } from './location.constant';
import { useStyles } from './newLocationDrawer.js';

const formDataDefaultState = {
  // city: '',
  // state: '',
  company: {},
  propertyName: '',
  associatedFranchise: null,
  intern: {},
  salesPerson: {},
  locationSource: {},
  firstName: '',
  lastName: '',
  email: '',
  // postalCode: '',
  // address: '',
  title: '',
  phoneNumber: '',
  HubspotMap: {},
  googleAddress: {},
  // numberOfUnits: '',
  // occupancyRate: '',
  // averageRent: '',
  // managementCompany: '',
};
const defaultCenter = { lat: 41.216362, lng: -96.13607 };

const NewLocationDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  companies,
  editLocationData,
  onSuccess,
  fetchCompanies,
  isLoaded,
  refetch = () => {},
  addressFromParent = null,
  companiesPagination,
  loadingCompaniesDropDown,
}) => {
  const userRole = useSelector((state) => state.auth.userRole);
  /**
   * Set default value to Sales Person is user role is sales_person
   */
  const [assignTo, setAssignTo] = useState(
    editLocationData
      ? editLocationData?.assignTo?.intent
      : assignToOptions[userRole?.slug === rolesEnumWithName.sales_person.slug ? 1 : 0]?.value,
  );
  const [formData, setFormData] = useState(
    editLocationData
      ? { ...editLocationData }
      : userRole?.slug === rolesEnumWithName.sales_person.slug
        ? { ...formDataDefaultState, salesPerson: null }
        : formDataDefaultState,
  );

  const [interns, setInterns] = useState([]);
  const [salesPersons, setSalesPersons] = useState([]);
  const [leadStages, setLeadStages] = useState([]);

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [errorMessages, setErrorMessages] = useState({});
  const [center, setCenter] = useState({});
  const handleOpenConvert = () => setOpenConvert(true);
  const handleCloseConvert = () => setOpenConvert(false);
  const [address, setAddress] = useState('');
  const [openConvert, setOpenConvert] = useState(false);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({});

  useEffect(() => {
    if (editLocationData) {
      if (!formData?.id) setFormData(editLocationData);
      setAssignTo(editLocationData.assignTo?.intent);
    }
  }, [editLocationData]);

  useEffect(() => {
    fetchSalesPersonsList();
    fetchIntersList();
    fetchFranchises();
    fetchLeadStageList(stageValues.NEW_LOCATION);
  }, []);

  useEffect(() => {
    if (addressFromParent) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        propertyName: addressFromParent?.name || prevFormData?.propertyName,
        phoneNumber:
          addressFromParent?.international_phone_number ||
          addressFromParent?.formatted_phone_number ||
          formData?.phoneNumber ||
          '',
      }));
    }
  }, JSON.stringify(addressFromParent));
  /**
   * use to handle Assign To
   * @param {*} event
   */
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    let formDataUpdate = { ...formData };

    switch (selectedValue) {
      case assignToOptions[1].value:
        /**
         * fetch sales persons list
         * to show in dropdown as options
         */
        fetchSalesPersonsList();
        formDataUpdate = { ...formData, salesPerson: {}, intern: {} };
        break;
      case assignToOptions[2].value:
        /**
         * fetch inters list to show in dropdown as options
         */
        fetchIntersList();
        /**
         * if user directly select intern option then also fetch sales persons
         */
        if (salesPersons.length == 0) fetchSalesPersonsList();
        formDataUpdate = { ...formData, salesPerson: {}, intern: {} };
        break;
      default:
        // Reset both salesPerson and intern if neither 1 nor 2 is selected
        formDataUpdate.salesPerson = {};
        formDataUpdate.intern = {};
        break;
    }

    setFormData(formDataUpdate);
    setAssignTo(selectedValue);
  };

  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const fillName = useRef(true);
  /**
   * hook to for address
   */
  // ? NOTE: if the variable "localStates" is not getting used add _ before it or this rule will suffice the need here.
  // eslint-disable-next-line no-unused-vars
  // const { localStates, CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
  //   useCustomAddressHook({
  //     searchableCity: true,
  //     searchableCountry: true,
  //     searchableState: true,
  //     formData,
  //     setFormData,
  //     errorMessages,
  //     setErrorMessages,
  //   });
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

  const updateMapValue = (name, value) => {
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      /**
       * remove the following keys from formData object
       * to avoid validation
       */
      let keysToRemove = [
        'associatedFranchise',
        'firstName',
        'lastName',
        'title',
        'email',
        'phoneNumber',
      ];

      /**
       * check assignTo value
       * and add/remove from formdata object accordingly
       */
      // this is only for safe check - sales module is discarded
      if (assignTo === rolesEnumWithName.home_officer.slug) {
        keysToRemove.push('intern', 'salesPerson');
      } else if (assignTo === rolesEnumWithName.sales_person.slug) {
        keysToRemove.push('intern');
      }

      // Remove specified keys from formData
      let tempValidate = removeKeysFromObject(formData, keysToRemove);

      /**
       * validate the following: email, firstName, lastName,phone number,  and title
       * format if exist
       * phone number is optional but it will check if it exist
       */
      // if (formData?.phoneNumber) {
      //   tempValidate = { ...tempValidate, phoneNumber: formData?.phoneNumber };
      // }
      //
      // if (formData?.email) {
      //   tempValidate = { ...tempValidate, email: formData?.email };
      // }
      //
      // if (formData?.firstName) {
      //   tempValidate = { ...tempValidate, firstName: formData?.firstName };
      // }
      //
      // if (formData?.lastName) {
      //   tempValidate = { ...tempValidate, lastName: formData?.lastName };
      // }
      //
      // if (formData?.title) {
      //   tempValidate = { ...tempValidate, title: formData?.title };
      // }
      //
      // if (formData?.numberOfUnits) {
      //   tempValidate = { ...tempValidate, title: formData?.numberOfUnits };
      // }
      //
      // if (formData?.occupancyRate) {
      //   tempValidate = { ...tempValidate, title: formData?.occupancyRate };
      // }
      //
      // if (formData?.averageRent) {
      //   tempValidate = { ...tempValidate, title: formData?.averageRent };
      // }
      //
      // if (formData?.managementCompany) {
      //   tempValidate = { ...tempValidate, title: formData?.managementCompany };
      // }

      /**
       * Updated ifs to this approach
       * kept ifs in case this approach turn out a disaster ðŸ˜¶â€ðŸŒ«ï¸
       * */
      const propertiesToCopy = [
        'phoneNumber',
        'email',
        'firstName',
        'lastName',
        'title',
        // 'numberOfUnits',
        // 'occupancyRate',
        // 'averageRent',
        // 'managementCompany',
      ];

      propertiesToCopy.forEach((property) => {
        if (formData?.[property]) {
          tempValidate[property] = formData[property];
        }
      });

      if (addressFromParent) {
        tempValidate = {
          ...tempValidate,
          googleAddress: { name: addressFromParent?.formatted_address },
        };
      }
      const errors = await formValidatorJoi(tempValidate, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      const payload = {
        locationName: formData?.propertyName,
        locationType: formData?.locationSource?.value,
        associatedFranchiseId: formData?.associatedFranchise?.id,
        companyId: formData?.company?.id,
        leadStageId: formData?.HubspotMap?.id,
        contactDetails: {
          firstName: formData?.firstName?.trim(),
          lastName: formData?.lastName?.trim(),
          title: formData?.title,
          email: formData?.email,
          contact: formData?.phoneNumber,
        },
        address: addressFromParent
          ? addressFromParent?.formatted_address
          : formData?.googleAddress?.name,
        coordinates: addressFromParent
          ? addressFromParent?.coordinates
          : formData?.googleAddress?.position,
        // address: {
        //   streetAddress: formData?.address,
        //   addressLine2: formData?.address2,
        //   postalCode: formData?.postalCode,
        //   stateId: formData?.state,
        //   cityId: formData?.city,
        //   countryId: formData?.country,
        // },
        assignTo: updateAssignToPayload(assignTo, formData),
        // numberOfUnits: formData.numberOfUnits,
        // occupancyRate: formData?.occupancyRate,
        // averageRent: formData?.averageRent,
        // managementCompany: formData?.managementCompany,
      };

      let apiResponse;
      if (editLocationData) apiResponse = await updateLocation(editLocationData.id, payload);
      else apiResponse = await createLocation(payload);

      if (apiResponse.statusCode === 200) {
        onSuccess();
        toaster.success({
          text: editLocationData
            ? t('sales.locations.updateLocationMessage')
            : t('sales.locations.createdLocation'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        /**
         * if user is creating a location from map then redirect the user
         * to location listing after creation
         */
        if (addressFromParent) history.push(`${SALES_LOCATIONS}`);
        /**
         * close the side drawer after successful response
         */
        locationCloseDrawer(anchor);
        refetch();
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
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const [franchises, setFranchises] = useState([]);

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
       * show error in the toast
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * Fetch sales person listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchSalesPersonsList = async () => {
    try {
      const response = await getSalesPersonOptions();
      if (response.statusCode === 200) {
        setSalesPersons(response?.data?.salesPersons);
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
   * Fetch sales Interns listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchIntersList = async () => {
    try {
      const response = await getInternsOptions();
      if (response.statusCode === 200) setInterns(response?.data?.interns);
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
   * Fetch new location stages listing
   * for dropdown options
   * @param {*} page
   * @param {*} query
   */
  const fetchLeadStageList = async (stage) => {
    try {
      const response = await getLeadStageOptions(stage);
      if (response.statusCode === 200) setLeadStages(response?.data?.stages);
    } catch (error) {
      /**
       * show error in the corresponding field
       */
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  /**
   * calculate the center of the map
   */
  const getFinalCenter = useMemo(() => {
    let result = {};
    if (!isObjectEmpty(addressFromParent?.coordinates)) {
      result = addressFromParent?.coordinates;
    }
    if (addressFromParent && !isObjectEmpty(center)) {
      result = center;
    }

    if (!addressFromParent && isObjectEmpty(center)) {
      result = defaultCenter;
    }
    if (!addressFromParent && !isObjectEmpty(center)) {
      result = center;
    }

    return result;
  }, [addressFromParent, center]);

  const getFinalLocation = useMemo(() => {
    let result = {};

    if (addressFromParent) {
      result = {
        id: generateUniqueId(),
        name: addressFromParent?.formatted_address,
        position: addressFromParent?.coordinates,
      };
    }
    if (!isObjectEmpty(selectedLocation)) {
      result = selectedLocation;
    }
    return result;
  }, [addressFromParent, selectedLocation]);

  const finalSelectedLocation = getFinalLocation;
  const finalCenter = getFinalCenter;
  const fillNameConstant = fillName.current
    ? formData?.propertyName || addressFromParent?.name || ''
    : formData?.propertyName;
  return (
    <>
      {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
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
              title={t(
                editLocationData
                  ? 'sales.locations.editLocation'
                  : 'sales.locations.createLocation',
              )}
              subtext={t(
                editLocationData
                  ? 'sales.locations.editText'
                  : 'sales.locations.createLocationText',
              )}
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.newLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <Box className={classes.inlineLables}>
                  <InputLabel htmlFor="company">
                    {t('sales.locations.company')}
                    <RequiredAsterik />
                  </InputLabel>
                  <Button
                    className={classes.noPadding}
                    variant="onlyText"
                    disableRipple
                    onClick={handleOpenConvert}
                    startIcon={<AddBlueIcon className={classes.whiteBtn} />}
                  >
                    {t('sales.locations.createNew')}
                  </Button>
                </Box>

                <CustomDropDown
                  name="company"
                  id="company"
                  label={t('sales.locations.company')}
                  options={transformArrayForOptions(companies, 'name', 'id') || []}
                  selectedValues={formData?.company || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.searchCompany')}
                  searchable
                  bordered
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                  isError={errorMessages?.company}
                  error={errorMessages?.company}
                  pagination={companiesPagination}
                  fetchMoreOptions={fetchCompanies}
                  isLoading={loadingCompaniesDropDown}
                />
                <span className="errorMessage">{errorMessages?.company}</span>
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="parentCompany">
                  {t('sales.locations.parentCompany')}
                </InputLabel>
                <TextField
                  name="parentCompany"
                  id="parentCompany"
                  value={formData?.company?.parentCompanyName || ''}
                  fullWidth
                  disabled={true}
                  placeholder={t('sales.locations.parentCompanyPlaceholder')}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="propertyName">
                  {t('sales.locations.propertyName')}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  id="propertyName"
                  name="propertyName"
                  fullWidth
                  placeholder={t('sales.locations.propertyNamePlaceholder')}
                  error={!!errorMessages?.propertyName}
                  helperText={errorMessages?.propertyName}
                  onChange={(e) => {
                    if (fillName.current) {
                      fillName.current = false;
                    }
                    inputChangedHandler(e);
                  }}
                  value={fillNameConstant}
                  className={classes.dropHigh}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.propertyName}</span>
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="locationSource">
                  {t('sales.locations.locationSource')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  id="locationSource"
                  name="locationSource"
                  label={t('sales.locations.locationSource')}
                  options={locationSourceOptions || []}
                  selectedValues={formData?.locationSource || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.locationSourcePlaceholder')}
                  bordered
                  className={classes.dropHigh}
                  isError={errorMessages?.locationSource}
                  placeHolderClassName={classes.placeHolderText}
                />
                <span className="errorMessage">{errorMessages?.locationSource}</span>
              </Box>
            </Box>
            <Box className={`${classes.sideBySideCol}`}>
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
                  options={transformArrayForOptions(franchises, 'name', 'id') || []}
                  selectedValues={formData?.associatedFranchise || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.associatedFranchisePlaceholder')}
                  className={classes.dropHigh}
                  isError={errorMessages?.associatedFranchise}
                  bordered
                  placeHolderClassName={classes.placeHolderText}
                  searchable
                />
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <InputLabel htmlFor="HubspotMap">
                  {t('sales.locations.chooseMap')}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="HubspotMap"
                  id="HubspotMap"
                  label={t('sales.locations.HubspotMap')}
                  options={transformArrayForOptions(leadStages, 'name', 'id') || []}
                  selectedValues={formData?.HubspotMap || {}}
                  handleChange={inputChangedHandler}
                  placeHolder={t('sales.locations.leadStages')}
                  className={classes.dropHigh}
                  isError={errorMessages?.HubspotMap}
                  placeHolderClassName={classes.placeHolderText}
                  bordered
                />
                <span className="errorMessage">{errorMessages?.HubspotMap}</span>
              </Box>
            </Box>
            <Divider variant="fullWidth" className={classes.locationsDivider} />
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
                    {assignToOptions?.map((item, index) => {
                      if (
                        item?.value === assignToEnums.HOME_OFFICE &&
                        userRole?.slug === rolesEnumWithName.sales_person.slug
                      )
                        return null;
                      return (
                        <FormControlLabel
                          value={item?.value}
                          control={<Radio />}
                          label={item?.label}
                          key={index}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Box>
              {assignTo === assignToOptions[1].value && (
                <Box className={classes.sideBySideColEmail}>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="salesPerson">
                      {t('sales.locations.salesPerson')}
                      <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name="salesPerson"
                      id="salesPerson"
                      label={t('sales.locations.salesPerson')}
                      options={
                        transformArrayForOptions(salesPersons, 'fullName', 'id', 'email') || []
                      }
                      selectedValues={formData?.salesPerson || {}}
                      handleChange={inputChangedHandler}
                      placeHolder={t('sales.locations.selectsalesPerson')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                      placeHolderClassName={classes.placeHolderText}
                      isError={errorMessages?.salesPerson}
                      showEmailInLine={true}
                    />
                    <span className="errorMessage">{errorMessages?.salesPerson}</span>
                  </Box>
                </Box>
              )}

              {assignTo === assignToOptions[2].value && (
                <Box className={classes.sideBySideCol}>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="intern">
                      {' '}
                      {t('sales.locations.intern')}
                      <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name="intern"
                      id="intern"
                      label={t('sales.locations.intern')}
                      options={transformArrayForOptions(interns, 'fullName', 'id', 'email') || []}
                      selectedValues={formData?.intern || {}}
                      handleChange={inputChangedHandler}
                      placeHolder={t('sales.locations.selectIntern')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                      placeHolderClassName={classes.placeHolderText}
                      isError={errorMessages?.intern}
                    />
                    <span className="errorMessage">{errorMessages?.intern}</span>
                  </Box>
                  <Box className={`${classes.fieldWrapper}  ${classes.secondDropdown}`}>
                    <InputLabel htmlFor="salesPerson">
                      {t('sales.locations.associatedSupervisor')}
                      <RequiredAsterik />
                    </InputLabel>
                    <CustomDropDown
                      name="salesPerson"
                      id="salesPerson"
                      label={t('sales.locations.salesPerson')}
                      options={
                        transformArrayForOptions(salesPersons, 'fullName', 'id', 'email') || []
                      }
                      selectedValues={formData?.salesPerson || {}}
                      handleChange={inputChangedHandler}
                      placeHolder={t('sales.locations.selectAssociatedSupervisor')}
                      searchable
                      bordered
                      className={classes.dropHigh}
                      placeHolderClassName={classes.placeHolderText}
                      isError={errorMessages?.salesPerson}
                    />
                    <span className="errorMessage">
                      {errorMessages?.salesPerson && t('errors.supervisorValidationErr')}
                    </span>
                  </Box>
                </Box>
              )}
            </Box>
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.contactDetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.contactDetails')}
              </h5>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="name">{t('sales.locations.firstname')}</InputLabel>
                  <TextField
                    name="firstName"
                    id="firstName"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.firstNamePlaceholder')}
                    error={!!errorMessages?.firstName}
                    helperText={errorMessages?.firstName}
                    onChange={inputChangedHandler}
                    value={formData?.firstName || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="name">{t('sales.locations.lastname')}</InputLabel>
                  <TextField
                    name="lastName"
                    id="lastName"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.lastNamePlaceholder')}
                    error={!!errorMessages?.lastName}
                    helperText={errorMessages?.lastName}
                    onChange={inputChangedHandler}
                    value={formData?.lastName || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="title">{t('sales.locations.title')}</InputLabel>
                  <TextField
                    name="title"
                    id="title"
                    fullWidth
                    Disabled
                    placeholder={t('sales.locations.titlePlaceholder')}
                    error={!!errorMessages?.title}
                    helperText={errorMessages?.title}
                    onChange={inputChangedHandler}
                    value={formData?.title || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="phoneNumber">{t('sales.locations.contact')}</InputLabel>
                  <PhoneNumberWithCountry
                    value={formData.phoneNumber || ''}
                    onChange={inputChangedHandler}
                    name={'phoneNumber'}
                    className={classes.dropHigh}
                    isError={!!errorMessages?.phoneNumber}
                    international={true}
                    error={errorMessages?.phoneNumber}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideColEmail}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="email">{t('sales.locations.email')}</InputLabel>
                  <TextField
                    name="email"
                    id="email"
                    type="email"
                    fullWidth
                    placeholder="mike.henry@costco.co"
                    error={!!errorMessages?.email}
                    helperText={errorMessages?.email}
                    onChange={inputChangedHandler}
                    value={formData?.email || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
            </Box>
            {/* New Fields added */}
            {/* Not required now */}
            {/* <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.contactDetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.additionalDetails')}
              </h5>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="noOfUnits">{t('sales.locations.otherNoOfUnits')}</InputLabel>
                  <TextField
                    name="numberOfUnits"
                    id="numberOfUnits"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherNoOfUnitsPlaceholder')}
                    error={!!errorMessages?.numberOfUnits}
                    helperText={errorMessages?.numberOfUnits}
                    onChange={(event) => {
                      const newValue = event.target.value.replace(/[^\d]/g, ''); // Remove any non-digit characters

                      const newEvent = {
                        target: {
                          name: event?.target?.name,
                          value: newValue,
                        },
                      };

                      inputChangedHandler(newEvent);
                    }}
                    value={formData?.numberOfUnits}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="occupancyRate">
                    {t('sales.locations.otherOccupancyRate')}
                  </InputLabel>
                  <TextField
                    name="occupancyRate"
                    id="occupancyRate"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherOccupancyRatePlaceholder')}
                    error={!!errorMessages?.occupancyRate}
                    helperText={errorMessages?.occupancyRate}
                    onChange={inputChangedHandler}
                    value={formData?.occupancyRate || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="averageRate">
                    {t('sales.locations.otherAverageRate')}
                  </InputLabel>
                  <TextField
                    name="averageRent"
                    id="averageRent"
                    fullWidth
                    type={'number'}
                    placeholder={t('sales.locations.otherAverageRatePlaceholder')}
                    error={!!errorMessages?.averageRent}
                    helperText={errorMessages?.averageRent}
                    onChange={inputChangedHandler}
                    value={formData?.averageRent || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="managementCompany">
                    {t('sales.locations.otherManagementCompany')}
                  </InputLabel>
                  <TextField
                    name="managementCompany"
                    id="managementCompany"
                    type="string"
                    fullWidth
                    placeholder={t('sales.locations.otherManagementCompanyPlaceholder')}
                    error={!!errorMessages?.managementCompany}
                    helperText={errorMessages?.managementCompany}
                    onChange={inputChangedHandler}
                    value={formData?.managementCompany || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
            </Box> */}
            <Divider variant="fullWidth" className={classes.locationsDivider} />
            <Box className={classes.addressetails}>
              <h5 className={`${classes.marginTopBottom}  ${classes.sidetitle}`}>
                {t('sales.locations.address')}
              </h5>
              {isLoaded && (
                <GoogleMapSearchAddressComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  errorMessages={errorMessages}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  address={address || addressFromParent?.formatted_address}
                  setActiveMarker={setActiveMarker}
                  setSelectedLocation={setSelectedLocation}
                  setCenter={setCenter}
                  disabled={!isObjectEmpty(addressFromParent)}
                />
              )}
              {isLoaded && (
                <GoogleMapViewComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  setActiveMarker={setActiveMarker}
                  activeMarker={activeMarker}
                  setSelectedLocation={setSelectedLocation}
                  selectedLocation={finalSelectedLocation}
                  setCenter={setCenter}
                  center={finalCenter}
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
                />
              )}
              {/* Below code is for old flow where user add all address details */}
              {/* <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="streetAddress">
                    {t('sales.locations.streetAddress')}
                  </InputLabel>

                  <TextField
                    name="address"
                    id="address"
                    fullWidth
                    placeholder={t('sales.locations.streetAddressPlaceholder')}
                    error={!!errorMessages?.address}
                    helperText={errorMessages?.address}
                    onChange={inputChangedHandler}
                    value={formData?.address || ''}
                    className={classes.dropHigh}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="addressLine">{t('sales.locations.addressLine')}</InputLabel>
                  <TextField
                    name="address2"
                    id="address2"
                    fullWidth
                    placeholder={t('sales.locations.addressLinePlaceholder')}
                    error={!!errorMessages?.address2}
                    onChange={inputChangedHandler}
                    value={formData?.address2 || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="country">
                    {t('form.input.textField.country.label')}
                  </InputLabel>
                  <CountrySelectHookComponent searchable={true} />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="city">{t('sales.locations.state')}</InputLabel>
                  <StateHookComponent searchable={true} />
                </Box>
              </Box>
              <Box className={classes.sideBySideCol}>
                <Box className={`${classes.fieldWrapper} ${classes.fiftyWidth}`}>
                  <InputLabel htmlFor="state">{t('sales.locations.city')}</InputLabel>
                  <CityHookComponent searchable={true} />
                </Box>
                <Box className={`${classes.fieldWrapper} ${classes.fiftyWidth}`}>
                  <InputLabel htmlFor="postalCode">{t('sales.locations.postalCode')}</InputLabel>
                  <TextField
                    name="postalCode"
                    id="postalCode"
                    type="string"
                    fullWidth
                    placeholder="68010"
                    error={!!errorMessages?.postalCode}
                    helperText={errorMessages?.postalCode}
                    onChange={inputChangedHandler}
                    value={formData?.postalCode || ''}
                    className={classes.dropHigh}
                  />
                </Box>
              </Box> */}
            </Box>
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply={t(
              editLocationData ? 'sales.locations.save' : 'sales.locations.createLocation',
            )}
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm}
          />
        </Stack>
      </Box>
      {openConvert ? (
        <CreateNewCompanyModal
          openHandle={openConvert}
          closeHandle={handleCloseConvert}
          fetchCompanies={fetchCompanies}
        />
      ) : null}
    </>
  );
};

NewLocationDrawer.propTypes = {
  locationInformationFromMap: PropTypes.object,
  addressFromParent: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired,
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  editLocationData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  onSuccess: PropTypes.func,
  fetchCompanies: PropTypes.func,
  refetch: PropTypes.func,
  companiesPagination: PropTypes.object,
  loadingCompaniesDropDown: PropTypes.bool,
};

export default NewLocationDrawer;
