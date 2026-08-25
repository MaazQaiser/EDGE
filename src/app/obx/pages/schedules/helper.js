import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { getKeyFromUrlQueryParam } from 'src/helper/utilityFunctions';
import store from 'src/redux/store/index';
import {
  daysOfWeekWithVal,
  franchiseIdSource,
  franchiseIdUrlQueryParam,
  rolesEnumWithName,
  timeZoneKeyUrlQueryParam,
} from 'src/utils/constants';
import { TIMEZONE_LIST } from 'src/utils/constants/timeZones';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const getUTCHoursAndMinutesWithUTCDate = (timePart, datePart) => {
  // if datePart is undefined, dayjs will automatically pick current date

  return dayjs
    .utc(datePart)
    .hour(dayjs.utc(timePart).get('h'))
    .minute(dayjs.utc(timePart).get('m'))
    .second(0)
    .millisecond(0);
};

const getAuthStateFromRedux = () => {
  // grab current state
  const state = store.getState();

  return state?.auth;
};

export const extractTimeZoneAndRoleFromRedux = () => {
  // grab auth state from redux
  const stateAuth = getAuthStateFromRedux();

  return {
    role: stateAuth?.userRole?.slug,
    timeZone: stateAuth?.franchiseTimeZone,
  };
};

const extractRoleAndFranchiseIdFromRedux = () => {
  const stateAuth = getAuthStateFromRedux();

  return {
    role: stateAuth?.userRole?.slug,
    franchiseId: stateAuth?.franchiseId,
  };
};

const checkIfUserIsHOAndUrlHasTimezoneKeyInUrl = (roleAndTimeZoneObj) => {
  /**
   * check if the URL path is HO Site Details and query params contains the key franchiseId
   * then return the key extracted from URL, else return the key from auth redux
   * */
  return !!(
    roleAndTimeZoneObj?.role === rolesEnumWithName.home_officer.slug &&
    // containsSegmentInCurrentUrl(HO_SITES_DETAIL) &&
    getKeyFromUrlQueryParam(timeZoneKeyUrlQueryParam)
  );
};

const checkIfUserIsHOAndUrlHasFranchiseIdKeyInUrl = (roleAndFranchiseIdObj) => {
  /**
   * check if query params contains the key franchiseId
   * then return the key extracted from URL, else return the key from auth redux
   * */
  return !!(
    roleAndFranchiseIdObj?.role === rolesEnumWithName.home_officer.slug &&
    getKeyFromUrlQueryParam(franchiseIdUrlQueryParam)
  );
};

const checkIfTheTimeZoneIsValid = (tz) => {
  return TIMEZONE_LIST?.find((item) => item.tzCode === tz)?.tzCode;
};

export const getTimezone = () => {
  const roleAndTimeZoneFromRedux = extractTimeZoneAndRoleFromRedux();

  if (checkIfUserIsHOAndUrlHasTimezoneKeyInUrl(roleAndTimeZoneFromRedux)) {
    return (
      checkIfTheTimeZoneIsValid(getKeyFromUrlQueryParam(timeZoneKeyUrlQueryParam)) ||
      dayjs.tz.guess()
    );
  }
  const timezone =
    // roleAndTimeZoneFromRedux?.role !== rolesEnum.homeOfficer &&
    roleAndTimeZoneFromRedux.role !== rolesEnumWithName.sales_person.slug
      ? checkIfTheTimeZoneIsValid(roleAndTimeZoneFromRedux.timeZone) || dayjs.tz.guess()
      : dayjs.tz.guess();

  return timezone;
};

export const getFranchiseIdWithRoleAndSource = () => {
  const roleAndFranchiseIdFromRedux = extractRoleAndFranchiseIdFromRedux();

  if (checkIfUserIsHOAndUrlHasFranchiseIdKeyInUrl(roleAndFranchiseIdFromRedux)) {
    return {
      [franchiseIdUrlQueryParam]: getKeyFromUrlQueryParam(franchiseIdUrlQueryParam) || null,
      source: franchiseIdSource.url,
      role: roleAndFranchiseIdFromRedux.role,
    };
  }

  return {
    [franchiseIdUrlQueryParam]: roleAndFranchiseIdFromRedux.franchiseId || null,
    source: franchiseIdSource.redux,
    role: roleAndFranchiseIdFromRedux.role,
  };
};

const convertTimeToMinutes = (timeString) => {
  const [hours, minutes] = timeString?.split(':').map(Number) ?? [];
  return hours * 60 + minutes;
};

