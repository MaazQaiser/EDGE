import { InputLabel, Stack, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
// import Divider from '@mui/material/Divider';
// import FormControl from '@mui/material/FormControl';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import ProfileImageUpload from 'commonComponents/profileImageUpload';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
// import { AddBlueIcon } from 'src/assets/svg';
import { removeKeysFromObject } from 'src/helper/utilityFunctions';
import {
  createLocation,
  getFranchisesOptions,
  getInternsOptions,
  getLeadStageOptions,
  updateLocation,
} from 'src/services/location.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { rolesEnumWithName, toastSettings } from 'src/utils/constants';
import { updateAssignToPayload } from 'src/utils/formatAssignedTo';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import DrawerFooter from '../../components/drawerFooter';
import DrawerHeader from '../../components/drawerHeader';
// import ConvertNewCompanyModal from '../../locations/createNewCompany';
import { stageValues } from '../../locations/locationStages/stage.constant';
// import { assignToEnums, assignToOptions, locationSourceOptions } from './location.constant';
import { useStyles } from './newLocationDrawer.js';

const formDataDefaultState = {
  city: '',
  state: '',
  company: null,
  propertyName: '',
  associatedFranchise: null,
  intern: '',
  salesPerson: '',
  locationSource: null,
  firstName: '',
  lastName: '',
  email: '',
  postalCode: '',
  address: '',
  title: '',
  phoneNumber: '',
  HubspotMap: null,
};
const NewLocationDrawer = ({
  anchor,
  locationCloseDrawer,
  width,
  companies,
  editLocationData,
  onSuccess,
}) => {
  const userRole = useSelector((state) => state.auth.userRole);
  const [profileImage, setImage] = useState(null);
  /**
   * Set default value to Sales Person is user role is sales_person
   */
  // const [assignTo, setAssignTo] = useState(
  //   editLocationData
  //     ? editLocationData?.assignTo?.intent
  //     : assignToOptions[userRole?.slug === rolesEnumWithName.sales_person.slug ? 1 : 0]?.value,
  // );
  const [formData, setFormData] = useState(
    editLocationData
      ? { ...editLocationData }
      : userRole?.slug === rolesEnumWithName.sales_person.slug
        ? { ...formDataDefaultState, salesPerson: null }
        : formDataDefaultState,
  );

  // const [interns, setInterns] = useState([]);
  // const [salesPersons, setSalesPersons] = useState([]);
  // const [leadStages, setLeadStages] = useState([]);

  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [errorMessages, setErrorMessages] = useState({});
  // const [openConvert, setOpenConvert] = useState(false);
  // const handleOpenConvert = () => setOpenConvert(true);
  // const handleCloseConvert = () => setOpenConvert(false);
  useEffect(() => {
    if (editLocationData) {
      if (!formData?.id) setFormData(editLocationData);
      setAssignTo(editLocationData.assignTo?.intent);
    }
  }, [editLocationData]);

  useEffect(() => {
    // fetchSalesPersonsList();
    fetchIntersList();
    fetchFranchises();
    fetchLeadStageList(stageValues.NEW_LOCATION);
  }, []);

  /**
   * use to handle Assign To
   * @param {*} event
   */
  // const handleChange = (event) => {
  //   const selectedValue = event.target.value;
  //   let formDataUpdate = { ...formData };

  //   switch (selectedValue) {
  //     case assignToOptions[1].value:
  //       fetchSalesPersonsList();
  //       formDataUpdate = { ...formData, salesPerson: null, intern: '' };
  //       break;
  //     case assignToOptions[2].value:
  //       fetchIntersList();
  //       if (salesPersons.length == 0) fetchSalesPersonsList();
  //       formDataUpdate = { ...formData, salesPerson: null, intern: null };
  //       break;
  //     default:
  //       formDataUpdate.salesPerson = '';
  //       formDataUpdate.intern = '';
  //       break;
  //   }

  //   setFormData(formDataUpdate);
  //   setAssignTo(selectedValue);
  // };

  const classes = useStyles();
  const { t } = useTranslation();

  /**
   * hook to for address
   */
  // ? NOTE: if the variable "localStates" is not getting used add _ before it or this rule will suffice the need here.
  // eslint-disable-next-line no-unused-vars
  const { localStates, CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      searchableCity: true,
      searchableCountry: true,
      searchableState: true,
      formData,
      setFormData,
      errorMessages,
      setErrorMessages,
    });
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
    setIsSubmittingForm(true);
    try {
      // Remove specified keys from formData
      const tempValidate = removeKeysFromObject(formData, [
        'associatedFranchise',
        'firstName',
        'lastName',
        'title',
        'phoneNumber',
        'email',
      ]);

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
          firstName: formData?.firstName,
          lastName: formData?.lastName,
          title: formData?.title,
          email: formData?.email,
          contact: formData?.phoneNumber,
        },
        address: {
          streetAddress: formData?.address,
          addressLine2: formData?.address2,
          postalCode: formData?.postalCode,
          stateId: formData?.state,
          cityId: formData?.city,
          countryId: formData?.country,
        },
        assignTo: updateAssignToPayload(assignTo, formData),
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
         * close the side drawer after successful response
         */
        locationCloseDrawer(anchor);
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

  // const [franchises, setFranchises] = useState([]);

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
  // const fetchSalesPersonsList = async () => {
  //   try {
  //     const response = await getSalesPersonOptions();
  //     if (response.statusCode === 200) {
  //       setSalesPersons(response?.data?.salesPersons);
  //     }
  //   } catch (error) {
  //     toaster.error(error?.message, {
  //       position: 'top-right',
  //       autoClose: toastSettings.AUTO_CLOSE,
  //     });
  //   }
  // };

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
              title="Add User"
              subtext="Please fill the following information to complete the user profile"
              handleCloseDrawer={locationCloseDrawer}
              anchor={anchor}
              className={classes.newLocationDrawerHeader}
            />
          </Box>
          <Box className={classNames(classes.locationForm, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="parentCompany">Full Name</InputLabel>
                <TextField
                  name="parentCompany"
                  id="parentCompany"
                  value={formData?.company?.parentCompanyName || ''}
                  fullWidth
                  disabled={true}
                  placeholder={t('sales.locations.parentCompanyPlaceholder')}
                />
              </Box>
              <Box
                className={`${classes.fieldWrapper}  ${classes.dropdownCommonSection}`}
                component="div"
              >
                <Box className={classes.inlineLables}>
                  <InputLabel htmlFor="company">User Type</InputLabel>
                  {/* <Button
                    className={classes.noPadding}
                    variant="onlyText"
                    disableRipple
                    onClick={handleOpenConvert}
                    startIcon={<AddBlueIcon className={classes.whiteBtn} />}
                  >
                    {t('sales.locations.createNewCompany')}
                  </Button>
                  <ConvertNewCompanyModal
                    openHandle={openConvert}
                    closeHandle={handleCloseConvert}
                  /> */}
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
                />
              </Box>
            </Box>
            <Box>
              <ProfileImageUpload
                formData={formData}
                formImageKey={'image'}
                updateFormHandler={updateFormHandler}
                errorMessages={errorMessages}
                setErrorMessages={setErrorMessages}
                image={profileImage}
                setImage={setImage}
                defaultImage="https://signalassets.blob.core.windows.net/signal/assets/vehicle-placeholder.svg"
              />
            </Box>
            <Box className={classes.addressetails}>
              <Typography
                variant="h4"
                className={`${classes.marginTopBottom}  ${classes.sidetitle}`}
              >
                Address Detail
              </Typography>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="country">
                    {t('form.input.textField.country.label')}
                  </InputLabel>
                  <CountrySelectHookComponent searchable={true} />
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
              </Box>
            </Box>
            <Box className={classes.contactDetails}>
              <Typography
                variant="h4"
                className={`${classes.marginTopBottom}  ${classes.sidetitle}`}
              >
                Contact Details
              </Typography>
              <Box className={classes.sideBySideCol}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="name">Contact#</InputLabel>
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
          </Box>
          <DrawerFooter
            classNameFooter={classes.sideDrawerFooter}
            bulkApply="Send Invite"
            bulkCancel={t('sales.locations.cancel')}
            handleCloseDrawer={locationCloseDrawer}
            anchor={anchor}
            type="submit"
            disabled={isSubmittingForm}
          />
        </Stack>
      </Box>
    </>
  );
};

NewLocationDrawer.propTypes = {
  anchor: PropTypes.string,
  locationCloseDrawer: PropTypes.func,
  width: PropTypes.number,
  companies: PropTypes.array, // Adjust the type accordingly based on the expected data structure
  editLocationData: PropTypes.object, // Adjust the type accordingly based on the expected data structure
  onSuccess: PropTypes.func,
};

export default NewLocationDrawer;
