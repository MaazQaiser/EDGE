import { Button, InputLabel, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { useJsApiLoader } from '@react-google-maps/api';
import classNames from 'classnames';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import GoogleMapViewComponent from 'src/app/components/common/googleMap/googleMapView';
import GoogleMapSearchAddressComponent from 'src/app/components/common/googleMap/searchAddress';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { Clossicon } from 'src/assets/svg';
import { removeKeysFromObject } from 'src/helper/utilityFunctions';
import { createCompany, getIndustryTypes } from 'src/services/company.service';
import { getDealOwnerOptions } from 'src/services/deal.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { GOOGLE_MAPS_API_VERSION, GOOGLE_MAPS_LIBRARIES, toastSettings } from 'src/utils/constants';
import { checkAndAddDot } from 'src/utils/string/addDotInEnd';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../utils/formValidator/formValidator.requiredCheck';
import { useStyles } from './createNewCompany';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '796px',
  bgcolor: 'background.paper',
  padding: '24px 24px',
  boxShadow: '0px 8px 8px -4px rgba(16, 24, 40, 0.04), 0px 20px 24px -4px rgba(16, 24, 40, 0.10)',
  borderRadius: '12px',
};

const emptyState = {
  companyName: null,
  companyDomain: null,
  companyIndustry: {},
  // companyOwner: {},
  numberOfEmployees: null,
  revenue: null,
  googleAddress: {},
};

const defaultCenter = { lat: 41.216362, lng: -96.13607 };

