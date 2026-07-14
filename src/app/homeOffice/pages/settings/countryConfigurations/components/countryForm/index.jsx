import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg?react';
import classNames from 'classnames';
import currencyCodes from 'currency-codes';
import currencyFormatter from 'currency-formatter';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomDropDown from 'src/app/components/common/customDropDown';
import LoaderComponent from 'src/app/components/common/loader';
import SweetAlertModal from 'src/app/components/common/sweetAlertModal';
import { ReactComponent as WarningIcon } from 'src/assets/svg/warning.svg?react';
import { createUniqueHash } from 'src/helper/utilityFunctions';
import {
  getCountries,
  getCountryConfigurations,
  updateOrPublishCountryConfiguration,
} from 'src/services/countryConfigurations.service';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { dateFormats, toastSettings } from 'src/utils/constants';
import joiValidate from 'src/utils/formValidator/formValidator.requiredCheck';
import { toaster } from 'src/utils/toast';

import { statuses } from '../..';
import { useStyles } from './countryForm.styles';

const emptyState = {
  country: {
    name: '',
    id: '',
    flag: '',
    shortCode: '',
  },
  currency: {
    name: '',
    id: '',
  },
  dateFormat: {
    name: '',
    id: '',
  },
  distanceUnit: 0,
  id: '',
  uniqueId: '',
};

const statusEnum = {
  draft: 0,
  published: 1,
};

const distanceUnitEnum = {
  kilometers_meters: 0,
  miles_foot: 1,
};