export const dayjsWithTimezone = (date) => dayjs.tz(date, getTimezone());
export const utcDayjsWithTimezone = (date) => dayjs.utc(date).tz(getTimezone());
export const getStandardOffsetWithVariableTimeZone = (_date, timezone) =>
  convertTimeToMinutes(TIMEZONE_LIST?.find((item) => item.tzCode === timezone)?.utc);

/**
 * @description get offset for given value
 * @param {*} offsetFloat
 * @returns
 */
export const formatOffset = (offsetFloat) => {
  // Ensure we use the absolute value for calculations
  const absOffset = Math.abs(offsetFloat);

  // Extract hours and minutes
  const hours = Math.floor(absOffset);
  const minutes = Math.round((absOffset - hours) * 60);

  // Format hours and minutes
  const formattedHours =
    (offsetFloat < 0 ? '-' : offsetFloat > 0 ? '+' : '') +
    Math.abs(hours).toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  // Construct the formatted offset string
  return `${formattedHours}:${formattedMinutes}`;
};
export const getOffsetWithStandardTime = () => {
  // Get Standard offset of franchise time
  return convertTimeToMinutes(TIMEZONE_LIST?.find((item) => item.tzCode === getTimezone())?.utc);
};

export const checkDLSWrtDate = (date) => {
  // if date is undefined, it means we are picking current date and time
  return {
    isDLSWrtDate: getOffsetWithStandardTime() !== dayjsWithTimezone(date).utcOffset(),
    offsetDiff: getOffsetWithStandardTime() - dayjsWithTimezone(date).utcOffset(), // offsetDiff will be negative if DLS is enabled and current timezone is at negative offset and vice versa
  };
};

export const dayjsWithStandardOffset = (date, keepLocalTime) => {
  const standardOffset = getOffsetWithStandardTime();
  if (!dayjs(date).isValid()) {
    date = undefined;
  }

  const utcDate = dayjs(date)?.toISOString();
  return dayjs(utcDate).utcOffset(standardOffset, !!keepLocalTime);
};

const dayjsWithStandardOffsetForDisplay = (date) => {
  const standardOffset = getOffsetWithStandardTime();
  if (!dayjs(date).isValid()) {
    date = undefined;
  }

  const utcDate = dayjs(date)?.toISOString();
  return dayjs.utc(utcDate).add(standardOffset, 'minute');
};

const formatShiftScheduleTime = (date, is24Hours) => {
  const value = dayjsWithStandardOffsetForDisplay(date);
  const minutes = value.minute();
  const timeFormat = is24Hours ? 'HH:mm' : minutes === 0 ? 'ha' : 'h:mma';
  const formatted = value.format(timeFormat);

  return is24Hours ? formatted : formatted.replace('m', '');
};

export const formatShiftScheduleTimeRange = (startsAt, endsAt, is24Hours) => {
  return `${formatShiftScheduleTime(startsAt, is24Hours)} - ${formatShiftScheduleTime(
    endsAt,
    is24Hours,
  )}`;
};

/**
 * @description convert dayjs date and time objects into foreign time zone
 * @param {*} date
 * @param {*} time
 * @param {*} convertToUTC
 * @returns
 */
export const mergeDateTimeAndReturnInForeignTimeZone = (date, time) =>
  dayjsWithStandardOffset(
    `${date.format('YYYY-MM-DD')}T${time?.format('HH:mm:ss')}`,
    true,
  ).toISOString();

/**
 * This function will be used to populate time on time pickers as per Diabled DLS.
 *
 * Time Pickers, pick DLS time if current time is at DLS and pick standard time if current time is at Standard Time.
 * Lets say, current time is at DLS and timezone offset is -6 as per standard time and -5 as per DLS time.
 * In this case, if ISOString has time 12:00 then time picker will show it as 07:00 (according to DLS) but WRT standard time time picker should show 06:00.
 * For achieving 06:00 in timepicker, we need to apply, standard time offset difference with current time offset. In our case, difference will be -1 and ISOString time will become 11:00 and hence time picker will show 06:00
 * Lets say, if current time is at Standard time, then offset difference will be 0. Hence no need to change ISOString time
 */
export const adjustHourForTimePopulationWrtCurrentDate = (dateTimeToPopulate) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTimeToPopulate);
  return dayjs(dateTimeToPopulate).add(offsetDiffWRTCurrentDate, 'minute');
};

