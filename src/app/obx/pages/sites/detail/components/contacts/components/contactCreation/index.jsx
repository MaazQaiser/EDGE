import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  InputLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactComponent as CrossIcon } from 'assets/svg/close.svg?react';
import { ReactComponent as InfoIcon } from 'assets/svg/InfoIcon.svg?react';
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
  createSageContact,
  getSageContactDetails,
  updateSageContact,
} from 'src/services/billing.service';
import { disabledCountryStateCity, rolesEnumWithName, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { useStyles } from './contactCreation.js';

const emptyState = {
  firstName: '',
  lastName: '',
  primaryEmail: '',
  phoneNumber: '',
  companyName: '',
  sameAsSite: false,
  recepientEmails: [],
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  country: '',
  state: '',
  city: '',
  timesheet: false,
};

const ContactCreation = ({ siteId, contactId, refreshData, handleClose }) => {
  const [formData, setFormData] = useState({ ...emptyState, siteId });
  const [errorMessages, setErrorMessages] = useState({});

  const { t } = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { getNewApiController } = useApiControllers();
  const userRole = useSelector((state) => state?.auth?.userRole?.slug);
  const isHomeOfficer = userRole === rolesEnumWithName.home_officer.slug;

  const countryCounfiguration = useSelector(
    (state) => state?.auth?.countryConfiguration || state?.auth?.defaultCountryConfiguration,
  );
  const isCountryAustralia = countryCounfiguration?.country?.shortCode === 'AU';

  // const label = { inputProps: { 'aria-label': 'Switch demo' } };
  const getErrorKey = (key) => {
    return `contactDetails,${key}`;
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
      hookDisabled: disabledCountryStateCity(userRole, formData?.isPrimary),
    });

  const fetchContactsDetails = async (id) => {
    const apiController = getNewApiController();

    setLoading(true);
    try {
      const response = await getSageContactDetails(id);

      if (response && response?.statusCode === 200) {
        setFormData((prevState) => {
          const contactData = {
            ...prevState,
            ...response?.data?.sageContact,
            recepientEmails: response?.data?.sageContact?.secondaryEmails || [],
            countryCode: response?.data?.sageContact?.country?.countryCode,
            country: response?.data?.sageContact?.country?.id,
            state: response?.data?.sageContact?.state?.id,
            city: response?.data?.sageContact?.city?.id,
            addressLine1: response?.data?.sageContact?.addressLineOne,
            addressLine2: response?.data?.sageContact?.addressLineTwo,
          };
          return contactData;
        });
      }
      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleMultipleSelectedValues = async (event, field) => {
    if (event.target.value) {
      setFormData((prevState) => ({
        ...prevState,
        [field]: [...prevState[field], event.target.value],
      }));
    }
  };

  const handleChipDelete = (e, index) => {
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

  const hasEmailRecipientsError = (errors) => {
    return Object.keys(errors).some((key) => key.includes('contactDetails,recepientEmails'));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessages({});
    const contactDetails = {
      ...formData,
      addressLineOne: formData?.addressLine1,
      addressLineTwo: formData?.addressLine2,
      secondaryEmails: formData?.recepientEmails,
    };

    // Build validation payload with conditional logic for address fields
    const isPrimary = formData?.isPrimary;
    const validatePayload = { ...contactDetails };
    const addressFields = ['postalCode', 'addressLine1', 'city', 'state', 'country'];
    addressFields.forEach((field) => {
      const value = formData?.[field];

      const isAddressLine1 = field === 'addressLine1';
      if (isHomeOfficer || (!isHomeOfficer && isPrimary !== true)) {
        validatePayload[field] = value || null;
        if (isAddressLine1) validatePayload.addressLineOne = value || null;
      } else {
        if (value) {
          validatePayload[field] = value;
          if (isAddressLine1) validatePayload.addressLineOne = value;
        } else {
          delete validatePayload[field];
          if (isAddressLine1) delete validatePayload.addressLineOne;
        }
      }
    });
    const errors = await joiValidate({ contactDetails: validatePayload }, t);

    if (errors && Object.keys(errors).length) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    try {
      const response = contactId
        ? await updateSageContact(contactId, contactDetails)
        : await createSageContact(contactDetails);
      setErrorMessages({});
      if (response?.statusCode === 200) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });

        refreshData();
        handleClose();
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
    if (contactId) {
      fetchContactsDetails(contactId);
    }
  }, [contactId]);

  return (
    <Box className={classes.siteWrapper}>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.contentContainer}>
        {/* Header */}
        <Box className={classes.headerWrap}>
          <Box className={classes.pageTitleWrap}>
            <Typography variant="h3" className={classes.pageTitlem}>
              {contactId ? t('obx.contacts.editContact') : t('obx.contacts.createContact')}
            </Typography>
            <Typography variant="info" className={classes.pageTitleSubmain}>
              {contactId
                ? 'Edit contact details as needed'
                : 'Please fill the following information to create new contact'}
            </Typography>
          </Box>
          <Box className={classes.closeIcon} role="button" onClick={handleClose}>
            <CrossIcon />
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box className={classes.scrollContent}>
          <Typography variant="h4" className={classes.pageTitlesub} sx={{ marginBottom: '16px' }}>
            Contact Information
          </Typography>
          <Box className={classes.upperWrap}>
            <Box className={classes.siteDetais}>
              <Grid container spacing={2}>
                {/* Personal Information */}
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="firstName">{t('obx.contacts.firstName')}</InputLabel>
                    <TextField
                      fullWidth
                      placeholder={t('obx.contacts.john')}
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
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="lastName">{t('obx.contacts.lastName')}</InputLabel>
                    <TextField
                      fullWidth
                      placeholder={t('obx.contacts.snow')}
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
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="email">
                      {t('obx.contacts.primaryEmail')} <RequiredAsterik />
                    </InputLabel>
                    <TextField
                      fullWidth
                      placeholder={t('obx.contacts.emailPlaceholder')}
                      type="email"
                      value={formData?.primaryEmail || ''}
                      name="primaryEmail"
                      onChange={handleInputChange}
                      className={classes?.textFiledFilter}
                      error={!!errorMessages[getErrorKey('primaryEmail')]}
                      helperText={
                        !!errorMessages[getErrorKey('primaryEmail')]
                          ? errorMessages[getErrorKey('primaryEmail')]
                          : null
                      }
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="email">
                      {t('obx.contacts.companyName')} <RequiredAsterik />
                    </InputLabel>
                    <TextField
                      fullWidth
                      placeholder={t('obx.contacts.emailPlaceholder')}
                      type="text"
                      value={formData?.companyName || ''}
                      name="companyName"
                      onChange={handleInputChange}
                      className={classes?.textFiledFilter}
                      error={!!errorMessages[getErrorKey('companyName')]}
                      helperText={
                        !!errorMessages[getErrorKey('companyName')]
                          ? errorMessages[getErrorKey('companyName')]
                          : null
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="phoneNumber">
                      {t('obx.billing.phoneNo')} <RequiredAsterik />
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
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Typography variant="h4" className={classes.pageTitlesub} sx={{ margin: '16px 0' }}>
            Address
          </Typography>
          <Box className={classes.siteDetais}>
            <Box className={classes.upperWrap}>
              <Grid container spacing={2}>
                {/* Address Information */}
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="country">
                      {t('obx.sites.createSite.country')}{' '}
                      {(isHomeOfficer || !formData?.isPrimary) && <RequiredAsterik />}
                    </InputLabel>
                    <CountrySelectHookComponent />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="state">
                      {t('obx.sites.createSite.state')}{' '}
                      {(isHomeOfficer || !formData?.isPrimary) && <RequiredAsterik />}
                    </InputLabel>
                    <StateHookComponent bordered={true} />
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.onecols} paddingTop={'16px'}>
                    <InputLabel htmlFor="city">
                      {t(`obx.sites.createSite.${isCountryAustralia ? 'suburb' : 'city'}`)}{' '}
                      {(isHomeOfficer || !formData?.isPrimary) && <RequiredAsterik />}
                    </InputLabel>
                    <CityHookComponent bordered={true} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <Box className={classes.onecols} paddingTop={'16px'}>
                    <InputLabel htmlFor="zipCode">
                      {t('obx.sites.createSite.zipCode')}{' '}
                      {(isHomeOfficer || !formData?.isPrimary) && <RequiredAsterik />}
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
                      helperText={
                        !!errorMessages[getErrorKey('postalCode')]
                          ? errorMessages[getErrorKey('postalCode')]
                          : null
                      }
                      disabled={!isHomeOfficer && formData?.isPrimary}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <Box className={classes.oneThird} paddingTop={'16px'}>
                    <InputLabel htmlFor="billingAddress">
                      {t('obx.contacts.addressLine1')}{' '}
                      {(isHomeOfficer || !formData?.isPrimary) && <RequiredAsterik />}
                    </InputLabel>
                    <TextField
                      fullWidth
                      placeholder={`${t('obx.contacts.type')} ${t('obx.contacts.addressLine1')}`}
                      className={classes?.textFiledFilter}
                      value={formData?.addressLine1 || ''}
                      name="addressLine1"
                      onChange={handleInputChange}
                      error={!!errorMessages[getErrorKey('addressLine1')]}
                      helperText={
                        !!errorMessages[getErrorKey('addressLine1')]
                          ? errorMessages[getErrorKey('addressLine1')]
                          : null
                      }
                      disabled={!isHomeOfficer && formData?.isPrimary}
                    />
                  </Box>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <Box className={classes.oneThird} paddingTop={'16px'}>
                    <InputLabel htmlFor="billingAddress">
                      {t('obx.contacts.addressLine2')}
                    </InputLabel>
                    <TextField
                      fullWidth
                      placeholder={`${t('obx.contacts.type')} ${t('obx.contacts.addressLine2')}`}
                      className={classes?.textFiledFilter}
                      value={formData?.addressLine2 || ''}
                      name="addressLine2"
                      onChange={handleInputChange}
                      error={!!errorMessages[getErrorKey('addressLine2')]}
                      helperText={
                        !!errorMessages[getErrorKey('addressLine2')]
                          ? errorMessages[getErrorKey('addressLine2')]
                          : null
                      }
                      disabled={!isHomeOfficer && formData?.isPrimary}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Typography variant="h4" className={classes.pageTitlesub} sx={{ margin: '16px 0' }}>
            Additional Information
          </Typography>
          <Box className={classes.siteDetais}>
            <Grid container spacing={2}>
              {/* Email Recipients */}
              <Grid item xs={12}>
                <Box className={classes.emailWrapper}>
                  <Box className={classes.inlineFields}>
                    <InputLabel htmlFor="recepientEmails">
                      {t('obx.billing.secondaryEmailAddresses')}
                    </InputLabel>
                    <Tooltip
                      arrow
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
                          sx: { cursor: 'pointer' },
                        },
                      }}
                      title={t('obx.billing.info')}
                      placement="right"
                    >
                      <InfoIcon className={classes.alertIcon} />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    disableClearable={true}
                    id={'recepientEmails'}
                    options={[]}
                    value={formData?.recepientEmails || []}
                    className={classes.autoCompleteField}
                    freeSolo
                    onChange={(event) => handleMultipleSelectedValues(event, 'recepientEmails')}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            color="primary"
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
                        name={'recepientEmails'}
                        variant="filled"
                        label=""
                        placeholder={t('obx.billing.emailRecepientsPlaceholder')}
                        type="email"
                        className={classes.autoCompleteTextField}
                        error={!!errorMessages[getErrorKey('recepientEmails')]}
                        helperText={
                          !!errorMessages[getErrorKey('recepientEmails')]
                            ? errorMessages[getErrorKey('recepientEmails')]
                            : null
                        }
                      />
                    )}
                  />
                  {hasEmailRecipientsError(errorMessages) && (
                    <Box className={classes.invalidFeedback}>{t('errors.emailRecepients')}</Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Sticky Bottom */}
        <RenderIfHasPermission name={ACL_OBX_SITE_BILLINGS_UPDATE}>
          <Box className={classes.lowerWrap}>
            <Box className={classes.buttonGroup}>
              <Button variant="secondaryGrey" onClick={handleClose}>
                {t('obx.contacts.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                {contactId ? t('obx.contacts.updateContact') : t('obx.contacts.createContact')}
              </Button>
            </Box>
          </Box>
        </RenderIfHasPermission>
      </Box>
    </Box>
  );
};

ContactCreation.propTypes = {
  siteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  contactId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshData: PropTypes.func,
  handleClose: PropTypes.func.isRequired,
};

export default ContactCreation;
