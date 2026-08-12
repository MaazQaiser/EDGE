import { Box, Button, InputLabel, Skeleton, Typography } from '@mui/material';
import CustomDropDown from 'commonComponents/customDropDown';
import RichTextEditor, { convertDataToHtml } from 'commonComponents/richText';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { EditorState } from 'draft-js';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { createExtraDuty, fetchDefaultHourlyRateOfFranchise } from 'services/duty.services';
import { getAllTypeOfSites, getSitesContracts } from 'services/sites.services';
import DutyInformation from 'src/app/components/common/dutyInformation';
import HitDutyInformation from 'src/app/components/common/HitDutyInformation';
import {
  serviceTypes,
  visitTypes,
} from 'src/app/components/salesComponents/contractCreation/addServices/helper';
import {
  getDaysWrtTimezoneAsPerStandardTime,
  getEmbededDateAndTimeWRTStandardOffset,
  getFranchiseIdWithRoleAndSource,
  getHoursDiff24HourFormat,
  getOffsetWithStandardTime,
  getTimezone,
  utcDayjsWithTimezone,
} from 'src/app/obx/pages/schedules/helper';
import {
  HO_SITES_CREATE_EXTRA_DUTY,
  OBX_SCHEDULES,
  OBX_SITES,
  OBX_SITES_DETAIL,
  OBX_USER,
  OBX_USER_DETAIL,
} from 'src/app/router/constant/ROUTE';
import {
  generateRandomNumbers,
  isObjectEmpty,
  removeKey,
  scrollToInValidField,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useBackNavigation from 'src/hooks/useBackNavigation';
import transformArrayForOptions from 'src/utils/array/transformArrayForOptions';
import {
  EXTRA_DUTY_TYPES,
  franchiseIdUrlQueryParam,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
  toastSettings,
} from 'src/utils/constants';
import formValidatorJoi from 'src/utils/formValidator/formValidator.requiredCheck';
import { truncateToDecimalPlaces } from 'src/utils/regexField/regexFiledForm';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../createExtraDuty.styles';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(minMax);

const dutyFormData = {
  site: {},
  contract: {},
  dutyType: 'extra',
  loadManagement: false,
  visitManagement: false,
  instructions: EditorState.createEmpty(),
  services: [],
  dutyDays: [],
};
// const formConst = {
//   CONTENT: 'content',
//   START_DATE: 'startDate',
//   END_DATE: 'endDate',
//   DAYS: 'weekDays',
// };
const CreateExtraDuty = () => {
  const { t } = useTranslation();
  const { getLabel: _getLabel } = useTenantLabel();
  const [formData, setFormData] = useState(dutyFormData);
  const [errorMessages, setErrorMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [dutyValueRanges, setDutyValueRanges] = useState(undefined);
  const { navigateBack } = useBackNavigation();
  const tenantId = useSelector((state) => state?.auth?.tenantId || {});
  const franchiseId = useSelector((state) => state?.auth?.franchiseId || {});
  const location = useLocation();
  const classes = useStyles();
  const isSitesModule = location.pathname?.includes(OBX_SITES);
  const isUsersModule = location.pathname?.includes(OBX_USER);
  const searchParams = new URLSearchParams(location.search);
  const siteId = searchParams.get('siteId');
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  // get franchise id from the url
  const franchiseIdWithRoleAndSource = getFranchiseIdWithRoleAndSource();

  const franchiseTimeZoneFromUrl = getTimezone();

  let fallbackUrl = OBX_SCHEDULES;

  if (
    franchiseIdWithRoleAndSource?.role === rolesEnumWithName.home_officer.slug &&
    franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam]
  ) {
    const createExtraJob = HO_SITES_CREATE_EXTRA_DUTY;
    const queryParams = new URLSearchParams({
      siteId: `${siteId}`,
      [franchiseIdUrlQueryParam]: franchiseIdWithRoleAndSource?.[franchiseIdUrlQueryParam],
      [timeZoneKeyUrlQueryParam]: franchiseTimeZoneFromUrl,
    }).toString();
    fallbackUrl = `${createExtraJob}?${queryParams}`;
  } else if (isSitesModule) {
    fallbackUrl = `${OBX_SITES_DETAIL}/${siteId}`;
  } else if (isUsersModule) {
    fallbackUrl = `${OBX_USER_DETAIL}/${userId}`;
  }
  /**
   * Generate Key for Joi
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getErrorKey = (key, formDataKey, index) => {
    return `${formDataKey},${index},${key}`;
  };
  /**
   * Show error messages on state
   * @param {*} key
   * @param {*} formDataKey
   * @param {*} index
   * @returns
   */
  const getSitesList = async () => {
    try {
      const response = await getAllTypeOfSites();
      setSites(response?.data?.sites || []);
    } catch (error) {
      setSites([]);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const getContracts = async (id) => {
    try {
      const response = await getSitesContracts(id);
      setContracts(response?.data?.contracts || []);
    } catch (error) {
      setContracts([]);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const getDefaultHourlyRate = async () => {
    try {
      const response = await fetchDefaultHourlyRateOfFranchise();
      let rate = {};
      if (response?.statusCode === 200) {
        rate = {
          rateValue: response?.data?.preference?.rateValue,
          maxRate: response?.data?.preference?.maxRate,
          minRate: response?.data?.preference?.minRate,
        };
      }
      setDutyValueRanges(rate);
    } catch (error) {
      setDutyValueRanges(undefined);
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };
  const updateFormHandler = useCallback(
    (name, value) => {
      console.log('asfddsa:name:::value:::', name, value);
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [setFormData],
  );

  const handleEditorChange = (event) => {
    const {
      target: { value },
    } = event;

    handleInputChange('instructions', value);
  };

  const _sendISODays = (startTime, daysArr) => {
    const startTimeISODate = dayjs.utc(startTime).date();
    const startTimeLocalDate = dayjs(startTime).date();
    if (startTimeLocalDate > startTimeISODate) {
      return daysArr?.map((shiftDay) => {
        if (shiftDay - 1 === -1) {
          return 6;
        }
        return shiftDay - 1;
      });
    }
    if (startTimeLocalDate < startTimeISODate) {
      return daysArr?.map((shiftDay) => {
        if (shiftDay + 1 === 7) {
          return 0;
        }
        return shiftDay + 1;
      });
    }
    return daysArr;
  };

  const getNumberValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const getCalculatedNumber = (value) => {
    const number = getNumberValue(value);
    return Number(Number.isInteger(number) ? number : truncateToDecimalPlaces(number, 2));
  };

  const getSelectedDateOccurrences = (dateRange = [], selectedDays = []) => {
    const [startDate, endDate] = dateRange;

    if (!startDate || !endDate || !selectedDays?.length) {
      return 0;
    }

    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).startOf('day');

    if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) {
      return 0;
    }

    const selectedDayValues = new Set(selectedDays.map(Number));
    let currentDate = start;
    let count = 0;

    while (currentDate.isSame(end, 'day') || currentDate.isBefore(end, 'day')) {
      if (selectedDayValues.has(currentDate.day())) {
        count += 1;
      }
      currentDate = currentDate.add(1, 'day');
    }

    return count;
  };

  const getExtraDutyHoursPerWeek = (duty) => {
    if (!duty?.startsAt || !duty?.endsAt) {
      return 0;
    }

    const durationHours = getHoursDiff24HourFormat(duty.startsAt, duty.endsAt);
    const selectedJobDays = new Set((duty?.dutyDays || []).map(Number)).size;

    return getCalculatedNumber(durationHours * selectedJobDays);
  };

  const getExtraHitVisitsPerWeek = (service) => {
    const selectedDayOccurrences = getSelectedDateOccurrences(
      service?.dateRange,
      service?.visitDays,
    );
    const visitsPerWeek = (service?.visits || []).reduce(
      (total, visit) => total + getNumberValue(visit?.visitsPerDay) * selectedDayOccurrences,
      0,
    );

    return getCalculatedNumber(visitsPerWeek);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { site, contract, instructions, services, extraDuties, dutyType } = formData || {};

    // Build initial validation payload
    const validationPayload = {
      site: site?.id || '',
      contract: contract?.id || '',
      instructions: convertDataToHtml(instructions) || '',

      ...(type === EXTRA_DUTY_TYPES.EXTRA_JOB_DEDICATED && Array.isArray(extraDuties)
        ? {
            extraDuties: extraDuties.map((duty) => ({
              ...duty,
              startsAt:
                duty?.startsAt && dayjs(duty.startsAt).isValid()
                  ? dayjs(duty.startsAt).toDate()
                  : duty?.startsAt || null,
              endsAt:
                duty?.endsAt && dayjs(duty.endsAt).isValid()
                  ? dayjs(duty.endsAt).toDate()
                  : duty?.endsAt || null,
              hoursPerWeek: getExtraDutyHoursPerWeek(duty),
              ...(duty?.fuelSurchargeEnabled && {
                fuelSurchargeEnabled: true,
                fuelSurchargeType: duty.fuelSurchargeType ?? '',
                fuelSurchargeValue: duty.fuelSurchargeValue ?? '',
              }),
            })),
          }
        : {}),
      ...(type === EXTRA_DUTY_TYPES.EXTRA_HIT_PATROL
        ? {
            extraHitServices: services?.map((service) => ({
              pricePerVisit: service?.pricePerVisit || null,
              dateRange: service.dateRange || [],
              visitDays: service.visitDays || [],
              visitsPerWeek: getExtraHitVisitsPerWeek(service),
              ...(service?.fuelSurchargeEnabled && {
                fuelSurchargeEnabled: true,
                fuelSurchargeType: service.fuelSurchargeType ?? '',
                fuelSurchargeValue: service.fuelSurchargeValue ?? '',
              }),
              visits:
                service.visits?.map((visit) => ({
                  visitType: visitTypes.RANDOM,
                  visitsPerDay: visit.visitsPerDay || null,
                  startTime: visit?.startTime ? visit?.startTime?.toISOString() : null,
                  endTime: visit?.endTime ? visit?.endTime?.toISOString() : null,
                })) || [],
            })),
          }
        : {}),
    };

    const finalPayload = JSON.parse(JSON.stringify(validationPayload));
    const errors = await formValidatorJoi(finalPayload, t);

    if (errors && Object.keys(errors).length && Object.keys(errorMessages).length < 1) {
      setErrorMessages(errors);
      scrollToInValidField();
      return;
    }

    // Handle duplicate checks for dedicated extra duties
    if (type === EXTRA_DUTY_TYPES.EXTRA_JOB_DEDICATED && extraDuties?.length) {
      const dutiesWithErrors = Array(extraDuties.length).fill(false);
      let errorCount = 0;

      for (let i = 0; i < extraDuties.length - 1; i++) {
        for (let j = i + 1; j < extraDuties.length; j++) {
          if (isDuplicateDuty(extraDuties[i], extraDuties[j])) {
            const errorOne = getErrorKey('extraDutyItem', 'extraDuties', i);
            const errorTwo = getErrorKey('extraDutyItem', 'extraDuties', j);
            setErrorMessages((prev) => ({
              ...prev,
              [errorOne]: t('obx.schedules.dutyDuplicate', { copyIndex: j + 1 }),
              [errorTwo]: t('obx.schedules.dutyDuplicate', { copyIndex: i + 1 }),
            }));
            dutiesWithErrors[i] = dutiesWithErrors[j] = true;
            errorCount++;
          }
        }
      }

      // Clean errors for duties without issues
      extraDuties.forEach((_, idx) => {
        if (!dutiesWithErrors[idx]) {
          const errorKey = getErrorKey('extraDutyItem', 'extraDuties', idx);
          setErrorMessages((prev) => removeKey([errorKey], prev));
        }
      });

      if (errorCount > 0) return;
    }

    if (type === EXTRA_DUTY_TYPES.EXTRA_HIT_PATROL && services?.length) {
      const servicesWithErrors = Array(services.length).fill(false);
      let errorCount = 0;

      for (let i = 0; i < services.length; i++) {
        const currentService = services[i];
        for (let k = 0; k < currentService.visits.length; k++) {
          const serviceStartDate = currentService?.dateRange?.[0]?.format('DD-MM-YYYY');
          const serviceEndDate = currentService?.dateRange?.[1]?.format('DD-MM-YYYY');

          const currentVisit = currentService?.visits[k];

          const currentVisitStartTime = currentVisit?.startTime?.format('HH:mm');
          const currentVisitEndTime = currentVisit?.endTime?.format('HH:mm');

          if (
            serviceStartDate === serviceEndDate &&
            currentVisitStartTime === currentVisitEndTime
          ) {
            const key = `visits,${k},endTime`;

            const errorKey = getErrorKey(key, 'extraHitServices', i);
            setErrorMessages((prev) => ({
              ...prev,
              [errorKey]: t('obx.schedules.visitStartEndDateSame'),
            }));
            servicesWithErrors[i] = true;
            errorCount++;
          }
        }
      }

      // Clean errors for services without issues
      services.forEach((_, idx) => {
        if (!servicesWithErrors[idx]) {
          const errorKey = getErrorKey('extraHitServices', 'services', idx);
          setErrorMessages((prev) => removeKey([errorKey], prev));
        }
      });

      if (errorCount > 0) return;
    }

    const dataToMap = type === EXTRA_DUTY_TYPES.EXTRA_JOB_DEDICATED ? extraDuties : services;

    const apiPayload =
      type === EXTRA_DUTY_TYPES.EXTRA_HIT_PATROL
        ? buildPatrolHitsPayload(formData, instructions)
        : dataToMap.map((item) => buildDutyPayload(item, formData, instructions, dutyType));

    try {
      setLoading(true);

      const res = await createExtraDuty(apiPayload);
      toaster.success({
        text: res?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      handleGoBack();
    } catch (e) {
      if (type === EXTRA_DUTY_TYPES.EXTRA_HIT_PATROL)
        toaster.error({
          text: t('obx.obxExtraDuty.labels.unableToCreateExtraHit'),
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      else
        toaster.error({
          text: e?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const isDuplicateDuty = (dutyOne, dutyTwo) => {
    if (!dutyOne || !dutyTwo) return false;
    const sameTime =
      dutyOne.startsAt?.format('HH:mm') === dutyTwo.startsAt?.format('HH:mm') &&
      dutyOne.endsAt?.format('HH:mm') === dutyTwo.endsAt?.format('HH:mm');
    const sameDate =
      dutyOne.dateRange?.[0]?.format('YYYY-MM-DD') ===
        dutyTwo.dateRange?.[0]?.format('YYYY-MM-DD') &&
      dutyOne.dateRange?.[1]?.format('YYYY-MM-DD') === dutyTwo.dateRange?.[1]?.format('YYYY-MM-DD');
    return sameTime && sameDate;
  };

  const buildDutyPayload = (item, formData, instructions, dutyType) => {
    const startTime = item.startsAt;
    const endTime = item.endsAt;

    console.log('item:::', item);

    const startDate = dayjs(item.dateRange?.[0]).format('YYYY-MM-DD');
    const endDate = dayjs(item.dateRange?.[1]).format('YYYY-MM-DD');

    const startIso = utcDayjsWithTimezone(startTime).subtract(
      getOffsetWithStandardTime(),
      'minute',
    );
    const endIso = utcDayjsWithTimezone(endTime).subtract(getOffsetWithStandardTime(), 'minute');

    const startsAt = getEmbededDateAndTimeWRTStandardOffset(
      startIso.toISOString(),
      startDate,
    )?.toISOString();
    const endsAtDate = getEmbededDateAndTimeWRTStandardOffset(startIso.toISOString(), endDate);
    const finalEndsAt = `${new Date(endsAtDate).toISOString().split('T')[0]}T${endIso.toISOString().split('T')[1]}`;

    return {
      contractId: formData.contract?.id,
      siteId: formData.site?.id,
      dutyType,
      startsAt,
      endsAt: finalEndsAt,
      officerCount: item.officerCount,
      designation: item.officerType?.name,
      hourlyRate: item.hourlyRate,
      loadManagement: item.loadManagement || false,
      visitManagement: item.visitManagement || false,
      dutyDays: getDaysWrtTimezoneAsPerStandardTime(startsAt, item.dutyDays, true),
      hoursPerWeek: getExtraDutyHoursPerWeek(item),
      instructions: convertDataToHtml(instructions),
      contractName: formData.contract?.title,
      contractStatus: formData.contract?.status,
      tenantId,
      franchiseId,
      ...(item?.fuelSurchargeEnabled && {
        fuelSurchargeEnabled: true,
        fuelSurchargeType: item.fuelSurchargeType,
        fuelSurchargeValue: item.fuelSurchargeValue,
      }),
    };
  };

  const buildPatrolHitsPayload = (formData, instructions) => {
    if (!formData?.services || !formData.services.length) return [];

    return formData.services
      .map((service) => {
        if (!service.visits?.length) return null;

        // Get start and end date
        const startDate = service?.dateRange?.[0];
        let endDate = service?.dateRange?.[1];

        // Get start and end time for each visit
        const times = service.visits.map((v) => ({
          start: dayjs(v.startTime),
          end: dayjs(v.endTime),
        }));

        // Get minimum start time and maximum end time
        const startTime = dayjs.min(times.map((t) => t.start));
        const endTime = dayjs.max(times.map((t) => t.end));

        // Append start time to start date
        const startDateTime = getEmbededDateAndTimeWRTStandardOffset(
          startTime,
          startDate,
        )?.toISOString();

        // Append end time to end date
        const endDateTime = getEmbededDateAndTimeWRTStandardOffset(endTime, endDate)?.toISOString();

        return {
          contractId: formData.contract?.id,
          siteId: formData.site?.id,
          dutyType: serviceTypes.PATROL,
          isExtra: true,
          startsAt: startDateTime,
          endsAt: endDateTime,
          visitsPerWeek: getExtraHitVisitsPerWeek(service),
          visitSet: service.visits.map((visit) => mapVisit(visit, service)),
          instructions: convertDataToHtml(instructions),
          contractStatus: formData.contract?.status,
          contractName: formData.contract?.title,
          tenantId,
          franchiseId,
          serviceName: service.serviceName || 'Extra Hit',
          pricePerVisit: service.pricePerVisit,
          ...(service?.fuelSurchargeEnabled && {
            fuelSurchargeEnabled: true,
            fuelSurchargeType: service.fuelSurchargeType,
            fuelSurchargeValue: service.fuelSurchargeValue,
          }),
        };
      })
      .filter(Boolean); // remove nulls if any service had no visits
  };

  const mapVisit = (visit, service) => {
    // Get start and end date
    const startDate = service?.dateRange?.[0];
    let endDate = service?.dateRange?.[1];

    // Get initial start and end time
    const initialStartTime = visit.startTime;
    let initialEndTime = visit.endTime;

    // If end time is before start time, append 1 day to end date
    if (
      initialStartTime?.isValid() &&
      initialEndTime?.isValid() &&
      endDate?.isValid() &&
      initialEndTime?.isBefore(initialStartTime)
    ) {
      endDate = endDate?.add(1, 'day');
    }

    // Append start time to start date
    const startDateTime = getEmbededDateAndTimeWRTStandardOffset(
      initialStartTime,
      startDate,
    )?.toISOString();

    // Append end time to end date
    const endDateTime = getEmbededDateAndTimeWRTStandardOffset(
      initialEndTime,
      endDate,
    )?.toISOString();

    // Get duty days between ISO dates
    const dutyDaysBetweenIsoDates = getDaysWrtTimezoneAsPerStandardTime(
      startDateTime,
      service?.visitDays,
      true,
    );

    return {
      days: dutyDaysBetweenIsoDates,
      visitDays: dutyDaysBetweenIsoDates,
      startsAt: startDateTime,
      startDateTime,
      visitType: visitTypes.RANDOM,
      hits: visit.visitsPerDay,
      perDayVisits: visit.visitsPerDay,
      endsAt: endDateTime,
      endDateTime,
    };
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      extraDuties: [
        {
          randomName: generateRandomNumbers(),
          startsAt: null,
          endsAt: null,
          officerCount: null,
          officerType: {},
          hourlyRate: null,
          dutyDays: [],
          dateRange: [],
          fuelSurchargeEnabled: false,
          fuelSurchargeType: 'percentage',
          fuelSurchargeValue: '',
        },
      ],
      services: [],
    }));
    getDefaultHourlyRate();
    getSitesList();
  }, []);
  const handleGoBack = () => {
    navigateBack({ fallbackUrl: fallbackUrl });
  };

  const resetContractOnSiteChange = () => {
    // Reset contract and flat-flag when site changes
    setFormData((prevState) => ({
      ...prevState,
      contract: {},
      isFlat: false,
      IsFlat: false,
    }));
  };
  const resetContractOnSiteChanges = () => {
    // Set contracts to [] if site changes
    setContracts([]);
  };

  const handleInputChange = useCallback(
    (name, value) => {
      console.log(name, 'name:::values', value);
      if (name === 'site') {
        resetContractOnSiteChange();
        resetContractOnSiteChanges();
        getContracts(value?.id);
      }
      if (value) {
        setErrorMessages((prev) => removeKey([name], prev));
      }
      if (name === 'contract') {
        const isFlatContract = value?.isFlat === true || value?.IsFlat === true;
        setFormData((prevState) => ({
          ...prevState,
          contract: value,
          isFlat: isFlatContract,
          IsFlat: isFlatContract,
        }));
        return;
      }
      updateFormHandler(name, value);
    },
    [updateFormHandler],
  );
  // set default site, if siteId exists in query params
  useEffect(() => {
    const siteId = searchParams.get('siteId');
    if (!siteId || !sites || sites.length === 0) return;
    const matchedSite = sites.find((site) => site?.id == siteId);
    setFormData((prevState) => ({
      ...prevState,
      site: { ...matchedSite, label: matchedSite?.name, value: matchedSite?.id },
    }));
    getContracts(siteId);
  }, [sites]);
  const _enableAPI = !loading;

  const fuelSurchargeValKey = 'fuelSurchargeValue';
  const fuelSurchargeTypeKey = 'fuelSurchargeType';

  const clearFuelSurchargeErrors = () => {
    setErrorMessages((prev) => {
      const { [fuelSurchargeValKey]: _a, [fuelSurchargeTypeKey]: _b, ...rest } = prev;
      return rest;
    });
  };

  const _handleFuelSurchargeCheckChange = (isChecked) => {
    setFormData((prev) => ({
      ...prev,
      fuelSurchargeEnabled: isChecked,
      ...(!isChecked && {
        fuelSurchargeValue: '',
        fuelSurchargeType: 'percentage',
      }),
    }));
    clearFuelSurchargeErrors();
  };

  const _handleFuelSurchargeValueChange = (e) => {
    handleInputChange('fuelSurchargeValue', e.target.value);
    setErrorMessages((prev) => {
      const { [fuelSurchargeValKey]: _, ...rest } = prev;
      return rest;
    });
  };

  const _handleFuelSurchargeTypeChange = (e) => {
    handleInputChange('fuelSurchargeType', e.target.value);
    clearFuelSurchargeErrors();
  };

  const _getFuelSurchargeError = () => {
    return errorMessages?.[fuelSurchargeValKey] || errorMessages?.[fuelSurchargeTypeKey] || '';
  };
  console.log('ada:::', errorMessages, formData);
  return (
    <Box className={classes.createExtraDuty}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className={classes.createExtraDutyContent}
      >
        <Box className={classes.createExtraDutyHeader}>
          <Typography variant="h4" className={classes.createExtraDutyTitle}>
            {t(`obx.obxExtraDuty.labels.${type}`)}
          </Typography>
          <Typography variant="body3" className={classes.createExtraDutyText}>
            {t(`obx.obxExtraDuty.labels.${type}Description`)}
          </Typography>
        </Box>
        <Box className={classes.createExtraDutyDropdowns}>
          <Box className={classes.createExtraDutyDropdownBox}>
            <InputLabel>{t('form.input.textField.site.label')}</InputLabel>
            {sites?.length ? (
              <>
                <CustomDropDown
                  name="site"
                  placeHolder={t('obx.form.input.dropDown.selectSite.label')}
                  selectedValues={formData.site}
                  handleChange={(e) => handleInputChange(e.target.name, e.target.value)}
                  options={transformArrayForOptions(sites, 'name', 'id')}
                  bordered
                  className={classes.createExtraDutyDropdown}
                  isError={!!errorMessages?.site}
                  searchable={true}
                  disabled={!!siteId}
                />
              </>
            ) : (
              <>
                <Skeleton className={classes.skeletonDropdown} />
              </>
            )}

            {!!errorMessages?.site && (
              <Box className={classes.invalidFeedback}>{errorMessages?.site}</Box>
            )}
          </Box>
          {/** Contracts */}
          <Box className={classes.createExtraDutyDropdownBox}>
            <InputLabel>{t('obx.commonText.selectContract')}</InputLabel>
            <CustomDropDown
              name="contract"
              placeHolder={t('obx.commonText.selectContract')}
              selectedValues={formData.contract}
              handleChange={(e) => handleInputChange(e.target.name, e.target.value)}
              options={transformArrayForOptions(contracts, 'title', 'id')}
              bordered
              className={classes.createExtraDutyDropdown}
              isError={!!errorMessages?.contract}
              searchable={true}
            />
            {!!errorMessages?.contract && (
              <Box className={classes.invalidFeedback}>{errorMessages?.contract}</Box>
            )}
          </Box>
        </Box>
        {type === EXTRA_DUTY_TYPES.EXTRA_JOB_DEDICATED && formData?.extraDuties && (
          <DutyInformation
            formData={formData}
            errorMessages={errorMessages}
            updateFormHandler={updateFormHandler}
            formDataKey={'extraDuties'}
            setErrorMessages={setErrorMessages}
            dutyValueRanges={dutyValueRanges}
            similarItemErrorKey="extraDutyItem"
          />
        )}
        {type === EXTRA_DUTY_TYPES.EXTRA_HIT_PATROL && (
          <HitDutyInformation
            formData={formData}
            errorMessages={errorMessages}
            updateFormHandler={updateFormHandler}
            formDataKey={'services'}
            setErrorMessages={setErrorMessages}
          />
        )}
        {/* <FuelSurchargeInputDropdown
          name="fuelSurchargeValue"
          id="fuelSurchargeValue"
          label={t('obx.sites.createSite.includeFuelSurcharge', 'Include Fuel Surcharge')}
          checked={!!formData?.fuelSurchargeEnabled}
          onCheckChange={handleFuelSurchargeCheckChange}
          placeholder={t('obx.sites.createSite.enterFuelSurcharge', 'E.g; 20')}
          value={formData?.fuelSurchargeValue || ''}
          dropdownValue={formData?.fuelSurchargeType || 'percentage'}
          onChange={handleFuelSurchargeValueChange}
          onDropdownChange={handleFuelSurchargeTypeChange}
          error={!!getFuelSurchargeError()}
          helperText={getFuelSurchargeError()}
        /> */}
        {/*Daily instructions*/}
        <Box className={classes.createExtraDutyEditor}>
          <RichTextEditor
            handleChange={handleEditorChange}
            name={'instructions'}
            placeholder={t('obx.obxExtraDuty.placeholders.descriptions')}
            value={formData?.instructions}
            customClassEditor={classes.createDutyEditor}
          />
          {!!errorMessages?.instructions && (
            <Box className={classes.invalidFeedback}>{errorMessages?.instructions}</Box>
          )}
        </Box>
      </Box>
      <Box className={classes.createExtraDutyFooter}>
        <Button variant="secondaryGrey" onClick={handleGoBack}>
          {t('buttons.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isObjectEmpty(errorMessages)}
          variant="primary"
        >
          {t(`obx.obxExtraDuty.labels.${type}Create`)}
        </Button>
      </Box>
    </Box>
  );
};
export default CreateExtraDuty;