export const adjustHourForTimePayloadInIso = (dateTime) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTime);
  const dateTimeInIso = dayjs(dateTime)?.toISOString();
  return dayjs(dateTimeInIso).add(-offsetDiffWRTCurrentDate, 'minute').toISOString();
};

export const adjustHourForTimePayload = (dateTime) => {
  const { offsetDiff: offsetDiffWRTCurrentDate } = checkDLSWrtDate(dateTime);
  const dateTimeInIso = dayjs(dateTime)?.toISOString();
  return dayjs(dateTimeInIso).add(-offsetDiffWRTCurrentDate, 'minute');
};
export const getCurrentStandardTimeInIsoWrtTimezone = () => adjustHourForTimePayloadInIso();

export const getHoursAndMinutesWithCurrentDate = (timePart, datePart, isAssignment) => {
  // if datePart is undefined, then dayjs will pick current date.
  const datePartUtcOffset = dayjs(datePart).utcOffset();
  const updatedTimePart = dayjs(timePart).utcOffset(datePartUtcOffset);

  let calculatedDate = dayjs(datePart)
    .hour(dayjs(updatedTimePart).get('h'))
    .minute(dayjs(updatedTimePart).get('m'))
    .second(0)
    .millisecond(0);

  const { isDLSWrtDate: checkDlsWrtCurrentDate, offsetDiff } = checkDLSWrtDate();
  if (
    isAssignment &&
    checkDlsWrtCurrentDate &&
    dayjsWithStandardOffset(calculatedDate).date() !== dayjs(datePart).date()
  ) {
    // this condition will work, when DLS time is 12am and standard time is 11p as per negative offset, and when DLS time is 11p and standard time is 12a as per positive offset
    const dayValueToAdd = offsetDiff < 0 ? 1 : -1;
    calculatedDate = calculatedDate.add(dayValueToAdd, 'day');
  }

  return calculatedDate;
};

const isMidnightWRTStandardTime = (isoString) => {
  const date = dayjsWithStandardOffset(isoString);
  return date.hour() === 0 && date.minute() === 0;
};

// timePart should be in utc
// datePart should be in YYYY-MM-DD format (preferred way) or dayjs object
export const getEmbededDateAndTimeWRTStandardOffset = (timePart, datePart) => {
  // if datePart is undefined, then dayjs will pick current date.
  const formattedDate = dayjs(datePart).format('YYYY-MM-DD');

  const standardOffset = getOffsetWithStandardTime();
  const updatedTimePart = dayjsWithStandardOffset(timePart);

  // Combine formattedDate and updatedTimePart in the target time zone
  const calculatedDate = dayjs(formattedDate)
    .hour(updatedTimePart.hour())
    .minute(updatedTimePart.minute())
    .second(0)
    .millisecond(0);

  return calculatedDate.utcOffset(standardOffset, true);
};

// get start and end time with max 24 hour difference and append any desired date into start/end time
// "date" should be in YYYY-MM-DD format (preferred way) or dayjs object
export const getStartEndTimeWithDesiredDate = (
  date,
  startTime,
  endTime,
  fullDateWithOutIso = false,
  moveEndDateToNextDayOn12Am = false,
) => {
  if (!dayjs(date).isValid() || !dayjs(startTime).isValid() || !dayjs(endTime).isValid()) return {};
  let newStartTime = getEmbededDateAndTimeWRTStandardOffset(startTime, date);
  let newEndTime = getEmbededDateAndTimeWRTStandardOffset(endTime, date);

  const isNextDate = newEndTime.isBefore(newStartTime) || newEndTime.isSame(newStartTime); // if isNextDate is true, it means endTime is at next date
  const updatedNewEndTime = isNextDate
    ? dayjs(newEndTime).set('date', dayjs(newEndTime).get('date') + 1) // add 1 date to updated end date
    : dayjs(newEndTime);

  let isEndTimeOnNextDateWrtStandardTime =
    dayjsWithStandardOffset(newStartTime).date() !==
    dayjsWithStandardOffset(updatedNewEndTime).date();

  if (!moveEndDateToNextDayOn12Am) {
    isEndTimeOnNextDateWrtStandardTime =
      isEndTimeOnNextDateWrtStandardTime && !isMidnightWRTStandardTime(updatedNewEndTime);
  } // endTime should not be equal to 12 am

  return {
    startTime: fullDateWithOutIso ? newStartTime : newStartTime?.toISOString(),
    endTime: fullDateWithOutIso ? updatedNewEndTime : updatedNewEndTime?.toISOString(),
    isEndTimeOnNextDate: isNextDate,
    isEndTimeOnNextDateWrtStandardTime,
  };
};

