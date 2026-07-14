import CustomDropDown from 'commonComponents/customDropDown';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CountrySelect from 'src/app/components/common/countrySelect';
import { isObjectEmpty, mapDropDownData, removeKey } from 'src/helper/utilityFunctions';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';

const INPUT_TYPE = {
  STATES: 'states',
  COUNTRY: 'country',
};

const ALL_TYPE = (t) => ({
  value: 'all',
  label: t('obx.franchiseMap.allStates'),
  name: 'all',
  id: 'all',
});
const useCountryCityStateHook = ({
  formData,
  setFormData,
  errorMessages,
  setErrorMessages,
  multiStates,
  multiCities,
  searchCountry = true,
  stateProps,
  cityProps,
  cityPlaceholder,
  statePlaceholder,
}) => {
  const reduxCountries = useSelector((state) => state.user.countries);
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
  cityPlaceholder = t(
    `obx.form.input.dropDown.${isCountryAustralia ? 'selectSuburb' : 'selectCity'}.label`,
  );

  /**
   * @description get the initial list of countries
   */
  const getConfigurations = async () => {
    try {
      let res = reduxCountries;
      const defaultCountry = res[res?.length - 1];

      const countries = res?.map((country) => mapDropDownData(country));
      const states = res
        ?.find((item) => item?.countryCode == defaultCountry?.countryCode)
        ?.states?.map((state) => mapDropDownData(state));

      const transformedStatesArray = transformArrayForOptions(states, 'name', 'id');

      setLocalStates((prev) => ({
        ...prev,
        states: transformedStatesArray,
        countryCodes: res?.map((country) => country?.countryCode),
        cities: [],
        countries: countries,
      }));
      setBoolLocalStates((prev) => ({
        ...prev,
        state: false,
        city: true,
      }));

      setAPIData(res);
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
  const handleHookInputChange = (event) => {
    const { name, value } = event.target;
    if (value) {
      // ? NOTE: if the key "key" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [name]: key, ...rest } = errorMessages;
      setErrorMessages(rest);
    }
    let finalVal = value;
    if (name === INPUT_TYPE.STATES) {
      let cities = [];
      apiData?.forEach((country) => {
        country?.states?.forEach((state) => {
          const exists = multiStates
            ? finalVal?.find((a) => a?.value == state?.id)
            : finalVal?.value == state?.id;

          if (exists) {
            if (cities.length < 1) {
              cities = [];
            }
            cities = [...cities, ...transformArrayForOptions(state?.cities, 'name', 'id')];
            return;
          }
        });
      });

      setFormData((prev) => ({ ...prev, cities: multiCities ? [] : {} }));

      setLocalStates((prev) => ({
        ...prev,
        cities,
      }));
      setBoolLocalStates((prev) => ({ ...prev, city: false }));
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
        states: multiStates ? [] : {},
        cities: multiCities ? [] : {},
      }));

      setErrorMessages((prev) => removeKey('country', prev));
      setLocalStates((prev) => ({
        ...prev,
        states: transformArrayForOptions(states, 'name', 'id'),
      }));
    },
    [apiData],
  );
  /**
   * get countries options
   */
  useEffect(() => {
    if (!apiData?.length && reduxCountries?.length) {
      getConfigurations();
    }
  }, [reduxCountries]);

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
    if (formData?.states && apiData?.length) {
      let cities = [];
      apiData?.forEach((country) => {
        country?.states?.forEach((state) => {
          const exists = multiStates
            ? formData?.states?.find((a) => a?.value == state?.id)
            : formData?.states?.value == state?.id;
          if (exists) {
            if (cities.length < 1) {
              cities = [];
            }
            cities = [...cities, ...transformArrayForOptions(state?.cities, 'name', 'id')];
          }
        });
      });

      setLocalStates((prev) => ({
        ...prev,
        cities,
      }));

      setBoolLocalStates((prev) => ({ ...prev, city: false }));
    }
  }, [localStates.states, apiData]);

  const CityHookComponent = useCallback(() => {
    console.log({
      cityPlaceholder,
      isCountryAustralia,
      cond:
        cityPlaceholder ||
        t(`obx.form.input.dropDown.${isCountryAustralia ? 'selectSuburb' : 'selectCity'}.label`),
    });
    return (
      <CustomDropDown
        label={cityPlaceholder}
        name="cities"
        options={localStates.cities}
        selectedValues={formData.cities}
        handleChange={handleHookInputChange}
        multiSelect={multiCities}
        checkmark={true}
        searchable={cityProps?.searchable ? cityProps?.searchable : true}
        withTiles={true}
        {...cityProps}
        disabled={multiCities ? !formData?.states?.length : isObjectEmpty(formData?.states)}
        placeHolder={cityPlaceholder}
      />
    );
  }, [
    localStates?.cities,
    boolLocalStates?.city,
    errorMessages?.city,
    formData?.cities,
    localStates?.states,
    formData?.states,
  ]);

  const isValidCountryOptions = !!localStates?.countryCodes?.length;
  const CountrySelectHookComponent = useCallback(() => {
    return (
      <CountrySelect
        disabled={!isValidCountryOptions}
        error={errorMessages?.country}
        countryCodes={isValidCountryOptions ? localStates?.countryCodes : []}
        data={formData?.countryCode ? formData?.countryCode : ''}
        updateFormHandler={handleCountryChange}
        searchable={searchCountry}
      />
    );
  }, [formData?.countryCode, localStates?.countryCodes, errorMessages?.country]);

  const allStates = stateProps?.allOption
    ? [ALL_TYPE(t), ...(localStates?.states ?? [])]
    : localStates?.states;
  const StateHookComponent = useCallback(() => {
    return (
      <CustomDropDown
        label={t('sales.companies.states')}
        name="states"
        options={allStates}
        selectedValues={formData?.states}
        handleChange={handleHookInputChange}
        multiSelect={multiStates}
        checkmark={true}
        searchable={stateProps?.searchable ? stateProps?.searchable : true}
        withTiles={true}
        placeHolder={statePlaceholder || t('sales.companies.cities')}
        {...stateProps}
      />
    );
  }, [
    localStates?.states,
    boolLocalStates?.state,
    errorMessages?.state,
    formData?.states,
    multiStates,
    handleHookInputChange,
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

useCountryCityStateHook.defaultProps = {
  multiStates: false,
  multiCities: false,
  stateProps: {},
  cityProps: {},
};
export default useCountryCityStateHook;
