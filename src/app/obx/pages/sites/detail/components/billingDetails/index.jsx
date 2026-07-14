import {
  Box,
  Button,
  // Checkbox,
  Grid,
  InputLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LoaderComponent from 'src/app/components/common/loader';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { useCustomAddressHook } from 'src/app/components/hooks/customAddressHook';
import { ACL_OBX_SITE_BILLINGS_UPDATE } from 'src/app/router/constant/OBXMODULE';
import { useApiControllers } from 'src/helper/axios';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import {
  getBillingDetail,
  getSageContactsDropDown,
  updateBillingDetails,
} from 'src/services/billing.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { disabledCountryStateCity, rolesEnumWithName, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './billingDetails';

const emptyState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  sameAsSite: false,
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  country: '',
  state: '',
  city: '',
  sameAsPrimary: false,
  billTo: {},
  shipTo: {},
};

const BillingDetails = ({ siteId }) => {
  const [formData, setFormData] = useState(emptyState);
  const [errorMessages, setErrorMessages] = useState({});

  const { t } = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const { getNewApiController } = useApiControllers();
  const userRole = useSelector((state) => state?.auth?.userRole?.slug);
  const isHomeOfficer = userRole === rolesEnumWithName.home_officer.slug;

  const countryCounfiguration = useSelector(
    (state) => state?.auth?.countryConfiguration || state?.auth?.defaultCountryConfiguration,
  );
  const isCountryAustralia = countryCounfiguration?.country?.shortCode === 'AU';

  // const label = { inputProps: { 'aria-label': 'Switch demo' } };
  const getErrorKey = (key) => {
    return `billingDetails,${key}`;
  };

  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCustomAddressHook({
      formData,
      setFormData,
      errorMessages: {
        ...errorMessages,
        city: errorMessages[getErrorKey('city')],
        state: errorMessages[getErrorKey('state')],
        country: errorMessages[getErrorKey('country')],
      },
      setErrorMessages: () => {},
      hookDisabled: disabledCountryStateCity(userRole),
    });

  const fetchBillingDetails = async (siteId) => {
    const apiController = getNewApiController();

    setLoading(true);
    try {
      const response = await getBillingDetail(siteId);

      if (response && response?.statusCode === 200) {
        const responseFormData = { ...response?.data?.sageContact };
        setFormData((prevState) => ({
          ...prevState,
          ...responseFormData,
          addressLine1: responseFormData?.addressLineOne,
          email: responseFormData?.primaryEmail,
          billTo: responseFormData?.billTo?.value ? responseFormData?.billTo : {},
          shipTo: responseFormData?.shipTo?.value ? responseFormData?.shipTo : {},
          countryCode: responseFormData?.country?.countryCode,
          country: responseFormData?.country?.id,
          state: responseFormData?.state?.id,
          city: responseFormData?.city?.id,
          sameAsPrimary:
            responseFormData?.billTo?.value == responseFormData?.id &&
            responseFormData?.shipTo?.value == responseFormData?.id,
        }));
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchSageContactsDropDown = async (siteId) => {
    try {
      const response = await getSageContactsDropDown(siteId);

      if (response && response?.statusCode === 200) {
        setContacts(transformArrayForOptions(response?.data, 'name', 'id'));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const _handleMultipleSelectedValues = async (event, field) => {
    if (event.target.value) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: [...prevState[field], event.target.value],
      }));
    }
  };

  const _handleChipDelete = (e, index) => {
    e.stopPropagation(); // Prevent onChange from being called

    const data = [...formData['recepientEmails']];

    const afterRemove = data.filter((_a, i) => i !== index);

    setFormData((prevState) => ({
      ...prevState,
      ['recepientEmails']: afterRemove,
    }));
  };

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );

  const _hasEmailRecipientsError = (errors) => {
    return Object.keys(errors).some((key) => key.includes('billingDetails,recepientEmails'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessages({});
    const id = formData?.id;
    const billingDetails = { ...formData };

    // Build validation payload with conditional logic for address fields
    const validatePayload = { ...billingDetails };
    const addressFields = ['postalCode', 'addressLine1', 'city', 'state', 'country'];
    addressFields.forEach((field) => {
      const value = billingDetails[field];
      if (isHomeOfficer) {
        // For HO users: include field in validation (even if empty/null) so validation can catch required errors
        validatePayload[field] = value || null;
      } else {
        // For non-HO users: only include if field has a value
        if (!!value) {
          validatePayload[field] = value;
        } else {
          delete validatePayload[field];
        }
      }
    });

    const errors = await joiValidate({ billingDetails: validatePayload }, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await updateBillingDetails(id, {
        ...formData,
        primaryEmail: formData?.email,
        billingContactId: formData?.billTo?.value || null,
        shippingContactId: formData?.shipTo?.value || null,
      });
      setErrorMessages({});
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        fetchBillingDetails(siteId);
      }

      setLoading(false);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchBillingDetails(siteId);
      fetchSageContactsDropDown(siteId);
    }
  }, [siteId]);

  return (
    <Box className={classes.root}>
      <Box className={classes.content}>
        {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
        <Box noValidate autoComplete="off">
          <Box className={classes.upperWrap}>
            <Box className={classes.siteDetais}>
              <Box className={classes.siteDetaisWrapper}>
                <Typography variant="h4" className={classes.siteDetaisTitle}>
                  {t('obx.billing.primaryContact')}
                </Typography>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="firstName">{t('obx.billing.firstName')}</InputLabel>
                      <TextField
                        fullWidth
                        placeholder={t('obx.billing.john')}
                        type="text"
                        value={formData?.firstName || ''}
                        name="firstName"
                        onChange={handleInputChange}
                        className={classes?.textFiledFilter}
                        error={!!errorMessages[getErrorKey('firstName')]}
                        helperText={
                          !!errorMessages[getErrorKey('firstName')]
                            ? errorMessages[getErrorKey('firstName')]
                            : null
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="lastName">{t('obx.billing.lastName')}</InputLabel>
                      <TextField
                        fullWidth
                        placeholder={t('obx.billing.snow')}
                        type="text"
                        value={formData?.lastName || ''}
                        name="lastName"
                        onChange={handleInputChange}
                        className={classes?.textFiledFilter}
                        error={!!errorMessages[getErrorKey('lastName')]}
                        helperText={
                          !!errorMessages[getErrorKey('lastName')]
                            ? errorMessages[getErrorKey('lastName')]
                            : null
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="email">
                        {t('obx.billing.email')} <RequiredAsterik />
                      </InputLabel>
                      <TextField
                        fullWidth
                        placeholder={t('obx.billing.emailPlaceholder')}
                        type="email"
                        value={formData?.email || ''}
                        name="email"
                        onChange={handleInputChange}
                        className={classes?.textFiledFilter}
                        error={!!errorMessages[getErrorKey('email')]}
                        helperText={
                          !!errorMessages[getErrorKey('email')]
                            ? errorMessages[getErrorKey('email')]
                            : null
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="phoneNumber">
                        {t('obx.billing.phoneNumber')} <RequiredAsterik />
                      </InputLabel>
                      <PhoneNumberWithCountry
                        value={formData?.phoneNumber}
                        onChange={(value) =>
                          handleInputChange({ target: { name: 'phoneNumber', value } })
                        }
                        name={'phoneNumber'}
                        className={classes?.countryPhnNumber}
                        isError={!!errorMessages[getErrorKey('phoneNumber')]}
                        international={true}
                        error={
                          !!errorMessages[getErrorKey('phoneNumber')]
                            ? errorMessages[getErrorKey('phoneNumber')]
                            : null
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box className={classes.siteDetaisWrapper}>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={6}>
                      <InputLabel htmlFor="billingAddress">
                        {t('obx.billing.billingAddress')} {isHomeOfficer && <RequiredAsterik />}
                      </InputLabel>
                      <TextField
                        fullWidth
                        placeholder={`${t('obx.billing.type')} ${t('obx.billing.billingAddress')}`}
                        className={classes?.textFiledFilter}
                        value={formData?.addressLine1 || ''}
                        name="addressLine1"
                        onChange={handleInputChange}
                        error={!!errorMessages[getErrorKey('addressLine1')]}
                        disabled={!isHomeOfficer}
                        helperText={
                          !!errorMessages[getErrorKey('addressLine1')]
                            ? errorMessages[getErrorKey('addressLine1')]
                            : null
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="country">
                        {t('obx.sites.createSite.country')} {isHomeOfficer && <RequiredAsterik />}
                      </InputLabel>
                      <CountrySelectHookComponent />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="state">
                        {t('obx.sites.createSite.state')} {isHomeOfficer && <RequiredAsterik />}
                      </InputLabel>
                      <StateHookComponent bordered={true} />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Box className={classes.siteDetaisWrapper}>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="city">
                        {t(`obx.sites.createSite.${isCountryAustralia ? 'suburb' : 'city'}`)}{' '}
                        {isHomeOfficer && <RequiredAsterik />}
                      </InputLabel>
                      <CityHookComponent bordered={true} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <InputLabel htmlFor="zipCode">
                        {t('obx.sites.createSite.zipCode')} {isHomeOfficer && <RequiredAsterik />}
                      </InputLabel>
                      <TextField
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.zipCode')}`}
                        type="text"
                        value={formData?.postalCode || ''}
                        name="postalCode"
                        onChange={handleInputChange}
                        className={classes?.textFiledFilter}
                        error={!!errorMessages[getErrorKey('postalCode')]}
                        disabled={!isHomeOfficer}
                        helperText={
                          !!errorMessages[getErrorKey('postalCode')]
                            ? errorMessages[getErrorKey('postalCode')]
                            : null
                        }
                      />
                    </Grid>
                    <Grid item md={4} /> {/* Empty grid item for offset */}
                  </Grid>
                </Box>
              </Box>

              <Box className={classes.siteDetaisWrapper}>
                <Typography variant="h4" className={classes.siteDetaisTitle}>
                  {t('obx.billing.contacts')}
                </Typography>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={6}>
                      <InputLabel htmlFor="billTo">{t('obx.billing.billTo')}</InputLabel>
                      <CustomDropDown
                        label={t('obx.billing.billToContractPlaceholder')}
                        name="billTo"
                        options={contacts}
                        selectedValues={formData?.billTo}
                        handleChange={handleInputChange}
                        border={true}
                        bordered
                        className={classes.dropdownCommon}
                      />
                    </Grid>
                    <Grid item md={9} />
                  </Grid>
                </Box>
              </Box>
              <Box className={classes.siteDetaisWrapper}>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={6}>
                      <InputLabel htmlFor="shipTo">{t('obx.billing.shipTo')}</InputLabel>
                      <CustomDropDown
                        label={t('obx.billing.shipToContractPlaceholder')}
                        name="shipTo"
                        options={contacts}
                        selectedValues={formData?.shipTo}
                        handleChange={handleInputChange}
                        border={true}
                        bordered
                        className={classes.dropdownCommon}
                        disabled={!isHomeOfficer}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box className={classes.siteDetaisWrapper}>
                <Box className={classes.siteDetaisFields}>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} sm={6} md={3}>
                      <Box className={classes.autoCheckout}>
                        <Box className={classes.autoLeft}>
                          <InputLabel htmlFor="timesheet">{t('obx.billing.timesheet')}</InputLabel>
                        </Box>
                        <Box className={classes.autoRight} marginLeft={'10px'}>
                          <Switch
                            checked={formData?.timesheet}
                            name={'timesheet'}
                            onChange={(e) => {
                              const { name, checked } = e.target;
                              handleInputChange({ target: { name, value: checked } });
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <RenderIfHasPermission name={ACL_OBX_SITE_BILLINGS_UPDATE}>
        <Box className={classes.lowerWrap}>
          <Button variant="primary" onClick={handleSubmit}>
            {t('obx.billing.update')}
          </Button>
        </Box>
      </RenderIfHasPermission>
    </Box>
  );
};

BillingDetails.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default BillingDetails;