export const getHoursDiff = (startsAt, endsAt) => {
  const { startTime, endTime } = getStartEndTimeWithDesiredDate(
    dayjs(),
    dayjs(startsAt),
    dayjs(endsAt),
  );
  return dayjs(endTime).diff(dayjs(startTime), 'h', true);
};

export const getHoursDiff24HourFormat = (startsAt, endsAt) => {
  const timeDiff = getHoursDiff(startsAt, endsAt);
  const totalHours = timeDiff < 0 ? 24 + timeDiff : timeDiff === 0 ? 24 : timeDiff;

  return totalHours;
};

const getAlphabetAscii = (input) => 65 + (input % 26); // input can only range from 0 - 26
export const getSplittedShiftName = (t, shiftNumber, input) => {
  let alphabetsAscii = getAlphabetAscii(input);
  let alphabetStr = String.fromCharCode(alphabetsAscii);

  const noOfAsciiIterations = Math.floor(input / 26);
  const prefixAlphabet = String.fromCharCode(getAlphabetAscii(noOfAsciiIterations));

  for (let i = 0; i < noOfAsciiIterations; i++) {
    alphabetStr = prefixAlphabet + alphabetStr;
  }

  return t('obx.schedules.assignDedicatedDuty.splitDuties.defaultShiftName', {
    index: `${shiftNumber}-${alphabetStr}`,
  });
};

export const selectDayNumber = (day) => {
  return day === -1 ? 6 : day === 7 ? 0 : day;
};

export const getDaysWrtTimezone = (startTime, shiftDays, isIso) => {
  // if isIso is true, then it means convert days WRT. ISO time otherwise convert days to local time

  const timezoneOffset = new Date().getTimezoneOffset();
  const isoDate = dayjs(startTime).add(timezoneOffset, 'minute');
  const localDate = dayjs(startTime);

  // if local date is at next date than ISO date
  if (localDate.isAfter(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, subtract 1 day from shift day. For Local time, add 1 day to shift day.
      const day = isIso ? shiftDay - 1 : shiftDay + 1;
      return selectDayNumber(day);
    });
  }

  // if local date is at previous date than ISO date
  if (localDate.isBefore(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, add 1 day to shift day. For Local time, subtract 1 day from shift day.
      const day = isIso ? shiftDay + 1 : shiftDay - 1;
      return selectDayNumber(day);
    });
  }

  return shiftDays;
};

export const getDaysWrtTimezoneAsPerStandardTime = (startTime, shiftDays, isIso) => {
  // if isIso is true, then it means convert days WRT. ISO time otherwise convert days to local time

  const timezoneOffset = getOffsetWithStandardTime();
  const isoDate = dayjsWithStandardOffset(startTime).add(-timezoneOffset, 'minute');
  const localDate = dayjsWithStandardOffset(startTime);

  // if local date is at next date than ISO date

  if (localDate.isAfter(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, subtract 1 day from shift day. For Local time, add 1 day to shift day.
      const day = isIso ? shiftDay - 1 : shiftDay + 1;
      return selectDayNumber(day);
    });
  }

  // if local date is at previous date than ISO date
  if (localDate.isBefore(isoDate, 'date')) {
    return shiftDays?.map((shiftDay) => {
      // for ISO time, add 1 day to shift day. For Local time, subtract 1 day from shift day.
      const day = isIso ? shiftDay + 1 : shiftDay - 1;
      return selectDayNumber(day);
    });
  }

  return shiftDays;
};

export const getDisabledDaysFromEnabledDays = (enabledDays, t) => {
  const allDays = daysOfWeekWithVal(t)?.map((val) => val.value);
  const disabledDays = allDays?.filter((day) => !enabledDays?.includes(day));
  return disabledDays;
};

export const getDaysBetweenDatesRangeWrtStandardDate = (startDate, endDate) => {
  if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
    return [];
  }
  // Wall calendar in franchise TZ (matches DatePicker timezone + daysOfWeekWithVal). Plain
  // dayjs().format('YYYY-MM-DD') uses the browser locale and can disagree with the picker.
  const tz = getTimezone();
  const startWall = dayjsWithTimezone(startDate).format('YYYY-MM-DD');
  const endWall = dayjsWithTimezone(endDate).format('YYYY-MM-DD');

  let cursor = dayjs.tz(startWall, 'YYYY-MM-DD', tz).startOf('day');
  const end = dayjs.tz(endWall, 'YYYY-MM-DD', tz).startOf('day');
  const days = [];

  for (; cursor.isBefore(end) || cursor.isSame(end, 'day'); cursor = cursor.add(1, 'day')) {
    if (days?.length === 7) {
      return days;
    }
    // .day(): 0=Sunday .. 6=Saturday — matches daysOfWeekWithVal `value`
    days.push(cursor.day());
  }

  return days;
};