const CountryForm = () => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [countriesConfigurationList, setCountriesConfigurationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [areCountriesOptionsLoading, setCountriesOptionsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [countryObjects, setCountriesOptions] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showPublishModal, setTogglePublishModal] = useState(false);
  const [publishFormData, setPublishFormData] = useState({});

  const currencyLabels = currencyFormatter.currencies
    .map((curr) => {
      const nameEntry = currencyCodes.code(curr.code);
      if (curr.code && curr.symbol && nameEntry?.currency) {
        return {
          id: curr.code,
          name: `${nameEntry.currency} (${curr.symbol})`,
          symbol: curr.symbol,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Adding new formdata (country configuration) with empty state
  const addNewFormData = useCallback(() => {
    const newUniqueId = createUniqueHash();
    setCountriesConfigurationList((prevState) => [
      ...prevState,
      { ...emptyState, uniqueId: newUniqueId },
    ]);
    setExpandedAccordion(newUniqueId);
  }, []);

  // Fetching all countries that are not currently configured
  const fetchCountries = async () => {
    try {
      setCountriesOptionsLoading(true);
      const response = await getCountries();

      if (response?.statusCode === 200) {
        setCountriesOptions(response.data.countries);
      }
    } catch (error) {
      toaster.error(error?.message, {
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setCountriesOptionsLoading(false);
    }
  };

  // Fetching the configured countries list
  const fetchCountriesConfiguration = async () => {
    try {
      setLoading(true);
      const response = await getCountryConfigurations();

      if (response?.statusCode === 200) {
        const updatedData = response?.data?.countryConfigurations?.map(
          ({ id, status, dateFormat, distanceUnit, country, currency }) => {
            const configCurrency = currencyLabels?.find(({ id }) => id === currency?.shortCode);
            return {
              country: {
                ...country,
                label: country.name,
                value: country.id,
                image: country.flag,
              },
              id,
              distanceUnit: distanceUnitEnum[distanceUnit],
              dateFormat: {
                name: dateFormat,
                id: dateFormat,
                value: dateFormat,
                label: dateFormat,
              },
              currency: {
                ...configCurrency,
                value: configCurrency?.id,
                label: configCurrency?.name,
              },
              status,
            };
          },
        );
        setCountriesConfigurationList(updatedData);
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
      setIsInitialLoad(true);
    }
  };

  const updateFormHandler = useCallback((name, value, id) => {
    setCountriesConfigurationList((prevState) => {
      const updatedState = [...prevState];
      const index = updatedState.findIndex((item) => item.id === id || item?.uniqueId === id);
      if (index !== -1) {
        updatedState[index] = { ...updatedState[index], [name]: value };
      }
      return updatedState;
    });

    setErrorMessages((prevErrors) => {
      const newErrors = { ...prevErrors };
      // Remove the specific error for this field in this accordion
      delete newErrors[`${id}_${name}`];
      return newErrors;
    });
  }, []);

  const handleInputChange = useCallback(
    (event, id) => {
      const { name, value } = event.target || event;
      updateFormHandler(name, value, id);
    },
    [updateFormHandler, countryObjects],
  );

  // Fetching the countries list and countries configuration list
  useEffect(() => {
    fetchCountries();
    fetchCountriesConfiguration();
  }, []);

  // Opening first country configuration's accordion by default
  useEffect(() => {
    if (isInitialLoad && countriesConfigurationList?.length > 0) {
      setExpandedAccordion(
        countriesConfigurationList[0]?.id || countriesConfigurationList[0]?.uniqueId,
      );
      setIsInitialLoad(false);
    }
  }, [countriesConfigurationList, isInitialLoad]);

  // Creating the payload for the API
  const createFinalPayload = (formData, status) => ({
    countryId: +formData?.country?.id || '',
    status: statusEnum[status],
    distanceUnit: +formData.distanceUnit,
    dateFormat: formData?.dateFormat?.id || '',
    currency: {
      shortCode: formData?.currency?.id,
      symbol: formData?.currency?.symbol,
    },
  });

  const handleDraftOrPublishConfiguration = async (finalPayload) => {
    setLoading(true);
    try {
      const response = await updateOrPublishCountryConfiguration(finalPayload);

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        await fetchCountriesConfiguration();
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit Handle
  const handleSubmit = async (event, formData, formStatus) => {
    event.preventDefault();

    if (!formData?.country?.id && formStatus === statuses.draft) {
      setErrorMessages({
        [`${formData.uniqueId || formData.id}_country`]: t(
          'ho.countryConfigurations.draftCountryRequired',
        ),
      });
      return;
    }

    if (formStatus === statuses.published) {
      const validatePayload = {
        country: formData?.country?.name || null,
        currency: formData?.currency?.name || null,
        dateFormat: formData?.dateFormat?.name || null,
      };
      const errors = await joiValidate(validatePayload, t);

      if (Object.keys(errors).length) {
        const formattedErrors = {};
        Object.entries(errors).forEach(([field, error]) => {
          formattedErrors[`${formData.uniqueId || formData.id}_${field}`] = error;
        });
        setErrorMessages(formattedErrors);
        return;
      }
    }

    const finalPayload = createFinalPayload(formData, formStatus);

    if (formStatus === statuses.published) {
      setTogglePublishModal(true);
      setPublishFormData(finalPayload);
      return;
    }

    await handleDraftOrPublishConfiguration(finalPayload);
  };

  // Removing the country configuration if it is neither published nor draft
  const removeCountryConfiguration = useCallback((id) => {
    setCountriesConfigurationList((prevState) => prevState.filter((item) => item?.uniqueId !== id));
  }, []);

  // Dynamically rendering chip based on the status of the country configuration
  const getDynamicChip = (status) => (
    <Chip
      label={
        status === statuses.published
          ? t('ho.countryConfigurations.published')
          : t('ho.countryConfigurations.draft')
      }
      color={status === statuses.published ? 'success' : 'warning'}
    />
  );

  // Accordion Handler
  const handleAccordionChange = (accordionId) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? accordionId : null);
  };

  // Validation methods
  const showError = (field, formData) => {
    return errorMessages[`${formData.uniqueId || formData.id}_${field}`];
  };

  return (
    <Box component="form" className={classes.countryForm} noValidate autoComplete="off">
      {loading && <LoaderComponent size={50} color="primary" label="Loading" />}

      <Typography variant="h4" className={classes.countryFormTitle}>
        {t('ho.countryConfigurations.basicConfigurationsList')}
      </Typography>

      <Box className={classes.countryFormWrapper}>
        {countriesConfigurationList?.map((formData) => (
          <Accordion
            key={formData.id || formData.uniqueId}
            expanded={expandedAccordion === (formData.id || formData.uniqueId)}
            onChange={handleAccordionChange(formData.id || formData.uniqueId)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Box className={classes.countryFormHeader}>
                {formData?.country?.flag && (
                  <Box className={classes.countryImage}>
                    <img
                      src={formData.country.flag}
                      alt={formData.country.name}
                      className={classes.countryImage}
                    />
                  </Box>
                )}
                <Typography variant="h5" className={classes.countryFormTitle}>
                  {formData?.country?.name ||
                    t('ho.countryConfigurations.addNewCountryConfiguration')}
                </Typography>
              </Box>
              {formData?.status && getDynamicChip(formData.status)}
            </AccordionSummary>

            <AccordionDetails>
              <Box className={classes.countryFormBody}>
                <Box className={classes.countryFormField}>
                  <InputLabel htmlFor="country">
                    {t('ho.countryConfigurations.selectCountry')}
                  </InputLabel>
                  <Box>
                    {areCountriesOptionsLoading ? (
                      <Skeleton className={classes.dropDownSkeleton} />
                    ) : (
                      <Box>
                        <CustomDropDown
                          name="country"
                          options={transformArrayForOptions(
                            countryObjects,
                            'name',
                            'id',
                            '',
                            'flag',
                          )}
                          selectedValues={formData?.country || {}}
                          placeHolder={t('ho.countryConfigurations.country')}
                          bordered
                          disabled={formData?.id}
                          className={classes.countryFormDropdown}
                          handleChange={(event) =>
                            handleInputChange(event, formData?.id || formData?.uniqueId)
                          }
                          isError={showError('country', formData)}
                        />
                        {showError('country', formData) && (
                          <Box className={classes.invalidFeedback}>
                            {showError('country', formData)}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box className={classes.countryFormField}>
                  <InputLabel htmlFor="countryShortCode">
                    {t('ho.countryConfigurations.countryCode')}
                  </InputLabel>
                  <TextField
                    type="text"
                    id="countryShortCode"
                    placeholder={t('ho.countryConfigurations.countryCode')}
                    name="countryShortCode"
                    disabled
                    className={classes.disabledField}
                    value={formData?.country?.shortCode || ''}
                  />
                </Box>

                <Box className={classes.countryFormField}>
                  <InputLabel htmlFor="currency">
                    {t('ho.countryConfigurations.chooseCurrency')}
                  </InputLabel>
                  <Box>
                    <CustomDropDown
                      name="currency"
                      options={transformArrayForOptions(currencyLabels, 'name', 'id')}
                      selectedValues={formData?.currency || {}}
                      handleChange={(e) => handleInputChange(e, formData?.id || formData?.uniqueId)}
                      disabled={formData.status === statuses.published}
                      placeHolder={t('ho.countryConfigurations.currency')}
                      bordered
                      className={classes.countryFormDropdown}
                      isError={showError('currency', formData)}
                      searchable
                    />
                    {showError('currency', formData) && (
                      <Box className={classes.invalidFeedback}>
                        {showError('currency', formData)}
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box className={classes.countryFormField}>
                  <InputLabel htmlFor="dateFormat">
                    {t('ho.countryConfigurations.chooseDateFormat')}
                  </InputLabel>
                  <Box>
                    <CustomDropDown
                      name="dateFormat"
                      options={transformArrayForOptions(dateFormats, 'name', 'id')}
                      selectedValues={formData?.dateFormat || {}}
                      handleChange={(e) => handleInputChange(e, formData?.id || formData?.uniqueId)}
                      disabled={formData.status === statuses.published}
                      placeHolder={t('ho.countryConfigurations.dateFormat')}
                      bordered
                      popperClass={classes.countryFormPopper}
                      className={classNames(
                        classes.countryFormDropdown,
                        classes.countryFormDateFormat,
                      )}
                      isError={showError('dateFormat', formData)}
                      enableLowerCase
                    />
                    {showError('dateFormat', formData) && (
                      <Box className={classes.invalidFeedback}>
                        {showError('dateFormat', formData)}
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box className={classes.countryFormField}>
                  <InputLabel>{t('ho.countryConfigurations.distance')}</InputLabel>
                  <RadioGroup
                    className={classes.countryFormRadio}
                    value={formData.distanceUnit}
                    name="distanceUnit"
                    onChange={(e) => handleInputChange(e, formData?.id || formData?.uniqueId)}
                  >
                    <FormControlLabel
                      value={0}
                      disabled={formData.status === statuses.published}
                      control={<Radio disableRipple />}
                      label={t('ho.countryConfigurations.km')}
                    />
                    <FormControlLabel
                      value={1}
                      disabled={formData.status === statuses.published}
                      control={<Radio disableRipple />}
                      label={t('ho.countryConfigurations.miles')}
                    />
                  </RadioGroup>
                </Box>
              </Box>

              {formData?.status !== statuses.published && (
                <Box className={classes.countryFormActions}>
                  <Box>
                    {!formData?.id && (
                      <Button
                        variant="secondaryGrey"
                        onClick={() => removeCountryConfiguration(formData?.uniqueId)}
                      >
                        {t('links.cancel')}
                      </Button>
                    )}
                  </Box>

                  <Box className={classes.countryFormActionsLeft}>
                    <>
                      <Button
                        variant="secondaryBlue"
                        className={classes.cancelBtn}
                        onClick={(event) => handleSubmit(event, formData, statuses.draft)}
                      >
                        {t('ho.countryConfigurations.saveAsDraft')}
                      </Button>

                      <Button
                        className={classes.saveBtn}
                        variant="primary"
                        onClick={(event) => handleSubmit(event, formData, statuses.published)}
                      >
                        {t('ho.countryConfigurations.publish')}
                      </Button>
                    </>
                  </Box>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {countryObjects?.length ? (
        <Box>
          <Button variant="secondaryBlue" startIcon={<PlusIcon />} onClick={addNewFormData}>
            {t('ho.countryConfigurations.addMore')}
          </Button>
        </Box>
      ) : null}

      <SweetAlertModal
        type="warning"
        customClass={{
          confirmButton: classes.sweetAlertConfirmBlueButton,
        }}
        title={t('ho.countryConfigurations.publishModalTitle')}
        text={t('ho.countryConfigurations.publishModalText')}
        confirmButtonText={t('ho.countryConfigurations.publishModalBtn')}
        cancelButtonText={t('links.cancel')}
        show={showPublishModal}
        icon={<WarningIcon />}
        handleConfirmButton={() => handleDraftOrPublishConfiguration(publishFormData)}
        handleCancelButton={() => setTogglePublishModal(false)}
        reverseButtons={true}
      />
    </Box>
  );
};

export default CountryForm;
