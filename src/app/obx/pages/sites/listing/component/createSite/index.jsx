/* eslint-disable no-useless-catch */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ReactComponent as DustinBinIcon } from 'assets/svg/DustinBinIcon.svg?react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {
  billingFrequency,
  billingFrequencyType,
  CONTRACT_TYPES,
  franchiseIdUrlQueryParam,
  HOLIDAY_RATE_FIELDS,
  HOLIDAY_RATE_TYPES,
  rolesEnumWithName,
  toastSettings,
} from 'globalUtils/constants';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import CustomDropDown from 'src/app/components/common/customDropDown';
import ResponsiveDatePickers from 'src/app/components/common/datePicker';
import DynamicSiteForm from 'src/app/components/common/dynamicSiteForm/index.jsx';
import FuelSurchargeInputDropdown, {
  FUEL_SURCHARGE_LAYOUT_FLAT_RATE,
} from 'src/app/components/common/fuelSurchargeInputDropdown/index.jsx';
import HolidayRateInputDropdown from 'src/app/components/common/holidayRateInputDropdown';
import LoaderComponent from 'src/app/components/common/loader';
import PhoneNumberWithCountry from 'src/app/components/common/phoneNumberWithCountry';
import RequiredAsterik from 'src/app/components/common/requiredAsterik';
import { convertDataToHtml } from 'src/app/components/common/richText';
import { serviceTypes } from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import {
  dayjsWithStandardOffset,
  formatOffset,
  getFranchiseIdWithRoleAndSource,
  getStandardOffsetWithVariableTimeZone,
  getTimezone,
} from 'src/app/obx/pages/schedules/helper';
import history from 'src/app/router/utils/history';
import {
  convertDataFromForeignOffsetToUTC,
  convertDateByDaysDifference,
  isObjectEmpty,
  removeKey,
  shiftWeekdaysWRTShiftValue,
} from 'src/helper/utilityFunctions';
import useCountryCityStateHook from 'src/hooks/useCountryCItyStateHook';
import { useCurrency } from 'src/hooks/useCurrency';
import { getSageItemsDropdown } from 'src/services/invoice.services';
import {
  createContract,
  createSite,
  getAllSites,
  getHolidayGroups,
} from 'src/services/sites.services';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import { contractTenureTypes, PaymentTerms, regexValues } from 'src/utils/constants/index';
import { TIMEZONE_LIST } from 'src/utils/constants/timeZones';
import { formatNumber } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import formValidatorJoi from '../../../../../../../utils/formValidator/formValidator.requiredCheck';
import { HO_FRANCHISE_LISTING, OBX_SITES } from '../../../../../../router/constant/ROUTE';
import { useStyles } from './createSite';
const CreateSite = () => {
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const userRole = useSelector((state) => state.auth.userRole.slug);
  const timeZone = getTimezone();

  const franchiseId = getFranchiseIdWithRoleAndSource()?.[franchiseIdUrlQueryParam];
  const [sites, setSites] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);
  const [sageItems, setSageitems] = useState([]);
  const [holidayGroups, setHolidayGroups] = useState([]);
  const [_holidayGroupsLoading, setHolidayGroupsLoading] = useState(false);
  // const [timezoneOptions, setTimezoneOptions] = useState([]);
  const { currency: franchiseCurrency } = useCurrency();
  const { t } = useTranslation();
  const defaultContractTenureType = contractTenureTypes(t).find(
    (option) => option.value === 'ongoing',
  );

  const [formData, setFormData] = useState({
    siteId: {},
    name: '',
    companyName: '',
    industryVertical: {},
    // siteType: {},

    siteLocations: [],
    address: '',
    addressLineTwo: '',

    country: {},
    countryCode: 'US',

    // cities and states
    cities: {},
    states: {},
    city: {},
    state: {},
    zipCode: '',
    // timezone: '',

    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',

    contractName: '',
    startDate: null,
    endDate: null,
    contractTenureType: defaultContractTenureType,
    // revenue: 0,
    cycleRefDate: null,
    attachments: '',
    // billingStartDate: null,
    billingFrequency: {},
    billingType: {},
    siteServices: [],
    paymentTerm: {},
    holidayRate: '',
    holidayRateType: HOLIDAY_RATE_TYPES.MULTIPLIER_RATE,
    holidayGroup: {},
    applyFlatRate: false,
    flatRate: '',
    sageItem: {},
    fuelSurchargeEnabled: false,
    fuelSurchargeType: 'percentage',
    fuelSurchargeValue: '',
    billableBreak: false,
    sitePayRate: { value: '' },
    contractPayRate: { value: '' },
  });

  const formConst = {
    CONTENT: 'content',
    START_DATE: 'startDate',
    END_DATE: 'endDate',
    DAYS: 'weekDays',
  };

  const countryCounfiguration = useSelector(
    (state) => state?.auth?.countryConfiguration || state?.auth?.defaultCountryConfiguration,
  );
  const isCountryAustralia = countryCounfiguration?.country?.shortCode === 'AU';

  //   const [errorMessages, setErrorMessages] = useState({});
  const classes = useStyles();

  const industryVerticalOptions = (t) => [
    { id: 1, label: t('obx.sites.createSite.industryTypes.manufacturing'), value: 'manufacturing' },
    { id: 2, label: t('obx.sites.createSite.industryTypes.industrial'), value: 'industrial' },
    { id: 3, label: t('obx.sites.createSite.industryTypes.distribution'), value: 'distribution' },
    { id: 4, label: t('obx.sites.createSite.industryTypes.residential'), value: 'residential' },
    { id: 5, label: t('obx.sites.createSite.industryTypes.commercial'), value: 'commercial' },
  ];

  // const billingFrequency = [
  //   { id: 1, label: 'Monthly', value: 'monthly' },
  //   { id: 2, label: 'Bi Weekly', value: 'bi_weekly' },
  //   { id: 3, label: 'Weekly', value: 'weekly' },
  //   // { id: 4, label: 'Event', value: 'event' },
  //   // { id: 5, label: 'Flat', value: 'flat' },
  // ];

  // const billingFrequencyType = [
  //   { id: 1, label: 'Pre Bill', value: 'pre_bill' },
  //   { id: 2, label: 'Post Bill', value: 'post_bill' },
  // ];

  const _siteType = [
    { id: 1, label: 'Dedicated', value: 'dedicated' },
    { id: 2, label: 'Patrol', value: 'patrol' },
  ];

  /**
   * handle date change
   */
  const handleDateChange = (name, value) => {
    const event = {
      target: {
        name: name,
        value: value,
      },
    };
    handleFieldChange(event);
  };

  /**
   * Fetch timezone options
   */
  // const fetchTimezoneOptions = async () => {
  // let dataSet = TIMEZONE_LIST.map((data) => {
  //   let array = data.name.split(',');
  //   let newName = `${array[0]}, ${array[array.length - 1]}`;
  //   return { ...data, name: newName, description: newName };
  // });
  // setTimezoneOptions(dataSet);
  // setFormData((prev) => ({
  //   ...prev,
  //   timezone: transformArrayForOptions(
  //     [TIMEZONE_LIST.find((item) => item.tzCode === DEFAULT_TIMEZONE)],
  //     'label',
  //     'tzCode',
  //   )?.[0],
  // }));
  // };

  const handleMultipleSelectedValues = async (event, field) => {
    /**
     * for input and text areas
     */
    if (event.target.value) {
      setErrorMessages((prev) => removeKey([field], prev));
      setFormData((prevState) => ({
        ...prevState,
        [field]: [...prevState[field], event.target.value],
      }));
    }
  };

  const fetchSageItems = async () => {
    try {
      const response = await getSageItemsDropdown();

      if (response && response?.statusCode === 200) {
        setSageitems(response?.data);
        setLoadingDropdown(false);
      }
    } catch (error) {
      setLoadingDropdown(false);
    }
  };

  const fetchHolidayGroups = async () => {
    try {
      setHolidayGroupsLoading(true);
      const response = await getHolidayGroups();

      if (response && response?.statusCode === 200) {
        setHolidayGroups(response?.data);
        setHolidayGroupsLoading(false);
      }
    } catch (error) {
      setHolidayGroupsLoading(false);
    }
  };

  useEffect(() => {
    getSitesList();
    fetchSageItems();
    fetchHolidayGroups();
  }, []);

  const getSitesList = async () => {
    try {
      let params =
        franchiseId && userRole === rolesEnumWithName.home_officer.slug
          ? { franchise_id: franchiseId }
          : {};
      let response = await getAllSites(params);
      // response = response?.data?.sites.map((data) => ({
      //   ...data,
      //   description: `${t('obx.sites.createSite.timeZone')} : ${data?.timeZone ? data?.timeZone : t('commonText.nA')}`,
      // }));
      setSites(response?.data?.sites);
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const handleChipDelete = async (e, index) => {
    e.stopPropagation();

    const data = [...formData['siteLocations']];

    const afterRemove = data.filter((_a, i) => i !== index);

    // if (!afterRemove.length) {
    //   const error = { siteLocations: 'Site Locations must contain at least 1 items' };
    //   setErrorMessages((prev) => ({ ...prev, ...error }));
    // }

    setFormData((prevState) => ({
      ...prevState,
      ['siteLocations']: afterRemove,
    }));
  };

  useEffect(() => {
    if (formData.siteId.value) {
      setFormData((prev) => ({
        ...prev,
        name: '',
        companyName: '',
        industryVertical: {},
        // siteType: {},
        siteLocations: [],
        address: '',
        addressLineTwo: '',
        countryCode: 'US',
        city: {},
        state: {},
        zipCode: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        paymentTerm: {},
      }));
    }
    setErrorMessages((prev) => removeKey(['name'], prev));
    setErrorMessages((prev) => removeKey(['companyName'], prev));
    setErrorMessages((prev) => removeKey(['industryVertical'], prev));
    // setErrorMessages((prev) => removeKey(['siteType'], prev));
    setErrorMessages((prev) => removeKey(['siteLocations'], prev));
    setErrorMessages((prev) => removeKey(['address'], prev));
    setErrorMessages((prev) => removeKey(['addressLineTwo'], prev));
    setErrorMessages((prev) => removeKey(['country'], prev));
    setErrorMessages((prev) => removeKey(['city'], prev));
    setErrorMessages((prev) => removeKey(['state'], prev));
    setErrorMessages((prev) => removeKey(['zipCode'], prev));
    setErrorMessages((prev) => removeKey(['firstName'], prev));
    setErrorMessages((prev) => removeKey(['lastName'], prev));
    setErrorMessages((prev) => removeKey(['phoneNumber'], prev));
    setErrorMessages((prev) => removeKey(['email'], prev));
    setErrorMessages((prev) => removeKey(['contractName'], prev));
    setErrorMessages((prev) => removeKey(['paymentTerm'], prev));
    // setErrorMessages((prev) => removeKey(['startDate'], prev));
  }, [formData.siteId]);

  /**
   * reset weekdays if date range changes
   */
  useEffect(() => {
    if (!isObjectEmpty(formData?.startDate)) {
      let payload = { ...formData };

      payload.siteServices = payload?.siteServices.map((item) => {
        if (item && item?.serviceType?.value === 'dedicated') {
          return {
            ...item,
            weekDays: [],
          };
        } else if (item && item?.serviceType?.value === 'patrol' && item?.visits?.length) {
          const updatedVisits = item?.visits?.map((visit) => ({ ...visit, visitDays: [] }));
          return {
            ...item,
            visits: updatedVisits,
          };
        }
      });
      setFormData(payload);
    }
  }, [formData?.endDate]);

  const mapDispatchBillings = (item) => {
    let billingDetails = {};
    const { instructions, billingType, billingRate, peakHours } = item?.dispatchBillingInfo || {};
    billingDetails = {
      billingType: billingType?.value || null,
      instructions: instructions ? convertDataToHtml(instructions) : '',
    };
    if (billingType?.id) {
      billingDetails = {
        ...billingDetails,
        billingType: billingType?.value || null,
      };
      if (billingType?.value !== 'Non-Billable') {
        billingDetails = {
          ...billingDetails,
          ...(!formData?.applyFlatRate
            ? { billingRate: parseInt(billingRate) || null, peakHours: parseInt(peakHours) || null }
            : {}),
        };
      }
    }
    return billingDetails;
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages({});
    setIsSubmittingForm(true);
    try {
      let selectedTimeZone = TIMEZONE_LIST?.find((item) => item.tzCode === timeZone)?.utc;
      let payload = {
        ...formData,
      };
      /**
       * if site is selected then get the timezone from the site
       */
      // if (formData.siteId?.id) {
      //   selectedTimeZone = TIMEZONE_LIST?.find(
      //     (item) => item.tzCode === formData?.siteId?.timeZone,
      //   )?.utc;
      // }

      // let timeZoneCode = timeZone;
      // formData.siteId?.id
      //   ? TIMEZONE_LIST?.find((item) => item.tzCode === formData?.siteId?.timeZone)

      //Check DLS
      // const checkDls = checkDLSWrtDate(payload.startDate);

      // returns the offset value i.e -300, -360.
      const standardOffsetWrtTimezone = getStandardOffsetWithVariableTimeZone(
        payload.startDate,
        timeZone,
      );

      // const offsetDiff = checkDls.isDLSWrtDate ? checkDls.offsetDiff : 0;
      selectedTimeZone = formatOffset((standardOffsetWrtTimezone + 0) / 60);

      let smallestStartTime = null;
      let largestStartTime = null;
      let smallestVisitStartTime = null;
      let largestVisitStartTime = null;
      if (payload?.siteServices) {
        payload.siteServices = payload?.siteServices?.map((item) => {
          /**
           * Smallest Start time calculation for the services
           */
          if (!smallestStartTime) {
            smallestStartTime =
              item?.serviceType?.value === serviceTypes.DISPATCH
                ? formData?.startDate
                : (item?.startTime ?? null);
          } else {
            smallestStartTime =
              item?.startTime && item?.startTime?.isBefore(smallestStartTime)
                ? item?.startTime
                : smallestStartTime;
          }

          /**
           * Largest Start time calculation for the services
           */
          if (!largestStartTime) {
            largestStartTime =
              item?.serviceType?.value === serviceTypes.DISPATCH
                ? formData?.startDate
                : (item?.startTime ?? null);
          } else {
            largestStartTime =
              item?.startTime && item?.startTime.isAfter(largestStartTime)
                ? item?.startTime
                : largestStartTime;
          }
          /**
           * Convert the time into the selected timezone manually
           */
          const setStartTimeAndDifference = item?.startTime
            ? convertDataFromForeignOffsetToUTC(item?.startTime, selectedTimeZone)
            : '';

          const setEndTimeAndDifference = item?.endTime
            ? convertDataFromForeignOffsetToUTC(item?.endTime, selectedTimeZone)
            : '';
          const setStartTime = item?.startTime
            ? setStartTimeAndDifference[0].format('HH:mm:ss')
            : '';

          /**
           * Converted date time with selected timezone wrt days difference from UTC
           */
          const formattedStartDateByDaysDifference =
            item?.startTime && payload?.startDate
              ? convertDateByDaysDifference(
                  setStartTimeAndDifference[0],
                  setStartTimeAndDifference[1],
                  payload?.startDate,
                )
              : '';

          /**
           * Calculate end date time with selected timezone
           */
          let calculatedEndDateTime = null;
          if (
            item?.startTime &&
            payload?.endDate &&
            item?.endTime &&
            setEndTimeAndDifference?.[0]
          ) {
            calculatedEndDateTime = convertDataFromForeignOffsetToUTC(
              dayjs(
                dayjs(payload.endDate)
                  .set('hour', item?.startTime.hour())
                  .set('minute', item?.startTime.minute())
                  .format('YYYY-MM-DDTHH:mm:ss[Z]'),
              ),
              selectedTimeZone,
            );
          }
          calculatedEndDateTime = calculatedEndDateTime
            ? `${
                calculatedEndDateTime?.[0]?.format('YYYY-MM-DDTHH:mm:ss[Z]')?.split('T')?.[0]
              }T${setEndTimeAndDifference?.[0].format('HH:mm:ss')}Z`
            : null;

          let itemVisits = [];
          let smallestStartTimeWithinVisits,
            largestStartTimeWithinVisits,
            // smallestEndTimeWithinVisits,
            largestEndTimeWithinVisits,
            minStartTimeVisit,
            // maxStartTimeVisit,
            maxEndTimeVisit,
            visitMinStartTimeWithStartDate,
            // visitMaxStartTimeWithStartDate,
            calculatedMaxEndDateTimeOfVisit = null;
          if (item?.serviceType?.value === 'patrol' && item?.visits?.length) {
            itemVisits = item.visits?.map((visit) => {
              /**
               * Hi, I am a newbie
               * I am re-using whatever the logic is written for site contract already
               * none of it is my original
               * */
              /**
               * Smallest Start time calculation for the visit
               */
              let minTimeCal = visit.startTime || visit.visitTime || null;

              if (!smallestVisitStartTime) {
                smallestVisitStartTime = minTimeCal;
              } else if (minTimeCal && minTimeCal.isBefore(smallestVisitStartTime)) {
                smallestVisitStartTime = minTimeCal;
              }

              if (!smallestStartTimeWithinVisits) {
                smallestStartTimeWithinVisits = minTimeCal;
              } else if (minTimeCal && minTimeCal.isBefore(smallestStartTimeWithinVisits)) {
                smallestStartTimeWithinVisits = minTimeCal;
              }

              /**
               * Largest Start time calculation for the visit
               */
              let maxTimeCal = visit.startTime || visit.visitTime || null;
              if (!largestVisitStartTime) {
                largestVisitStartTime = maxTimeCal;
              } else if (maxTimeCal && maxTimeCal.isAfter(largestVisitStartTime)) {
                largestVisitStartTime = maxTimeCal;
              }

              if (!largestStartTimeWithinVisits) {
                largestStartTimeWithinVisits = maxTimeCal;
              } else if (maxTimeCal && maxTimeCal.isAfter(largestStartTimeWithinVisits)) {
                largestStartTimeWithinVisits = maxTimeCal;
              }

              /**
               * Largest End time calculation for the visit
               */
              let maxEndTimeCal = visit.endTime || visit.visitTime || null;
              if (!largestEndTimeWithinVisits) {
                largestEndTimeWithinVisits = maxEndTimeCal;
              } else if (maxEndTimeCal && maxEndTimeCal.isAfter(largestEndTimeWithinVisits)) {
                largestEndTimeWithinVisits = maxEndTimeCal;
              }

              /**
               * Convert the time into the selected timezone manually
               */
              const setStartTimeAndDifferenceForVisit = visit?.startTime
                ? convertDataFromForeignOffsetToUTC(visit?.startTime, selectedTimeZone)
                : '';

              const setEndTimeAndDifferenceForVisit = visit?.endTime
                ? convertDataFromForeignOffsetToUTC(visit?.endTime, selectedTimeZone)
                : '';

              const setVisitTimeAndDifferenceForVisit = visit?.visitTime
                ? convertDataFromForeignOffsetToUTC(visit?.visitTime, selectedTimeZone)
                : '';

              const setVisitStartTime = visit?.startTime
                ? setStartTimeAndDifferenceForVisit[0].format('HH:mm:ss')
                : '';

              const setVisitTime = visit?.visitTime
                ? setVisitTimeAndDifferenceForVisit[0].format('HH:mm:ss')
                : '';

              minStartTimeVisit =
                convertDataFromForeignOffsetToUTC(
                  smallestStartTimeWithinVisits,
                  selectedTimeZone,
                )[0].format('HH:mm:ss') || '';

              // maxStartTimeVisit =
              //   convertDataFromForeignOffsetToUTC(largestStartTimeWithinVisits, selectedTimeZone) ||
              //   '';

              maxEndTimeVisit =
                convertDataFromForeignOffsetToUTC(
                  largestEndTimeWithinVisits,
                  selectedTimeZone,
                )[0].format('HH:mm:ss') || '';

              const setMinStartTimeAndDifferenceForVisit = smallestStartTimeWithinVisits
                ? convertDataFromForeignOffsetToUTC(smallestStartTimeWithinVisits, selectedTimeZone)
                : '';

              const _setMaxEndTimeAndDifferenceForVisit = largestEndTimeWithinVisits
                ? convertDataFromForeignOffsetToUTC(largestEndTimeWithinVisits, selectedTimeZone)
                : '';

              /**
               * Converted date time with selected timezone wrt days difference from UTC
               */
              const formattedVisitStartDateByDaysDifference =
                visit?.startTime && payload?.startDate
                  ? convertDateByDaysDifference(
                      setStartTimeAndDifferenceForVisit[0],
                      setStartTimeAndDifferenceForVisit[1],
                      payload?.startDate,
                    )
                  : '';

              const formattedVisitVisitDateByDaysDifference =
                visit?.visitTime && payload?.startDate
                  ? convertDateByDaysDifference(
                      setVisitTimeAndDifferenceForVisit[0],
                      setVisitTimeAndDifferenceForVisit[1],
                      payload?.startDate,
                    )
                  : '';

              visitMinStartTimeWithStartDate =
                smallestStartTimeWithinVisits && payload.startDate
                  ? convertDateByDaysDifference(
                      setMinStartTimeAndDifferenceForVisit[0],
                      setMinStartTimeAndDifferenceForVisit[1],
                      payload?.startDate,
                    )
                  : '';

              let calculatedEndDateTimeOfVisit = null;
              if (
                visit?.startTime &&
                payload?.endDate &&
                visit?.endTime &&
                setEndTimeAndDifferenceForVisit?.[0]
              ) {
                calculatedEndDateTimeOfVisit = convertDataFromForeignOffsetToUTC(
                  dayjs(
                    dayjs(payload.endDate)
                      .set('hour', visit?.startTime.hour())
                      .set('minute', visit?.startTime.minute())
                      .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                  ),
                  selectedTimeZone,
                );
              }
              calculatedEndDateTimeOfVisit = calculatedEndDateTimeOfVisit
                ? `${
                    calculatedEndDateTimeOfVisit?.[0]
                      ?.format('YYYY-MM-DDTHH:mm:ss[Z]')
                      ?.split('T')?.[0]
                  }T${setEndTimeAndDifferenceForVisit?.[0].format('HH:mm:ss')}Z`
                : null;

              if (payload?.endDate && largestStartTimeWithinVisits && largestEndTimeWithinVisits) {
                calculatedMaxEndDateTimeOfVisit = convertDataFromForeignOffsetToUTC(
                  dayjs(
                    dayjs(payload.endDate)
                      .set('hour', largestStartTimeWithinVisits?.hour())
                      .set('minute', largestStartTimeWithinVisits?.minute())
                      .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                  ),
                  selectedTimeZone,
                );
              }

              if (
                calculatedEndDateTimeOfVisit &&
                formattedVisitStartDateByDaysDifference &&
                dayjs(calculatedEndDateTimeOfVisit)?.isBefore(
                  dayjs(formattedVisitStartDateByDaysDifference),
                )
              ) {
                calculatedEndDateTimeOfVisit = dayjs(calculatedEndDateTimeOfVisit)
                  .add(1, 'day')
                  .toISOString();
              }

              calculatedMaxEndDateTimeOfVisit = calculatedMaxEndDateTimeOfVisit
                ? `${calculatedMaxEndDateTimeOfVisit?.[0]?.format('YYYY-MM-DDTHH:mm:ss[Z]')}`
                : null;

              if (visit.visitType !== 'fixed') {
                return {
                  /**
                   * Shift the days wrt the shift value (days difference) of UTC
                   */
                  days:
                    visit?.visitDays && setVisitStartTime
                      ? shiftWeekdaysWRTShiftValue(
                          visit?.visitDays,
                          setStartTimeAndDifferenceForVisit[1],
                        )
                      : [],
                  visitDays:
                    visit?.visitDays && setVisitStartTime
                      ? shiftWeekdaysWRTShiftValue(
                          visit?.visitDays,
                          setStartTimeAndDifferenceForVisit[1],
                        )
                      : [],
                  // days: visit?.visitDays,
                  // visitDays: visit?.visitDays,
                  startTime: setVisitStartTime,
                  endTime: visit?.endTime
                    ? convertDataFromForeignOffsetToUTC(visit?.endTime, selectedTimeZone)[0].format(
                        'HH:mm:ss',
                      )
                    : '',
                  startDateTime: visit?.startTime ? formattedVisitStartDateByDaysDifference : '',
                  endDateTime: visit?.endTime ? calculatedEndDateTimeOfVisit : '',
                  visitType: visit?.visitType,
                  visitsPerDay: parseInt(visit?.visitsPerDay) || 0,
                  perDayVisits: parseInt(visit?.visitsPerDay) || 0,
                };
              } else {
                return {
                  days:
                    visit?.visitDays && setVisitTime
                      ? shiftWeekdaysWRTShiftValue(
                          visit?.visitDays,
                          setVisitTimeAndDifferenceForVisit[1],
                        )
                      : [],
                  visitDays:
                    visit?.visitDays && setVisitTime
                      ? shiftWeekdaysWRTShiftValue(
                          visit?.visitDays,
                          setVisitTimeAndDifferenceForVisit[1],
                        )
                      : [],
                  visitType: visit?.visitType,
                  visitsPerDay: parseInt(visit?.visitsPerDay) || 0,
                  perDayVisits: parseInt(visit?.visitsPerDay) || 0,
                  visitTime: visit?.visitTime ? setVisitTime : '',
                  startTime: visit?.visitTime ? setVisitTime : '',
                  startDateTime: visit?.visitTime ? formattedVisitVisitDateByDaysDifference : '',
                };
              }
            });
          }
          const patrolVsDedicatedServiceTypePayload = (item) => {
            if (item?.serviceType?.value === 'dedicated') {
              return {
                officersRequired: item?.officersRequired,
                isDispatch: item?.isDispatch || false,
                ...(!formData?.applyFlatRate
                  ? { hourlyRate: parseFloat(item?.hourlyRate).toFixed(2) || 0 }
                  : {}),
                startTime: setStartTime,
                ...(item?.fuelSurchargeEnabled && {
                  fuelSurchargeEnabled: true,
                  fuelSurchargeType: item?.fuelSurchargeType || 'percentage',
                  fuelSurchargeValue: item?.fuelSurchargeValue,
                }),

                endTime: item?.endTime
                  ? convertDataFromForeignOffsetToUTC(item?.endTime, selectedTimeZone)[0].format(
                      'HH:mm:ss',
                    )
                  : '',
                /**
                 * Shift the weekdays wrt the shift value (days difference) of UTC
                 */
                weekDays:
                  item?.weekDays && setStartTime
                    ? shiftWeekdaysWRTShiftValue(item?.weekDays, setStartTimeAndDifference[1])
                    : [],
                visitorManagement: item?.visitorManagement || false,
                loadManagement: item?.loadManagement || false,
                designation: item?.designation?.value ? item?.designation?.value : null,
                startDateTime: formattedStartDateByDaysDifference,
                endDateTime: calculatedEndDateTime,
              };
            }
            if (item?.serviceType?.value === 'patrol') {
              return {
                /**
                 * Sending start time and end time in service as backend require
                 * */
                // officerType: item.officerType?.value ? item.officerType.value : '',

                ...(!formData?.applyFlatRate ? { pricePerVisit: item.pricePerVisit || 0 } : {}),
                startTime: minStartTimeVisit,
                isDispatch: item?.isDispatch || false,
                ...(item?.fuelSurchargeEnabled && {
                  fuelSurchargeEnabled: true,
                  fuelSurchargeType: item?.fuelSurchargeType || 'percentage',
                  fuelSurchargeValue: item?.fuelSurchargeValue,
                }),
                endTime: maxEndTimeVisit,
                startDateTime: visitMinStartTimeWithStartDate,
                endDateTime: calculatedMaxEndDateTimeOfVisit,
                visits: itemVisits,
              };
            }
            // if (item?.serviceType?.value === 'dispatch') {
            //   const { instructions, billingRate, peakHours } = item?.dispatchBillingInfo || {};
            //   console.log({ item });
            //   return {
            //     billingType: item?.serviceType?.value || null,
            //     instructions: instructions ? convertDataToHtml(instructions) : '',
            //     /**
            //      * Sending start time and end time in service as backend require
            //      * */
            //     // officerType: item.officerType?.value ? item.officerType.value : '',
            //     billingRate: billingRate ? parseInt(billingRate) : null,
            //     peakHours: peakHours ? parseInt(peakHours) : null,
            //     sageItem: {},
            //   };
            // }
          };

          let response =
            item?.serviceType?.value === serviceTypes.DISPATCH
              ? {
                  ...patrolVsDedicatedServiceTypePayload(item),
                  serviceType: item?.serviceType?.value ? item?.serviceType?.value : '',
                  ...(item?.fuelSurchargeEnabled && {
                    fuelSurchargeEnabled: true,
                    fuelSurchargeType: item?.fuelSurchargeType,
                    fuelSurchargeValue: item?.fuelSurchargeValue,
                  }),
                }
              : {
                  ...(!formData?.applyFlatRate ? { sageItem: item?.sageItem || null } : {}),
                  // sageItem: item?.sageItem || {},
                  serviceName: item?.serviceName || '',
                  serviceType: item?.serviceType?.value ? item?.serviceType?.value : '',
                  ...patrolVsDedicatedServiceTypePayload(item),
                  ...(item?.fuelSurchargeEnabled && {
                    fuelSurchargeEnabled: true,
                    fuelSurchargeType: item?.fuelSurchargeType || 'percentage',
                    fuelSurchargeValue: item?.fuelSurchargeValue,
                  }),
                };
          // if (item?.serviceType?.value === serviceTypes.DISPATCH) {
          //   delete response.sageItem;
          //   delete response.serviceName;
          // }
          let billingDetails = {};
          // if dispatch set properties
          if (item?.isDispatch || item?.serviceType?.value === serviceTypes.DISPATCH) {
            billingDetails = mapDispatchBillings(item);
          }
          return {
            ...response,
            dispatchBillingInfo: billingDetails,
            nonBillable: item?.nonBillable || false,
          };
        });
      }

      payload.billingFrequency = payload.billingFrequency?.value
        ? payload.billingFrequency?.value
        : '';

      payload.billingType = formData.billingType?.value ? formData.billingType?.value : '';

      payload.billingFrequencyType = formData.billingType?.value ? formData.billingType?.value : '';

      // payload.siteType = payload?.siteType?.value ? payload?.siteType?.value : '';

      payload.industryVertical = payload?.industryVertical?.value
        ? payload?.industryVertical?.value
        : '';
      // payload.timezone = payload?.timezone?.value ? payload?.timezone?.value : '';
      payload.state = payload?.states?.value ? payload?.states?.value : '';
      payload.city = payload.cities?.value ? payload?.cities?.value : '';

      payload.paymentTerm = payload?.paymentTerm?.value ? payload?.paymentTerm?.value : '';

      payload.contractTenureType = payload?.contractTenureType?.value
        ? payload.contractTenureType.value
        : '';

      payload.holidayGroup = payload?.holidayGroup?.value ? payload?.holidayGroup?.value : '';
      /**
       * set StartDate with the smallest start time
       */
      // console.log({ smallestStartTime }, { smallestVisitStartTime });
      let tempStartDate = null;
      const overallSmallestStartTime =
        smallestStartTime && smallestVisitStartTime
          ? smallestStartTime < smallestVisitStartTime
            ? smallestStartTime
            : smallestVisitStartTime
          : smallestStartTime && !smallestVisitStartTime
            ? smallestStartTime
            : smallestVisitStartTime;

      /**
       * This code only use the smallest start time from dedicated service
       * Commented this code as we are going to use the overall minimum start time from dedicated or patrol shift
       * */
      // if (payload?.startDate && smallestStartTime && selectedTimeZone) {
      //   tempStartDate = convertDataFromForeignOffsetToUTC(
      //     dayjs(
      //       dayjs(payload.startDate)
      //         .set('hour', smallestStartTime.hour())
      //         .set('minute', smallestStartTime.minute())
      //         .format('YYYY-MM-DDTHH:mm:ss[Z]'),
      //     ),
      //     selectedTimeZone,
      //   );
      // }
      //
      /**
       * This code only use the smallest start time from patrol service
       * Commented this code as we are going to use the overall minimum start time from dedicated or patrol service
       * */
      // if (payload?.startDate && !smallestStartTime && selectedTimeZone) {
      //   tempStartDate = convertDataFromForeignOffsetToUTC(
      //     dayjs(
      //       dayjs(payload.startDate)
      //         .set('hour', smallestVisitStartTime.hour() || 0)
      //         .set('minute', smallestVisitStartTime.minute() || 0)
      //         .format('YYYY-MM-DDTHH:mm:ss[Z]'),
      //     ),
      //     selectedTimeZone,
      //   );
      // }

      /**
       * This code appends overall smallest startTime with date
       * */
      // console.log(overallSmallestStartTime);
      if (payload?.startDate && overallSmallestStartTime && selectedTimeZone) {
        tempStartDate = convertDataFromForeignOffsetToUTC(
          dayjs(
            dayjs(payload.startDate)
              .set('hour', overallSmallestStartTime.hour())
              .set('minute', overallSmallestStartTime.minute())
              .format('YYYY-MM-DDTHH:mm:ss[Z]'),
          ),
          selectedTimeZone,
        );
      }
      payload.startDate = tempStartDate
        ? tempStartDate?.[0]?.format('YYYY-MM-DDTHH:mm:ss[Z]')
        : dayjsWithStandardOffset(payload.startDate).format('YYYY-MM-DDTHH:mm:ss[Z]');

      /**
       * set endDate with the largest start time
       */

      let tempEndDate = null;
      const overallLargestStartTime =
        largestStartTime && largestVisitStartTime
          ? largestStartTime < largestVisitStartTime
            ? largestStartTime
            : largestVisitStartTime
          : largestStartTime && !largestVisitStartTime
            ? largestStartTime
            : largestVisitStartTime;

      /**
       * This code only use the largest start time from dedicated service
       * Commented this code as we are going to use the overall maximum start time from dedicated or patrol service
       * */
      // if (payload?.endDate && largestStartTime && selectedTimeZone) {
      //   tempEndDate = convertDataFromForeignOffsetToUTC(
      //     dayjs(
      //       dayjs(payload.endDate)
      //         .set('hour', largestStartTime.hour())
      //         .set('minute', largestStartTime.minute())
      //         .format('YYYY-MM-DDTHH:mm:ss[Z]'),
      //     ),
      //     selectedTimeZone,
      //   );
      // }
      /**
       * This code only use the largest start time from patrol service
       * Commented this code as we are going to use the overall largest start time from dedicated or patrol service
       * */
      // if (payload?.endDate && !largestStartTime && selectedTimeZone) {
      //   tempEndDate = convertDataFromForeignOffsetToUTC(
      //     dayjs(
      //       dayjs(payload.endDate)
      //         .set('hour', largestVisitStartTime.hour() || 0)
      //         .set('minute', largestVisitStartTime.minute() || 0)
      //         .format('YYYY-MM-DDTHH:mm:ss[Z]'),
      //     ),
      //     selectedTimeZone,
      //   );
      // }

      /**
       * This code appends overall largest startTime with date
       * */
      if (payload?.endDate && overallLargestStartTime && selectedTimeZone) {
        tempEndDate = convertDataFromForeignOffsetToUTC(
          dayjs(
            dayjs(payload.endDate)
              .set('hour', overallLargestStartTime.hour())
              .set('minute', overallLargestStartTime.minute())
              .format('YYYY-MM-DDTHH:mm:ss[Z]'),
          ),
          selectedTimeZone,
        );
      }

      payload.endDate = tempEndDate
        ? tempEndDate?.[0]?.format('YYYY-MM-DDTHH:mm:ss[Z]')
        : dayjsWithStandardOffset(payload.endDate).format('YYYY-MM-DDTHH:mm:ss[Z]');

      payload.cycleRefDate = payload.cycleRefDate
        ? dayjs(payload.cycleRefDate).format('DD/MM/YYYY')
        : null;

      if (formData?.holidayRate) {
        payload[HOLIDAY_RATE_FIELDS.HOLIDAY_RATE] = formData.holidayRate;
      }

      // Clean up if neither holidayRate nor holidayGroup is provided
      if (!formData?.holidayRate && !formData.holidayGroup?.value) {
        delete payload[HOLIDAY_RATE_FIELDS.HOLIDAY_RATE];
        delete payload.holidayGroup;
      }

      if (formData?.applyFlatRate) {
        payload.flatRate = formData.flatRate;
        payload.sageItem = !isObjectEmpty(formData?.sageItem) ? formData.sageItem : null;
        if (formData?.fuelSurchargeEnabled) {
          payload.fuelSurchargeEnabled = formData.fuelSurchargeEnabled || false;
          payload.fuelSurchargeType = formData.fuelSurchargeType || 'percentage';
          payload.fuelSurchargeValue = formData.fuelSurchargeValue;
        } else {
          delete payload.fuelSurchargeEnabled;
          delete payload.fuelSurchargeType;
          delete payload.fuelSurchargeValue;
        }
      } else {
        delete payload.flatRate;
        delete payload.applyFlatRate;
        delete payload.fuelSurchargeEnabled;
        delete payload.fuelSurchargeType;
        delete payload.fuelSurchargeValue;
      }

      // payload.billingStartDate = payload.billingStartDate
      //   ? dayjs(payload.billingStartDate).format('DD/MM/YYYY')
      //   : null;

      // payload.revenue = parseInt(payload.revenue);
      if (formData.siteId?.id) {
        payload.siteId = payload.siteId?.id ? payload.siteId?.id : '';
        delete payload.address;
        delete payload.industryVertical;
        delete payload.name;
        delete payload.siteLocations;
        delete payload.zipCode;
        delete payload.phoneNumber;
        delete payload.firstName;
        delete payload.lastName;
        delete payload.city;
        delete payload.state;
        delete payload.email;
        delete payload.companyName;
        // delete payload.siteType;
        delete payload.addressLineTwo;
        delete payload.country;
        delete payload.countryCode;
        delete payload.sitePayRate;
      } else {
        delete payload.siteId;
      }
      if (!formData?.contractPayRate?.value) delete payload.contractPayRate;
      else payload.contractPayRate = parseFloat(formData?.contractPayRate?.value);

      if (!formData?.sitePayRate?.value) delete payload.sitePayRate;
      else payload.sitePayRate = parseFloat(formData?.sitePayRate?.value);

      // delete payload.revenue;
      // delete payload.cycleRefDate;
      delete payload.attachments;
      payload.origin = 'obx';

      const errors = await formValidatorJoi({ ...payload }, t);
      console.log('form validator errors', errors, payload);
      if (errors && Object.keys(errors).length) {
        setErrorMessages((prev) => ({ ...prev, ...errors }));
        setIsSubmittingForm(false);
        return;
      }
      /**
       * Need to remove this
       * As BE has officer required validation so added it as 0 in case of service type "patrol"
       * */
      let payloadServices = payload?.siteServices?.map((service) => {
        if (service?.serviceType === 'patrol') {
          return {
            ...service,
            officersRequired: 0,
          };
        }
        return service;
      });

      payload = {
        ...payload,
        siteServices: payloadServices,
      };

      if (payload.holidayGroup) {
        payload.holidayGroupId = payload.holidayGroup;
        delete payload.holidayGroup;
      }

      payload.services = payload.siteServices;
      delete payload.cities;
      delete payload.states;

      delete payload.siteServices;
      if (payload[HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER]) {
        const multiplierValue = parseFloat(payload[HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER]);
        if (!isNaN(multiplierValue) && multiplierValue > 0) {
          payload[HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER] = multiplierValue;
        } else {
          delete payload[HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER];
        }
      }

      // payload.revenue = formData.revenue;
      payload.cycleRefDate = formData.cycleRefDate
        ? dayjs(formData.cycleRefDate).format('DD/MM/YYYY')
        : null;
      payload.attachments = formData.attachments;

      /**
       * if site is selected then dont send timezone
       */
      if (!payload.siteId) {
        payload.timeZone = timeZone;
      }
      // delete payload.timezone;

      if (franchiseId && userRole === rolesEnumWithName.home_officer.slug) {
        payload.franchise_id = parseInt(franchiseId);
      }

      if (payload.flatRate && payload.applyFlatRate) {
        payload.fixedAmount = payload.flatRate;
        payload.contractType = CONTRACT_TYPES.FLAT_BILL;
      }

      delete payload.flatRate;

      if (payload?.billableBreak === 'true') {
        payload.billingType = true;
      } else {
        payload.billingType = false;
      }

      if (formData?.holidayRate) {
        payload[HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER] = formData.holidayRate;
        delete payload[HOLIDAY_RATE_FIELDS.HOLIDAY_RATE];
      }

      let apiResponse = formData?.siteId?.id
        ? await createContract(payload)
        : await createSite(payload);
      if (apiResponse.statusCode === 200) {
        toaster.success({
          text: apiResponse?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setIsSubmittingForm(false);
        setTimeout(() => {
          userRole === rolesEnumWithName.home_officer.slug
            ? history.push(HO_FRANCHISE_LISTING)
            : history.push(OBX_SITES);
        }, 1000);
      }
    } catch (error) {
      toaster.error({
        text: error.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });

      /**
       * show error
       */
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // const timezoneOptionsMemoized = useMemo(() => {
  //   return transformArrayForOptions(timezoneOptions, 'label', 'tzCode', 'description');
  // }, [timezoneOptions]);

  const { CityHookComponent, StateHookComponent, CountrySelectHookComponent } =
    useCountryCityStateHook({
      formData,
      setFormData,
      errorMessages: {},
      setErrorMessages: () => {},
      multiStates: false,
      multiCities: false,
      stateProps: {
        searchable: true,
        withTiles: false,
        checkmark: false,

        placeHolder: t('sales.users.selectStates'),
        bordered: true,
        className: classes.dropdownWraps,
        placeHolderClassName: classes.placeHolderColors,
      },
      cityProps: {
        searchable: true,
        withTiles: false,
        checkmark: false,

        placeHolder: t('sales.users.selectCities'),
        bordered: true,
        className: classes.dropdownWraps,
        placeHolderClassName: classes.placeHolderColors,
      },
    });

  const updateFormHandler = useCallback(
    (name, value) => {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleFieldChange = (event) => {
    let { name, value } = event.target;

    const fieldNameMap = {
      [`${HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER}Type`]: HOLIDAY_RATE_FIELDS.HOLIDAY_RATE_TYPE,
    };
    name = fieldNameMap[name] || name;
    if (name === 'flatRate' && !String(value).match(regexValues.price)) {
      return;
    }
    const fieldTransformers = {
      [HOLIDAY_RATE_FIELDS.HOLIDAY_MULTIPLIER]: () =>
        formatNumber(value, 2, 2, formData?.holidayRate),
      applyFlatRate: () => event.target.checked,
    };

    const transformer = fieldTransformers[name];
    if (transformer) {
      value = transformer();
    }
    if (value) {
      setErrorMessages((prev) => removeKey([name], prev));
    }

    if (name === 'applyFlatRate') {
      setFormData((prev) => {
        const updated = { ...prev, applyFlatRate: value };
        if (!value) {
          updated.fuelSurchargeEnabled = false;
          updated.fuelSurchargeValue = '';
          updated.fuelSurchargeType = 'percentage';
        } else {
          const clearedServices = (prev.siteServices || []).map((s) => ({
            ...s,
            fuelSurchargeEnabled: false,
            fuelSurchargeValue: '',
            fuelSurchargeType: 'percentage',
          }));
          updated.siteServices = clearedServices;
        }
        return updated;
      });
      return;
    }

    updateFormHandler(name, value);
  };

  const sitesList = useMemo(() => {
    return transformArrayForOptions(sites, 'name', 'id') || [];
  }, [sites]);

  const clearFlatRateFuelSurchargeErrors = () => {
    setErrorMessages((prev) => {
      const { fuelSurchargeValue: _a, fuelSurchargeType: _b, ...rest } = prev;
      return rest;
    });
  };

  const handleFlatRateFuelSurchargeCheckChange = (isChecked) => {
    setFormData((prev) => ({
      ...prev,
      fuelSurchargeEnabled: isChecked,
      ...(!isChecked && {
        fuelSurchargeValue: '',
        fuelSurchargeType: 'percentage',
      }),
    }));
    clearFlatRateFuelSurchargeErrors();
  };

  const handleFlatRateFuelSurchargeValueChange = (e) => {
    handleFieldChange(e);

    setErrorMessages((prev) => {
      const { fuelSurchargeValue: _, ...rest } = prev;
      return rest;
    });
  };

  const handleFlatRateFuelSurchargeTypeChange = (e) => {
    handleFieldChange({
      target: { name: 'fuelSurchargeType', value: e.target.value },
    });
    clearFlatRateFuelSurchargeErrors();
  };

  const getFlatRateFuelSurchargeError = () => {
    return errorMessages?.fuelSurchargeValue || errorMessages?.fuelSurchargeType || '';
  };
  console.log('mybe errors', formData);
  return (
    <>
      {isSubmittingForm && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}

      <Box className={classes.siteWrapper}>
        <Box className={classes.upperWrap}>
          <Typography variant="h3"> {t('obx.sites.createSite.createASite')}</Typography>
          <Box className={classes.siteDetais}>
            <Box className={classes.siteDetaisWrapper}>
              <Typography variant="subtitle1">{t('obx.sites.createSite.siteDetails')}</Typography>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="sites">
                    {t('obx.schedules.selectExisting')} <RequiredAsterik />
                  </InputLabel>

                  <CustomDropDown
                    label={t('obx.schedules.chooseSite')}
                    name="siteId"
                    searchable={true}
                    options={sitesList}
                    selectedValues={formData.siteId}
                    placeHolderClassName={classes.placeHolderColor}
                    handleChange={handleFieldChange}
                    bordered
                    className={classes.dropdownWrap}
                  />
                  <Typography
                    variant="subtitle2"
                    className={classes.timezoneText}
                    component={'span'}
                  >
                    {t('obx.sites.createSite.timeZone')} : {timeZone || t('commonText.nA')}
                  </Typography>
                </Box>

                {isObjectEmpty(formData.siteId) && (
                  <>
                    {/* <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="contractName">
                        {t('obx.sites.createSite.timeZone')} <RequiredAsterik />
                      </InputLabel>
                      <CustomDropDown
                        name={FormKeys.TIMEZONE}
                        id={FormKeys.TIMEZONE}
                        placeHolder={t('sales.contract.timeZone')}
                        options={timezoneOptionsMemoized}
                        selectedValues={formData?.timezone || {}}
                        handleChange={handleFieldChange}
                        className={classes.dropdownWrap}
                        bordered
                        searchable
                        isError={!!errorMessages?.[FormKeys.TIMEZONE]}
                        helperText={
                          !!errorMessages?.[FormKeys.TIMEZONE]
                            ? errorMessages?.[FormKeys.TIMEZONE]
                            : null
                        }
                      />
                    </Box> */}
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="siteName">
                        {t('obx.sites.createSite.siteName')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <TextField
                        name="name"
                        id="name"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.siteName')}`}
                        type="text"
                        onChange={handleFieldChange}
                        error={!!errorMessages?.name}
                        helperText={!!errorMessages?.name ? errorMessages?.name : null}
                        className={classes?.textFiledFilter}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="companyName">
                        {t('obx.sites.createSite.companyName')} <RequiredAsterik />
                      </InputLabel>
                      <TextField
                        name="companyName"
                        id="companyName"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.companyName')}`}
                        type="text"
                        error={!!errorMessages?.companyName}
                        helperText={
                          !!errorMessages?.companyName ? errorMessages?.companyName : null
                        }
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="industryVertical">
                        {t('obx.sites.createSite.industryVertical')} <RequiredAsterik />
                      </InputLabel>
                      <CustomDropDown
                        label={t('obx.sites.createSite.industryVertical')}
                        name="industryVertical"
                        id="industryVertical"
                        placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.industryVertical')}`}
                        placeHolderClassName={classes.placeHolderColor}
                        className={classes.dropdownWrap}
                        options={transformArrayForOptions(
                          industryVerticalOptions(t),
                          'label',
                          'value',
                        )}
                        selectedValues={formData.industryVertical}
                        handleChange={handleFieldChange}
                        bordered
                      />
                      {!!errorMessages?.industryVertical && (
                        <Box className={classes.invalidFeedback}>
                          {errorMessages?.industryVertical}
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Box>
              <Box className={classes.siteDetaisFields}>
                {isObjectEmpty(formData.siteId) && (
                  <>
                    {/*<Box className={classes.fieldWrapper}>*/}
                    {/*  <InputLabel htmlFor="siteType">*/}
                    {/*    {t('obx.sites.createSite.siteType')} <RequiredAsterik />{' '}*/}
                    {/*  </InputLabel>*/}
                    {/*  <CustomDropDown*/}
                    {/*    label={t('obx.sites.createSite.siteType')}*/}
                    {/*    name="siteType"*/}
                    {/*    id="siteType"*/}
                    {/*    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.siteType')}`}*/}
                    {/*    placeHolderClassName={classes.placeHolderColor}*/}
                    {/*    className={classes.dropdownWrap}*/}
                    {/*    options={transformArrayForOptions(siteType, 'label', 'value')}*/}
                    {/*    selectedValues={formData.siteType}*/}
                    {/*    handleChange={handleFieldChange}*/}
                    {/*    bordered*/}
                    {/*  />*/}
                    {/*  {!!errorMessages?.siteType && (*/}
                    {/*    <Box className={classes.invalidFeedback}>{errorMessages?.siteType}</Box>*/}
                    {/*  )}*/}
                    {/*</Box>*/}
                  </>
                )}
              </Box>
            </Box>
            {isObjectEmpty(formData.siteId) && (
              <>
                <Box className={classes.siteDetaisWrapper}>
                  <Box className={classes.fieldWrapper}>
                    <InputLabel htmlFor="siteLocation">
                      {t('obx.sites.createSite.siteLocation')}
                    </InputLabel>
                    <Autocomplete
                      multiple
                      disableClearable={true}
                      id={'siteLocation'}
                      options={[]}
                      value={formData.siteLocations}
                      className={classes.autoCompleteField}
                      freeSolo
                      onChange={(event) => handleMultipleSelectedValues(event, 'siteLocations')}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              variant="peimary"
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
                          id={'siteLocations'}
                          name={'siteLocations'}
                          variant="filled"
                          label=""
                          placeholder={t('obx.sites.createSite.typeToAddLocation')}
                          type="text"
                          className={classes.autoCompleteTextField}
                        />
                      )}
                    />
                  </Box>
                </Box>
                <Box className={classes.siteDetaisWrapper}>
                  <Typography sx={{ marginTop: '20px' }} variant="subtitle1">
                    {t('obx.sites.createSite.address')}
                  </Typography>
                  <Box className={classes.siteDetaisFields}>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="address">
                        {t('obx.sites.createSite.addressLine1')}
                        <RequiredAsterik />
                      </InputLabel>
                      <TextField
                        name="address"
                        id="address"
                        fullWidth
                        placeholder={t('obx.sites.createSite.addAddress1')}
                        type="text"
                        error={!!errorMessages?.address}
                        helperText={!!errorMessages?.address ? errorMessages?.address : null}
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="addressLineTwo">
                        {t('obx.sites.createSite.addressLine2')}
                      </InputLabel>
                      <TextField
                        name="addressLineTwo"
                        id="addressLineTwo"
                        fullWidth
                        placeholder={t('obx.sites.createSite.addAddress2')}
                        type="text"
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box className={classes.siteDetaisWrapper}>
                  <Box className={classes.siteDetaisFields}>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="country">
                        {t('obx.sites.createSite.country')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <CountrySelectHookComponent searchable={true} />
                    </Box>

                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="state">
                        {t('obx.sites.createSite.state')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <StateHookComponent bordered={true} />
                      {!!errorMessages?.state && (
                        <Box className={classes.invalidFeedback}>{errorMessages?.state}</Box>
                      )}
                    </Box>

                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="city">
                        {t(`obx.sites.createSite.${isCountryAustralia ? 'suburb' : 'city'}`)}{' '}
                        <RequiredAsterik />{' '}
                      </InputLabel>
                      <CityHookComponent bordered={true} />
                      {!!errorMessages?.city && (
                        <Box className={classes.invalidFeedback}>{errorMessages?.city}</Box>
                      )}
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="zipCode">
                        {t('obx.sites.createSite.zipCode')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <TextField
                        name="zipCode"
                        id="zipCode"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.zipCode')}`}
                        type="text"
                        error={!!errorMessages?.zipCode}
                        helperText={!!errorMessages?.zipCode ? errorMessages?.zipCode : null}
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box className={classes.siteDetaisWrapper}>
                  <Typography variant="subtitle1">
                    {t('obx.sites.createSite.clientDetails')}
                  </Typography>
                  <Box className={classNames(classes.siteDetaisFields, classes.noMarginBottom)}>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="name">
                        {t('obx.sites.createSite.firstName')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <TextField
                        name="firstName"
                        id="firstName"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.name')}`}
                        type="text"
                        error={!!errorMessages?.firstName}
                        helperText={!!errorMessages?.firstName ? errorMessages?.firstName : null}
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>

                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="name">
                        {t('obx.sites.createSite.lastName')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <TextField
                        name="lastName"
                        id="lastName"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.name')}`}
                        error={!!errorMessages?.lastName}
                        helperText={!!errorMessages?.lastName ? errorMessages?.lastName : null}
                        type="text"
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="phone">
                        {t('obx.sites.createSite.phone')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <PhoneNumberWithCountry
                        value={formData.phoneNumber || ''}
                        onChange={(value) =>
                          handleFieldChange({ target: { name: 'phoneNumber', value } })
                        }
                        name={'phoneNumber'}
                        isError={!!errorMessages?.phoneNumber}
                        international={true}
                        error={!!errorMessages?.phoneNumber ? errorMessages?.phoneNumber : null}
                        className={classes.countryPhnNumber}
                      />
                    </Box>
                    <Box className={classes.fieldWrapper}>
                      <InputLabel htmlFor="email">
                        {t('obx.sites.createSite.email')} <RequiredAsterik />{' '}
                      </InputLabel>
                      <TextField
                        name="email"
                        id="email"
                        fullWidth
                        placeholder={`${t('obx.sites.createSite.add')} ${t('obx.sites.createSite.email')}`}
                        error={!!errorMessages?.email}
                        helperText={!!errorMessages?.email ? errorMessages?.email : null}
                        type="text"
                        className={classes?.textFiledFilter}
                        onChange={handleFieldChange}
                      />
                    </Box>

                    <Box className={classes.fieldWrapper}></Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          <Typography variant="h3">
            {' '}
            {t('obx.sites.createSite.createAContract')} <RequiredAsterik />{' '}
          </Typography>
          <Box className={classes.siteDetais}>
            <Box className={classes.siteDetaisWrapper}>
              {/* <Box className={classes.inlineBtnsCols}>
                <Typography variant="subtitle1">
                  {t('obx.sites.createSite.contractDetails')}
                </Typography>
                <Box className={classes.inlinbtns}></Box>
              </Box> */}
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="contractName">
                    {t('obx.sites.createSite.contractName')} <RequiredAsterik />
                  </InputLabel>
                  <TextField
                    name="contractName"
                    id="contractName"
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.addContractName')}`}
                    error={!!errorMessages?.contractName}
                    helperText={!!errorMessages?.contractName ? errorMessages?.contractName : null}
                    type="text"
                    onChange={handleFieldChange}
                    className={classes?.textFiledFilter}
                  />
                </Box>

                <Box className={classes.fieldWrapper}>
                  <InputLabel>
                    {t('obx.sites.createSite.contractStartDate')} <RequiredAsterik />{' '}
                  </InputLabel>
                  <ResponsiveDatePickers
                    name="startDate"
                    format="MM/DD/YYYY"
                    value={dayjs(formData?.startDate)}
                    onChange={(value) => {
                      handleDateChange(formConst?.START_DATE, value);
                      handleDateChange(formConst?.END_DATE, null);
                    }}
                    placeholder={`${t('obx.form.input.textField.startDate.placeholder')}`}
                    error={!!errorMessages?.startDate}
                    helperText={!!errorMessages?.startDate ? errorMessages?.startDate : null}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel>
                    {t('obx.sites.createSite.contractEndDate')} <RequiredAsterik />{' '}
                  </InputLabel>
                  <ResponsiveDatePickers
                    name="endDate"
                    format="MM/DD/YYYY"
                    value={dayjs(formData?.endDate)}
                    onChange={(value) => {
                      handleDateChange(formConst?.END_DATE, dayjs(value));
                    }}
                    placeholder={`${t('obx.form.input.textField.endDate.placeholder')}`}
                    minDate={formData?.startDate ? dayjs(formData?.startDate) : dayjs()}
                    error={!!errorMessages?.endDate}
                    helperText={!!errorMessages?.endDate ? errorMessages?.endDate : null}
                    maxDate={formData?.startDate ? dayjs().add(3, 'year') : dayjs().add(3, 'year')}
                  />
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="attachmentLink">
                    {t('obx.sites.createSite.attachmentLink')}
                  </InputLabel>
                  <TextField
                    name="attachments"
                    id="attachments"
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.attachmentLinkPlaceholder')}`}
                    type="text"
                    className={classes?.textFiledFilter}
                    onChange={handleFieldChange}
                    error={!!errorMessages?.attachments}
                    helperText={!!errorMessages?.attachments ? errorMessages?.attachments : null}
                  />
                </Box>
              </Box>
              <Box className={classes.siteDetaisFields}>
                <Box className={classNames(classes.fieldWrapper, classes.onecols)}>
                  <InputLabel htmlFor="contractTenureType">
                    {t('obx.contracts.contractTenureType')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.contracts.contractTenureType')}
                    name="contractTenureType"
                    id="contractTenureType"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.contracts.contractTenureType')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(contractTenureTypes(t), 'label', 'value')}
                    selectedValues={formData.contractTenureType}
                    handleChange={handleFieldChange}
                    bordered
                  />
                  {!!errorMessages?.contractTenureType && (
                    <Box className={classes.invalidFeedback}>
                      {errorMessages?.contractTenureType}
                    </Box>
                  )}
                </Box>
              </Box>
              <Box className={classes.applyFlatrate}>
                <Typography variant="subtitle1">
                  {t('obx.sites.createSite.contractDetails')}
                </Typography>
                <Box className={classes.applyFlatGray}>
                  <Box className={classes.applyFlatCheck}>
                    <Typography variant="subtitle1">
                      {t('obx.sites.createSite.applyFlatRate')}
                    </Typography>
                    <Switch
                      name="applyFlatRate"
                      inputProps={{ 'aria-label': 'visitor management' }}
                      value={formData.applyFlatRate}
                      onChange={(e) => handleFieldChange(e)}
                    />
                  </Box>
                  <Typography variant="body3">
                    {formData?.applyFlatRate
                      ? t('obx.sites.createSite.toggleApply')
                      : t('obx.sites.createSite.toggleNotApply')}
                  </Typography>
                  {formData?.applyFlatRate && (
                    <>
                      <Box className={classes.siteDetaisFields}>
                        <Box className={classes.fieldWrapper}>
                          <TextField
                            name="flatRate"
                            id="flatRate"
                            fullWidth
                            type="text"
                            className={classes?.textFiledFilter}
                            value={formData.flatRate}
                            onChange={handleFieldChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  {franchiseCurrency}
                                </InputAdornment>
                              ),
                            }}
                          />
                          {!!errorMessages?.flatRate && (
                            <Box className={classes.invalidFeedback}>{errorMessages?.flatRate}</Box>
                          )}
                        </Box>
                        <Box className={classes.fieldWrapper}>
                          {loadingDropdown ? (
                            <Skeleton className={classes.skeletonDropdown} />
                          ) : (
                            <>
                              <CustomDropDown
                                name="sageItem"
                                placeHolder={t('obx.sites.createSite.selectInvoiceLineItem')}
                                bordered
                                searchable
                                options={sageItems}
                                placeHolderClassName={classes.placeHolderColor}
                                className={classes.applyFlatDropdownWrap}
                                selectedValues={formData?.sageItem || {}}
                                handleChange={handleFieldChange}
                              />
                              {!!errorMessages?.sageItem && (
                                <Box className={classes.invalidFeedback}>
                                  {errorMessages?.sageItem}
                                </Box>
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                      {/* flatRate? */}
                      <Box className={classes.flatRateFuelSurchargeOuter}>
                        <FuelSurchargeInputDropdown
                          name="fuelSurchargeValue"
                          id="fuelSurchargeValue"
                          layout={FUEL_SURCHARGE_LAYOUT_FLAT_RATE}
                          label={t(
                            'obx.sites.createSite.includeFuelSurcharge',
                            'Include Fuel Surcharge',
                          )}
                          checked={!!formData?.fuelSurchargeEnabled}
                          onCheckChange={handleFlatRateFuelSurchargeCheckChange}
                          placeholder={t('obx.sites.createSite.enterFuelSurcharge', 'E.g; 20')}
                          value={formData?.fuelSurchargeValue || ''}
                          dropdownValue={formData?.fuelSurchargeType || 'percentage'}
                          onChange={handleFlatRateFuelSurchargeValueChange}
                          onDropdownChange={handleFlatRateFuelSurchargeTypeChange}
                          error={!!getFlatRateFuelSurchargeError()}
                          helperText={getFlatRateFuelSurchargeError()}
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
              <Box className={classes.siteDetaisFields}>
                {/* <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="Revenue">{t('obx.sites.createSite.revenue')}</InputLabel>
                  <TextField
                    name="revenue"
                    id="revenue"
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.revenue')}`}
                    type="Number"
                    className={classes?.textFiledFilter}
                    onChange={handleFieldChange}
                    error={!!errorMessages?.revenue}
                    helperText={!!errorMessages?.revenue ? errorMessages?.revenue : null}
                  />
                </Box> */}

                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="billingFrequency">
                    {t('obx.sites.createSite.billingFrequency')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.billingFrequency')}
                    name="billingFrequency"
                    id="billingFrequency"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.billingFrequency')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(billingFrequency(t), 'label', 'value')}
                    selectedValues={formData.billingFrequency}
                    handleChange={handleFieldChange}
                    bordered
                  />

                  {!!errorMessages?.billingFrequency && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.billingFrequency}</Box>
                  )}
                </Box>

                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="billingType">
                    {t('obx.sites.createSite.billingType')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.billingType')}
                    name="billingType"
                    id="billingType"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.billingType')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(billingFrequencyType(t), 'label', 'value')}
                    selectedValues={formData.billingType}
                    handleChange={handleFieldChange}
                    bordered
                  />

                  {!!errorMessages?.billingType && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.billingType}</Box>
                  )}
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="PaymentTerms">
                    {t('obx.sites.createSite.PaymentTerms')} <RequiredAsterik />
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.PaymentTerms')}
                    name="paymentTerm"
                    id="paymentTerm"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.PaymentTerms')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(PaymentTerms(t), 'label', 'value')}
                    selectedValues={formData.paymentTerm}
                    handleChange={handleFieldChange}
                    bordered
                  />
                  {!!errorMessages?.paymentTerm && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.paymentTerm}</Box>
                  )}
                </Box>
              </Box>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="cycleRefDate">
                    {t('obx.sites.createSite.cycleReferenceDate')}
                    <RequiredAsterik />
                  </InputLabel>
                  <Box className={classes.datePickerRow}>
                    <ResponsiveDatePickers
                      name="cycleRefDate"
                      id="cycleRefDate"
                      value={formData?.cycleRefDate ? dayjs(formData?.cycleRefDate) : null}
                      onChange={(value) => {
                        handleDateChange('cycleRefDate', dayjs(value));
                      }}
                      format="MM/DD/YYYY"
                      placeholder={`${t('obx.form.input.textField.cycleReferenceDate.placeHolder')}`}
                      error={!!errorMessages?.cycleRefDate}
                      helperText={
                        !!errorMessages?.cycleRefDate ? errorMessages?.cycleRefDate : null
                      }
                      className={classes.inputWidth}
                    />
                    {formData?.cycleRefDate && (
                      <Button
                        disableRipple
                        className={classes.notesCloseBtn}
                        variant="onlyText"
                        startIcon={<DustinBinIcon />}
                        onClick={() => setFormData((prev) => ({ ...prev, cycleRefDate: null }))}
                      ></Button>
                    )}
                  </Box>
                </Box>
                {/* <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="holidayMultiplier">
                    {t('obx.sites.createSite.holidayMultiplier')}
                  </InputLabel>
                  <TextField
                    name="holidayMultiplier"
                    id="holidayMultiplier"
                    fullWidth
                    placeholder={`${t('obx.sites.createSite.holidayMultiplierPlaceholder')}`}
                    type="text"
                    className={classes?.textFiledFilter}
                    onChange={handleFieldChange}
                    inputProps={{
                      inputMode: 'numeric',
                    }}
                    value={formData?.holidayMultiplier}
                    error={!!errorMessages?.holidayMultiplier}
                    helperText={
                      !!errorMessages?.holidayMultiplier ? errorMessages?.holidayMultiplier : null
                    }
                  />
                </Box> */}
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="holidayRate">
                    {t('obx.sites.createSite.holidayRate')}
                  </InputLabel>
                  <HolidayRateInputDropdown
                    name="holidayRate"
                    id="holidayRate"
                    placeholder={t('obx.sites.createSite.holidayMultiplierPlaceholderNoX')}
                    value={formData?.holidayRate}
                    dropdownValue={formData?.holidayRateType || HOLIDAY_RATE_TYPES.MULTIPLIER_RATE}
                    onChange={handleFieldChange}
                    onDropdownChange={handleFieldChange}
                    className={classes?.textFiledFilter}
                  />
                  {errorMessages?.holidayRate && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.holidayRate}</Box>
                  )}
                </Box>
                <Box className={classes.fieldWrapper}>
                  <InputLabel htmlFor="holidayGroup">
                    {t('obx.sites.createSite.holidayGroup')}
                  </InputLabel>
                  <CustomDropDown
                    label={t('obx.sites.createSite.holidayGroup')}
                    name="holidayGroup"
                    id="holidayGroup"
                    placeHolder={`${t('obx.sites.createSite.select')} ${t('obx.sites.createSite.holidayGroup')}`}
                    placeHolderClassName={classes.placeHolderColor}
                    className={classes.dropdownWrap}
                    options={transformArrayForOptions(holidayGroups, 'name', 'id')}
                    selectedValues={formData.holidayGroup}
                    handleChange={handleFieldChange}
                    bordered
                    clearAll
                  />

                  {!!errorMessages?.holidayGroup && (
                    <Box className={classes.invalidFeedback}>{errorMessages?.holidayGroup}</Box>
                  )}
                </Box>
                {/* <Box className={classes.fieldWrapper}> */}
                {/* <InputLabel htmlFor="billingStartDate">
                    {t('obx.sites.createSite.billingStartDate')} <RequiredAsterik />
                  </InputLabel> */}

                {/* <ResponsiveDatePickers
                    name="billingStartDate"
                    id="billingStartDate"
                    value={dayjs(formData?.billingStartDate)}
                    onChange={(value) => {
                      handleDateChange('billingStartDate', dayjs(value?.toISOString()));
                    }}
                    format="MM/DD/YYYY"
                    placeholder={`${t('obx.form.input.textField.startDate.placeHolder')}`}
                    error={!!errorMessages?.billingStartDate}
                    helperText={
                      !!errorMessages?.billingStartDate ? errorMessages?.billingStartDate : null
                    }
                  /> */}

                {/* <TextField
                  name="billingStartDate"
                  id="billingStartDate"
                  fullWidth
                  placeholder={`${t('obx.sites.createSite.billingStartDate')}`}
                  type="text"
                  className={classes?.textFiledFilter}
                  onChange={handleFieldChange}
                /> */}
                {/* </Box> */}
              </Box>
              <Box className={classes.siteDetaisFields}>
                <Box className={classes.fieldWrapper}>
                  <Box className={classes.radioWrapper}>
                    <RadioGroup
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      className={classes.radioDiv}
                      name={'billableBreak'}
                      value={formData?.billableBreak}
                      onChange={handleFieldChange}
                    >
                      <InputLabel htmlFor="billableBreaks">
                        {t('obx.sites.createSite.billableBreaks')}
                      </InputLabel>
                      <FormControlLabel
                        control={<Radio />}
                        value={true}
                        label={t('obx.sites.createSite.yes')}
                      />
                      <FormControlLabel
                        control={<Radio />}
                        value={false}
                        label={t('obx.sites.createSite.no')}
                      />
                    </RadioGroup>
                  </Box>
                </Box>
              </Box>
            </Box>
            <DynamicSiteForm
              errorMessages={errorMessages}
              formDataKey="siteServices"
              formData={formData}
              updateFormHandler={updateFormHandler}
              startDate={formData?.startDate}
              endDate={formData?.endDate}
              setErrorMessages={setErrorMessages}
              togglableWeekDays={true}
              required={false}
              loadingDropdown={loadingDropdown}
              sageItems={sageItems}
              fuelSurcharge={formData?.fuelSurcharge}
            />
          </Box>
        </Box>
        <Box className={classes.lowerWrap}>
          <Button
            onClick={() => {
              history.push(OBX_SITES);
            }}
            variant="secondaryGrey"
          >
            {t('obx.sites.createSite.cancel')}
          </Button>
          <Button onClick={handleFormSubmit} variant="primary">
            {t('obx.sites.createSite.save')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default CreateSite;