export const getCurrentTimeWithDisabledDlsInIso = (date) => {
  // if date is undefined, dayjs will pick current time
  return dayjsWithStandardOffset(date, true).toISOString(); // If DLS is enabled WRT "date in params" and we are in negative offset timezone then ISOstring will be one hour less than original ISOstring and vice versa
};

export const appendDefaultStartAndEndTimeWithDates = (dates) => {
  if (!dates || dates.length < 2) return [];
  const startDate = dayjsWithStandardOffset()
    .month(dates[0].get('month'))
    .date(dates[0].get('date'))
    .year(dates[0].get('year'))
    .startOf('day')
    .toISOString();

  const endDate = dayjsWithStandardOffset()
    .month(dates[1].get('month'))
    .date(dates[1].get('date'))
    .year(dates[1].get('year'))
    .endOf('day')
    .toISOString();

  return [startDate, endDate];
};

export const setTimeInDate = (date, time) => {
  const currentDate = dayjs.utc(date);
  if (time) {
    const [hours, minutes] = time?.split(':')?.map(Number) ?? [];

    let updatedDate = currentDate
      .set('hour', hours)
      .set('minute', minutes)
      .set('second', 0) // Optional: reset seconds
      .set('millisecond', 0);

    return updatedDate;
  } else {
    return date;
  }
};

export const getLastShiftStartEndTimeOfJob = (startsAt, endsAt) => {
  const lastShiftStartTime = getUTCHoursAndMinutesWithUTCDate(startsAt, endsAt);

  const hoursDiff = getHoursDiff24HourFormat(startsAt, endsAt);
  const lastShiftEndTime = lastShiftStartTime.add(hoursDiff, 'hour').toISOString();

  return { lastShiftStartTime: lastShiftStartTime?.toISOString(), lastShiftEndTime };
};

/**
 * @description get the name of day from the date
 * @param {*} timestamp
 * @returns
 */
export const getDayName = (timestamp, t) => {
  // Create a Date object from the timestamp
  const date = new Date(timestamp);

  // Find the day name based on the getDay() result
  const dayName = daysOfWeekWithVal(t).find((day) => day.value === date.getDay());

  // Return the label property of the found day object
  return dayName ? dayName.label : '';
};

export const getTimeDiff = (start, end, unit = 'second') => {
  return dayjsWithStandardOffset(end).diff(dayjsWithStandardOffset(start), unit);
};

