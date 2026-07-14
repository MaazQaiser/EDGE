import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { mapDropDownData, removeKey } from 'src/helper/utilityFunctions';
import { fetchConfigList } from 'src/services/settings.services';

import CountrySelect from '../common/countrySelect';
import SelectInput from '../common/Select';

const INPUT_TYPE = {
  STATE: 'state',
  COUNTRY: 'country',
};
export const useCustomAddressHook = ({
  formData,
  setFormData,
  errorMessages,
  setErrorMessages,
  hookDisabled = {
    city: false,
    state: false,
    country: false,
  },
  searchableState = true,
  searchableCity = true,
  searchableCountry = true,
}) => {
  /**
   * option states
   */
  const [localStates, setLocalStates] = useState({
    states: [],
    countries: [],
    cities: [],
    countryCodes: [],
  });

  const [apiData, setAPIData] = useState({});

  const [boolLocalStates, setBoolLocalStates] = useState({
    state: true,
    country: true,
    city: true,
  });

  const { t } = useTranslation();

  const countryCounfiguration = useSelector(
    (state) => state?.auth?.countryConfiguration || state?.auth?.defaultCountryConfiguration,
  );
  const isCountryAustralia = countryCounfiguration?.country?.shortCode === 'AU';

  /**
   * @description get the initial list of countries
   */
  const getConfigurations = async () => {
    try {
      let res = await fetchConfigList();
      const defaultCountry = res?.countries[res?.countries?.length - 1];

      const countries = res?.countries?.map((country) => mapDropDownData(country));
      const states = res?.countries
        ?.find((item) => item?.countryCode == defaultCountry?.countryCode)
        ?.states?.map((state) => mapDropDownData(state));

      setLocalStates((prev) => ({
        ...prev,
        states: states,
        countryCodes: res?.countries?.map((country) => country?.countryCode),
        cities: [],
        countries: countries,
      }));
      setBoolLocalStates((prev) => ({
        ...prev,
        state: false,
        city: true,
      }));

      setAPIData(res?.countries);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * @description update form data
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

  /**
   * @description update city or country
   * @param {HTMLElementEventMap} event
   */
  const handleHookInputChange = (event, selectedCountryCode) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    let finalVal = value;
    if (name === INPUT_TYPE.STATE) {
      apiData?.forEach((country) => {
        country?.states?.forEach((state) => {
          if (finalVal == state?.id && selectedCountryCode === state?.countryId) {
            setLocalStates((prev) => ({ ...prev, cities: state?.cities }));
            setFormData((prev) => ({ ...prev, city: '' }));
            setBoolLocalStates((prev) => ({ ...prev, city: false }));
            return;
          }
        });
      });
    }
    updateFormHandler(name, finalVal);
  };

  const handleCountryChange = useCallback(
    (e) => {
      const country = apiData?.find((country) => country?.countryCode == e);
      const states = country?.states?.map((state) => mapDropDownData(state));
      setBoolLocalStates((prev) => ({ ...prev, city: true, state: false }));
      setFormData((prev) => ({
        ...prev,
        countryCode: e,
        country: country?.id,
        state: '',
        city: '',
      }));

      setErrorMessages((prev) => removeKey('country', prev));
      setLocalStates((prev) => ({ ...prev, states: states }));
    },
    [apiData],
  );

  /**
   * get countries options
   */
  useEffect(() => {
    if (!apiData?.length) {
      getConfigurations();
    }
  }, []);

  /**
   * when country is updated from API (user's data then update state options)
   */
  useEffect(() => {
    if (formData?.countryCode && apiData?.length) {
      const country = apiData?.find((country) => country?.countryCode == formData?.countryCode);
      const states = country?.states?.map((state) => mapDropDownData(state));
      setBoolLocalStates((prev) => ({ ...prev, city: true, state: false }));
      setFormData((prev) => ({
        ...prev,
        country: country?.id,
      }));
      setLocalStates((prev) => ({ ...prev, states: states }));
    }
  }, [formData.countryCode, apiData]);

  /**
   * when the state options are updated then enable cities drop down -> update it's options and set selected value
   */
  useEffect(() => {
    if (formData?.state && apiData?.length) {
      apiData?.forEach((country) => {
        country?.states?.forEach((state) => {
          if (formData?.state == state?.id) {
            setLocalStates((prev) => ({ ...prev, cities: state?.cities }));
            setBoolLocalStates((prev) => ({ ...prev, city: false }));
            return;
          }
        });
      });
    }
  }, [localStates.states, apiData]);

  const isValidCityOptions =
    localStates?.states?.length &&
    localStates?.countries?.length &&
    localStates?.cities?.length &&
    formData?.state;

  const CityHookComponent = useCallback(() => {
    return (
      <SelectInput
        searchable={searchableCity}
        defaultLabel={t(
          `obx.form.input.dropDown.${isCountryAustralia ? 'selectSuburb' : 'selectCity'}.label`,
        )}
        name="city"
        inputKey="id"
        labelKey="name"
        onChange={(e) => handleHookInputChange(e)}
        options={isValidCityOptions ? localStates?.cities : []}
        disabled={!!!isValidCityOptions || hookDisabled?.city}
        error={errorMessages?.city}
        selectedValue={isValidCityOptions ? formData?.city : ''}
      />
    );
  }, [
    localStates?.cities,
    boolLocalStates?.city,
    errorMessages?.city,
    formData?.city,
    searchableCity,
    localStates?.states,
    formData?.state,
    isValidCityOptions,
    hookDisabled,
  ]);
  const isValidCountryOptions = !!localStates?.countryCodes?.length;
  const CountrySelectHookComponent = useCallback(() => {
    return (
      <CountrySelect
        searchable={searchableCountry}
        disabled={!isValidCountryOptions || hookDisabled?.country}
        error={errorMessages?.country}
        countryCodes={isValidCountryOptions ? localStates?.countryCodes : []}
        data={formData?.countryCode ? formData?.countryCode : ''}
        updateFormHandler={handleCountryChange}
      />
    );
  }, [
    formData?.countryCode,
    localStates?.countryCodes,
    errorMessages?.country,
    searchableCountry,
    hookDisabled,
  ]);

  const validStateOptions = isValidCountryOptions && localStates?.states;
  const StateHookComponent = useCallback(() => {
    return (
      <SelectInput
        defaultLabel={t('obx.form.input.dropDown.selectStateRegion.label')}
        name="state"
        searchable={searchableState}
        inputKey="id"
        labelKey="name"
        onChange={(e) => handleHookInputChange(e, formData?.countryCode)}
        options={validStateOptions ? localStates?.states : []}
        disabled={!validStateOptions || hookDisabled?.state}
        error={errorMessages?.state}
        selectedValue={formData?.state ? formData?.state : ''}
      />
    );
  }, [
    localStates?.states,
    boolLocalStates?.state,
    searchableState,
    errorMessages?.state,
    formData?.state,
    handleHookInputChange,
    hookDisabled,
  ]);

  return {
    localStates,
    boolLocalStates,
    handleHookInputChange,
    CityHookComponent,
    StateHookComponent,
    handleCountryChange,
    CountrySelectHookComponent,
  };
};
