import { Buffer } from 'buffer';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // ES 2015
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import store from 'src/redux/store/index';
import { numberToDays, SCHEDULE_DUTIES } from 'src/utils/constants/schedules';

import {
  actionItemTypeKeys,
  deviceTypeEnum,
  directionServiceErrors,
  enumResponseType,
  enviromnentInstances,
  placesMap,
} from '../utils/constants';
import { MULTI_TENANT_AUTH } from '../utils/constants/multiTanentAuthInfo';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
export const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

/**
 *
 * @param {*} key
 * @param {*} param1
 * @returns
 */
export const removeKey = (key, { [key]: _, ...rest }) => rest;

export const isObjectEmpty = (obj) => {
  if (!obj) {
    return true;
  }
  return Object.keys(obj).length === 0;
};

export const generateUniqueId = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `${timestamp}-${random}`;
};

export const mapNameAndLabels = (data) => {
  try {
    return data?.map((item) => {
      return { id: item?.id, value: item?.name, label: item?.name };
    });
  } catch (e) {
    throw new Error(e.message);
  }
};

export const mapFranchiseDetailData = (
  data,
  itemAreaKey = 'franchiseArea',
  zonesOrSites = 'zones',
  childrenAreaKey = 'zoneArea',
) => {
  try {
    const temp = { ...data, coordinates: data?.[itemAreaKey] };
    temp?.[zonesOrSites]?.forEach((item) => {
      item.parentId = data?.id;
      item.coordinates = item?.[childrenAreaKey];
    });
    return temp;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const mapLocationInfo = (data) => {
  return {
    ...data,
    country: data?.country?.id || '',
    city: data?.city?.id || '',
    countryCode: data?.country?.countryCode || data?.countryCode || '',
    state: data?.state?.id || '',
    isBreakPayable: data?.isBreakPayable || false,
    dailySiteSummaryReceivers: data?.dailySiteSummaryReceivers || [],
    incidentReportReceivers: data?.incidentReportReceivers || [],
  };
};

export const mapAddressDetails = (data) => {
  const { t } = useTranslation();

  const { address, city, state, postalCode } = data || {};
  let result = [address, city, state, postalCode].filter((value) => value).join(', ');
  return result || t('commonText.nA');
};

export const addZoneDetails = (data) => {
  try {
    return {
      ...data,
      supervisor: data?.supervisor?.[0]?.id || data?.supervisor?.id,
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

export const testPayRoll = (value) => {
  return dayjsWithStandardOffset(value);
};

export const timeFormat12h = (value, formatWRTStandardTime) => {
  value = formatWRTStandardTime ? dayjsWithStandardOffset(value) : dayjs(value);
  const minutes = value.minute();
  const timeFormat = minutes === 0 ? 'ha' : 'h:mma';
  return value ? value.format(timeFormat).replace('m', '') : '';
};

export const getDaysStringFromNumbers = (numbers = [], disableShortNotation) => {
  if (!disableShortNotation) {
    const allElementsMatched = (arr = []) => {
      return arr.every((item) => numbers.includes(item)) && numbers.length === arr.length;
    };

    if (numbers.length === 7) {
      return 'Everyday';
    } else if (allElementsMatched([1, 2, 3, 4, 5])) {
      return 'Weekdays';
    } else if (allElementsMatched([0, 6])) {
      return 'Weekend';
    }
  }
  let days = numbers.reduce((acc, cur) => {
    acc = [...acc, numberToDays[cur]];

    return acc;
  }, []);
  return days.join(', ');
};

// Convert minutes to hours and minutes format
export const convertMinutesToHMFormat = (totalMinutes) => {
  if (!totalMinutes) return '0hrs';

  const hours = Math.floor(totalMinutes / 60);
  const usedMinutes = hours * 60;

  const minutes = Math.round(totalMinutes) - usedMinutes;

  const formattedTime = minutes ? `${hours}h ${minutes}m` : `${hours}hrs`;
  return formattedTime;
};

// fromValue and toValue will be in ISO format
export const setDateToTime = ({ fromValue, toValue }) => {
  const dutyStartDate = dayjs(fromValue).get('date');
  const dutyStartMonth = dayjs(fromValue).get('month');
  const dutyStartYear = dayjs(fromValue).get('year');

  const updatedValue = dayjs(toValue)
    .set('date', dutyStartDate)
    .set('month', dutyStartMonth)
    .set('year', dutyStartYear);

  return updatedValue.toISOString();
};

export const getErrorKey = (key, formDataKey, index) => {
  return `${formDataKey},${index},${key}`;
};

export const showError = ({ key, formDataKey, index, errors }) => {
  return errors?.[`${getErrorKey(key, formDataKey, index)}`];
};

export const removeDataFromObject = (array, finalPayload) => {
  array.forEach((a) => {
    const key = finalPayload[a];
    if (!key) {
      // ? NOTE: if the key "name" is not getting used add _ before it or this rule will suffice the need here.
      // eslint-disable-next-line no-unused-vars
      const { [a]: name, ...rest } = finalPayload;
      finalPayload = rest;
    }
  });

  return finalPayload;
};
/**
 * @description maps dropdown data of address entities for API integration
 * @param {*} data
 * @returns {object}
 */
export const mapDropDownData = (data) => {
  return { id: data?.id, name: data?.name, label: data?.name, value: data?.id };
};
export const mapFullName = (firstName, lastName) => {
  // Check if both firstName and lastName are null, and return "N/A" in that case
  if (firstName === null && lastName === null) {
    return 'NA';
  }

  // Handle null values for firstName and lastName separately
  const fullName = ((firstName || '') + ' ' + (lastName || '')).trim();

  return fullName === '' ? 'NA' : fullName;
};

export const transformPieChartData = (labels, values, total) => {
  if (!labels || !values || labels.length !== values.length) {
    return null;
  }

  const data = labels.map((label, index) => ({
    name: label,
    value: values[index],
  }));

  return {
    data,
    total: total || data.reduce((sum, entry) => Number(sum) + Number(entry.value), 0),
  };
};

export const transformBarChartData = (xAxis, series) => {
  if (!xAxis || !series || xAxis.length !== series.length) {
    return null;
  }

  return {
    xAxis,
    series,
  };
};

export const parseDataLabels = (months) => {
  return months.map((month) => `${month.substr(0, 3)}' ${month.split(' ')[1].substr(2)}`);
};

/**
 * @description shift days of weekdays index WRT to a day difference with UTC timezone
 * @param {*} weekdays
 * @param {*} shift
 * @returns
 */
export const shiftWeekdaysWRTShiftValue = (weekdays, shift) => {
  // Mapping object for days of the week
  const dayMapping = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];

  // Apply shift to each weekday value
  const shiftedDays = weekdays.map((dayValue) => {
    // Calculate the new value with wrapping
    let newValue = (dayValue + shift + 7) % 7; // Adding 7 ensures positive numbers for modulo operation

    // Find the corresponding day object and return its value
    const dayObj = dayMapping.find((d) => d.value === newValue);
    return dayObj ? dayObj.value : newValue; // Should always find a match, but included for safety
  });

  return shiftedDays;
};

/**
 * Converts a given timestamp to UTC based on the specified timezone offset.
 * @param {string} timestamp - The original timestamp in ISO format.
 * @param {string} timezoneOffset - The timezone offset in the format '+HH:mm' or '-HH:mm'.
 * @returns {string} The converted timestamp in UTC.
 */
export const convertDataFromForeignOffsetToUTC = (timestamp, timezoneOffset) => {
  // Parse the offset hours and minutes
  const offsetSign = timezoneOffset[0]; // '+' or '-'
  const offsetHours = parseInt(timezoneOffset.substring(1, 3), 10);
  const offsetMinutes = parseInt(timezoneOffset.substring(4, 6), 10);

  // Calculate the total offset in minutes
  const totalOffsetMinutes = offsetHours * 60 + offsetMinutes;
  // Determine the adjustment direction based on the sign
  const adjustmentDirection = offsetSign === '+' ? -1 : 1;

  // Convert the timestamp to Day.js object and adjust based on the calculated offset
  let adjustedTimestamp = dayjs
    .utc(timestamp)
    .add(totalOffsetMinutes * adjustmentDirection, 'minute');

  let dayCount = 0;

  // Updating day count for manually add one day in future
  // if adjusted timestamp is after the initial timestamp
  // and not same.
  if (
    adjustedTimestamp.isAfter(timestamp, 'date') &&
    timestamp.isBefore(adjustedTimestamp, 'date')
  ) {
    dayCount = 1;
  }

  // Updating day count for manually subtract one day in
  // future if adjusted timestamp is after the initial
  // timestamp and not same.
  if (
    adjustedTimestamp.isBefore(timestamp, 'date') &&
    timestamp.isAfter(adjustedTimestamp, 'date')
  ) {
    dayCount = -1;
  }

  return [adjustedTimestamp, dayCount];
};

export const convertDateByDaysDifference = (serviceTime, daysDifference, date) => {
  let serviceDate = null;

  // Adding or subtracting the days manually if the difference
  // exists and returning the formatted data
  if (daysDifference === 1) {
    serviceDate = dayjs(date).add(1, 'day').format('YYYY-MM-DD');
  } else if (daysDifference === -1) {
    serviceDate = dayjs(date).subtract(1, 'day').format('YYYY-MM-DD');
  } else {
    serviceDate = dayjs(date).format('YYYY-MM-DD');
  }

  const formattedServiceDate = serviceDate.concat(`T${serviceTime.format('HH:mm:ss')}Z`);

  return formattedServiceDate;
};

export const getUniqueOrderedDaysOfWeekBetweenDates = (startDate, endDate) => {
  const daysOfWeekWithVal = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 0 },
  ];
  const days = new Set(); // Using a Set to store unique values

  let currentDate = dayjs(dayjs(startDate).format('YYYY-MM-DD'));
  let endingDate = dayjs(dayjs(endDate).format('YYYY-MM-DD'));

  while (currentDate.isBefore(endingDate) || currentDate.isSame(endingDate, 'day')) {
    const dayOfWeek = currentDate.format('dddd');
    const dayObject = daysOfWeekWithVal.find((day) => day.label === dayOfWeek);
    days.add(dayObject);
    currentDate = dayjs(dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD')); // current date will pick current date offset
  }

  // Convert the Set to an array and sort it by the custom order of weekdays
  return Array.from(days)
    .sort((a, b) => {
      const valA = daysOfWeekWithVal.findIndex((day) => day.label === a.label);

      const valB = daysOfWeekWithVal.findIndex((day) => day.label === b.label);
      return valA - valB;
    })
    .map((a) => {
      return { ...a, label: a.label.toLowerCase() };
    });
};

export const formatDate = (date, template = 'MM/DD/YYYY') => {
  const formattedDate = dayjs(date).format(template);
  return formattedDate === 'Invalid Date' ? '' : formattedDate;
};

/**
 * @description Cook data for geoLocation
 * @param {Number} actionItemId
 * @param {Object} dataFromGeoLocation
 * @param {String} activePolygonType
 * @returns Object
 */
export const findParentAndSiblingsPolygon = (
  actionItemId,
  dataFromGeoLocation,
  activePolygonType,
  filterActiveActionItem = true,
) => {
  let [parent, error, siblings, franchiseArea, inputData, children] = [
    null,
    null,
    {},
    [],
    dataFromGeoLocation?.data,
    [],
  ];

  /**
   * Filter action item from respective array of objects
   */
  franchiseArea.franchises =
    activePolygonType === actionItemTypeKeys.franchise && filterActiveActionItem && actionItemId
      ? inputData?.franchises?.filter((franchise) => franchise?.id != actionItemId)
      : inputData?.franchises;

  franchiseArea.zones =
    activePolygonType === actionItemTypeKeys.zone && filterActiveActionItem && actionItemId
      ? inputData?.zones?.filter((zone) => zone?.id != actionItemId)
      : inputData?.zones;

  franchiseArea.sites =
    activePolygonType === actionItemTypeKeys.site && filterActiveActionItem && actionItemId
      ? inputData?.sites?.filter((site) => site?.id != actionItemId)
      : inputData?.sites;

  /**
   * find parent, children and siblings
   */
  switch (activePolygonType) {
    case actionItemTypeKeys.site:
      parent = inputData?.zones?.find((zone) => zone?.id == inputData?.parentId);
      siblings = actionItemId
        ? inputData?.sites?.filter((site) => site?.id != actionItemId)
        : inputData?.sites;
      children = [];

      break;
    case actionItemTypeKeys.zone:
      parent = inputData?.franchises?.find((franchise) => franchise?.id == inputData?.parentId);
      siblings = actionItemId
        ? inputData?.zones?.filter((zone) => zone?.id != actionItemId)
        : inputData?.zones;
      children = actionItemId ? inputData?.sites : [];

      break;
    case actionItemTypeKeys.franchise:
      siblings = actionItemId
        ? inputData?.franchises?.filter((franchise) => franchise?.id != actionItemId)
        : inputData?.franchises;
      parent = null;
      children = actionItemId ? inputData?.zones : [];

      break;
    default:
      break;
  }
  return { parent, error, siblings, franchiseArea, children };
};
export const getTimeWithInterval = ({
  startHour = 0,
  endHour = 24,
  skipFirst = false,
  is24Hours = true,
}) => {
  let dates = [];

  let currentDate = dayjs().startOf('day');
  let start = currentDate.set('hour', startHour).set('minute', 0).set('second', 0);
  const end = currentDate.set('hour', endHour).set('minute', 0).set('second', 0);

  if (skipFirst) {
    start = start.add(30, 'minute');
  }

  const timeFormat = is24Hours ? 'HH:mm' : 'hh:mm A';

  // Don't include the end time if it would duplicate the start time
  const endFormatted = end.format(timeFormat);
  const startFormatted = currentDate
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .format(timeFormat);
  const includeEnd = endFormatted !== startFormatted;

  while (start.isBefore(end) || (start.isSame(end) && includeEnd)) {
    const intervaledTime = start.format(timeFormat);
    start = start.add(30, 'minute');

    dates = [
      ...dates,
      {
        value: intervaledTime,
        label: intervaledTime,
      },
    ];
  }

  return dates;
};

export const getTimeWithIntervalNextTwentyFourHours = ({
  startHour = 1,
  skipFirst = false,
  startMints = 0,
}) => {
  let dates = [];

  let currentDate = dayjs().startOf('day');
  let start = currentDate.set('hour', startHour).set('minute', startMints).set('second', 0);
  const end = start.add(24, 'hour'); // Set end time as 24 hours from the start

  if (skipFirst) {
    start = start.add(30, 'minute');
  }

  while (start.isBefore(end) || start.isSame(end)) {
    const intervaledTime = start.format('hh:mm A');

    dates = [
      ...dates,
      {
        value: intervaledTime,
        label: intervaledTime,
      },
    ];

    start = start.add(30, 'minute');
  }

  return dates;
};

export const clearCookies = () =>
  document.cookie
    .split(';')
    .forEach(
      (cookie) =>
        (document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`)),
    );

export const scrollToInValidField = () => {
  setTimeout(() => {
    let element = document.querySelector('.Mui-error');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};

export const getStartAndEndOfMonth = (date) => {
  // Ensure the input is a Date object
  const inputDate = new Date(date);

  // Set the date to the first day of the month in UTC
  const startDate = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), 1));

  // Set the date to the last day of the month in UTC
  const lastDay = new Date(Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth() + 1, 0));
  const endDate = new Date(
    Date.UTC(
      lastDay.getUTCFullYear(),
      lastDay.getUTCMonth(),
      lastDay.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  // Format dates to ISO strings
  const startISOString = startDate.toISOString();
  const endISOString = endDate.toISOString();

  return { start: startISOString, end: endISOString };
};

export const listStatusHandler = (status, t, getLabel) => {
  const statusEnum = {
    onTime: { title: t('status.onTime'), color: 'warning' },
    lateStarted: { title: t('status.lateStarted'), color: 'warning' },
    present: { title: t('status.present'), color: 'success' },
    onLeave: { title: t('status.onLeave'), color: 'error' },
    absent: { title: t('status.absent'), color: 'error' },
    dedicated: { title: getLabel('terms', 'dedicated'), color: 'primary' },
    patrol: { title: getLabel('terms', 'patrol', t), color: 'primary' },
    earlyLeft: { title: t('status.earlyLeft'), color: 'warning' },
    dispatch: { title: t('status.dispatch'), color: 'error' },
    completed: { title: t('status.completed'), color: 'success' },
    extra: { title: t('status.extra'), color: 'success' },
    escalated: { title: t('status.escalated'), color: 'error' },
    leaveApproved: { title: t('status.leaveApproved'), color: 'success' },
    missedCheckpoint: { title: t('status.missedCheckpoint'), color: 'error' },
    missedReport: { title: t('status.missedReport'), color: 'error' },
    overTime: { title: t('status.overTime'), color: 'primary' },
    notStarted: { title: t('status.notStarted'), color: 'error' },
    breakStarted: { title: t('status.breakStarted'), color: 'primary' },
    breakEnded: { title: t('status.breakEnded'), color: 'primary' },
    shiftStarted: { title: t('status.shiftStarted'), color: 'primary' },
    shiftEnded: { title: t('status.shiftEnded'), color: 'success' },
    leaveApplied: { title: t('status.leaveApplied'), color: 'primary' },
    lateShiftStarted: { title: t('status.lateShiftStarted'), color: 'error' },
    earlyShiftStarted: { title: t('status.earlyShiftStarted'), color: 'primary' },
    leaveRejected: { title: t('status.leaveRejected'), color: 'error' },
    pendingApproval: { title: t('status.pendingApproval'), color: 'warning' },
    approved: { title: t('status.approved'), color: 'success' },
    rejected: { title: t('status.rejected'), color: 'error' },
    pending: { title: t('status.pending'), color: 'warning' },
    deleted: { title: t('status.deleted'), color: 'error' },
    // Status for sites
    functional: { title: t('status.functional'), color: 'success' },
    nonFunctional: { title: t('status.nonFunctional'), color: 'error' },
    requiresAttention: { title: t('status.requiresAttention'), color: 'error' },
    // Status for Reports
    accepted: { title: t('status.accepted'), color: 'success' },
    notSubmitted: { title: t('status.notSubmitted'), color: 'warning' },
    checked_out: { title: t('status.checked_out'), color: 'error' },
    checked_in: { title: t('status.checked_in'), color: 'success' },
    in_bound: { title: t('status.in_bound'), color: 'success' },
    out_bound: { title: t('status.out_bound'), color: 'success' },
  };

  return statusEnum[status];
};

export const shiftTypeEnumValue = (type) => {
  const shiftTypeEnum = {
    dedicated: 'Dedicated',
    patrol: 'Patrol',
    hybrid: 'Hybrid',
    extra: 'Extra',
    dispatch: 'Dispatch',
  };
  return shiftTypeEnum[type];
};

export const deepEqual = (obj1, obj2, ignoredKey = 'status') => {
  if (!obj1 || !obj2) {
    return obj1 === obj2;
  }
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }
  const keys1 = Object.getOwnPropertyNames(obj1);
  const keys2 = Object.getOwnPropertyNames(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (key === ignoredKey) {
      continue;
    }
    const val1 = obj1[key];
    const val2 = obj2[key];
    if (val1 === null || val2 === null) {
      if (val1 !== val2) {
        return false;
      }
    } else if (!keys2.includes(key) || !deepEqual(val1, val2, ignoredKey)) {
      return false;
    }
  }
  return true;
};

export const validateParamForMockApi = (req) => {
  return (
    !req?.params?.id ||
    req.params.id === 'undefined' ||
    req.params.id === 'null' ||
    req.params.id === ':id'
  );
};

export const getCount = (count) => {
  if (!count) return ('0' + 0).slice(-2);
  return ('0' + count).slice(-2);
};

/**
 * remove keys from the object
 */
export const removeKeysFromObject = (object, keysToRemove) => {
  const result = { ...object };
  keysToRemove.forEach((key) => delete result[key]);
  return result;
};

export const setSideBarData = (
  response,
  queryParams,
  setItems,
  setQueryParams,
  setTotalRecords,
  keyVal,
) => {
  if (queryParams?.search && queryParams?.page === 1) {
    setItems(response?.data?.[keyVal]);
  } else if (!queryParams?.search && queryParams?.page === 1) {
    setItems(() => response?.data?.[keyVal]);
  } else {
    setItems((prev) => {
      return [...prev, ...(response?.data?.[keyVal] ?? [])];
    });
  }

  if (response?.pagination) {
    setQueryParams((prev) => ({
      ...prev,
      page: response?.pagination?.currentPage,
    }));

    const total = response?.pagination?.totalCount;

    setTotalRecords(total);
    return;
  }

  if (response?.data?.pagination) {
    setQueryParams((prev) => ({
      ...prev,
      page: response?.data?.pagination?.currentPage,
    }));

    const total = response?.data?.pagination?.totalCount;

    setTotalRecords(total);
  }
};

/**
 * @description helper function to return the place relative name
 * @param {String} placeTypeKey
 */
const findPlaceFromKey = (placeTypeKey) => placesMap[placeTypeKey];

/**
 * @description get location details from placeId
 * @param {String} placeId
 * @returns
 */
export const getPlacesDetail = async (placeId) => {
  try {
    const div = document.createElement('div');
    div.id = 'leads-map-div';
    const map = new google.maps.Map(div, {
      center: { lat: -33.866, lng: 151.196 },
      zoom: 15,
    });
    const request = {
      placeId: placeId,
      fields: [
        'name',
        'formatted_address',
        'place_id',
        'geometry',
        'icon',
        'address_components',
        'adr_address',
        'business_status',
        'formatted_address',
        'geometry',
        'icon',
        'icon_mask_base_uri',
        'icon_background_color',
        'name',
        'photos',
        'place_id',
        'plus_code',
        'type',
        'url',
        'vicinity',
        'wheelchair_accessible_entrance',
        'formatted_phone_number',
        'international_phone_number',
        'website',
      ],
    };
    const service = new google.maps.places.PlacesService(map);
    return new Promise((resolve, reject) => {
      service.getDetails(request, (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry &&
          place.geometry.location
        ) {
          let res = place;
          if (place?.types?.length) {
            res.type = findPlaceFromKey(place?.types?.[0]);
          }
          resolve(res);
        } else {
          reject('No place found');
        }
      });
    });
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
};

export const formatNumberToKMBT = (number) => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];

  if (number >= 10000) {
    let suffixIndex = 0;
    while (number >= 1000 && suffixIndex < suffixes.length - 1) {
      number /= 1000;
      suffixIndex++;
    }

    return number?.toFixed(1) + suffixes[suffixIndex];
  } else {
    return number?.toString();
  }
};

export const convertFileSize = (sizeInBytes) => {
  if (typeof sizeInBytes !== 'number' || isNaN(sizeInBytes)) {
    return 'Invalid size';
  }

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  let i = 0;
  while (sizeInBytes >= 1024 && i < units.length - 1) {
    sizeInBytes /= 1024;
    i++;
  }

  return sizeInBytes.toFixed(2) + ' ' + units[i];
};

export const truncateString = (str = '', maxLength = 75) => {
  if (str?.length <= maxLength) {
    return str; // No truncation needed if string is shorter or equal to maxLength
  }

  const omissionLength = 3; // Length of the ellipsis (...)
  const firstChars = Math.min(10, Math.floor(maxLength / 2)); // Ensure at least 10 first characters
  const lastChars = Math.min(10, Math.floor(maxLength / 2)); // Ensure at least 10 last characters
  const middleLength = maxLength - firstChars - lastChars - omissionLength;

  const midpoint = Math.floor(str.length / 2);
  const truncatedStart = str.slice(0, midpoint - Math.floor(middleLength / 2));
  const truncatedEnd = str.slice(midpoint + Math.ceil(middleLength / 2));

  return `${truncatedStart}...${truncatedEnd}`;
};

export const isSameDate = (startDate, endDate) => {
  return startDate?.isSame(endDate, 'day');
};
export const isSameDay = (startsAt, endsAt) => {
  const startTime = dayjs(startsAt).utc().format('HH:mm');
  const endTime = dayjs(endsAt).utc().format('HH:mm');
  return startTime !== endTime && endTime > startTime;
};

export const delay = async (delay) => await new Promise((resolve) => setTimeout(resolve, delay)); // 3 sec

export const checkIfTimeIsPassedAlready = (date, dayjsDateTime) => {
  // Check if the selected date is today. If true, then check if the selected time is in the past.
  return (
    dayjs(date).isSame(dayjs(), 'day') && // Check if the start date is today
    dayjs(dayjsDateTime).isBefore(dayjs(), 'minute')
  );
};

export const checkIfTimeIsSame = (startTime, endTime) => {
  return dayjs(startTime).format('HH:mm:ss') === dayjs(endTime).format('HH:mm:ss');
};

export const selectedDatesToUTC = (selectedDates = []) => {
  return selectedDates?.map((date) => date?.utc()?.format());
};

export const startAndEndDateFilterWithUTCTime = (selectedDates = []) => {
  // return selectedDates?.map(date => {
  //   if ()
  // })
  //     ? params?.selectedDates?.[0]?.set('hour', 23).set('minute', 59)?.utc()?.toISOString()
  return [
    selectedDates?.[0]?.set('hour', 0)?.set('minute', 0)?.utc()?.toISOString(),
    selectedDates?.[1]?.set('hour', 24)?.set('minute', 0)?.utc()?.toISOString(),
  ];
};

export const calculateRemainingTime = (endsAt, t, isUTC = true) => {
  let res = '';
  let tDay = t('commonText.day');
  let tHour = t('commonText.hour');
  let tMinute = t('commonText.minute');
  // Get the current UTC time
  const now = dayjs().utc();

  // Parse the endsAt time
  const endTime = isUTC ? dayjs(endsAt) : dayjs.utc(endsAt);
  // Calculate the duration between the two times
  const remainingTime = dayjs.duration(endTime.diff(now));

  // Extract days, hours, minutes, and seconds
  const days = remainingTime.days();
  if (days > 1) {
    tDay = t('commonText.days');
  }
  if (days > 0) {
    res = `${days} ${tDay} `;
  }

  const hours = remainingTime.hours();
  if (hours > 1) {
    tHour = t('commonText.hours');
  }

  if (hours > 0) {
    res = `${res} ${hours} ${tHour} `;
  }

  const minutes = remainingTime.minutes();
  if (minutes > 1) {
    tMinute = t('commonText.minutes');
  }

  if (minutes > 0) {
    res = `${res} ${minutes} ${tMinute} `;
  }
  return res ? res : t('commonText.nA');
};

export const generateInitialValues = (sectionsAttributes) => {
  let initialValues = {};

  sectionsAttributes?.forEach((section, _sectionIndex) => {
    section?.questionsAttributes?.forEach((question, _questionIndex) => {
      initialValues[question.id] = question?.answers ?? '';
      if (question?.responseTypeLabel?.toLowerCase() === enumResponseType.multiselect) {
        initialValues[question.id] = question?.answers ?? [];
      }
    });
  });

  return { initialValues };
};

export const removeNotRequiredKeys = (data, template) => {
  let dataToBeValidated = {};

  template?.sectionsAttributes.forEach((section) => {
    section?.questionsAttributes?.forEach((question) => {
      if (question.required) {
        dataToBeValidated[question.id] = data[question.id];
      }
    });
  });

  return dataToBeValidated;
};

export const generateURLFromObject = (
  obj,
  accessToken,
  containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME,
) => {
  const baseURL = process.env.REACT_APP_AZURE_ACCOUNT_URL;

  return `${baseURL}/${containerName}/${obj?.filename}?${accessToken}`;
};

export const generateAzureStorageBlobToken = async () => {
  return 'mock-sas-token=design-demo&se=2099-01-01';
};

export const uploadAssetsToAzureStorageBlob = async ({
  payload,
  uploadProgressCallBack,
  containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME,
  saasToken = undefined,
  cancelToken,
}) => {
  const timestamp = new Date().getTime();
  const date = new Date().getDate();
  const hours = new Date().getHours();
  let fileName;

  const extensionGet = /(?:\.([^.]+))?$/;

  if (payload.fileName) {
    const extension = extensionGet.exec(payload.fileName)[1];
    fileName = `${timestamp}-${date}-${hours}_${generateUniqueId()}.${extension}`;
  } else if (payload.name) {
    const extension = extensionGet.exec(payload.name)[1];
    fileName = `${timestamp}-${date}-${hours}_${generateUniqueId()}.${extension}`;
  } else {
    fileName = `${timestamp}_${generateUniqueId()}.png`;
  }

  fileName = fileName.trim();

  if (cancelToken?.reason) {
    throw new Error('Upload cancelled');
  }

  uploadProgressCallBack?.(50);
  await new Promise((resolve) => setTimeout(resolve, 120));
  uploadProgressCallBack?.(100);

  let sizeInBytes = 0;
  let imgUrl = 'https://via.placeholder.com/300';

  if (isObject(payload) && payload instanceof Blob) {
    imgUrl = URL.createObjectURL(payload);
    sizeInBytes = payload.size;
  } else if (isObject(payload) && payload?.size) {
    sizeInBytes = payload.size;
    if (payload instanceof File) {
      imgUrl = URL.createObjectURL(payload);
    }
  } else if (!isObject(payload)) {
    imgUrl = typeof payload === 'string' && payload.startsWith('data:') ? payload : imgUrl;
    const base64Content = String(payload).split(',')[1] || payload;
    const binaryString = atob(base64Content);
    const byteArray = new Uint8Array([...binaryString].map((char) => char.charCodeAt(0)));
    sizeInBytes = byteArray.length;
  }

  const baseURL = process.env.REACT_APP_AZURE_ACCOUNT_URL || 'https://mock-storage.local';
  const accessToken = saasToken || (await generateAzureStorageBlobToken());
  const endPoint = `${baseURL}/${containerName || 'demo'}/${fileName}?${accessToken}`;

  return {
    key: fileName,
    contentType:
      payload?.type === 'image/jpg' ? 'image/jpeg' : payload?.type ? payload.type : 'image/png',
    byteSize: payload?.fileSize ? payload.fileSize : payload?.size ? payload.size : sizeInBytes,
    filename: fileName,
    imgUrl: imgUrl || endPoint,
  };
};

export const uploadAllAssetsToAzureStorageBlob = async ({
  assets,
  uploadProgressCallBack,
  cancelTokens = [],
  presetToken,
}) => {
  try {
    const saasToken = presetToken
      ? presetToken
      : await generateAzureStorageBlobToken({
          permissions: ['w', 'r', 'd'],
        });
    const results = await Promise.allSettled(
      assets.map((asset, _index) => {
        if (!asset?.alreadyUploaded) {
          const source = {
            token: { reason: null },
            cancel: (reason) => {
              source.token.reason = reason;
            },
          };
          cancelTokens?.push(source);
          return uploadAssetsToAzureStorageBlob({
            payload: asset,
            saasToken,
            uploadProgressCallBack,
            cancelToken: source.token,
          });
        } else {
          return asset;
        }
      }),
    );
    let successfullyUploaded = [];
    let needsReupload = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        // Handle successful upload (result.value contains the result)
        console.log(`Asset ${index} uploaded successfully:`, result.value);

        successfullyUploaded.push(result.value);
      } else {
        console.error(`Asset ${index} upload failed:`, result.reason);
        console.error(`Asset ${index} upload failed:`, assets[index]);
        needsReupload.push(assets[index]);
      }
    });
    return {
      successfullyUploaded: successfullyUploaded,
      needsReupload: needsReupload,
    };
  } catch (error) {
    console.error('Error uploading assets:', error);
  }
};

export const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const convertFileToBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const convertBase64ToBuffer = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const assignTheAnswers = async ({
  value,
  reportData,
  setUploadProgress,
  setIsUploading,
  setFailedToUpload,
  saasToken = null,
  t,
}) => {
  let copyData = { ...reportData }; // Shallow copy
  let totalFiles = 0;
  let completedFiles = 0;
  setUploadProgress(0);

  // eslint-disable-next-line no-unsafe-optional-chaining
  for (const [_sectionIndex, section] of copyData?.sectionsAttributes?.entries()) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    for (const [_questionIndex, question] of section?.questionsAttributes?.entries()) {
      const fieldName = question?.id;

      if (
        question.responseType == enumResponseType.imageVideo ||
        question.responseType == enumResponseType.webCam ||
        question.responseType == enumResponseType.attachments
      ) {
        if (value[fieldName] && value[fieldName]?.length > 0) {
          totalFiles += value[fieldName].length;
        }
      }
    }
  }

  // images in dispatch report cannot exceed from 4
  if (reportData?.templateableType === SCHEDULE_DUTIES.DISPATCH && totalFiles > 20) {
    return { error: t('obx.templates.edit.error.fileLength') };
  }

  setIsUploading(true);
  // eslint-disable-next-line no-unsafe-optional-chaining
  for (const [sectionIndex, section] of copyData?.sectionsAttributes?.entries()) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    for (const [_questionIndex, question] of section?.questionsAttributes?.entries()) {
      const fieldName = question?.id;

      if (
        question.responseType == enumResponseType.imageVideo ||
        question.responseType == enumResponseType.webCam ||
        question.responseType == enumResponseType.attachments ||
        question.responseType == enumResponseType.signature
      ) {
        if (value[fieldName] && value[fieldName]?.length > 0) {
          const result = await uploadAllAssetsToAzureStorageBlob({
            assets:
              question.responseType == enumResponseType.webCam ||
              question.responseType == enumResponseType.signature
                ? value[fieldName]?.[0]?.alreadyUploaded &&
                  question.responseType == enumResponseType.signature
                  ? value[fieldName]
                  : [value[fieldName]]
                : value[fieldName],
            uploadProgressCallBack: (progress) => {
              if (progress === 100) {
                ++completedFiles;
                setUploadProgress(Math.floor(((completedFiles * 100) / (totalFiles * 100)) * 100));
              } else {
                if (completedFiles > 0) {
                  setUploadProgress(
                    Math.floor(((completedFiles * 100 + progress) / (totalFiles * 100)) * 100),
                  );
                } else {
                  setUploadProgress(Math.floor((progress / (totalFiles * 100)) * 100));
                }
              }
            },
            cancelTokens: [],
            presetToken: saasToken,
          });
          if (result.needsReupload.length > 0) {
            let failed = [];
            result?.needsReupload?.map((e) => {
              failed.push({ sectionIndex, ...e });
            });
            setFailedToUpload((prev) => [...prev, ...failed]);
          }

          if (question.responseType == enumResponseType.webCam) {
            question.answers = result.successfullyUploaded[0];
          } else {
            question.answers = result.successfullyUploaded;
          }
        } else {
          question.answers = value[fieldName];
        }
      } else {
        question.answers = value[fieldName];
      }
    }
  }

  return copyData;
};

export const generateRandomNumbers = () => {
  let minm = 10000;
  let maxm = 99999;
  return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
};

export const decode = (t = []) => {
  let points = [];
  for (let step of t) {
    let encoded = step?.polyline?.points || step;
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;
    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
  }
  return points;
};

/**
 * @description Get random color
 * @returns
 */
export const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const hitIdKey = (id) => (id == null || id === '' ? null : String(id));

/** Stable id for matching visit rows (hit, missed, dispatch). */
export const visitRowIdKey = (h) => hitIdKey(h?.hitId ?? h?.missedHitId ?? h?.dispatchId);

/**
 * Order visitSet like view/template hits: walk template (state.hits) order, keep only
 * rows still in visitSet, skip removed ids; append hits not on template (newly added).
 */
export const visitSetInViewOrder = (visitSet, templateHits, removedIdsSet) => {
  if (!Array.isArray(visitSet) || visitSet.length === 0) {
    return visitSet;
  }
  const removed = removedIdsSet instanceof Set ? removedIdsSet : new Set(removedIdsSet || []);
  const visitByKey = new Map(visitSet.map((v) => [visitRowIdKey(v), v]).filter(([k]) => k != null));
  const ordered = [];
  const seen = new Set();

  for (const h of templateHits || []) {
    const k = visitRowIdKey(h);
    if (!k || removed.has(k)) continue;
    const row = visitByKey.get(k);
    if (row) {
      ordered.push(row);
      seen.add(k);
    }
  }
  for (const v of visitSet) {
    const k = visitRowIdKey(v);
    if (!k || seen.has(k) || removed.has(k)) continue;
    ordered.push(v);
    seen.add(k);
  }
  return ordered.length ? ordered : visitSet;
};

/**
 * @description Helper function to map the response of runsheet API
 * @param {*} data
 * @returns
 */
export const mapRunSheetData = (data) => {
  let hitsWithUniqueKeys = data?.hits || [];
  if (typeof data?.hits === 'object') {
    hitsWithUniqueKeys = data?.hits?.map((data) => ({ ...data, uniqueId: generateUniqueId() }));
  }

  return {
    ...data,
    hits: hitsWithUniqueKeys,
    visitSet: hitsWithUniqueKeys,
    startEndLocation: {
      ...data?.startEndLocation,
      position: {
        lng: data?.startEndLocation?.lng,
        lat: data?.startEndLocation?.lat,
      },
    },
    pathData: (() => {
      let result = [];
      let apiData = data?.pathData || [];
      for (let i = 0; i < apiData.length; i++) {
        result[i] = { ...apiData[i], mapPath: decode(apiData[i]?.mapPath) };
        if (i) {
          let index = i - 1;
          let finalData = hitsWithUniqueKeys[index];
          result[i] = {
            ...result[i],
            ...finalData,
            name: finalData?.siteName || finalData?.name,
            siteName: finalData?.siteName || finalData?.name,
          };
        }
      }
      if (result?.length && result?.[0]?.hitId) result[0].hitId = null;
      return result;
    })(),
  };
};
export const containsSegmentInCurrentUrl = (segment) => {
  try {
    // Ensure the segment is a valid string
    if (typeof segment !== 'string') {
      throw new Error('The segment must be a string.');
    }
    // Get the current URL from window.location.href
    const currentUrl = window?.location?.href;
    // Check if the current URL contains the specified segment
    return currentUrl.includes(segment);
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

/**
 * Extracts key from query parameters of the URL.
 *
 * @param {string} paramName - The name of the query parameter to extract.
 * @returns {object} - A string containing the extracted query parameter.
 */
export const getKeyFromUrlQueryParam = (paramName) => {
  const urlQueryParams = new URLSearchParams(window.location.search);
  return urlQueryParams.get(paramName);
};

export const assignDateToTimeZoneWithStartAndEndsAt = (oldDate, endOf = false) => {
  const convertOldDateToDayjs = dayjs(oldDate);

  const newDate = dayjsWithStandardOffset()
    .month(convertOldDateToDayjs?.get('month'))
    .date(convertOldDateToDayjs?.get('date'))
    .year(convertOldDateToDayjs?.get('year'));

  if (endOf) {
    newDate.endOf('day');
  }

  return newDate.startOf('day');
};

export const convertMetersToMiles = (meters) => (meters * 0.00062137119223733).toFixed(1);

export const convertMetersToKilometers = (meters) => (meters / 1000).toFixed(1);

const MAX_WAYPOINTS = 23;

export const calculateAndDisplayRouteUtils = async (origin, waypoints, t, destination) => {
  const appState = store.getState();

  const tenantLabels = appState?.tenantConfigs?.labels;

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const segments = [];
    let chunksCoordinates = [];
    let chunksPolyline = [];

    const directionsService = new google.maps.DirectionsService();
    if (!directionsService) {
      return Promise.reject(new Error('Directions service not available'));
    }

    // Split waypoints into segments
    for (let i = 0; i < waypoints.length; i += MAX_WAYPOINTS) {
      const segment = waypoints.slice(i, i + MAX_WAYPOINTS);
      segments.push(segment);
    }

    const getRouteForSegment = (segment, segmentIndex) => {
      return new Promise((segmentResolve, segmentReject) => {
        const segmentsOrigin =
          segmentIndex === 0
            ? {
                lat: origin?.start_location?.lat || origin?.position?.lat || origin?.lat,
                lng: origin?.start_location?.lng || origin?.position?.lng || origin?.lng,
              }
            : {
                lat:
                  segments[segmentIndex - 1][MAX_WAYPOINTS - 1]?.end_location?.lat ||
                  segments[segmentIndex - 1][MAX_WAYPOINTS - 1]?.position?.lat,
                lng:
                  segments[segmentIndex - 1][MAX_WAYPOINTS - 1]?.end_location?.lng ||
                  segments[segmentIndex - 1][MAX_WAYPOINTS - 1]?.position?.lng,
              };

        directionsService.route(
          {
            origin: new google.maps.LatLng(segmentsOrigin.lat, segmentsOrigin.lng),
            destination: new google.maps.LatLng(
              destination?.position?.lat ||
                origin?.start_location?.lat ||
                origin?.position?.lat ||
                origin?.lat,
              destination?.position?.lng ||
                origin?.start_location?.lng ||
                origin?.position?.lng ||
                origin?.lng,
            ),
            waypoints: segment.map((waypoint) => ({
              location: new google.maps.LatLng(
                waypoint?.start_location?.lat || waypoint?.position?.lat,
                waypoint?.start_location?.lng || waypoint?.position?.lng,
              ),
              stopover: true,
            })),
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              const legs = response.routes[0]?.legs || [];
              let visitSetPolyLines = [];
              let mapPolyLineArray = [];
              let totalDistance = 0;
              let totalDuration = 0;
              let latLngs = [];

              legs.forEach((leg, _i) => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
              });
              legs.forEach((leg, i) => {
                const steps = leg.steps || [];
                mapPolyLineArray[i] = decode(steps);
                latLngs[i] = steps?.map((step) => step.polyline.points);

                const calculatedIndex = MAX_WAYPOINTS * segmentIndex + i;
                const previousChunkEnd =
                  calculatedIndex === 0 ? origin : waypoints[calculatedIndex - 1];

                visitSetPolyLines.push({
                  ...(calculatedIndex === 0 ? origin : previousChunkEnd),
                  distance: leg.distance,
                  duration: leg.duration,
                  name: waypoints[calculatedIndex]?.name || previousChunkEnd?.name,
                  siteName: waypoints[calculatedIndex]?.siteName || previousChunkEnd?.siteName,
                  hitId: waypoints[calculatedIndex]?.hitId || previousChunkEnd?.hitId,
                  isStartEnd: calculatedIndex === 0,
                  start_location: {
                    lat: leg.start_location.lat(),
                    lng: leg.start_location.lng(),
                  },
                  end_location: {
                    lat: leg.end_location.lat(),
                    lng: leg.end_location.lng(),
                  },
                  totalDistance,
                  totalDuration,
                  mapPath: latLngs[i],
                  isVisited: null,
                  status: null,
                  isSelected: null,
                });
              });

              segmentResolve({ mapPolyLineArray, visitSetPolyLines });
            } else {
              segmentReject(new Error(`Failed to fetch route: ${status}`));
            }
          },
        );
      });
    };

    try {
      const results = await Promise.all(
        segments.map((segment, i) => getRouteForSegment(segment, i)),
      );

      // Consolidate results
      results.forEach(({ mapPolyLineArray, visitSetPolyLines }) => {
        chunksPolyline = [...chunksPolyline, ...mapPolyLineArray];
        chunksCoordinates = [...chunksCoordinates, ...visitSetPolyLines];
      });

      resolve({ mapPolyLineArray: chunksPolyline, visitSetPolyLines: chunksCoordinates });
    } catch (error) {
      const errorMessage =
        error === directionServiceErrors.invalidRequest
          ? t('obx.runsheet.invalidRouteError')
          : t('obx.runsheet.noRouteFoundError', {
              hits: tenantLabels?.terms?.hits,
            });
      return reject({ e: errorMessage });
    }
  });
};

export const formatDeviceTypeName = (name) => {
  if (name?.toLowerCase() === deviceTypeEnum.beacon?.toLowerCase()) {
    return 'Beacon';
  } else if (name?.toLowerCase() === deviceTypeEnum.image?.toLowerCase()) {
    return 'Image';
  } else if (
    name?.toLowerCase() === deviceTypeEnum.gps?.toLowerCase() ||
    name?.toLowerCase() === deviceTypeEnum.nfc?.toLowerCase() ||
    name?.toLowerCase() === deviceTypeEnum.qrCode?.toLowerCase()
  ) {
    return name.toUpperCase();
  } else {
    return name;
  }
};

export const formatRunSheetTime = (hours, minutes) => {
  if (Number(hours) === 0) {
    return `${minutes} min`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
};

export const convertRunSheetMinutesToHoursAndMinutes = (seconds) => {
  if (seconds) {
    // Convert seconds to minutes (without rounding)
    const totalMinutes = seconds / 60;

    // Calculate hours (floor to get whole hours)
    const hours = Math.floor(totalMinutes / 60);

    // Calculate remaining minutes
    const remainingMinutes = Math.floor(totalMinutes % 60);

    // Return formatted time
    return formatRunSheetTime(hours, remainingMinutes);
  }
};

/**
 * @description genrate a unique hash for a given timeStamp
 * @returns String
 */
export const createUniqueHash = () => {
  // Get current timestamp in milliseconds
  const timestamp = Date.now();

  // Add some randomness using Math.random()
  const randomPart = Math.floor(Math.random() * 1000000);

  // Combine timestamp and random part
  const combined = timestamp + randomPart;

  // Convert to base64 encoding
  const encoded = Buffer.from(combined.toString()).toString('base64');

  // Remove special characters
  const cleaned = encoded.replace(/[^A-Za-z0-9]/g, '');

  return cleaned;
};

/**
 * @description Append the start end location's UUID to the last item of the pathData
 * @param {*} state
 * @param {*} uuID
 * @returns
 */
export const updateLastItemWithUniqueId = (state, uuID) => {
  try {
    if (!state || !state.pathData || state.pathData.length === 0) {
      console.warn('Invalid state or pathData');
      return [];
    }

    const updatedPathData = [...state.pathData];
    updatedPathData[updatedPathData.length - 1] = {
      ...updatedPathData[updatedPathData.length - 1],
      hitId: uuID,
    };

    return updatedPathData;
  } catch (error) {
    console.error('Error updating last item with UUID:', error);
    return [];
  }
};

export const calculatePercentage = (value, total) => {
  if (value == null || total == null || total === 0) {
    return 0;
  }
  const percentage = (value / total) * 100;
  return isFinite(percentage) ? percentage : 0;
};

export const adjustDateIfMoreThanTwoDaysApart = (date1Str, date2Str) => {
  const date1 = dayjs(date1Str);
  const date2 = dayjs(date2Str);

  const differenceInHours = date2.diff(date1, 'hour');

  // Check if the difference is greater than 24 hours
  // If the difference is more than 2 days, subtract one day from date2
  const adjustedDate = differenceInHours > 24 ? date2.subtract(1, 'day') : date2;

  return adjustedDate.toISOString();
};

/**
 * @description convert minutes into format
 * @param {*} minutes
 * @returns
 */
export const formatTimeFromMinutes = (minutes) => {
  if (minutes < 60) {
    return `${minutes} mins`;
  } else {
    const hours = Math.floor(minutes / 60);
    return `${hours} hours`;
  }
};

/**
 * @description  Merges two objects by concatenating arrays for matching keys
 * @param {*} minutes
 * @returns
 */
export const mergeObjects = (obj1, obj2) => {
  const merged = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  allKeys.forEach((key) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Check if both values are arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
      merged[key] = [...val1, ...val2];
    }
    // If only first value is array
    else if (Array.isArray(val1)) {
      merged[key] = val2 ? [...val1, val2] : val1;
    }
    // If only second value is array
    else if (Array.isArray(val2)) {
      merged[key] = val1 ? [val1, ...val2] : val2;
    }
    // If neither is an array, prefer obj2's value if it exists
    else {
      merged[key] = val2 ?? val1;
    }
  });

  return merged;
};

export const checkACLPermission = (aclPermissions, routePermission) => {
  try {
    let hasPermission = null;
    const paths = routePermission.split('.');

    // Traverse the permissions object
    let currentLevel = aclPermissions;
    for (const path of paths) {
      currentLevel = currentLevel?.[path];

      // If we can't find the next level, return false
      if (currentLevel === undefined) {
        hasPermission = false;
      }
    }

    if (currentLevel) {
      hasPermission = true;
    }

    // If the final level is an object with CRUD actions
    if (typeof currentLevel === 'object') {
      hasPermission = true;
    }
    return hasPermission;
  } catch (e) {
    console.error({ e: e.message, aclPermissions, routePermission });
  }
};

export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const sortObjectByKey = (obj) => {
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const sorted = Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectByKey(obj[key]);
        return acc;
      }, {});
    return sorted;
  }
  return obj;
};

export const formatTimeToHandM = (decimalHours) => {
  let hours = 0;
  let minutes = 0;
  const totalMinutes = Math.round(decimalHours * 60); // Convert to minutes
  const hoursE = Math.floor(totalMinutes / 60);
  const minutesE = totalMinutes % 60;
  if (hoursE > 0) {
    hours = hoursE;
  }
  if (minutesE > 0) {
    minutes = minutesE;
  }

  return `${hours}h ${minutes}m`;
};

export const convertJoiErrorsToArrayOfObjects = (errorMessages) => {
  const result = [];

  for (const [key, value] of Object.entries(errorMessages)) {
    const match = key.split(',');
    if (match) {
      // const [_, index, attribute] = match;
      const [_, sectionIndex, attribute, nestedIndex, nestedKey] = match;

      const secIdx = parseInt(sectionIndex, 10); // Use section index as is (0-based)
      if (!result[secIdx]) result[secIdx] = {}; // Ensure the object exists

      if (nestedIndex && nestedKey) {
        // Handle nested attributes
        if (!result?.[secIdx]?.[attribute]) result[secIdx][attribute] = [];
        const quesIdx = parseInt(nestedIndex, 10);

        if (!result[secIdx][attribute]?.[quesIdx]) result[secIdx][attribute][quesIdx] = {}; // // Ensure the nested object exists

        // Assign the nested key
        result[secIdx][attribute][quesIdx][nestedKey] = value;
      } else {
        // Handle regular attributes
        result[secIdx][attribute] = value;
      }
    }
  }

  return result;
};
export const convertErrorsToJoiObject = (errors) => {
  const result = {};

  errors?.forEach((error, index) => {
    if (!error) return;

    const sectionIndex = index;
    for (const [key, value] of Object.entries(error)) {
      if (Array.isArray(value)) {
        value.forEach((nestedItem, nestedIndex) => {
          if (!nestedItem) return; // Skip if the nested item is undefined

          for (const [nestedKey, nestedValue] of Object.entries(nestedItem)) {
            result[`sectionsAttributes,${sectionIndex},${key},${nestedIndex},${nestedKey}`] =
              nestedValue;
          }
        });
      } else {
        // for one level errors
        result[`sectionsAttributes,${sectionIndex},${key}`] = value;
      }
    }
  });

  return result;
};

export const updateSearchParams = (params, history) => {
  const searchParams = new URLSearchParams(location.search);

  if (Array.isArray(params)) {
    for (let i = 0; i < params.length; i++) {
      const { key, value } = params[i];
      searchParams.set(key, value);
    }
  } else {
    const { key, value } = params;
    searchParams.set(key, value);
  }

  history?.replace({ search: searchParams?.toString() });
};

export function isAzureTokenExpired(token, bufferDays = 1) {
  // Extract the expiry time (se parameter)
  const match = token.match(/(?:\?|&)se=([^&]+)/);
  if (!match) {
    throw new Error('Expiry time (se) not found in token');
  }

  // Parse expiry date in UTC
  const expiryDate = new Date(match[1]);
  if (isNaN(expiryDate.getTime())) {
    throw new Error('Invalid expiry date format in token');
  }

  // Current time
  const now = new Date();

  // Time difference in milliseconds
  const timeDiff = expiryDate - now;

  // Convert to days
  const daysRemaining = timeDiff / (1000 * 60 * 60 * 24);

  // Return true if already expired OR less than bufferDays remaining
  return daysRemaining <= bufferDays;
}

export const downloadFileFromResponse = (response, fileName) => {
  const url = URL.createObjectURL(response);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Checks if a value is a valid float number
 * Handles: number type, numeric strings, NaN, null, undefined
 */
export const isFloat = (value) => {
  if (value === null || value === undefined) return false;

  // Convert numeric strings to numbers
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

  // Check if it's a finite number and not an integer
  return typeof number === 'number' && Number.isFinite(number) && !Number.isInteger(number);
};

export const formatLabel = (value = '') => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const DEMO_TENANT_KEY = 'demoTenant';

export const DEMO_TENANT_OPTIONS = [
  { value: 'filter-go.com', label: 'Filter Go' },
  { value: 'teamsignal.com', label: 'Signal' },
];

export const isLocalDemo = () => process.env.REACT_APP_NODE_ENV === 'localhost';

export const setDemoTenant = (tenant) => {
  if (!isLocalDemo()) return;
  localStorage.setItem(DEMO_TENANT_KEY, tenant);
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (persistRoot) {
      const parsed = JSON.parse(persistRoot);
      if (parsed.auth) {
        const auth = JSON.parse(parsed.auth);
        auth.tenantInfo = {};
        parsed.auth = JSON.stringify(auth);
        localStorage.setItem('persist:root', JSON.stringify(parsed));
      }
    }
  } catch {
    // ignore corrupt persist payload
  }
  window.location.reload();
};

export const mainDomain = () => {
  const hostname = window.location.hostname;
  if (isLocalDemo()) {
    return localStorage.getItem(DEMO_TENANT_KEY) || process.env.REACT_APP_TENANT;
  }
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
};

export const mergeTenantBranding = (tenantConfiguration = {}) => {
  const branding = MULTI_TENANT_AUTH[mainDomain()] || {};

  return {
    permissions: tenantConfiguration.permissions,
    properties: tenantConfiguration.properties,
    ...branding,
    images: {
      logo1: branding.images?.logo1 || branding.logo,
      logoShort: branding.images?.logoShort || branding.logoShort || branding.logo,
    },
  };
};

// Check the Current Environment of the Application

export const isEUInstance = () => {
  return process.env.REACT_APP_COUNTRY === enviromnentInstances.eu;
};
/**
 * Returns support region from main domain for use in support URLs (e.g. ?region=usa).
 * .com -> usa; .eu -> germany.
 */
export const getSupportRegionFromMainDomain = async () => {
  try {
    const res = await fetch('https://api.country.is/');
    const data = await res.json();
    const country = data?.country?.toUpperCase();
    if (country === 'CA') return 'canada';
    if (country === 'DE') return 'germany';
    return 'usa';
  } catch {
    return 'usa';
  }
};

export const calculateGrandAmount = (totalAmount, discount = 0, taxAmount = 0) => {
  console.log('totalAmount', totalAmount, 'discount', discount, 'taxAmount', taxAmount);
  return Math.max(
    0,
    parseFloat(totalAmount || 0) - parseFloat(discount || 0) + parseFloat(taxAmount || 0),
  ).toFixed(2);
};