const CreateNewCompanyModal = ({ openHandle, closeHandle, fetchCompanies = () => {} }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [formData, setFormData] = useState(emptyState);
  const [activeMarker, setActiveMarker] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [errorMessages, setErrorMessages] = useState({});
  const [selectedLocation, setSelectedLocation] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [options, setOptions] = useState({
    dealOwners: [],
    industries: [],
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: GOOGLE_MAPS_API_VERSION,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const handleFormSubmit = async (e) => {
    e.persist();
    e.preventDefault();
    setIsSubmittingForm(true);
    try {
      // Remove specified keys from formData
      let tempValidate = removeKeysFromObject(formData, [
        'numberOfEmployees',
        'revenue',
        !formData?.companyDomain && 'companyDomain',
      ]);
      /**
       * validate number of employees is greater than 0 if exist
       * number of employees is optional but it will check if it exist in the form
       */
      if (formData?.numberOfEmployees) {
        tempValidate = {
          ...tempValidate,
          numberOfEmployees: parseInt(formData?.numberOfEmployees),
        };
      }

      /**
       * validate revenue is greater than 0 if exist
       * revenue is optional but it will check if it exist
       */
      if (formData?.revenue) {
        tempValidate = { ...tempValidate, revenue: parseInt(formData?.revenue) };
      }

      const errors = await formValidatorJoi(tempValidate, t);
      if (errors && Object.keys(errors).length) {
        setErrorMessages(errors);
        return;
      }
      const payload = {
        name: formData?.companyName,
        domain: formData?.companyDomain,
        industry: formData?.companyIndustry?.id,
        // key is removed from the payload
        // owner: formData?.companyOwner?.id,
        numberOfEmployees: formData?.numberOfEmployees,
        revenue: formData?.revenue,
        address: formData?.googleAddress?.name,
        coordinates: formData?.googleAddress?.position,
      };

      try {
        const response = await createCompany(payload);
        if (response?.statusCode === 200) {
          toaster.success({
            text: t('sales.locations.createdCompany'),
            position: 'top-right',
            autoClose: toastSettings.AUTO_CLOSE,
          });
          fetchCompanies();
          closeHandle();
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

  const updateMapValue = (name, value) => {
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      const { [name]: _key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    updateFormHandler(name, value);
  };

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

  /**
   * Fetch deal owners
   */
  const fetchDealOwners = async () => {
    try {
      const response = await getDealOwnerOptions();
      if (response?.statusCode === 200) {
        setOptions((prevOptions) => ({
          ...prevOptions,
          dealOwners: response?.data?.owners,
        }));
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
    fetchIndustryVerticalOptions();
    fetchDealOwners();
  }, []);

  return (
    <>
      <Modal
        open={openHandle}
        onClose={closeHandle}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          className={classes.converModal}
          sx={style}
          component="form"
          onSubmit={handleFormSubmit}
        >
          {isSubmittingForm && <LoaderComponent label={t('sales.loading')} />}
          <Box className={classes.boxHeader}>
            <Box className={classes.titlehead}>
              <Typography variant="h4" className={classes.sidetitle}>
                {t('sales.locations.CreateCompanyHeading')}
              </Typography>
              <a className={classes.cbtn} href="#" onClick={closeHandle}>
                <Clossicon />
              </a>
            </Box>
            <Typography variant="body2" className={classes.bulkSubHeading}>
              {t('sales.locations.createNewCompanyTitle')}
            </Typography>
          </Box>

          <Box className={classNames(classes.converInner, 'innerScrollBar')}>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="CompanyDomain">
                  {`${t('sales.locations.companyDomain')}
              `}
                  {/* <RequiredAsterik /> */}
                </InputLabel>
                <TextField
                  name="companyDomain"
                  id="companyDomain"
                  fullWidth
                  placeholder={t('sales.locations.addCompanyDomain')}
                  error={!!errorMessages?.companyDomain}
                  onChange={inputChangedHandler}
                  value={formData?.companyDomain || ''}
                  helperText={
                    errorMessages?.companyDomain && checkAndAddDot(errorMessages?.companyDomain)
                  }
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="CompanyDomain">
                  {`${t('sales.locations.companyName')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <TextField
                  name="companyName"
                  id="companyName"
                  fullWidth
                  placeholder={t('sales.locations.addCompanyName')}
                  error={!!errorMessages?.companyName}
                  onChange={inputChangedHandler}
                  value={formData?.companyName || ''}
                  helperText={errorMessages?.companyName}
                />
              </Box>
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="industry">
                  {`${t('sales.locations.industry')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="companyIndustry"
                  id="companyIndustry"
                  placeHolder={t('sales.locations.selectIndustry')}
                  placeHolderClassName={classes?.placeHolderColor}
                  options={transformArrayForOptions(options.industries, 'name', 'id') || []}
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.companyIndustry || {}}
                  handleChange={inputChangedHandler}
                  className={classes.dropHigh}
                  bordered
                  searchable
                  isError={errorMessages?.companyIndustry}
                />
                <span className="errorMessage">{errorMessages?.companyIndustry}</span>
              </Box>
              {/* <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="owner">
                  {`${t('sales.locations.owner')}
              `}
                  <RequiredAsterik />
                </InputLabel>
                <CustomDropDown
                  name="companyOwner"
                  id="companyOwner"
                  placeHolder={t('sales.locations.selectOwner')}
                  placeHolderClassName={classes?.placeHolderColor}
                  options={
                    transformArrayForOptions(options.dealOwners, 'name', 'id', 'email') || []
                  }
                  label={formData?.dealOwner?.description}
                  selectedValues={formData?.companyOwner || {}}
                  handleChange={inputChangedHandler}
                  className={classes.dropHigh}
                  bordered
                  searchable
                  isError={errorMessages?.companyOwner}
                />
                <span className="errorMessage">{errorMessages?.companyOwner}</span>
              </Box> */}
            </Box>
            <Box className={classes.sideBySideCol}>
              <Box className={classes.fieldWrapper}>
                <InputLabel className={classes.blueLabel} htmlFor="noOfEmployees">
                  {`${t('sales.locations.noOfEmployees')}
              `}
                </InputLabel>
                <TextField
                  name="numberOfEmployees"
                  id="numberOfEmployees"
                  type="number"
                  fullWidth
                  placeholder={t('sales.locations.addNoOfEmployees')}
                  error={!!errorMessages?.numberOfEmployees}
                  onChange={inputChangedHandler}
                  value={formData?.numberOfEmployees}
                  placeHolderClassName={classes.placeHolderSize}
                  helperText={errorMessages?.numberOfEmployees}
                />
              </Box>
              <Box className={classes.fieldWrapper}>
                <InputLabel htmlFor="revenue">{`${t('sales.locations.revenue')}`}</InputLabel>
                <TextField
                  name="revenue"
                  id="revenue"
                  type="number"
                  fullWidth
                  placeholder={t('sales.locations.addRevenue')}
                  error={!!errorMessages?.revenue}
                  onChange={inputChangedHandler}
                  value={formData?.revenue}
                  helperText={errorMessages?.revenue}
                />
              </Box>
            </Box>
            <Box className={classes.marginBottomCol}>
              {isLoaded && (
                <GoogleMapSearchAddressComponent
                  isLoaded={isLoaded}
                  updateMapValue={updateMapValue}
                  errorMessages={errorMessages}
                  formKey="googleAddress"
                  setAddress={setAddress}
                  address={address}
                  setActiveMarker={setActiveMarker}
                  setSelectedLocation={setSelectedLocation}
                  setCenter={setCenter}
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
                  selectedLocation={selectedLocation}
                  setCenter={setCenter}
                  center={center}
                  mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '10px' }}
                />
              )}
            </Box>
          </Box>
          <Box className={classes.sidefooter}>
            <Box className={classes.footerButtons}>
              <Button
                variant="secondaryGrey"
                className={classNames(classes.blessbtn, classes.btn)}
                onClick={closeHandle}
              >
                {t('sales.locations.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={classNames(classes.bluebtn, classes.btn)}
                disabled={isSubmittingForm}
              >
                {t('sales.locations.createCompany')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

CreateNewCompanyModal.propTypes = {
  openHandle: PropTypes.func,
  closeHandle: PropTypes.func,
  fetchCompanies: PropTypes.func,
};

export default CreateNewCompanyModal;