export const getTimeDiffWithFormat = (start, end) => {
  const diffInSeconds = dayjsWithStandardOffset(end).diff(dayjsWithStandardOffset(start), 'second');
  if (diffInSeconds < 60) return `${diffInSeconds > 0 ? diffInSeconds : 0}s`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ${diffInSeconds % 60}s`;

  const diffInHours = Math.floor(diffInSeconds / 3600);
  if (diffInHours < 24) return `${diffInHours}h ${Math.floor((diffInSeconds % 3600) / 60)}m`;

  const diffInDays = Math.floor(diffInSeconds / 86400);
  return `${diffInDays}d, ${Math.floor((diffInSeconds % 86400) / 3600)}h ${Math.floor((diffInSeconds % 3600) / 60)}m`;
};

// Getting the time difference in minutes from the start of the day
export const differenceInMinutes = (value) => {
  const startOfDay = dayjsWithStandardOffset().hour(0).minute(0).second(0).millisecond(0);
  const selectedTime = dayjsWithStandardOffset(value);
  const diffInMinutes = selectedTime.diff(startOfDay, 'minute');
  return diffInMinutes;
};

export const minutesToDayjsTime = (minutes) => {
  const startOfDay = dayjsWithStandardOffset().hour(0).minute(0).second(0).millisecond(0);
  return startOfDay.add(minutes, 'minute');
};

// Getting the hours format from minutes
export const minutesToHoursFormat = (minutes, shortFormat = false) => {
  if (minutes === 0) return shortFormat ? '' : '0 minutes';

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  const pluralize = (value, word) => (value === 1 ? word : word + 's');

  if (shortFormat) {
    if (hours === 0) return `${Math.round(minutes)}m`;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }

  if (hours === 0) {
    return `${Math.round(minutes)} ${pluralize(Math.round(minutes), 'minute')}`;
  }
  if (mins === 0) {
    return `${hours} ${pluralize(hours, 'hour')}`;
  }
  return `${hours} ${pluralize(hours, 'hour')} and ${mins} ${pluralize(mins, 'minute')}`;
};

export function formatArray(arr) {
  // Count occurrences using a Map
  const countMap = arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  // Format the result as a string
  return Object.entries(countMap)
    .map(([key, value]) => `${value} ${key}`)
    .join(', ');
}

// Checks if the first given time occurs earlier than the second, considering timezone offsets
export function isEarlierThan(timeA, timeB) {
  return dayjsWithStandardOffset(timeA).isBefore(dayjsWithStandardOffset(timeB));
}

/**
 * Checks if the time difference between two times exceeds 24 hours.
 * @param {string | Date | dayjs.Dayjs} timeA - The first time.
 * @param {string | Date | dayjs.Dayjs} timeB - The second time.
 * @returns {boolean} - True if the difference is more than 24 hours, otherwise false.
 */
export function isMoreThan24HoursApart(timeA, timeB = null) {
  if (!timeA || !timeB) return false;

  const diffInHours = Math.abs(dayjs(timeA).diff(dayjs(timeB), 'hour', true));
  return diffInHours > 24;
}

export const getDateRangeWrtFranchiseTimezone = (selectedDates) => {
  const startDateFormatted = dayjs(selectedDates?.[0]).format('YYYY-MM-DD');
  const endDateFormatted = dayjs(dayjs(selectedDates?.[1]).format('YYYY-MM-DD')).endOf('day');

  const startDate = selectedDates?.[0]
    ? getCurrentTimeWithDisabledDlsInIso(startDateFormatted)
    : null;
  const endDate = selectedDates?.[1] ? getCurrentTimeWithDisabledDlsInIso(endDateFormatted) : null;

  return { startDate, endDate };
};

export const isShiftScheduleFullyCancelled = (shift) => Boolean(shift?.isFullyCancelled);

export const isShiftAssignmentFrozen = (shift) =>
  Boolean(shift?.isCancelled || shift?.isFullyCancelled);

/**
 * The runsheet-list endpoint's rows, whatever shape it answered in.
 *
 * ## Why this is shared rather than local
 *
 * `fetchRunsheetList` does not answer with a bare array — it wraps the rows, and which key it
 * wraps them under has varied. **Three callers have each met this separately**, and the way they
 * met it is the argument for one copy:
 *
 * - `shiftDetail/hitDetail/VisitAssignment` hit it as a crash — an object where a list was
 *   expected took the whole drawer down with `.map is not a function` — and wrote a normaliser.
 * - `components/reassignHitDrawerContent` hit it *silently*: `setRunsheetList(data || [])` put an
 *   object in the field, so `length === 0` was `undefined === 0` and the empty state never drew
 *   while the filtered list stayed `[]`. That screen rendered a date range, a search box and a
 *   filter over permanently blank space, with no rows and no error.
 * - `components/hitReassignmentDrawer/hitReassignmentDrawerContent` still has that second bug
 *   verbatim, which is what settled this: a defect that arrives once as a crash and once as
 *   nothing at all is a defect no single caller can be trusted to notice.
 *
 * `MissedHitsDrawer`'s own `toMissedHitsArray` stays separate — a different endpoint with a
 * different set of keys, and merging them would make one function responsible for two contracts.
 */
export const toRunsheetArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const rows = payload.runsheets || payload.data || payload.rows || payload.results || payload.hits;
  return Array.isArray(rows) ? rows : [];
};

/**
 * How many runsheets the window actually holds, when the response says.
 *
 * The endpoint returns a `pagination` block — `page`, `perPage`, `totalCount` — and **no caller
 * in the app reads it**, nor does any caller send a page. So a franchise with more routes than
 * one page shows the first page and the rest are simply unreachable, with nothing on screen
 * saying a boundary exists.
 *
 * **This does not fix that, deliberately.** Sending `page`/`perPage`/`search` would be inventing
 * a contract: no caller uses those params, so there is nothing to confirm the backend honours
 * them, and a search box that looks authoritative while quietly missing page two is worse than
 * one that is visibly limited. What this does is let the caller *state* the limit from data the
 * response already carries. Returns null when the response says nothing.
 */
export const runsheetTotalCount = (payload) => {
  const total = payload?.pagination?.totalCount;
  return Number.isFinite(Number(total)) ? Number(total) : null;
};
